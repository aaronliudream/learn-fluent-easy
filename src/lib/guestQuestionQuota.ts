// 游客整站答题配额(单一事实来源)。
// 未登录访客全站累计可做 GUEST_QUESTION_LIMIT 题,超出后由 <GuestQuotaWall/> 弹注册墙拦截。
// 登录用户无限:既不计数也不拦截。计数落 localStorage,跨刷新保留(清缓存即重置,可接受)。
import { supabase } from "@/integrations/supabase/client";

const KEY = "guest_question_count_v1";
export const GUEST_QUESTION_LIMIT = 20;

// 登录态缓存(供同步读取)。初值按"游客"处理;getSession 解析后修正。
// 误差只在登录用户进站后的极短窗口内,且登录用户本就不计数/不拦截,无副作用。
let signedIn = false;

type Listener = () => void;
const listeners = new Set<Listener>();
function emit() {
  listeners.forEach((l) => {
    try { l(); } catch { /* noop */ }
  });
}

/** 订阅配额/登录态变化(计数变动或登录态翻转时触发)。返回取消订阅函数。 */
export function subscribeGuestQuota(l: Listener): () => void {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

function readUsed(): number {
  try {
    const v = Number(localStorage.getItem(KEY) || "0");
    return Number.isFinite(v) && v > 0 ? v : 0;
  } catch {
    return 0;
  }
}
function writeUsed(n: number) {
  try { localStorage.setItem(KEY, String(n)); } catch { /* noop */ }
  emit();
}

export function getGuestQuestionsUsed(): number {
  return readUsed();
}
export function guestQuestionsRemaining(): number {
  return Math.max(0, GUEST_QUESTION_LIMIT - readUsed());
}
export function isGuestUser(): boolean {
  return !signedIn;
}

/** 游客累计到上限=true;登录用户恒为 false。 */
export function isGuestQuotaExhausted(): boolean {
  return !signedIn && readUsed() >= GUEST_QUESTION_LIMIT;
}

/** 答完一题调用一次。登录用户 no-op;游客 +1,达到上限即 emit 触发注册墙。 */
export function recordGuestQuestion(): void {
  if (signedIn) return;
  // 封顶在 LIMIT+1,避免无谓增大数字。
  writeUsed(Math.min(readUsed() + 1, GUEST_QUESTION_LIMIT + 1));
}

// —— 登录态:初始拉取 + 实时监听 ——
void supabase.auth.getSession().then(({ data: { session } }) => {
  signedIn = !!session;
  emit();
});
supabase.auth.onAuthStateChange((_event, session) => {
  signedIn = !!session;
  emit();
});
