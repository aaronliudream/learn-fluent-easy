/**
 * 全局「继续闯关」悬浮球
 *
 * 记住上次进入但没做完的闯关关卡(由 LevelShell 写入 fc:resume,见
 * lib/primaryHub/finalChallenge/resume.ts)。任何页面右下角浮现一个小球,
 * 点它跳回那一关 —— 重新抽题、从头做,不精确到第几题。
 *
 * 显示规则:
 *   - 只有拿到非 null 记录时才渲染;没有记录 → 不渲染。
 *   - 正在做题的那一关(关卡页本身)不显示,避免自己挡自己。
 *   - 球放在底部导航上方一点,z-index 低于模态弹窗(z-50)/导航(z-40),
 *     物理上又在导航条之上,不互相遮挡。
 *
 * 点击:写回该关册别到 sessionStorage(fc:volume,各关抽题靠它),再复用
 * 「从菜单进关卡」那条路由跳转 /primary/hub/:grade/final-challenge/level/:levelId。
 */

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  clearResume,
  getResume,
  type ResumePoint,
} from "@/lib/primaryHub/finalChallenge/resume";

/** 当前路由是否就是某个闯关关卡页(在它上面不显示球)。 */
function isOnLevelPage(pathname: string): boolean {
  return pathname.includes("/final-challenge/level/");
}

export default function ResumeFab() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [point, setPoint] = useState<ResumePoint | null>(null);

  // 每次路由变化都重读一次记录:离开关卡页后球出现,记录被清后球消失。
  useEffect(() => {
    let cancelled = false;
    void getResume().then((p) => {
      if (!cancelled) setPoint(p);
    });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // 没记录,或正站在关卡页本身 → 不渲染。
  if (!point || isOnLevelPage(pathname)) return null;

  const goResume = () => {
    // 把册别写回 sessionStorage,保证跳回去后抽到的是同一册的题。
    try {
      sessionStorage.setItem("fc:volume", point.volume);
    } catch {
      // ignore
    }
    navigate(
      `/primary/hub/${point.grade}/final-challenge/level/${point.levelId}`,
    );
  };

  const dismiss = () => {
    void clearResume();
    setPoint(null);
  };

  // 角标文字:有关名用关名(如"连词成句"),否则回退"第X关"。
  const badge =
    point.levelName && point.levelName !== "敬请期待"
      ? point.levelName
      : `第${point.levelId}关`;

  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: "calc(76px + env(safe-area-inset-bottom, 0px))",
        zIndex: 30,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        pointerEvents: "none",
      }}
    >
      {/* 关闭 ✕ —— 点了当次清掉记录、隐藏球(避免孩子嫌挡) */}
      <button
        type="button"
        aria-label="关闭继续闯关"
        onClick={dismiss}
        style={{
          pointerEvents: "auto",
          alignSelf: "flex-end",
          width: 20,
          height: 20,
          borderRadius: "50%",
          border: "none",
          background: "rgba(42, 38, 32, 0.55)",
          color: "white",
          fontSize: 12,
          lineHeight: 1,
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          padding: 0,
        }}
      >
        ✕
      </button>

      <button
        type="button"
        aria-label={`继续闯关:${badge}`}
        onClick={goResume}
        className="fc-btn-press"
        style={{
          pointerEvents: "auto",
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          background:
            "linear-gradient(135deg, #FFB454 0%, #FF8855 60%, #ED3F8C 100%)",
          color: "white",
          boxShadow: "0 8px 20px -6px rgba(237, 63, 140, 0.65)",
          display: "grid",
          placeItems: "center",
          fontSize: 24,
          lineHeight: 1,
        }}
      >
        🎮
      </button>

      {/* 角标:关名 / 第X关 */}
      <span
        style={{
          pointerEvents: "none",
          maxWidth: 84,
          padding: "2px 8px",
          borderRadius: 9999,
          background: "rgba(42, 38, 32, 0.82)",
          color: "white",
          fontSize: 11,
          fontWeight: 700,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {badge}
      </span>
    </div>
  );
}
