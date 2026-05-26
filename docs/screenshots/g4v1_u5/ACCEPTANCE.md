# g4v1 U5（Dinner's ready）内容验收包 · 分支 `cursor/g4v1-u5-content`

## 改了什么

新增 g4v1_u5「Dinner's ready / 晚餐准备好了」整单元内容（课本 p.46-55，8 关），注入 grade4.json，并跑过两个答案分布重平衡脚本。

| 文件 | 动作 | 说明 |
|----|-----|-----|
| `scripts/content/g4v1_u5_unit.json` | 新增 | U5 完整源：8 关、10 词 vocab（食物 5 + 餐具 5，含音标）、2 vocabGroups、10 quiz（501-511 跳 506）、3 listening |
| `scripts/content/patch_g4v1_u5.py` | 新增 | 整块注入 grade4.json 的 g4v1_u5 桩（克隆 u4 patch） |
| `src/data/primaryHub/grade4.json` | 修改 | g4v1_u5 桩 → 完整 unit（仅此 unit 变化，U1-U4 经幂等重平衡保持字节不变） |
| `src/data/primaryHub/readWrite/g4v1_u5_read_write.json` | 新增 | 6 题 fill_choice（点餐 / 价格 / 餐具搭配） |
| `src/lib/primaryHub/registry.test.ts` | 修改 | readWrite 配置计数 10→11 + 新增 g4v1_u5 stage 6 加载断言 |

### vocab Tab 词集（严格对齐课本黑体）

10 词 = 食物 5（beef / chicken / noodles / soup / **vegetable**）+ 餐具 5（chopsticks / bowl / fork / knife / spoon），每词带 IPA 音标 + 中文。

- `vegetable` **收单数**，对齐课本 p.49 黑体词汇表（"vocab Tab = 课本黑体" 契约不破）。复数 `vegetables` 只出现在 finalQuiz 词义题 501-505 的 505 选项里（菜单常写复数），不进 vocab Tab。
- 功能/白体词 `yuan` / `please` / `ready` 不进 vocab Tab，只在 readWrite / 句型中出现（沿用 U1-U4 先例）。

### finalQuiz 题号与三锚

题号 **501-511，跳过 506**（沿用 U3 跳 306、U4 跳 406 的百位段规则）→ 屏上 **10 题**。

| 锚 | 题号 | 角色 |
|----|-----|-----|
| `u5:recall_polite_request`（主，新增） | 507 / 508 / 509 | What would you like? / Would you like…? → Yes,please/No,thanks / Pass me the… |
| `u5:vocab`（本单元词汇基础） | 501-505 | 食物 5 词中译英（505 用复数 vegetables 贴课文） |
| `u1:recall_position`（复习，U4 既有锚） | 510 | Where's the bowl? → It's on the table. |
| `u3:recall_personality`（复习，U3 既有锚） | 511 | 描述饭桌边又高又壮的男孩 |

### readWrite（6 题 fill_choice，p.53 Read and write 风格）

I'd like some ___（beef）/ 价格 ___（yuan）/ What would you ___（like）/ Would you like some soup? ___（Yes）/ 吃 noodles 用 ___（chopsticks）/ 喝 soup 用 ___（spoon）。

## 与指令包的 3 处实现纠偏（请审）

1. **无 anchors 注册表**：代码里 `point` 是 quizQuestion 上的自由字符串（badge 显示 + 错题归类），U3/U4 从无独立"锚注册表"。所以 `u5:recall_polite_request` 无需在任何注册表"建"——写进 `point` 即生效，与 u3/u4 一致。
2. **文件名/路径用既有约定**：`scripts/content/g4v1_u5_unit.json`（非 `patches/`）、`src/data/primaryHub/readWrite/g4v1_u5_read_write.json`（下划线，非 `g4v1_u5_readwrite.json`）——registry 与 rebalance 脚本都靠这命名匹配，否则发现不到、跑不通。
3. **复习锚为 1+1（非草稿的 ≥2 each）**：`point` 是单字符串，一题只能挂一个锚。在 10 个题位里保住「主锚 polite_request 题量最多（3 题）+ 食物 5 词覆盖」后，剩 2 题分给两个复习锚各 1 题。这与 U4 先例（复习锚各 1-2 题）一致。若要 2+2，需砍 2 道词汇题——待你拍板，可后续微调。
4. **题数实际值**：U5 桩原有 13 题，替换为 10 题后全库 finalQuiz = **137 题**（非指令包估的 151）；readWrite = **60 题**。重平衡脚本按实际题数处理，不受影响。

## 答案分布重平衡（跑完两脚本）

