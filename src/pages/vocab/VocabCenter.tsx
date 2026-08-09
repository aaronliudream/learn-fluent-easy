/**
 * 词汇中心(/vocab)· 纯展示,零写入。
 *
 * 版式照 docs/vocab-bank/VOCAB_DESIGN_SPEC.md,一句话审美目标是**克制**:
 * 唯一渐变位属于主 CTA —— 本页没有主 CTA,所以本页一处渐变都没有;
 * 其余全是白卡 + 细边 + 大留白。
 *
 * ── 统计分两层,两层的分母世界不一样,混了用户就看不懂 ──
 *   ① **当前词库**(随顶部下拉切换):进度 N/总数、圆环、错题本、今日复习。
 *      全部集中在页面上半部分、紧挨着下拉,视觉上归属明确。
 *   ② **全局累计**(跨所有词库、按 word_id 去重、永远只涨):
 *      累计学习/掌握/时长/积分,**以及里程碑**。放在下方,标题不带词库名,字号小一档。
 *      ⚠️ 里程碑归这一层是 Aaron 2026-08-07 的裁决:它是成就系统,
 *         跟着词库走的话切一次库徽章就归零,用户读成"进度被清空"。
 *   ⚠️ 去重是 user_vocab_mastery 的表结构自带的((user_id, word_id) 唯一),
 *      同一个词同时属于托福和四级只算一次;各库进度那层才 join vocab_word_banks。
 *
 * ── 页面三层,对应用户的动线 ──
 *   ⓪ 场景串记横幅(独立学习方式,不属于任何词库)→ 分隔线
 *   ① 我的状态:当前词库卡 → 学习进度(四条横条)→ 错题本 + 今日复习  ← 看我在哪
 *   ② 学习方式:单词学习 / 磨耳朵 / 词块与习语 / 中文这样说 / 易混词辨析  ← 选今天怎么学
 *   ③ 成就:周报 → 里程碑(全局)→ 我的数据四宫格 + 打卡月历  ← 看我攒了多少
 *   ⚠️ 场景串记的位置改过两次:最初在页面**最底部**(层级太低),
 *      后来并进学习方式组(会让人以为它在学当前词库),
 *      2026-08-09 定版为**最顶部独立横幅 + 分隔线**。别再挪。
 *   ⚠️ 未上线的方式照样列出来、灰显不可点 —— 让用户看见这个板块在长。
 *
 * ── 首屏(iPhone SE 375×667)──
 *   第一层要在不滚动时看完。实测底边(375×667):词库卡 205 / 学习进度卡 458 /
 *   两张小卡 550(空态)。空态提示框本身占 86px,登录且有学习记录时它不渲染 → 收到 464。
 *   ⚠️ 即真实用户装得下,**全新/未登录用户的两张小卡会被推到折线下一点**。
 *   ⚠️ 词库卡是这一页的第一个决策点,分量是**故意**给足的;要再压首屏只能从别处找,
 *      别把它压回一颗小胶囊。
 * ⚠️ 未登录/无数据必须正常渲染 0 态(RLS 让未登录读掌握度得到空数组,那是预期行为)。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle, ArrowLeftRight, CalendarClock, Check, ChevronDown, ChevronRight,
  Blocks, Headphones, Layers, Link2, Lock, MessageSquareQuote, Shuffle,
} from "lucide-react";
import BackLink from "@/components/BackLink";
import { cn } from "@/lib/utils";
import StatsPanel from "@/components/vocab/StatsPanel";
import { bankColor, CTA_SHADOW, FONT_STAT, GRAD_CTA, MILESTONES, readSelectedBank, SCENE_COLOR, tintToWhite, writeSelectedBank } from "@/lib/vocab/theme";
import { countScenePacks, countScenesDone } from "@/lib/vocab/scenes";
import { needsUnlock } from "@/lib/vocab/paywall";
import {
  listBanks, getBankProgressFast, dueCountForBank, mistakeCountForBank, getGlobalTotals,
  bankWordCounts, currentUserId, type VocabBank, type BankProgress,
} from "@/lib/vocab/data";
import MyDataPanel from "@/components/vocab/MyDataPanel";
import {
  WeeklyBanner, Confetti, ShareCard, MilestoneSummary,
  useMilestoneCelebration, type WeeklySummary,
} from "@/components/vocab/Incentive";
import { getStats, type UserStats } from "@/lib/vocab/stats";
import { buildTodayPlan, type TodayPlan } from "@/lib/vocab/todayPlan";
import { readStatsCache, writeStatsCache } from "@/lib/vocab/statsCache";

/** 默认词库 —— 托福是首发库。找不到就退到第一个可用库(见 pickInitialBank)。 */
const DEFAULT_BANK = "toefl";

export function pickInitialBank(banks: VocabBank[]): VocabBank | null {
  const active = banks.filter(b => b.is_active);
  if (!active.length) return null;
  const saved = readSelectedBank();
  /* 记住的库可能已经下线 —— 那就当没记过,不能让用户卡在一个空库上 */
  return active.find(b => b.code === saved)
    ?? active.find(b => b.code === DEFAULT_BANK)
    ?? active[0];
}

