# Backlog (deferred — not this iteration)

冒出来的新功能想法都写到这里,本周不做。
复盘时再决定要不要排进下一阶段。

## P1

- 重构 `GuidedSession` 改用 `MASTERY_STEP_KINDS`,删除 `STEP_KIND`。
  当前两个表(`STEP_KIND` per-word ladder + `MASTERY_STEP_KINDS` cohort rollup)
  是同一个 step→kinds 映射的两份真值,结构虽不同但语义重叠,任何一方变更
  都需要手工同步。统一后只保留一份。