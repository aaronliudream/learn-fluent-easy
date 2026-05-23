import { Link, useNavigate } from "react-router-dom";
import { usePrimaryHub } from "@/lib/primaryHub/context";
import {
  getTotalCompletedStages,
  shouldTriggerAITest,
} from "@/lib/primaryHub/progress";

export function AITestCard() {
  const { grade, state } = usePrimaryHub();
  const nav = useNavigate();
  const base = `/primary/hub/${grade}`;

  const total = getTotalCompletedStages(state);
  const lastTest = state.lastAITest || 0;
  const stagesSince = total - lastTest;
  const needed = 4;
  const history = state.aiTestHistory || [];
  const lastRecord = history[history.length - 1];
  const triggered = shouldTriggerAITest(state);

  if (triggered) {
    return (
      <button
        type="button"
        onClick={() => nav(`${base}/aitest`)}
        className="ai-card-v5 ready mb-3 w-full rounded-2xl border-2 border-[#FFE062] bg-gradient-to-br from-[#B45EFF] to-[#7B5BFF] p-3.5 text-left text-white"
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-bold">🤖 AI 智能小测试</div>
          <span className="rounded-lg bg-[#FFE062] px-2 py-0.5 text-[10px] font-semibold text-[#5B3CCC]">✨ 该测了</span>
        </div>
        <p className="mb-1.5 text-[13px] opacity-95">基于学过的内容 + 错题，AI 智能出题</p>
        <p className="text-base font-bold">点击开始 →</p>
        <p className="ai-card-tip mt-2 rounded-lg bg-white/15 px-2 py-1.5 text-[11px]">
          💡 每学一点测一下，记得更牢哦！这叫&quot;间隔测试&quot;
        </p>
      </button>
    );
  }

  if (history.length === 0 && total === 0) return null;

  const remaining = Math.max(0, needed - stagesSince);
  const progressPct = Math.min(100, Math.round((stagesSince / needed) * 100));

  if (lastRecord) {
    const lvl = lastRecord.percent >= 75 ? "high" : lastRecord.percent >= 60 ? "mid" : "low";
    const color = lvl === "high" ? "#6FA92A" : lvl === "mid" ? "#F5A623" : "#E0623F";
    return (
      <div className="ai-card-v5 done mb-3 rounded-2xl border-[1.5px] border-[#C9E0A8] bg-[#EAF3DE] p-3.5 text-[#3B6D11]">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-bold text-[#3B6D11]">🤖 AI 智能小测试</div>
          <Link
            to={`${base}/aihistory`}
            className="rounded-lg border border-current px-2.5 py-1 text-[11px] font-semibold opacity-85"
            onClick={(e) => e.stopPropagation()}
          >
            📊 历史
          </Link>
        </div>
        <p className="mb-1 text-xs text-[#5C5751]">
          上次成绩：<b style={{ color }}>{lastRecord.percent} 分</b> · 答对 {lastRecord.correct}/{lastRecord.total}
        </p>
        <div className="my-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/5">
            <div className="h-full rounded-full bg-[#6FA92A]" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="whitespace-nowrap text-xs font-semibold text-[#5C5751]">还差 {remaining} 关</span>
        </div>
        <p className="rounded-lg bg-white/50 px-2 py-1.5 text-[11px] text-[#3B6D11]">
          ⏳ 再学 {remaining} 关就会自动触发下一次测试
        </p>
      </div>
    );
  }

  return (
    <div className="ai-card-v5 locked mb-3 rounded-2xl border-[1.5px] border-[#E5DEFA] bg-[#F5F3FF] p-3.5 text-[#5B3CCC]">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-bold">🤖 AI 智能小测试</div>
        <span className="rounded-lg bg-[#E5DEFA] px-2 py-0.5 text-[10px] font-semibold">🔒 未解锁</span>
      </div>
      <p className="mb-1 text-xs text-[#5C5751]">学完几关 + 累积一些错题后，AI 会自动出题考考你</p>
      <div className="my-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#B45EFF] to-[#7B5BFF]"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-xs font-semibold">
          {stagesSince}/{needed}
        </span>
      </div>
      <p className="rounded-lg bg-[#F0EAFF] px-2 py-1.5 text-[11px] text-[#6B4FD8]">
        💡 小科普：每学一点就测一下，记得更牢哦！这叫&quot;间隔测试&quot;
      </p>
    </div>
  );
}
