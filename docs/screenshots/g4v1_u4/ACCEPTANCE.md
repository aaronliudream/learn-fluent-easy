# g4v1 U4（My home）内容验收包 · 分支 `cursor/g4v1-u4-content`

## 改了什么

新增 g4v1_u4「My home」整单元内容（8 关），并补 vocab / readWrite / finalQuiz 验收截图。

| 文件 | 动作 | 说明 |
|----|-----|-----|
| `scripts/content/g4v1_u4_unit.json` | 新增 | U4 完整源：8 关、10 词 vocab（5 房间 + 5 家具，含语义 emoji）、2 vocabGroups、10 quiz（401-411 跳 406）、3 listening |
| `scripts/content/patch_g4v1_u4.py` | 新增 | 从 `g4v1_u4_unit.json` 整块注入 `grade4.json` 的 g4v1_u4 桩（克隆 u3 patch 思路，确定性可复现） |
| `src/data/primaryHub/grade4.json` | 修改 | g4v1_u4 桩（仅 8 词、占位对话）由 patch 脚本替换为完整 unit |
| `src/data/primaryHub/readWrite/g4v1_u4_read_write.json` | 新增 | 6 题 fill_choice（Q1 living room / Q2 in / Q3 on / Q4 is / Q5 aren't / Q6 on「找眼镜」） |
| `src/lib/primaryHub/registry.test.ts` | 修改 | readWrite 配置计数 9→10 + 新增 g4v1_u4 stage 6 加载断言（6 题 / fill_choice） |

### vocab Tab 词集（已审定）

10 词 = 5 房间词（bedroom / living room / study / kitchen / bathroom）+ 5 家具物品词（bed / phone / table / sofa / fridge）。**介词 in / on / under / near 不进 vocab**，按指令进 `u1:recall_position` 锚（finalQuiz 401/404/405/407/408 复现）。

### finalQuiz 题号与三锚

题号 **401-411，跳过 406**（对齐 U3 跳 306 先例）→ 屏上显示 **10 题**。考点三锚：

| 锚 | 题号 | 角色 |
|----|-----|-----|
| `u1:recall_position`（主） | 401 / 404 / 405 / 407 / 408 | 介词 in/on/under/near + Where's/Where are + Is/Are 句型 |
| `u2:recall_have` | 410 | 「I have a friend.」承接对话 |
| `u3:recall_personality` | 411 | Story time 改编（安静的小熊找眼镜） |

其余 402/403/409 为 U4 自有词/句考点（`u4:recall_room` / `u4:recall_furniture`）。

### 渲染依赖

readWrite fill_choice 的不断行渲染依赖 `whitespace-nowrap` 修复（PR #48，已合入 main `30ed7d8`）。本分支自最新 main（`d5a20bfe`，含 U3 PR #49）拉出，已含该渲染逻辑。

## 拍摄环境

| 项 | 值 |
|----|-----|
| 分支 | `cursor/g4v1-u4-content`（从 main `d5a20bfe` 拉出） |
| 来源 | **localhost:8080** 本地实拍（系统 Chrome via CDP / puppeteer-core） |
| Viewport | **390×844**（iPhone 12 Pro 宽度，DevTools device emulation 等价） |
| 包管理器 | npm（`npm install` / `npm run dev` / `npm test`） |

### 深链（localhost，guest 模式）

- vocab：`/primary/hub/4/semester/grade4_volume1/unit/g4v1_u4/stage/0`
- readWrite：`/primary/hub/4/semester/grade4_volume1/unit/g4v1_u4/stage/6`（连点正确答案前进到第 6 题「找眼镜」）
- finalQuiz：`/primary/hub/4/semester/grade4_volume1/unit/g4v1_u4/stage/7`（题序随机，逐题作答前进到 q.id=408）

---

## 1. vocab · stage/0 · 认识 10 个单词

`after-g4v1_u4-vocab-10words-390px.png` — 顶部标题 **「📖 认识 10 个单词」**，两个分组 Tab：**房间 (0/5)** + **家具与物品 (0/5)**，合计 10 词。当前展示「房间」组 5 张卡：bedroom / living room / study / kitchen / bathroom。

> 角标记录 `header="认识 10 个单词"`、`tabs=["房间 (0/5)","家具与物品 (0/5)"]`、`ok=true`（两组齐全）。介词不在词集中，符合「只收 10 黑体词」的审定。

## 2. readWrite · stage/6 · 第 6/6 题（找眼镜 · on）

`after-g4v1_u4-rw-glasses-390px.png` — 题号 **6/6** 已核对。句子 `My glasses are ___ the table.`（Story time 找眼镜素材），提示「在……上面」，选项 **on** / under / in（正确答案 on）。
nowrap 组 = `are ___ the table.`，本题该组整体换到第 2 行，空格随组移动、无孤悬。

```html
<p class="text-left text-[22px] font-bold leading-snug text-[#2C2C2A] sm:text-center">My glasses <span class="whitespace-nowrap">are <span class="mx-0.5 inline border-b-2 border-dashed border-[#FF6B35] text-[#FF6B35]" style="min-width: 3ch;">___</span> the table.</span></p>
```

## 3. finalQuiz · stage/7 · q.id=408（recall_position 主锚）

`after-g4v1_u4-finalquiz-408-390px.png` — 锁定到 **q.id=408** `钥匙放在冰箱「上面」。问「Where are the keys?」，下面哪句对？`，考点角标 **`u1:recall_position`**，选项 **A They're on the fridge.**（正确，绿框 + 答对了）/ B in / C under / D「It's…」（主谓不一致干扰项）。

> 屏幕计数显示「第 6 / 10 题」是因为 finalQuiz 题序随机，脚本逐题作答前进 5 题后才落在 408——**内容锁定 408，与屏上顺序号无关**；「**第 N / 10 题**」也实证了 401-411 跳 406 = 10 题的题量。脚本 `steppedPast` 记录跳过的 5 题：「小熊找眼镜(411)」「厨房(402)」「I have a friend(410)」「沙发客厅(409)」「猫在盒子里(401)」。

---

## 4. 测试日志

| 文件 | 内容 |
|------|------|
| `npm-test-full-console.txt` | `npm test` 完整 console |
| `capture-console.txt` | CDP 截图脚本输出（三项 `ok=true` + readWrite DOM 片段 + finalQuiz 定位/steppedPast 数据） |

- `registry.test.ts` 通过（**27 tests**），含新增 `loads g4v1_u4 fill_choice readWrite at stage 6` 断言 + readWrite 配置计数 10。
- 全量 `npm test`：**101 通过 / 10 失败**，失败全在 `src/i18n/__tests__/slangLocalization.test.tsx`（`I18nProvider → supabase.auth.getSession()`，jsdom/env 相关），与本单元无关、预存在。U4 改动**零新增失败**（U3 基线 100 通过，本单元新增 1 条 readWrite 断言 → 101）。

命令：

```bash
npm install
npm run dev          # localhost:8080
npm test
```
