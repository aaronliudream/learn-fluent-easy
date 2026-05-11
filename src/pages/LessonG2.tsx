import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Check, Volume2, Sparkles, Lock, ChevronDown, ChevronUp } from "lucide-react";
import BackLink from "@/components/BackLink";
import { supabase } from "@/integrations/supabase/client";
import { speak } from "@/lib/speak";
import { celebrateScore } from "@/lib/feedback";
import G2_LESSONS from "@/data/aiLessonsG2.json";
import {
  G2_CHAPTERS,
  type G2Chapter,
  isChapterUnlocked,
  isChapterCompleted,
  isLessonUnlocked,
  getCurrentChapter,
  getChapterByLessonId,
  lessonIdToIdx,
  pickSparkLine,
} from "@/data/g2LessonChapters";

type Expr = { en: string; cn: string; scene?: string };
type Vocab = { word: string; pron?: string; meaning?: string; example?: string; example_cn?: string };
type Grammar = { title: string; explain: string; examples?: { en: string; cn: string }[] };
type LessonContent = {
  expressions?: Expr[];
  vocab?: Vocab[];
  grammar?: Grammar[];
  quiz?: any;
  listening?: any;
  fillBlanks?: any;
  reading?: any;
  output?: any;
};

const G2_MAP = G2_LESSONS as unknown as Record<string, LessonContent>;
const G2_KEYS = Object.keys(G2_MAP);

/** "How's the weather today? · 二年级第 1 课:今天天气怎样" → { en, cn, idx } */
function parseKey(key: string) {
  const [enRaw, cnRaw] = key.split("·").map((s) => s.trim());
  const en = enRaw ?? key;
  const cn = cnRaw ?? "";
  const m = cn.match(/第\s*(\d+)/);
  const idx = m ? Number(m[1]) : 0;
  return { en, cn, idx };
}

export default function LessonG2() {
  const [params] = useSearchParams();
  const grade = Number(params.get("grade") || "2");
  const lessonKey = params.get("lesson");

  // For now this page only serves G2. If grade is not 2, send users back to /primary.
  if (grade !== 2) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p className="mb-3 text-muted-foreground">这个页面目前仅服务二年级课程。</p>
        <Link to="/primary" className="text-primary underline">回到主屏</Link>
      </main>
    );
  }

  return lessonKey ? <LessonView lessonKey={lessonKey} /> : <LessonList />;
}

