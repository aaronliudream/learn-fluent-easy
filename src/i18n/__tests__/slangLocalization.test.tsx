import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { render, screen, act } from "@testing-library/react";
import React from "react";
import { I18nProvider, useI18n } from "@/i18n/I18nProvider";
import { T } from "@/i18n/T";
import { LANGUAGES } from "@/i18n/languages";

// ---- Mock the supabase client used by the I18nProvider for translate calls.
// The mock echoes every input prefixed with the target language, so we can
// assert that strings actually flowed through the translation pipeline.
const invokeMock = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: { invoke: (...args: unknown[]) => invokeMock(...args) },
    from: () => ({
      select: () => ({
        order: () => ({
          order: () => ({ limit: async () => ({ data: [], error: null }) }),
        }),
      }),
    }),
  },
}));

function setLang(code: string) {
  localStorage.setItem("fluentpath.lang", code);
  localStorage.setItem("fluentpath.langPicked", "1");
  // wipe any cached dyn translations from previous test
  Object.keys(localStorage)
    .filter((k) => k.startsWith("fluentpath.i18n."))
    .forEach((k) => localStorage.removeItem(k));
}

beforeEach(() => {
  invokeMock.mockReset();
  invokeMock.mockImplementation(async (_fn: string, opts: any) => {
    const items = (opts?.body?.items ?? []) as { key: string; text: string }[];
    const target = opts?.body?.targetLanguage ?? "Lang";
    const translations: Record<string, string> = {};
    for (const it of items) translations[it.key] = `[${target}] ${it.text}`;
    return { data: { translations }, error: null };
  });
});

afterEach(() => {
  localStorage.clear();
});

// ─────────────────────────────────────────────────────────────
// 1) Source-level guards: every localized idiom field must be
//    wrapped in <T> so the translator catches it for every lang.
// ─────────────────────────────────────────────────────────────
describe("Slang page i18n source guards", () => {
  const src = readFileSync(
    path.resolve(__dirname, "../../pages/Slang.tsx"),
    "utf8",
  );

  const mustHave: Array<{ name: string; pattern: RegExp }> = [
    { name: "browse meaning_cn wrapped",      pattern: /<T>\{it\.meaning_cn\}<\/T>/ },
    { name: "browse example_cn wrapped",      pattern: /<T>\{it\.example_cn\}<\/T>/ },
    { name: "quiz cn2en prompt wrapped",      pattern: /<T>\{q\.prompt\}<\/T>/ },
    { name: "fill/cn2en context wrapped",     pattern: /<T>\{q\.context\}<\/T>/ },
    { name: "en2cn options translated",       pattern: /q\.kind === "en2cn" \? <T>\{opt\}<\/T> : opt/ },
    { name: "reveal idiom meaning_cn wrapped",pattern: /<T>\{q\.idiom\.meaning_cn\}<\/T>/ },
    { name: "reveal idiom example_cn wrapped",pattern: /<T>\{q\.idiom\.example_cn\}<\/T>/ },
    { name: "result list meaning_cn wrapped", pattern: /<T>\{q\.idiom\.meaning_cn\}<\/T>/ },
  ];

  for (const { name, pattern } of mustHave) {
    it(`Slang.tsx: ${name}`, () => {
      expect(pattern.test(src)).toBe(true);
    });
  }

  it("does not render raw {it.meaning_cn} outside a <T>", () => {
    // Find all occurrences of {it.meaning_cn}; every one must sit
    // inside a <T>...</T> wrapper.
    const re = /\{it\.meaning_cn\}/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) {
      const around = src.slice(Math.max(0, m.index - 8), m.index + m[0].length + 8);
      expect(around).toMatch(/<T>\{it\.meaning_cn\}<\/T>/);
    }
  });
});

// ─────────────────────────────────────────────────────────────
// 2) Runtime check: <T> renders the source text for zh/en (no
//    network), and renders translated text for any other lang.
// ─────────────────────────────────────────────────────────────
describe("<T> runtime translation across languages", () => {
  function Probe({ source }: { source: string }) {
    return (
      <I18nProvider>
        <div data-testid="probe"><T>{source}</T></div>
      </I18nProvider>
    );
  }

  it("returns source text untouched for English", async () => {
    setLang("en");
    render(<Probe source="正确率" />);
    expect(screen.getByTestId("probe")).toHaveTextContent("正确率");
    expect(invokeMock).not.toHaveBeenCalled();
  });

  it("returns source text untouched for Chinese", async () => {
    setLang("zh");
    render(<Probe source="开始测试" />);
    expect(screen.getByTestId("probe")).toHaveTextContent("开始测试");
    expect(invokeMock).not.toHaveBeenCalled();
  });

  // Sample 6 representative non-en/zh languages to keep the suite fast
  // while still exercising the dynamic-translation path.
  const sampled = LANGUAGES.filter(
    (l) => !["en", "zh"].includes(l.code),
  ).filter((l) => ["it", "de", "fr", "ko", "ja", "ar"].includes(l.code));

  for (const lang of sampled) {
    it(`translates idiom meaning into ${lang.englishName}`, async () => {
      setLang(lang.code);
      const source = "他被现场抓个正着";
      await act(async () => {
        render(<Probe source={source} />);
      });
      // Provider debounces dyn queue 250ms then resolves; flush.
      await act(async () => {
        await new Promise((r) => setTimeout(r, 320));
      });
      expect(invokeMock).toHaveBeenCalled();
      // The provider may issue two batches: one for the static UI catalog
      // and another for dynamic content. Find the call that carried our
      // source string.
      const dynCall = invokeMock.mock.calls.find((c) =>
        (c[1].body.items as any[]).some((i) => i.text === source),
      );
      expect(dynCall).toBeTruthy();
      expect(dynCall![1].body.targetLanguage).toBe(lang.englishName);
      expect(screen.getByTestId("probe")).toHaveTextContent(
        `[${lang.englishName}] ${source}`,
      );
    });
  }
});

// ─────────────────────────────────────────────────────────────
// 3) Quiz option pathway: en2cn options are Chinese meanings and
//    must be translated for non-zh/en users. cn2en options are
//    English phrases and must NOT be translated.
// ─────────────────────────────────────────────────────────────
describe("Quiz options localization pathway", () => {
  function OptionRow({ kind, opt }: { kind: "en2cn" | "cn2en"; opt: string }) {
    return (
      <I18nProvider>
        <span data-testid="opt">
          {kind === "en2cn" ? <T>{opt}</T> : opt}
        </span>
      </I18nProvider>
    );
  }

  it("en2cn option (Chinese meaning) gets translated for German users", async () => {
    setLang("de");
    await act(async () => {
      render(<OptionRow kind="en2cn" opt="被当场抓获" />);
    });
    await act(async () => { await new Promise((r) => setTimeout(r, 320)); });
    expect(screen.getByTestId("opt").textContent).toBe("[German] 被当场抓获");
  });

  it("cn2en option (English phrase) is NOT translated for German users", async () => {
    setLang("de");
    await act(async () => {
      render(<OptionRow kind="cn2en" opt="caught in 4K" />);
    });
    await act(async () => { await new Promise((r) => setTimeout(r, 320)); });
    expect(screen.getByTestId("opt").textContent).toBe("caught in 4K");
    // No dynamic-text call should have been issued for this English option.
    const dynCalls = invokeMock.mock.calls.filter((c) =>
      (c[1].body.items as any[]).some((i) => i.text === "caught in 4K"),
    );
    expect(dynCalls.length).toBe(0);
  });
});