import { Link } from "react-router-dom";
import { T } from "@/i18n/T";

/**
 * 3 "what should I do as a parent THIS week" suggestions, derived from the
 * existing get_parent_dashboard RPC payload.
 *
 * Rules (in priority order):
 *  1. If there are ≥ 3 unresolved weakness items → "陪练 grammar/vocab" card
 *  2. If a stage's accuracy < 0.65 → "今晚一起读 1 篇" card for that stage
 *  3. If 0 active days in last 7 days for a module → "温柔提醒" card
 *  4. Always keep a fallback positive suggestion if nothing else fires.
 *
 * Each suggestion is a thin slot — no heavy fetching; pure derivation from
 * the dashboard payload the parent center already has.
 */

type Words = { mastered: number; proficient: number; familiar: number; touched: number };

export interface ParentSuggestionInput {
  weakness: {
    module: string; parent_label: string | null; snapshot: unknown;
    wrong_count: number; last_wrong_at: string;
  }[];
  primary:  { accuracy: number; sessions: number; active_days: number; words: Words };
  junior:   { accuracy: number; sessions: number; active_days: number; words: Words };
  gaokao:   { attempts: number; correct: number; active_days: number; words: Words };
  /** Last 7 days minutes (already trimmed). */
  recentMinutes: { d: string; mins: number }[];
}

interface Suggestion {
  id: string;
  rank: 1 | 2 | 3;
  tone: "warm" | "cool" | "mint";
  title: string;
  sub: string;
  cta: string;
  to: string;
}

const TONE_CLS = {
  warm: {
    wrap: "bg-gradient-to-br from-orange-50 to-rose-50 border-orange-200 dark:from-orange-500/10 dark:to-rose-500/10 dark:border-orange-500/30",
    icon: "bg-gradient-to-br from-orange-500 to-rose-500",
    cta:  "bg-rose-600",
  },
  cool: {
    wrap: "bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200 dark:from-violet-500/10 dark:to-indigo-500/10 dark:border-violet-500/30",
    icon: "bg-gradient-to-br from-indigo-500 to-violet-500",
    cta:  "bg-indigo-600",
  },
  mint: {
    wrap: "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 dark:from-emerald-500/10 dark:to-teal-500/10 dark:border-emerald-500/30",
    icon: "bg-gradient-to-br from-emerald-500 to-teal-500",
    cta:  "bg-emerald-600",
  },
} as const;

