import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, X, Trophy, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Q = { id: string; word: string; meaning_cn: string; options: string[]; isNew: boolean };

const VOCAB_TABLE: Record<string, "primary_vocab" | "junior_vocab" | "gaokao_vocab"> = {
  primary: "primary_vocab",
  junior: "junior_vocab",
  gaokao: "gaokao_vocab",
};
const MASTERY_TABLE: Record<string, "primary_word_mastery" | "junior_word_mastery" | "gaokao_user_mastery"> = {
  primary: "primary_word_mastery",
  junior: "junior_word_mastery",
  gaokao: "gaokao_user_mastery",
};

function shuffle<T>(a: T[]): T[] {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function StageTestPlay() {
  const { segment = "primary", grade = "1", testId = "" } = useParams();
  const nav = useNavigate();
  const [meta, setMeta] = useState<{ title: string; total: number; threshold: number } | null>(null);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // load test meta
      const { data: t } = await supabase
        .from("stage_tests")
        .select("title,total_questions,pass_threshold")
        .eq("id", testId)
        .maybeSingle();
      if (!t) {
        toast.error("测试不存在");
        nav(-1);
        return;
      }
      setMeta({ title: t.title, total: t.total_questions, threshold: t.pass_threshold });

      const vocabTable = VOCAB_TABLE[segment as string];
      const masteryTable = MASTERY_TABLE[segment as string];

      // pull vocab pool for this grade (3-5x test size)
      const poolSize = Math.max(60, t.total_questions * 5);
      const gradeFilter: any = segment === "gaokao" ? {} : { grade: Number(grade) };
      const { data: vocab } = await supabase
        .from(vocabTable as any)
        .select("id,word,meaning_cn")
        .match(gradeFilter)
        .limit(poolSize);

      if (!vocab || vocab.length < 4) {
        toast.error("题库不足，请先完成基础学习");
        nav(-1);
        return;
      }

      // figure out which words user has seen (for "new question ratio")
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      let seenIds = new Set<string>();
      if (uid) {
        const idCol = segment === "gaokao" ? "item_id" : "word_id";
        const { data: seen } = await supabase
          .from(masteryTable as any)
          .select(idCol)
          .eq("user_id", uid)
          .limit(2000);
        seenIds = new Set((seen ?? []).map((r: any) => r[idCol]));
      }

      // prefer new words: at least 60% new if available
      const newWords = vocab.filter((v) => !seenIds.has(v.id));
      const oldWords = vocab.filter((v) => seenIds.has(v.id));
      const newQuota = Math.min(Math.ceil(t.total_questions * 0.6), newWords.length);
      const picked = [...shuffle(newWords).slice(0, newQuota), ...shuffle(oldWords).slice(0, t.total_questions - newQuota)];
      const final = shuffle(picked).slice(0, t.total_questions);

      const allMeanings = vocab.map((v) => v.meaning_cn);
      const qs: Q[] = final.map((v) => {
        const distractors = shuffle(allMeanings.filter((m) => m !== v.meaning_cn)).slice(0, 3);
        const options = shuffle([v.meaning_cn, ...distractors]);
        return { id: v.id, word: v.word, meaning_cn: v.meaning_cn, options, isNew: !seenIds.has(v.id) };
      });
      setQuestions(qs);
      setLoading(false);
    })();
  }, [testId, segment, grade]);

  const newCount = useMemo(() => questions.filter((q) => q.isNew).length, [questions]);

  function pick(opt: string) {
    if (picked) return;
    setPicked(opt);
    if (opt === questions[idx].meaning_cn) setCorrectCount((c) => c + 1);
    setTimeout(() => {
      if (idx + 1 < questions.length) {
        setIdx(idx + 1);
        setPicked(null);
      } else {
        submit();
      }
    }, 800);
  }

  async function submit() {
    setSubmitted(true);
    const { data, error } = await supabase.rpc("submit_stage_test", {
      _test_id: testId,
      _correct: correctCount + (picked === questions[idx].meaning_cn ? 0 : 0), // already counted
      _total: questions.length,
      _new_question_count: newCount,
    });
    if (error) { toast.error(error.message); return; }
    setResult(Array.isArray(data) ? data[0] : data);
  }

  if (loading || !meta) {
    return <main className="grid min-h-screen place-items-center text-sm text-muted-foreground">加载题目中…</main>;
  }

  if (submitted && result) {
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-10">
        <div className={`rounded-3xl bg-gradient-to-br ${result.passed ? "from-emerald-400 to-teal-500" : "from-slate-400 to-slate-500"} p-8 text-center text-white shadow-tile`}>
          {result.passed ? <Trophy className="mx-auto size-16" /> : <Sparkles className="mx-auto size-16" />}
          <div className="mt-3 text-3xl font-extrabold">{result.passed ? "通关！" : "再接再厉"}</div>
          <div className="mt-2 text-5xl font-black">{pct}%</div>
          <div className="mt-1 text-sm opacity-90">{correctCount} / {questions.length} 正确</div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/20 p-3">
              <div className="text-[10px] uppercase tracking-wider opacity-80">金币</div>
              <div className="text-2xl font-extrabold">+{result.coins_awarded}</div>
            </div>
            <div className="rounded-2xl bg-white/20 p-3">
              <div className="text-[10px] uppercase tracking-wider opacity-80">宠物经验</div>
              <div className="text-2xl font-extrabold">+{result.exp_awarded}</div>
            </div>
          </div>
          {result.evolved && <div className="mt-3 text-base font-bold">🎉 你的宠物进化了！</div>}
          {result.message && <div className="mt-3 text-xs opacity-90">{result.message}</div>}
        </div>
        <button
          onClick={() => nav(`/stage-tests/${segment}/${grade}`)}
          className="mt-5 w-full rounded-2xl bg-foreground py-3 font-extrabold text-background"
        >
          返回测试列表
        </button>
      </main>
    );
  }

  const q = questions[idx];
  const progress = ((idx + (picked ? 1 : 0)) / questions.length) * 100;

  return (
    <main className="mx-auto min-h-screen max-w-xl px-5 py-6">
      <button onClick={() => nav(-1)} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> 退出
      </button>
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{meta.title}</span>
        <span>{idx + 1} / {questions.length}</span>
      </div>
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-gradient-to-r from-sky-500 to-violet-500 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-sky-100 to-violet-100 p-8 text-center shadow-tile">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">选出正确含义</div>
        <div className="mt-3 text-4xl font-extrabold">{q.word}</div>
        {q.isNew && <div className="mt-2 inline-block rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">NEW</div>}
      </div>

      <div className="mt-6 space-y-3">
        {q.options.map((opt) => {
          const isAnswer = opt === q.meaning_cn;
          const isPicked = picked === opt;
          let cls = "border-border bg-card hover:border-primary";
          if (picked) {
            if (isAnswer) cls = "border-emerald-500 bg-emerald-50";
            else if (isPicked) cls = "border-rose-500 bg-rose-50";
            else cls = "border-border bg-card opacity-60";
          }
          return (
            <button
              key={opt}
              onClick={() => pick(opt)}
              disabled={!!picked}
              className={`flex w-full items-center justify-between rounded-2xl border-2 p-4 text-left text-base font-semibold transition ${cls}`}
            >
              <span>{opt}</span>
              {picked && isAnswer && <Check className="size-5 text-emerald-600" />}
              {picked && isPicked && !isAnswer && <X className="size-5 text-rose-600" />}
            </button>
          );
        })}
      </div>
    </main>
  );
}