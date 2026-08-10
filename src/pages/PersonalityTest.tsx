import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, ClipboardCheck, Copy, Info, RefreshCw, ShieldAlert } from "lucide-react";
import {
  LIKERT_LABELS,
  SCALE_POLES,
  orderedItems,
  type PersonalityItem,
  type ScaleId,
} from "@/lib/personality/items";
import { UI, pick, type Lang } from "@/lib/personality/copy";
import {
  TOTAL_ITEMS,
  clarityBand,
  scoreAll,
  scoreBand,
  type Answers,
  type PersonalityResult,
} from "@/lib/personality/scoring";
import { profileOf } from "@/lib/personality/profiles";

/**
 * /personality —— 性格类型测评(60 题 · 中英双语 · 纯前端)。
 *
 * ★ 三件事在别处,改之前先看 ★
 *   题库与计分口径  src/lib/personality/items.ts + scoring.ts(方法学注释在文件头)
 *   16 型文案       src/lib/personality/profiles.ts
 *   界面文案        src/lib/personality/copy.ts
 *
 * ★ 本页不接全站 i18n ★ 页面语言由 ?lang= 与页内切换按钮控制,与全站语言解耦
 *   —— 首页给的就是「中文测试 / English」两个入口。根节点带 data-i18n-skip,
 *   免得 dev 的语言泄漏探测器把这一页的双语内容当成漏翻译刷屏。
 *
 * ★ 不落库 ★ 作答与结果只写 localStorage。性格数据比学习数据敏感得多,
 *   没有明确的产品需求之前不上传、不与账号关联(介绍页也是这么向用户承诺的)。
 */

const ITEMS: PersonalityItem[] = orderedItems();
const PER_PAGE = 5;
const TOTAL_PAGES = Math.ceil(ITEMS.length / PER_PAGE);

const LS_ANSWERS = "bigmoon.personality.v1.answers";
const LS_RESULT = "bigmoon.personality.v1.result";
const LS_STARTED = "bigmoon.personality.v1.startedAt";

type Phase = "intro" | "quiz" | "result";

