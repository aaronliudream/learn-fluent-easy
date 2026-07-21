/**
 * 美语课程 · 关1 课文学习(本期核心)。
 * - 三态切换:英文 / 中英 / 中文
 * - 逐句点读(单句 🔊)+ 整篇播放(顺序高亮)+ 语速切换(正常/慢速),全部美音 accent:"US"
 * - 点词查词复用 TappableLine(经 AmericanTappableLine 只消费不改动)
 * - 前置题(prelisten):听录音回答
 * - iOS 音频铁律:所有播放入口的 onClick 先同步 unlockAudioSync() 再异步播放
 * - 完成:整篇播放完 + 前置题答对 → markStageComplete(lessonId, 1);逐句点读 → markSentenceRead
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Square, Volume2, Check, Gauge, ArrowLeft } from "lucide-react";
import { speak, stopSpeaking, unlockAudioSync } from "@/lib/speak";
import { prewarmUS } from "@/lib/american/audio";
import { T } from "@/i18n/T";
import { AmericanTappableLine } from "@/components/american/AmericanTappableLine";
import { bookOf, markSentenceRead, markStageComplete, recordMastery, type LessonBundle } from "@/lib/american/data";

type Mode = "en" | "both" | "cn";
const MODES: { key: Mode; label: string }[] = [
  { key: "en", label: "英文" },
  { key: "both", label: "中英" },
  { key: "cn", label: "中文" },
];

export function AmericanTextStage({ bundle, onDone }: { bundle: LessonBundle; onDone?: () => void }) {
  const { lesson, sentences } = bundle;
  const pre = lesson.prelisten_question;
  const navigate = useNavigate();

  // ③ 加粗数据:本课词表词(词干匹配屈折形)+ 语块(contrast 里带 example1 的即语块卡,us=语块串)
  const boldWords = useMemo(() => bundle.words.map((w) => w.word), [bundle.words]);
  const boldChunks = useMemo(() => bundle.contrast.filter((c) => c.example1).map((c) => c.us), [bundle.contrast]);

  const [mode, setMode] = useState<Mode>("both");
  const [slow, setSlow] = useState(false);
  const [playingAll, setPlayingAll] = useState(false);
  const [current, setCurrent] = useState(-1);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [playedAll, setPlayedAll] = useState(false);
  const [preChoice, setPreChoice] = useState<number | null>(null);
  const [preDone, setPreDone] = useState(false);
  const [completed, setCompleted] = useState(false);

  const playSeq = useRef(0); // 递增以中断进行中的整篇播放
  const speed = slow ? 0.7 : 1.0;
  const liRefs = useRef<(HTMLLIElement | null)[]>([]);   // ② 各句卡片 DOM,用于自动跟随滚动
  const lastUserScrollRef = useRef(0);                    // ② 手势优先:记最近一次用户手动滚动时刻

  useEffect(() => () => { playSeq.current++; stopSpeaking(); }, []);

  // P2 预热:进关即按网络预热全文各句美音音频,键与 speak(text,{accent:US,speed:1.0}) 一致
  //(= speakUS 正常速)→ 逐句点读/整篇播放首句秒响,消除冷合成 1-3s。慢速 0.7 首播仍冷(次要)。
  useEffect(() => { prewarmUS(sentences.map((s) => s.text_en)); }, [sentences]);

  // ② 用户手动滚动 → 记时刻(手势优先,1.2s 内不抢滚动,下一句恢复)
  useEffect(() => {
    const onUserScroll = () => { lastUserScrollRef.current = Date.now(); };
    window.addEventListener("wheel", onUserScroll, { passive: true });
    window.addEventListener("touchmove", onUserScroll, { passive: true });
    return () => { window.removeEventListener("wheel", onUserScroll); window.removeEventListener("touchmove", onUserScroll); };
  }, []);

  // ② 整篇播放推进到某句时,该句卡片平滑滚入视野中央(手势优先则本句跳过)
  useEffect(() => {
    if (!playingAll || current < 0) return;
    if (Date.now() - lastUserScrollRef.current < 1200) return;
    liRefs.current[current]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [current, playingAll]);

  const stopAll = useCallback(() => {
    playSeq.current++;
    stopSpeaking();
    setPlayingAll(false);
    setCurrent(-1);
  }, []);

  // 单句点读:onClick 内同步解锁,再异步播放
  const readOne = useCallback((i: number) => {
    unlockAudioSync();
    playSeq.current++; // 打断整篇
    setPlayingAll(false);
    setCurrent(i);
    const s = sentences[i];
    void speak(s.text_en, { accent: "US", speed }).finally(() => setCurrent((c) => (c === i ? -1 : c)));
    if (!readIds.has(s.id)) {
      setReadIds((prev) => new Set(prev).add(s.id));
      void markSentenceRead(s.id);
    }
  }, [sentences, speed, readIds]);

  // 整篇播放:onClick 内同步解锁,再顺序异步播放
  const playAll = useCallback(() => {
    unlockAudioSync();
    const my = ++playSeq.current;
    setPlayingAll(true);
    const run = async () => {
      const newlyRead = new Set(readIds);
      for (let i = 0; i < sentences.length; i++) {
        if (my !== playSeq.current) return;
        setCurrent(i);
        const s = sentences[i];
        if (!newlyRead.has(s.id)) { newlyRead.add(s.id); void markSentenceRead(s.id); }
        await speak(s.text_en, { accent: "US", speed });
        if (my !== playSeq.current) return;
        await new Promise((r) => setTimeout(r, 120));
      }
      if (my !== playSeq.current) return;
      setReadIds(newlyRead);
      setPlayingAll(false);
      setCurrent(-1);
      setPlayedAll(true);
    };
    void run();
  }, [sentences, speed, readIds]);

  const answerPre = useCallback((idx: number) => {
    if (preDone) return;
    setPreChoice(idx);
    const correct = pre ? idx === pre.answer_index : false;
    if (correct) {
      setPreDone(true);
      void recordMastery("am_prelisten", lesson.id, true);
    }
  }, [pre, preDone, lesson.id]);

  // 完成判定:整篇播放完 + 前置题答对(无前置题则仅需播完)
  useEffect(() => {
    if (completed) return;
    const preOk = pre ? preDone : true;
    if (playedAll && preOk) {
      setCompleted(true);
      void markStageComplete(lesson.id, 1);
    }
  }, [playedAll, preDone, pre, completed, lesson.id]);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-4">
      {/* 标题 */}
      <header className="mb-4">
        <h1 className="text-xl font-bold text-slate-900">{lesson.title_en}</h1>
        <p className="mt-0.5 text-sm text-slate-500">{lesson.title_cn}</p>
        {lesson.scene && <p className="mt-1 text-xs text-slate-400">📍 {lesson.scene}</p>}
      </header>

      {/* 前置题 */}
      {pre && (
        <section className="mb-5 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
          <p className="mb-2 text-sm font-semibold text-amber-800">
            🎧 <T>先听录音,回答问题</T>
          </p>
          <p className="mb-3 text-[15px] font-medium text-slate-800">{pre.q}</p>
          <div className="grid gap-2">
            {pre.options.map((opt, i) => {
              const chosen = preChoice === i;
              const isCorrect = i === pre.answer_index;
              let cls = "border-slate-200 bg-white text-slate-700";
              if (preChoice !== null) {
                if (isCorrect && (chosen || preDone)) cls = "border-emerald-400 bg-emerald-50 text-emerald-700";
                else if (chosen && !isCorrect) cls = "border-rose-300 bg-rose-50 text-rose-600";
              }
              return (
                <button
                  key={i}
                  type="button"
                  disabled={preDone}
                  onClick={() => answerPre(i)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${cls}`}>
                  <span>{opt}</span>
                  {preDone && isCorrect && <Check className="size-4 shrink-0 text-emerald-600" />}
                </button>
              );
            })}
          </div>
          {preChoice !== null && !preDone && (
            <p className="mt-2 text-xs text-rose-500"><T>再试一次</T></p>
          )}
        </section>
      )}

      {/* 工具条:整篇播放 / 语速 / 三态切换 */}
      <div className="sticky top-0 z-10 mb-3 flex flex-wrap items-center gap-2 bg-white/90 py-2 backdrop-blur">
        {playingAll ? (
          <button type="button" onClick={stopAll}
            className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm">
            <Square className="size-4" /> <T>停止</T>
          </button>
        ) : (
          <button type="button" onClick={playAll}
            className="inline-flex items-center gap-1.5 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm">
            <Play className="size-4" /> <T>播放全文</T>
          </button>
        )}
        <button type="button" onClick={() => setSlow((s) => !s)}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition ${slow ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
          <Gauge className="size-4" /> {slow ? <T>慢速</T> : <T>正常</T>}
        </button>
        <div className="ml-auto flex rounded-full bg-slate-100 p-0.5">
          {MODES.map((m) => (
            <button key={m.key} type="button" onClick={() => setMode(m.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${mode === m.key ? "bg-white text-sky-700 shadow-sm" : "text-slate-500"}`}>
              <T>{m.label}</T>
            </button>
          ))}
        </div>
      </div>

      {/* 课文 */}
      <ol className="space-y-2.5">
        {sentences.map((s, i) => {
          const active = current === i;
          const wasRead = readIds.has(s.id);
          return (
            <li key={s.id} ref={(el) => { liRefs.current[i] = el; }}
              className={`rounded-2xl border p-3 transition ${active ? "border-sky-400 bg-sky-50/70" : "border-slate-100 bg-white"}`}>
              <div className="flex items-start gap-2.5">
                <button type="button" onClick={() => readOne(i)} aria-label="播放本句"
                  className={`mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full transition ${active ? "bg-sky-600 text-white" : wasRead ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                  <Volume2 className="size-4" />
                </button>
                <div className="min-w-0 flex-1">
                  {s.speaker && <span className="mr-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">{s.speaker}</span>}
                  {mode !== "cn" && (
                    <span className="text-[15px] leading-relaxed text-slate-800">
                      <AmericanTappableLine sentence={s.text_en} boldWords={boldWords} boldChunks={boldChunks} />
                    </span>
                  )}
                  {mode === "both" && <div className="mt-0.5 text-sm text-slate-500">{s.text_cn}</div>}
                  {mode === "cn" && <span className="text-[15px] leading-relaxed text-slate-800">{s.text_cn}</span>}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* 完成 */}
      {completed && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
          <p className="text-base font-bold text-emerald-700">🎉 <T>本关完成!</T></p>
          <p className="mt-1 text-sm text-emerald-600"><T>课文已学完,继续下一关吧。</T></p>
          {onDone && (
            <button type="button" onClick={onDone}
              className="mt-3 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white">
              <T>返回本课</T>
            </button>
          )}
        </div>
      )}

      {/* ① 课文读到底一键回本单元(book-aware,复用 bookOf) */}
      <div className="mt-8 flex justify-center">
        <button type="button"
          onClick={() => navigate(`/american/book/${bookOf(lesson.id)}/hub/${lesson.unit_no}`)}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800">
          <ArrowLeft className="size-4" /> <T>返回本单元</T>
        </button>
      </div>
    </div>
  );
}
