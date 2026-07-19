import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BackLink from "@/components/BackLink";
import { ArrowLeft, Check, X, Loader2, Sparkles, Trophy, RotateCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { recordZoneMistake } from "@/lib/recordZoneMistake";

/**
 * 初中「按考点抽题」练习页 —— 仿 GaokaoGrammarQuiz,但用初中考点。
 *
 * - 读 ai_generated_questions:.eq("kp_id", junior_grammar_points.id[UUID]) + used_count<5 + limit。
 * - 不补题:generate-question-for-kp 只认 v_gaokao_all_knowledge_points(高考),初中 kp 会 404,
 *   故按 Aaron 要求暂不调用补题,只用库里现有题;没有就提示待灌题。
 * - 接 自包含 考点(语法 tense/clause/verb/other + 词汇与交际 vocab_comm + 完形 cloze + 阅读 reading);
 *   完形/阅读原文已用方案A塞进 stem,故放行;仅听力(需音频)仍拦下提示。
 * - 答题写一行 ai_question_attempts(question_id/kp_id/selected_answer/is_correct/year_band),
 *   user_id 走列默认 auth.uid()。
 */

type AGQ = {
  id: string;
  stem: string;
  option_a: string | null;
  option_b: string | null;
  option_c: string | null;
  option_d: string | null;
  correct_answer: string | null; // "A".."D"
  explanation: string | null;
  used_count: number | null;
};
type Point = { id: string; code: string; title: string; grade: number; category_id: string };

const PASSAGE_CATEGORIES = new Set(["listening"]); // 仅听力暂不接(需音频);阅读/完形已用方案A把原文塞进 stem,放行
const LETTERS = ["A", "B", "C", "D"] as const;
const QUESTION_LIMIT = 20;

export default function JuniorGrammarKpQuiz() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [point, setPoint] = useState<Point | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [questions, setQuestions] = useState<AGQ[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [catCode, setCatCode] = useState<string | null>(null); // 分类 code,用于 BackLink 分流

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setPicked(null);
    setIdx(0);
    setScore({ correct: 0, total: 0 });
    (async () => {
      const { data: p } = await supabase
        .from("junior_grammar_points")
        .select("id, code, title, grade, category_id")
        .eq("id", id)
        .maybeSingle();
      if (cancelled) return;
      if (!p) {
        setPoint(null);
        setLoading(false);
        return;
      }
      setPoint(p as Point);

      const { data: cat } = await supabase
        .from("junior_grammar_categories")
        .select("code")
        .eq("id", (p as Point).category_id)
        .maybeSingle();
      if (cancelled) return;
      const code = (cat as { code: string } | null)?.code ?? null;
      setCatCode(code);
      if (code && PASSAGE_CATEGORIES.has(code)) {
        setBlocked(true);
        setLoading(false);
        return;
      }

      const { data: qs } = await supabase
        .from("ai_generated_questions")
        .select("id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, used_count")
        .eq("kp_id", id)
        .lt("used_count", 5)
        .order("used_count", { ascending: true })
        .limit(QUESTION_LIMIT);
      if (cancelled) return;
      setQuestions((qs ?? []) as AGQ[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const cur = questions[idx];

  // BackLink 按考点 category 分流:语法→/junior/grammar、阅读/完形→/junior/reading、词汇与交际→/junior/vocab
  const back = (() => {
    const grade = point?.grade ? `?grade=${point.grade}` : "";
    if (catCode === "vocab_comm") return { to: `/junior/vocab${grade}`, label: "返回词汇练习" };
    if (catCode === "reading" || catCode === "cloze") return { to: `/junior/reading${grade}`, label: "返回阅读训练" };
    return { to: `/junior/grammar${grade}`, label: "返回语法专项" };
  })();

  const onPick = async (letter: string) => {
    if (picked || !cur || !point) return;
    setPicked(letter);
    const isCorrect = (cur.correct_answer || "").trim().toUpperCase() === letter;
    setScore((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
    // 块②:补写统一错题本(此前只写 ai_question_attempts)。按字母对齐 A/B/C/D;做对自动移出。
    void recordZoneMistake({
      module: "senior_grammar",
      sourceKeyBase: cur.id,
      isCorrect,
      stem: cur.stem,
      options: [cur.option_a, cur.option_b, cur.option_c, cur.option_d].map((o) => o ?? ""),
      correctIdx: LETTERS.indexOf((cur.correct_answer || "").trim().toUpperCase() as (typeof LETTERS)[number]),
      pickedIdx: LETTERS.indexOf(letter as (typeof LETTERS)[number]),
      explanation: cur.explanation,
      sourceLabel: point.title,
    });
    try {
      // ai_question_attempts 未在 types.ts(新表),做 any 转义;user_id 走列默认 auth.uid()。
      await (supabase as unknown as { from: (t: string) => { insert: (v: unknown) => Promise<{ error: unknown }> } })
        .from("ai_question_attempts")
        .insert({
          question_id: cur.id,
          kp_id: id,
          selected_answer: letter,
          is_correct: isCorrect,
          year_band: point.grade,
        });
    } catch (e) {
      console.error("[JuniorGrammarKpQuiz] ai_question_attempts insert", e);
    }
  };

  const next = () => {
    setPicked(null);
    setIdx((i) => i + 1);
  };
  const restart = () => {
    setPicked(null);
    setIdx(0);
    setScore({ correct: 0, total: 0 });
  };

  const Shell = ({ children }: { children: React.ReactNode }) => (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
      <BackLink
        to={back.to}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> {back.label}
      </BackLink>
      {children}
    </main>
  );

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> 加载中…
        </div>
      </Shell>
    );
  }

  if (!point) {
    return (
      <Shell>
        <p className="rounded-2xl border border-border/60 bg-card p-6 text-sm text-muted-foreground">未找到该考点。</p>
      </Shell>
    );
  }

  if (blocked) {
    return (
      <Shell>
        <div className="rounded-3xl border border-border/60 bg-card p-8 text-center">
          <h3 className="text-lg font-extrabold">「{point.title}」暂未开放抽题</h3>
          <p className="mt-2 text-sm text-muted-foreground">听力类考点需要配套音频,稍后接入。</p>
        </div>
      </Shell>
    );
  }

  if (questions.length === 0) {
    return (
      <Shell>
        <div className="rounded-3xl border border-border/60 bg-card p-8 text-center">
          <Sparkles className="mx-auto size-10 text-amber-500" />
          <h3 className="mt-2 text-lg font-extrabold">「{point.title}」暂无题目</h3>
          <p className="mt-2 text-sm text-muted-foreground">该考点的 AI 题库还没有可用题(待灌题)。</p>
        </div>
      </Shell>
    );
  }

  if (idx >= questions.length) {
    const pct = Math.round((score.correct / Math.max(1, score.total)) * 100);
    return (
      <Shell>
        <div className="rounded-3xl border border-border/60 bg-card p-8 text-center">
          <Trophy className="mx-auto size-12 text-amber-500" />
          <h3 className="mt-2 text-xl font-extrabold">
            {pct >= 90 ? "🌟 太棒了！" : pct >= 60 ? "👍 不错！" : "💪 继续加油！"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            「{point.title}」答对 {score.correct} / {score.total}（{pct}%）
          </p>
          <button
            onClick={restart}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
          >
            <RotateCw className="size-4" /> 再练一遍
          </button>
        </div>
      </Shell>
    );
  }

  const correctLetter = (cur.correct_answer || "").trim().toUpperCase();

  return (
    <Shell>
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-bold text-foreground">{point.title}</span>
          <span>
            第 {idx + 1} / {questions.length} 题 · ✅ {score.correct} / {score.total}
          </span>
        </div>

        <div className="rounded-3xl border border-border/60 bg-card p-6">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            按考点抽题 · {point.code}
          </div>
          {/* 完形 stem 含整篇短文 + \n,用 pre-wrap 保留换行/分隔线/「第N空」分行 */}
          <p className="mt-2 whitespace-pre-wrap text-base font-medium leading-relaxed">{cur.stem}</p>
        </div>

        <div className="grid gap-2">
          {LETTERS.map((letter) => {
            const text = cur[`option_${letter.toLowerCase()}` as "option_a" | "option_b" | "option_c" | "option_d"];
            if (text == null || text === "") return null;
            const isCorrect = letter === correctLetter;
            const showRight = picked && isCorrect;
            const showWrong = picked === letter && !isCorrect;
            return (
              <button
                key={letter}
                onClick={() => onPick(letter)}
                disabled={!!picked}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border-2 p-3.5 text-left text-sm font-medium transition",
                  showRight && "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40",
                  showWrong && "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40",
                  !picked && "border-border bg-card hover:border-primary/40",
                  picked && !showRight && !showWrong && "opacity-60",
                )}
              >
                <span className="grid size-7 flex-shrink-0 place-items-center rounded-lg bg-muted text-xs font-bold">
                  {letter}
                </span>
                <span className="flex-1">{text}</span>
                {showRight && <Check className="size-5 flex-shrink-0" />}
                {showWrong && <X className="size-5 flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {picked && (
          <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
            <div className="flex items-center gap-1.5 text-sm font-bold">
              {picked === correctLetter ? (
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <Check className="size-4" /> 答对了
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-rose-600">
                  <X className="size-4" /> 正确答案：{correctLetter}
                </span>
              )}
            </div>
            {cur.explanation && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{cur.explanation}</p>
            )}
            <button
              onClick={next}
              className="mt-3 w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground"
            >
              {idx >= questions.length - 1 ? "查看结果" : "下一题"}
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
          <Sparkles className="size-3" /> 题目来自 AI 题库,答题已记入练习记录
        </div>
      </div>
    </Shell>
  );
}
