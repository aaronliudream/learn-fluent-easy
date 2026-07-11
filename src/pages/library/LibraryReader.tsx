/**
 * 图书馆(/library/:bookKey/read)· 沉浸式朗读器。
 * Fork 自 pages/american/AmericanTextStage.tsx 的成熟形态(逐句高亮 + 自动滚动 + 手势优先 + iOS 解锁),
 * 改造为散文书:按 chapter_idx/para_idx 分章分段;逐句 audio_url(有则用,无则实时 speak);
 * 点英文词查中文(复用 TappableLine);断点续读进度落 library_reading_progress。
 * 与 P0 ReadingPlay.tsx 无关,一行不碰。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Play, Square, Volume2, Gauge } from "lucide-react";
import { speak, speakFromUrl, stopSpeaking, unlockAudioSync, prefetchTTS } from "@/lib/speak";
import { T } from "@/i18n/T";
import { TappableLine } from "@/components/TappableLine";
import {
  getBookByKey,
  getSentences,
  currentUserId,
  type LibraryBook,
  type LibrarySentence,
} from "@/lib/library/data";
import {
  defaultLibraryState,
  loadLocalState,
  saveLocalState,
  hydrateFromCloud,
  scheduleCloudPush,
  flushCloudPush,
  type LibraryReadingState,
} from "@/lib/library/progress";

type Mode = "en" | "both" | "cn";
const MODES: { key: Mode; label: string }[] = [
  { key: "en", label: "英文" },
  { key: "both", label: "中英" },
  { key: "cn", label: "中文" },
];

const READ_ACCENT = "US" as const; // v1 样书统一美音;将来可按书配置
const HEARTBEAT_MS = 5000;

function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}小时${m % 60}分`;
  if (m > 0) return `${m}分`;
  return `${sec}秒`;
}

export default function LibraryReader() {
  const { bookKey = "" } = useParams();

  const [book, setBook] = useState<LibraryBook | null>(null);
  const [sentences, setSentences] = useState<LibrarySentence[]>([]);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState<Mode>("en"); // 默认英文
  const [slow, setSlow] = useState(false);
  const [playingAll, setPlayingAll] = useState(false);
  const [current, setCurrent] = useState(-1); // 正在朗读/高亮的句子数组下标
  const [furthestSeq, setFurthestSeq] = useState(-1);
  const [seconds, setSeconds] = useState(0);

  const speed = slow ? 0.7 : 1.0;
  const playSeq = useRef(0); // 递增以中断进行中的连续朗读
  const liRefs = useRef<(HTMLElement | null)[]>([]);
  const lastUserScrollRef = useRef(0);

  const stateRef = useRef<LibraryReadingState>(defaultLibraryState());
  const uidRef = useRef<string | null>(null);
  const resumeIdxRef = useRef(-1); // 载入后要滚动到的断点下标(-1=无)

  // ---------- 载入书 + 句子 + 进度 ----------
  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      const b = await getBookByKey(bookKey);
      if (!alive) return;
      setBook(b);
      if (!b) {
        setLoading(false);
        return;
      }
      const ss = await getSentences(b.id);
      if (!alive) return;
      setSentences(ss);

      const uid = await currentUserId();
      if (!alive) return;
      uidRef.current = uid;
      const st = uid ? await hydrateFromCloud(uid, b.id) : loadLocalState(b.id);
      if (!alive) return;
      stateRef.current = st;
      setFurthestSeq(st.furthest_seq);
      setSeconds(st.seconds);
      const idx = st.last_seq > 0 ? ss.findIndex((s) => s.seq === st.last_seq) : -1;
      resumeIdxRef.current = idx;
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [bookKey]);

  // 断点续读:载入后滚到上次离开的句子
  useEffect(() => {
    if (loading || resumeIdxRef.current < 0) return;
    const idx = resumeIdxRef.current;
    resumeIdxRef.current = -1;
    const t = setTimeout(() => {
      liRefs.current[idx]?.scrollIntoView({ behavior: "auto", block: "center" });
    }, 60);
    return () => clearTimeout(t);
  }, [loading]);

  // 卸载:停朗读 + 冲刷云端待推
  useEffect(
    () => () => {
      playSeq.current++;
      stopSpeaking();
      void flushCloudPush();
    },
    [],
  );

  // 用户手动滚动 → 记时刻(手势优先,1.2s 内不抢滚)
  useEffect(() => {
    const onUserScroll = () => {
      lastUserScrollRef.current = Date.now();
    };
    window.addEventListener("wheel", onUserScroll, { passive: true });
    window.addEventListener("touchmove", onUserScroll, { passive: true });
    return () => {
      window.removeEventListener("wheel", onUserScroll);
      window.removeEventListener("touchmove", onUserScroll);
    };
  }, []);

  // 连续朗读推进到某句 → 平滑滚入视野中央(手势优先则本句跳过)
  useEffect(() => {
    if (!playingAll || current < 0) return;
    if (Date.now() - lastUserScrollRef.current < 1200) return;
    liRefs.current[current]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [current, playingAll]);

  // 阅读时长心跳:页面可见时每 5s 计一次(被动听/读均算活跃)
  useEffect(() => {
    if (loading || !book) return;
    const timer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      const s = stateRef.current;
      s.seconds += Math.round(HEARTBEAT_MS / 1000);
      s.updated_at = Date.now();
      setSeconds(s.seconds);
      persist();
    }, HEARTBEAT_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, book]);

  const persist = useCallback(() => {
    const b = book;
    if (!b) return;
    saveLocalState(b.id, stateRef.current);
    if (uidRef.current) scheduleCloudPush(uidRef.current, b.id, stateRef.current);
  }, [book]);

  // 到达某句 → 记进度(furthest 不回退;断点 = 该句 + 其章号)
  const bump = useCallback(
    (i: number) => {
      const s = sentences[i];
      if (!s) return;
      const st = stateRef.current;
      st.last_seq = s.seq;
      st.chapter_idx = s.chapter_idx;
      st.furthest_seq = Math.max(st.furthest_seq, s.seq);
      st.updated_at = Date.now();
      setFurthestSeq(st.furthest_seq);
      persist();
    },
    [sentences, persist],
  );

  // 播一句:audio_url 有且非慢速则用预生成;否则实时 speak(慢速强制实时以尊重语速)
  const playSentence = useCallback(
    (s: LibrarySentence): Promise<void> => {
      if (s.audio_url && !slow) return speakFromUrl(s.audio_url);
      return speak(s.text_en, { accent: READ_ACCENT, speed });
    },
    [slow, speed],
  );

  const stopAll = useCallback(() => {
    playSeq.current++;
    stopSpeaking();
    setPlayingAll(false);
    setCurrent(-1);
  }, []);

  // 单句朗读:onClick 内同步解锁,再异步播放
  const readOne = useCallback(
    (i: number) => {
      unlockAudioSync();
      playSeq.current++; // 打断连续朗读
      setPlayingAll(false);
      setCurrent(i);
      bump(i);
      void playSentence(sentences[i]).finally(() => setCurrent((c) => (c === i ? -1 : c)));
    },
    [sentences, playSentence, bump],
  );

  // 连续朗读:从 startIdx 起顺序播,直到本章结束(chapter_idx 变化)或全书末。
  const playChapterFrom = useCallback(
    (startIdx: number) => {
      if (startIdx < 0 || startIdx >= sentences.length) return;
      unlockAudioSync();
      const my = ++playSeq.current;
      const chapter = sentences[startIdx].chapter_idx;
      setPlayingAll(true);
      const run = async () => {
        for (let i = startIdx; i < sentences.length; i++) {
          if (my !== playSeq.current) return;
          if (sentences[i].chapter_idx !== chapter) break; // 只读本章
          setCurrent(i);
          bump(i);
          // 预取下一句(仅实时合成的句子;有 audio_url 的无需预热)
          const nxt = sentences[i + 1];
          if (nxt && nxt.chapter_idx === chapter && !(nxt.audio_url && !slow)) {
            prefetchTTS(nxt.text_en, { accent: READ_ACCENT, speed });
          }
          await playSentence(sentences[i]);
          if (my !== playSeq.current) return;
          await new Promise((r) => setTimeout(r, 120));
        }
        if (my !== playSeq.current) return;
        setPlayingAll(false);
        setCurrent(-1);
      };
      void run();
    },
    [sentences, playSentence, bump, slow, speed],
  );

  // 顶部"继续朗读":从断点(last_seq 所在句)起读本章;无断点 → 从头。
  const playFromResume = useCallback(() => {
    const last = stateRef.current.last_seq;
    const idx = last > 0 ? sentences.findIndex((s) => s.seq === last) : 0;
    playChapterFrom(idx < 0 ? 0 : idx);
  }, [sentences, playChapterFrom]);

  // ---------- 章节/段落分组渲染结构 ----------
  const total = sentences.length;
  const completionPct = useMemo(
    () => (total > 0 && furthestSeq >= 0 ? Math.round(((furthestSeq + 1) / total) * 100) : 0),
    [furthestSeq, total],
  );

  // 章的首句下标(章头 ▶ 用)
  const chapterFirstIdx = useMemo(() => {
    const m = new Map<number, number>();
    sentences.forEach((s, i) => {
      if (!m.has(s.chapter_idx)) m.set(s.chapter_idx, i);
    });
    return m;
  }, [sentences]);

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-slate-400">
        <T>加载中…</T>
      </main>
    );
  }
  if (!book) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm text-slate-500">
          <T>没有找到这本书。</T>
        </p>
        <Link to="/library" className="mt-4 inline-block text-sm font-semibold text-sky-600">
          <T>← 返回书架</T>
        </Link>
      </main>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-4">
      {/* 顶部:返回 + 完成度 + 时长 */}
      <header className="mb-3">
        <Link
          to={`/library/${book.book_key}`}
          className="inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-slate-600"
        >
          <ArrowLeft className="size-4" /> <T>返回详情</T>
        </Link>
        <h1 className="mt-2 text-xl font-bold text-slate-900">{book.title}</h1>
        {book.zh_title && <p className="mt-0.5 text-sm text-slate-500">{book.zh_title}</p>}
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
          <span className="tabular-nums">
            <T>完成度</T> {completionPct}%
          </span>
          <span className="tabular-nums">
            <T>阅读</T> {fmtDuration(seconds)}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100" aria-hidden>
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all"
            style={{ width: `${Math.max(2, completionPct)}%` }}
          />
        </div>
      </header>

      {/* 工具条:朗读本章 / 语速 / 三态切换(sticky) */}
      <div className="sticky top-0 z-10 mb-4 flex flex-wrap items-center gap-2 bg-white/90 py-2 backdrop-blur">
        {playingAll ? (
          <button
            type="button"
            onClick={stopAll}
            className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm"
          >
            <Square className="size-4" /> <T>停止</T>
          </button>
        ) : (
          <button
            type="button"
            onClick={playFromResume}
            className="inline-flex items-center gap-1.5 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm"
          >
            <Play className="size-4" /> <T>朗读本章</T>
          </button>
        )}
        <button
          type="button"
          onClick={() => setSlow((s) => !s)}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition ${slow ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}
        >
          <Gauge className="size-4" /> {slow ? <T>慢速</T> : <T>正常</T>}
        </button>
        <div className="ml-auto flex rounded-full bg-slate-100 p-0.5">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${mode === m.key ? "bg-white text-sky-700 shadow-sm" : "text-slate-500"}`}
            >
              <T>{m.label}</T>
            </button>
          ))}
        </div>
      </div>

      {/* 正文:按章/段渲染,逐句一行(🔊 + 点词) */}
      <div className="space-y-1">
        {sentences.map((s, i) => {
          const prev = sentences[i - 1];
          const newChapter = !prev || prev.chapter_idx !== s.chapter_idx;
          const newPara = prev && prev.chapter_idx === s.chapter_idx && prev.para_idx !== s.para_idx;
          const active = current === i;
          return (
            <div key={s.id}>
              {newChapter && (
                <div className="mb-2 mt-6 flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 first:mt-0">
                  <h2 className="text-sm font-bold tracking-wide text-slate-400">
                    <T>第</T> {s.chapter_idx} <T>章</T>
                  </h2>
                  <button
                    type="button"
                    onClick={() => playChapterFrom(chapterFirstIdx.get(s.chapter_idx) ?? i)}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-sky-100 hover:text-sky-700"
                  >
                    <Play className="size-3" /> <T>朗读本章</T>
                  </button>
                </div>
              )}
              <div
                ref={(el) => {
                  liRefs.current[i] = el;
                }}
                className={`${newPara ? "mt-3" : ""} flex items-start gap-2 rounded-lg px-1.5 py-1 transition ${active ? "bg-sky-50" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => readOne(i)}
                  aria-label="播放本句"
                  className={`mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full transition ${active ? "bg-sky-600 text-white" : "text-slate-300 hover:bg-slate-100 hover:text-slate-500"}`}
                >
                  <Volume2 className="size-3.5" />
                </button>
                <div className="min-w-0 flex-1">
                  {mode !== "cn" && (
                    <span className="text-[17px] leading-loose text-slate-800">
                      <TappableLine sentence={s.text_en} />
                    </span>
                  )}
                  {mode === "both" && s.text_cn && (
                    <div className="mt-0.5 text-sm leading-relaxed text-slate-500">{s.text_cn}</div>
                  )}
                  {mode === "cn" && (
                    <span className="text-[17px] leading-loose text-slate-800">{s.text_cn}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
