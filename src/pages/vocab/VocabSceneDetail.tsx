/**
 * 场景串记详情(/vocab/scenes/:id)。
 *
 * 五段固定顺序,对应"学一个场景"的实际过程:
 *   ① 主题头   —— 这是什么场景 + 连读整链
 *   ② 词链     —— 按**事情发生的顺序**过一遍 8-15 个说法
 *   ③ 好处/弊端 —— 议论文的两侧弹药
 *   ④ 双档短文 —— 把链上的词全部串回去(速览版直显,完整版展开)
 *   ⑤ 底部     —— 默写纸(未开放)+ 下一场景
 *
 * 两个学习机制:
 *   · **首访逐步展开**:第一次进来只亮第一环,点一下出下一环 ——
 *     一次性铺 15 条等于一张词表,叙事顺序就白排了。
 *     复访(localStorage 里有记录)直接全展开,复习的人不该再点 15 次。
 *   · **挖空自测**:词链英文变横线只留中文,自己回想;**短文不挖**
 *     (短文是答案纸,挖了就没法对答案了)。
 *
 * ⚠️ 写入只有一处:☆ 收藏 → user_vocab_wordbook(source_kind='scene_node')。
 *    其余全是读。
 * ⚠️ 好处/弊端两段依赖 benefits/drawbacks 列(SQLAA/vocab_scene_meta.sql)。
 *    列没建/为空时**整段不渲染**,不留一张空卡。
 */
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight, ChevronDown, EyeOff, ListChecks, Loader2,
  PenLine, Play, Square, Star, ThumbsDown, ThumbsUp, Volume2,
} from "lucide-react";
import BackLink from "@/components/BackLink";
import { cn } from "@/lib/utils";
import { FONT_SERIF, SCENE_COLOR } from "@/lib/vocab/theme";
import { isChaining, playChain, playUrl, stopAudio, subscribePlaying } from "@/lib/vocab/audio";
import { buildSceneHighlighter, splitContrast, type SceneSeg, type SceneTerm } from "@/lib/vocab/sceneHighlight";
import {
  countWords, getNextScenePack, getScenePack, listSceneFavorites, listSceneItems,
  markSceneSeen, readSeenScenes, toggleSceneFavorite,
  type SceneItem, type ScenePack,
} from "@/lib/vocab/scenes";

/** contrast 节点用琥珀色,与其余三型拉开 —— 它教的是"两个近义说法的差别",不是又一个新说法。 */
const AMBER = "#B45309";

