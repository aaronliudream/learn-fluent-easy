/**
 * 词汇中心(/vocab)· 纯展示,零写入。
 *
 * 版式照 docs/vocab-bank/VOCAB_DESIGN_SPEC.md,一句话审美目标是**克制**:
 * 唯一渐变位属于主 CTA —— 本页没有主 CTA,所以本页一处渐变都没有;
 * 其余全是白卡 + 细边 + 大留白。
 *
 * ── 统计分两层,两层的分母世界不一样,混了用户就看不懂 ──
 *   ① **当前词库**(随顶部下拉切换):进度 N/总数、圆环、错题本、今日复习、里程碑。
 *      全部集中在页面上半部分、紧挨着下拉,视觉上归属明确。
 *   ② **全局累计**(跨所有词库、按 word_id 去重、永远只涨):累计学习/掌握/时长/积分。
 *      放在下方「我的数据」里,标题不带词库名,字号比上面小一档。
 *   ⚠️ 去重是 user_vocab_mastery 的表结构自带的((user_id, word_id) 唯一),
 *      同一个词同时属于托福和四级只算一次;各库进度那层才 join vocab_word_banks。
 *
 * ── 首屏一屏化(iPhone SE 375×667 不滚动可见)──
 *   标题+词库下拉 → 当前库细进度 → 学习进度卡(紧凑档) → 错题本/今日复习两小卡 → 露出下方一角。
 *   ⚠️ 词库从**卡片网格改成下拉**,省下的纵向空间是首屏的主要来源;
 *      里程碑改成一行折叠。别把它们改回去。
 * ⚠️ 未登录/无数据必须正常渲染 0 态(RLS 让未登录读掌握度得到空数组,那是预期行为)。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CalendarClock, Check, ChevronDown, ChevronRight, Link2, Lock } from "lucide-react";
import BackLink from "@/components/BackLink";
import { cn } from "@/lib/utils";
import StatsPanel from "@/components/vocab/StatsPanel";
import { bankColor, FONT_STAT, MILESTONES, readSelectedBank, SCENE_COLOR, writeSelectedBank } from "@/lib/vocab/theme";
import { countScenePacks, countScenesDone } from "@/lib/vocab/scenes";
import { needsUnlock } from "@/lib/vocab/paywall";
import {
  listBanks, getBankProgressFast, dueCountForBank, mistakeCountForBank, getGlobalTotals,
  currentUserId, type VocabBank, type BankProgress,
} from "@/lib/vocab/data";
import MyDataPanel from "@/components/vocab/MyDataPanel";
import {
  HardestWords, WeeklyBanner, Confetti, ShareCard, MilestoneSummary,
  useMilestoneCelebration, type WeeklySummary,
} from "@/components/vocab/Incentive";
import { getStats, type UserStats } from "@/lib/vocab/stats";
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
  const [signedIn, setSignedIn] = useState(false);

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

  /* 里程碑跟随**当前词库**的掌握数(与圆环同源)。 */
  const celebrate = useMilestoneCelebration(bankMastered);
  const [confettiDone, setConfettiDone] = useState(false);

  return (
    /* 暖底 #FAF7F2 = index.css 的 --background(warm ivory,注释写着 low blue-light,
       适合长时间学习)。不用纯白、也不用冷灰 —— 与全站底色一致。 */
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="mx-auto w-full max-w-[720px] px-4 pb-16 pt-3">
        <BackLink to="/" className="mb-2 inline-flex items-center gap-1 text-[13px] text-slate-500">
          ← 返回首页
        </BackLink>

        {/* 标题 + 词库下拉同一行 —— 这一行省下的高度就是首屏的本钱 */}
        <div className="mb-2.5 flex items-center gap-3">
          <h1 className="shrink-0 text-[24px] font-bold tracking-tight text-slate-900">词汇</h1>
          <BankPicker banks={banks} selected={selected} onPick={onPick} color={color} />
        </div>

        {/* 当前词库细进度:N / 总数。大卡不再显示分母,分母只活在这一条上 */}
        <BankProgressLine progress={p ?? null} color={color} />

        {bankStats ? (
          <StatsPanel
            compact
            mastered={bankMastered}
            learning={p?.learning ?? 0}
            untouched={p?.untouched ?? 0}
            color={color}
            /* 「已测」= 掌握 + 学习中 = 作答过的词数。它**只涨不跌**,
               与只涨也会跌的掌握数构成「实力 + 努力」双成就:
               哪怕掌握数因答错回落,努力的痕迹也还在。 */
            tested={bankMastered + (p?.learning ?? 0)}
            showDenominator={false}
            growthWordIds={undefined}
            emptyHint={signedIn
              ? "还没有学习记录。点上面的词库开始,答对的词会自动记进掌握度。"
              : "登录后开始记录进度。未登录也可以先试做 20 题。"}
          />
        ) : (
          /* 骨架屏:**绝不渲染 0** —— 0 是合法值,老用户看到进度归零是事故级体验。
             宁可多显示 200ms 灰块,也不能显示一个会自己变的假数字。
             高度对齐紧凑档(96 环 + p-4),避免数据到位时整页跳动。 */
          <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="mb-3 h-[22px] w-24 animate-pulse rounded bg-slate-100" />
            <div className="flex items-center gap-4">
              <div className="h-[96px] w-[96px] shrink-0 animate-pulse rounded-full bg-slate-100" />
              <div className="min-w-0 flex-1 space-y-3">
                <div className="h-[36px] w-28 animate-pulse rounded bg-slate-100" />
                <div className="h-[16px] w-full animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-3">
          <EntryCard icon={<AlertCircle className="h-[17px] w-[17px]" />} label="错题本"
            count={bankStats?.mistakes ?? null} hint="待清" to="/vocab/mistakes"
            extra={<HardestWords color={color} />} />
          <EntryCard icon={<CalendarClock className="h-[17px] w-[17px]" />} label="今日复习"
            count={bankStats?.due ?? null} hint="到期" to="/vocab/review" />
        </div>

        {/* ↓↓↓ 以下不要求首屏可见 ↓↓↓ */}

        {/* 周报是"每周一才出、可关闭"的偶发块,放在这里大多数日子根本不占位 */}
        <WeeklyBanner color={color} onShare={(w: WeeklySummary) => setShare({
          mastered: bankMastered, streak: w.streak, points: uStats?.total_points ?? 0,
          totalMs: uStats?.total_time_ms ?? 0, milestone: MILESTONES.filter(m => bankMastered >= m).pop() ?? null,
        })} />

        <MilestoneSummary mastered={bankMastered} color={color} />

        <MyDataPanel color={color}
          globalLearned={totals?.learned ?? null}
          globalMastered={totals?.mastered ?? null} />

        <SceneBanner />

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

/* ── 词库下拉 ───────────────────────────────────────────────────── */

/**
 * 词库选择器。可用的正常列,未上线的灰显标「敬请期待」且**不可选**。
 * ⚠️ 未上线的库仍然列出来 —— 那是产品路线图,提前让用户看见"以后有什么",
 *    但必须点不动,否则点进去是一张空页。
 */
function BankPicker({ banks, selected, onPick, color }: {
  banks: VocabBank[];
  selected: VocabBank | null;
  onPick: (b: VocabBank) => void;
  color: string;
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  /* 点外面收起。用 pointerdown 而不是 click —— click 在移动端要等 300ms 判定,
     期间用户已经在滚动了,菜单还挂着很出戏。 */
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

  const active = useMemo(() => banks.filter(b => b.is_active), [banks]);
  const soon = useMemo(() => banks.filter(b => !b.is_active), [banks]);

  return (
    <div ref={boxRef} className="relative min-w-0 flex-1">
      <button type="button" onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox" aria-expanded={open}
        disabled={!banks.length}
        className="flex w-full items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
        <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-slate-800">
          {selected?.name_zh ?? (banks.length ? "选择词库" : "加载中")}
        </span>
        {selected && needsUnlock(selected) && <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-[60vh] overflow-y-auto rounded-2xl border border-black/[0.08] bg-white p-1.5 shadow-[0_12px_32px_rgba(15,23,42,0.14)]">
          {active.map(b => {
            const c = bankColor(b.code);
            const on = b.id === selected?.id;
            return (
              <button key={b.id} type="button" role="option" aria-selected={on}
                onClick={() => { onPick(b); setOpen(false); }}
                className={cn("flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left",
                  on ? "bg-slate-50" : "active:bg-slate-50")}>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: c }} />
                <span className="min-w-0 flex-1 truncate text-[15px] text-slate-800">{b.name_zh}</span>
                {needsUnlock(b) && <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                {on && <Check className="h-4 w-4 shrink-0" style={{ color: c }} />}
              </button>
            );
          })}

          {soon.length > 0 && (
            <>
              <div className="mx-2.5 my-1 border-t border-black/[0.06]" />
              {soon.map(b => (
                /* 不可选:用 disabled 的 button,不是长得像却点不动的 div ——
                   "不可点"和"看起来不可点"是两回事,两样都得给到 */
                <button key={b.id} type="button" disabled aria-disabled
                  className="flex w-full cursor-not-allowed items-center gap-2.5 rounded-xl px-2.5 py-2 text-left opacity-60">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-slate-200" />
                  <span className="min-w-0 flex-1 truncate text-[15px] text-slate-400">{b.name_zh}</span>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-400">敬请期待</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/** 当前词库的一条细进度。分母只出现在这里(大卡里不再出现)。 */
function BankProgressLine({ progress, color }: { progress: BankProgress | null; color: string }) {
  const total = progress?.total ?? 0;
  const mastered = progress?.mastered ?? 0;
  const learning = progress?.learning ?? 0;
  const pct = total > 0 ? (mastered / total) * 100 : 0;
  const pctReached = total > 0 ? ((mastered + learning) / total) * 100 : 0;

  return (
    <div className="mb-3">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[12px] text-slate-400">本词库进度</span>
        {progress ? (
          <span className="text-[12px] text-slate-500" style={{ fontVariantNumeric: "tabular-nums" }}>
            <b className="font-semibold text-slate-700">{mastered}</b> / {total}
          </span>
        ) : (
          <span className="h-[14px] w-14 animate-pulse rounded bg-slate-100" />
        )}
      </div>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-slate-100">
        {/* 浅段 = 已掌握 + 学习中;深段 = 已掌握。与圆环同一套两段口径。
            最小可见宽度 3px —— 64/4470 = 1%,在 6px 高的条上等于不存在,
            而"让努力看得见"最需要的恰恰是起步阶段。 */}
        <div className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500"
          style={{ width: pctReached > 0 ? `max(3px, ${pctReached}%)` : 0, background: color, opacity: 0.35 }} />
        <div className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500"
          style={{ width: pct > 0 ? `max(3px, ${pct}%)` : 0, background: color }} />
      </div>
    </div>
  );
}

/**
 * 入口卡。没有 `to` 的卡必须显式标"即将开放"。
 *
 * ⚠️ 由来:错题本卡原来只是不给 `to`,渲染成 `div` —— 技术上确实点不动,
 *    但它和旁边**可点的「今日复习」卡长得一模一样**,用户当然会去点,
 *    点了没反应。"不可点"和"看起来不可点"是两回事。
 * ⚠️ count = null 表示还没就绪,显示灰块而不是 0(同"绝不渲染 0"那条)。
 */
function EntryCard({ icon, label, count, hint, to, extra }: {
  icon: React.ReactNode; label: string; count: number | null; hint: string; to?: string; extra?: React.ReactNode;
}) {
  const soon = !to;
  const body = (
    <>
      <div className="flex items-center gap-1.5 text-[14px] font-medium text-slate-700">
        <span className="text-slate-400">{icon}</span>{label}
        {soon && (
          <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-normal text-slate-400">
            即将开放
          </span>
        )}
      </div>
      <div className="mt-0.5 flex items-baseline gap-1">
        {count === null
          ? <span className="my-1 block h-[24px] w-10 animate-pulse rounded bg-slate-100" />
          : <span className={cn("text-[24px] font-bold", soon ? "text-slate-400" : "text-slate-900")}
              style={{ fontFamily: FONT_STAT, fontVariantNumeric: "tabular-nums" }}>{count}</span>}
        <span className="text-[13px] text-slate-400">{hint}</span>
      </div>
      {extra}
    </>
  );
  const cls = "block rounded-2xl border border-black/[0.06] px-4 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)]";
  return to
    ? <Link to={to} className={cn(cls, "bg-white active:bg-slate-50")}>{body}</Link>
    : <div aria-disabled="true" className={cn(cls, "cursor-not-allowed select-none bg-slate-50/60 opacity-70")}>{body}</div>;
}

/**
 * 场景串记入口 —— 全宽横幅。
 *
 * ⚠️ 分母走 countScenePacks()(head 查询,只回一个数),不用 listScenePacks:
 *    后者为了算"短文 N 词"会把 30 篇正文全拉下来,那是列表页才需要付的钱。
 * ⚠️ 取数失败/一个场景都没有时**整条横幅不渲染** —— 与其挂一条点进去是空页的入口,
 *    不如当它不存在。
 */
function SceneBanner() {
  const [total, setTotal] = useState(0);
  const [done, setDone] = useState(0);

  useEffect(() => {
    let alive = true;
    countScenePacks()
      /* 分子数的是 done 键,与场景列表页顶部那行「已学 N / 30」**同一个口径** ——
         两处各算各的,迟早出现"横幅说 5、列表说 3"这种鬼故事 */
      .then(n => { if (alive) { setTotal(n); setDone(countScenesDone()); } })
      .catch(() => { /* 场景没上线/读失败:横幅整条不出,不拦住中心页 */ });
    return () => { alive = false; };
  }, []);

  if (total <= 0) return null;

  return (
    <Link to="/vocab/scenes"
      className="mt-4 flex items-center gap-3.5 rounded-2xl border border-black/[0.06] bg-white px-4 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] active:bg-slate-50">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${SCENE_COLOR}1F` }}>
        <Link2 className="h-5 w-5" style={{ color: SCENE_COLOR }} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold text-slate-900">场景串记</div>
        <div className="mt-0.5 truncate text-[13px] text-slate-500">
          {total} 个生活场景,把单词串成一篇作文
        </div>
      </div>
      <span className="shrink-0 text-[13px] text-slate-400" style={{ fontVariantNumeric: "tabular-nums" }}>
        {/* 已学数取本地记录与总数的较小值 —— 场景下架后本地那条记录还在,
            不夹一下会出现「31/30」 */}
        {Math.min(done, total)}/{total}
      </span>
      <ChevronRight className="h-[18px] w-[18px] shrink-0 text-slate-300" />
    </Link>
  );
}
