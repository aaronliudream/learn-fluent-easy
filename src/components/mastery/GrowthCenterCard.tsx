// =====================================================================
// GrowthCenterCard —— “课堂同步 · 成长中心”卡片（范围感知，复用于首页/年级页/单元页）
// 技术栈：React + TypeScript + Tailwind + shadcn + @tanstack/react-query + Supabase
// 设计意图：保留你现有的名画背景（通过 backgroundImageUrl 传入），
//          只把 0% 完成度环换成掌握度环、把进度文案换成「你的薄弱项 + 练薄弱项」。
//
// 放置位置：替换 /junior 页面里那张「课堂同步」卡即可；同一个组件传不同 scope，
//          也放到年级页、单元页（见底部用法示例）。
// 依赖：已在 Supabase 部署 get_scope_overview（见 get_scope_overview.sql）。
// =====================================================================
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// ---------- 类型 ----------
export type ScopeType = "stage" | "grade" | "unit";

export interface WeakPoint {
  slug: string;
  name: string;
  score: number;          // 0–100，最弱法
  unit_code: string | null;
}
export interface ScopeOverview {
  scope_type: ScopeType;
  scope_id: string;
  pct: number;            // 范围掌握度（加权平均）
  total_points: number;
  mastered_points: number;
  weakest: WeakPoint[];
}

// ---------- 数据 hook（也可单独放到 src/hooks/useScopeOverview.ts）----------
export function useScopeOverview(scopeType: ScopeType, scopeId: string) {
  return useQuery({
    queryKey: ["scopeOverview", scopeType, scopeId],
    queryFn: async (): Promise<ScopeOverview> => {
      const { data, error } = await supabase.rpc("get_scope_overview", {
        p_scope_type: scopeType,
        p_scope_id: scopeId,
      });
      if (error) throw error;
      return data as ScopeOverview;
    },
    staleTime: 60_000,
  });
}

// ---------- 小工具 ----------
const GOLD = "#d0b16e";
function scoreColor(score: number) {
  if (score >= 75) return "#7fae5a"; // 已掌握 偏绿（暖调）
  if (score >= 50) return "#e0b566"; // 熟悉 金
  return "#e08a72";                  // 待提高 暖红
}

// 掌握度环（可替换为你已有的 MasteryRing 组件）
function MasteryRing({ pct, label }: { pct: number; label: string }) {
  const r = 33;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
  return (
    <svg width={86} height={86} viewBox="0 0 86 86" role="img" aria-label={`${label} ${pct}%`}>
      <circle cx={43} cy={43} r={r} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth={8} />
      <circle
        cx={43} cy={43} r={r} fill="none" stroke={GOLD} strokeWidth={8} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={offset} transform="rotate(-90 43 43)"
      />
      <text x={43} y={41} textAnchor="middle" fill="#f0e9da" fontSize={19} fontWeight={500}>{pct}%</text>
      <text x={43} y={56} textAnchor="middle" fill="#aebabe" fontSize={9}>{label}</text>
    </svg>
  );
}

// ---------- 主组件 ----------
export interface GrowthCenterCardProps {
  scopeType: ScopeType;
  scopeId: string;
  title?: string;                 // 默认「课堂同步 · 成长中心」
  ringLabel?: string;             // 环下方小字，如「本单元掌握度」
  backgroundImageUrl?: string;    // 你的名画背景；不传则用纯深色
  /** 点击「练薄弱项」：把薄弱考点交给自适应抽题路由 */
  onPracticeWeak?: (weakest: WeakPoint[], overview: ScopeOverview) => void;
}

