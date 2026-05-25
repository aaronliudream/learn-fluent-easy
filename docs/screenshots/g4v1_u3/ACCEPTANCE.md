# g4v1 U3（My friends）内容验收包 · 分支 `cursor/g4v1-u3-content`

## 改了什么

新增 g4v1_u3「My friends」整单元内容（8 关），并补 readWrite + finalQuiz 验收截图。

| 文件 | 动作 | 说明 |
|----|-----|-----|
| `scripts/content/g4v1_u3_unit.json` | 新增 | U3 完整源：8 关、8 词 vocab（6 黑体 + his + her，含语义 emoji）、3 vocabGroups、10 quiz、3 listening |
| `scripts/content/patch_g4v1_u3.py` | 新增 | 从 `g4v1_u3_unit.json` 整块注入 `grade4.json` 的 g4v1_u3 桩（克隆 u2 patch 思路，确定性可复现） |
| `src/data/primaryHub/grade4.json` | 修改 | g4v1_u3 块由 patch 脚本替换为完整 unit |
| `src/data/primaryHub/readWrite/g4v1_u3_read_write.json` | 新增 | 6 题 fill_choice（Q1 his / Q2 her / Q3 long / Q4 shoes / Q5 friendly / Q6 glasses） |
| `src/lib/primaryHub/registry.test.ts` | 修改 | readWrite 配置计数 8→9 + 新增 g4v1_u3 stage 6 加载断言（6 题 / fill_choice） |

### vocab Tab 词集（已审定）

8 词 = 6 黑体词 + `his` + `her`。功能/白体词 `or` / `right` / `hat` 按 U1 先例（功能/白体词不占 Tab）未进 Tab。

### 渲染依赖

readWrite fill_choice 的不断行渲染依赖 `whitespace-nowrap` 修复（PR #48，已合入 main `30ed7d8`）。本分支自最新 main 拉出，已含该渲染逻辑。

## 拍摄环境

| 项 | 值 |
|----|-----|
| 分支 | `cursor/g4v1-u3-content`（从 main `30ed7d8` 拉出） |
| 来源 | **localhost:8080** 本地实拍（系统 Chrome via CDP / puppeteer-core） |
| Viewport | **390×844**（iPhone 12 Pro 宽度，DevTools device emulation 等价） |
| 包管理器 | npm（`npm install` / `npm run dev` / `npm test`） |

### 深链（localhost，guest 模式）

- readWrite：`/primary/hub/4/semester/grade4_volume1/unit/g4v1_u3/stage/6`（连点正确答案前进到目标题）
- finalQuiz：`/primary/hub/4/semester/grade4_volume1/unit/g4v1_u3/stage/7`（题序随机，逐题作答前进到 q.id=301）

---

## 1. readWrite · stage/6 · 第 1/6 题（his）

`after-g4v1_u3-rw-q1-his-390px.png` — 题号 **1/6** 已核对。句子 `James has a green bag. What is ___ name?`
nowrap 组 = `is ___ name?`，空格不孤悬，前半句正常换行。

```html
<p class="text-left text-[22px] font-bold leading-snug text-[#2C2C2A] sm:text-center">James has a green bag. What <span class="whitespace-nowrap">is <span class="mx-0.5 inline border-b-2 border-dashed border-[#FF6B35] text-[#FF6B35]" style="min-width: 3ch;">___</span> name?</span></p>
```

## 2. readWrite · stage/6 · 第 2/6 题（her）

`after-g4v1_u3-rw-q2-her-390px.png` — 题号 **2/6** 已核对。句子 `Ann has a blue hat. What is ___ name?`
nowrap 组 = `is ___ name?`，本题该组整体换到第 2 行，空格随组移动、无孤悬，新题面换行无回归。

```html
<p class="text-left text-[22px] font-bold leading-snug text-[#2C2C2A] sm:text-center">Ann has a blue hat. What <span class="whitespace-nowrap">is <span class="mx-0.5 inline border-b-2 border-dashed border-[#FF6B35] text-[#FF6B35]" style="min-width: 3ch;">___</span> name?</span></p>
```

## 3. finalQuiz · stage/7 · q.id=301（recall_personality）

`after-g4v1_u3-finalquiz-301-390px.png` — 锁定到 **q.id=301** `看中文选词：「安静的」`，考点角标 `u3:recall_personality`，选项 A friendly / **B quiet** / C strong / D cute（正确答案 B）。

> 屏幕计数显示「第 4 / 10 题」是因为 finalQuiz 题序随机，脚本逐题作答前进 3 题后才落在 301——**内容锁定 301，与屏上顺序号无关**。脚本 `steppedPast` 记录跳过的 3 题：「Kate 头发」「鞋泥色」「搬箱子」。

---

## 修复点：finalQuiz 截图脚本（昨晚 vs 今早）

| | 昨晚（旧） | 今早（新） |
|----|-----|-----|
| 定位逻辑 | 抓**首屏任意**含 `看中文选词` 且选项集匹配的题 | 逐题作答前进，直到 prompt **精确等于** `看中文选词：「安静的」`（q.id=301）再截 |
| 实际截到 | 被打乱的 Q307，**与角标不符** | 真正的 Q301 |
| 角标 | 误写「Q301」（与画面不一致） | 写实 `Q301 (「安静的」→ B quiet)` |
| 校验 | 仅判断选项数 ≥3 | 返回 `prompt` / `counter` / `opts` / `steppedPast`，`ok=true` 表示确实命中 301 |

---

## 4. 测试日志

| 文件 | 内容 |
|------|------|
| `npm-test-full-console.txt` | `npm test` 完整 console |
| `capture-console.txt` | CDP 截图脚本输出（三项 `ok=true` + readWrite DOM 片段 + finalQuiz 定位数据） |

- `registry.test.ts` 通过，含新增 `loads g4v1_u3 fill_choice readWrite at stage 6` 断言 + readWrite 配置计数 9。
- 全量 `npm test`：**100 通过 / 10 失败**，失败全在 `src/i18n/__tests__/slangLocalization.test.tsx`（`I18nProvider → supabase.auth.getSession()`，jsdom/env 相关），与本单元无关、预存在 —— 见 `docs/notes/yak-shaving.md`。U3 改动**零新增失败**。

命令：

```bash
npm install
npm run dev          # localhost:8080
npm test
```
