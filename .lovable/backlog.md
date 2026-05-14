# Backlog (deferred — not this iteration)

冒出来的新功能想法都写到这里,本周不做。
复盘时再决定要不要排进下一阶段。

## P1

- 重构 `GuidedSession` 改用 `MASTERY_STEP_KINDS`,删除 `STEP_KIND`。
  当前两个表(`STEP_KIND` per-word ladder + `MASTERY_STEP_KINDS` cohort rollup)
  是同一个 step→kinds 映射的两份真值,结构虽不同但语义重叠,任何一方变更
  都需要手工同步。统一后只保留一份。

- VocabMasteryPath 副标题下方加"本批 10 词"预览(或可展开列表)。
  现状:第 5 批 active 面板只显示进度,用户不知道自己在学哪 10 个词。
  位置:`VocabMasteryPath.tsx` 副标题下方。

- "未完成的批次"列表显示 P0 残债期产生的死批次(cohort_events 全空,
  永远走不动)。两个修复方案,P2.2 前讨论选哪个:
    a) migration:把 cohort_events=0 且 status='dormant' 的批次
       改成 status='graduated' + graduated_without_essay=true
    b) UI fallback:点击"继续"时检测 events 为空 → 提示用户归档