# 把"语法点罗列 + 做几道题"全面升级为 Lab + AI 个性化教学 + 关卡解锁

## 目标
- **唯一入口**：每个语法点只通过 9 阶段 Lab 学习（不再看到旧的知识点罗列页）。
- **AI 在每个错误处出现**：错一道题立刻调用 AI，按学生年级（初一/初二/初三/高一/高二/高三）出"看得懂"的解释。
- **关卡解锁**：Boss 关 100% 全对才解锁下一个语法点；错了必须重做。
- **培养语感 + 提分**：通过 hook → 老师讲堂 → 公式 → 反射卡 → 情境翻译 → 改错 → 真题 → Boss 8 个阶段，把"理解 → 反射 → 输出 → 应试"打穿。

## 现状盘点
- ✅ 9 阶段 Lab UI 已存在：`/junior/grammar-lab/:pointId`
- ✅ 内容生成 edge function：`generate-grammar-content`（已用 Gemini 2.5 Pro）
- ✅ 已生成 23/52 个初中语法点的 Lab 内容
- ❌ 剩余 29 个初中点 + 全部高中点未生成（上次跑到一半 402 余额耗尽）
- ❌ 旧的"知识点列表 + 选择题"页仍是初中/高中入口默认
- ❌ Boss 关错题没有 AI 解释，也不强制 100% 通关
- ❌ 没有 per-user per-point 通关记录 → 没法做"解锁下一关"

## 改造步骤

### Step 1 · 把内容补齐（等额度恢复后我跑脚本）
- 续跑 `gen_lab.py` 把剩余 29 个初中点写满
- 把高中表 `gaokao_grammar_points` 加上同样的 9 个字段（迁移），跑同一脚本生成 ~40 个高中语法点

### Step 2 · 关卡解锁机制（数据库 + UI）
新表 `grammar_lab_progress`：
```
user_id, point_id, level (junior|gaokao),
boss_passed (bool), best_score, attempts, completed_at
```
- 进入 Lab 时读取该用户已通关点 → 在语法列表里"未通关的下一个"高亮、其它锁住
- Boss 阶段必须 5/5 全对才标记 `boss_passed = true`
- 通关后解锁下一个 + 弹"下一关：xxx"按钮直接跳转

### Step 3 · AI 个性化错题讲解（新 edge function）
新建 `explain-wrong-answer`：
- 入参：`question`、`userAnswer`、`correctAnswer`、`pointTitle`、`gradeLabel`（如"初二"）
- 模型：`google/gemini-2.5-flash`（便宜快）
- 输出：3 段
  1. **你哪里错了**（用学生母语类比，≤2 句）
  2. **为什么正确答案对**（指出关键语法触发点）
  3. **一句口诀帮你记住**（≤15 字）
- 在 Boss 阶段、改错阶段、真题阶段错题时实时调用 + 流式显示

### Step 4 · 改造入口（隐藏旧路径）
- `/junior/grammar` 列表改为：每张卡片显示 🔒/✅/▶️ 状态，点击只去 Lab，不再有"做几道题"模式
- `/gaokao/grammar`（如有）同样处理
- 旧 `JuniorGrammarPoint` 这类纯刷题页保留为只读归档（避免数据丢失），但首页/导航不再链入

### Step 5 · 语感强化收尾（用 AI 做的小亮点）
- 每个语法点结束时，AI 根据用户在该点的错误模式生成一段 100 字"个人化复盘"
- 错题进 SRS 复习队列，第 1/3/7 天自动出现在首页"今日必练"

## 技术清单（一次写清，便于估工）
- 1 个新表 `grammar_lab_progress` + RLS
- 1 个迁移给 `gaokao_grammar_points` 加 9 个字段
- 1 个新 edge function `explain-wrong-answer`
- 1 个新 edge function 或复用：`grammar-lesson-recap`（个人化复盘，可后期）
- `JuniorGrammarLab.tsx` 改造 Boss 阶段：错题 → 调用 AI 解释 + 不通过禁止前进
- `Junior.tsx` / `JuniorGrammar.tsx` 列表页改为"关卡地图"样式
- 跑批量脚本补齐内容（需要先充 AI 余额）

## 建议执行顺序
1. **现在就做**：Step 2（解锁表）+ Step 3（AI 错题解释 edge function）+ Boss 强制 100% 改造 → 体验立刻升级
2. **额度恢复后**：Step 1 续跑生成全部内容
3. **下一轮**：Step 4（隐藏旧入口）+ Step 5（语感复盘 + SRS）

## 需要你确认的 1 件事
"必须 100% 全对才能解锁下一关" — 我建议 Boss 5 道题里：
- 全对 → 通关 + 解锁下一点
- 错任何一道 → AI 出讲解 + 当场重做错题，全部改对后也算通关（不必从头再来 5 道）

这样既严格又不打击信心。OK 的话我就按这个执行 Step 2/3。
