/**
 * 单元详情页路由分发 — Unit Gamified PR_1
 *
 * 白名单 unit (GAMIFIED_UNIT_IDS) 走新的游戏化组件 PrimaryHubUnitGamified;
 * 其余 unit 走老的 PrimaryHubUnit (老文件 0 改动).
 *
 * 加新游戏化 unit: src/lib/primaryHub/unitRoutingConfig.ts 加 unitId.
 *
 * 两个子组件都是 lazy import — 分发本身不预加载任何 unit body, 用户访问到
 * 才下载对应 chunk.
 */

import { lazy } from "react";
import { useParams } from "react-router-dom";
import { isGamifiedUnit } from "@/lib/primaryHub/unitRoutingConfig";

const PrimaryHubUnit = lazy(() => import("./PrimaryHubUnit"));
const PrimaryHubUnitGamified = lazy(() => import("./PrimaryHubUnitGamified"));

export default function PrimaryHubUnitDispatch() {
  const { unitId } = useParams<{ unitId: string }>();
  return isGamifiedUnit(unitId) ? <PrimaryHubUnitGamified /> : <PrimaryHubUnit />;
}
