/**
 * 词汇中心(/vocab)· PR-1 纯展示,零写入。
 *
 * 结构照 docs/vocab-bank/VOCAB_DESIGN_SPEC.md:
 *   顶部统计双视图 → 错题本 / 今日复习双入口(本 PR 仅占位)
 *   → 词库卡片网格(vocab_banks 动态渲染)→ is_active=false 进"敬请期待"分区
 *   → 里程碑徽章链
 *
 * ⚠️ 词库卡**不硬编码 11 个** —— 全部来自 vocab_banks,新库上线只改库不改前端。
 * ⚠️ 未登录 / 无数据必须能正常渲染 0 态。RLS 让未登录读掌握度读到空数组,
 *    那是预期行为不是异常,不能因此白屏。
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CalendarClock, ChevronRight, Lock, Sparkles } from "lucide-react";
import BackLink from "@/components/BackLink";
import { cn } from "@/lib/utils";
import StatsPanel from "@/components/vocab/StatsPanel";
import { bankColor, MILESTONES } from "@/lib/vocab/theme";
import { needsUnlock, VOCAB_PAYWALL } from "@/lib/vocab/paywall";
import {
  listBanks, getBankProgress, dueCount, mistakeCount, totalMastered,
  currentUserId, type VocabBank,
} from "@/lib/vocab/data";

type BankRow = VocabBank & { mastered: number };

export default function VocabCenter() {
  const [banks, setBanks] = useState<BankRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [due, setDue] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [mastered, setMastered] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [list, uid] = await Promise.all([listBanks(), currentUserId()]);
        if (!alive) return;
        setSignedIn(!!uid);

        // 掌握度只对已激活的库查,省掉 10 个"敬请期待"库的空查询
        const active = list.filter(b => b.is_active);
        const progress = await Promise.all(
          active.map(b => getBankProgress(b.id, b.total_words).catch(() => null)),
        );
        if (!alive) return;
        const masteredBy = new Map(active.map((b, i) => [b.id, progress[i]?.mastered ?? 0]));
        setBanks(list.map(b => ({ ...b, mastered: masteredBy.get(b.id) ?? 0 })));

        if (uid) {
          const [d, m, t] = await Promise.all([
            dueCount().catch(() => 0), mistakeCount().catch(() => 0), totalMastered().catch(() => 0),
          ]);
          if (!alive) return;
          setDue(d); setMistakes(m); setMastered(t);
        }
      } catch {
        if (alive) setFailed(true);   // 取不到就显示重试,不白屏
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const active = banks.filter(b => b.is_active);
  const soon = banks.filter(b => !b.is_active);
  const totalMasteredAll = mastered;
  const nextMilestone = MILESTONES.find(m => m > totalMasteredAll) ?? MILESTONES[MILESTONES.length - 1];

  // 中心页的统计:把各激活库的掌握数加总,总量用 total_words 之和
  const sumMastered = active.reduce((s, b) => s + b.mastered, 0);
  const sumTotal = active.reduce((s, b) => s + (b.total_words || 0), 0);

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <div className="mx-auto w-full max-w-[720px] px-4 pb-16 pt-4">
        <BackLink to="/" className="mb-3 inline-flex items-center gap-1 text-[13px] text-slate-500">
          ← 返回首页
        </BackLink>

        <h1 className="mb-1 text-[22px] font-bold text-slate-900">词汇</h1>
        <p className="mb-5 text-[13px] text-slate-500">按考试选词库,词卡带真人发音例句</p>

        <StatsPanel
          mastered={sumMastered}
          learning={0}
          untouched={Math.max(0, sumTotal - sumMastered)}
          emptyHint={
            signedIn
              ? "还没有学习记录。选一个词库开始,答对的词会自动记进掌握度。"
              : "登录后开始记录进度。未登录也可以先试做 20 题。"
          }
        />

        {/* 双入口:本 PR 仅占位,数字接真实 count */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <PlaceholderEntry
            icon={<AlertCircle className="h-4 w-4" />}
            label="错题本"
            count={mistakes}
            hint="待清"
          />
          <PlaceholderEntry
            icon={<CalendarClock className="h-4 w-4" />}
            label="今日复习"
            count={due}
            hint="到期"
          />
        </div>

        {/* 里程碑徽章链 */}
        <div className="mt-4 rounded-2xl border border-black/[0.08] bg-white p-4">
          <div className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
            <Sparkles className="h-4 w-4 text-slate-400" />
            里程碑
          </div>
          <div className="flex flex-wrap gap-2">
            {MILESTONES.map(m => {
              const reached = totalMasteredAll >= m;
              return (
                <span
                  key={m}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[12px] font-medium",
                    reached
                      ? "border-transparent bg-slate-900 text-white"
                      : "border-black/[0.08] text-slate-400",
                  )}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {m}
                </span>
              );
            })}
          </div>
          <p className="mt-3 text-[12px] text-slate-400">
            距离下一档还差{" "}
            <span className="font-medium text-slate-600" style={{ fontVariantNumeric: "tabular-nums" }}>
              {Math.max(0, nextMilestone - totalMasteredAll)}
            </span>{" "}
            词
          </p>
        </div>

        {/* 词库网格 */}
        <h2 className="mb-3 mt-6 text-[15px] font-semibold text-slate-900">词库</h2>
        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="h-[92px] animate-pulse rounded-2xl border border-black/[0.08] bg-white" />
            ))}
          </div>
        ) : failed ? (
          <div className="rounded-2xl border border-black/[0.08] bg-white p-6 text-center">
            <p className="text-[14px] text-slate-600">词库加载失败</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 rounded-full border border-black/[0.08] px-4 py-1.5 text-[13px] text-slate-700"
            >
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
              {soon.map(b => (
                <div
                  key={b.id}
                  className="rounded-2xl border border-black/[0.08] bg-white/60 px-3 py-3"
                  aria-disabled
                >
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-[3px] rounded-full bg-slate-200" />
                    <span className="text-[13px] font-medium text-slate-400">{b.name_zh}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PlaceholderEntry({ icon, label, count, hint }: { icon: React.ReactNode; label: string; count: number; hint: string }) {
  return (
    <div className="rounded-2xl border border-black/[0.08] bg-white px-4 py-3">
      <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-700">
        <span className="text-slate-400">{icon}</span>
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-[22px] font-bold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>{count}</span>
        <span className="text-[12px] text-slate-400">{hint}</span>
      </div>
    </div>
  );
}

function BankCard({ bank }: { bank: BankRow }) {
  const color = bankColor(bank.code);
  const total = bank.total_words || 0;
  const pct = total > 0 ? Math.min(100, Math.round((bank.mastered / total) * 100)) : 0;
  const locked = needsUnlock(bank);

  return (
    <Link
      to={`/vocab/${bank.code}`}
      className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-black/[0.08] bg-white px-4 py-3.5"
    >
      {/* 身份色只做左侧色条,不铺底 */}
      <span className="h-10 w-[4px] shrink-0 rounded-full" style={{ background: color }} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[15px] font-semibold text-slate-900">{bank.name_zh}</span>
          {locked && <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
        </div>
        <div className="mt-1 text-[12px] text-slate-400" style={{ fontVariantNumeric: "tabular-nums" }}>
          {bank.mastered} / {total}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
    </Link>
  );
}
