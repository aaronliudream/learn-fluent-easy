# Stage 3 训练模式铺开 PR-1（Tier 1，7 单元）ACCEPTANCE · 分支 `cursor/stage3-rollout-tier1`

## 改了什么

把 7 个已有 grammar.json 的单元 Stage 3 从「展示朗读」改成「训练三选一」（沿用 U1 PR #58 的 training 字段）。纯数据改动 + 2 处数据瑕疵修复 + 迁移钩子扩展 + 测试断言。

| 文件 | 动作 |
|---|---|
| `sentence/g4v1_u2_grammar.json` | 5 句 training + 2 句 skip_chant |
| `sentence/g4v2_u1_grammar.json` | 6 句 training（无歌谣，0 skip） |
| `sentence/g4v2_u2_grammar.json` | 6 句 training + 2 skip |
| `sentence/g4v2_u3_grammar.json` | 6 句 training + 2 skip + **修 A/B tag 互串** |
| `sentence/g4v2_u4_grammar.json` | 6 句 training + 2 skip |
| `sentence/g4v2_u5_grammar.json` | 6 句 training + 3 skip |
| `sentence/g4v2_u6_grammar.json` | 8 句 training + 2 skip + **修 B4 dollars→yuan** |
| `src/lib/primaryHub/storage.ts` | 迁移钩子加 **新 flag** `STAGE3_V2_PR1_MIGRATION_KEY`，重置 8 单元（u1 + 7） |
| `src/lib/primaryHub/registry.test.ts` | +14 条断言（7 单元 × 2） |

**不动**：grade4.json、g4v1_u1_grammar.json（已合）、g4v1_u3/u4/u5/u6（无 grammar.json，属 PR-2）、SentenceLessonStage.tsx / sentenceTypes.ts / PrimaryHubStagePlay.tsx（组件/类型已就绪）。git diff 已核验仅上述 9 文件变化。

## 题数与答案位置（实测）

training 题每题 3 选项（A/B/C，无 D），correct 位置打散：

| Unit | training | skip_chant | A/B/C correct 分布 | 单选最高占比 |
|---|---|---|---|---|
| g4v1_u2 | 5 | 2 | 2 / 1 / 2 | 40% |
| g4v2_u1 | 6 | 0 | 1 / 3 / 2 | 50% |
| g4v2_u2 | 6 | 2 | 1 / 3 / 2 | 50% |
| g4v2_u3 | 6 | 2 | 1 / 2 / 3 | 50% |
| g4v2_u4 | 6 | 2 | 2 / 2 / 2 | 33% |
| g4v2_u5 | 6 | 3 | 1 / 3 / 2 | 50% |
| g4v2_u6 | 8 | 2 | 3 / 3 / 2 | 38% |
| **合计** | **43** | **13** | — | 无单元集中在单一位置 |

各单元满分（每题 10）：u2=50、v2_u1/u2/u3/u4/u5=60、v2_u6=80（题数自然差异，不强求统一，pick 视图按各自进度显示）。

## 验收清单

- [x] 7 个 grammar.json 都加了 training；非歌谣句全部 3 选项 + 恰好 1 correct + 有 explanationZh（脚本校验 0 issues）
- [x] 歌谣（Let's chant）统一 skip_chant 走原朗读；skip 数 2/0/2/2/2/3/2 = 13，符合规划 §2.1
- [x] correct 位置打散，无单元集中在单一位置（最高 50%，且都是 3 选项下的 3/6）
- [x] **数据瑕疵修复**：g4v2_u3 A 模块 3 句 tag `B Let's talk→A Let's talk`、B1/B2 `A Let's talk→B Let's talk`；g4v2_u6 B4 `eighty-nine dollars/八十九美元 → eighty-nine yuan/八十九元`
- [x] 迁移钩子用**新 flag** `STAGE3_V2_PR1_MIGRATION_KEY`（独立于 U1 的 flag），重置列表含 u1 + 7（重复清 u1 无害）；stars 不清
- [x] `toHaveLength(8)`、`subModules.toHaveLength(2)`、g4v2_u1 `lockedUntil==="A"` 断言**未动**
- [x] 测试基线 **119 通过**（原 105 + 新 14）/ 10 个 yak-shaving i18n 失败不变（零新增）；registry 45 tests；tsc 通过
- [x] 7 张截图（每单元 1 张，子模块 A 训练界面）

## 截图（docs/screenshots/stage3_rollout_tier1/）

`g4v1_u2_stage3.png` / `g4v2_u1_stage3.png` / `g4v2_u2_stage3.png` / `g4v2_u3_stage3.png` / `g4v2_u4_stage3.png` / `g4v2_u5_stage3.png` / `g4v2_u6_stage3.png` —— 每单元子模块 A 的训练界面（promptZh + 🔊 + 3 选项）。定位数据见 `capture-console.txt`（7 单元 openedA=true）。

## ⚠️ 实现说明 / 与规划文档的偏差（请审）

1. **选项文本统一用英语**：§2 表格里有些干扰项只给了中文（如 g4v1_u2 B1「你想喝水吗?」）。我按同义译成英语（"Do you want some water?"）。正确答案严格用表格/对话原句，干扰项含义不变。
2. **两道「听句选含义/场景」题保留中文选项**：g4v2_u1 A3（"OK. Thanks." 用在什么场景）、g4v2_u2 A3（"It's time for breakfast." 是什么意思）——表格本就设计成中文理解选项（选场景/选含义，不是选英语句），故保留中文。
3. **g4v2_u6 B5 题型修正**：§2.2.7 表里 B5 写的 `listening_received_pity` 不是合法 training type（合法 5 种：listening_response / fill_word / sentence_choice / structure_transfer / skip_chant），按语义改为 `listening_response`。
4. **correct 位置去集中（§4.4 授权）**：规划标注的集中单元已按「只换 options 顺序、不改 correct 标记」调整——g4v2_u2 把 B3 correct 挪到 C；g4v2_u4 把 A2/B2 correct 挪到 A（达 2/2/2）；g4v2_u6 把 A1/A2/B3 重排（达 3/3/2）。其余单元用表格原位置。
5. **explanationZh 为本人按 §4.3 规范撰写**（表格只给了 1 条示例）：每题 15-40 字中文，解释为什么对/常见错法。

## 回滚

`git revert <PR-1-commit>`：7 个 grammar.json 回到无 training（SentenceLessonStage 自动走朗读分支）、storage.ts/registry.test 还原。迁移 flag 已写不还原，但旧进度已清，娃重做一遍朗读——可接受代价。

## 复现

```bash
npm test            # 119 通过 / 10 预存在 i18n 失败
npm run dev         # localhost:8080，访问各 unit 的 /stage/3
```
