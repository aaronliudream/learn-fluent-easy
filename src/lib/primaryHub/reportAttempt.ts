import { recordUnifiedAttempt, type AttemptModule } from "@/hooks/useRecordAttempt";

/**
 * 小学做题落库(stage="primary")。★纯额外动作★:
 * - 完全 fire-and-forget,try-catch + .catch 双重兜底;
 * - 上报失败/网络错/未登录一律静默,绝不抛错、不阻塞、不影响做题对错/星星/进度/localStorage;
 * - 不改任何判分逻辑,只在各关型已有的对错判定点旁多调一次。
 * 登录用户写 unified_mastery_manual → dashboard 视图按学段汇总出小学掌握度;
 * 游客 recordUnifiedAttempt 自身会早退(顺带计入游客20题配额),同样不影响做题。
 */
export function reportPrimaryAttempt(opts: {
  grade: number;
  module: AttemptModule;
  itemType: string;
  itemId: string;
  itemLabel?: string;
  isCorrect: boolean;
}): void {
  try {
    void recordUnifiedAttempt({
      stage: "primary",
      grade: opts.grade,
      module: opts.module,
      item_type: opts.itemType,
      item_id: opts.itemId,
      item_label: opts.itemLabel,
      is_correct: opts.isCorrect,
    }).catch(() => {
      /* 上报失败静默,不影响做题 */
    });
  } catch {
    /* 同步异常也吞掉 */
  }
}
