## 范围
为「高考阅读 / 初中阅读」补全两个被遗漏的步骤，并加上贯穿全程的步骤导航：

```
①准备  →  ②测试  →  ③诊断  →  ④对话
```

底部 sticky 步骤胶囊导航（参考截图样式）一直可见，已完成步骤可回跳。

## ③ 诊断（保留现有内容 + 新增 3 个模块）
保留现有的：全球标准诊断 / 题型诊断 / 题目速览。
**新增**：
1. **考点掌握诊断表**：题号 · 原子考点（题型映射）· 结果 ✓/✗ · 陷阱类型（推理过度 / 偷换概念 / 过度归纳 / 字面理解…）· 该考点累计掌握度（基于 user_question_attempts 历史聚合）
2. **错题入库提示卡**：「这道错题已加入错题本，将在 1/3/7/14 天后安排复习」+ "和 AI 详谈这道题" 按钮（直接跳到 ④ 并预填问题）
3. **为你推荐的下一步（3 卡）**：薄弱点强化 / 真题对照 / 微课补漏，由 AI 基于本次答题结果生成（结构化输出）

## ④ 对话（核心新增，必须真正可用）
苏格拉底式 AI 辅导「译老师」：
- 全屏聊天 UI（试卷主题），消息按 `parts` 渲染，markdown 支持
- 系统提示包含**当前文章全文 + 题目 + 用户答案 + 正确答案 + 解析**，AI 才能真正回答"我为什么不该选 C"
- Socratic 模式：不直接给答案，先反问引导学生回到原文
- 多轮对话状态保存到 `localStorage`（按 article_id 分会话），刷新不丢
- 支持快捷追问 chips：「再问一题」「换中文解释」「举个类似题」
- 走 Edge Function `reading-tutor`（Lovable AI Gateway，`google/gemini-3-flash-preview`）

## 技术细节
- 新建 `src/components/exam/ExamStepper.tsx` — 4 步胶囊导航，受控
- 新建 `src/components/exam/DiagnosisTable.tsx` — 考点掌握表 + 累计掌握度（查 `user_question_attempts`）
- 新建 `src/components/exam/NextStepCards.tsx` — 推荐 3 卡（AI 结构化输出 + fallback 模板）
- 新建 `src/components/exam/ReadingTutorChat.tsx` — Socratic 聊天（useState 多轮 + localStorage 持久化）
- 新建 `supabase/functions/reading-tutor/index.ts` — `streamText` + 文章上下文系统提示
- 改 `GaokaoReadingArticle.tsx`：stage 增加 `"diagnosis"` 与 `"dialogue"`，原 results 内容并入 diagnosis；ExamStepper 常驻底部
- 改 `JuniorReadingPlay.tsx`：同样接入 ExamStepper + Diagnosis + Dialogue（初中版本简化考点表）
- 试卷主题 token 已存在，直接复用 `--exam-paper / --exam-cinnabar / --exam-gold`

## 不动的部分
- 准备/测试两步的逻辑、计时、计分、错题写入数据库 — 全部保留
- 试卷美学（米纸+朱红+金）继续用，仅扩展到诊断/对话

## 验收
- 4 步导航在所有阶段可见且可点
- ③ 的考点表显示真实历史掌握度
- ④ 提问"第 23 题为什么不选 C" → AI 回到原文反问，不直接给答案
- 刷新对话页面，历史不丢
- 移动端单列、桌面端两栏正常