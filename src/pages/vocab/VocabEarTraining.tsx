/**
 * 磨耳朵(/vocab/listen)· 极简全屏播放器。
 *
 * ⚠️ 与 `VocabListen.tsx` 不是一回事:那个是「听音辨义」做题模式
 *    (路由 /vocab/:bankCode/listen),这个是**纯听**、不做题。
 *
 * ── 后台播放(这项的成败点)──
 *   ① 全程只用**一个长期存活的 `<audio>` 元素**,换词只换 src。
 *      每次 new Audio() 会让 iOS 认为是新的播放请求,锁屏后基本必断。
 *   ② 一个词的整段序列(单词/拆读/例句 + 间隔)在 earTraining.ts 里
 *      离线渲染成**一条**连续音频 —— 间隔是真静音,不靠 setTimeout。
 *      后台页面的定时器会被节流,靠 timer 补间隔锁屏必停。
 *   ③ MediaSession 设 metadata + play/pause/上一首/下一首,
 *      锁屏界面和耳机线控才有东西可点。
 *   ⚠️ 真机锁屏行为**只能 Aaron 用手机验**:无头浏览器没有锁屏,
 *      我这边只能验到"元素单例 / 一条连续音频 / MediaSession 已注册"。
 *
 * ⚠️ 速度用元素层 playbackRate(保音高)。代价是「拆读固定 1.0」做不到,
 *    详见 earTraining.ts 文件头的取舍说明。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Eye, EyeOff, Loader2, Pause, Play, Repeat, Settings2,
} from "lucide-react";
import BackLink from "@/components/BackLink";
import { cn } from "@/lib/utils";
import { bankColor, FONT_SERIF, FONT_STAT, readSelectedBank } from "@/lib/vocab/theme";
import { getBankByCode, type VocabBank } from "@/lib/vocab/data";
import { startTracking } from "@/lib/vocab/timeTracker";
import { getScenePack } from "@/lib/vocab/scenes";
import {
  buildPlaylist, buildWordClip, clipUrlsFor, diag, prefetchClip, recordListening,
  DEFAULT_TOGGLES, ELEMENTS, SOURCES,
  type ElementKey, type ElementToggles, type ListenItem, type SourceKind,
} from "@/lib/vocab/earTraining";

const SPEEDS = [0.7, 1.0, 1.25] as const;
const REPEATS = [1, 2, 3] as const;

export default function VocabEarTraining() {
  const [params] = useSearchParams();
  const [bank, setBank] = useState<VocabBank | null>(null);
  const [source, setSource] = useState<SourceKind>((params.get("from") as SourceKind) || "bank");
  const [items, setItems] = useState<ListenItem[] | null>(null);
  const [failed, setFailed] = useState(false);

  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loadingClip, setLoadingClip] = useState(false);
  const [toggles, setToggles] = useState<ElementToggles>(DEFAULT_TOGGLES);
  const [speed, setSpeed] = useState<number>(1.0);
  const [repeat, setRepeat] = useState<number>(1);
  const [loop, setLoop] = useState(false);
  const [reveal, setReveal] = useState(true);          // 先听后看:关掉就只剩进度
  const [showSettings, setShowSettings] = useState(false);
  const [done, setDone] = useState(false);             // 一轮听完 → 引导去测

  /**
   * 待播态。**进页面一律停在这里,不自动播**。
   * ⚠️ 由来:真机反馈"进页面一片安静,像坏了"。根因是浏览器的 autoplay policy ——
   *    没有用户手势就不允许出声,`play()` 直接被拒。
   *    以前的界面只在底部控制条里有一个小播放键,和其它四个控件挤在一起,
   *    用户根本不知道要点它。现在中央给一个大按钮,把"该干什么"说死。
   * ⚠️ armed 一旦为 true 就不再回到待播态 —— 用户中途暂停不该又被盖一层遮罩。
   */
  const [armed, setArmed] = useState(false);
  /** 第一条音频是否已拼好 —— 点下去必须立刻出声,不能点了还转圈 */
  const [ready, setReady] = useState(false);
  const [playError, setPlayError] = useState<string | null>(null);
  /** 场景来源时显示场景名(如「网络购物 · 8 个词」) */
  const [scenePackName, setScenePackName] = useState<string | null>(null);

  /* 单例 <audio>,**渲染进 DOM**(见 JSX 末尾),不要改成 new Audio()。
   * ⚠️ 两个原因:① 每次 new Audio() 会被 iOS 当成新的播放请求,锁屏基本必断;
   *    ② 游离(未挂载)的元素在 iOS 上媒体会话行为不稳,挂进 DOM 才是稳妥写法。 */
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objUrlRef = useRef<string | null>(null);
  const repeatLeftRef = useRef(1);
  /**
   * **续播意图**——是不是"用户想让它一直放下去"。
   * ⚠️ 这个必须是 ref、且**只由用户操作改写**,不能用 React 的 playing state 代替:
   *    给 <audio> 换 src 时,HTML 载入算法会把 paused 置 true 并**派发一个 pause 事件**,
   *    于是 onPause 把 playing 打成 false —— 下一条装好时判据已经没了,
   *    表现就是"一个词读完就停,连播断在词与词之间"(真机实测到的那个 bug)。
   *    playing state 从此只负责**显示**(按钮图标),不再当续播判据。
   */
  const wantPlayRef = useRef(false);
  const listenedRef = useRef(0);

  const packId = params.get("pack");
  const bankCode = params.get("bank") || readSelectedBank() || "toefl";

  /* 学习时长:与其它学习页同一套埋点 */
  useEffect(() => startTracking(), []);

  useEffect(() => {
    let alive = true;
    getBankByCode(bankCode).then(b => { if (alive) setBank(b); }).catch(() => { /* 词库取不到不拦播放 */ });
    return () => { alive = false; };
  }, [bankCode]);

  /* 带 ?pack= 进来的(从场景页点"听这条链")要能在待播态显示场景名 */
  useEffect(() => {
    if (!packId) { setScenePackName(null); return; }
    let alive = true;
    getScenePack(packId)
      .then(p => { if (alive) setScenePackName(p?.title_zh ?? null); })
      .catch(() => { /* 取不到就只显示词数,不拦播放 */ });
    return () => { alive = false; };
  }, [packId]);

  /* 选词。换来源就重建列表并回到第一个。 */
  useEffect(() => {
    let alive = true;
    setItems(null); setFailed(false); setIdx(0); setDone(false);
    buildPlaylist(source, { bankId: bank?.id ?? null, packId })
      .then(list => { if (alive) setItems(list); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [source, bank?.id, packId]);

  const total = items?.length ?? 0;
  const cur = items && items[idx] ? items[idx] : null;

  const releaseUrl = () => {
    if (objUrlRef.current) { URL.revokeObjectURL(objUrlRef.current); objUrlRef.current = null; }
  };

  /** 装载第 i 个词的整段音频(不自动播)。 */
  const loadClip = useCallback(async (i: number): Promise<boolean> => {
    const el = audioRef.current;
    const it = items?.[i];
    if (!el || !it) return false;
    const urls = clipUrlsFor(it, toggles);
    if (!urls.length) return false;                     // 整词无音频 → 交给调用方跳过
    setLoadingClip(true);
    try {
      const { url } = await buildWordClip(urls);
      releaseUrl();
      objUrlRef.current = url;
      el.src = url;
      el.playbackRate = speed;
      /* 装完立刻自查一次:src 空 = 后面点了必然没声,而且不会有任何报错,
         是最难查的一类"静默失败",所以在这里就把它喊出来 */
      if (!el.src || !el.src.startsWith("blob:")) {
        diag("✗ audio.src 异常(为空或不是 blob)", { src: el.src });
      } else {
        diag("✓ 已装载,可以播了", { 第几个: i + 1, 词: it.word.headword });
      }
      setReady(true);
      return true;
    } catch {
      return false;                                     // 解码/取音频失败 → 跳过这个词,不中断整轮
    } finally {
      setLoadingClip(false);
    }
  }, [items, toggles, speed]);

  /* 换词 / 换开关 → 重新装载。playing 为真则接着播。 */
  useEffect(() => {
    if (!items || !items.length) return;
    let alive = true;
    (async () => {
      const ok = await loadClip(idx);
      if (!alive) return;
      repeatLeftRef.current = repeat;
      if (!ok) { advance(1); return; }                  // 这个词没音频,直接下一个
      if (wantPlayRef.current) {
        audioRef.current?.play().catch((e: DOMException) => {
          diag("✗ 续播失败", { name: e?.name });
          wantPlayRef.current = false;
        });
      }
      /* 当前这条已经在播了,趁机把**下一个词**的音频字节烤进缓存,
         换词时就不用等网络(否则每换一词卡一下,像是断了) */
      const nxt = items?.[idx + 1];
      if (nxt) void prefetchClip(clipUrlsFor(nxt, toggles));
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, items, toggles]);

  /* 速度实时生效,不用重新渲染音频(元素层变速,保音高) */
  useEffect(() => { if (audioRef.current) audioRef.current.playbackRate = speed; }, [speed]);

  const advance = useCallback((step: number) => {
    setIdx(i => {
      const n = i + step;
      if (n >= total) {
        if (loop) return 0;
        wantPlayRef.current = false;      // 整轮走完:不再续播
        setPlaying(false);
        setDone(true);
        return i;
      }
      return n < 0 ? 0 : n;
    });
  }, [total, loop]);

  /* 一条放完:先按"每词重复 N 次"重放,次数用尽再进下一个。
     ⚠️ 这是整个序列里**唯一**依赖 JS 事件的地方(词与词之间),
        锁屏下 ended 仍会触发;真正危险的是中间那些间隔,已经烧成静音了。 */
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onEnded = () => {
      listenedRef.current += 1;
      if (repeatLeftRef.current > 1) {
        repeatLeftRef.current -= 1;
        el.currentTime = 0;
        el.play().catch(() => setPlaying(false));
        return;
      }
      advance(1);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    el.addEventListener("ended", onEnded);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    return () => {
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
    };
  }, [advance]);

  /* MediaSession:锁屏 / 耳机线控。没有它,锁屏界面是空的。 */
  useEffect(() => {
    const ms = navigator.mediaSession;
    if (!ms || !cur) return;
    try {
      ms.metadata = new MediaMetadata({
        title: cur.word.headword,
        artist: cur.word.def_zh ?? "",
        album: `磨耳朵 · ${bank?.name_zh ?? "词汇"}`,
        artwork: [{ src: "/favicon.png", sizes: "512x512", type: "image/png" }],
      });
      ms.setActionHandler("play", () => { audioRef.current?.play().catch(() => { /* 忽略 */ }); });
      ms.setActionHandler("pause", () => audioRef.current?.pause());
      ms.setActionHandler("previoustrack", () => advance(-1));
      ms.setActionHandler("nexttrack", () => advance(1));
    } catch { /* 不支持 MediaSession 的浏览器:播放照常,只是锁屏没界面 */ }
  }, [cur, bank?.name_zh, advance]);

  useEffect(() => {
    try { if (navigator.mediaSession) navigator.mediaSession.playbackState = playing ? "playing" : "paused"; }
    catch { /* 同上 */ }
  }, [playing]);

  /* 离开页面:停播 + 回收 blob + 记一次听力量 */
  useEffect(() => () => {
    wantPlayRef.current = false;
    audioRef.current?.pause();
    releaseUrl();
    void recordListening(listenedRef.current);
  }, []);

  const color = bankColor(bank?.code ?? "toefl");

  const toggle = (k: ElementKey) => {
    const meta = ELEMENTS.find(e => e.key === k);
    if (meta?.fixed || meta?.unavailable) return;
    setToggles(t => ({ ...t, [k]: !t[k] }));
  };

  const onPlayPause = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) { wantPlayRef.current = false; el.pause(); return; }
    setDone(false);
    setArmed(true);
    setPlayError(null);
    wantPlayRef.current = true;   // 用户明确要听下去
    el.play().then(() => diag("▶ 开始播放")).catch((e: DOMException) => {
      setPlaying(false);
      /* NotAllowedError = autoplay policy 拦下(没有用户手势 / 手势已过期)。
         这是"没声音"最常见的原因,必须让用户看得见,不能只在控制台。 */
      const why = e?.name === "NotAllowedError"
        ? "浏览器拦下了自动播放,请再点一次播放键"
        : `播放失败:${e?.name || "未知错误"}`;
      setPlayError(why);
      diag("✗ play() 被拒", { name: e?.name, message: e?.message, src: el.src?.slice(0, 32) });
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* 全程唯一的播放元素。src 每次换成"整段已拼好的一条音频"。
          preload=auto:锁屏前尽量把下一段缓冲进来。 */}
      <audio ref={audioRef} preload="auto" playsInline className="hidden" />
      <div className="h-[3px] w-full" style={{ background: color }} />
      {/* pb 要同时让开控制条(约 80px)和底部导航(64px);md 以上没有导航 */}
      <div className="mx-auto flex min-h-[calc(100vh-3px)] w-full max-w-[560px] flex-col px-4 pb-40 pt-3 md:pb-28">
        {/* ⚠️ 右上角**不能放任何控件**:全站登录胶囊是 `fixed right-3 top-3 z-50`,
               会盖住这一带。设置钮因此挪到下面来源行的行尾。
               (同样是无头测试点不动才发现的,不是肉眼看出来的。) */}
        <BackLink to="/vocab" className="inline-flex items-center gap-1 text-[13px] text-slate-500">
          ← 词汇中心
        </BackLink>

        {/* 来源四选一 + 设置 */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {SOURCES.map(s => (
            <button key={s.key} type="button" onClick={() => setSource(s.key)}
              disabled={s.key === "scene" && !packId}
              className={cn("rounded-full border px-3 py-1.5 text-[13px]",
                source === s.key ? "border-transparent text-white" : "border-black/[0.08] bg-white text-slate-600",
                s.key === "scene" && !packId && "opacity-40")}
              style={source === s.key ? { backgroundColor: color } : undefined}>
              {s.label}
            </button>
          ))}
          <button type="button" onClick={() => setShowSettings(v => !v)} aria-label="播放设置"
            className="ml-auto shrink-0 rounded-full border border-black/[0.08] bg-white p-2 text-slate-500">
            <Settings2 className="h-4 w-4" />
          </button>
        </div>

        {showSettings && (
          <div className="mt-3 rounded-2xl border border-black/[0.06] bg-white p-4">
            <div className="text-[13px] font-semibold text-slate-700">每个词读什么</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {ELEMENTS.map(e => {
                const on = toggles[e.key];
                const dead = e.fixed || e.unavailable;
                return (
                  <button key={e.key} type="button" onClick={() => toggle(e.key)} disabled={dead}
                    className={cn("rounded-full border px-3 py-1.5 text-[13px]",
                      on && !e.unavailable ? "border-transparent text-white" : "border-black/[0.08] bg-white text-slate-600",
                      dead && "cursor-not-allowed opacity-50")}
                    style={on && !e.unavailable ? { backgroundColor: color } : undefined}>
                    {e.label}
                    <span className="ml-1 text-[11px] opacity-70">{e.hint}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <div className="mb-1.5 text-[13px] font-semibold text-slate-700">速度</div>
                <div className="flex gap-1.5">
                  {SPEEDS.map(s => (
                    <button key={s} type="button" onClick={() => setSpeed(s)}
                      className={cn("flex-1 rounded-lg border py-1.5 text-[13px]",
                        speed === s ? "border-transparent text-white" : "border-black/[0.08] bg-white text-slate-600")}
                      style={speed === s ? { backgroundColor: color } : undefined}>{s}x</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1.5 text-[13px] font-semibold text-slate-700">每词重复</div>
                <div className="flex gap-1.5">
                  {REPEATS.map(r => (
                    <button key={r} type="button" onClick={() => setRepeat(r)}
                      className={cn("flex-1 rounded-lg border py-1.5 text-[13px]",
                        repeat === r ? "border-transparent text-white" : "border-black/[0.08] bg-white text-slate-600")}
                      style={repeat === r ? { backgroundColor: color } : undefined}>{r}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 主体:大字单词 */}
        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          {failed ? (
            <p className="text-[15px] text-slate-500">加载失败,换个来源试试</p>
          ) : items === null ? (
            <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
          ) : total === 0 ? (
            <p className="text-[15px] text-slate-500">
              {source === "mistakes" ? "错题本是空的,先去做几题" : "这个来源下没有可听的词"}
            </p>
          ) : !armed ? (
            /* ── 待播态:进页面一律停在这里 ──
               中央一个 80px 的实心大按钮 + 「点击开始」,把"该干什么"说死。
               上方显示即将播放的范围,从别处带参数进来的人一眼知道自己要听什么。 */
            <>
              <div className="mb-1 text-[15px] font-medium text-slate-700">
                {scenePackName ?? bank?.name_zh ?? "词汇"}
                <span className="text-slate-400"> · {total} 个词</span>
              </div>
              <div className="mb-6 text-[13px] text-slate-400">
                {[
                  toggles.syllable && "拆读",
                  toggles.example && "例句",
                ].filter(Boolean).join(" · ") || "只读单词"}
                {repeat > 1 ? ` · 每词 ${repeat} 遍` : ""}
              </div>

              <button type="button" onClick={onPlayPause} aria-label="开始播放"
                className="flex h-20 w-20 items-center justify-center rounded-full text-white shadow-xl transition-transform active:scale-95"
                style={{ backgroundColor: color }}>
                <Play className="h-9 w-9 translate-x-[2px]" />
              </button>
              <div className="mt-3 text-[14px] text-slate-500">点击开始</div>
              {/* 预拼状态:点下去要立刻出声,所以把"还在准备"如实说出来 */}
              <div className="mt-1 text-[12px] text-slate-400">
                {ready ? "第一条已准备好" : "正在准备第一条…"}
              </div>
              {playError && <div className="mt-2 text-[13px] text-rose-600">{playError}</div>}
            </>
          ) : (
            <>
              {reveal ? (
                <>
                  <div className="text-[40px] font-bold leading-tight tracking-tight text-slate-900">
                    {cur?.word.headword}
                  </div>
                  {cur?.word.ipa && (
                    /* ⚠️ 库里的 ipa **本身带斜杠**(/dɪˈfens/),再包一层会渲染成 //dɪˈfens//。
                       先剥掉首尾斜杠再统一包一次,两种存法都能正常显示。 */
                    <div className="mt-1 text-[15px] text-slate-400" style={{ fontFamily: FONT_SERIF }}>
                      /{cur.word.ipa.replace(/^\/+|\/+$/g, "")}/
                    </div>
                  )}
                  {cur?.word.def_zh && (
                    <div className="mt-3 max-w-[420px] text-[15px] leading-relaxed text-slate-600">{cur.word.def_zh}</div>
                  )}
                  {toggles.example && cur?.example && (
                    <div className="mt-4 max-w-[420px] text-[14px] leading-relaxed text-slate-400" style={{ fontFamily: FONT_SERIF }}>
                      {cur.example.sentence}
                    </div>
                  )}
                </>
              ) : (
                /* 先听后看:全遮住,只留"第几个" */
                <div className="text-[40px] font-bold tracking-[0.2em] text-slate-200">· · ·</div>
              )}

              <div className="mt-6 text-[13px] text-slate-400" style={{ fontVariantNumeric: "tabular-nums" }}>
                {Math.min(idx + 1, total)} / {total}
              </div>
            </>
          )}
        </div>

        {/* 一轮听完 */}
        {playError && armed && (
          <div className="mb-3 rounded-xl bg-rose-50 px-3 py-2 text-center text-[13px] text-rose-700">{playError}</div>
        )}

        {done && total > 0 && (
          <div className="mb-4 rounded-2xl border p-4 text-center"
            style={{ borderColor: `${color}40`, background: `${color}0D` }}>
            <p className="text-[15px] font-medium text-slate-800">这一轮听完了</p>
            <p className="mt-1 text-[13px] text-slate-500">听过不等于会 —— 要不要测一测?</p>
            <Link to={`/vocab/${bank?.code ?? "toefl"}/quiz`}
              className="mt-3 inline-block rounded-full px-4 py-2 text-[14px] font-medium text-white"
              style={{ backgroundColor: color }}>
              去测一测
            </Link>
          </div>
        )}

        {/* 底部控制条 */}
        {total > 0 && armed && (
          /* ⚠️ 必须**坐在全站底部导航之上**,不能也用 bottom-0:
                BottomTabBar 是 `fixed bottom-0 z-40 md:hidden`(高 4rem),
                这条控制条原本 bottom-0/z-20 → 手机上播放键整个被导航盖住、点不到。
                (无头测试点「播放」超时才暴露出来,不是我肉眼看出来的。)
                手机上抬 4rem 让开导航,md 以上导航不存在,回到 bottom-0。 */
          <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+4rem)] z-30 border-t border-black/[0.06] bg-white/95 px-4 pb-3 pt-3 backdrop-blur md:bottom-0 md:pb-[calc(env(safe-area-inset-bottom,0px)+10px)]">
            <div className="mx-auto flex max-w-[560px] items-center justify-center gap-5">
              <button type="button" onClick={() => setLoop(v => !v)} aria-label="循环"
                className={cn("rounded-full p-2", loop ? "text-white" : "text-slate-400")}
                style={loop ? { backgroundColor: color } : undefined}>
                <Repeat className="h-[18px] w-[18px]" />
              </button>
              <button type="button" onClick={() => advance(-1)} aria-label="上一个" className="rounded-full p-2 text-slate-600">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button type="button" onClick={onPlayPause} aria-label={playing ? "暂停" : "播放"}
                className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg"
                style={{ backgroundColor: color }}>
                {loadingClip
                  ? <Loader2 className="h-6 w-6 animate-spin" />
                  : playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 translate-x-[1px]" />}
              </button>
              <button type="button" onClick={() => advance(1)} aria-label="下一个" className="rounded-full p-2 text-slate-600">
                <ChevronRight className="h-6 w-6" />
              </button>
              <button type="button" onClick={() => setReveal(v => !v)} aria-label={reveal ? "隐藏释义" : "显示释义"}
                className="rounded-full p-2 text-slate-400">
                {reveal ? <Eye className="h-[18px] w-[18px]" /> : <EyeOff className="h-[18px] w-[18px]" />}
              </button>
            </div>
            <div className="mt-1.5 text-center text-[11px] text-slate-400" style={{ fontFamily: FONT_STAT }}>
              {speed}x · 每词 {repeat} 遍{loop ? " · 循环" : ""}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
