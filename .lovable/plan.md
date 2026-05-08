## 我从 `public/grammar-lab/subjunctive-mood.html`（9057 行）里读出来的"虚拟语气全攻克"全部要求

下面这份清单就是你要求"读取出来"的内容。我把它当作**所有初中/高中语法点的统一设计规格**，后续每个语法点都必须满足。

### A. 视觉与体感（Look & Feel）
1. **宇宙星空背景**：cosmic-bg + 闪烁星星 + grain 噪点 + mint/amber/rose 三色辉光体系。
2. **三套主题切换**：深色（默认）/ 浅色（白天学习）/ Focus Mode（去掉一切动画与装饰，专注答题）。
3. **字体体系**：Fraunces（display 衬线）+ Inter（正文）+ JetBrains Mono（公式）+ Noto Serif/Sans SC（中文）。
4. **可访问性**：focus-visible 描边、prefers-reduced-motion 兼容、移动端 ≥44px 点击区。

### B. 关卡结构（每个语法点统一含 N 关 + Boss）
每一关都按这 6 个 phase 顺序推进：

```
1. Hook（情境钩子）       —— 一句中文剧情 + 一句英文场景
2. Teacher Lesson（讲台） —— 15-20 行老师独白脚本，每行带：show（板书）、highlight（关键词高亮）、duration（节奏秒数）
3. Foundation（真实 vs 虚拟） —— 对比表格 + Formula 卡（mono 字体公式）+ Contrast 表
4. Reflex Cards（声音反射卡 × 10）—— 中文情境秒答英文，记录反应速度
5. Situation Drill（情境翻译 × 20+）—— 真人化场景：考试/出行/感情/天气/购物/健康…
6. Correction Tasks（改错 × 5）—— 给出错句 + 模型答案 + 正则匹配 + 即时反馈
7. Real Exam（真题 × 5）—— 高考/中考真题，每题带 trap 解释 + why（解析）
```

通关后进入 **Mistake Replay（错题复盘）** 与 **Spaced Review（间隔复习提醒）**。

完成 ≥3 关解锁 **Mixed Practice（三关混练）**；完成全部解锁 **Boss Level（综合真题冲刺）**。

### C. 游戏化与激励
- **12 个成就徽章**（first_reflex / reflex_complete / perfect_lesson / subjunctive_sage 等），每个带 XP 奖励。
- **XP 体系**：reflex_card +5、exam_correct +15、perfect +75、boss +200，按 XP → Level 升级。
- **三种连击**：correctStreak / bestCorrectStreak / dayStreak。
- **Spaced Review 间隔**：完成关后按 REVIEW_INTERVALS（如 1h / 1d / 3d / 7d / 14d）提醒回来复习。
- 与站点统一的 `recordAttempt` / `bumpMastery` / `__rewards` 桥接。

### D. 内容字段（每个语法点必须在 DB 里准备）
为了让模板能跑出"虚拟语气"级别效果，每个 grammar point 需要包含：

| 字段 | 用途 |
|---|---|
| `hookLine` / `hookLineCN` | Hook 阶段 |
| `teacher_script[]`（含 text/show/highlight/duration） | Teacher Lesson |
| `formula` + `contrast_table[]`（lhs/rhs） | Foundation |
| `reflex_cards[]`（中文情境 → 英文反射） | Reflex |
| `situation_drills[]`（situation/cn/en，建议 ≥20） | Drill |
| `correction_tasks[]`（wrong/model/pattern/hint） | Correction |
| `exam_questions[]`（stem/options/answer/trap/why） | Real Exam |
| `mnemonic`（6-8 字口诀） | 通用记忆点 |
| `boss_questions[]`（综合关卡） | Boss |

`teacher_script` / `immersion_cards` / `exam_questions` 数据库已有；其余字段（`reflex_cards` / `situation_drills` / `correction_tasks` / `contrast_table` / `boss_questions` / `hookLine`）**目前还没有**——需要扩字段并由 generate-grammar-content 批量生成。

### E. 当前 `JuniorGrammarLab.tsx` 与规格的差距
- ✅ 有 cosmic 背景、briefing 屏、错题复盘骨架
- ❌ 没有 Hook / Teacher Lesson 节奏脚本播放
- ❌ 没有 Reflex Cards
- ❌ 没有 Situation Drill（中翻英输入题）
- ❌ 没有 Correction Tasks（改错）
- ❌ 没有 Boss 关、Mixed Practice、Spaced Review
- ❌ 成就只有 7 个，没有 XP 体系和等级
- ❌ 没有 Light Mode / Focus Mode 切换

---

## 我建议的执行步骤（请确认要不要这样推进）

### Step 1 — 数据层扩展（一次性）
- migration：在 `junior_grammar_points` 加字段 `hook_line / hook_line_cn / contrast_table / reflex_cards / situation_drills / correction_tasks / boss_questions`（jsonb）。
- 升级 `generate-grammar-content` edge function 的 prompt，让它一次性产出上面所有字段（保持原有 teacher_script / immersion_cards / mnemonic / drill_pool / exam_questions）。
- 在 `/admin/grammar-content` 加"全字段重生成"按钮。

### Step 2 — 模板 6 个 Phase 组件
重写 `JuniorGrammarLab.tsx`，拆成：
- `HookScreen` · `TeacherLessonPlayer`（带 highlight + 节奏）· `FoundationCard`（formula + contrast）· `ReflexDeck` · `SituationDrillInput`（带 pattern 校验）· `CorrectionTask` · `RealExamRunner` · `MistakeReplay` · `BossLevel`
- 全局壳：cosmic + 主题切换 + Focus Mode + XP/Level/Streak HUD + 12 成就。

### Step 3 — 内容批量化（验证）
- 先选 3 个高价值点（一般现在时 / 现在完成时 / 宾语从句）跑全字段生成 → 在 Lab 模板里逐项核对。
- 没问题后批量铺初中全部语法点；高中同模板复用。

### Step 4 — 入口与替换
- `/junior/grammar/:id` 默认跳转到新 Lab；保留旧 `/junior/grammar-point/:id` 作为"清单视图"。
- `/grammar-lab/subjunctive` 保留为原始手工版的特例（这一关已经超规格）。

---

## 需要你拍板

1. **范围**：是否同意先做初中（再复用到高中），且按上面 4 步走？
2. **字段生成成本**：全量字段会让单点 token 涨 3-4 倍，初中 ~25 个点估 ¥0.5–1，可接受？
3. **改错题型**：subjunctive 是用正则严格匹配；通用模板里我打算再给一个"AI 宽松判分"兜底（用 Lovable AI），可以吗？
4. **是否保留旧 Lab**：现在的 `JuniorGrammarLab.tsx` 我会**完全重写**（不是增量），确认 OK？

回复"按此推进"或者指出要调整的点，我就开 Step 1。