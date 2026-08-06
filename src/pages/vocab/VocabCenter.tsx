/**
 * 词汇中心(/vocab)· 纯展示,零写入。
 *
 * 版式照 docs/vocab-bank/VOCAB_DESIGN_SPEC.md,一句话审美目标是**克制**:
 * 唯一渐变位属于主 CTA —— 本页没有主 CTA,所以本页一处渐变都没有;
 * 其余全是白卡 + 细边 + 大留白。
 *
 * ⚠️ 中心页**不显示分母**。「已掌握 N / 4473」里的 4473 是单个词库的词数,
 *    放在全站中心页语义就是错的;词库越加越多,它还会变成劝退分母。
 *    进度感由里程碑徽章链承担,「N / 总数」只保留在各词库详情页。
 * ⚠️ 词库卡不硬编码,全部来自 vocab_banks;未登录/无数据必须正常渲染 0 态
 *    (RLS 让未登录读掌握度得到空数组,那是预期行为不是异常)。
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CalendarClock, ChevronRight, Lock, Sparkles } from "lucide-react";
import BackLink from "@/components/BackLink";
import { cn } from "@/lib/utils";
import StatsPanel from "@/components/vocab/StatsPanel";
import { bankColor, FONT_STAT, MILESTONES } from "@/lib/vocab/theme";
import { needsUnlock } from "@/lib/vocab/paywall";
import {
  listBanks, getBankProgressFast, dueCount, mistakeCount, totalMastered,
  currentUserId, type VocabBank,
} from "@/lib/vocab/data";
import { readStatsCache, writeStatsCache } from "@/lib/vocab/statsCache";

type BankRow = VocabBank & { mastered: number; realTotal: number; learning: number };

export default function VocabCenter() {
  const [banks, setBanks] = useState<BankRow[]>([]);
  const [loading, setLoading] = useState(true);
  /* ⚠️ 统计数据单独一个就绪位。没有它就只能拿 0 当"还没到",
   *    而 0 也是合法值 —— 老用户冷启动会看到进度归零,那是事故级体验。 */
  const [statsReady, setStatsReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [due, setDue] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [mastered, setMastered] = useState(0);
  const [learning, setLearning] = useState(0);

  useEffect(() => {
    let alive = true;

    /* 二次进入秒显:先铺缓存值,再后台刷新(stale-while-revalidate)。
     * ⚠️ 缓存只用于"先显示",永远不跳过后台刷新 —— 否则数据会停在旧值。 */
    const cached = readStatsCache();
    if (cached) {
      setDue(cached.due); setMistakes(cached.mistakes);
      setMastered(cached.mastered); setLearning(cached.learning);
      setStatsReady(true);
    }

    (async () => {
      try {
        const uid = await currentUserId();
        if (!alive) return;
        setSignedIn(!!uid);

        /* 一次并发,消灭串行瀑布。
         * ⚠️ 这四件事互不依赖:词库列表、到期数、错题数、总掌握数。
         *    原来是"先拿词库 → 再逐库算进度 → 最后才拿三个计数",
         *    三段串行,冷启动实测 ~3 秒。 */
        const [list, d, m, t] = await Promise.all([
          listBanks(),
          uid ? dueCount().catch(() => 0) : Promise.resolve(0),
          uid ? mistakeCount().catch(() => 0) : Promise.resolve(0),
          uid ? totalMastered().catch(() => 0) : Promise.resolve(0),
        ]);
        if (!alive) return;

        const activeBanks = list.filter(b => b.is_active);
        const progress = await Promise.all(
          activeBanks.map(b => getBankProgressFast(b.id, b.total_words, uid).catch(() => null)),
        );
        if (!alive) return;

        const byId = new Map(activeBanks.map((b, i) => [b.id, progress[i]]));
        setBanks(list.map(b => ({
          ...b,
          mastered: byId.get(b.id)?.mastered ?? 0,
          // 分母用**实际挂在库下的词数**,不是 total_words(那是规划值)
          realTotal: byId.get(b.id)?.total ?? 0,
          learning: byId.get(b.id)?.learning ?? 0,
        })));

        const learn = activeBanks.reduce((s2, b) => s2 + (byId.get(b.id)?.learning ?? 0), 0);
        setDue(d); setMistakes(m); setMastered(t); setLearning(learn);
        setStatsReady(true);
        writeStatsCache({ due: d, mistakes: m, mastered: t, learning: learn });
      } catch {
        if (alive) setFailed(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const active = banks.filter(b => b.is_active);
  const soon = banks.filter(b => !b.is_active);
  /* 中心页身份色 = **最活跃词库**的色(学习中 + 已掌握最多的那个)。
   * ⚠️ 不用中性主色 —— 中性色浅化之后就是灰,而"浅色段"正是靠色相
   *    才能和灰色轨道区分开。上一版没传 color,默认 #0F172A(近黑),
   *    30% 不透明度渲染出来就是灰:功能对了、颜色错了,用户眼里没区别。
   * 多库并行后它会自然跟随用户的主战场,不用再改。 */
  const hottest = banks.filter(b => b.is_active)
    .reduce<BankRow | null>((best, b) =>
      (b.mastered + b.learning) > ((best?.mastered ?? 0) + (best?.learning ?? 0)) ? b : best, null);
  const centerColor = bankColor(hottest?.code ?? "toefl");

  const nextMilestone = MILESTONES.find(m => m > mastered) ?? MILESTONES[MILESTONES.length - 1];

  return (
    /* 暖底 #FAF7F2 = index.css 的 --background(warm ivory,注释写着 low blue-light,
       适合长时间学习)。不用纯白、也不用冷灰 —— 与全站底色一致。 */
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="mx-auto w-full max-w-[720px] px-4 pb-16 pt-4">
        <BackLink to="/" className="mb-3 inline-flex items-center gap-1 text-[14px] text-slate-500">
          ← 返回首页
        </BackLink>

        <h1 className="mb-1 text-[26px] font-bold tracking-tight text-slate-900">词汇</h1>
        <p className="mb-5 text-[14px] text-slate-500">按考试选词库,词卡带真人发音例句</p>

        {statsReady ? (
        <StatsPanel
          mastered={mastered}
          learning={learning}
          untouched={0}
          color={centerColor}
          /* 「已测」= 掌握 + 学习中 = 作答过的词数。它**只涨不跌**,
             与只涨也会跌的掌握数构成「实力 + 努力」双成就:
             哪怕掌握数因答错回落,努力的痕迹也还在。 */
          tested={mastered + learning}
          showDenominator={false}
          emptyHint={signedIn
            ? "还没有学习记录。选一个词库开始,答对的词会自动记进掌握度。"
            : "登录后开始记录进度。未登录也可以先试做 20 题。"}
        />
        ) : (
          /* 骨架屏:**绝不渲染 0** —— 0 是合法值,老用户看到进度归零是事故级体验。
             宁可多显示 200ms 灰块,也不能显示一个会自己变的假数字。 */
          <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="mb-4 h-[22px] w-24 animate-pulse rounded bg-slate-100" />
            <div className="flex items-center gap-5">
              <div className="h-[128px] w-[128px] shrink-0 animate-pulse rounded-full bg-slate-100" />
              <div className="min-w-0 flex-1 space-y-3">
                <div className="h-[42px] w-32 animate-pulse rounded bg-slate-100" />
                <div className="h-[18px] w-full animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <EntryCard icon={<AlertCircle className="h-[18px] w-[18px]" />} label="错题本" count={mistakes} hint="待清" />
          <EntryCard icon={<CalendarClock className="h-[18px] w-[18px]" />} label="今日复习" count={due} hint="到期" to="/vocab/review" />
        </div>

        {/* 里程碑:双态徽章,达成绿 / 未达成灰,视觉分量提上来 */}
        <div className="mt-4 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <div className="mb-3.5 flex items-center gap-1.5 text-[15px] font-semibold text-slate-900">
            <Sparkles className="h-[18px] w-[18px] text-amber-500" />
            里程碑
          </div>
          <div className="flex flex-wrap gap-2">
            {MILESTONES.map(m => {
              const reached = mastered >= m;
              return (
                <span
                  key={m}
                  className={cn(
                    "inline-flex min-w-[64px] items-center justify-center rounded-xl border px-3 py-2 text-[15px] font-bold",
                    reached
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-black/[0.06] bg-slate-50 text-slate-300",
                  )}
                  style={{ fontFamily: FONT_STAT, fontVariantNumeric: "tabular-nums" }}
                  aria-label={reached ? `已达成 ${m}` : `未达成 ${m}`}
                >
                  {m}
                </span>
              );
            })}
          </div>
          <p className="mt-3.5 text-[13px] text-slate-500">
            距离下一档还差{" "}
            <b className="font-semibold text-slate-800" style={{ fontVariantNumeric: "tabular-nums" }}>
              {Math.max(0, nextMilestone - mastered)}
            </b>{" "}
            词
          </p>
        </div>

        <h2 className="mb-3 mt-7 text-[16px] font-semibold text-slate-900">词库</h2>
        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="h-[96px] animate-pulse rounded-2xl border border-black/[0.06] bg-white" />
            ))}
          </div>
        ) : failed ? (
          <div className="rounded-2xl border border-black/[0.06] bg-white p-6 text-center">
            <p className="text-[15px] text-slate-600">词库加载失败</p>
            <button onClick={() => window.location.reload()}
              className="mt-3 rounded-full border border-black/[0.08] px-4 py-1.5 text-[14px] text-slate-700">
              重试
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {active.map(b => <BankCard key={b.id} bank={b} />)}
          </div>
        )}

        {soon.length > 0 && (
          <>
            <h2 className="mb-3 mt-7 text-[15px] font-semibold text-slate-400">敬请期待</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {soon.map(b => {
                const c = bankColor(b.code);
                return (
                  <div key={b.id} aria-disabled
                    className="flex items-center gap-2.5 rounded-2xl border border-black/[0.06] bg-white/70 px-3 py-3">
                    {/* 各卡用**自身身份色**的淡色圆片,不是统一灰 —— 提前建立色彩记忆 */}
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${c}1F` }}>
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c, opacity: 0.55 }} />
                    </span>
                    <span className="truncate text-[14px] font-medium text-slate-400">{b.name_zh}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * 入口卡。没有 `to` 的卡必须显式标"即将开放"。
 *
 * ⚠️ 由来:错题本卡原来只是不给 `to`,渲染成 `div` —— 技术上确实点不动,
 *    但它和旁边**可点的「今日复习」卡长得一模一样**,用户当然会去点,
 *    点了没反应。"不可点"和"看起来不可点"是两回事,
 *    前者靠 DOM,后者得靠视觉说清楚。PR-4 接上真页面时把 `to` 传进来即可。
 */
function EntryCard({ icon, label, count, hint, to }: { icon: React.ReactNode; label: string; count: number; hint: string; to?: string }) {
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
      <div className="mt-1 flex items-baseline gap-1">
        <span className={cn("text-[26px] font-bold", soon ? "text-slate-400" : "text-slate-900")}
          style={{ fontFamily: FONT_STAT, fontVariantNumeric: "tabular-nums" }}>{count}</span>
        <span className="text-[13px] text-slate-400">{hint}</span>
      </div>
    </>
  );
  const cls = "block rounded-2xl border border-black/[0.06] px-4 py-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]";
  return to
    ? <Link to={to} className={cn(cls, "bg-white active:bg-slate-50")}>{body}</Link>
    : <div aria-disabled="true" className={cn(cls, "cursor-not-allowed select-none bg-slate-50/60 opacity-70")}>{body}</div>;
}

function BankCard({ bank }: { bank: BankRow }) {
  const color = bankColor(bank.code);
  const total = bank.realTotal;
  const pct = total > 0 ? Math.min(100, Math.round((bank.mastered / total) * 100)) : 0;
  /* 进度条同样要两段:深=已掌握,浅=学习中。
   * ⚠️ 只绑 mastered 的话,新用户前四天(掌握判定要 4 个不同日期)
   *    看到的永远是 0/4470 的空条 —— 努力必须看得见。 */
  /* 同理:浅段用混色不用 opacity —— 深蓝掉 30% 就没色相了(见 StatsPanel 注释)。 */
  const lightBar = (() => {
    const m = /^#?([0-9a-f]{6})$/i.exec(color.trim());
    if (!m) return color;
    const n = parseInt(m[1], 16);
    const mix = (c: number) => Math.round(c + (255 - c) * 0.62);
    return `rgb(${mix((n >> 16) & 255)}, ${mix((n >> 8) & 255)}, ${mix(n & 255)})`;
  })();
  const pctReached = total > 0
    ? Math.min(100, Math.round(((bank.mastered + bank.learning) / total) * 100))
    : 0;
  const locked = needsUnlock(bank);

  return (
    <Link to={`/vocab/${bank.code}`}
      className="group flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white px-4 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      {/* 身份色徽章:淡色圆片 + 实心点。身份色只做标识,不做大面积填充 */}
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${color}1F` }}>
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[16px] font-semibold text-slate-900">{bank.name_zh}</span>
          {locked && <Lock className="h-4 w-4 shrink-0 text-slate-400" />}
        </div>
        <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
          {/* 浅段:已掌握 + 学习中 */}
          <div className="absolute inset-y-0 left-0 rounded-full"
            /* ⚠️ 最小可见宽度 3px,与成长图同口径。
               百分比宽度让"刚起步"永远看不见:64/4470 = 1%,在 6px 高的条上
               等于不存在 —— 而"让努力看得见"最需要的恰恰是起步阶段。 */
            style={{ width: pctReached > 0 ? `max(3px, ${pctReached}%)` : 0, background: lightBar }} />
          {/* 深段:已掌握(盖在浅段上) */}
          <div className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: pct > 0 ? `max(3px, ${pct}%)` : 0, background: color }} />
        </div>
        <div className="mt-1.5 text-[13px] text-slate-400" style={{ fontVariantNumeric: "tabular-nums" }}>
          {bank.mastered} / {total}
        </div>
      </div>
      <ChevronRight className="h-[18px] w-[18px] shrink-0 text-slate-300" />
    </Link>
  );
}
