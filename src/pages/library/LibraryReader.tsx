/**
 * 图书馆(/library/:bookKey/read)· 沉浸式朗读器。
 * Fork 自 pages/american/AmericanTextStage.tsx 的成熟形态(逐句高亮 + 自动滚动 + 手势优先 + iOS 解锁),
 * 改造为散文书:**按章加载、按章渲染**(长书一次拉全书会撞 PostgREST 1000 行硬顶 + 页面过长)。
 * 逐句 audio_url(有则用,无则实时 speak);点英文词查中文(复用 TappableLine);
 * 断点续读进度落 library_reading_progress —— furthest_seq/last_seq 仍记全书 seq,完成度以 sentence_count 为分母。
 * 与 P0 ReadingPlay.tsx 无关,一行不碰。
 */
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Play, Square, Volume2, Gauge, ChevronLeft, ChevronRight, X, Bookmark, Loader2 } from "lucide-react";
import { speak, speakFromUrl, stopSpeaking, unlockAudioSync, prefetchTTS, isSpeaking } from "@/lib/speak";
import { T } from "@/i18n/T";
import { TappableLine } from "@/components/TappableLine";
import ChapterNotesCollection from "@/components/library/ChapterNotesCollection";
import { listFavoritedTerms, type LibraryFavoriteKind } from "@/lib/library/favorites";
import {
  getBookByKey,
  chapterOutline,
  getChapterOfSeq,
  getChapterSentences,
  getChapterIllustrations,
  getChapterChunkTerms,
  getBookCultureNotes,
  getBookWordSenses,
  type LibraryWordSense,
  chapterTitle,
  illustrationUrl,
  currentUserId,
  type LibraryBook,
  type LibraryChapter,
  type LibrarySentence,
  type LibraryIllustration,
  type LibraryCultureNote,
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
import { listBookmarks, addBookmark, removeBookmark, type LibraryBookmark } from "@/lib/library/bookmarks";
import BookmarkPanel from "@/components/library/BookmarkPanel";
import { countWords, computeSections, sectionOfPara } from "@/lib/library/sections";

type Mode = "en" | "both" | "cn";
const MODES: { key: Mode; label: string }[] = [
  { key: "en", label: "英文" },
  { key: "both", label: "中英" },
  { key: "cn", label: "中文" },
];

const READ_ACCENT = "US" as const; // v1 样书统一美音;将来可按书配置
const HEARTBEAT_MS = 5000;
const READING_WPM = 100; // 非母语估读速度(唯一常量·idle阈值 + 剩余时间兜底共用;个人wpm够数据时覆盖剩余时间)。clamp 见 PERSONAL_WPM_MIN/MAX。
const PERSONAL_WPM_MIN = 60;
const PERSONAL_WPM_MAX = 250;

function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}小时${m % 60}分`;
  if (m > 0) return `${m}分`;
  return `${sec}秒`;
}

/** 单张插图渲染(懒加载 + 写死宽高防 CLS)。章首与文中穿插共用。
 *  横图(AI 16:9 + 少数宽 Denslow):图宽=正文宽,和文字一条左右轴线。
 *  竖图(多数 Denslow 立幅):保持居中 + 限宽,避免全宽后过高压屏(维持原观感)。 */
function renderFigure(im: LibraryIllustration) {
  const landscape = !!(im.width && im.height) && im.width >= im.height;
  // 横图占满外层容器(比正文列宽 ~12%,呼吸感);竖图仍居中限宽,避免过高。无边框,仅柔和阴影。
  const base = "h-auto rounded-2xl shadow-md shadow-slate-900/5";
  return (
    <figure key={im.image_path} className="my-10">
      <img
        src={illustrationUrl(im.image_path)}
        alt={im.alt_text ?? im.caption ?? ""}
        width={im.width ?? undefined}
        height={im.height ?? undefined}
        loading="lazy"
        className={landscape ? `w-full ${base}` : `mx-auto w-full max-w-md ${base}`}
        style={im.width && im.height ? { aspectRatio: `${im.width} / ${im.height}` } : undefined}
      />
      {im.credit && (
        <figcaption className="mt-2 text-center text-[11px] text-slate-400">{im.credit}</figcaption>
      )}
    </figure>
  );
}

export default function LibraryReader() {
  const { bookKey = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [book, setBook] = useState<LibraryBook | null>(null);
  const [chapters, setChapters] = useState<LibraryChapter[]>([]);
  const [chapterIdx, setChapterIdx] = useState(-1); // 当前正在读的章号(真实章号);-1=未定
  const [sentences, setSentences] = useState<LibrarySentence[]>([]); // 仅当前章
  const [illus, setIllus] = useState<LibraryIllustration[]>([]); // 当前章插图(v1 章首)
  const [chunkTerms, setChunkTerms] = useState<string[]>([]); // 当前章语块(正文虚线)
  const [cultureNotes, setCultureNotes] = useState<Map<string, LibraryCultureNote>>(new Map()); // 全书文化笔记(稀疏·卡底💡)
  const [wordSenses, setWordSenses] = useState<Map<string, LibraryWordSense>>(new Map()); // 古今异义按书覆盖(点词优先用书中义)
  const [loading, setLoading] = useState(true); // 首屏:书 + 章表 + 进度
  const [chapterLoading, setChapterLoading] = useState(false); // 切章:仅当前章句子

  const [mode, setMode] = useState<Mode>("en"); // 默认英文
  const [slow, setSlow] = useState(false);
  const [playingAll, setPlayingAll] = useState(false);
  const [current, setCurrent] = useState(-1); // 正在朗读/高亮的句子(章内数组下标)
  const [furthestSeq, setFurthestSeq] = useState(-1);
  const [seconds, setSeconds] = useState(0);

  const [favTerms, setFavTerms] = useState<Set<string>>(new Set()); // 收藏词小写集合(高亮 + 微提取)
  const [reveal, setReveal] = useState(false); // 移动端长按 → 揭示可点词
  const [showOnboard, setShowOnboard] = useState(false); // 首次引导提示
  const [revealedCn, setRevealedCn] = useState<Set<number>>(new Set()); // 点句子 → 就地显该句中文(章内数组下标)
  const [revealedCnPara, setRevealedCnPara] = useState<Set<number>>(new Set()); // 段右"中"按钮 → 显该段整段中译(paraIdx;仅 en 模式)
  const [preparing, setPreparing] = useState(false); // 朗读首句冷合成中 → 播放键 loading 态

  // 书签(登录用户):段落级手动标记多个精准点,与续读独立。bookmarkedSeqs=图标实心判定;bookmarks=面板列表。
  const [signedIn, setSignedIn] = useState(false);
  const [bookmarks, setBookmarks] = useState<LibraryBookmark[]>([]);
  const [bookmarkedSeqs, setBookmarkedSeqs] = useState<Set<number>>(new Set());
  const [panelOpen, setPanelOpen] = useState(false);

  // 本章文化笔记(③ 章末合集):cultureNotes 已按本书取,再按锚定章过滤 = (book_id, chapter_idx),不跨书混。
  const chapterNotes = useMemo(
    () => [...cultureNotes.values()].filter((n) => n.chapter_idx === chapterIdx),
    [cultureNotes, chapterIdx],
  );

  const speed = slow ? 0.7 : 1.0;
  const playSeq = useRef(0); // 递增以中断进行中的连续朗读
  const liRefs = useRef<(HTMLElement | null)[]>([]);
  const lastUserScrollRef = useRef(0);
  const lastActiveRef = useRef(Date.now()); // 任一活跃信号(滚/触/鼠标/键/选中/点词)刷新 → 无操作判定用
  const anchorSeqRef = useRef(-1); // 当前视口锚点句的全书 seq;由 bump 记录,活跃心跳才把它提升为 furthest(完成度=读过非扫过)
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stateRef = useRef<LibraryReadingState>(defaultLibraryState());
  const uidRef = useRef<string | null>(null);
  const pendingResumeSeqRef = useRef(0); // 章句加载后要定位到的全书 seq(0=滚到章首)

  // ---------- 首屏:载入书 + 章表 + 进度,决定初始章 ----------
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
      // 目录取自 chapters jsonb(0 查询,与书长无关);其余独立查询并行,不再逐个串行。
      const chs = chapterOutline(b);
      setChapters(chs);
      const [uid, terms, notes, bms, senses] = await Promise.all([
        currentUserId(),
        listFavoritedTerms(),
        getBookCultureNotes(b.id),
        listBookmarks(b.id), // 未登录返回 []
        getBookWordSenses(b.book_key), // 古今异义覆盖(空表→空 Map,回退全局卡)
      ]);
      if (!alive) return;
      uidRef.current = uid;
      setSignedIn(!!uid);
      setFavTerms(terms);
      setCultureNotes(notes);
      setBookmarks(bms);
      setBookmarkedSeqs(new Set(bms.map((x) => x.seq)));
      setWordSenses(senses);

      const st = uid ? await hydrateFromCloud(uid, b.id) : loadLocalState(b.id);
      if (!alive) return;
      stateRef.current = st;
      setFurthestSeq(st.furthest_seq);
      setSeconds(st.seconds);

      // 初始章:URL ?ch=N(目录跳章)优先 → 否则断点 last_seq 所在章 → 否则第一章。
      const urlCh = Number(searchParams.get("ch"));
      const hasUrlCh = Number.isFinite(urlCh) && chs.some((c) => c.idx === urlCh);
      let initCh: number;
      if (hasUrlCh) {
        initCh = urlCh;
        pendingResumeSeqRef.current = 0; // 跳章 → 滚到章首
      } else if (st.last_seq > 0) {
        initCh = await getChapterOfSeq(b.id, st.last_seq); // 单查定位,与书长无关
        if (!alive) return;
        pendingResumeSeqRef.current = st.last_seq; // 断点续读 → 定位到断点句
      } else {
        initCh = chs[0]?.idx ?? 1;
        pendingResumeSeqRef.current = 0;
      }
      setChapterIdx(initCh);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
    // searchParams 只在首屏读一次(后续跳章走 setChapterIdx,不重跑本 effect)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookKey]);

  // ---------- 切章:载入当前章的句子 ----------
  useEffect(() => {
    if (!book || chapterIdx < 0) return;
    let alive = true;
    playSeq.current++; // 打断上一章可能在播的朗读
    stopSpeaking();
    setPlayingAll(false);
    setCurrent(-1);
    setChapterLoading(true);
    setIllus([]);
    (async () => {
      const [ss, ill, terms] = await Promise.all([
        getChapterSentences(book.id, chapterIdx),
        getChapterIllustrations(book.id, chapterIdx),
        getChapterChunkTerms(book.id, chapterIdx),
      ]);
      if (!alive) return;
      liRefs.current = [];
      setRevealedCn(new Set());
      setRevealedCnPara(new Set());
      setSentences(ss);
      setIllus(ill);
      setChunkTerms(terms);
      setChapterLoading(false);
      // 预热本章前两句(实时合成的)→ 首次点朗读不冷、不"点了没反应"。有 audio_url 的无需。
      for (const s of ss.slice(0, 2)) {
        if (s && !(s.audio_url && !slow)) prefetchTTS(s.text_en, { accent: READ_ACCENT, speed });
      }
    })();
    return () => {
      alive = false;
    };
    // slow/speed 仅用于预热音质,故意不入依赖(否则切语速会重载整章)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book, chapterIdx]);

  // 章句就绪 → 定位:有断点 seq 则滚到该句,否则滚到章首
  useEffect(() => {
    if (loading || chapterLoading) return;
    const want = pendingResumeSeqRef.current;
    const t = setTimeout(() => {
      if (want > 0) {
        const idx = sentences.findIndex((s) => s.seq === want);
        if (idx >= 0) liRefs.current[idx]?.scrollIntoView({ behavior: "auto", block: "center" });
        else window.scrollTo({ top: 0 });
      } else {
        window.scrollTo({ top: 0 });
      }
      pendingResumeSeqRef.current = 0;
    }, 60);
    return () => clearTimeout(t);
  }, [loading, chapterLoading, sentences]);

  // 卸载:停朗读 + 冲刷云端待推
  useEffect(
    () => () => {
      playSeq.current++;
      stopSpeaking();
      void flushCloudPush();
    },
    [],
  );

  // 首次进阅读器:一次性引导(看过存本地,不再出现;不为此建表)。
  useEffect(() => {
    try {
      if (!localStorage.getItem("library.reader.onboarded.v1")) setShowOnboard(true);
    } catch {
      /* ignore */
    }
  }, []);
  const dismissOnboard = useCallback(() => {
    setShowOnboard(false);
    try {
      localStorage.setItem("library.reader.onboarded.v1", "1");
    } catch {
      /* ignore */
    }
  }, []);

  // 收藏变化 → 即时更新高亮/微提取集合(收藏加入、取消移除)。
  const handleFavChange = useCallback((term: string, _kind: LibraryFavoriteKind, favorited: boolean) => {
    setFavTerms((prev) => {
      const next = new Set(prev);
      if (favorited) next.add(term.toLowerCase());
      else next.delete(term.toLowerCase());
      return next;
    });
  }, []);

  // 移动端长按 → 揭示所有可点词(淡底);滚动 / 2.5s 后自动关闭。
  const startLongPress = useCallback(() => {
    longPressRef.current = setTimeout(() => setReveal(true), 450);
  }, []);
  const cancelLongPress = useCallback(() => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  }, []);
  useEffect(() => {
    if (!reveal) return;
    const off = () => setReveal(false);
    const t = setTimeout(off, 2500);
    window.addEventListener("scroll", off, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", off);
    };
  }, [reveal]);

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

  // 阅读时长心跳(止血版):每 5s 一跳,**三闸全开才计时**——挂机/失焦/切后台立即停,不再"只要标签页可见就加"。
  //  ① 可见:document.visibilityState(切标签页/最小化/手机锁屏)
  //  ② 聚焦:window blur/focus —— 台式机切到别的 App(Excel/微信/IDE)标签页仍 visible,靠 blur 才抓得到(20h 头号来源)
  //  ③ 非无操作:动态阈值 = 视口可见词数 / 阅读速度 × 2,clamp[60s,300s] —— 手机窄屏(~1min)/台式宽屏(~3min 不滚也正常)自适配,不写死 90s
  // 活跃信号两端通吃:滚动/触摸(手机)+ mousemove/wheel/keydown/选中(台式);点词经由这些一并刷新。
  useEffect(() => {
    if (loading || !book) return;
    let focused = typeof document === "undefined" ? true : document.hasFocus();
    const onFocus = () => { focused = true; lastActiveRef.current = Date.now(); };
    const onBlur = () => { focused = false; };
    const markActive = () => { lastActiveRef.current = Date.now(); };
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    const winActs = ["scroll", "wheel", "touchmove", "mousemove", "keydown", "pointerdown"] as const;
    for (const e of winActs) window.addEventListener(e, markActive, { passive: true });
    document.addEventListener("selectionchange", markActive); // 台式机文本选中

    // 无操作阈值(ms):按当前视口可见词数动态算
    const idleThresholdMs = () => {
      const vh = window.innerHeight || 800;
      let words = 0;
      for (const el of liRefs.current) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) words += (el.textContent || "").trim().split(/\s+/).filter(Boolean).length;
      }
      const sec = words > 0 ? (words / READING_WPM) * 60 * 2 : 120; // 统一用 READING_WPM(见文件顶常量)
      return Math.min(300, Math.max(60, sec)) * 1000;
    };

    const timer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return; // ① 不可见
      if (!focused) return; // ② 窗口失焦
      if (Date.now() - lastActiveRef.current > idleThresholdMs()) return; // ③ 无操作超阈值
      const s = stateRef.current;
      s.seconds += Math.round(HEARTBEAT_MS / 1000);
      // 完成度=读过非扫过:只有活跃心跳(可见+聚焦+非idle)时,才把当前视口锚点句提升为 furthest。
      // 目录跳章/续读定位/朗读挂机(失焦或无操作)都不会推进 furthest,根治"扫过就算读过"的 41% 虚高。
      if (anchorSeqRef.current > s.furthest_seq) {
        s.furthest_seq = anchorSeqRef.current;
        setFurthestSeq(s.furthest_seq);
      }
      s.updated_at = Date.now();
      setSeconds(s.seconds);
      persist();
    }, HEARTBEAT_MS);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
      for (const e of winActs) window.removeEventListener(e, markActive);
      document.removeEventListener("selectionchange", markActive);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, book]);

  const persist = useCallback(() => {
    const b = book;
    if (!b) return;
    saveLocalState(b.id, stateRef.current);
    if (uidRef.current) scheduleCloudPush(uidRef.current, b.id, stateRef.current);
  }, [book]);

  // 到达某句 → 记断点(last_seq 可回退,续读用)+ 记锚点句(furthest 不在此推进,交给活跃心跳判定"读过")。
  // ⚠️ 不再在滚动/朗读时直接推 furthest:那会把"扫过/跳章/挂机"当成读过(41% 虚高根因)。
  const bump = useCallback(
    (i: number) => {
      const s = sentences[i];
      if (!s) return;
      const st = stateRef.current;
      st.last_seq = s.seq;
      st.chapter_idx = s.chapter_idx;
      anchorSeqRef.current = s.seq; // 当前视口锚点 → 活跃心跳才提升为 furthest
      st.updated_at = Date.now();
      persist();
    },
    [sentences, persist],
  );

  // 滚动阅读也记进度(修根因):原先只有"朗读播放"逐句才 bump,**纯滚动阅读的位置从不保存**
  // → 退出再进回不到读到的那段。这里按视口顶部锚点句节流记 last_seq,不放音频也能精准续读。
  useEffect(() => {
    if (loading || chapterLoading || !sentences.length) return;
    let raf = 0;
    let lastAt = 0;
    const track = () => {
      if (playingAll) return; // 播放时以播放句为准(playChapterFrom 已 bump),不抢
      const now = Date.now();
      if (now - lastAt < 700) return; // 节流
      lastAt = now;
      const line = window.innerHeight * 0.3; // 阅读锚线:视口上部 30%
      let anchor = -1;
      for (let i = 0; i < liRefs.current.length; i++) {
        const el = liRefs.current[i];
        if (!el) continue;
        if (el.getBoundingClientRect().top <= line) anchor = i;
        else break; // 句子按文档顺序:第一句还没越过锚线,后面都没越过
      }
      if (anchor >= 0) bump(anchor);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        track();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [loading, chapterLoading, sentences, playingAll, bump]);

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
    setPreparing(false);
    setCurrent(-1);
  }, []);

  // 连续朗读:从章内 startIdx 起顺序播到 stopIdx(不含);默认播到本章末。
  // 段左喇叭传该段末句+1 → 只读该段、读完停(方便"这段没听懂重听")。
  const playChapterFrom = useCallback(
    (startIdx: number, stopIdx: number = sentences.length) => {
      if (startIdx < 0 || startIdx >= sentences.length) return;
      const end = Math.min(stopIdx, sentences.length);
      unlockAudioSync();
      const my = ++playSeq.current;
      setPlayingAll(true);
      const run = async () => {
        // 首句可能冷合成 → loading 态:音频真正开播(isSpeaking)才关,兜底 6s。
        const first = sentences[startIdx];
        if (first && !(first.audio_url && !slow)) {
          setPreparing(true);
          prefetchTTS(first.text_en, { accent: READ_ACCENT, speed });
          const poll = setInterval(() => {
            if (my !== playSeq.current || isSpeaking()) {
              setPreparing(false);
              clearInterval(poll);
            }
          }, 100);
          setTimeout(() => {
            clearInterval(poll);
            setPreparing(false);
          }, 6000);
        }
        for (let i = startIdx; i < end; i++) {
          if (my !== playSeq.current) return;
          setCurrent(i);
          bump(i);
          // 预取下一句(仅实时合成的、且不越过本次终点)
          const nxt = sentences[i + 1];
          if (nxt && i + 1 < end && !(nxt.audio_url && !slow)) {
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

  // 顶部"朗读本章":断点在本章则从断点起,否则从章首。
  const playFromResume = useCallback(() => {
    const last = stateRef.current.last_seq;
    const idx = last > 0 ? sentences.findIndex((s) => s.seq === last) : -1;
    playChapterFrom(idx < 0 ? 0 : idx);
  }, [sentences, playChapterFrom]);

  // ---------- 章间导航 ----------
  const pos = useMemo(() => chapters.findIndex((c) => c.idx === chapterIdx), [chapters, chapterIdx]);
  const prevCh = pos > 0 ? chapters[pos - 1] : null;
  const nextCh = pos >= 0 && pos < chapters.length - 1 ? chapters[pos + 1] : null;

  const goChapter = useCallback(
    (idx: number) => {
      if (idx === chapterIdx) return;
      stopAll();
      pendingResumeSeqRef.current = 0; // 跳章滚到章首
      setChapterIdx(idx);
      setSearchParams({ ch: String(idx) }, { replace: true }); // 刷新/回退保持章位
    },
    [chapterIdx, stopAll, setSearchParams],
  );

  // ---------- 完成度(分母恒为全书 sentence_count)----------
  const total = book?.sentence_count ?? 0;
  const completionPct = useMemo(
    () => (total > 0 && furthestSeq >= 0 ? Math.round(((furthestSeq + 1) / total) * 100) : 0),
    [furthestSeq, total],
  );

  // 个人阅读速度:数据够(活跃≥120s 且读过≥50句)→ 实测 wpm(clamp);否则兜底 READING_WPM。
  const personalWpm = useMemo(() => {
    if (seconds > 120 && furthestSeq > 50 && book?.word_count && book?.sentence_count) {
      const avgWps = book.word_count / book.sentence_count;
      const wpm = ((furthestSeq + 1) * avgWps) / (seconds / 60);
      return Math.min(PERSONAL_WPM_MAX, Math.max(PERSONAL_WPM_MIN, wpm));
    }
    return READING_WPM;
  }, [seconds, furthestSeq, book]);

  // 本章预计还剩(剩余句数 → 词数 ÷ 个人wpm)。不做"已读 X 词"计数,避免刷进度感。返回原始分钟(可 <1,显示层处理"不到1分钟")。
  const remainMin = useMemo(() => {
    const words = sentences.filter((s) => s.seq > furthestSeq).reduce((n, s) => n + countWords(s.text_en), 0);
    return words > 0 ? words / personalWpm : 0;
  }, [sentences, furthestSeq, personalWpm]);

  // 段落流:同 para_idx 的句子归为一段(保留各句章内下标 i,供高亮/滚动/进度用)。
  // ---- 书签:加/删(段落级,存该段开头句 seq + preview 快照)/ 跳转(复用续读的 pendingResumeSeq 定位)----
  async function toggleBookmark(seq: number, chIdx: number, previewEn: string, previewCn: string) {
    if (!book || !uidRef.current) return;
    try {
      if (bookmarkedSeqs.has(seq)) {
        await removeBookmark(book.id, seq);
        setBookmarkedSeqs((prev) => {
          const n = new Set(prev);
          n.delete(seq);
          return n;
        });
        setBookmarks((prev) => prev.filter((b) => b.seq !== seq));
      } else {
        const bm = await addBookmark({
          bookId: book.id,
          seq,
          chapterIdx: chIdx,
          preview: previewEn.slice(0, 140),
          previewCn: previewCn.slice(0, 140),
        });
        setBookmarkedSeqs((prev) => new Set(prev).add(seq));
        if (bm) setBookmarks((prev) => [...prev, bm].sort((a, b) => a.seq - b.seq));
      }
    } catch (e) {
      console.warn("[bookmark] toggle failed", e);
    }
  }

  function jumpToBookmark(bm: LibraryBookmark) {
    setPanelOpen(false);
    if (bm.chapter_idx === chapterIdx) {
      const idx = sentences.findIndex((s) => s.seq === bm.seq);
      if (idx >= 0) liRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      pendingResumeSeqRef.current = bm.seq; // 换章后由章句就绪 effect 定位到该句(与续读同一机制)
      setChapterIdx(bm.chapter_idx);
    }
  }

  async function deleteBookmark(bm: LibraryBookmark) {
    if (!book) return;
    try {
      await removeBookmark(book.id, bm.seq);
      setBookmarks((prev) => prev.filter((b) => b.id !== bm.id));
      setBookmarkedSeqs((prev) => {
        const n = new Set(prev);
        n.delete(bm.seq);
        return n;
      });
    } catch (e) {
      console.warn("[bookmark] delete failed", e);
    }
  }

  const paragraphs = useMemo(() => {
    const out: { paraIdx: number; items: { s: LibrarySentence; i: number }[] }[] = [];
    sentences.forEach((s, i) => {
      const last = out[out.length - 1];
      if (last && last.paraIdx === s.para_idx) last.items.push({ s, i });
      else out.push({ paraIdx: s.para_idx, items: [{ s, i }] });
    });
    return out;
  }, [sentences]);

  // 章内分节(纯显示):按段词数在段边界切 3-10 节;章<600词不分。boundaries=起新节的段下标(0-based)。
  // ⚠️ 只算显示用节号;分节线是段落兄弟节点、不进 liRefs → 不碰锚点/停留判定/furthest。
  const sectionInfo = useMemo(() => {
    const paraWords = paragraphs.map((p) => p.items.reduce((n, x) => n + countWords(x.s.text_en), 0));
    return computeSections(paraWords);
  }, [paragraphs]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf8f5] px-4 py-16 text-center text-sm text-slate-400">
        <T>加载中…</T>
      </main>
    );
  }
  if (!book) {
    return (
      <main className="min-h-screen bg-[#faf8f5] px-4 py-16 text-center">
        <p className="text-sm text-slate-500">
          <T>没有找到这本书。</T>
        </p>
        <Link to="/library" className="mt-4 inline-block text-sm font-semibold text-sky-600">
          <T>← 返回书架</T>
        </Link>
      </main>
    );
  }

  const multiChapter = chapters.length > 1;
  const chapterLabel = (
    <>
      <T>第</T> {chapterIdx} <T>章</T>
      {multiChapter && (
        <span className="ml-1 text-slate-300">/ {chapters.length}</span>
      )}
    </>
  );

  // 章间导航条(顶部 + 章末复用)
  const chapterNav = (compact: boolean) =>
    multiChapter ? (
      <div className={`flex items-center justify-between gap-2 ${compact ? "" : "mt-8"}`}>
        <button
          type="button"
          disabled={!prevCh}
          onClick={() => prevCh && goChapter(prevCh.idx)}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 transition enabled:hover:bg-slate-100 disabled:opacity-30"
        >
          <ChevronLeft className="size-4" /> <T>上一章</T>
        </button>
        <span className="text-xs font-bold tabular-nums text-slate-400">{chapterLabel}</span>
        <button
          type="button"
          disabled={!nextCh}
          onClick={() => nextCh && goChapter(nextCh.idx)}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 transition enabled:hover:bg-slate-100 disabled:opacity-30"
        >
          <T>下一章</T> <ChevronRight className="size-4" />
        </button>
      </div>
    ) : null;

  // 插图定位:position = 【章内段号】1-based(见 DECISIONS.md「插图 position 语义」)。
  //   position=P → 渲染在本章第 P 段之前;position=0 → 章首;position > 本章段数 → 章末;负数(退休图)→ 不渲染。
  //   ⚠️ 不用全书 para_idx(那是全书连续递增,ch2 起首段号≫章内序 → 会把正数 position 全误判成章首而堆顶)。
  //   段落已按 chapter_idx 拉取(data.ts),故用段落在本章数组里的下标 +1 作章内段号,天然可靠。
  const chapterTitleNow = chapterTitle(book, chapterIdx);
  const paraCount = paragraphs.length;
  const topFigs = illus.filter((im) => im.position === 0);
  const tailFigs = illus.filter((im) => im.position > paraCount);
  const figsBeforeLocal = (ordinal: number) => illus.filter((im) => im.position === ordinal);

  // 点句子(非单词/非喇叭)→ 就地切换该句中文;点在按钮(词卡/喇叭)上则不触发。
  const onSentenceTap = (i: number) => (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    setRevealedCn((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#faf8f5]">
    <div className="mx-auto max-w-[800px] px-4 pb-28 pt-4">
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
      <div className="sticky top-0 z-10 mb-3 flex flex-wrap items-center gap-2 bg-[#faf8f5]/90 py-2 backdrop-blur">
        {preparing ? (
          <button
            type="button"
            onClick={stopAll}
            className="inline-flex items-center gap-1.5 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm"
          >
            <Loader2 className="size-4 animate-spin" /> <T>准备中…</T>
          </button>
        ) : playingAll ? (
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
        {signedIn && (
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
          >
            <Bookmark className="size-4" /> <T>书签</T>
            {bookmarks.length > 0 && <span className="text-xs text-slate-400">{bookmarks.length}</span>}
          </button>
        )}
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

      {/* 首次引导:标记语言一次性说明 */}
      {showOnboard && (
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2.5 text-xs leading-relaxed text-sky-900">
          <div className="flex-1">
            <T>点任意单词看释义 ·</T>{" "}
            <span className="underline decoration-[#fb7185] decoration-dashed decoration-1 underline-offset-2">
              <T>虚线</T>
            </span>
            <T>是固定搭配 ·</T>{" "}
            <span className="rounded-[3px] bg-amber-100 px-1">
              <T>高亮</T>
            </span>
            <T>是你收藏过的词</T>
          </div>
          <button
            type="button"
            onClick={dismissOnboard}
            aria-label="知道了"
            className="shrink-0 text-sky-400 transition hover:text-sky-600"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* 章标题 + 顶部章间导航 */}
      <div className="mb-4 pb-1">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-bold tracking-wide text-slate-400">{chapterLabel}</span>
          {remainMin > 0 && (
            <span className="text-xs text-slate-400">
              {remainMin < 1 ? (
                <>· <T>约还剩不到 1 分钟</T></>
              ) : (
                <>· <T>约还剩</T> {Math.round(remainMin)} <T>分钟</T></>
              )}
            </span>
          )}
        </div>
        {chapterTitleNow && (
          <h2 className="mt-1 font-serif text-lg font-bold leading-snug text-slate-800">
            {chapterTitleNow.title_en}
            {chapterTitleNow.title_zh && (
              <span className="ml-2 align-middle text-sm font-normal text-slate-400">
                {chapterTitleNow.title_zh}
              </span>
            )}
          </h2>
        )}
        {multiChapter && <div className="mt-2">{chapterNav(true)}</div>}
      </div>

      {/* 正文:仅当前章,逐句一行(🔊 + 点词) */}
      {chapterLoading ? (
        <p className="py-10 text-center text-sm text-slate-400">
          <T>加载中…</T>
        </p>
      ) : (
        <>
          {/* 段落流排版:同段句子连排成一段文字(像一本书);插图按 position 穿插;喇叭移到段落级。 */}
          <div
            onTouchStart={startLongPress}
            onTouchEnd={cancelLongPress}
            onTouchMove={cancelLongPress}
            onTouchCancel={cancelLongPress}
          >
            {topFigs.map(renderFigure)}
            {paragraphs.map((para, pi) => {
              const cnJoined = para.items.map((x) => x.s.text_cn ?? "").join("");
              const isFirstPara = pi === 0; // 章首段 → 省略段首喇叭
              // 首字下沉:仅当章首句以字母开头(如 ch9 以引号 “ 开头则跳过,避免下沉成大引号)。
              const dcActive = isFirstPara && /^[A-Za-z]/.test(para.items[0]?.s.text_en ?? "");
              return (
                <Fragment key={para.paraIdx}>
                  {/* 章内分节·发丝线里程碑(显示层·段落兄弟节点·不进 liRefs·不碰 furthest/停留判定)。克制:一条淡线 + N/M,无动画/弹窗/音效。 */}
                  {sectionInfo.boundaries.has(pi) && (
                    <div className="mx-auto my-8 flex max-w-[660px] items-center gap-3 text-slate-300 select-none" aria-hidden>
                      <span className="h-px flex-1 bg-slate-200" />
                      <span className="text-[11px] font-medium tabular-nums tracking-wide">
                        {sectionOfPara(pi, sectionInfo.boundaries)} / {sectionInfo.total}
                      </span>
                      <span className="h-px flex-1 bg-slate-200" />
                    </div>
                  )}
                  {figsBeforeLocal(pi + 1).map(renderFigure)}
                  {/* 正文列限宽 ~660px(≤80 字符/行);插图在外层容器满宽,故比正文宽 ~15%。 */}
                  <div className="relative mx-auto mb-7 max-w-[660px]">
                  {/* 段落书签图标(登录用户):独立按钮,在段落文字外侧,不拦截段内点词/chunk 点击。
                      桌面居右外侧空白;手机贴右内缘(正文已加右侧内边距避让,文字不被盖)。 */}
                  {signedIn && (
                    <button
                      type="button"
                      onClick={() =>
                        toggleBookmark(
                          para.items[0].s.seq,
                          chapterIdx,
                          para.items[0].s.text_en,
                          para.items[0].s.text_cn ?? "",
                        )
                      }
                      aria-label={bookmarkedSeqs.has(para.items[0].s.seq) ? "取消书签" : "添加书签"}
                      className="absolute right-0 top-0.5 z-10 inline-flex size-7 items-center justify-center rounded-full text-slate-300 transition hover:bg-sky-50 hover:text-sky-500 md:-right-9 md:top-0"
                    >
                      <Bookmark
                        className={`size-[18px] ${bookmarkedSeqs.has(para.items[0].s.seq) ? "fill-sky-500 text-sky-500" : ""}`}
                      />
                    </button>
                  )}
                  {/* 段右"中"按钮:仅纯英文(en)模式出现 → 单独显该段整段中译;both/cn 模式整篇已有中文,自动隐藏,不打架。 */}
                  {mode === "en" && cnJoined && (
                    <button
                      type="button"
                      onClick={() =>
                        setRevealedCnPara((prev) => {
                          const n = new Set(prev);
                          if (n.has(para.paraIdx)) n.delete(para.paraIdx);
                          else n.add(para.paraIdx);
                          return n;
                        })
                      }
                      aria-label={revealedCnPara.has(para.paraIdx) ? "隐藏本段中文" : "显示本段中文"}
                      className={`absolute right-0 z-10 inline-flex size-7 items-center justify-center rounded-full text-[13px] font-bold transition md:-right-9 ${signedIn ? "top-9 md:top-8" : "top-0.5 md:top-0"} ${revealedCnPara.has(para.paraIdx) ? "bg-sky-100 text-sky-600" : "text-slate-300 hover:bg-sky-50 hover:text-sky-500"}`}
                    >
                      中
                    </button>
                  )}
                  {/* 英文段(en / both 模式);段首一个喇叭(章首段除外),朗读本段 */}
                  {mode !== "cn" && (
                    <p
                      className={`${signedIn || mode === "en" ? "pr-8 md:pr-0 " : ""}text-[18px] leading-[1.9] text-slate-800${
                        dcActive
                          ? " first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-[3.4em] first-letter:font-bold first-letter:leading-[1.1] first-letter:text-slate-700"
                          : ""
                      }`}
                    >
                      {/* 段首喇叭:每段都给(含章首段),朗读本段读完停。颜色用 sky-500 让它明显可见。 */}
                      <button
                        type="button"
                        onClick={() => playChapterFrom(para.items[0].i, para.items[para.items.length - 1].i + 1)}
                        aria-label="朗读本段"
                        title="朗读本段(读完停)"
                        className="mr-1.5 inline-flex size-6 -translate-y-px items-center justify-center rounded-full align-middle bg-sky-50 text-sky-500 transition hover:bg-sky-100 hover:text-sky-600"
                      >
                        <Volume2 className="size-4" />
                      </button>
                      {para.items.map(({ s, i }, si) => {
                        const active = current === i;
                        // 章首段首句 → 首字下沉(纯装饰):首词单独渲染(::first-letter 大写下沉),其余句照常可点。
                        const dropCap = dcActive && si === 0;
                        let head = "";
                        let body = s.text_en;
                        if (dropCap) {
                          // 拆出首词做下沉纯文本;显式补回词后空格(修:旧版把空格吞了 → "Dorothylived")。
                          const m = s.text_en.match(/^(\S+)\s*([\s\S]*)$/);
                          if (m) {
                            head = m[1] + " ";
                            body = m[2];
                          }
                        }
                        return (
                          <span
                            key={s.id}
                            ref={(el) => {
                              liRefs.current[i] = el;
                            }}
                            onClick={onSentenceTap(i)}
                            className={`rounded transition ${active ? "bg-sky-100" : ""}`}
                          >
                            {head}
                            <TappableLine
                              sentence={body}
                              favorite={{ bookId: book.id, srcZh: s.text_cn ?? "" }}
                              favoritedTerms={favTerms}
                              reveal={reveal}
                              chunkPhrases={chunkTerms}
                              cultureNotes={cultureNotes}
                              wordSenses={wordSenses}
                              onFavoriteChange={handleFavChange}
                            />
                            {mode === "en" && revealedCn.has(i) && s.text_cn && (
                              <span className="text-slate-400">（{s.text_cn}）</span>
                            )}{" "}
                          </span>
                        );
                      })}
                    </p>
                  )}
                  {/* en 模式 + 点了段右"中" → 显该段整段中译(灰字附段后) */}
                  {mode === "en" && revealedCnPara.has(para.paraIdx) && cnJoined && (
                    <p className="mt-1.5 text-[15px] leading-relaxed text-slate-500">{cnJoined}</p>
                  )}
                  {/* 中文段(both / cn 模式):整段对应,不再每句一块 */}
                  {mode !== "en" && cnJoined && (
                    <p
                      className={
                        mode === "cn"
                          ? `${signedIn ? "pr-8 md:pr-0 " : ""}text-[18px] leading-[1.9] text-slate-800`
                          : "mt-1.5 text-[15px] leading-relaxed text-slate-500"
                      }
                    >
                      {cnJoined}
                    </p>
                  )}
                  </div>
                </Fragment>
              );
            })}
            {tailFigs.map(renderFigure)}
          </div>

          {/* 章末合集(③):本章文化笔记,默认折叠 */}
          <ChapterNotesCollection notes={chapterNotes} />

          {/* 章末:下一章 / 上一章 */}
          {chapterNav(false)}
        </>
      )}
    </div>

      <BookmarkPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        bookmarks={bookmarks}
        chapterLabel={(idx) => {
          const c = chapters.find((ch) => ch.idx === idx);
          const t = c?.title_zh || c?.title_en || "";
          return t ? `第${idx}章 · ${t}` : `第${idx}章`;
        }}
        onJump={jumpToBookmark}
        onDelete={deleteBookmark}
      />
    </div>
  );
}