function readAnswers(): Answers {
  try {
    const raw = localStorage.getItem(LS_ANSWERS);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const out: Answers = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === "number" && v >= 1 && v <= 5) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function readSavedResult(): PersonalityResult | null {
  try {
    const raw = localStorage.getItem(LS_RESULT);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersonalityResult;
    return parsed?.code && parsed?.scales ? parsed : null;
  } catch {
    return null;
  }
}

/** 结果纯文本(复制/分享用)。 */
function resultText(result: PersonalityResult, lang: Lang): string {
  const p = profileOf(result.type);
  const lines: string[] = [];
  lines.push(lang === "zh" ? "Big Moon English · 性格测评结果" : "Big Moon English · Personality result");
  lines.push(`${result.code} — ${pick(p.nickname, lang)}`);
  lines.push("");
  for (const scale of ["EI", "SN", "TF", "JP", "AT"] as ScaleId[]) {
    const s = result.scales[scale];
    const poles = SCALE_POLES[scale];
    const label = s.letter === poles.a ? poles.aLabel : poles.bLabel;
    lines.push(`${s.letter}  ${pick(label, lang)} — ${Math.round(s.clarity)}% ${pick(UI.clarityWord, lang)}`);
  }
  lines.push("");
  lines.push(lang === "zh" ? "大五人格：" : "Big Five:");
  for (const b of result.bigFive) {
    lines.push(`  ${pick(b.label, lang)}: ${Math.round(b.score)}/100 (${pick(scoreBand(b.score), lang)})`);
  }
  return lines.join("\n");
}

/* ─────────────────────────── 小组件 ─────────────────────────── */

function SectionCard({
  title,
  children,
  tone = "light",
}: {
  title?: string;
  children: ReactNode;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <section
      className={
        "rounded-2xl p-5 shadow-[0_2px_14px_rgba(15,23,42,0.06)] " +
        (dark ? "bg-[#0a1628] text-white" : "bg-white text-slate-900")
      }
    >
      {title && (
        <h2
          className={
            "mb-3 text-[11px] font-bold uppercase tracking-[0.16em] " +
            (dark ? "text-[#e5b567]" : "text-slate-500")
          }
        >
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

/** 维度条:从中点向所选一极延伸,长度 = 清晰度的一半(即 |POMP-50|)。 */
function DimensionBar({
  scale,
  pomp,
  letter,
  clarity,
  lang,
}: {
  scale: ScaleId;
  pomp: number;
  letter: string;
  clarity: number;
  lang: Lang;
}) {
  const poles = SCALE_POLES[scale];
  const towardA = letter === poles.a;
  const half = Math.abs(pomp - 50);
  const band = clarityBand(clarity);
  return (
    // data-testid / data-clarity 是给 scripts/qa/personality-e2e.mjs 读的锚点。
    // 别删:那道门要靠它核对「答成某种人 → 页面真的显示那个字母和清晰度」。
    <div className="py-3" data-testid={`pt-dim-${scale}`} data-letter={letter} data-clarity={Math.round(clarity)}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {pick(poles.title, lang)}
        </span>
        <span className="text-[11px] text-slate-500">
          {Math.round(clarity)}% · {pick(band, lang)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={
            "w-[86px] shrink-0 text-right text-[12px] leading-tight sm:w-[110px] " +
            (towardA ? "font-bold text-[#0a1628]" : "text-slate-400")
          }
        >
          {pick(poles.aLabel, lang)}
        </span>
        <div className="relative h-2.5 flex-1 rounded-full bg-slate-200">
          <span className="absolute left-1/2 top-1/2 h-3.5 w-px -translate-x-1/2 -translate-y-1/2 bg-slate-400" />
          <span
            className="absolute top-0 h-2.5 rounded-full bg-[#c9922e]"
            style={
              towardA
                ? { right: "50%", width: `${half}%` }
                : { left: "50%", width: `${half}%` }
            }
          />
        </div>
        <span
          className={
            "w-[86px] shrink-0 text-[12px] leading-tight sm:w-[110px] " +
            (towardA ? "text-slate-400" : "font-bold text-[#0a1628]")
          }
        >
          {pick(poles.bLabel, lang)}
        </span>
      </div>
    </div>
  );
}

function LikertRow({
  item,
  index,
  value,
  onPick,
  lang,
}: {
  item: PersonalityItem;
  index: number;
  value: number | undefined;
  onPick: (v: number) => void;
  lang: Lang;
}) {
  const statement = lang === "zh" ? item.zh : item.en;
  // 圆点尺寸从两端向中间收窄 —— 视觉上传达「强 → 弱 → 中立 → 弱 → 强」。
  //
  // ⚠️ 尺寸是量过的,别随手改小:两端文字**不能**和圆点挤在同一行 ——
  //    375px 上那样只剩 303px 给五个圆点,中间那个会被压到 28px,低于 44px 的触控下限。
  //    改成「文字单独一行 + 圆点整行 justify-between」之后,最小圆点 32px、最大 44px,
  //    而且外侧圆点正好对齐两端文字。(实测见 scripts/qa 里的量尺记录)
  const sizes = ["size-11", "size-[38px]", "size-8", "size-[38px]", "size-11"];
  return (
    <li className="border-t border-slate-100 py-4 first:border-t-0 first:pt-0">
      <p className="text-[15px] font-medium leading-relaxed text-slate-900">
        <span className="mr-1.5 text-slate-400">{index}.</span>
        {statement}
      </p>
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
        <span>{pick(UI.disagree, lang)}</span>
        <span>{pick(UI.agree, lang)}</span>
      </div>
      <div
        role="radiogroup"
        aria-label={statement}
        className="mt-1.5 flex items-center justify-between"
      >
        <div className="flex flex-1 items-center justify-between">
          {LIKERT_LABELS.map((opt, i) => {
            const selected = value === opt.value;
            // 左半边冷灰、右半边品牌金,中间中性 —— 不用红/绿,「不符合」不是负面。
            const hue = i < 2 ? "#64748b" : i > 2 ? "#c9922e" : "#94a3b8";
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={lang === "zh" ? opt.zh : opt.en}
                title={lang === "zh" ? opt.zh : opt.en}
                onClick={() => onPick(opt.value)}
                className={
                  `${sizes[i]} grid shrink-0 place-items-center rounded-full border-2 transition ` +
                  (selected ? "text-white" : "bg-white hover:scale-105")
                }
                style={{
                  borderColor: hue,
                  backgroundColor: selected ? hue : undefined,
                }}
              >
                {selected && <Check className="size-4" strokeWidth={3} aria-hidden />}
              </button>
            );
          })}
        </div>
      </div>
    </li>
  );
}

/* ─────────────────────────── 页面 ─────────────────────────── */

export default function PersonalityTest() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialLang: Lang = searchParams.get("lang") === "en" ? "en" : "zh";
  const [lang, setLangState] = useState<Lang>(initialLang);

  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<Answers>(() => readAnswers());
  const [pageIdx, setPageIdx] = useState(0);
  const [result, setResult] = useState<PersonalityResult | null>(null);
  const [savedResult, setSavedResult] = useState<PersonalityResult | null>(() => readSavedResult());
  const [copied, setCopied] = useState(false);
  const [showUnanswered, setShowUnanswered] = useState(false);
  const topRef = useRef<HTMLDivElement | null>(null);

  const answeredCount = useMemo(
    () => ITEMS.filter((i) => typeof answers[i.id] === "number").length,
    [answers],
  );

  useEffect(() => {
    document.title = `${pick(UI.pageTitle, lang)} · Big Moon English`;
  }, [lang]);

  const setLang = (next: Lang) => {
    setLangState(next);
    const sp = new URLSearchParams(searchParams);
    sp.set("lang", next);
    setSearchParams(sp, { replace: true });
  };

  const persist = useCallback((next: Answers) => {
    try {
      localStorage.setItem(LS_ANSWERS, JSON.stringify(next));
    } catch {
      /* 隐私模式下写不进去也不影响本次作答 */
    }
  }, []);

  const answer = useCallback(
    (id: string, value: number) => {
      setAnswers((prev) => {
        const next = { ...prev, [id]: value };
        persist(next);
        return next;
      });
      setShowUnanswered(false);
    },
    [persist],
  );

  const beginQuiz = (fresh: boolean) => {
    if (fresh) {
      setAnswers({});
      persist({});
      try {
        localStorage.setItem(LS_STARTED, String(Date.now()));
      } catch { /* ignore */ }
      setPageIdx(0);
    } else {
      // 续答:跳到第一页还有未答题的地方
      const firstGap = ITEMS.findIndex((i) => typeof answers[i.id] !== "number");
      setPageIdx(firstGap < 0 ? 0 : Math.floor(firstGap / PER_PAGE));
      try {
        if (!localStorage.getItem(LS_STARTED)) localStorage.setItem(LS_STARTED, String(Date.now()));
      } catch { /* ignore */ }
    }
    setResult(null);
    setPhase("quiz");
    window.scrollTo({ top: 0 });
  };

  const pageItems = ITEMS.slice(pageIdx * PER_PAGE, pageIdx * PER_PAGE + PER_PAGE);
  const pageComplete = pageItems.every((i) => typeof answers[i.id] === "number");
  const isLastPage = pageIdx === TOTAL_PAGES - 1;

  const finish = useCallback(() => {
    let elapsed: number | null = null;
    try {
      const started = Number(localStorage.getItem(LS_STARTED));
      if (Number.isFinite(started) && started > 0) elapsed = Date.now() - started;
    } catch { /* ignore */ }
    const r = scoreAll(answers, elapsed);
    setResult(r);
    setSavedResult(r);
    try {
      localStorage.setItem(LS_RESULT, JSON.stringify(r));
    } catch { /* ignore */ }
    setPhase("result");
    window.scrollTo({ top: 0 });
  }, [answers]);

  const goNext = useCallback(() => {
    if (!pageComplete) {
      setShowUnanswered(true);
      return;
    }
    if (isLastPage) {
      finish();
      return;
    }
    setPageIdx((p) => p + 1);
    window.scrollTo({ top: 0 });
  }, [pageComplete, isLastPage, finish]);

  // 键盘:1-5 给本页第一道未答题打分,Enter 翻页。
  // 全站 QuizKeyboardShortcuts 只认「文本以 1-4/A-D 开头」的按钮,本页的圆点按钮
  // 没有文本(靠 aria-label),不会被它误抓,两套快捷键不打架。
  useEffect(() => {
    if (phase !== "quiz") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "Enter") {
        e.preventDefault();
        goNext();
        return;
      }
      const n = Number(e.key);
      if (!Number.isFinite(n) || n < 1 || n > 5) return;
      const target = pageItems.find((i) => typeof answers[i.id] !== "number");
      if (!target) return;
      e.preventDefault();
      answer(target.id, n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, pageItems, answers, answer, goNext]);

  const copyResult = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(resultText(result, lang));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* 浏览器不给剪贴板权限就算了,不弹错误打断用户 */
    }
  };

  /* ─────────── 顶栏(三个阶段共用) ─────────── */
  const header = (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0a1628] text-white">
      <div className="mx-auto flex max-w-[720px] items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-1.5 text-[13px] font-semibold text-white/80 hover:text-white">
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          <span className="hidden sm:inline">{pick(UI.back, lang)}</span>
          <span className="sm:hidden">Big Moon</span>
        </Link>
        <div className="flex items-center gap-1 rounded-full bg-white/10 p-0.5">
          {(["zh", "en"] as Lang[]).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLang(code)}
              aria-pressed={lang === code}
              className={
                "rounded-full px-3 py-1 text-[12px] font-semibold transition " +
                (lang === code ? "bg-[#e5b567] text-[#0a1628]" : "text-white/75 hover:text-white")
              }
            >
              {code === "zh" ? "中文" : "English"}
            </button>
          ))}
        </div>
      </div>
    </header>
  );

  /* ─────────── 介绍页 ─────────── */
  const introView = (
    <div className="space-y-4">
      <SectionCard tone="dark">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#e5b567]">
          {pick(UI.brandLine, lang)}
        </p>
        <h1 className="mt-2 text-2xl font-extrabold leading-tight md:text-3xl">
          {pick(UI.heroTitle, lang)}
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-white/80">{pick(UI.heroSub, lang)}</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            data-testid="pt-start"
            // 只有「答了一半」才续答;从没答过、或上一轮已答满,都从头开始。
            onClick={() => beginQuiz(answeredCount === 0 || answeredCount === TOTAL_ITEMS)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#e5b567] px-5 py-3 text-[15px] font-bold text-[#0a1628] transition hover:brightness-105"
          >
            {answeredCount > 0 && answeredCount < TOTAL_ITEMS
              ? `${pick(UI.resume, lang)} (${answeredCount}/${TOTAL_ITEMS})`
              : pick(UI.start, lang)}
            <ArrowRight className="size-4 shrink-0" aria-hidden />
          </button>
          {savedResult && (
            <button
              type="button"
              onClick={() => {
                setResult(savedResult);
                setPhase("result");
                window.scrollTo({ top: 0 });
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-5 py-3 text-[14px] font-semibold text-white/90 transition hover:bg-white/10"
            >
              {pick(UI.viewLast, lang)} · {savedResult.code}
            </button>
          )}
        </div>
        {answeredCount > 0 && answeredCount < TOTAL_ITEMS && (
          <button
            type="button"
            onClick={() => beginQuiz(true)}
            className="mt-2 text-[12px] text-white/60 underline underline-offset-2 hover:text-white"
          >
            {pick(UI.restart, lang)}
          </button>
        )}
      </SectionCard>

      <SectionCard title={pick(UI.whatTitle, lang)}>
        <ul className="space-y-2.5 text-[14px] leading-relaxed text-slate-700">
          {[UI.what1, UI.what2, UI.what3].map((line, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-[#c9922e]" aria-hidden />
              <span>{pick(line, lang)}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title={pick(UI.howTitle, lang)}>
        <ul className="space-y-2.5 text-[14px] leading-relaxed text-slate-700">
          {[UI.how1, UI.how2, UI.how3].map((line, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-slate-300" aria-hidden />
              <span>{pick(line, lang)}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      <details className="group rounded-2xl bg-white p-5 shadow-[0_2px_14px_rgba(15,23,42,0.06)]">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-[13px] font-bold text-slate-700">
          <Info className="size-4 shrink-0 text-slate-400" aria-hidden />
          {pick(UI.methodTitle, lang)}
        </summary>
        <ul className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-slate-600">
          {[UI.method1, UI.method2, UI.method3, UI.method4, UI.method5].map((line, i) => (
            <li key={i}>{pick(line, lang)}</li>
          ))}
        </ul>
      </details>
    </div>
  );

  /* ─────────── 答题页 ─────────── */
  const quizView = (
    <div className="space-y-4">
      <div
        data-testid="pt-progress"
        data-answered={answeredCount}
        className="rounded-2xl bg-white p-4 shadow-[0_2px_14px_rgba(15,23,42,0.06)]"
      >
        <div className="mb-2 flex items-baseline justify-between text-[12px] font-semibold text-slate-500">
          <span>
            {pick(UI.progress, lang)} {answeredCount} / {TOTAL_ITEMS}
          </span>
          <span>
            {pageIdx + 1} {pick(UI.of, lang)} {TOTAL_PAGES}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-[#c9922e] transition-all duration-300"
            style={{ width: `${(answeredCount / TOTAL_ITEMS) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-[0_2px_14px_rgba(15,23,42,0.06)]">
        <ul>
          {pageItems.map((item, i) => (
            <LikertRow
              key={item.id}
              item={item}
              index={pageIdx * PER_PAGE + i + 1}
              value={answers[item.id]}
              onPick={(v) => answer(item.id, v)}
              lang={lang}
            />
          ))}
        </ul>
      </div>

      {showUnanswered && !pageComplete && (
        <p className="rounded-xl bg-amber-50 px-4 py-2.5 text-[13px] font-semibold text-amber-800">
          {pick(UI.unanswered, lang)}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (pageIdx === 0) {
              setPhase("intro");
            } else {
              setPageIdx((p) => p - 1);
            }
            window.scrollTo({ top: 0 });
          }}
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-[14px] font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          {pick(UI.prev, lang)}
        </button>
        <button
          type="button"
          data-testid="pt-next"
          onClick={goNext}
          aria-disabled={!pageComplete}
          className={
            "flex-1 rounded-xl px-5 py-3 text-[15px] font-bold transition " +
            (pageComplete
              ? "bg-[#0a1628] text-white hover:brightness-125"
              : "cursor-not-allowed bg-slate-200 text-slate-400")
          }
        >
          {isLastPage ? pick(UI.seeResult, lang) : pick(UI.next, lang)}
        </button>
      </div>
      <p className="pb-2 text-center text-[12px] text-slate-400">{pick(UI.quitConfirm, lang)}</p>
    </div>
  );

  /* ─────────── 结果页 ─────────── */
  const resultView = (() => {
    if (!result) return null;
    const profile = profileOf(result.type);
    const at = result.scales.AT;
    const atPoles = SCALE_POLES.AT;
    const qualityNotes: string[] = [];
    if (result.quality.straightLining) qualityNotes.push(pick(UI.qStraight, lang));
    if (result.quality.inconsistent) qualityNotes.push(pick(UI.qInconsistent, lang));
    if (result.quality.tooFast) qualityNotes.push(pick(UI.qTooFast, lang));

    return (
      <div className="space-y-4">
        <SectionCard tone="dark">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#e5b567]">
            {pick(UI.yourType, lang)}
          </p>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span
              data-testid="pt-code"
              className="text-4xl font-black tracking-tight text-[#e5b567] md:text-5xl"
            >
              {result.code}
            </span>
            <span className="text-lg font-bold">{pick(profile.nickname, lang)}</span>
          </div>
          <p className="mt-1 font-serif text-[15px] italic text-white/70">
            “{pick(profile.tagline, lang)}”
          </p>
          <p className="mt-4 text-[14px] leading-relaxed text-white/85">
            {pick(profile.summary, lang)}
          </p>
        </SectionCard>

        <SectionCard title={pick(UI.dimensions, lang)}>
          <div className="divide-y divide-slate-100">
            {(["EI", "SN", "TF", "JP"] as ScaleId[]).map((scale) => {
              const s = result.scales[scale];
              return (
                <DimensionBar
                  key={scale}
                  scale={scale}
                  pomp={s.pomp}
                  letter={s.letter}
                  clarity={s.clarity}
                  lang={lang}
                />
              );
            })}
          </div>
          {(["EI", "SN", "TF", "JP"] as ScaleId[]).some((s) => result.scales[s].borderline) && (
            <p className="mt-3 rounded-xl bg-amber-50 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-amber-800">
              {lang === "zh"
                ? `清晰度低于 20% 的字母（${(["EI", "SN", "TF", "JP"] as ScaleId[])
                    .filter((s) => result.scales[s].borderline)
                    .map((s) => result.scales[s].letter)
                    .join(" / ")}）几乎在正中间 —— 换一天再测很可能变成另一个字母，别把它当成确定结论。`
                : `Letters below 20% clarity (${(["EI", "SN", "TF", "JP"] as ScaleId[])
                    .filter((s) => result.scales[s].borderline)
                    .map((s) => result.scales[s].letter)
                    .join(" / ")}) sit almost exactly in the middle — a retest could flip them. Don't read them as settled.`}
            </p>
          )}
        </SectionCard>

        <SectionCard title={pick(UI.emotionScale, lang)}>
          <DimensionBar scale="AT" pomp={at.pomp} letter={at.letter} clarity={at.clarity} lang={lang} />
          <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
            {at.letter === atPoles.a
              ? lang === "zh"
                ? "你偏向「果决」一端：情绪相对平稳，压力下不容易失衡，对自己的判断有把握。代价是有时会低估风险，也可能收不到别人发出的求助信号。"
                : "You lean assertive: steady emotions, resilient under pressure, confident in your own read. The trade-off is occasionally underrating risk — and missing quieter signals that someone needs help."
              : lang === "zh"
                ? "你偏向「起伏」一端：对压力、评价和潜在问题都更敏感。这让你更谨慎、准备更充分、也更在意把事情做好；代价是内耗多，容易被小事牵动很久。"
                : "You lean turbulent: more sensitive to stress, judgment and things that might go wrong. That makes you careful, well-prepared and driven to do things properly — at the cost of more inner churn over small things."}
          </p>
        </SectionCard>

        <SectionCard title={pick(UI.bigFiveTitle, lang)}>
          <div className="space-y-3">
            {result.bigFive.map((b) => (
              <div key={b.key}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[13px] font-semibold text-slate-800">{pick(b.label, lang)}</span>
                  <span className="text-[12px] font-semibold text-slate-500">
                    {Math.round(b.score)} · {pick(scoreBand(b.score), lang)}
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-[#0a1628]" style={{ width: `${b.score}%` }} />
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                  {b.score >= 50 ? pick(b.high, lang) : pick(b.low, lang)}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-slate-100 pt-3 text-[12px] leading-relaxed text-slate-500">
            {pick(UI.bigFiveNote, lang)}
          </p>
        </SectionCard>

        <SectionCard title={pick(UI.strengthsTitle, lang)}>
          <ul className="space-y-2 text-[14px] leading-relaxed text-slate-700">
            {profile.strengths.map((s, i) => (
              <li key={i} className="flex gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-[#c9922e]" strokeWidth={3} aria-hidden />
                <span>{pick(s, lang)}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title={pick(UI.watchTitle, lang)}>
          <ul className="space-y-2 text-[14px] leading-relaxed text-slate-700">
            {profile.watchOuts.map((s, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden />
                <span>{pick(s, lang)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-2">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {pick(UI.stressTitle, lang)}
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{pick(profile.stress, lang)}</p>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {pick(UI.teamTitle, lang)}
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{pick(profile.teamwork, lang)}</p>
            </div>
          </div>
        </SectionCard>

        <section className="rounded-2xl border-2 border-[#e5b567] bg-[#fffaf0] p-5">
          <div className="mb-2 flex items-center gap-2">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a6218]">
              {pick(UI.englishTitle, lang)}
            </h2>
            <span className="rounded-full bg-[#e5b567] px-2 py-0.5 text-[10px] font-bold text-[#0a1628]">
              {pick(UI.englishBadge, lang)}
            </span>
          </div>
          <p className="text-[14px] leading-relaxed text-slate-800">{pick(profile.englishTip, lang)}</p>
          <Link
            to="/"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0a1628] px-4 py-2.5 text-[13px] font-bold text-white transition hover:brightness-125"
          >
            {pick(UI.goStudy, lang)}
            <ArrowRight className="size-4 shrink-0" aria-hidden />
          </Link>
        </section>

        <SectionCard title={pick(UI.functionsTitle, lang)}>
          <div className="flex flex-wrap gap-2">
            {result.functionStack.map((fn, i) => (
              <span
                key={fn}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-[13px] font-bold text-slate-700"
              >
                {i + 1}. {fn}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-slate-500">{pick(UI.functionsNote, lang)}</p>
        </SectionCard>

        <SectionCard title={pick(UI.qualityTitle, lang)}>
          {qualityNotes.length === 0 ? (
            <p className="flex gap-2.5 text-[13px] leading-relaxed text-slate-600">
              <ClipboardCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
              <span>{pick(UI.qGood, lang)}</span>
            </p>
          ) : (
            <ul className="space-y-2 text-[13px] leading-relaxed text-slate-700">
              {qualityNotes.map((note, i) => (
                <li key={i} className="flex gap-2.5">
                  <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          )}
          {result.quality.secondsPerItem !== null && (
            <p className="mt-2 text-[12px] text-slate-400">
              {lang === "zh"
                ? `平均每题 ${result.quality.secondsPerItem.toFixed(1)} 秒`
                : `${result.quality.secondsPerItem.toFixed(1)}s per item on average`}
            </p>
          )}
        </SectionCard>

        <SectionCard title={pick(UI.caveatTitle, lang)}>
          <ul className="space-y-2.5 text-[13px] leading-relaxed text-slate-600">
            {[UI.caveat1, UI.caveat2, UI.caveat3, UI.caveat4].map((line, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-slate-300" aria-hidden />
                <span>{pick(line, lang)}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <div className="flex flex-col gap-2 pb-2 sm:flex-row">
          <button
            type="button"
            onClick={copyResult}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-[14px] font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {copied ? <Check className="size-4 shrink-0" aria-hidden /> : <Copy className="size-4 shrink-0" aria-hidden />}
            {copied ? pick(UI.copied, lang) : pick(UI.copyResult, lang)}
          </button>
          <button
            type="button"
            onClick={() => beginQuiz(true)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-[14px] font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw className="size-4 shrink-0" aria-hidden />
            {pick(UI.restart, lang)}
          </button>
        </div>
        <p className="pb-4 text-center text-[12px] text-slate-400">{pick(UI.savedNote, lang)}</p>
      </div>
    );
  })();

  return (
    <main data-i18n-skip className="min-h-dvh bg-[#f4f6f9] font-sans text-slate-900 antialiased">
      {header}
      {/* pt-content = 顶栏之下的内容区。语言纯度只对这里断言 ——
          顶栏里「返回首页 / 中文」是语言开关本身,英文界面里出现中文是故意的。 */}
      <div ref={topRef} data-testid="pt-content" className="mx-auto max-w-[720px] px-4 py-5 md:py-8">
        {phase === "intro" && introView}
        {phase === "quiz" && quizView}
        {phase === "result" && resultView}
      </div>
    </main>
  );
}
