import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Hub 内「返回」的统一行为:**优先原路退回**,没有来路才回兜底页。
 *
 * ★为什么需要★
 * 册页的返回按钮原先硬编码到 `${base}/course`(三条线都是)。在「课程 tab」的语义下
 * 那是上一级没错,但用户常常是**从 hub 仪表盘直接点某一册**进来的
 * (`JuniorHubHome` → `/semester/:semId`),此时返回就跳到了一个他根本没经过的橙色选课页。
 * Aaron 2026-07-27 真机撞到:紫仪表盘 → 册页 → 单元 → 关卡,返回却落到 /course。
 *
 * ★实现★
 * react-router 给初始进入的 location.key 是 "default";只要不是 "default",
 * 说明是站内跳转过来的、history 里有上一条,直接 nav(-1) 原路退回。
 * 直接粘贴 URL / 刷新 / 新标签打开 → key 是 "default" → 用 fallback(保持老行为)。
 *
 * 这样既满足「不得跳到用户没来过的页面」,又不会在深链进入时退到站外。
 */
export function useHubBack(fallback: string) {
  const nav = useNavigate();
  const loc = useLocation();
  return useCallback(() => {
    if (loc.key && loc.key !== "default") {
      nav(-1);
      return;
    }
    nav(fallback);
  }, [nav, loc.key, fallback]);
}

export default useHubBack;
