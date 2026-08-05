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
  listBanks, getBankProgress, dueCount, mistakeCount, totalMastered,
  currentUserId, type VocabBank,
} from "@/lib/vocab/data";

type BankRow = VocabBank & { mastered: number; realTotal: number };

export default function VocabCenter() {
  const [banks, setBanks] = useState<BankRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [due, setDue] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [mastered, setMastered] = useState(0);
  const [learning, setLearning] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [list, uid] = await Promise.all([listBanks(), currentUserId()]);
        if (!alive) return;
        setSignedIn(!!uid);

        const active = list.filter(b => b.is_active);
        const progress = await Promise.all(
          active.map(b => getBankProgress(b.id, b.total_words).catch(() => null)),
        );
        if (!alive) return;
        const byId = new Map(active.map((b, i) => [b.id, progress[i]]));
        setBanks(list.map(b => ({
          ...b,
          mastered: byId.get(b.id)?.mastered ?? 0,
          // 分母用**实际挂在库下的词数**,不是 total_words(那是规划值)
          realTotal: byId.get(b.id)?.total ?? 0,
        })));
        setLearning(active.reduce((s, b) => s + (byId.get(b.id)?.learning ?? 0), 0));

        if (uid) {
          const [d, m, t] = await Promise.all([
            dueCount().catch(() => 0), mistakeCount().catch(() => 0), totalMastered().catch(() => 0),
          ]);
          if (!alive) return;
          setDue(d); setMistakes(m); setMastered(t);
        }
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

        <StatsPanel
          mastered={mastered}
          learning={learning}
          untouched={0}
          /* 「已测」= 掌握 + 学习中 = 作答过的词数。它**只涨不跌**,
             与只涨也会跌的掌握数构成「实力 + 努力」双成就:
             哪怕掌握数因答错回落,努力的痕迹也还在。 */
          tested={mastered + learning}
          showDenominator={false}
          emptyHint={signedIn
            ? "还没有学习记录。选一个词库开始,答对的词会自动记进掌握度。"
            : "登录后开始记录进度。未登录也可以先试做 20 题。"}
        />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <EntryCard icon={<AlertCircle className="h-[18px] w-[18px]" />} label="错题本" count={mistakes} hint="待清" />
          <EntryCard icon={<CalendarClock className="h-[18px] w-[18px]" />} label="今日复习" count={due} hint="到期" />
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

function EntryCard({ icon, label, count, hint }: { icon: React.ReactNode; label: string; count: number; hint: string }) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white px-4 py-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-1.5 text-[14px] font-medium text-slate-700">
        <span className="text-slate-400">{icon}</span>{label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-[26px] font-bold text-slate-900"
          style={{ fontFamily: FONT_STAT, fontVariantNumeric: "tabular-nums" }}>{count}</span>
        <span className="text-[13px] text-slate-400">{hint}</span>
      </div>
    </div>
  );
}

function BankCard({ bank }: { bank: BankRow }) {
  const color = bankColor(bank.code);
  const total = bank.realTotal;
  const pct = total > 0 ? Math.min(100, Math.round((bank.mastered / total) * 100)) : 0;
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
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
        </div>
        <div className="mt-1.5 text-[13px] text-slate-400" style={{ fontVariantNumeric: "tabular-nums" }}>
          {bank.mastered} / {total}
        </div>
      </div>
      <ChevronRight className="h-[18px] w-[18px] shrink-0 text-slate-300" />
    </Link>
  );
}
