/**
 * 美语课程 · 通用答题引擎(关5/6/8/9/10 共用)。
 * - choice:选项 → 即时对错反馈 + 揭示正确项;每题一次作答,掌握靠多次游玩累积(答对2次)。
 * - reveal:句型转换/情景应答等开放题 → 显示参考答案 → 自评"答对/没答对"记掌握。
 * 每题作答回调 onAnswer(id,isCorrect) 由各关落库(american_user_mastery)。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, X, Volume2, ChevronRight, ChevronLeft } from "lucide-react";
import { T } from "@/i18n/T";
import { speakUS, unlockAmericanAudio, prewarmUS } from "@/lib/american/audio";
import type { AmericanQuestion } from "@/lib/american/data";

export type QuizItem =
  | { kind: "choice"; id: string; stem: string; options: string[]; answerIndex: number; explanation?: string; stemCn?: string; context?: string; audio?: string; passage?: string }
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
      : { kind: "choice", id: q.id, stem: q.payload.stem, options: q.payload.options ?? [], answerIndex: q.payload.answer_index ?? 0, explanation: q.payload.explanation_cn, stemCn: q.payload.stem_cn, context: q.qtype === "cloze" ? q.payload.context : undefined, audio: q.payload.audio, passage: q.payload.passage },
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
  // maxIdx=已到达的最前沿(=当前正在作答的题);idx<maxIdx 即"回看已答题"(只读)。
  const [maxIdx, setMaxIdx] = useState(0);
  // 每题作答记录:choice 存所选项 picked;reveal 存自评 selfOk。存在=已答,回看时据此只读复现。
  const [records, setRecords] = useState<Record<number, { picked?: number; selfOk?: boolean }>>({});
  const [revealed, setRevealed] = useState(false); // reveal 题:前沿题是否已"显示参考答案"(回看题强制显示)
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const wrongIdsRef = useRef<string[]>([]);

  const total = items.length;
  const item = items[idx];
  const rec = records[idx];
  const answered = rec !== undefined;
  const reviewing = idx < maxIdx;          // 回看模式:只读,不计分、不改掌握
  const picked = rec?.picked ?? null;      // choice 当前(或历史)所选
  const showAnswer = reviewing || revealed; // reveal 题是否展示答案

  // 听力题:进关预热全部音频 → 点喇叭即命中缓存直接播。
  useEffect(() => {
    const auds = items.map((it) => (it.kind === "choice" ? it.audio : undefined)).filter(Boolean) as string[];
    if (auds.length) prewarmUS(auds);
  }, [items]);
  // 听力题:切到该题时自动朗读一次本课音频(桌面自动;iOS 需点喇叭)。
  useEffect(() => {
    if (item?.kind === "choice" && item.audio) void speakUS(item.audio);
  }, [idx, item]);

  const prev = useCallback(() => {
    if (idx === 0) return;
    unlockAmericanAudio(); // 手势栈顶同步解锁,回看听力题切题自动重播不被 iOS 静音
    setIdx((i) => i - 1);
  }, [idx]);

  const next = useCallback(() => {
    unlockAmericanAudio();
    if (idx < maxIdx) { setIdx((i) => i + 1); return; } // 回看中前进:仅移动光标,不计分/不结算
    if (idx + 1 >= total) {                              // 前沿最后一题:结算
      setFinished(true);
      const pct = total ? Math.round((correctCount / total) * 100) : 0;
      onComplete(pct, wrongIdsRef.current.slice());
    } else {                                             // 前沿推进到新题
      setMaxIdx((m) => Math.max(m, idx + 1));
      setIdx((i) => i + 1);
      setRevealed(false);
    }
  }, [idx, maxIdx, total, correctCount, onComplete]);

  const answerChoice = useCallback((i: number) => {
    if (item.kind !== "choice") return;
    if (answered || idx !== maxIdx) return; // 已答或回看态:禁止作答(防刷分/防改答)
    const ok = i === item.answerIndex;
    setRecords((r) => ({ ...r, [idx]: { picked: i } }));
    if (ok) setCorrectCount((c) => c + 1);
    else wrongIdsRef.current.push(item.id);
    onAnswer(item.id, ok);
  }, [item, answered, idx, maxIdx, onAnswer]);

  const selfGrade = useCallback((ok: boolean) => {
    if (item.kind !== "reveal") return;
    if (answered || idx !== maxIdx) return; // 已评或回看态:不可重评
    setRecords((r) => ({ ...r, [idx]: { selfOk: ok } }));
    if (ok) setCorrectCount((c) => c + 1);
    else wrongIdsRef.current.push(item.id);
    next();
  }, [item, answered, idx, maxIdx, next]);

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
          {/* 进度按前沿 maxIdx 计:回看已答题不会让进度条倒退 */}
          <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${(maxIdx / total) * 100}%` }} />
        </div>
        <span className="text-xs font-semibold text-slate-400">
          {reviewing ? <span className="text-amber-500"><T>回看</T> {idx + 1}/{total}</span> : `${idx + 1}/${total}`}
        </span>
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
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-base transition ${cls}`}>
                  <span>{opt}</span>
                  {picked !== null && isAns && <Check className="size-4 shrink-0 text-emerald-600" />}
                  {picked !== null && isPicked && !isAns && <X className="size-4 shrink-0 text-rose-500" />}
                </button>
              );
            })}
          </div>
          {/* ④ 句型题答对后显示"填入正确答案后整句"的中文翻译(在💡点评上方;无 stem_cn 则不显示) */}
          {picked !== null && item.stemCn && (
            <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50/70 px-4 py-2.5">
              <p className="text-sm leading-relaxed text-slate-700">🇨🇳 {item.stemCn}</p>
            </div>
          )}
          {picked !== null && <ExplanationNote text={item.explanation} />}
        </section>
      ) : (
        <section>
          <p className="mb-4 text-lg font-semibold leading-relaxed text-slate-800">{item.prompt}</p>
          {!showAnswer ? (
            <button type="button" onClick={() => setRevealed(true)}
              className="inline-flex w-full items-center justify-center rounded-full border border-sky-300 bg-sky-50 py-3 text-sm font-semibold text-sky-700">
              <T>显示参考答案</T>
            </button>
          ) : (
            <>
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <span className="text-base font-semibold text-emerald-800">{item.answer}</span>
                <button type="button" aria-label="朗读答案"
                  onClick={() => { unlockAmericanAudio(); void speakUS(item.answer); }}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Volume2 className="size-4" />
                </button>
              </div>
              <ExplanationNote text={item.explanation} />
              {reviewing ? (
                // 回看态:只读展示当时的自评结果,不能重评(防刷分)
                <div className={`mt-4 rounded-full py-3 text-center text-sm font-semibold ${rec?.selfOk ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {rec?.selfOk ? <T>当时:我答对了</T> : <T>当时:没答对</T>}
                </div>
              ) : (
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
              )}
            </>
          )}
        </section>
      )}

      {/* 底部导航:上一题(回看)/下一题。首题禁用上一题;当前题未作答时禁用下一题(reveal 靠自评推进) */}
      <div className="mt-5 flex items-center gap-3">
        <button type="button" onClick={prev} disabled={idx === 0}
          className={`inline-flex items-center justify-center gap-1 rounded-full border px-5 py-3 text-sm font-semibold transition ${
            idx === 0 ? "cursor-not-allowed border-slate-100 text-slate-300" : "border-slate-200 text-slate-500 hover:border-slate-300"
          }`}>
          <ChevronLeft className="size-4" /> <T>上一题</T>
        </button>
        <button type="button" onClick={next} disabled={!answered}
          className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full py-3 text-sm font-semibold transition ${
            answered ? "bg-sky-600 text-white" : "cursor-not-allowed bg-slate-100 text-slate-300"
          }`}>
          {idx + 1 >= total && !reviewing ? <T>完成本关</T> : <><T>下一题</T> <ChevronRight className="size-4" /></>}
        </button>
      </div>
    </div>
  );
}
