/**
 * 美语课程 · 通用答题引擎(关5/6/8/9/10 共用)。
 * - choice:选项 → 即时对错反馈 + 揭示正确项;每题一次作答,掌握靠多次游玩累积(答对2次)。
 * - reveal:句型转换/情景应答等开放题 → 显示参考答案 → 自评"答对/没答对"记掌握。
 * 每题作答回调 onAnswer(id,isCorrect) 由各关落库(american_user_mastery)。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, X, Volume2, ChevronRight } from "lucide-react";
import { T } from "@/i18n/T";
import { speakUS, unlockAmericanAudio, prewarmUS } from "@/lib/american/audio";
import type { AmericanQuestion } from "@/lib/american/data";

export type QuizItem =
  | { kind: "choice"; id: string; stem: string; options: string[]; answerIndex: number; explanation?: string; context?: string; audio?: string; passage?: string }
  | { kind: "reveal"; id: string; prompt: string; answer: string; explanation?: string };

/** american_questions → QuizItem(choice / reveal[transform·scenario])。 */
export function questionsToItems(qs: AmericanQuestion[]): QuizItem[] {
  return qs.map((q) =>
    q.qtype === "transform" || q.qtype === "scenario"
      ? { kind: "reveal", id: q.id, prompt: q.payload.stem, answer: q.payload.answer_text ?? "", explanation: q.payload.explanation_cn }
      // cloze 的 stem 只是"第N空",填空所在句在 payload.context(已含 ___ 标空);带出来给复习页显示。
      // 仅 cloze 显示 context;防将来听力/阅读题若挂 context(听力原文)被误显示而泄露答案。
      // audio:关10听力题要朗读的本课文本(题干只显示指令,不露 audio 文本)。
      // passage:关10阅读题在题目上方显示的本课课文(对着读作答)。
      : { kind: "choice", id: q.id, stem: q.payload.stem, options: q.payload.options ?? [], answerIndex: q.payload.answer_index ?? 0, explanation: q.payload.explanation_cn, context: q.qtype === "cloze" ? q.payload.context : undefined, audio: q.payload.audio, passage: q.payload.passage },
  );
}

/** 答题后「💡 点评」框(点评存 payload.explanation_cn,按 lesson×gp 共享)。 */
function ExplanationNote({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <p className="text-xs font-bold text-amber-700">💡 <T>点评</T></p>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-amber-900">{text}</p>
    </div>
  );
}

