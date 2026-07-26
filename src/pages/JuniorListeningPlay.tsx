import { sanitizeReturnTo } from "@/lib/returnTo";
import { T } from "@/i18n/T";import { useEffect, useRef, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { withJuniorPublisher, type JuniorPublisher } from "@/lib/juniorHub/publisher";
import { ArrowLeft, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { speak, speakFromUrl, stopSpeaking, prefetchTTS } from "@/lib/speak";
import { awardForCorrect, notifyWrong, awardForBlock } from "@/lib/coins";
import { bumpPetSkill } from "@/lib/petSkills";
import { celebrateScore } from "@/lib/feedback";
import { ShareButton } from "@/components/share/ShareButton";
import { useRegisterAssistant } from "@/contexts/AIAssistantContext";
import { recordUnifiedAttempt } from "@/hooks/useRecordAttempt";
import { recordZoneMistake, answerToIdx } from "@/lib/recordZoneMistake";
import { recordMastery } from "@/lib/masteryProgress";

type Q = {type?: "choice" | "fill" | "judge";q: string;options: string[];answer: string;explanation?: string;};
type E = {id: string;title: string;transcript: string;translation_cn: string | null;questions: Q[];key_vocab: {word: string;cn: string;}[];audio_url: string | null;kind?: string | null;grade?: number | null;publisher?: string;};

export default function JuniorListeningPlay() {
  const { id } = useParams<{id: string;}>();
  // 从单元Hub听力关进入时带 ?returnTo=<hub关URL>;有则返回出口回 Hub关(而非听力专区列表)。
  const [searchParams] = useSearchParams();
  const returnTo = sanitizeReturnTo(searchParams.get("returnTo"));   // 站内校验:防 ?returnTo=https://evil 被塞进 <Link to>
  const [e, setE] = useState<E | null>(null);
  // 当前听力所属出版社 → 所有 /junior 跳转带上,防外研社听力翻到人教(returnTo 来自 Hub 原样)。
  const pub: JuniorPublisher = e?.publisher === "junior_fltrp" ? "fltrp" : "pep";
  const [picks, setPicks] = useState<Record<number, string>>({});
  const [fills, setFills] = useState<Record<number, string>>({});
  const [showScript, setShowScript] = useState(false);
  const [streak, setStreak] = useState(0);
  const shownAt = useRef<Record<number, number>>({});

  const checkAnswer = (q: Q, value: string) => {
    if (q.type === "fill") return value.trim().toLowerCase() === String(q.answer).trim().toLowerCase();
    return value === q.answer;
  };

  // Full-test lock: AI may only discuss the listening once every question is answered.
  const allAnswered = !!e && e.questions.length > 0 && e.questions.every((_, i) => picks[i] || fills[i]);
  useRegisterAssistant(
    e ?
    {
      context: "junior_listening",
      ref: e.id,
      topic: `初中听力 · ${e.title}`,
      mode: "full-test",
      unlocked: allAnswered,
      lockedHint: "请先把所有听力题做完再来找我答疑哦 ✨",
      pageTitle: "💬 小月 · 听力复盘",
      snapshot: allAnswered ?
      {
        title: e.title,
        transcript_excerpt: e.transcript?.slice(0, 1200),
        key_vocab: e.key_vocab?.slice(0, 12),
        questions: e.questions.map((q, i) => ({
          index: i + 1,
          type: q.type ?? "choice",
          stem: q.q,
          options: q.options,
          correct_answer: q.answer,
          user_answer: picks[i] ?? fills[i],
          is_correct: !!(picks[i] ?? fills[i]) && checkAnswer(q, (picks[i] ?? fills[i])!),
          explanation: q.explanation
        }))
      } :
      undefined
    } :
    null
  );

  // 全部答完 → 写一行 per-exercise 掌握度(mastery_progress, module="junior_listening")
  // 供单元听力关卡片显示状态/最高分(镜像阅读)。once-guard 防重复写;returnTo 与专区直接进入都写。
  const masteryWrittenRef = useRef(false);
  useEffect(() => {
    if (!e || !id || !allAnswered || masteryWrittenRef.current) return;
    masteryWrittenRef.current = true;
    const correct = e.questions.filter((q, i) => {
      const v = picks[i] ?? fills[i];
      return v != null && checkAnswer(q, v as string);
    }).length;
    const pct = Math.round((correct / e.questions.length) * 100);
    recordMastery({ module: "junior_listening", itemId: id, pct }).catch(() => {});
  }, [e, id, allAnswered]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!id) return;
    (supabase as any).from("junior_listening_exercises").
    select("id,title,transcript,translation_cn,questions,key_vocab,audio_url,kind,grade,publisher").
    eq("id", id).maybeSingle().then(({ data }: any) => setE(data as any));
  }, [id]);

  // P2 预热:仅当无预生成 audio_url 时,按网络预热原文音频(键与 speak(e.transcript) 一致,
  // 默认音色)→ 点"播放"首播秒响,消除整段冷合成 1-3s。有 audio_url 者走 speakFromUrl 直取 CDN,不需预热。
  useEffect(() => { if (e && !e.audio_url && e.transcript) prefetchTTS(e.transcript); }, [e]);

  const playAudio = () => {
    if (!e) return;
    // 走 speakFromUrl(被 speak.ts 的 currentAudio 追踪):再点自动停旧→不叠加;
    // 路由切换时全局 StopAudioOnRouteChange 的 stopSpeaking() 能停掉它(裸 new Audio 停不掉)。
    if (e.audio_url) {
      speakFromUrl(e.audio_url);
    } else {
      speak(e.transcript);
    }
  };

  // 卸载时停音频(双保险:覆盖 SPA 同路径切换等全局 StopAudioOnRouteChange 漏掉的边角)。
  useEffect(() => () => stopSpeaking(), []);

  const pick = async (idx: number, letter: string) => {
    if (picks[idx]) return;
    setPicks((p) => ({ ...p, [idx]: letter }));
    if (!shownAt.current[idx]) shownAt.current[idx] = Date.now() - 1500;
    const ok = checkAnswer(e!.questions[idx], letter);
    const { data: u } = await supabase.auth.getUser();
    if (u?.user) {
      await (supabase as any).from("junior_listening_attempts").insert({
        user_id: u.user.id, exercise_id: id!, question_idx: idx,
        user_answer: letter, is_correct: ok
      });
    }
    if (ok) {
      const next = streak + 1;setStreak(next);
      const ms = Date.now() - shownAt.current[idx];
      await awardForCorrect(next, "junior_listening", `${id}:${idx}`, "junior_listening", ms);
      await bumpPetSkill("listener_ear", 1);
      const correctCount = Object.entries(picks).filter(([i, l]) => checkAnswer(e!.questions[Number(i)], l)).length + 1;
      if (correctCount % 5 === 0) await awardForBlock("junior_listening");
    } else {setStreak(0);notifyWrong();}
    recordUnifiedAttempt({
      stage: "junior",
      grade: 7,
      module: "listening",
      item_type: "listening_question",
      item_id: `${id}:${idx}`,
      item_label: e?.title,
      is_correct: ok,
      user_answer: letter,
      correct_answer: String(e!.questions[idx].answer),
      context: { exercise_id: id, question_idx: idx, explanation: e!.questions[idx].explanation }
    }).catch(() => {});
    // 额外:完整快照写统一错题本(题干+全选项+音频+作答),做对自动移出。纯新增,失败只 warn。
    if (e) {
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
        audioUrl: e.audio_url,
        explanation: q.explanation,
        sourceLabel: e.title,
      });
    }
    // If this was the last question answered, celebrate
    if (e && Object.keys(picks).length + 1 >= e.questions.length) {
      const updated = { ...picks, [idx]: letter };
      const correct = e.questions.filter((q, i) => updated[i] && checkAnswer(q, updated[i])).length;
      const pct = Math.round(correct / e.questions.length * 100);
      setTimeout(() => celebrateScore(pct), 400);
    } else if (e && idx + 1 < e.questions.length) {
      // 答完非最后一题 → 滚到下一题(延时让 ✓/✗ 反馈先渲染、给学生一拍看对错)。
      setTimeout(() => {
        document
          .querySelector(`[data-qidx="${idx + 1}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 450);
    }
  };

  if (!e) return <main className="grid min-h-screen place-items-center text-sm text-muted-foreground"><T>加载中…</T></main>;

  // 从 Hub 单元关进入(returnTo):全部答完→极简完成态 + 返回单元(带 ?done=1 标记本关通过)。
  // 复用上方已有的 allAnswered(line 36,兼顾 picks+fills)。
  if (returnTo && allAnswered) {
    const lisCorrect = e.questions.filter((q, i) => (picks[i] ?? fills[i]) != null && checkAnswer(q, (picks[i] ?? fills[i]) as string)).length;
    return (
      <main className="grid min-h-screen place-items-center px-6 text-center">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm dark:bg-card">
          <div className="text-4xl">✅</div>
          <p className="mt-3 text-lg font-extrabold text-foreground">
            <T>完成！答对</T> {lisCorrect} / {e.questions.length} <T>题</T>
          </p>
          <Link
            to={returnTo}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 py-3 text-sm font-semibold text-white"
          >
            <T>返回单元</T> →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-6">
      <BackLink to={returnTo ?? withJuniorPublisher(e?.grade ? `/junior/listening?grade=${e.grade}` : "/junior/listening", pub)} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> <T>{returnTo ? "返回单元" : "返回"}</T></BackLink>
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-grad-title text-2xl font-extrabold">{e.title}</h1>
        <ShareButton
          variant="icon"
          item={{
            type: "listening",
            title: e.title,
            topic: (e as any).topic ?? undefined,
            duration: (e as any).duration_sec ?? undefined,
            url: typeof window !== "undefined" ? window.location.href : ""
          }} />
        
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4">
        <button onClick={playAudio} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 px-4 py-2 text-sm font-extrabold text-white shadow-tile">
          <Volume2 className="size-4" /> <T>播放</T>
        </button>
        <button onClick={() => setShowScript((s) => !s)} className="rounded-full border-2 border-border px-3 py-1.5 text-xs font-bold">
          {showScript ? "隐藏原文" : "查看原文"}
        </button>
        <span className="text-[11px] text-muted-foreground"><T>建议先听 2 遍再答题</T></span>
      </div>
      {showScript &&
      <div className="mt-3 rounded-2xl bg-muted/40 p-4 text-sm leading-relaxed">
          <div className="whitespace-pre-wrap">{e.transcript}</div>
          {e.translation_cn && <div className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">{e.translation_cn}</div>}
        </div>
      }
      {e.key_vocab?.length > 0 &&
      <div className="mt-4 rounded-xl bg-muted/40 p-3">
          <div className="text-[11px] font-extrabold text-muted-foreground"><T>📚 核心词</T></div>
          <div className="mt-1 flex flex-wrap gap-2 text-xs">
            {e.key_vocab.map((v, i) => <span key={i} className="rounded-full bg-card px-2 py-0.5 border">{v.word} · {v.cn}</span>)}
          </div>
        </div>
      }

      <h2 className="mt-6 mb-3 text-base font-extrabold"><T>📝 听力理解</T> <span className="ml-2 text-[11px] font-normal text-muted-foreground"><T>共</T> {e.questions.length} <T>题</T></span></h2>
      <div className="space-y-4">
        {e.questions.map((q, i) => {
          const picked = picks[i];
          const qType = q.type || "choice";
          return (
            <section key={i} data-qidx={i} className="rounded-2xl border bg-card p-4">
              <div className="text-sm font-bold flex items-start gap-2">
                <span>{i + 1}.</span>
                <span className="flex-1">{q.q}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-extrabold text-muted-foreground">
                  {qType === "fill" ? "填空" : qType === "judge" ? "判断" : "选择"}
                </span>
              </div>
              {qType === "fill" ?
              <div className="mt-3 flex gap-2">
                  <input
                  disabled={!!picked}
                  value={fills[i] ?? ""}
                  onChange={(ev) => setFills((f) => ({ ...f, [i]: ev.target.value }))}
                  onKeyDown={(ev) => {if (ev.key === "Enter" && (fills[i] ?? "").trim()) pick(i, fills[i].trim());}}
                  placeholder="输入答案 (按回车确认)"
                  className="flex-1 rounded-xl border-2 border-border bg-background px-3 py-2 text-sm focus:border-sky-400 focus:outline-none" />
                
                  <button
                  disabled={!!picked || !(fills[i] ?? "").trim()}
                  onClick={() => pick(i, (fills[i] ?? "").trim())}
                  className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-extrabold text-white disabled:opacity-50"><T>提交</T>
                </button>
                </div> :

              <div className="mt-3 grid gap-2">
                {q.options.map((opt, oi) => {
                  const L = ["A", "B", "C", "D"][oi];
                  const isAns = picked && L === q.answer;
                  const isWrong = picked === L && L !== q.answer;
                  return (
                    <button key={L} disabled={!!picked} onClick={() => pick(i, L)}
                    className={cn("flex items-center rounded-xl border-2 px-3 py-2 text-left text-sm transition",
                    !picked && "border-border hover:border-sky-400",
                    isAns && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
                    isWrong && "border-rose-500 bg-rose-50 dark:bg-rose-950/30",
                    picked && !isAns && !isWrong && "opacity-60")}>
                      <span className="mr-2 font-extrabold">{L}.</span>
                      <span className="flex-1">{opt}</span>
                      {isAns && <span className="ml-2 shrink-0 text-base font-extrabold text-emerald-600">✓</span>}
                      {isWrong && <span className="ml-2 shrink-0 text-base font-extrabold text-rose-600">✗</span>}
                    </button>);

                })}
              </div>
              }
              {picked && qType !== "fill" &&
              <div className={cn("mt-3 rounded-lg px-3 py-2 text-sm font-bold",
                checkAnswer(q, picked)
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300")}>
                  {checkAnswer(q, picked)
                  ? "✨ 答对了！"
                  : `💡 正确答案：${q.answer}. ${q.options[["A", "B", "C", "D"].indexOf(q.answer)] ?? ""}`}
                </div>
              }
              {picked && qType === "fill" &&
              <div className={cn("mt-2 text-xs font-bold", checkAnswer(q, picked) ? "text-emerald-600" : "text-rose-600")}>
                  {checkAnswer(q, picked) ? "✓ 正确" : `✗ 你的答案：${picked} · 正确答案：${q.answer}`}
                </div>
              }
              {picked && q.explanation && <div className="mt-3 rounded-lg bg-muted/50 p-3 text-xs">💡 {q.explanation}</div>}
            </section>);

        })}
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 border-t pt-5">
        <BackLink to={returnTo ?? withJuniorPublisher(e?.grade ? `/junior/listening?grade=${e.grade}` : "/junior/listening", pub)} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground shadow"><ArrowLeft className="size-4" /> <T>{returnTo ? "返回单元" : "返回听力列表"}</T></BackLink>
        <Link to={withJuniorPublisher("/junior", pub)} className="inline-flex items-center gap-1 rounded-full border-2 px-4 py-2 text-sm font-bold hover:bg-muted"><T>🏫 初中首页</T></Link>
      </div>
    </main>);

}