export default function VocabCenter() {
  const [banks, setBanks] = useState<VocabBank[]>([]);
  const [selected, setSelected] = useState<VocabBank | null>(null);
  const [failed, setFailed] = useState(false);
  /* 三态:null = 还没问出来。
   * ⚠️ 不能用 false 当初始值 —— 已登录用户在 auth 往返那 200ms 里会先看到
   *    「登录后查看你的学习数据」,然后闪成真数据。假状态比转圈更糟。 */
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  /** 当前词库那一层。null = 还没就绪 → 骨架屏,**绝不渲染 0**。 */
  const [bankStats, setBankStats] = useState<{ progress: BankProgress; due: number; mistakes: number } | null>(null);
  /** 全局累计那一层(与词库无关,只加载一次)。 */
  const [totals, setTotals] = useState<{ learned: number; mastered: number } | null>(null);
  const [uStats, setUStats] = useState<UserStats | null>(null);
  const [share, setShare] = useState<null | { mastered: number; streak: number; points: number; totalMs: number; milestone?: number | null }>(null);

  /* ① 词库列表 + 全局累计:与选哪个库无关,只跑一次 */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const uid = await currentUserId();
        if (!alive) return;
        setSignedIn(!!uid);

        const list = await listBanks();
        if (!alive) return;
        setBanks(list);
        setSelected(pickInitialBank(list));

        /* 全局累计只有登录才有意义;未登录直接给 0 是**正确值**不是占位 */
        const t = uid ? await getGlobalTotals().catch(() => ({ learned: 0, mastered: 0 })) : { learned: 0, mastered: 0 };
        if (!alive) return;
        setTotals(t);
        getStats().then(v => { if (alive) setUStats(v); }).catch(() => { /* 激励数据缺失不该拦住中心页 */ });
      } catch {
        if (alive) setFailed(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  /* ② 当前词库那一层:换库就重跑。三件事互不依赖 → 一次并发,不做串行瀑布 */
  useEffect(() => {
    if (!selected) return;
    let alive = true;

    /* 二次进入秒显:先铺**这个库**上次的数字,再后台刷新(stale-while-revalidate)。
     * ⚠️ 缓存只用于"先显示",永远不跳过后台刷新 —— 否则数据会停在旧值。
     * ⚠️ 缓存按 bankCode 分开:切库时铺上一个库的数字比骨架屏还糟。 */
    const cached = readStatsCache(selected.code);
    setBankStats(cached
      ? { progress: { mastered: cached.mastered, learning: cached.learning, untouched: Math.max(0, cached.total - cached.mastered - cached.learning), total: cached.total }, due: cached.due, mistakes: cached.mistakes }
      : null);                   // 没缓存就回骨架:换库过程中显示上一个库的数字是错的

    (async () => {
      try {
        const uid = await currentUserId();
        const [progress, due, mistakes] = await Promise.all([
          getBankProgressFast(selected.id, selected.total_words, uid)
            .catch(() => ({ mastered: 0, learning: 0, untouched: 0, total: 0 } as BankProgress)),
          uid ? dueCountForBank(selected.id).catch(() => 0) : Promise.resolve(0),
          uid ? mistakeCountForBank(selected.id).catch(() => 0) : Promise.resolve(0),
        ]);
        if (!alive) return;
        setBankStats({ progress, due, mistakes });
        writeStatsCache(selected.code, {
          due, mistakes, mastered: progress.mastered, learning: progress.learning, total: progress.total,
        });
      } catch {
        if (alive) setBankStats({ progress: { mastered: 0, learning: 0, untouched: 0, total: 0 }, due: 0, mistakes: 0 });
      }
    })();
    return () => { alive = false; };
  }, [selected]);

  const onPick = useCallback((b: VocabBank) => {
    setSelected(b);
    writeSelectedBank(b.code);
  }, []);

  const color = bankColor(selected?.code ?? DEFAULT_BANK);
  const p = bankStats?.progress;
  const bankMastered = p?.mastered ?? 0;
  const bankTotal = p?.total ?? 0;

  /* 里程碑跟随**全局累计**掌握数,不跟词库(Aaron 2026-08-07 裁决):
   * 它是成就系统,切库归零会让用户觉得"进度被清空";全局累计随着学多个库一直涨。
   * 彩带和分享卡必须用同一个数,否则会出现"横幅说达成了、彩带不放"。 */
  const globalMastered = totals?.mastered ?? null;
  const celebrate = useMilestoneCelebration(globalMastered ?? 0);
  const [confettiDone, setConfettiDone] = useState(false);

  return (
    /* 暖底 #FAF7F2 = index.css 的 --background(warm ivory,注释写着 low blue-light,
       适合长时间学习)。不用纯白、也不用冷灰 —— 与全站底色一致。 */
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="mx-auto w-full max-w-[720px] px-4 pb-16 pt-3">
        <BackLink to="/" className="mb-2 inline-flex items-center gap-1 text-[13px] text-slate-500">
          ← 返回首页
        </BackLink>

        <h1 className="mb-2 text-[24px] font-bold tracking-tight text-slate-900">词汇</h1>

        {/* 场景串记 —— 独立学习方式,放在最顶上并与下方明确切开。
            ⚠️ 它**不属于**下面那套"当前词库"的层级,别把它挪回学习方式组或下拉里,
               理由见 SceneBanner 组件注释。 */}
        <SceneBanner />

        {/* ═══ 第一层「我的状态」:我在哪 ═══ */}
        {/* 当前词库卡 —— 进入这一页的第一个决策点,视觉分量必须压得住。
            该库进度(N/总数 + 细条)长在卡里,不再单列一行。 */}
        <BankCard banks={banks} selected={selected} onPick={onPick}
          color={color} progress={p ?? null} />

        {/* 今日学习 —— 词库卡正下方最显眼位置。
            ⚠️ 这是给"不想想、直接学"的用户的主路径;学习方式组那五项**全部保留**,
               给想自己挑的用户。两条路并存,别为了突出这个去砍那五项。 */}
        <TodayButton bankId={selected?.id ?? null} color={color} signedIn={signedIn} />

        {/* ⚠️ 骨架屏交给 StatsPanel 自己(loading 属性)—— 之前这里手写了一份
            "环 + 大字"形状的骨架,而卡片改成四条横条后那个形状对不上了,
            会先闪一个圆环再变成四条。骨架必须和真身同形,否则它只是另一种跳动。 */}
        <StatsPanel
          compact
          loading={!bankStats}
          mastered={bankMastered}
          learning={p?.learning ?? 0}
          untouched={p?.untouched ?? 0}
          color={color}
          growthWordIds={undefined}
          /* ⚠️ 这里**故意不传 emptyHint** —— 那个提示框在 SE 上占 86px,
             把首屏的两张小卡挤到折线下。信息没丢,挪到卡外一行 12px 灰字
             (见下方 EmptyHintLine),体积小 80%。
             StatsPanel 的 emptyHint 参数保留原样,词库页还在用。 */
        />

        {/* 空态引导:一行 12px 灰字,不是一个框(见上方 StatsPanel 处的注释)。
            只在真的还没有任何学习记录时出 —— 有数据的人不需要被教怎么开始。 */}
        {bankStats && bankMastered === 0 && (p?.learning ?? 0) === 0 && signedIn !== null && (
          <p className="mt-1.5 text-[12px] leading-snug text-slate-400">
            {signedIn
              ? "还没有学习记录,点上面的词库开始,答对的词会自动记进掌握度"
              : "登录后开始记录进度,未登录也可先试做 20 题"}
          </p>
        )}

        <div className="mt-2.5 grid grid-cols-2 gap-3">
          {/* ⚠️ 原来错题本卡里还挂着 <HardestWords>(「和 environment 大战了 4 回合」)当第二行,
              单行化之后没位置了,已摘掉。组件本身还在 Incentive.tsx,
              要保留这条激励文案建议挪到 /vocab/mistakes 页顶 —— 那里才是它的主场。 */}
          <EntryCard icon={<AlertCircle className="h-[17px] w-[17px]" />} label="错题本"
            count={bankStats?.mistakes ?? null} hint="待清" to="/vocab/mistakes" />
          <EntryCard icon={<CalendarClock className="h-[17px] w-[17px]" />} label="今日复习"
            count={bankStats?.due ?? null} hint="到期" to="/vocab/review" />
        </div>

        {/* ↓↓↓ 以下不要求首屏可见 ↓↓↓ */}

        {/* ═══ 第二层「学习方式」:今天怎么学 ═══ */}
        <StudyModes bankCode={selected?.code ?? null} color={color} />

        {/* ═══ 第三层「成就」:我攒了多少 ═══ */}
        <h2 className="mb-2 mt-6 text-[13px] font-medium text-slate-400">成就</h2>

        {/* 周报是"每周一才出、可关闭"的偶发块,大多数日子根本不占位。
            它讲的是"上周攒了多少",归成就层比夹在方式层里更顺。
            分享卡上的「我的词汇量 N」也是全局累计 —— 与里程碑同一个数。 */}
        <WeeklyBanner color={color} onShare={(w: WeeklySummary) => setShare({
          mastered: globalMastered ?? 0, streak: w.streak, points: uStats?.total_points ?? 0,
          totalMs: uStats?.total_time_ms ?? 0,
          milestone: MILESTONES.filter(m => (globalMastered ?? 0) >= m).pop() ?? null,
        })} />

        <MilestoneSummary mastered={globalMastered} color={color} />

        <MyDataPanel color={color} signedIn={signedIn}
          globalLearned={totals?.learned ?? null}
          globalMastered={totals?.mastered ?? null} />

        {failed && (
          <div className="mt-4 rounded-2xl border border-black/[0.06] bg-white p-6 text-center">
            <p className="text-[15px] text-slate-600">词库加载失败</p>
            <button onClick={() => window.location.reload()}
              className="mt-3 rounded-full border border-black/[0.08] px-4 py-1.5 text-[14px] text-slate-700">
              重试
            </button>
          </div>
        )}
      </div>

      {celebrate && !confettiDone && <Confetti onDone={() => setConfettiDone(true)} />}
      {share && <ShareCard data={share} onClose={() => setShare(null)} />}
    </div>
  );
}

/* ── 当前词库卡 ─────────────────────────────────────────────────── */

/**
 * 当前词库卡 —— 整块可点展开的选择器,不是系统原生 select。
 *
 * ⚠️ 由来:上一版是标题右侧一颗小胶囊下拉,视觉上像个次要控件;
 *    但**它是用户进这一页的第一个决策点**(今天学哪个库),分量必须压得住。
 *    现在:身份色 8% 淡染的卡 + 20px 粗体库名 + 该库进度长在卡里。
 *
 * ⚠️ 卡底那层"身份色淡染"用 **tintToWhite(color, 0.92)**,不是 8% 透明度。
 *    实测把 `${color}14`(≈8% alpha)叠在暖白底 #FAF7F2 上算出来是 rgb(231,228,229)——
 *    **就是一块灰**,身份色白染了。混色版是 rgb(236,240,245),同样浅但一眼看得出是蓝的。
 *    (同理绝不能写 Tailwind 的 `bg-[#xxx]/8`:那套只有 5 的倍数才编得出来,/8 直接透明。)
 * ⚠️ 圆角/细边/阴影沿用 VOCAB_DESIGN_SPEC 第 1 节那套(16px 圆角 + 1px 细边),
 *    没有另起一套;卡本身不用渐变(全页唯一渐变位属于主 CTA)。
 *
 * ── 「这里能换词库」怎么讲清楚(三层同时上)──
 *   ① 右侧一颗**有形态的胶囊**「⇄ 切换词库」:描边 + 内边距 + 按压态,
 *      不是一个漂浮的箭头。判据是"不看说明能不能懂"。
 *   ② 卡底一行「还有 N 个词库陆续上线 · 点击切换」—— 用数字制造好奇,
 *      让用户知道背后有货,不是只有托福一个。
 *   ③ 首访做一次 1.5s 呼吸动效,点一下即止,并写 localStorage 永不再来。
 *
 * ⚠️ 那颗胶囊是 `<span>` 不是 `<button>` —— **整张卡本身就是 button,
 *    里面再嵌 button 是非法 HTML**(嵌套交互元素,读屏器也会读乱)。
 *    点卡任意处 = 展开,行为完全一致,所以胶囊只负责"长得像按钮";
 *    按压态靠父级 `group` 的 `group-active:` 传下去,手感不丢。
 * ⚠️ 文案里的 N 一律来自 banks 实际条数,不写死 —— 写死的数字迟早和库对不上。
 */
const SWITCH_HINT_KEY = "vocab_bank_switch_hinted";
function BankCard({ banks, selected, onPick, color, progress }: {
  banks: VocabBank[];
  selected: VocabBank | null;
  onPick: (b: VocabBank) => void;
  color: string;
  progress: BankProgress | null;
}) {
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const boxRef = useRef<HTMLDivElement | null>(null);

  const active = useMemo(() => banks.filter(b => b.is_active), [banks]);
  const soon = useMemo(() => banks.filter(b => !b.is_active), [banks]);

  /* 首访呼吸引导。**一进来就写 localStorage**(不是等点击才写)——
     "只做一次"指的是只演一次,用户看没看到都不该演第二次。
     ⚠️ 尊重 prefers-reduced-motion:命中就不演,那部分用户靠胶囊和底部那行文案照样看得懂。 */
  const [breathe, setBreathe] = useState(false);
  useEffect(() => {
    if (!banks.length) return;              // 等词库到位再演,否则对着骨架呼吸
    let reduced = false;
    try { reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { /* 老浏览器当没有 */ }
    if (reduced) return;
    try {
      if (localStorage.getItem(SWITCH_HINT_KEY) === "1") return;
      localStorage.setItem(SWITCH_HINT_KEY, "1");
    } catch { return; }                     // 隐私模式存不了 → 干脆不演,免得每次都演
    setBreathe(true);
    const t = window.setTimeout(() => setBreathe(false), 1600);
    return () => window.clearTimeout(t);
  }, [banks.length]);

  /* 面板右侧那个词数:只给**已上线**的库数(未上线的显示「敬请期待」)。
     展开时才拉 —— 没点开的人不该为它付一次往返。 */
  useEffect(() => {
    if (!open || !active.length) return;
    let alive = true;
    const missing = active.filter(b => counts[b.id] === undefined).map(b => b.id);
    if (!missing.length) return;
    bankWordCounts(missing)
      .then(m => { if (alive) setCounts(prev => ({ ...prev, ...m })); })
      .catch(() => { /* 数不出来就不显示那个数,面板照常能选 */ });
    return () => { alive = false; };
  }, [open, active, counts]);

  /* 点外面收起。用 pointerdown 而不是 click —— click 在移动端要等一拍判定,
     期间用户已经在滚动了,面板还挂着很出戏。 */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const total = progress?.total ?? 0;
  const mastered = progress?.mastered ?? 0;
  const learning = progress?.learning ?? 0;
  const pct = total > 0 ? (mastered / total) * 100 : 0;
  const pctReached = total > 0 ? ((mastered + learning) / total) * 100 : 0;

  return (
    <div ref={boxRef} className="relative">
      <div className="mb-1 text-[12px] text-slate-400">当前词库</div>

      {/* 呼吸动效的 keyframes 就地注入(与 Incentive 的彩带同一套做法,不进全局 css) */}
      {breathe && <style>{"@keyframes vbankbreathe{0%,45%,100%{transform:scale(1)}22%,68%{transform:scale(1.018)}}"}</style>}

      <button type="button" onClick={() => { setOpen(v => !v); setBreathe(false); }}
        aria-haspopup="listbox" aria-expanded={open} disabled={!banks.length}
        className="group block w-full rounded-2xl border p-3.5 text-left shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-transform duration-100 active:scale-[0.99]"
        style={{
          backgroundColor: tintToWhite(color, 0.92),
          borderColor: tintToWhite(color, 0.72),
          animation: breathe ? "vbankbreathe 1.5s ease-in-out 1" : undefined,
        }}>
        <div className="flex items-center gap-2.5">
          <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
          <span className="min-w-0 flex-1 truncate text-[20px] font-bold tracking-tight text-slate-900">
            {selected?.name_zh ?? (banks.length ? "选择词库" : "加载中")}
          </span>
          {selected && needsUnlock(selected) && <Lock className="h-4 w-4 shrink-0 text-slate-400" />}

          {/* ① 有形态的胶囊。span 不是 button —— 外层整张卡已经是 button 了,
              嵌套交互元素是非法 HTML。按压态靠 group-active 从父级传下来。 */}
          {/* 字号 14px 加粗、内边距左右 +4 上下 +2、图标放大一档 ——
              目标是视觉重量接近旁边「托福词汇」那行标题,不能读成一个附属小标签。 */}
          <span className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-white px-3.5 py-1.5 text-[14px] font-semibold",
            "transition-transform duration-100 group-active:scale-95",
          )} style={{ borderColor: tintToWhite(color, 0.55), color }}>
            <ArrowLeftRight className="h-4 w-4" />
            切换词库
          </span>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform duration-150", open && "rotate-180")} />
        </div>

        {/* 进度靠右下 —— 数字先于条,条只是数字的可视化 */}
        <div className="mt-2">
          <div className="mb-1 flex justify-end">
            {progress ? (
              <span className="text-[12px] text-slate-500" style={{ fontVariantNumeric: "tabular-nums" }}>
                <b className="font-semibold text-slate-700">{mastered}</b> / {total}
              </span>
            ) : (
              <span className="block h-[14px] w-16 animate-pulse rounded bg-black/[0.06]" />
            )}
          </div>
          <div className="relative h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
            {/* 浅段 = 已掌握 + 学习中;深段 = 已掌握。与圆环同一套两段口径。
                最小可见宽度 3px —— 64/4470 = 1%,在 6px 高的条上等于不存在,
                而"让努力看得见"最需要的恰恰是起步阶段。 */}
            <div className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500"
              style={{ width: pctReached > 0 ? `max(3px, ${pctReached}%)` : 0, background: color, opacity: 0.4 }} />
            <div className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500"
              style={{ width: pct > 0 ? `max(3px, ${pct}%)` : 0, background: color }} />
          </div>
        </div>

        {/* ② 卡底提示:用"还有几个"制造好奇。
            ⚠️ N 来自 soon.length,不写死;真没有待上线的库时换成不含数字的说法,
               免得哪天全上线了还在说"还有 0 个"。 */}
        {banks.length > 0 && (
          <div className="mt-2 border-t pt-2 text-[12px] text-slate-400" style={{ borderColor: tintToWhite(color, 0.8) }}>
            {soon.length > 0
              ? <>还有 <b className="font-semibold text-slate-500" style={{ fontVariantNumeric: "tabular-nums" }}>{soon.length}</b> 个词库陆续上线 · 点击切换</>
              : <>共 {active.length} 个词库 · 点击切换</>}
          </div>
        )}
      </button>

      {/* 展开面板:150ms 高度 + 透明度过渡,不生硬闪现。
          ⚠️ 高度动画用 grid-rows 0fr→1fr,不用 max-height ——
             max-height 要猜一个够大的值,内容比它短时过渡会"先快后停"。
          ⚠️ 绝对定位浮在上层,**不把下面的内容推下去**:
             推下去的话一展开整页内容全跳,SE 上尤其难受。
          ⚠️ 收起时 pointer-events-none,否则那层看不见却仍然挡着点击。 */}
      <div
        className={cn(
          "absolute left-0 right-0 top-[calc(100%+6px)] z-30 grid transition-all duration-150 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0",
        )}
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <div
            className="max-h-[60vh] overflow-y-auto rounded-2xl border border-black/[0.08] bg-white p-1.5 shadow-[0_12px_32px_rgba(15,23,42,0.14)]">
            {/* 面板抬头 —— 让它像个货架,不像一个系统 select。
                两个数字都来自 banks,不写死。 */}
            <div className="px-2.5 pb-2 pt-1.5">
              <div className="text-[14px] font-semibold text-slate-900">选择词库</div>
              <div className="mt-0.5 text-[12px] text-slate-400">
                已上线 {active.length} 个{soon.length > 0 ? ",陆续更新" : ""}
              </div>
            </div>
            <div className="mx-2.5 mb-1 border-t border-black/[0.06]" />

            <div role="listbox">
            {active.map(b => {
              const c = bankColor(b.code);
              const on = b.id === selected?.id;
              const n = counts[b.id];
              return (
                /* ⚠️ 词库名 20px 加粗 —— 与卡片上「托福词汇」**同级**。
                   面板是做选择的地方,选项和"当前选中项"是同一组东西,
                   字号有等级差会让用户觉得"切过去就降级了"。 */
                <button key={b.id} type="button" role="option" aria-selected={on}
                  tabIndex={open ? 0 : -1}
                  onClick={() => { onPick(b); setOpen(false); }}
                  className={cn("relative flex min-h-[56px] w-full items-center gap-3 rounded-xl py-2.5 pl-4 pr-2.5 text-left",
                    on ? "bg-slate-50" : "active:bg-slate-50")}>
                  {/* 选中行:左侧一条身份色竖条 */}
                  {on && <span className="absolute inset-y-2 left-0 w-[3px] rounded-full" style={{ backgroundColor: c }} />}
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: c }} />
                  <span className="min-w-0 flex-1 truncate text-[20px] font-bold tracking-tight text-slate-900">{b.name_zh}</span>
                  {needsUnlock(b) && <Lock className="h-4 w-4 shrink-0 text-slate-400" />}
                  {typeof n === "number" && (
                    <span className="shrink-0 text-[12px] text-slate-400" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {n} 词
                    </span>
                  )}
                  {on && <Check className="h-5 w-5 shrink-0" style={{ color: c }} />}
                </button>
              );
            })}

            {soon.length > 0 && (
              <>
                <div className="mx-3 my-1 border-t border-black/[0.06]" />
                {soon.map(b => (
                  /* 不可选:用 disabled 的 button,不是长得像却点不动的 div ——
                     "不可点"和"看起来不可点"是两回事,两样都得给到。
                     40% 透明度是 Aaron 指定的档位。 */
                  /* ⚠️ 未上线的库**字号与已上线完全一致**,只用 40% 透明度表达不可选。
                     靠缩小字号表达禁用会让人读成"次要内容",而它们是同一组选项。
                     「敬请期待」保持 12px 小字 —— 它是状态,不是选项本身。 */
                  <button key={b.id} type="button" disabled aria-disabled tabIndex={-1}
                    className="flex min-h-[56px] w-full cursor-not-allowed items-center gap-3 rounded-xl py-2.5 pl-4 pr-2.5 text-left opacity-40">
                    <span className="h-3 w-3 shrink-0 rounded-full bg-slate-400" />
                    <span className="min-w-0 flex-1 truncate text-[20px] font-bold tracking-tight text-slate-900">{b.name_zh}</span>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[12px] text-slate-600">敬请期待</span>
                  </button>
                ))}
              </>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 入口卡 —— **一行排完**:图标 + 名称 + 大字 + 单位。
 *
 * ⚠️ 原来是两行(名称一行、数字一行),两张卡就吃掉 76px。
 *    总原则:凡能一行说完的不许分两行。
 * ⚠️ 「即将开放」那条灰标和不可点分支已删 —— 错题本(PR-4)和今日复习都已上线,
 *    两个调用点都带 `to`,那条分支是死代码。真有新的未上线入口再按需加回。
 * ⚠️ count = null 表示还没就绪,显示灰块而不是 0(同"绝不渲染 0"那条)。
 */
function EntryCard({ icon, label, count, hint, to }: {
  icon: React.ReactNode; label: string; count: number | null; hint: string; to: string;
}) {
  return (
    <Link to={to}
      className="flex items-center gap-1.5 rounded-2xl border border-black/[0.06] bg-white px-3.5 py-2.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] active:bg-slate-50">
      <span className="shrink-0 text-slate-400">{icon}</span>
      <span className="shrink-0 text-[14px] font-medium text-slate-700">{label}</span>
      {count === null
        ? <span className="ml-auto h-[22px] w-8 animate-pulse rounded bg-slate-100" />
        : <span className="ml-auto text-[22px] font-bold leading-none text-slate-900"
            style={{ fontFamily: FONT_STAT, fontVariantNumeric: "tabular-nums" }}>{count}</span>}
      <span className="shrink-0 text-[12px] text-slate-400">{hint}</span>
    </Link>
  );
}

/* ── 第二层:学习方式 ───────────────────────────────────────────── */

/**
 * 学习方式分组 —— 这一页最该突出的东西。
 *
 * ⚠️ 由来:场景串记原来是**页面最底部一条横幅**,层级放错了 ——
 *    它是"背单词的一种方式",不是词汇中心之外的附加功能。
 *    现在把所有方式并排放在一起,用户的动线才顺:
 *    看我在哪(状态)→ 选今天怎么学(方式)→ 看我攒了多少(成就)。
 * ⚠️ 未上线的方式**照样列出来、灰显不可点** —— 让用户看见这个板块在长。
 *    但必须点不动(disabled 的 div,不是长得像却没反应的卡)。
 * ⚠️ 场景串记的「已学 N/30」与 /vocab/scenes 顶部那行**同一个口径**(都数 done 键)。
 */
function StudyModes({ bankCode, color }: { bankCode: string | null; color: string }) {
  return (
    <>
      <h2 className="mb-2 mt-6 text-[13px] font-medium text-slate-400">学习方式</h2>
      {/* 单列纵向、每行约 56px。**不要改回 2 列方块卡** ——
          那版每张三行,六项吃掉近 500px,一屏放不下。 */}
      <div className="space-y-2">
        {/* ⚠️ 副标题把四个模式**列出来**(Aaron 2026-08-09):
            它们藏在下一层(点进词库页才看得到),叫"四种模式练词卡"等于没说 ——
            用户根本不知道有听音辨义和听写挑战。名字也从"词卡练习"改成"单词学习":
            "词卡"是我们的实现细节,用户想的是"学单词"。 */}
        <ModeCard
          icon={<Layers className="h-[18px] w-[18px]" />}
          name="单词学习" desc="四种模式练词卡"
          sub="英汉选择 · 词汇配对 · 听音辨义 · 听写挑战"
          color={color}
          /* 四模式入口在词库页;没选中库时不给链接(点进去是 /vocab/undefined) */
          to={bankCode ? `/vocab/${bankCode}` : undefined}
        />
        {/* ⚰️「快筛」整条线已撤(Aaron 2026-08-09):页面、路由、screening.ts
            与测试全部删除。vocab_pre_known 表**保留不删**(将来若重启这条线还能用),
            但前端不再引用它。别再加回这一行。 */}
        {/* ⚰️「场景串记」已从本组提出,改成页面**最顶部**的独立横幅
            (Aaron 2026-08-09)。理由:它是独立的学习方式,不从属于托福词汇;
            但也不是词库,不能进下拉(下拉里全是"一批词",它没有掌握度概念)。
            别再加回这一组里。 */}
        <ModeCard icon={<Headphones className="h-[18px] w-[18px]" />} name="磨耳朵" desc="边听边记,可锁屏"
          color={color} to={bankCode ? `/vocab/listen?bank=${bankCode}` : "/vocab/listen"} />
        {/* PR-8c:三批已审内容上架。它们**不依赖当前词库**(词块/习语/中文表达/辨析组
            都是全库级内容),所以不带 bankCode 参数。 */}
        <ModeCard icon={<Blocks className="h-[18px] w-[18px]" />} name="词块与习语" desc="整块记,含直译陷阱"
          color={color} to="/vocab/chunks" />
        <ModeCard icon={<MessageSquareQuote className="h-[18px] w-[18px]" />} name="中文这样说" desc="一句中文,分场合三种说法"
          color={color} to="/vocab/expressions" />
        <ModeCard icon={<Shuffle className="h-[18px] w-[18px]" />} name="易混词辨析" desc="看句子选词,专治总记混"
          color={color} to="/vocab/confusion" />
        {/* ⚰️「音标基础」「自然拼读」两行已移除(Aaron 2026-08-08 裁决:整条线撤销,
            PR #321/#323 关闭不合并)。别再加回来。
            ⚠️ 与**小学**板块的自然拼读(/primary 下的 PrimaryHubPhonics)无关,那个继续在。 */}
        {/* ⚰️「词汇量测试」占位卡已删、「快筛」整条线也已撤(Aaron 2026-08-09)。
            两者都是"测你会多少词",先后都被判定为现在不做:
            · 词汇量测试的前置是内容工程(导入通用词频表 + 中考/高考/四级/六级词表);
            · 快筛做出来了,但随后整条线撤掉,页面/路由/screening.ts/测试全部删除。
            `vocab_pre_known` 表**保留不删**(将来若重启这条线还能用),前端不再引用。
            别再往这一组里加"测词汇量"类的入口,除非那两件事有了结论。 */}
      </div>
    </>
  );
}

/**
 * 「今日学习」主按钮。
 *
 * 三态(规格第五节):
 *   有任务 → 「今日学习 · N 词」+ 一行「复习 X · 新词 Y · 错题 Z」
 *   全做完 → 「今天已完成 · 再来 10 个新词」
 *   未登录 → 按钮仍在,点进去能试做(不写库)
 *
 * ⚠️ 数字**不许写死也不许估**:一律来自 `buildTodayPlan`,与点进去之后的序列
 *    是同一份计划、同一套排序。按钮说 35 词、进去发现 40 题,是这功能最致命的失信。
 * ⚠️ 算不出来时**不渲染按钮**,而不是渲染一个「今日学习 · 0 词」——
 *    后者会让人以为今天真没任务。
 */
function TodayButton({ bankId, color, signedIn }: {
  bankId: string | null; color: string; signedIn: boolean | null;
}) {
  const [plan, setPlan] = useState<TodayPlan | null>(null);

  useEffect(() => {
    if (!bankId) return;
    let alive = true;
    setPlan(null);
    buildTodayPlan(bankId)
      .then(p => { if (alive) setPlan(p); })
      .catch(() => { /* 排不出来就不显示按钮,不给假数字 */ });
    return () => { alive = false; };
  }, [bankId]);

  if (!bankId) return null;

  /* 加载中给一块与真身同高的占位,避免数据到位时整页跳动 */
  if (!plan) return <div className="mt-3 h-[68px] animate-pulse rounded-2xl bg-black/[0.04]" />;

  const { counts, deferred } = plan;
  const empty = counts.total === 0;

  return (
    <Link to="/vocab/today"
      className="mt-3 block rounded-2xl px-5 py-3.5 text-white"
      style={{ backgroundImage: GRAD_CTA, boxShadow: CTA_SHADOW }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[17px] font-semibold">
          {empty ? "今天已完成 · 再来 10 个新词" : `今日学习 · ${counts.total} 词`}
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 opacity-80" />
      </div>
      {!empty && (
        <div className="mt-0.5 text-[12px] opacity-85" style={{ fontVariantNumeric: "tabular-nums" }}>
          复习 {counts.review} · 新词 {counts.new} · 错题 {counts.mistake}
          {/* 截断必须说出来,不能静默丢 */}
          {deferred > 0 && ` · 另有 ${deferred} 词顺延到明天`}
        </div>
      )}
      {signedIn === false && (
        <div className="mt-0.5 text-[12px] opacity-85">未登录也可先试做,登录后才记录进度</div>
      )}
    </Link>
  );
}

/**
 * 场景串记横幅 —— 页面**最顶部**,在词库卡之上(Aaron 2026-08-09)。
 *
 * ⚠️ 为什么不在「学习方式」组里、也不在词库下拉里:
 *    · 它是独立的学习方式,不从属于托福词汇 —— 放进学习方式组会让人以为
 *      它是在学当前这个词库;
 *    · 但它也不是词库,不能进下拉 —— 下拉里每一项都是"一批词、有掌握度",
 *      场景串记没有掌握度这个概念,混进去口径就乱了。
 *    所以给它一个自己的位置:最顶上,并与下方那套用底色和分隔线明确切开。
 * ⚠️ 「已学 N/30」与 /vocab/scenes 顶部那行**同一个口径**(都数 done 键)。
 * ⚠️ 高度压到一行:SE 首屏要保证「本横幅 + 词库卡 + 进度条前几行」都看得见。
 */
function SceneBanner() {
  const [scene, setScene] = useState<{ done: number; total: number } | null>(null);

  useEffect(() => {
    let alive = true;
    countScenePacks()
      .then(n => { if (alive) setScene({ total: n, done: countScenesDone() }); })
      .catch(() => { /* 取不到就不显示进度,横幅本身照常可点 */ });
    return () => { alive = false; };
  }, []);

  const status = scene && scene.total > 0
    ? `已学 ${Math.min(scene.done, scene.total)}/${scene.total}`
    : null;

  return (
    <>
      <Link to="/vocab/scenes"
        className="flex items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 active:brightness-[0.98]"
        style={{ borderColor: `${SCENE_COLOR}33`, backgroundColor: `${SCENE_COLOR}0F` }}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${SCENE_COLOR}26`, color: SCENE_COLOR }}>
          <Link2 className="h-[18px] w-[18px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold leading-tight text-slate-900">场景串记</span>
          <span className="mt-0.5 block truncate text-[12px] leading-tight text-slate-500">
            30 个生活场景,把单词串成一篇作文
          </span>
        </span>
        {status && (
          <span className="shrink-0 text-[12px] font-medium"
            style={{ color: SCENE_COLOR, fontVariantNumeric: "tabular-nums" }}>{status}</span>
        )}
        <ChevronRight className="h-4 w-4 shrink-0" style={{ color: SCENE_COLOR }} />
      </Link>
      {/* 分隔线:让用户一眼看出上面那张是**另一类东西**,
          下面才是"当前词库"那一整套(词库卡 + 进度 + 学习方式)。 */}
      <div className="my-3 border-t border-black/[0.06]" />
    </>
  );
}

/**
 * 一行方式卡:图标 + 名称 + 一句话灰字(同一行接在名称后)+ 右侧状态 + chevron。
 * 没有 `to` = 未上线:整行 40% 透明度 + 「即将开放」灰标,且点不动。
 *
 * ⚠️ 说明文字 `truncate` 单行截断,不换行 —— 一换行整行就变两行,
 *    六项加起来又回到近 500px。文案本身也要短(长的在写的时候就该缩)。
 */
function ModeCard({ icon, name, desc, sub, color, to, status }: {
  icon: React.ReactNode; name: string; desc: string; color: string;
  /** 第二行小字:用于把藏在下一层的子模式**列出来**,让用户知道它们存在。 */
  sub?: string;
  to?: string; status?: string | null;
}) {
  const soon = !to;
  const body = (
    <>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: soon ? "#F1F5F9" : `${color}1F`, color: soon ? "#94A3B8" : color }}>
        {icon}
      </span>
      {/* 有副标题时名称与副标题竖排;没有则保持原来的一行式,不改其它卡的高度 */}
      {sub ? (
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold leading-tight text-slate-900">{name}</span>
          <span className="mt-0.5 block truncate text-[12px] leading-tight text-slate-400">{sub}</span>
        </span>
      ) : (
        <>
          <span className="shrink-0 text-[15px] font-semibold text-slate-900">{name}</span>
          <span className="min-w-0 flex-1 truncate text-[12px] text-slate-400">{desc}</span>
        </>
      )}
      {soon
        ? <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">即将开放</span>
        : status
          ? <span className="shrink-0 text-[12px] font-medium" style={{ color, fontVariantNumeric: "tabular-nums" }}>{status}</span>
          : null}
      {!soon && <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />}
    </>
  );
  // 每行约 56px:8px 上下内边距 + 32px 图标 + 边框
  const cls = "flex items-center gap-2 rounded-2xl border border-black/[0.06] px-3 py-2.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]";
  return to
    ? <Link to={to} className={cn(cls, "bg-white active:bg-slate-50")}>{body}</Link>
    : <div aria-disabled="true" className={cn(cls, "cursor-not-allowed select-none bg-white opacity-40")}>{body}</div>;
}
