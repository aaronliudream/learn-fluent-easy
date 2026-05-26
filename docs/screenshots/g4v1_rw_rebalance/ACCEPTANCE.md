# readWrite fill_choice 答案分布重平衡 · 分支 `cursor/g4v1-rw-rebalance`

## 问题

readWrite「读写训练」(stage 6) 的 fill_choice 题，正确答案**全部**停在 A 选项。审计实测 9 个 fill_choice 文件、共 54 题，**100% 正确答案在 index 0**，娃「选 A 必对」一眼可破——与 finalQuiz（已在 PR #51 修复）同源问题。

## 方法（沿用 finalQuiz 重平衡思路，新脚本）

readWrite 数据结构与 finalQuiz 不同：选项字段为 `options`，**无独立 `answer` 下标**，正确答案由选项对象自带 `{ "text", "correct": true }` 标记。因此新增独立脚本 `scripts/content/rebalance_readwrite_answers.py`：

- **重排 `options` 数组，`correct:true` 标记随选项对象整体移动**——没有下标要同步。
- **干扰项保持原相对顺序，只有正确项换位**（「只是正确答案位置变」）。
- `sentence` / `correctSentence` / `hint_zh` / 每个选项的 `text` 一律不动。
- **每文件内均衡**：3 选项，目标槽位来自基序列 `[0,1,2,…]`（A/B/C 计数最多差 1），用 `BASE_SEED(42) ^ md5(filename)` 播种的 PRNG 打乱，消除肉眼规律。
- **确定性 + 幂等**：种子只依赖文件名与题数；干扰项保序 + 正确项按同一槽位重插，重复运行输出字节一致（已验证连续两次运行 diff md5 相同）。
- **保留仓库内联选项风格**：自定义序列化把展开的选项对象折叠回 `{ "text": ..., "correct": ... }` 单行，未改动数据时对全部文件**字节级还原**，故 diff 只含被重排的选项行、无噪音。

### 范围

只修 **9 个 fill_choice 文件**：`g4v1_u1`–`g4v1_u4` + `g4v2_u2`–`g4v2_u6` 的 `*_read_write.json`。

跳过（未触碰，git 改动清单已确认）：
- `g4v2_u1_read_write.json` —— picture_choice（2 选项，原本 2A/3B 已接近均衡）
- `g4v2_u1_stage6.json` —— legacy 多 stage 死文件（无扁平 `questions[]`，registry 不加载）

## Before / After 分布（`A | B | C · 单选最高占比`）

| 文件 | BEFORE | AFTER |
|----|----|----|
| g4v1_u1_read_write.json | 6 / 0 / 0 · **100%** | 2 / 2 / 2 · 33% |
| g4v1_u2_read_write.json | 6 / 0 / 0 · **100%** | 2 / 2 / 2 · 33% |
| g4v1_u3_read_write.json | 6 / 0 / 0 · **100%** | 2 / 2 / 2 · 33% |
| g4v1_u4_read_write.json | 6 / 0 / 0 · **100%** | 2 / 2 / 2 · 33% |
| g4v2_u2_read_write.json | 6 / 0 / 0 · **100%** | 2 / 2 / 2 · 33% |
| g4v2_u3_read_write.json | 6 / 0 / 0 · **100%** | 2 / 2 / 2 · 33% |
| g4v2_u4_read_write.json | 6 / 0 / 0 · **100%** | 2 / 2 / 2 · 33% |
| g4v2_u5_read_write.json | 6 / 0 / 0 · **100%** | 2 / 2 / 2 · 33% |
| g4v2_u6_read_write.json | 6 / 0 / 0 · **100%** | 2 / 2 / 2 · 33% |

每文件正确答案均匀分布 A/B/C 各 2 题，最高占比 33%（3 选项理想均匀值）。原始脚本输出见 `rebalance-before-after.txt`。

## 完整性校验

对照 `git HEAD`（重排前）逐题比对 54 道 fill_choice：

- 选项集合不变（option-set mismatches = **0**）
- 正确答案文本不变（correct-text mismatches = **0**）
- `sentence` / `correctSentence` / `hint_zh` 不变（mismatches = **0**）

即题目语义、提示、干扰项内容完全保持，仅正确答案在选项数组中的位置移动。

## 测试

- `registry.test.ts`：**27 通过**（含 readWrite 自动发现 / 各 unit fill_choice 加载断言）。
- 全量 `npm test`：**101 通过 / 10 失败**，失败全在预存在的 `src/i18n/__tests__/slangLocalization.test.tsx`（i18n / jsdom env），与本次改动无关、零新增失败。完整 console 见 `npm-test-full-console.txt`。

## 影响范围

- 只改 9 个 fill_choice `*_read_write.json`（仅 options 顺序）+ 新增脚本与本验收目录。
- 不动组件、注册表、grade4.json、finalQuiz、picture_choice、legacy 文件，不影响已合入 main 的任何 PR。

## 复现命令

```bash
python scripts/content/rebalance_readwrite_answers.py   # 幂等，可重跑
npm test
```
