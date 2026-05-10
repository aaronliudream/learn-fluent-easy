/**
 * 中央统一答题路由（v7 工程包阶段 2 精华）
 *
 * 所有 mastery 工具库（gaokaoMastery / juniorGrammarFsrs / grammarFsrs /
 * grammarMastery / masteryProgress）以及个别直写表 page 都调用本文件的
 * `recordUnifiedAttempt`，把答题事件统一写入 `unified_mastery`，并由后端
 * Edge Function `record-attempt` 完成 FSRS-lite 评分、自动加错题本、
 * AI 诊断缓存智能失效等副作用。
 *
 * 这里只是一个稳定的命名出口（v7 spec 约定），实现委托给已有的
 * `useRecordAttempt` hook（同名 async 函数，可在非组件上下文调用）。
 */
export {
  recordUnifiedAttempt,
  type AttemptInput as UnifiedAttemptInput,
  type AttemptResult as UnifiedAttemptResult,
  type AttemptStage as Stage,
  type AttemptModule as ModuleKey,
} from "@/hooks/useRecordAttempt";

/** 由 grade 推断学段 */
export function inferStage(grade: number): "primary" | "junior" | "senior" {
  if (grade >= 1 && grade <= 6) return "primary";
  if (grade >= 7 && grade <= 9) return "junior";
  return "senior";
}