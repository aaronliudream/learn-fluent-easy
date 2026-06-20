# 初中语法系统重构 · 方案B 实施方案(待 Aaron 审,未动手)

## 总原则
- **复用现有表**:`junior_grammar_points` / `junior_grammar_questions` / `junior_user_mastery`,不建大新表,只加必要字段。
- **旧 4746 题不删**:靠"语法点的 unit 字段为空"自动从单元视图隐藏(资产保留)。
- **一套题两处显示**:hub 第4关 GrammarStage + 语法页,共用同一份"按 unit 取题 + 记掌握度"模块。
- 优先复用现有"单元语法综合测试"链路(`juniorUnitGrammar.ts` 已具备按 unit 取题能力)。

---

## A. 题进 DB

**用现有 `junior_grammar_questions`,不建新表。** 每题:`stem` / `option_a~d` / `correct_answer`(A-D)/ `explanation` / `question_type='mcq'` / `point_id`。

**每考点 = 一个新 `junior_grammar_points`(不复用旧 g7-t0x)。** 原因:
- 旧点(如 g7-t04 be动词)是跨单元共用 + 带 185 道旧题,复用会①一点对多单元冲突 ②旧题混进新单元。
- 新建 Starter 专属点(code 如 `g7su1.be`/`g7su1.wh`…),只挂这 102 道新题,干净隔离。

**unit 归属存哪**(现 points/questions 都没 unit 字段):
- **加在 point 上**:`ALTER TABLE junior_grammar_points ADD COLUMN volume text, ADD COLUMN unit text;`(nullable)。
- Starter 新点:`volume='7A'`、`unit='SU1'/'SU2'/'SU3'`;旧点保持 `NULL`。
- 题通过 `point_id` 继承 unit,**questions 表不用加 unit**。

**进库管道**:Aaron 给 102 题 JSON,我写 `scripts/gen-grammar-insert.mjs` 生成"建点 + 插题"幂等 SQL,Aaron 跑。JSON schema(每题):
```json
{ "unit": "SU1", "point": "be动词肯定句+自我介绍", "category": "tense",
  "stem": "I ___ a student.", "options": ["am","is","are","be"], "answer": 0,
  "explanation": "I → am。" }
```
(同一 `unit+point` 的题自动归到同一个新语法点;`answer` 是正确选项下标 0-3 → 转 A-D。)

---

## B. 掌握度(复用,不新建)

**复用 `junior_user_mastery`**(它本就是语法掌握存储)。新增一种行:`item_type='grammar_question'`、`item_id=question_id`。
- 该表已有 `correct_count`/`wrong_count`/`attempts` + `UNIQUE(user_id,item_type,item_id)`,正好支持"用户×题"计数。
- **"答对 2 次算掌握该题"**:`correct_count >= 2` → 掌握。⚠️**待你确认**:你写的是"累计 2 次",但词汇口径其实是"**连对** 2 次"。要完全跟词汇统一,我就改成连对(在 `mastery_matrix.streak` 记连对数,答错清零);否则按"累计"。默认先按你写的累计。

**两个指标**(point 级 + unit 级都显示):
- **完成度** = 范围内 `attempts>0` 的题数 / 总题数
- **掌握度** = 范围内 `correct_count>=2`(或连对2)的题数 / 总题数
- point 级 = 该 point 所有题聚合;unit 级 = 该 unit 所有题聚合。

**记录**:答题时客户端 upsert `junior_user_mastery` 的 grammar_question 行(复用现成 RLS,跟 `recordJuniorGrammarAttempt` 同款写法)。新增 `recordGrammarQuestionMastery(questionId, isCorrect)`。
- 现有 per-point FSRS 记录(`recordJuniorGrammarAttempt`)**保留并行跑**(供错题 Revenge/到期复习),不影响新指标。

**技能系统(junior_skills / question_skill_map / record_skill_attempt)能接吗?**
- 它是**按技能**粒度(一题→≥1 技能,record_skill_attempt 更新 user_skill_mastery)。**不符合"按题答对2次"**这个粒度。
- 结论:**不作为本功能掌握度来源**。如某题挂了 skill 可并行记(可选),本期**不给 102 题建 skill map**。本功能"完成/掌握度"统一走 per-question(junior_user_mastery)。

---

## C. 两处同步(第4关 ↔ 语法页 读同一套)

**现状**:
- hub 第4关 `GrammarStage`:按 `unit.grammarCodes[]` → `/junior/unit-grammar/{grade}/{unitId}` 综合测试(`juniorUnitGrammar.ts`,已复用 points/questions/junior_user_mastery)。
- 语法页 `JuniorGrammar.tsx`:按 category 展示 → 点进单点 mastery 页。

**统一做法**:扩展 `juniorUnitGrammar.ts` 为共享"unit 语法 runner"——按 unit 取题 + 答题记 **per-question 掌握** + 算完成/掌握度。
- Starter 单元:在 `grade7.json` 给 U1/U2/U3 填 `grammarCodes=[新Starter点codes]` → 第4关**自动**走综合测试读 DB(无需大改 GrammarStage)。
- 语法页 L3 做题也调这个 runner。
- → 两处读同表、同题、同掌握度,**自动同步**。

---

## D. 语法页三层重构(JuniorGrammar.tsx)

从"category 分组" → **三层**:
- **L1 单元列表**:`distinct(volume,unit) where unit IS NOT NULL`,按课本序(Starter U1/U2/U3 →…);显示 unit 级 完成/掌握度。
- **L2 单元内语法点**:该 unit 的 points;每点显示 point 级 完成/掌握度。
- **L3 点 → 做题**:调共享 unit/point runner。

**旧题隐藏**:L1/L2 只查 `unit IS NOT NULL` 的 points → 旧 4746(unit=NULL)不显示。旧 category 浏览页可下线或留 admin。

---

## E. 改动量 + 分步(建议先 Starter 验证链路)

**Step 1(验证链路 · Starter ×3)**
- **SQL(Aaron 跑)**:① `ALTER` 加 `volume`/`unit` 两列;② 建 Starter 新语法点;③ 插 102 题。(②③由我生成幂等 SQL。)
- **前端(我改)**:
  1. 新 `recordGrammarQuestionMastery` + 读取 per-question 掌握的 lib;
  2. 扩展 `juniorUnitGrammar.ts` 支持 per-question 记录 + 完成/掌握度计算;
  3. `grade7.json` 给 Starter U1/U2/U3 填 `grammarCodes`(指向新点);
  4. `JuniorGrammar.tsx` 改三层(先只显示 Starter);
  5. 完成度/掌握度显示(point + unit 两级)。

**Step 2(扩展到 7/8 全单元)**:给其余 points 补 `volume`/`unit`(用之前的 `unit_grammar_xref_review.md` 映射 + 处理孤儿点),语法页自然显示全部单元;hub 本就按 unit,无需大改。

**Step 3(9 年级)**:库里 g9 几乎空 + 无 grade9.json,待内容补齐再做。

**工作量**:中。Step 1 是核心验证 = 前端约 5 处改动 + 1 批 SQL。Step 2 主要是数据归类(SQL/映射),前端基本复用 Step 1。

---

## 待你拍板/提供
1. **102 题文件**:给我(JSON 或我转你格式),我建 `gen-grammar-insert.mjs` 出 SQL。确认 schema(上方 A 节)。
2. **掌握口径**:"累计答对2次" vs "连对2次(与词汇完全统一)"——选哪个?
3. **Starter 考点 = 新点**(不复用旧 g7-t0x)这个隔离策略,认可?
4. 旧 category 浏览页:**下线** 还是 **留 admin 可见**?
