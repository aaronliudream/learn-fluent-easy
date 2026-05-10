---
name: quiz-session-size
description: Per-session question counts and challenge mode unlock for grammar/cloze/reading
type: preference
---
**Single-session question limits** (黄金注意力窗口 ≤10 分钟):

- Junior grammar (`JuniorGrammarPoint`, `JuniorGrammarLab`): **10 题/组**（挑战模式 20 题）
- Senior/Gaokao grammar (`GaokaoGrammarQuiz`): **12 题/组**（挑战模式 24 题）
- Cloze (`GaokaoClozePlay`, junior cloze in Lesson): **1 篇/次**
- Reading (`GaokaoReadingPlay`, `JuniorReadingPlay`, `PrimaryReadingPlay`): **1 篇/次**
- Vocab: 10–15 (junior), 12–20 (senior)
- Listening: 5–8 (junior), 8–10 (senior)

**Challenge Mode** (`src/lib/challengeMode.ts` + table `quiz_streaks`):
- 用户在同一题点连续完成 3 组（每组正确率 ≥70%）即解锁挑战模式
- 解锁后复盘页出现 "🏆 挑战模式 (20/24 题)" 按钮，URL 带 `?challenge=1` 进入大题量
- 单组 <70% 会重置连胜
- scope_key 约定：`junior_grammar:{point_id}` / `senior_grammar:{point_id}`

**How to apply:** New quiz pages 用 `.slice(0, N)` 限制题量，结算时调 `recordGroupCompletion(scopeKey, pct)` 喂给挑战模式。

**Why:** 间隔重复理论 — 短组重复 > 长组单次，约 3 倍效果差。
