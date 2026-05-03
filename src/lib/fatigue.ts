/**
 * 宠物疲劳态（#14）
 *  - 同一模块连续 ≥20 题 或 累计 ≥30 分钟 → 进入"累了"状态
 *  - 累了之后：奖励减半 + 触发 toast 提醒孩子休息
 *  - 切换模块或停顿 ≥10 分钟 → 重置
 *
 * 仅做客户端追踪（学习节奏类提示，不涉及防作弊安全），
 * 真正的金币上限由后端 award_learning_coins / pending_seeds 已控制。
 */
import { toast } from "sonner";

type FatigueState = {
  module: string;
  count: number;
  startedAt: number;
  lastAt: number;
  warned: boolean;
};

let state: FatigueState | null = null;
const IDLE_MS = 10 * 60 * 1000;
const TIRED_COUNT = 20;
const TIRED_MS = 30 * 60 * 1000;

function reset(module: string) {
  state = { module, count: 1, startedAt: Date.now(), lastAt: Date.now(), warned: false };
}

/** 答题后调用；返回是否当前疲劳。 */
export function noteAnswered(module: string): boolean {
  const now = Date.now();
  if (!state || state.module !== module || now - state.lastAt > IDLE_MS) {
    reset(module);
    return false;
  }
  state.count += 1;
  state.lastAt = now;
  const tired = state.count >= TIRED_COUNT || (now - state.startedAt) >= TIRED_MS;
  if (tired && !state.warned) {
    state.warned = true;
    toast("😴 宠物有点累啦，休息 5 分钟会更专注～奖励暂时减半", { duration: 3500 });
  }
  return tired;
}

export function isFatigued(module: string): boolean {
  if (!state || state.module !== module) return false;
  if (Date.now() - state.lastAt > IDLE_MS) return false;
  return state.count >= TIRED_COUNT || (Date.now() - state.startedAt) >= TIRED_MS;
}

export function clearFatigue() { state = null; }