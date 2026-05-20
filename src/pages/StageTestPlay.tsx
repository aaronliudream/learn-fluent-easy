import { T } from "@/i18n/T";import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, X, Trophy, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { celebrateScore } from "@/lib/feedback";
import { useRegisterAssistant } from "@/contexts/AIAssistantContext";
import { recordUnifiedAttempt } from "@/lib/unifiedMastery";
import { stageTestPlayPath } from "@/lib/stageTestNav";

type Q = {id: string;word: string;meaning_cn: string;options: string[];isNew: boolean;};

const VOCAB_TABLE: Record<string, "primary_vocab" | "junior_vocab" | "gaokao_vocab"> = {
  primary: "primary_vocab",
  junior: "junior_vocab",
  gaokao: "gaokao_vocab"
};
const MASTERY_TABLE: Record<string, "primary_word_mastery" | "junior_word_mastery" | "gaokao_user_mastery"> = {
  primary: "primary_word_mastery",
  junior: "junior_word_mastery",
  gaokao: "gaokao_user_mastery"
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
  const [meta, setMeta] = useState<{title: string;total: number;threshold: number;} | null>(null);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [results, setResults] = useState<{id: string;correct: boolean;}[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [finalCorrect, setFinalCorrect] = useState(0);
  const [loading, setLoading] = useState(true);

  // Full-test lock for vocabulary stage tests.
  useRegisterAssistant(
    meta && testId ?
    {
      context: "stage_test",
      ref: testId,
      topic: `阶段测验 · ${meta.title}`,
      mode: "full-test",
      unlocked: submitted,
      lockedHint: "请先把整套测验做完并提交，我再来帮你分析每个词 ✨",
      pageTitle: "💬 小月 · 测验复盘",
      snapshot: submitted ?
      {
        title: meta.title,
        total: meta.total,
        pass_threshold: meta.threshold,
        final_correct: finalCorrect,
        results: results.slice(0, 50)
      } :
      undefined
    } :
    null
  );

  useEffect(() => {
    (async () => {
      // load test meta
      const { data: t } = await supabase.
      from("stage_tests").
      select("title,total_questions,pass_threshold,module,question_source").
      eq("id", testId).
      maybeSingle();
      if (!t) {
        toast.error("测试不存在");
        nav(-1);
        return;
      }
      const aiPath = stageTestPlayPath(segment as string, Number(grade), testId, {
        module: (t as { module?: string }).module,
        question_source: (t as { question_source?: string }).question_source,
      });
      if (aiPath.includes("/junior/stage-assessment/")) {
        nav(aiPath, { replace: true });
        return;
      }
      setMeta({ title: t.title, total: t.total_questions, threshold: t.pass_threshold });

      const vocabTable = VOCAB_TABLE[segment as string];
      const masteryTable = MASTERY_TABLE[segment as string];

      // pull vocab pool for this grade (3-5x test size)
      const poolSize = Math.max(60, t.total_questions * 5);
      const gradeFilter: any = segment === "gaokao" ? {} : { grade: Number(grade) };
      const { data: vocabRaw } = await supabase.
      from(vocabTable as any).
      select("id,word,meaning_cn").
      match(gradeFilter).
      limit(poolSize);
      const vocab = vocabRaw as any[] | null ?? [];

      if (vocab.length < 4) {
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
        const { data: seen } = await supabase.
        from(masteryTable as any).
        select(idCol).
        eq("user_id", uid).
        limit(2000);
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
    const isRight = opt === questions[idx].meaning_cn;
    const newCorrect = correctCount + (isRight ? 1 : 0);
    if (isRight) setCorrectCount(newCorrect);
    const nextResults = [...results, { id: questions[idx].id, correct: isRight }];
    setResults(nextResults);
    setTimeout(() => {
      if (idx + 1 < questions.length) {
        setIdx(idx + 1);
        setPicked(null);
      } else {
        submit(newCorrect, nextResults);
      }
    }, 800);
  }

  async function submit(finalCorrect: number, allResults: {id: string;correct: boolean;}[]) {
    setSubmitted(true);
    setFinalCorrect(finalCorrect);
    // 写入掌握度 + 做题分数，让家长中心能看到进度
    syncProgress(allResults).catch(() => {});
    const { data, error } = await supabase.rpc("submit_stage_test", {
      _test_id: testId,
      _correct: finalCorrect,
      _total: questions.length,
      _new_question_count: newCount
    });
    if (error) {toast.error(error.message);return;}
    setResult(Array.isArray(data) ? data[0] : data);
    const pct = questions.length > 0 ? Math.round(finalCorrect / questions.length * 100) : 0;
    celebrateScore(pct);
  }

  async function syncProgress(allResults: {id: string;correct: boolean;}[]) {
    const { data: u } = await supabase.auth.getUser();
    const uid = u?.user?.id;
    if (!uid) return;
    const seg = segment as string;
    const accuracy = allResults.length ? allResults.filter((r) => r.correct).length / allResults.length : 0;

    // 🆕 v7：阶段测试统一写 unified_mastery（每题一条 vocab）
    const stage = (seg === "primary" ? "primary" : seg === "junior" ? "junior" : "senior") as
    "primary" | "junior" | "senior";
    const gNum = Number(grade);
    const dbGrade = stage === "senior" ?
    gNum >= 1 && gNum <= 3 ? gNum + 9 : gNum :
    gNum;
    await Promise.all(allResults.map((r) =>
    recordUnifiedAttempt({
      stage,
      grade: dbGrade,
      module: "vocab",
      item_type: "word",
      item_id: r.id,
      is_correct: r.correct,
      context: { source: "stage_test", test_id: testId }
    }).catch(() => {})
    ));

    // 1) 做题分数（家长中心：sessions / accuracy / active_days）
    if (seg === "primary") {
      await supabase.from("primary_game_scores").insert({
        user_id: uid, game_type: "stage_test", grade: Number(grade),
        score: Math.round(accuracy * 100), accuracy, duration_ms: 0
      });
    } else if (seg === "junior") {
      await supabase.from("junior_game_scores").insert({
        user_id: uid, game_type: "stage_test", grade: Number(grade),
        score: Math.round(accuracy * 100), accuracy, duration_ms: 0
      });
    }

    // 2) 单词掌握度 + 做题记录
    if (seg === "gaokao") {
      // 高考：写 gaokao_user_attempts + gaokao_user_mastery
      const attempts = allResults.map((r) => ({
        user_id: uid, question_type: "vocab", question_id: r.id,
        is_correct: r.correct, user_answer: null, time_spent_seconds: null
      }));
      await supabase.from("gaokao_user_attempts").insert(attempts);
      for (const r of allResults) {
        const { data: ex } = await supabase.
        from("gaokao_user_mastery").
        select("id,correct_count,wrong_count,mastery_level").
        eq("user_id", uid).eq("item_type", "vocab").eq("item_id", r.id).
        maybeSingle();
        const cc = (ex?.correct_count ?? 0) + (r.correct ? 1 : 0);
        const wc = (ex?.wrong_count ?? 0) + (r.correct ? 0 : 1);
        const lvl = Math.min(4, Math.max(0, (ex?.mastery_level ?? 0) + (r.correct ? 1 : -1)));
        const payload: any = {
          correct_count: cc, wrong_count: wc, mastery_level: lvl,
          last_result: r.correct ? "correct" : "wrong",
          last_seen_at: new Date().toISOString()
        };
        if (ex) await supabase.from("gaokao_user_mastery").update(payload).eq("id", ex.id);else
        await supabase.from("gaokao_user_mastery").insert({
          user_id: uid, item_type: "vocab", item_id: r.id, ...payload
        });
      }
    } else {
      const table = seg === "primary" ? "primary_word_mastery" : "junior_word_mastery";
      for (const r of allResults) {
        const { data: ex } = await supabase.
        from(table as any).
        select("id,quiz_correct,quiz_wrong,mastery_level").
        eq("user_id", uid).eq("word_id", r.id).
        maybeSingle();
        const qc = ((ex as any)?.quiz_correct ?? 0) + (r.correct ? 1 : 0);
        const qw = ((ex as any)?.quiz_wrong ?? 0) + (r.correct ? 0 : 1);
        const lvl = Math.min(4, Math.max(0, ((ex as any)?.mastery_level ?? 0) + (r.correct ? 1 : -1)));
        const payload: any = {
          quiz_correct: qc, quiz_wrong: qw, mastery_level: lvl,
          last_seen_at: new Date().toISOString()
        };
        if (ex) await supabase.from(table as any).update(payload).eq("id", (ex as any).id);else
        await supabase.from(table as any).insert({
          user_id: uid, word_id: r.id, grade: Number(grade), ...payload
        });
      }
    }
  }

  if (loading || !meta) {
    return <main className="grid min-h-screen place-items-center text-sm text-muted-foreground"><T>加载题目中…</T></main>;
  }

  if (submitted && result) {
    const pct = Math.round(finalCorrect / questions.length * 100);
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-10">
        <div className={`rounded-3xl bg-gradient-to-br ${result.passed ? "from-emerald-400 to-teal-500" : "from-slate-400 to-slate-500"} p-8 text-center text-white shadow-tile`}>
          {result.passed ? <Trophy className="mx-auto size-16" /> : <Sparkles className="mx-auto size-16" />}
          <div className="mt-3 text-3xl font-extrabold">{result.passed ? "通关！" : "再接再厉"}</div>
          <div className="mt-2 text-5xl font-black">{pct}%</div>
          <div className="mt-1 text-sm opacity-90">{finalCorrect} / {questions.length} <T>正确</T></div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/20 p-3">
              <div className="text-[10px] uppercase tracking-wider opacity-80"><T>金币</T></div>
              <div className="text-2xl font-extrabold">+{result.coins_awarded}</div>
            </div>
            <div className="rounded-2xl bg-white/20 p-3">
              <div className="text-[10px] uppercase tracking-wider opacity-80"><T>宠物经验</T></div>
              <div className="text-2xl font-extrabold">+{result.exp_awarded}</div>
            </div>
          </div>
          {result.evolved && <div className="mt-3 text-base font-bold"><T>🎉 你的宠物进化了！</T></div>}
          {result.message && <div className="mt-3 text-xs opacity-90">{result.message}</div>}
        </div>
        <button
          onClick={() => nav(`/stage-tests/${segment}/${grade}`)}
          className="mt-5 w-full rounded-2xl bg-foreground py-3 font-extrabold text-background">
          <T>返回测试列表</T>
        
        </button>
      </main>);

  }

  const q = questions[idx];
  const progress = (idx + (picked ? 1 : 0)) / questions.length * 100;

  return (
    <main className="mx-auto min-h-screen max-w-xl px-5 py-6">
      <button onClick={() => nav(-1)} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> <T>退出</T>
      </button>
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{meta.title}</span>
        <span>{idx + 1} / {questions.length}</span>
      </div>
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-gradient-to-r from-sky-500 to-violet-500 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-sky-100 to-violet-100 p-8 text-center shadow-tile">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"><T>选出正确含义</T></div>
        <div className="mt-3 text-4xl font-extrabold">{q.word}</div>
        {q.isNew && <div className="mt-2 inline-block rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">NEW</div>}
      </div>

      <div className="mt-6 space-y-3">
        {q.options.map((opt) => {
          const isAnswer = opt === q.meaning_cn;
          const isPicked = picked === opt;
          let cls = "border-border bg-card hover:border-primary";
          if (picked) {
            if (isAnswer) cls = "border-emerald-500 bg-emerald-50";else
            if (isPicked) cls = "border-rose-500 bg-rose-50";else
            cls = "border-border bg-card opacity-60";
          }
          return (
            <button
              key={opt}
              onClick={() => pick(opt)}
              disabled={!!picked}
              className={`flex w-full items-center justify-between rounded-2xl border-2 p-4 text-left text-base font-semibold transition ${cls}`}>
              
              <span>{opt}</span>
              {picked && isAnswer && <Check className="size-5 text-emerald-600" />}
              {picked && isPicked && !isAnswer && <X className="size-5 text-rose-600" />}
            </button>);

        })}
      </div>
    </main>);

}