export default function VocabSceneDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const [pack, setPack] = useState<ScenePack | null>(null);
  const [items, setItems] = useState<SceneItem[]>([]);
  const [next, setNext] = useState<{ id: string; title_zh: string } | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "missing" | "error">("loading");

  /** 已亮到第几环(首访 1,复访全部)。 */
  const [revealed, setRevealed] = useState(1);
  const [cloze, setCloze] = useState(false);
  /** 挖空模式下临时"偷看"的节点 —— 想不起来时点一下就看答案。 */
  const [peeked, setPeeked] = useState<Set<string>>(() => new Set());
  const [showFull, setShowFull] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const [pendingFav, setPendingFav] = useState<string | null>(null);
  const [favError, setFavError] = useState<string | null>(null);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [chaining, setChaining] = useState(false);
  /** 从短文点高亮词跳回链上时,给那一环一圈短暂的高亮 */
  const [flashId, setFlashId] = useState<string | null>(null);
  const nodeRefs = useRef<Record<string, HTMLLIElement | null>>({});

  useEffect(() => subscribePlaying(setPlayingKey), []);
  // 离开页面必须停音频,否则返回列表后声音还在放
  useEffect(() => () => stopAudio(), []);

  useEffect(() => {
    let alive = true;
    setState("loading");
    setRevealed(1); setShowFull(false); setCloze(false);
    setPeeked(new Set()); setFlashId(null);
    stopAudio();
    (async () => {
      try {
        const p = await getScenePack(id);
        if (!alive) return;
        if (!p) { setState("missing"); return; }
        setPack(p);

        const its = await listSceneItems(id);
        if (!alive) return;
        setItems(its);

        /* 复访全展开。判据是"这个场景以前看完过",不是"以前打开过" ——
           上次只点了两环就退出的人,这次该接着一环一环来。 */
        setRevealed(readSeenScenes().has(id) ? Math.max(1, its.length) : 1);
        setState("ok");

        // 收藏态和「下一场景」都不该拦住正文渲染,失败就当没有
        listSceneFavorites(its).then(f => { if (alive) setFavorites(f); }).catch(() => { /* 未登录/读失败:不显示收藏态 */ });
        getNextScenePack(p.sort_order, p.id).then(n => { if (alive) setNext(n); }).catch(() => { /* 没有下一个就不显示 */ });
      } catch {
        if (alive) setState("error");
      }
    })();
    return () => { alive = false; };
  }, [id]);

  /** 整条链亮完 = 这个场景算读过了。 */
  useEffect(() => {
    if (state === "ok" && items.length > 0 && revealed >= items.length) markSceneSeen(id);
  }, [state, items.length, revealed, id]);

  /* 短文高亮词条:contrast 的「A vs. B」必须拆开,整串在短文里永远不会原样出现。 */
  const terms: SceneTerm[] = useMemo(() => {
    const out: SceneTerm[] = [];
    for (const it of items) {
      const surfaces = it.kind === "contrast" ? splitContrast(it.text_en) : [it.text_en];
      for (const s of surfaces) out.push({ itemId: it.id, surface: s });
    }
    return out;
  }, [items]);
  const segment = useMemo(() => buildSceneHighlighter(terms), [terms]);

  /** 点短文里的高亮词 → 滚回链上那一环并闪一下。 */
  const jumpToNode = useCallback((itemId: string) => {
    // 挖空/未展开时先把那一环放出来,否则滚过去是一片横线
    const idx = items.findIndex(i => i.id === itemId);
    if (idx >= 0) setRevealed(r => Math.max(r, idx + 1));
    setPeeked(prev => new Set(prev).add(itemId));
    setFlashId(itemId);
    window.setTimeout(() => {
      nodeRefs.current[itemId]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
    window.setTimeout(() => setFlashId(cur => (cur === itemId ? null : cur)), 1600);
  }, [items]);

  const onToggleFav = async (item: SceneItem) => {
    if (pendingFav) return;
    setPendingFav(item.id);
    setFavError(null);
    const was = favorites.has(item.text_en);
    try {
      const now = await toggleSceneFavorite(item, id, was);
      setFavorites(prev => {
        const nextSet = new Set(prev);
        if (now) nextSet.add(item.text_en); else nextSet.delete(item.text_en);
        return nextSet;
      });
    } catch (e) {
      // 静默失败会让用户以为收藏成功了 —— 必须说清楚
      setFavError((e as Error)?.message === "NOT_SIGNED_IN" ? "登录后才能收藏" : "收藏没成功,再试一次");
    } finally {
      setPendingFav(null);
    }
  };

  const onChain = () => {
    if (chaining || isChaining()) { stopAudio(); setChaining(false); return; }
    // 连读读的是**已亮出来的**那些环,还没解锁的不该抢先剧透
    const list = items.slice(0, revealed).map(i => ({ url: i.audio_url, key: i.id }));
    if (!list.length) return;
    setChaining(true);
    playChain(list).finally(() => setChaining(false));
  };

  if (state === "missing") {
    return (
      <Shell>
        <div className="rounded-2xl border border-black/[0.06] bg-white p-8 text-center">
          <p className="text-[16px] font-medium text-slate-800">场景不存在</p>
          <p className="mt-1 text-[14px] text-slate-500">这个场景可能还没上线,或者链接不对。</p>
          <BackLink to="/vocab/scenes" className="mt-4 inline-block rounded-full border border-black/[0.08] px-4 py-1.5 text-[14px] text-slate-700">
            回场景列表
          </BackLink>
        </div>
      </Shell>
    );
  }

  if (state === "error") {
    return (
      <Shell>
        <div className="rounded-2xl border border-black/[0.06] bg-white p-8 text-center">
          <p className="text-[15px] text-slate-600">场景加载失败</p>
          <button onClick={() => window.location.reload()}
            className="mt-3 rounded-full border border-black/[0.08] px-4 py-1.5 text-[14px] text-slate-700">
            重试
          </button>
        </div>
      </Shell>
    );
  }

  if (state === "loading" || !pack) {
    return (
      <Shell>
        <div className="h-[28px] w-40 animate-pulse rounded bg-slate-100" />
        <div className="mt-4 space-y-2">
          {[0, 1, 2, 3].map(i => <div key={i} className="h-[62px] animate-pulse rounded-xl border border-black/[0.06] bg-white" />)}
        </div>
      </Shell>
    );
  }

  const allRevealed = revealed >= items.length;
  const benefits = pack.benefits ?? [];
  const drawbacks = pack.drawbacks ?? [];

  return (
    <Shell>
      <BackLink to="/vocab/scenes" className="mb-3 inline-flex items-center gap-1 text-[14px] text-slate-500">
        ← 场景串记
      </BackLink>

      {/* ── ① 主题头 ───────────────────────────────────────────── */}
      <h1 className="text-[26px] font-bold tracking-tight text-slate-900">{pack.title_zh}</h1>
      <p className="mt-0.5 text-[15px] text-slate-500" style={{ fontFamily: FONT_SERIF }}>{pack.theme_en}</p>

      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <button type="button" onClick={onChain}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-medium text-white"
          style={{ backgroundColor: SCENE_COLOR }}>
          {chaining ? <Square className="h-[15px] w-[15px]" /> : <Play className="h-[15px] w-[15px]" />}
          {chaining ? "停止" : "连读整链"}
        </button>

        <button type="button" onClick={() => { setCloze(v => !v); setPeeked(new Set()); }} aria-pressed={cloze}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[14px]",
            cloze ? "border-transparent bg-slate-900 text-white" : "border-black/[0.08] bg-white text-slate-600",
          )}>
          <EyeOff className="h-[15px] w-[15px]" />
          挖空自测
        </button>
      </div>

      {/* ── ② 词链 ─────────────────────────────────────────────── */}
      <div className="mb-2.5 mt-7 flex items-center gap-2">
        <h2 className="text-[16px] font-semibold text-slate-900">词链</h2>
        <span className="text-[13px] text-slate-400" style={{ fontVariantNumeric: "tabular-nums" }}>
          {Math.min(revealed, items.length)} / {items.length}
        </span>
        {cloze && <span className="text-[12px] text-slate-400">点横线看答案</span>}
      </div>

      <ol className="space-y-2">
        {items.slice(0, revealed).map((it, i) => (
          <NodeRow
            key={it.id}
            ref={el => { nodeRefs.current[it.id] = el; }}
            item={it}
            index={i + 1}
            cloze={cloze && !peeked.has(it.id)}
            onPeek={() => setPeeked(prev => new Set(prev).add(it.id))}
            playing={playingKey === it.id}
            flash={flashId === it.id}
            favorited={favorites.has(it.text_en)}
            pending={pendingFav === it.id}
            onToggleFav={() => onToggleFav(it)}
          />
        ))}
      </ol>

      {favError && <p className="mt-2 text-[13px] text-rose-600">{favError}</p>}

      {!allRevealed && (
        <button type="button" onClick={() => setRevealed(r => Math.min(items.length, r + 1))}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-black/[0.12] bg-white/60 py-3.5 text-[14px] font-medium"
          style={{ color: SCENE_COLOR }}>
          出下一环
          <ChevronDown className="h-[16px] w-[16px]" />
        </button>
      )}

      {/* ── ③ 好处 / 弊端 ──────────────────────────────────────── */}
      {(benefits.length > 0 || drawbacks.length > 0) && (
        <>
          <h2 className="mb-2.5 mt-7 text-[16px] font-semibold text-slate-900">好处 / 弊端</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ProConCard tone="pro" items={benefits} />
            <ProConCard tone="con" items={drawbacks} />
          </div>
        </>
      )}

      {/* ── ④ 双档短文 ─────────────────────────────────────────── */}
      <h2 className="mb-1 mt-7 text-[16px] font-semibold text-slate-900">短文</h2>
      <p className="mb-2.5 text-[13px] text-slate-400">链上的说法全在里面,点高亮词回到那一环</p>

      <Essay
        label="速览版"
        en={pack.essay_short_en}
        zh={pack.essay_short_zh}
        audioUrl={pack.essay_short_audio_url}
        audioKey={`${pack.id}:short`}
        playing={playingKey === `${pack.id}:short`}
        segment={segment}
        onTermClick={jumpToNode}
      />

      <div className="mt-3">
        {showFull ? (
          <Essay
            label="完整版"
            en={pack.essay_full_en}
            zh={pack.essay_full_zh}
            audioUrl={pack.essay_full_audio_url}
            audioKey={`${pack.id}:full`}
            playing={playingKey === `${pack.id}:full`}
            segment={segment}
            onTermClick={jumpToNode}
          />
        ) : (
          <button type="button" onClick={() => setShowFull(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-black/[0.12] bg-white/60 py-3.5 text-[14px] font-medium"
            style={{ color: SCENE_COLOR }}>
            展开完整版
            <ChevronDown className="h-[16px] w-[16px]" />
          </button>
        )}
      </div>

      {/* ── ⑤ 底部 ─────────────────────────────────────────────── */}
      <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* 「不可点」和「看起来不可点」是两回事 —— 必须显式标出即将开放 */}
        <div aria-disabled="true"
          className="flex cursor-not-allowed select-none items-center gap-2.5 rounded-2xl border border-black/[0.06] bg-slate-50/60 px-4 py-4 opacity-70">
          <PenLine className="h-[18px] w-[18px] shrink-0 text-slate-400" />
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-medium text-slate-400">生成默写纸</div>
            <div className="text-[12px] text-slate-400">即将开放</div>
          </div>
        </div>

        {next ? (
          <Link to={`/vocab/scenes/${next.id}`}
            className="flex items-center gap-2.5 rounded-2xl border border-black/[0.06] bg-white px-4 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] active:bg-slate-50">
            <ListChecks className="h-[18px] w-[18px] shrink-0" style={{ color: SCENE_COLOR }} />
            <div className="min-w-0 flex-1">
              <div className="text-[12px] text-slate-400">下一场景</div>
              <div className="truncate text-[15px] font-medium text-slate-800">{next.title_zh}</div>
            </div>
            <ArrowRight className="h-[18px] w-[18px] shrink-0 text-slate-300" />
          </Link>
        ) : (
          <button type="button" onClick={() => navigate("/vocab/scenes")}
            className="flex items-center gap-2.5 rounded-2xl border border-black/[0.06] bg-white px-4 py-4 text-left shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <ListChecks className="h-[18px] w-[18px] shrink-0" style={{ color: SCENE_COLOR }} />
            <div className="min-w-0 flex-1 text-[15px] font-medium text-slate-800">回场景列表</div>
          </button>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="h-[3px] w-full" style={{ background: SCENE_COLOR }} />
      <div className="mx-auto w-full max-w-[720px] px-4 pb-16 pt-4">{children}</div>
    </div>
  );
}

/* ── ② 的一行 ──────────────────────────────────────────────────── */

type NodeRowProps = {
  item: SceneItem;
  index: number;
  cloze: boolean;
  onPeek: () => void;
  playing: boolean;
  flash: boolean;
  favorited: boolean;
  pending: boolean;
  onToggleFav: () => void;
};

/** forwardRef:短文里点高亮词要能滚回这一行,得把 <li> 的 ref 交出去。 */
const NodeRow = forwardRef<HTMLLIElement, NodeRowProps>(function NodeRow(
  { item, index, cloze, onPeek, playing, flash, favorited, pending, onToggleFav },
  ref,
) {
  const isContrast = item.kind === "contrast";
  const accent = isContrast ? AMBER : SCENE_COLOR;

  return (
      <li ref={ref}
        className={cn(
          "flex items-start gap-3 rounded-2xl border bg-white px-3.5 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-shadow",
          isContrast ? "border-amber-200 bg-amber-50/40" : "border-black/[0.06]",
        )}
        style={flash ? { boxShadow: `0 0 0 2px ${accent}` } : undefined}>
        {/* 序号 = 叙事顺序里的第几步 */}
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold"
          style={{ backgroundColor: `${accent}1F`, color: accent, fontVariantNumeric: "tabular-nums" }}>
          {index}
        </span>

        <div className="min-w-0 flex-1">
          {cloze ? (
            /* 挖空:英文变横线,只留中文。长度跟着原文走,给一点"这词多长"的线索 */
            <button type="button" onClick={onPeek}
              className="block w-full text-left text-[15px] font-medium tracking-[0.08em] text-slate-300"
              aria-label="显示答案">
              {"_".repeat(Math.min(28, Math.max(4, item.text_en.length)))}
            </button>
          ) : isContrast ? (
            <ContrastText textEn={item.text_en} />
          ) : (
            <div className="text-[15px] font-medium text-slate-900">{item.text_en}</div>
          )}

          <div className="mt-0.5 text-[13px] leading-snug text-slate-500">{item.text_zh}</div>

          {/* 挂了 word_id 的才给跳词卡入口 —— 生活高频词多数不在托福词表里,挂不上属正常 */}
          {item.word_id && !cloze && (
            <Link to={`/vocab/toefl?word=${encodeURIComponent(item.text_en)}`}
              className="mt-1 inline-block text-[12px] font-medium" style={{ color: SCENE_COLOR }}>
              查看词卡 →
            </Link>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <button type="button" onClick={() => playUrl(item.audio_url, item.id)}
            disabled={!item.audio_url}
            aria-label="朗读"
            className={cn("rounded-full p-2 transition-colors", playing ? "bg-slate-100" : "active:bg-slate-100", !item.audio_url && "opacity-30")}>
            <Volume2 className="h-[17px] w-[17px]" style={{ color: playing ? accent : "#94A3B8" }} />
          </button>
          <button type="button" onClick={onToggleFav} disabled={pending}
            aria-label={favorited ? "取消收藏" : "收藏"} aria-pressed={favorited}
            className="rounded-full p-2 active:bg-slate-100">
            {pending
              ? <Loader2 className="h-[17px] w-[17px] animate-spin text-slate-300" />
              : <Star className={cn("h-[17px] w-[17px]", favorited ? "text-amber-500" : "text-slate-300")}
                  fill={favorited ? "currentColor" : "none"} />}
          </button>
        </div>
    </li>
  );
});

/** 「A vs. B」两侧分开排,中间那个 VS 做成琥珀色小标 —— 一眼看出这是"辨析"不是"新词"。 */
function ContrastText({ textEn }: { textEn: string }) {
  const parts = splitContrast(textEn);
  if (parts.length < 2) return <div className="text-[15px] font-medium text-slate-900">{textEn}</div>;
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] font-medium text-slate-900">
      <span>{parts[0]}</span>
      <span className="rounded px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
        style={{ backgroundColor: `${AMBER}1F`, color: AMBER }}>
        vs
      </span>
      <span>{parts.slice(1).join(" / ")}</span>
    </div>
  );
}

/* ── ③ 双色卡 ──────────────────────────────────────────────────── */

function ProConCard({ tone, items }: { tone: "pro" | "con"; items: string[] }) {
  if (!items.length) return null;
  const pro = tone === "pro";
  return (
    <div className={cn(
      "rounded-2xl border p-4",
      pro ? "border-emerald-200 bg-emerald-50/50" : "border-rose-200 bg-rose-50/50",
    )}>
      <div className={cn(
        "mb-2 flex items-center gap-1.5 text-[14px] font-semibold",
        pro ? "text-emerald-800" : "text-rose-800",
      )}>
        {pro ? <ThumbsUp className="h-[16px] w-[16px]" /> : <ThumbsDown className="h-[16px] w-[16px]" />}
        {pro ? "Benefits 好处" : "Drawbacks 弊端"}
      </div>
      <ul className="space-y-1">
        {items.map((t, i) => (
          <li key={i} className={cn("flex items-start gap-1.5 text-[14px]", pro ? "text-emerald-900" : "text-rose-900")}>
            <span className={cn("mt-[7px] h-1 w-1 shrink-0 rounded-full", pro ? "bg-emerald-500" : "bg-rose-500")} />
            <span style={{ fontFamily: FONT_SERIF }}>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── ④ 一档短文 ────────────────────────────────────────────────── */

function Essay({
  label, en, zh, audioUrl, audioKey, playing, segment, onTermClick,
}: {
  label: string;
  en: string;
  zh: string;
  audioUrl: string | null;
  audioKey: string;
  playing: boolean;
  segment: (text: string) => SceneSeg[];
  onTermClick: (itemId: string) => void;
}) {
  const [showZh, setShowZh] = useState(false);
  // 段落按空行切 —— 库里的短文是"引入/好处/弊端/结论"的多段结构,连成一坨没法读
  const paras = useMemo(() => en.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean), [en]);
  const parasZh = useMemo(() => zh.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean), [zh]);

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="text-[13px] font-semibold text-slate-700">{label}</span>
        <span className="text-[12px] text-slate-400" style={{ fontVariantNumeric: "tabular-nums" }}>
          {countWords(en)} 词
        </span>
        <button type="button" onClick={() => playUrl(audioUrl, audioKey)} disabled={!audioUrl}
          aria-label="朗读短文"
          className={cn("ml-auto rounded-full p-1.5", playing ? "bg-slate-100" : "active:bg-slate-100", !audioUrl && "opacity-30")}>
          <Volume2 className="h-[16px] w-[16px]" style={{ color: playing ? SCENE_COLOR : "#94A3B8" }} />
        </button>
        <button type="button" onClick={() => setShowZh(v => !v)}
          className="rounded-full border border-black/[0.08] px-2.5 py-1 text-[12px] text-slate-500">
          {showZh ? "隐藏译文" : "看译文"}
        </button>
      </div>

      <div className="space-y-2.5" style={{ fontFamily: FONT_SERIF }}>
        {paras.map((p, i) => (
          <p key={i} className="text-[15px] leading-[1.75] text-slate-800">
            {segment(p).map((s, j) =>
              s.itemId ? (
                <button key={j} type="button" onClick={() => onTermClick(s.itemId as string)}
                  className="rounded px-0.5 font-semibold underline decoration-dotted underline-offset-2"
                  style={{ color: SCENE_COLOR, backgroundColor: `${SCENE_COLOR}14` }}>
                  {s.text}
                </button>
              ) : (
                <span key={j}>{s.text}</span>
              ),
            )}
          </p>
        ))}
      </div>

      {showZh && (
        <div className="mt-3 space-y-2 border-t border-black/[0.06] pt-3">
          {parasZh.map((p, i) => (
            <p key={i} className="text-[14px] leading-[1.8] text-slate-500">{p}</p>
          ))}
        </div>
      )}
    </div>
  );
}
