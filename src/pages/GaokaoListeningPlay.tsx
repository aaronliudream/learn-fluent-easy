import { T } from "@/i18n/T";
import { useEffect, useRef, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { speak, prefetchTTS } from "@/lib/speak";
import { awardForCorrect, notifyWrong, awardForBlock } from "@/lib/coins";
import { bumpPetSkill } from "@/lib/petSkills";
import { celebrateScore } from "@/lib/feedback";
import { useRegisterAssistant } from "@/contexts/AIAssistantContext";
import { recordUnifiedAttempt } from "@/hooks/useRecordAttempt";
import { recordZoneMistake, answerToIdx } from "@/lib/recordZoneMistake";
import { getListeningExerciseById, type GaokaoListeningExercise, type GaokaoListeningQuestion } from "@/lib/gaokaoContent";

export default function GaokaoListeningPlay() {
  const { id } = useParams<{ id: string }>();
  const [e, setE] = useState<GaokaoListeningExercise | null>(null);
  const [picks, setPicks] = useState<Record<number, string>>({});
  const [showScript, setShowScript] = useState(false);
  const [streak, setStreak] = useState(0);
  const shownAt = useRef<Record<number, number>>({});

  const checkAnswer = (q: GaokaoListeningQuestion, value: string) => value === q.answer;

  const allAnswered = !!e && e.questions.length > 0 && e.questions.every((_, i) => picks[i]);
  useRegisterAssistant(
    e
      ? {
          context: "gaokao_listening",
          ref: e.id,
          topic: `高中听力 · ${e.title}`,
          mode: "full-test",
          unlocked: allAnswered,
          lockedHint: "请先把所有听力题做完再来找我答疑哦 ✨",
          pageTitle: "💬 小月 · 听力复盘",
          snapshot: allAnswered
            ? {
                title: e.title,
                transcript_excerpt: e.transcript?.slice(0, 1200),
                key_vocab: e.key_vocab?.slice(0, 12),
                questions: e.questions.map((q, i) => ({
                  index: i + 1,
                  type: q.type ?? "choice",
                  stem: q.q,
                  options: q.options,
                  correct_answer: q.answer,
                  user_answer: picks[i],
                  is_correct: !!picks[i] && checkAnswer(q, picks[i]!),
                  explanation: q.explanation,
                })),
              }
            : undefined,
        }
      : null,
  );

  useEffect(() => {
    if (!id) return;
    setE(getListeningExerciseById(id));
  }, [id]);

  // P2 预热:载入即按网络预热本题听力原文音频,键与 speak(e.transcript) 一致(默认音色)。
  // 首点"播放"秒响,消除整段冷合成 1-3s;prefetchTTS 纯网络,不碰 <audio>。
  useEffect(() => { if (e?.transcript) prefetchTTS(e.transcript); }, [e]);

  const playAudio = () => {
    if (!e) return;
    speak(e.transcript);
  };

  const pick = async (idx: number, letter: string) => {
    if (picks[idx] || !e) return;
    setPicks((p) => ({ ...p, [idx]: letter }));
    if (!shownAt.current[idx]) shownAt.current[idx] = Date.now() - 1500;
    const ok = checkAnswer(e.questions[idx], letter);
    if (ok) {
      const next = streak + 1;
      setStreak(next);
      const ms = Date.now() - shownAt.current[idx];
      await awardForCorrect(next, "gaokao_listening", `${id}:${idx}`, "gaokao_listening", ms);
      await bumpPetSkill("listener_ear", 1);
      const correctCount =
        Object.entries(picks).filter(([i, l]) => checkAnswer(e.questions[Number(i)], l)).length + 1;
      if (correctCount % 5 === 0) await awardForBlock("gaokao_listening");
    } else {
      setStreak(0);
      notifyWrong();
    }
    recordUnifiedAttempt({
      stage: "senior",
      grade: 10 + (e.year_band - 1),
      module: "listening",
      item_type: "listening_question",
      item_id: `${id}:${idx}`,
      item_label: e.title,
      is_correct: ok,
      user_answer: letter,
      correct_answer: String(e.questions[idx].answer),
      context: { exercise_id: id, question_idx: idx, explanation: e.questions[idx].explanation },
    }).catch(() => {});
    // 额外:完整快照写统一错题本(题干+全选项+音频+作答),做对自动移出。纯新增,失败只 warn。
    {
      const q = e.questions[idx];
      void recordZoneMistake({
        module: "hub_listening",
        sourceKeyBase: `${id}:${idx}`,
        isCorrect: ok,
        stem: q.q,
        options: q.options,
        correctIdx: answerToIdx(q.answer, q.options),
        pickedIdx: answerToIdx(letter, q.options),
        audio: e.transcript,
        explanation: q.explanation,
        sourceLabel: e.title,
      });
    }
    if (Object.keys(picks).length + 1 >= e.questions.length) {
      const updated = { ...picks, [idx]: letter };
      const correct = e.questions.filter((q, i) => updated[i] && checkAnswer(q, updated[i])).length;
      const pct = Math.round((correct / e.questions.length) * 100);
      setTimeout(() => celebrateScore(pct), 400);
    }
  };

  if (!e) {
    return (
      <main className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        <T>加载中…</T>
      </main>
    );
  }

  const backHref = `/gaokao/listening?year_band=${e.year_band}`;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-6">
      <BackLink
        to={backHref}
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> <T>返回</T>
      </BackLink>
      <h1 className="text-grad-title text-2xl font-extrabold">{e.title}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4">
        <button
          onClick={playAudio}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 px-4 py-2 text-sm font-extrabold text-white shadow-tile"
        >
          <Volume2 className="size-4" /> <T>播放（TTS）</T>
        </button>
        <button
          onClick={() => setShowScript((s) => !s)}
          className="rounded-full border-2 border-border px-3 py-1.5 text-xs font-bold"
        >
          {showScript ? "隐藏原文" : "查看原文"}
        </button>
        <span className="text-[11px] text-muted-foreground">
          <T>教材课文节选 · 无原版录音</T>
        </span>
      </div>
      {showScript && (
        <div className="mt-3 rounded-2xl bg-muted/40 p-4 text-sm leading-relaxed">
          <div className="whitespace-pre-wrap">{e.transcript}</div>
          {e.translation_cn && (
            <div className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">{e.translation_cn}</div>
          )}
        </div>
      )}

      <h2 className="mb-3 mt-6 text-base font-extrabold">
        <T>📝 听力理解</T>{" "}
        <span className="ml-2 text-[11px] font-normal text-muted-foreground">
          <T>共</T> {e.questions.length} <T>题</T>
        </span>
      </h2>
      <div className="space-y-4">
        {e.questions.map((q, i) => {
          const picked = picks[i];
          return (
            <section key={i} className="rounded-2xl border bg-card p-4">
              <div className="flex items-start gap-2 text-sm font-bold">
                <span>{i + 1}.</span>
                <span className="flex-1">{q.q}</span>
              </div>
              <div className="mt-3 grid gap-2">
                {q.options.map((opt, oi) => {
                  const L = ["A", "B", "C", "D"][oi];
                  const isAns = picked && L === q.answer;
                  const isWrong = picked === L && L !== q.answer;
                  return (
                    <button
                      key={L}
                      disabled={!!picked}
                      onClick={() => pick(i, L)}
                      className={cn(
                        "rounded-xl border-2 px-3 py-2 text-left text-sm transition",
                        !picked && "border-border hover:border-sky-400",
                        isAns && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
                        isWrong && "border-rose-500 bg-rose-50 dark:bg-rose-950/30",
                        picked && !isAns && !isWrong && "opacity-60",
                      )}
                    >
                      <span className="mr-2 font-extrabold">{L}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {picked && q.explanation && (
                <div className="mt-3 rounded-lg bg-muted/50 p-3 text-xs">💡 {q.explanation}</div>
              )}
            </section>
          );
        })}
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 border-t pt-5">
        <BackLink
          to={backHref}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground shadow"
        >
          <ArrowLeft className="size-4" /> <T>返回听力列表</T>
        </BackLink>
        <Link to="/gaokao" className="inline-flex items-center gap-1 rounded-full border-2 px-4 py-2 text-sm font-bold hover:bg-muted">
          <T>🏫 高中首页</T>
        </Link>
      </div>
    </main>
  );
}
