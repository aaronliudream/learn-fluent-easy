---
name: quiz-session-size
description: Per-session question counts for grammar/cloze/reading quizzes
type: preference
---
**Single-session question limits** (黄金注意力窗口 ≤10 分钟):

- Junior grammar (`JuniorGrammarPoint`, `JuniorGrammarLab`): **10 题/组**
- Senior/Gaokao grammar (`GaokaoGrammarQuiz`): **12 题/组**
- Cloze (`GaokaoClozePlay`, junior cloze in Lesson): **1 篇/次**
- Reading (`GaokaoReadingPlay`, `JuniorReadingPlay`, `PrimaryReadingPlay`): **1 篇/次**
- Vocab: 10–15 (junior), 12–20 (senior)
- Listening: 5–8 (junior), 8–10 (senior)

**How to apply:** When adding new quiz pages or refactoring existing ones, slice/limit the fetched question array to these caps. Use `.slice(0, N)` after sort, or `.limit(N)` in Supabase query.

**Why:** Cognitive load + 间隔重复理论 — short sessions repeated outperform long marathons by ~3x.

**Not yet implemented:** "连续 3 组解锁挑战模式 (20+ 题)" — future feature.