export function QuizRunner({
  items,
  onAnswer,
  onComplete,
  speakStem = false,
  header,
  suppressFinish = false,
}: {
  items: QuizItem[];
  onAnswer: (id: string, isCorrect: boolean) => void;
  onComplete: (scorePct: number, wrongIds: string[]) => void;
  /** choice 题干朗读(听力关用);reveal 参考答案总是可朗读。 */
  speakStem?: boolean;
  header?: React.ReactNode;
  /** 抑制内置结算屏,由父组件接管结算(关10 全对通关/重考用)。 */
  suppressFinish?: boolean;
}) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const wrongIdsRef = useRef<string[]>([]);

  const total = items.length;
  const item = items[idx];

  // 听力题:进关预热全部音频 → 点喇叭即命中缓存直接播。
  useEffect(() => {
    const auds = items.map((it) => (it.kind === "choice" ? it.audio : undefined)).filter(Boolean) as string[];
    if (auds.length) prewarmUS(auds);
  }, [items]);
  // 听力题:切到该题时自动朗读一次本课音频(桌面自动;iOS 需点喇叭)。
  useEffect(() => {
    if (item?.kind === "choice" && item.audio) void speakUS(item.audio);
  }, [idx, item]);

  const next = useCallback(() => {
    if (idx + 1 >= total) {
      setFinished(true);
      const pct = total ? Math.round((correctCount / total) * 100) : 0;
      onComplete(pct, wrongIdsRef.current.slice());
    } else {
      setIdx((i) => i + 1);
      setPicked(null);
      setRevealed(false);
    }
  }, [idx, total, correctCount, onComplete]);

  const answerChoice = useCallback((i: number) => {
    if (picked !== null || item.kind !== "choice") return;
    setPicked(i);
    const ok = i === item.answerIndex;
    if (ok) setCorrectCount((c) => c + 1);
    else wrongIdsRef.current.push(item.id);
    onAnswer(item.id, ok);
  }, [picked, item, onAnswer]);

  const selfGrade = useCallback((ok: boolean) => {
    if (item.kind !== "reveal") return;
    if (ok) setCorrectCount((c) => c + 1);
    else wrongIdsRef.current.push(item.id);
    onAnswer(item.id, ok);
    next();
  }, [item, onAnswer, next]);

  const pct = useMemo(() => (total ? Math.round((correctCount / total) * 100) : 0), [correctCount, total]);

  if (finished && suppressFinish) return null;
  if (finished) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-5xl">{pct >= 80 ? "🏆" : pct >= 60 ? "👍" : "💪"}</p>
        <h2 className="mt-3 text-xl font-bold text-slate-800"><T>本关完成!</T></h2>
        <p className="mt-1 text-sm text-slate-500">
          <T>答对</T> {correctCount}/{total} · {pct}%
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-4">
      {header}
      {/* 进度 */}
      <div className="mb-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${((idx) / total) * 100}%` }} />
        </div>
        <span className="text-xs font-semibold text-slate-400">{idx + 1}/{total}</span>
      </div>

      {item.kind === "choice" ? (
        <section>
          {/* 阅读题:题目上方显示本课课文,对着读作答(真·阅读理解) */}
          {item.passage && (
            <div className="mb-4 rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
              <p className="mb-1.5 text-xs font-bold text-sky-700">📖 <T>读课文</T></p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{item.passage}</p>
            </div>
          )}
          {/* 听力题:大喇叭播本课音频(题干只给指令,不露 audio 文本) */}
          {item.audio && (
            <div className="mb-5 flex flex-col items-center">
              <button type="button" aria-label="播放录音"
                onClick={() => { unlockAmericanAudio(); void speakUS(item.audio!); }}
                className="inline-flex size-16 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg transition hover:scale-105">
                <Volume2 className="size-7" />
              </button>
              <p className="mt-1.5 text-xs text-slate-400"><T>点击播放录音</T></p>
            </div>
          )}
          {/* cloze:填空所在对话/句子原句(context 已含 ___ 标出空位),让复习时也能看到填在哪 */}
          {item.context && (
            <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{item.context}</p>
            </div>
          )}
          <div className="mb-4 flex items-start gap-2">
            <p className="flex-1 text-lg font-semibold leading-relaxed text-slate-800">{item.stem}</p>
            {/* cloze 的 stem 是"第N空",朗读无意义 → 有 context(=cloze)时不显示朗读键;听力题用上方大喇叭 */}
            {speakStem && !item.context && !item.audio && (
              <button type="button" aria-label="朗读题干"
                onClick={() => { unlockAmericanAudio(); void speakUS(item.stem); }}
                className="mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                <Volume2 className="size-4" />
              </button>
            )}
          </div>
          <div className="grid gap-2.5">
            {item.options.map((opt, i) => {
              const isAns = i === item.answerIndex;
              const isPicked = picked === i;
              let cls = "border-slate-200 bg-white text-slate-700 hover:border-sky-300";
              if (picked !== null) {
                if (isAns) cls = "border-emerald-400 bg-emerald-50 text-emerald-700";
                else if (isPicked) cls = "border-rose-300 bg-rose-50 text-rose-600";
                else cls = "border-slate-200 bg-white text-slate-400";
              }
              return (
                <button key={i} type="button" disabled={picked !== null} onClick={() => answerChoice(i)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-[15px] transition ${cls}`}>
                  <span>{opt}</span>
                  {picked !== null && isAns && <Check className="size-4 shrink-0 text-emerald-600" />}
                  {picked !== null && isPicked && !isAns && <X className="size-4 shrink-0 text-rose-500" />}
                </button>
              );
            })}
          </div>
          {picked !== null && <ExplanationNote text={item.explanation} />}
          {picked !== null && (
            <button type="button" onClick={next}
              className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-sky-600 py-3 text-sm font-semibold text-white">
              {idx + 1 >= total ? <T>完成本关</T> : <><T>下一题</T> <ChevronRight className="size-4" /></>}
            </button>
          )}
        </section>
      ) : (
        <section>
          <p className="mb-4 text-lg font-semibold leading-relaxed text-slate-800">{item.prompt}</p>
          {!revealed ? (
            <button type="button" onClick={() => setRevealed(true)}
              className="inline-flex w-full items-center justify-center rounded-full border border-sky-300 bg-sky-50 py-3 text-sm font-semibold text-sky-700">
              <T>显示参考答案</T>
            </button>
          ) : (
            <>
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <span className="text-[15px] font-semibold text-emerald-800">{item.answer}</span>
                <button type="button" aria-label="朗读答案"
                  onClick={() => { unlockAmericanAudio(); void speakUS(item.answer); }}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Volume2 className="size-4" />
                </button>
              </div>
              <ExplanationNote text={item.explanation} />
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <button type="button" onClick={() => selfGrade(false)}
                  className="rounded-full border border-slate-200 py-3 text-sm font-semibold text-slate-500">
                  <T>没答对</T>
                </button>
                <button type="button" onClick={() => selfGrade(true)}
                  className="rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white">
                  <T>我答对了</T>
                </button>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
