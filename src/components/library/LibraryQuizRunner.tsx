/**
 * 图书馆词库复习 · 答题引擎(fork 自 src/components/american/QuizRunner.tsx)。
 * 红线:不动 american 原件(共享组件);此为图书馆独立副本,把硬编的 speakUS 换成图书馆 speak。
 * v1 只用 choice(英译中/中译英/用法填空全塌缩到 choice item);reveal/audio 路径为 v2(听音选义)预留。
 * onAnswer 多回一个 pickedIndex,供父组件写错题快照。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRevealScroll } from "@/lib/useRevealScroll";
import { Check, X, Volume2, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { T } from "@/i18n/T";
import { speak, unlockAudioSync, prefetchTTSBatch } from "@/lib/speak";

export type QuizItem =
  | { kind: "choice"; id: string; stem: string; options: string[]; answerIndex: number; explanation?: string; stemCn?: string; context?: string; audio?: string; passage?: string; term?: string; ipa?: string }
  | { kind: "reveal"; id: string; prompt: string; answer: string; explanation?: string };

/**
 * 复习词/语块的发音按钮(复用点词那套 speak TTS)。单词、短语都可读。
 * 修「点3次才响」:首次冷合成有 loading 反馈 + 合成中禁用,避免用户以为没响而重复点(重复点会撞 speak 的
 * pendingColdKey 去抖被吞)。配合 Runner 在题目加载时预热 TTS,通常点一次即命中缓存、瞬间出声。
 */
