import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Hub 内「返回」——**沿层级向上一层,直接 navigate 到确定的父路径**。
 *
 * ★为什么不用 nav(-1)★(2026-07-27 Aaron 实测被困后改)
 * 第一版用 `location.key !== "default" → nav(-1)` 做「原路退回」。看起来对,实测会把人困住:
 * 单元页 ↔ 关卡页反复横跳几次,历史栈里就堆满了这两页;此时点「返回单元」只是往回弹一格,
 * 又回到关卡 → 再点又回单元……用户在两页之间打转,唯一出口是「返回首页」。
 * **历史栈记录的是「走过的顺序」,不是「层级关系」** —— 用它做返回,层级越深越容易打转。
 *
 * ★现在的做法★ 每一层的父路径都能从当前路由参数推出,直接跳过去,不依赖历史:
 *   关卡 → 它所属的单元页(semId + unitId 都在 URL 上)
 *   单元 → 它所属的册页(semId 在 URL 上)
 *   册页 → 该学段根页(/junior /gaokao /primary)
 * 美语线一直是这么做的(层级父路径从数据推出),没出过这个问题。
 *
 * ★为什么册页的父级是学段根、不是 hub 仪表盘★
 * 用户进册页有三条来路:仪表盘、课程 tab、星空选版页。仪表盘只是其中一条,
 * 把它当成唯一父级,对另外两条路进来的人就是「跳到没来过的页面」——
 * Aaron 从 /gaokao 星空页深入后点返回落到 /gaokao/hub/2 仪表盘,就是这个。
 * 学段根是三条来路的共同上游,谁进来都认得。
 */
export function useHubBack(parentPath: string) {
  const nav = useNavigate();
  return useCallback(() => {
    nav(parentPath);
  }, [nav, parentPath]);
}

export default useHubBack;
