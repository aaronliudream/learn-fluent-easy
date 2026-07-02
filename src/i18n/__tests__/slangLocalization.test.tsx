import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act, cleanup } from "@testing-library/react";
const screen = {
  getByTestId: (id: string) => document.querySelector(`[data-testid="${id}"]`) as HTMLElement,
};
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
    // I18nProvider syncs profile language via auth; keep it logged-out so it no-ops.
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
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
    for (const it of items) {
      translations[it.key] = target === "Korean"
        ? "[Korean] 번역"
        : target === "Japanese"
          ? "[Japanese] 翻訳"
          : `[${target}] translated`;
    }
    return { data: { translations }, error: null };
  });
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

// (成人 Slang 页已归档至 _archived/adult/ —— 原「Slang page i18n source guards」
//  源码守卫用例随之移除;下方通用 <T> 翻译管线用例保留。)

// ─────────────────────────────────────────────────────────────
// 2) Runtime check: <T> translates native helper text for every
//    non-Chinese language, including English.
// ─────────────────────────────────────────────────────────────
describe("<T> runtime translation across languages", () => {
  function Probe({ source }: { source: string }) {
    return (
      <I18nProvider>
        <div data-testid="probe"><T>{source}</T></div>
      </I18nProvider>
    );
  }

  it("translates Chinese helper text for English", async () => {
    setLang("en");
    const source = "正确率";
    const { rerender } = render(<Probe source={source} />);
    await act(async () => { await new Promise((r) => setTimeout(r, 320)); });
    rerender(<Probe source={source} />);
    expect(screen.getByTestId("probe")).toHaveTextContent("[English] translated");
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
      const { rerender } = render(<Probe source={source} />);
      // Provider debounces dyn queue 250ms then resolves; flush.
      await act(async () => {
        await new Promise((r) => setTimeout(r, 320));
      });
      // Force a consumer re-render so it picks up the now-cached translation.
      rerender(<Probe source={source} />);
      expect(invokeMock).toHaveBeenCalled();
      // The provider may issue two batches: one for the static UI catalog
      // and another for dynamic content. Find the call that carried our
      // source string.
      const dynCall = invokeMock.mock.calls.find((c) =>
        (c[1].body.items as any[]).some((i) => i.text === source),
      );
      expect(dynCall).toBeTruthy();
      expect(dynCall![1].body.targetLanguage).toBe(lang.englishName);
      expect(screen.getByTestId("probe")).not.toHaveTextContent(source);
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
    const { rerender } = render(<OptionRow kind="en2cn" opt="被当场抓获" />);
    await act(async () => { await new Promise((r) => setTimeout(r, 320)); });
    rerender(<OptionRow kind="en2cn" opt="被当场抓获" />);
    expect(screen.getByTestId("opt").textContent).toBe("[German] translated");
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