export function GrowthCenterCard({
  scopeType,
  scopeId,
  title = "课堂同步 · 成长中心",
  ringLabel = "掌握度",
  backgroundImageUrl,
  onPracticeWeak,
}: GrowthCenterCardProps) {
  const { data, isLoading, isError } = useScopeOverview(scopeType, scopeId);

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#2f3a3f",
    backgroundImage: backgroundImageUrl
      ? `linear-gradient(90deg, rgba(28,34,37,0.92) 0%, rgba(28,34,37,0.78) 55%, rgba(28,34,37,0.55) 100%), url(${backgroundImageUrl})`
      : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <div
      className="rounded-2xl px-5 py-5 sm:px-6 sm:py-6 text-[#e8eef0] flex items-center gap-4 sm:gap-6"
      style={cardStyle}
    >
      <div className="flex-1 min-w-0">
        <span className="inline-block text-[11px] bg-white/15 text-[#dfe6e8] rounded-md px-2 py-0.5 mb-2">
          教材同步 · 人教版
        </span>
        <h3 className="font-serif text-xl sm:text-[22px] font-medium leading-tight">{title}</h3>

        {isLoading && (
          <div className="mt-3 space-y-2 animate-pulse">
            <div className="h-3 w-40 bg-white/15 rounded" />
            <div className="h-3 w-32 bg-white/10 rounded" />
            <div className="h-3 w-36 bg-white/10 rounded" />
          </div>
        )}

        {isError && (
          <p className="text-[12px] text-[#c3cdcf] mt-2">掌握度数据暂时加载失败，请稍后再试。</p>
        )}

        {data && !isLoading && (
          <>
            <p className="text-[12px] text-[#aebabe] mt-1">
              已掌握 {data.mastered_points}/{data.total_points} 考点
            </p>

            {data.weakest.length > 0 ? (
              <ul className="mt-2 space-y-0.5">
                {data.weakest.map((w) => (
                  <li key={w.slug} className="flex items-center gap-2 text-[12.5px]">
                    <span
                      className="w-[7px] h-[7px] rounded-full shrink-0"
                      style={{ backgroundColor: scoreColor(w.score) }}
                    />
                    <span className="truncate">
                      {scopeType !== "unit" && w.unit_code
                        ? `${unitLabel(w.unit_code)} · ${w.name}`
                        : w.name}
                    </span>
                    <span className="ml-auto pl-2 shrink-0" style={{ color: "#e7a892" }}>
                      {w.score}%
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12.5px] text-[#c3cdcf] mt-2">
                还没有练习记录，先做一次诊断点亮你的掌握地图。
              </p>
            )}

            <button
              type="button"
              onClick={() => data && onPracticeWeak?.(data.weakest, data)}
              className="inline-flex items-center gap-1 mt-3 rounded-lg px-4 py-2 text-[13px] font-medium transition-transform active:scale-[0.98]"
              style={{ backgroundColor: GOLD, color: "#3a2c10" }}
            >
              {data.weakest.length > 0 ? "练薄弱项" : "开始诊断"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <div className="shrink-0">
        <MasteryRing pct={data?.pct ?? 0} label={ringLabel} />
      </div>
    </div>
  );
}

// 把 unit_code（如 g7_u1）转成展示标签（如 U1）。按你的命名规则微调即可。
function unitLabel(unitCode: string): string {
  const m = unitCode.match(/_u(\d+)/i);
  return m ? `U${m[1]}` : unitCode;
}

// =====================================================================
// 用法示例
// ---------------------------------------------------------------------
// 初中英语专区首页（替换原「课堂同步」卡）：
//   <GrowthCenterCard
//     scopeType="stage" scopeId="junior"
//     ringLabel="初中总掌握度"
//     backgroundImageUrl="/images/hokusai-wave.jpg"   // ← 你原来的名画，照旧
//     onPracticeWeak={(weak) => navigate(`/junior/practice?weak=${weak.map(w=>w.slug).join(',')}`)}
//   />
//
// 初一年级页：   <GrowthCenterCard scopeType="grade" scopeId="7"     ringLabel="初一掌握度" .../>
// Unit 1 单元页： <GrowthCenterCard scopeType="unit"  scopeId="g7_u1" ringLabel="本单元掌握度" .../>
// =====================================================================