function deriveSuggestions(d: ParentSuggestionInput): Suggestion[] {
  const out: Suggestion[] = [];

  // Rule 1 — weak items (grammar prioritized over vocab)
  const grammarWeak = d.weakness.filter((w) => (w.module || "").toLowerCase() === "grammar");
  const vocabWeak   = d.weakness.filter((w) => (w.module || "").toLowerCase() === "vocab");
  if (grammarWeak.length >= 3) {
    out.push({
      id: "weak-grammar",
      rank: 1,
      tone: "warm",
      title: `Mei 有 ${grammarWeak.length} 个语法薄弱点 — 周末一起练？`,
      sub: `${grammarWeak.slice(0, 2).map((w) => w.parent_label || w.module).join(" / ")} 等 · 预计 20 分钟`,
      cta: "陪练",
      to: "/gaokao/mistakes",
    });
  } else if (vocabWeak.length >= 3) {
    out.push({
      id: "weak-vocab",
      rank: 1,
      tone: "warm",
      title: `Mei 有 ${vocabWeak.length} 个词汇薄弱点 — 一起复习？`,
      sub: `${vocabWeak.slice(0, 2).map((w) => w.parent_label || w.module).join(" / ")} 等 · 预计 10 分钟`,
      cta: "陪练",
      to: "/review/today",
    });
  } else if (d.weakness.length > 0) {
    const w = d.weakness[0];
    out.push({
      id: "weak-other",
      rank: 1,
      tone: "warm",
      title: `${w.parent_label || w.module} — 错了 ${w.wrong_count} 次，今晚陪练一下？`,
      sub: `预计 10 分钟`,
      cta: "陪练",
      to: "/gaokao/mistakes",
    });
  }

  // Rule 2 — low accuracy stage
  const accCandidates: { label: string; acc: number; to: string; module: "reading" | "grammar" }[] = [];
  if (d.gaokao.attempts > 5)  accCandidates.push({ label: "高考", acc: d.gaokao.correct / Math.max(1, d.gaokao.attempts), to: "/gaokao/reading",  module: "reading" });
  if (d.junior.sessions > 5)  accCandidates.push({ label: "初中", acc: d.junior.accuracy, to: "/junior/reading", module: "reading" });
  if (d.primary.sessions > 5) accCandidates.push({ label: "小学", acc: d.primary.accuracy, to: "/primary", module: "reading" });
  const lowest = accCandidates.sort((a, b) => a.acc - b.acc)[0];
  if (lowest && lowest.acc < 0.65) {
    out.push({
      id: "low-acc",
      rank: out.length === 0 ? 1 : 2,
      tone: "cool",
      title: `${lowest.label}阅读正确率 ${Math.round(lowest.acc * 100)}% — 今晚一起读 1 篇？`,
      sub: "建议挑议论文 · 1 篇约 10 分钟 · 一起讨论中心思想",
      cta: "推荐",
      to: lowest.to,
    });
  }

  // Rule 3 — recent inactivity (no minutes in 3+ days)
  const last3DaysMins = d.recentMinutes.slice(-3).reduce((s, x) => s + x.mins, 0);
  if (last3DaysMins === 0 && out.length < 3) {
    out.push({
      id: "inactive",
      rank: (out.length + 1) as 1 | 2 | 3,
      tone: "mint",
      title: "Mei 最近 3 天没学习 — 温柔提醒一下？",
      sub: "保持每日 15-20 分钟会更稳定，词汇是阅读和写作的基础",
      cta: "提醒",
      to: "/primary",
    });
  }

  // Rule 4 — fallback positive nudges if we still have empty slots
  if (out.length === 0) {
    out.push({
      id: "ok-1",
      rank: 1,
      tone: "mint",
      title: "Mei 这周表现很稳 — 一起读一本绘本？",
      sub: "鼓励她挑战更高难度内容 · 预计 15 分钟",
      cta: "推荐",
      to: "/primary",
    });
  }
  if (out.length === 2) {
    out.push({
      id: "ok-3",
      rank: 3,
      tone: "warm",
      title: "本周复盘",
      sub: "和孩子一起看本周的成长报告，给她一些鼓励",
      cta: "查看",
      to: "/parent",
    });
  }

  return out.slice(0, 3);
}

export function ParentSuggestions({ data }: { data: ParentSuggestionInput }) {
  const items = deriveSuggestions(data);
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-tile">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-extrabold"><T>💡 本周建议家长这样陪伴</T></h3>
        <span className="text-xs text-muted-foreground">
          <T>AI 根据孩子数据自动推荐</T>
        </span>
      </div>
      <div className="space-y-2.5">
        {items.map((s) => {
          const t = TONE_CLS[s.tone];
          return (
            <Link
              key={s.id}
              to={s.to}
              className={`group flex items-center gap-3 rounded-2xl border ${t.wrap} p-3 transition-all hover:translate-x-0.5`}>
              <div className={`grid size-11 shrink-0 place-items-center rounded-xl ${t.icon} text-white text-xl shadow-sm`}>
                {s.rank === 1 ? "1️⃣" : s.rank === 2 ? "2️⃣" : "3️⃣"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold leading-tight"><T>{s.title}</T></div>
                <div className="text-xs text-muted-foreground mt-0.5"><T>{s.sub}</T></div>
              </div>
              <div className={`rounded-full ${t.cta} text-white text-xs font-bold px-3 py-1.5 group-hover:scale-105 transition`}>
                <T>{s.cta}</T> →
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
