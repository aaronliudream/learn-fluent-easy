/**
 * 访问控制(方案 A)。
 *
 * VOCAB_PAYWALL **默认 off**:登录用户可学所有 is_active 词库,包括 is_free=false 的托福。
 * flag=on 时,is_free=false 的库点进去弹"激活码解锁"层 —— 本期只做壳,
 * 核销逻辑等支付线 PR,所以弹层里不许出现"立即支付"这类会让用户以为能付钱的按钮。
 *
 * ⚠️ 这是**展示层闸门,不是安全边界**。真正拦住写库的是 RLS:
 *    user_vocab_mastery / vocab_mistake_book 的策略绑 auth.uid(),
 *    未登录根本调不到写接口。前端这层只决定"给不给看入口"。
 */

/** Vite 只暴露 VITE_ 前缀的变量;取不到就是 off。 */
function envFlag(name: string): boolean {
  try {
    const v = (import.meta.env as Record<string, string | undefined>)[name];
    return v === "true" || v === "1";
  } catch {
    return false;
  }
}

export const VOCAB_PAYWALL = envFlag("VITE_VOCAB_PAYWALL");

/** 微信登录按钮位(PR-5 用)。默认关 —— 关闭时**整个按钮不渲染**,不要渲染成灰色禁用态。 */
export const VOCAB_WECHAT_LOGIN = envFlag("VITE_VOCAB_WECHAT_LOGIN");

/** 该词库是否需要激活码才能进。paywall 关着时永远 false。 */
export function needsUnlock(bank: { is_free: boolean; is_active: boolean }): boolean {
  if (!VOCAB_PAYWALL) return false;
  return bank.is_active && !bank.is_free;
}
