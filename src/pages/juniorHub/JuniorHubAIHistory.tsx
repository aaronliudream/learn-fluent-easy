import { Link, useSearchParams } from "react-router-dom";
import { useJuniorHub } from "@/lib/juniorHub/context";
import { readJuniorPublisherParam, withJuniorPublisher } from "@/lib/juniorHub/publisher";
import { AI_DIMENSIONS } from "@/lib/juniorHub/types";
import { DimensionBars } from "@/components/juniorHub/DimensionBars";
import type { DimResults } from "@/lib/juniorHub/types";

export default function JuniorHubAIHistory() {
  const { grade, state } = useJuniorHub();
  const base = `/junior/hub/${grade}`;
  const [sp] = useSearchParams();
  const pub = readJuniorPublisherParam(sp);
  const history = state.aiTestHistory || [];

  if (history.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <div className="mb-3 text-6xl">📭</div>
        <div className="font-semibold">还没有测试记录</div>
        <p className="mt-1 text-sm text-[#888780]">学完几关后，AI 会自动出题考考你</p>
        <Link to={withJuniorPublisher(`${base}/profile`, pub)} className="mt-4 inline-block text-[#FF6B35]">
          ← 返回
        </Link>
      </div>
    );
  }

  const scores = history.map((h) => h.percent);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const bestScore = Math.max(...scores);
  const trend = history.length >= 2 ? scores[scores.length - 1] - scores[scores.length - 2] : 0;

  const totalDims: DimResults = {};
  AI_DIMENSIONS.forEach((d) => {
    totalDims[d.key] = { correct: 0, total: 0 };
  });
  history.forEach((h) => {
    if (h.dims) {
      AI_DIMENSIONS.forEach((d) => {
        const r = h.dims[d.key];
        if (r) {
          totalDims[d.key].correct += r.correct;
          totalDims[d.key].total += r.total;
        }
      });
    }
  });

  const recent = [...history].reverse();

  return (
    <>
      <div className="flex items-center gap-3 border-b border-[#EEEAE0] bg-white px-4 py-3">
        <Link to={withJuniorPublisher(`${base}/profile`, pub)} className="text-xl">
          ←
        </Link>
        <div className="text-lg font-bold">📊 AI 测试历史</div>
      </div>
      <div className="px-4 py-4">
        <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl bg-white p-3 shadow-sm">
          <div className="text-center">
            <div className="text-xl font-bold">{history.length}</div>
            <div className="text-[11px] text-[#888780]">测试次数</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-[#B45EFF]">{avgScore}</div>
            <div className="text-[11px] text-[#888780]">平均分</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-[#639922]">{bestScore}</div>
            <div className="text-[11px] text-[#888780]">最高分</div>
          </div>
        </div>
        {trend !== 0 && (
          <div
            className={`mb-4 rounded-xl p-3 text-center text-sm font-semibold ${
              trend > 0 ? "bg-[#EAF3DE] text-[#3B6D11]" : "bg-[#FFF4D6] text-[#854F0B]"
            }`}
          >
            {trend > 0 ? "📈 进步啦！" : "📉 状态稍降"} 比上次 {trend > 0 ? "+" : ""}
            {trend} 分
          </div>
        )}
        <div className="mb-4 rounded-xl border border-[#EEEAE0] bg-white p-3">
          <div className="mb-2 text-sm font-bold">🎯 综合能力分析（累计 {history.length} 次）</div>
          <DimensionBars dims={totalDims} />
        </div>
        <div className="mb-2 text-sm font-bold">📅 历次测试记录</div>
        {recent.map((h, i) => {
          const lvl = h.percent >= 75 ? "text-[#6FA92A]" : h.percent >= 60 ? "text-[#F5A623]" : "text-[#E0623F]";
          return (
            <div key={`${h.date}-${h.time}-${i}`} className="mb-2 flex items-center gap-3 rounded-xl border border-[#EEEAE0] bg-white p-3">
              <div className="grid size-7 place-items-center rounded-full bg-[#F4F0E6] text-[11px] font-bold">
                #{history.length - i}
              </div>
              <div className="flex-1">
                <div className="text-xs text-[#888780]">
                  {h.date} {h.time || ""}
                </div>
                <div className="text-sm font-semibold">
                  答对 {h.correct}/{h.total} 题
                </div>
              </div>
              <div className={`text-2xl font-extrabold ${lvl}`}>{h.percent}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