/* ---------------- 列表 ---------------- */
function LessonList() {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "二年级 · 30 节 AI 课 | FluentPath";
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (u?.user) {
        const { data } = await supabase
          .from("primary_lesson_completion")
          .select("lesson_key")
          .eq("user_id", u.user.id);
        setDone(new Set((data ?? []).map((r: any) => r.lesson_key as string)));
      }
      setLoading(false);
    })();
  }, []);

  const items = useMemo(
    () =>
      G2_KEYS.map((k) => ({ key: k, ...parseKey(k) })).sort((a, b) => a.idx - b.idx),
    []
  );
  const doneCount = items.filter((it) => done.has(it.key)).length;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-6 pb-24">
      <BackLink to="/primary/adventure/2" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回二年级
      </BackLink>

      <header className="mb-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">G2 · AI Lesson</div>
        <h1 className="text-grad-title text-2xl font-extrabold md:text-3xl">二年级的 30 节课</h1>
        <p className="mt-1 text-sm text-muted-foreground">每节 5–8 分钟,跟 Spark 一起读句子、学单词、看语法。</p>
      </header>

      <div className="mb-3 rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:from-emerald-950/40 dark:to-teal-950/40 dark:text-emerald-200">
        <div className="font-extrabold">📝 已完成 {loading ? "…" : doneCount} / 30</div>
      </div>

      <ul className="space-y-2">
        {items.map((it) => {
          const isDone = done.has(it.key);
          return (
            <li key={it.key}>
              <Link
                to={`/lesson?grade=2&lesson=${encodeURIComponent(it.key)}`}
                className={`flex items-center gap-3 rounded-2xl border-2 p-3 shadow-tile transition hover:-translate-y-0.5 ${
                  isDone
                    ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 dark:border-emerald-700 dark:from-emerald-950/30 dark:to-teal-950/30"
                    : "border-border bg-card"
                }`}
              >
                <div className={`grid size-12 shrink-0 place-items-center rounded-2xl text-lg font-black text-white shadow-sm ${
                  isDone ? "bg-gradient-to-br from-emerald-400 to-teal-400" : "bg-gradient-to-br from-amber-300 to-rose-300"
                }`}>
                  {isDone ? <Check className="size-6 stroke-white" /> : it.idx || "·"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-base font-extrabold">{it.en}</div>
                  <div className="truncate text-xs text-muted-foreground">{it.cn}</div>
                </div>
                <BookOpen className="size-5 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

/* ---------------- 单课 ---------------- */
function LessonView({ lessonKey }: { lessonKey: string }) {
  const nav = useNavigate();
  const data = G2_MAP[lessonKey];
  const meta = parseKey(lessonKey);
  const [t0] = useState(Date.now());
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    document.title = `${meta.en} · 二年级 | FluentPath`;
  }, [meta.en]);

  if (!data) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <BackLink to="/lesson?grade=2" className="text-sm text-primary">← 返回列表</BackLink>
        <p className="mt-3 text-muted-foreground">课程不存在</p>
      </main>
    );
  }

  async function markDone() {
    setCompleting(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (uid) {
        await supabase
          .from("primary_lesson_completion")
          .upsert(
            { user_id: uid, lesson_key: lessonKey, completed_at: new Date().toISOString() },
            { onConflict: "user_id,lesson_key" }
          );
        await supabase.from("learning_events").insert({
          user_id: uid,
          event_type: "lesson_complete",
          lesson_key: `g2_lesson_${lessonKey.slice(0, 80)}`,
          study_minutes: Math.max(1, Math.round((Date.now() - t0) / 60000)),
        });
        try {
          const c = await import("@/lib/coins");
          await c.awardCoins(10, "g2_lesson_complete");
          c.petReact("happy", { coins: 10 });
        } catch { /* noop */ }
      }
      celebrateScore(100);
    } finally {
      setTimeout(() => nav("/lesson?grade=2"), 600);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-6 pb-24">
      <BackLink to="/lesson?grade=2" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回 G2 课程列表
      </BackLink>

      <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        G2 · 第 {meta.idx} 课
      </div>
      <h1 className="text-grad-title text-2xl font-extrabold md:text-3xl">{meta.en}</h1>
      <p className="text-sm text-muted-foreground">{meta.cn}</p>

      {/* Expressions */}
      {!!data.expressions?.length && (
        <Section title="🗣️ 今日句子" subtitle="点一下听 Spark 念">
          <div className="space-y-2">
            {data.expressions.map((e, i) => (
              <button
                key={i}
                onClick={() => speak(e.en)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-white to-violet-50 p-4 text-left shadow-tile transition hover:-translate-y-0.5 dark:border-violet-800 dark:from-violet-950/30 dark:to-fuchsia-950/30"
              >
                <div className="min-w-0">
                  <div className="text-base font-extrabold">{e.en}</div>
                  <div className="text-xs text-muted-foreground">{e.cn}</div>
                  {e.scene && <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-violet-500">· {e.scene}</div>}
                </div>
                <Volume2 className="size-5 shrink-0 text-violet-500" />
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Vocab */}
      {!!data.vocab?.length && (
        <Section title="📒 生词" subtitle="新词加音标和例句">
          <div className="grid gap-2 sm:grid-cols-2">
            {data.vocab.map((v, i) => (
              <button
                key={i}
                onClick={() => speak(v.word)}
                className="rounded-2xl border-2 border-sky-200 bg-gradient-to-br from-white to-sky-50 p-4 text-left shadow-tile transition hover:-translate-y-0.5 dark:border-sky-800 dark:from-sky-950/30 dark:to-cyan-950/30"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black">{v.word}</span>
                  <Volume2 className="size-4 text-sky-500" />
                </div>
                {v.pron && <div className="text-xs text-muted-foreground">{v.pron}</div>}
                {v.meaning && <div className="mt-1 text-sm font-bold">{v.meaning}</div>}
                {v.example && (
                  <div className="mt-2 rounded-lg bg-sky-100/60 p-2 text-xs dark:bg-sky-950/40">
                    <div>{v.example}</div>
                    {v.example_cn && <div className="text-muted-foreground">{v.example_cn}</div>}
                  </div>
                )}
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Grammar */}
      {!!data.grammar?.length && (
        <Section title="📐 语法点" subtitle="一句话讲明白">
          <div className="space-y-3">
            {data.grammar.map((g, i) => (
              <div key={i} className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-white to-amber-50 p-4 shadow-tile dark:border-amber-800 dark:from-amber-950/30 dark:to-orange-950/30">
                <div className="text-sm font-extrabold">{g.title}</div>
                <p className="mt-1 text-xs text-muted-foreground">{g.explain}</p>
                {!!g.examples?.length && (
                  <ul className="mt-2 space-y-1 text-sm">
                    {g.examples.map((ex, k) => (
                      <li key={k} className="flex items-start gap-2">
                        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                        <span><span className="font-bold">{ex.en}</span> <span className="text-muted-foreground">— {ex.cn}</span></span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 完成按钮 */}
      <button
        onClick={markDone}
        disabled={completing}
        className="mt-8 w-full rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 py-4 text-base font-extrabold text-white shadow-tile transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {completing ? "完成中…" : "✅ 我学完啦"}
      </button>
    </main>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <div className="mb-2">
        <h2 className="text-base font-extrabold">{title}</h2>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}