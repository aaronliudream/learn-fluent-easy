import { Link } from "react-router-dom";
import { useGaokaoHub } from "@/lib/gaokaoHub/context";
import { getGradeProgress, getTotalStars } from "@/lib/gaokaoHub/progress";
import { getGradeCourse } from "@/lib/gaokaoHub/courseData";

export default function GaokaoHubProfile() {
  const { grade, publisher, state } = useGaokaoHub();
  const base = `/gaokao/hub/${grade}`;
  const course = getGradeCourse(grade, publisher);
  const gp = getGradeProgress(state, grade);
  const last = state.aiTestHistory[state.aiTestHistory.length - 1];

  return (
    <>
      <div className="bg-gradient-to-br from-[#FF6B35] to-[#FFB627] px-5 pb-6 pt-4 text-white">
        <div className="text-4xl">{state.user.avatar}</div>
        <div className="text-xl font-bold">{state.user.name}</div>
        <div className="text-sm opacity-90">{course.name} · 学习档案</div>
      </div>
      <div className="px-4 py-4 space-y-2">
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <div className="text-xs text-[#888780]">总进度</div>
          <div className="text-2xl font-bold text-[#FF6B35]">{gp.percent}%</div>
          <div className="text-xs">⭐ {getTotalStars(state)} 星星</div>
        </div>
        <Link
          to="/mistakes"
          className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm"
        >
          <span className="text-2xl">📝</span>
          <div className="flex-1">
            <div className="font-semibold">错题本</div>
            <div className="text-xs text-[#888780]">跨设备同步 · 点开按记忆曲线复习</div>
          </div>
          <span>›</span>
        </Link>
        <Link
          to={`${base}/aihistory`}
          className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm"
        >
          <span className="text-2xl">📊</span>
          <div className="flex-1">
            <div className="font-semibold">AI 测试历史</div>
            <div className="text-xs text-[#888780]">
              {state.aiTestHistory.length
                ? `共 ${state.aiTestHistory.length} 次，最近 ${last?.percent} 分`
                : "还没有测试记录"}
            </div>
          </div>
          <span>›</span>
        </Link>
        <Link to="/primary" className="block pt-4 text-center text-sm text-[#FF6B35]">
          切换年级
        </Link>
      </div>
    </>
  );
}