function SpeakButton({ text, size = "sm" }: { text: string; size?: "sm" | "lg" }) {
  const [loading, setLoading] = useState(false);
  const onClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    unlockAudioSync();
    setLoading(true);
    void speak(text, { accent: "US" }).finally(() => setLoading(false));
  }, [text]);
  const box = size === "lg" ? "size-9" : "size-8";
  const icon = size === "lg" ? "size-4" : "size-3.5";
  return (
    <button
      type="button"
      aria-label="朗读"
      disabled={loading}
      onClick={onClick}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600 transition hover:bg-sky-200 disabled:opacity-70 ${box}`}
    >
      {loading ? <Loader2 className={`${icon} animate-spin`} /> : <Volume2 className={icon} />}
    </button>
  );
}

function ExplanationNote({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <p className="text-xs font-bold text-amber-700">💡 <T>点评</T></p>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-amber-900">{text}</p>
    </div>
  );
}

export function LibraryQuizRunner({
  items,
  onAnswer,
  onComplete,
  speakStem = false,
  header,
  suppressFinish = false,
}: {
  items: QuizItem[];
  onAnswer: (id: string, isCorrect: boolean, pickedIndex?: number) => void;
  onComplete: (scorePct: number, wrongIds: string[]) => void;
  speakStem?: boolean;
  header?: React.ReactNode;
  suppressFinish?: boolean;
}) {
  const [idx, setIdx] = useState(0);
  const [maxIdx, setMaxIdx] = useState(0);
  const [records, setRecords] = useState<Record<number, { picked?: number; selfOk?: boolean }>>({});
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const wrongIdsRef = useRef<string[]>([]);

  const total = items.length;
  const item = items[idx];
  const rec = records[idx];
  const answered = rec !== undefined;
  // 选完答案后把操作区滚进视口(手机上它常在选项下方屏外)
  const navRef = useRevealScroll<HTMLDivElement>(answered);
  const reviewing = idx < maxIdx;
  const picked = rec?.picked ?? null;
  const showAnswer = reviewing || revealed;

  useEffect(() => {
    // 预热 TTS:听力音频 + 每题被复习的词/短语(term)+ reveal 答案。题目加载时后台合成,
    // 用户点 🔊 时通常已在缓存 → 手势内瞬间出声,不再冷合成"点3次"。
    const warm = new Set<string>();
    for (const it of items) {
      if (it.kind === "choice") { if (it.audio) warm.add(it.audio); if (it.term) warm.add(it.term); }
      else if (it.kind === "reveal" && it.answer) warm.add(it.answer);
    }
    if (warm.size) prefetchTTSBatch([...warm], { accent: "US" });
  }, [items]);
  useEffect(() => {
    if (item?.kind === "choice" && item.audio) void speak(item.audio, { accent: "US" });
  }, [idx, item]);

  const prev = useCallback(() => {
    if (idx === 0) return;
    unlockAudioSync();
    setIdx((i) => i - 1);
  }, [idx]);

  const next = useCallback(() => {
    unlockAudioSync();
    if (idx < maxIdx) { setIdx((i) => i + 1); return; }
    if (idx + 1 >= total) {
      setFinished(true);
      const pct = total ? Math.round((correctCount / total) * 100) : 0;
      onComplete(pct, wrongIdsRef.current.slice());
    } else {
      setMaxIdx((m) => Math.max(m, idx + 1));
      setIdx((i) => i + 1);
      setRevealed(false);
    }
  }, [idx, maxIdx, total, correctCount, onComplete]);

  const answerChoice = useCallback((i: number) => {
    if (item.kind !== "choice") return;
    if (answered || idx !== maxIdx) return;
    const ok = i === item.answerIndex;
    setRecords((r) => ({ ...r, [idx]: { picked: i } }));
    if (ok) setCorrectCount((c) => c + 1);
    else wrongIdsRef.current.push(item.id);
    onAnswer(item.id, ok, i);
  }, [item, answered, idx, maxIdx, onAnswer]);

  const selfGrade = useCallback((ok: boolean) => {
    if (item.kind !== "reveal") return;
    if (answered || idx !== maxIdx) return;
    setRecords((r) => ({ ...r, [idx]: { selfOk: ok } }));
    if (ok) setCorrectCount((c) => c + 1);
    else wrongIdsRef.current.push(item.id);
    onAnswer(item.id, ok);
    next();
  }, [item, answered, idx, maxIdx, next, onAnswer]);

  const pct = useMemo(() => (total ? Math.round((correctCount / total) * 100) : 0), [correctCount, total]);

  if (finished && suppressFinish) return null;
  if (finished) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-5xl">{pct >= 80 ? "🏆" : pct >= 60 ? "👍" : "💪"}</p>
        <h2 className="mt-3 text-xl font-bold text-slate-800"><T>复习完成!</T></h2>
        <p className="mt-1 text-sm text-slate-500"><T>答对</T> {correctCount}/{total} · {pct}%</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-4">
      {header}
      <div className="mb-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${(maxIdx / total) * 100}%` }} />
        </div>
        <span className="text-xs font-semibold text-slate-400">
          {reviewing ? <span className="text-amber-500"><T>回看</T> {idx + 1}/{total}</span> : `${idx + 1}/${total}`}
        </span>
      </div>

      {item.kind === "choice" ? (
        <section>
          {item.audio && (
            <div className="mb-5 flex flex-col items-center">
              <button type="button" aria-label="播放录音"
                onClick={() => { unlockAudioSync(); void speak(item.audio!, { accent: "US" }); }}
                className="inline-flex size-16 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg transition hover:scale-105">
                <Volume2 className="size-7" />
              </button>
              <p className="mt-1.5 text-xs text-slate-400"><T>点击播放</T></p>
            </div>
          )}
          {/* 用法填空:挖空所在原句(context 已含 ___),显示"填在哪" */}
          {item.context && (
            <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-slate-600">{item.context}</p>
            </div>
          )}
          <div className="mb-4 flex items-start gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold leading-relaxed text-slate-800">{item.stem}</p>
                {/* 题干本身就是被复习的词/短语(英译中型)→ 直接给音标+发音,不泄题 */}
                {item.term && item.stem.trim() === item.term.trim() && <SpeakButton text={item.term} />}
                {speakStem && !item.context && !item.audio && item.stem.trim() !== (item.term ?? "").trim() && (
                  <SpeakButton text={item.stem} />
                )}
              </div>
              {item.ipa && item.term && item.stem.trim() === item.term.trim() && (
                <p className="mt-0.5 text-sm text-slate-400">{item.ipa}</p>
              )}
            </div>
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
          {/* 答完再露被复习的词/短语 + 音标 + 发音(题干不是该词时,如中译英/填空,防泄题) */}
          {picked !== null && item.term && item.stem.trim() !== item.term.trim() && (
            <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
              <span className="text-[15px] font-semibold text-slate-800">{item.term}</span>
              {item.ipa && <span className="text-sm text-slate-400">{item.ipa}</span>}
              <SpeakButton text={item.term} />
            </div>
          )}
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
                <span className="text-[15px] font-semibold text-emerald-800">{item.answer}</span>
                <button type="button" aria-label="朗读答案"
                  onClick={() => { unlockAudioSync(); void speak(item.answer, { accent: "US" }); }}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Volume2 className="size-4" />
                </button>
              </div>
              <ExplanationNote text={item.explanation} />
              {reviewing ? (
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

      <div ref={navRef} className="mt-5 flex items-center gap-3">
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
          {idx + 1 >= total && !reviewing ? <T>完成复习</T> : <><T>下一题</T> <ChevronRight className="size-4" /></>}
        </button>
      </div>
    </div>
  );
}
