import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useJuniorHub } from "@/lib/juniorHub/context";
import { readJuniorPublisherParam, withJuniorPublisher } from "@/lib/juniorHub/publisher";
import { findUnit } from "@/lib/juniorHub/courseData";
import { getUnitProgress, nextAiTestMilestone } from "@/lib/juniorHub/progress";
import { getUnitState } from "@/lib/juniorHub/storage";
import { AI_TEST_PROGRESS_STEP } from "@/lib/juniorHub/types";

export function AITestCard() {
  const { grade, state } = useJuniorHub();
  const nav = useNavigate();
  const base = `/junior/hub/${grade}`;
  const [sp] = useSearchParams();
  const pub = readJuniorPublisherParam(sp);

  const unit = findUnit(state.currentUnit);
  const unitP = unit ? getUnitProgress(state, unit.id) : { percent: 0, ratio: 0 };
  const us = unit ? getUnitState(state, unit.id) : null;
  const nextMilestone = nextAiTestMilestone(unitP.ratio);
  const lastMilestone = us?.lastAiTestAtProgress ?? 0;
  const ready = unitP.ratio >= AI_TEST_PROGRESS_STEP && nextMilestone > lastMilestone;

  const history = state.aiTestHistory || [];
  const lastRecord = history[history.length - 1];

  if (ready) {
    return (
      <button
        type="button"
        onClick={() => nav(withJuniorPublisher(`${base}/aitest${unit ? `?unit=${unit.id}` : ""}`, pub))}
        className="mb-3 w-full rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-500 to-violet-600 p-3.5 text-left text-white shadow-sm"
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-bold">🤖 AI 单元小测</div>
          <span className="rounded-lg bg-amber-300 px-2 py-0.5 text-[10px] font-semibold text-indigo-900">✨ 该测了</span>
        </div>
        <p className="mb-1.5 text-[13px] opacity-95">
          本单元已学 {unitP.percent}%（满 10% 触发）· 根据学过内容 + 错题出题
        </p>
        <p className="text-base font-bold">点击开始 →</p>
      </button>
    );
  }

  if (history.length === 0 && (unitP.completed ?? 0) === 0) return null;

  const targetPct = Math.round((lastMilestone + AI_TEST_PROGRESS_STEP) * 100);
  const progressPct = Math.min(
    100,
    Math.round(((unitP.ratio - lastMilestone) / AI_TEST_PROGRESS_STEP) * 100),
  );

  if (lastRecord) {
    const color =
      lastRecord.percent >= 75 ? "#6FA92A" : lastRecord.percent >= 60 ? "#F5A623" : "#E0623F";
    return (
      <div className="mb-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-3.5 text-indigo-950">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-bold">🤖 AI 单元小测</div>
          <Link to={withJuniorPublisher(`${base}/aihistory`, pub)} className="text-[11px] font-semibold text-indigo-600">
            📊 历史
          </Link>
        </div>
        <p className="mb-1 text-xs text-[#5C5751]">
          上次：<b style={{ color }}>{lastRecord.percent} 分</b>（{lastRecord.correct}/{lastRecord.total}）
        </p>
        <div className="my-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/5">
            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="whitespace-nowrap text-xs font-semibold">下一测 {targetPct}%</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3 rounded-2xl border border-indigo-100 bg-indigo-50/80 p-3.5 text-indigo-900">
      <div className="text-sm font-bold">🤖 AI 单元小测</div>
      <p className="mt-1 text-xs text-[#5C5751]">每完成约 10% 单元进度自动可测一次（需有学习记录）</p>
    </div>
  );
}
