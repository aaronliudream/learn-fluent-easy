# g4v2_u2 · Unit 2 样板说明

## Phonics（任务 4b 前跳过）

Unit 2 Let's spell：**ir / ur** — girl, bird, nurse, hamburger, dirt, birth, hurt, number.

未接入 `phonics/g4v2_u2_*.ts`；认识单词关无拼读 Tab。

## 口语语速（hubSpeakSpeed）

全 Hub 默认 **0.85**（`hubSpeakSpeed.ts`），句型关顶部可调。本 Unit 无单独 JSON 字段。

## 跨 Unit 复现钩子（finalQuiz）

`quizQuestions[].point` 使用前缀，供 Unit 3–6 选题脚本或人工挑题：

| point 前缀 | 含义 |
|------------|------|
| `u2:recall_vocab` | 可回考的核心词义 |
| `u2:recall_time` | 整点 / What time is it? |
| `u2:recall_routine` | time for / time to 作息句 |

Unit 3+ 的 `finalQuiz` 可混入 1–2 题 `point` 含 `u2:` 的题，或复制题干并改 `unitTitle`。

## 产品阶段映射（8 关 · 无 phonics Tab）

| 规格名 | stage | type |
|--------|-------|------|
| vocab | s1 | vocab |
| vocabQuiz | s2–s3, s5 | listenWord, match, write |
| listen | s6 | listenSent |
| speak | s4 | sentence (+ 歌谣句在 submodule B) |
| readWrite | s7 | readWrite |
| chant/song | s4 | sentence 内 tag「Let's chant」 |
| finalQuiz | s8 | finalQuiz |
