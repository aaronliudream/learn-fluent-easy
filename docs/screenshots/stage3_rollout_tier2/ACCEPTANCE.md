# Stage 3 训练模式铺开 PR-2（Tier 2，4 单元新建）ACCEPTANCE · 分支 `cursor/stage3-rollout-tier2`

## 改了什么

为 4 个**没有 grammar.json**的单元（g4v1_u3/u4/u5/u6）**新建** Stage 3 训练 grammar.json，让它们从旧 `SentenceStage`（dialogues 朗读 fallback）切换到 `SentenceLessonStage` 训练模式。至此 12/12 四年级单元 Stage 3 全部训练化。

| 文件 | 动作 |
|---|---|
| `sentence/g4v1_u3_grammar.json` | **新建** 8 句（A4+B4） |
| `sentence/g4v1_u4_grammar.json` | **新建** 9 句（A5+B4） |
| `sentence/g4v1_u5_grammar.json` | **新建** 8 句（A4+B4） |
| `sentence/g4v1_u6_grammar.json` | **新建** 10 句（A5+B5） |
| `src/lib/primaryHub/registry.test.ts` | `toHaveLength(8)→12` + tier2 参数化 block（4 unit × 4 断言 = +16） |
| `src/lib/primaryHub/storage.ts` | 新增 `STAGE3_V2_PR2_MIGRATION_KEY` + `STAGE3_V2_PR2_UNITS` + Wave 2 迁移 |

**不动**：grade4.json、PR-1 的 7 个 grammar.json、g4v1_u1 grammar、组件/类型层。

## 每单元落地（35 句训练题，4 种 type 全到位，skip_chant = 0）

| Unit | 标题 | 句数 | A/B | 题型分布 (list/sent/fill/stru) | correct 位置 (A卡 / B卡) | vocab 覆盖 |
|---|---|---|---|---|---|---|
| g4v1_u3 | My friends | 8 | A4+B4 | 3/2/1/2 | A=C/B/A/C · B=B/C/B/C | 8/8 |
| g4v1_u4 | My home | 9 | A5+B4 | 3/2/2/2 | A=2/1/2 · B=1/2/1 | 10/10 |
| g4v1_u5 | Dinner's ready | 8 | A4+B4 | 3/2/1/2 | A=2/1/1 · B=1/2/1 | 10/10 |
| g4v1_u6 | Meet my family! | 10 | A5+B5 | 3/3/2/2 | A=2/2/1 · B=1/2/2 | 10/10 |

每题 3 英语选项、1 correct + 2 干扰、explanationZh 15-40 字；每卡 3 个 correct 位置都出现且单位置 ≤2（无集中）。

## A/B 主题重组决策

- **u5**：dialogue B① `What would you like?` 重组到 A 卡（A=点餐 / B=餐具），tag 保 `B Let's talk` 真实出处。
- **u6**：dialogue B① `Is this your uncle?` 重组到 A 卡（A=家人称谓 / B=职业），tag 保 `B Let's talk`。
- u3/u4：保持 dialogue 原 A/B 归属。

## 测试 / 迁移

- `registry.test.ts`：`__getSentenceLessonsForTest().toHaveLength(8) → 12`；tier2 参数化 block 给 4 unit 各加 4 条断言（loads/lessonId · 2-submodule 结构 A→locked B · 非 skip 句全合格 · skip_chant=0）= **+16**。
- 迁移：新 flag `STAGE3_V2_PR2_MIGRATION_KEY` + Wave 2 重置 g4v1_u3/u4/u5/u6 的 Stage 3 进度（sentenceCompleted/sentenceFirstCorrect/completedStages[3]/stageProgress[3]），**stars 不清**；独立于 U1（Wave 0）和 PR-1（Wave 1）的 flag。

## 验收清单
- [x] 4 个 grammar.json 新建，JSON 合法、tsc 通过
- [x] 每单元 4 种 type 全到位、单 type ≤3、skip_chant=0、correct 位置 3 位都有 max 2
- [x] vocab 覆盖：u3 8/8，u4/u5/u6 各 10/10
- [x] `registry.test.ts` 8→12 + 16 断言；`subModules.toHaveLength(2)` / g4v2_u1 lockedUntil 等既有断言未动
- [x] storage.ts Wave 2 迁移，新 flag，stars 不清
- [x] 测试基线 **135 通过**（PR-1 后 119 + 16）/ 10 个 yak-shaving i18n 失败不变（零新增）；registry **61 tests**
- [x] grade4.json / PR-1 grammar / u1 grammar / 组件层 未动
- [x] 4 张截图（每单元子模块 A 训练界面）

## 截图（docs/screenshots/stage3_rollout_tier2/）
`g4v1_u3_stage3.png` / `g4v1_u4_stage3.png` / `g4v1_u5_stage3.png` / `g4v1_u6_stage3.png`（定位见 `capture-console.txt`，4 单元 openedA=true）。

## ⚠️ 偏差 / 决策说明（请审）

1. **规划 §3.2「u4/u5 句数够=不需补句」被证伪并修正**：三个单元 dialogue 实测都只有 3-4 个 Q/A 对、远不够 8 句、且漏多个 vocab。逐个 cat 实测后由产品负责人拍板补句——u3 补 5（B 卡薄）、u4 补 5、u5 补 4、u6 补 7（最薄）。每条补句都源自本单元 vocab / listeningQuestions / 核心句型，有上下文。
2. **u5/u6 做了 A/B 主题重组**（见上），dialogue B① 挪到 A 卡，tag 保真实出处。
3. **u3 题型/位置为产品负责人指定表**；u4/u5/u6 在产品负责人给的硬约束内由我自然挑（已逐单元自查）。u5 指令头部「3/2/2/2」口误（和=9），按逐句列 3/2/1/2（和=8）执行——已确认。
4. **u6 一次性 commit**（grammar + 测试 + 迁移 + 截图 + 本文档），未像 u3/u4/u5 那样单独 commit 后再 review，按本步指令合并为 PR-2 收尾的单一 commit。
5. registry tier2 block 每 unit 4 条断言（共 +16，达 135/61），与规划「2+1」描述的字面数略有出入但更完整且命中规划的目标数字。

## 回滚
`git revert <PR-2-commit>`：删 4 个新 grammar.json（u3/u4/u5/u6 回到 dialogues 朗读 fallback）、registry/storage 还原。迁移 flag 已写不还原，旧进度已清，娃重做。
