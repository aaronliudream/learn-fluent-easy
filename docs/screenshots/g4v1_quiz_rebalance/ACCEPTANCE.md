# 四年级 finalQuiz 答案分布重平衡 · 分支 `cursor/g4v1-quiz-answer-distribution`

## 问题

四年级 12 个 unit 的 finalQuiz 正确答案长期堆在 A 选项，娃做几题就能摸到「选 A」的规律靠瞎猜得分，失去考核意义。审计实测：U4 = 100% A，U3 = 80% A，U1/U2 = 70% A，v2 多数单元 75%–83% 集中在单一选项，且 **D 选项全表仅出现 5 次**。

## 方法（方案 A + 确定性均衡）

新增脚本 `scripts/content/rebalance_quiz_answers.py`，对 `grade4.json` 全部 12 unit 的 `quizQuestions` 做确定性重排：

- **只动 `opts` 顺序 + 同步 `answer` 下标**。题干 `q`、每个选项文本、考点 `point`、维度 `dim`、题号 `id` 一律不动。
- **干扰项保持原相对顺序，只有正确项换位**（「只是正确答案位置变」）——把正确选项从原位置抽出，按目标槽位重新插入，三个干扰项相对次序不变。
- **每个 unit 内部均衡**：目标槽位来自基序列 `[0,1,2,3,…]`（保证 A/B/C/D 计数最多相差 1），再用「`BASE_SEED(42) ^ md5(unit.id)`」播种的 PRNG 打乱，避免出现 A,B,C,D,A,B… 的肉眼可见规律。
- **确定性 + 幂等**：种子只依赖 `unit.id` 与题数、不依赖当前数据顺序；干扰项保序 + 正确项按同一种子槽位重插，因此重复运行输出完全一致（已验证两次运行 md5 相同）。可安全重跑。

> 范围：v1 六个 + v2 六个，共 **12 unit / 140 题**，一次修干净。readWrite / listening 的答案字段**不在本次范围**，未触碰。

## Before / After 分布

格式：`A | B | C | D | 总题数 | 单选最高占比`

| unit | BEFORE | AFTER |
|----|----|----|
| g4v1_u1 | 7 / 2 / 1 / 0 · **70%** | 3 / 3 / 2 / 2 · 30% |
| g4v1_u2 | 7 / 3 / 0 / 0 · **70%** | 3 / 3 / 2 / 2 · 30% |
| g4v1_u3 | 8 / 2 / 0 / 0 · **80%** | 3 / 3 / 2 / 2 · 30% |
| g4v1_u4 | 10 / 0 / 0 / 0 · **100%** | 3 / 3 / 2 / 2 · 30% |
| g4v1_u5 | 6 / 3 / 2 / 2 · 46% | 4 / 3 / 3 / 3 · 31% |
| g4v1_u6 | 3 / 5 / 4 / 0 · 42% | 3 / 3 / 3 / 3 · 25% |
| g4v2_u1 | 1 / 9 / 5 / 0 · **60%** | 4 / 4 / 4 / 3 · 27% |
| g4v2_u2 | 9 / 1 / 2 / 0 · **75%** | 3 / 3 / 3 / 3 · 25% |
| g4v2_u3 | 4 / 6 / 2 / 0 · **50%** | 3 / 3 / 3 / 3 · 25% |
| g4v2_u4 | 10 / 2 / 0 / 0 · **83%** | 3 / 3 / 3 / 3 · 25% |
| g4v2_u5 | 10 / 0 / 0 / 2 · **83%** | 3 / 3 / 3 / 3 · 25% |
| g4v2_u6 | 10 / 0 / 1 / 1 · **83%** | 3 / 3 / 3 / 3 · 25% |

修复后每个 unit 单选最高占比 ≤ 31%（理想均匀为 25%–33%），「选 A 必对」的规律消除。原始脚本输出见 `rebalance-before-after.txt`。

## 完整性校验

对照 `git HEAD`（重排前）逐题比对 140 题：

- 选项集合不变（option-set mismatches = **0**）
- 正确答案文本不变（correct-text mismatches = **0**）
- 题干 / 考点 / 维度 / 题号不变（meta mismatches = **0**）

即题目语义、干扰项内容完全保持，仅正确答案位置移动。

## 测试

- `registry.test.ts`：**27 通过**。
- 全量 `npm test`：**101 通过 / 10 失败**，失败全在预存在的 `src/i18n/__tests__/slangLocalization.test.tsx`（i18n / jsdom env），与本次改动无关、零新增失败。完整 console 见 `npm-test-full-console.txt`。

## 影响范围

- 只改 `src/data/primaryHub/grade4.json`（quizQuestions 的 opts/answer）+ 新增脚本与本验收目录。
- 不动任何组件、注册表、readWrite/listening 数据，不影响 U1–U4 已合入 main 的 PR。

## 复现命令

```bash
python scripts/content/rebalance_quiz_answers.py   # 幂等，可重跑
npm test
```