- `python scripts/content/rebalance_quiz_answers.py`：U5 finalQuiz 10 题 → **A/B/C/D = 3/3/2/2（最高 30%）**；U1-U4 因确定性幂等保持字节不变（已校验 grade4.json 仅 g4v1_u5 区块变化）。
- `python scripts/content/rebalance_readwrite_answers.py`：U5 readWrite 6 题 → **A/B/C = 2/2/2（33%）**。
- 完整性校验：U5 quiz 10 题正确答案文本/选项集合 **0 mismatch**；readWrite 经脚本内置逻辑只重排不改文本。

## 拍摄环境

| 项 | 值 |
|----|-----|
| 分支 | `cursor/g4v1-u5-content`（从 main `d58bd3e5` 拉出，含 PR #49–#52） |
| 来源 | **localhost:8080** 本地实拍（系统 Chrome via CDP / puppeteer-core） |
| Viewport | **390×844**（iPhone 12 Pro 宽度） |

### 深链（localhost，guest 模式）

- vocab：`/primary/hub/4/semester/grade4_volume1/unit/g4v1_u5/stage/0`
- readWrite：`…/unit/g4v1_u5/stage/6`
- finalQuiz：`…/unit/g4v1_u5/stage/7`（题序随机，逐题作答前进到 q.id=509）

---

## 1. vocab · stage/0 · 认识 10 个单词（含音标）

`after-g4v1_u5-vocab-10words-390px.png` — 标题「📖 认识 10 个单词」，两组 Tab：**食物 (0/5)** + **餐具 (0/5)**。食物组 5 卡显示词 + IPA：beef `/biːf/`、chicken `/ˈtʃɪkɪn/`、noodles `/ˈnuːdlz/`、soup `/suːp/`、vegetable `/ˈvedʒtəbl/`（单数）。

> 角标记录 `header="认识 10 个单词"`、`tabs=["食物 (0/5)","餐具 (0/5)"]`、`phonetics=["/biːf/","/ˈtʃɪkɪn/","/ˈnuːdlz/","/suːp/","/ˈvedʒtəbl/"]`、`ok=true`。

## 2. readWrite · stage/6 · 第 3/6 题（What would you like?）

`after-g4v1_u5-rw-would-you-like-390px.png` — 题号 **3/6**。句子 `What would you ___ ? I'd like some chicken.`，提示「想要（would you …）」，选项 want / eat / **like**（正确答案 like 落在 **C 位**，证明重平衡已生效、不再全 A）。

```html
<p class="text-left text-[22px] font-bold leading-snug text-[#2C2C2A] sm:text-center">What would <span class="whitespace-nowrap">you <span class="mx-0.5 inline border-b-2 border-dashed border-[#FF6B35] text-[#FF6B35]" style="min-width: 3ch;">___</span> ? I'd</span> like some chicken.</p>
```

## 3. finalQuiz · stage/7 · q.id=509（recall_polite_request 主锚）

`after-g4v1_u5-finalquiz-509-390px.png` — 锁定到 **q.id=509** `吃饭时你想请同桌把叉子递过来，下面哪句最合适？`，考点角标 **`u5:recall_polite_request`**（新增主锚已生效显示），选项 A `Pass me the fork, please.`（正确）/ B Where's / C is mine / D I have。

> 屏上「第 4 / 10 题」是因 finalQuiz 题序随机，脚本逐题前进 3 题后落在 509——内容锁定 509，与屏序无关；「第 N / **10** 题」也实证 501-511 跳 506 = 10 题。`steppedPast` 记录跳过的 3 题：「What would you like 应答」「蔬菜」「Would you like soup 回答」。

---

## 4. 测试日志

| 文件 | 内容 |
|------|------|
| `npm-test-full-console.txt` | `npm test` 完整 console |
| `capture-console.txt` | CDP 截图脚本输出（三项 `ok=true` + readWrite DOM + finalQuiz 定位/steppedPast） |

- `registry.test.ts`：**28 通过**（含新增 `loads g4v1_u5 fill_choice readWrite at stage 6` + readWrite 配置计数 11）。
- 全量 `npm test`：**102 通过 / 10 失败**，失败全在预存在的 `src/i18n/__tests__/slangLocalization.test.tsx`（i18n / jsdom env），与本单元无关、零新增。U5 前基线 101 通过，本单元新增 1 条 readWrite 断言 → 102。

命令：

```bash
python scripts/content/patch_g4v1_u5.py
python scripts/content/rebalance_quiz_answers.py
python scripts/content/rebalance_readwrite_answers.py
npm run dev          # localhost:8080
npm test
```
