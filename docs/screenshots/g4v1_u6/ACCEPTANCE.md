# g4v1 U6（Meet my family!）内容验收包 · 分支 `cursor/g4v1-u6-content`

## 单元信息
- 课本：PEP 三年级起点 四年级上册 p.56–65
- 主题：Meet my family!（家人称谓 + 职业）
- 主锚：`u6:recall_family_job`（新增）

## 改了什么

| 文件 | 动作 | 说明 |
|----|-----|-----|
| `scripts/content/g4v1_u6_unit.json` | 新增 | U6 完整源（真实 schema）：8 关、10 词 vocab（家人 5 + 职业 5，含音标）、2 vocabGroups、10 quiz（601-611 跳 606）、3 listening |
| `scripts/content/patch_g4v1_u6.py` | 新增 | 克隆 patch_g4v1_u5.py（sed u5→u6）；整块替换 grade4.json 的 g4v1_u6 桩 |
| `src/data/primaryHub/grade4.json` | 修改 | g4v1_u6 桩 → 完整 unit（仅此 unit 变化，U1-U5 经幂等重平衡保持字节不变） |
| `src/data/primaryHub/readWrite/g4v1_u6_read_write.json` | 新增 | 6 题 fill_choice（family / job 主题，真实 schema 3 选项） |
| `src/lib/primaryHub/registry.test.ts` | 修改 | readWrite 配置计数 11→12 + 新增 g4v1_u6 stage 6 加载断言 |

## ⚠️ Schema 转换记录（内容窗口产出的是另一套 schema，已 reshape 成 grade4.json 真实结构）

内容数据（10 词 / 题号 / 锚分布 / 答案）全部按原样保留，仅做字段结构映射。映射明细：

| 内容窗口字段 | → 真实 schema | 处理 |
|----|----|----|
| `vocab[].key/word/ipa/zh/page/category` | `vocabulary[].en/cn/emoji/phonetic` + `vocabGroups` | page/category → vocabGroups（family_p59 / job_p62）；新增 emoji（窗口未给） |
| `vocab[].zh` 长释义 | `vocabulary[].cn` | **uncle/aunt 已按产品负责人指定改回完整释义**：uncle =「叔叔；舅舅」、aunt =「阿姨；姑姑」（中文分号）；**cousin 保持精简版**「表(堂)亲」。原长释义（uncle「舅父；叔父；伯父；姑父；姨夫」等）仍未全收，全释义 UI 无处展示 |
| `keyExpressions[]` | `dialogues[]`（A/B Let's talk） | 6 句核心句型分配进两段对话 |
| `finalQuiz[].stem`（含 `\n—`） | `quizQuestions[].q` | 换行折叠为单行（渲染本就折叠空白） |
| `finalQuiz[].answer`（字符串） | `quizQuestions[].answer`（**索引**） | 转成 opts 中的下标 |
| `finalQuiz[].type:"single_choice"` | （无此字段） | 丢弃；真实 quizQuestions 无 type |
| `finalQuiz[].explanation` / `page` | （无此字段） | **丢弃**：真实 UI 不展示逐题解析 |
| （窗口未给）`dim` | `quizQuestions[].dim` | 我按词义题=vocab / 句子题=sentence 推断补上 |
| `recallAnchors` / `meta` 块 | （无此结构） | 丢弃；锚仅作为 `point` 字符串挂在每题上（代码无"锚注册表"，写入即生效） |
| readWrite `items[].stem/options/answer` | `questions[].sentence/hint_zh/correctSentence/options[{text,correct}]` | `____`→`___`；hint_zh 据语义补；correctSentence 用答案填空生成 |
| readWrite **4 选项** | 真实约定 **3 选项** | 每题删 1 个干扰项（见下），对齐 U1-U5 fill_choice 格式 + rebalance 3-opt 均衡 |

readWrite 每题删除的干扰项：rw01 删 aunt / rw02 删 farmer / rw03 删 family / rw04 删 driver / rw05 删 farmer / rw06 删 this。

**其它纠偏（与指令包文字不符但为跑通必需）**：
- patch / rebalance 脚本在 `scripts/content/` 下；rebalance 脚本**无 `--unit` 参数**（处理全部 unit 且幂等，U1-U5 不受影响），脚本名是 `rebalance_quiz_answers.py`（非 `rebalance_finalquiz_answers.py`）。
- `baby brother` 空格 key 风险不存在：真实 schema 无 `key` 字段，`en:"baby brother"` 只是值（U4 早有 `"living room"`），patch 整块替换无 `.replace` 处理。
- 题数实际：U6 桩原有 12 题，替换为 10 题后全库 finalQuiz = **135 题**（非指令包估的），readWrite = **66 题**。

## 验收清单

### vocab（10 黑体词）
- [x] family 5：parents / cousin / uncle / aunt / baby brother
- [x] job 5：doctor / cook / driver / farmer / nurse
- [x] IPA 音标完整（截图含 baby brother `/ˈbeɪbi ˈbrʌðə(r)/`）
- [x] 仅收黑体词（功能词不进 Tab，沿用 U3–U5 契约）

### finalQuiz（10 题）
- [x] 题号 601–611，跳 606（校验：ids = [601,602,603,604,605,607,608,609,610,611]，606 缺席，count 10）
- [x] 主锚 u6:recall_family_job × **8**（601/602/603/604/605/607/610/611）
- [x] 复习锚 u5:recall_polite_request × **1**（608）
- [x] 复习锚 u3:recall_personality × **1**（609）
- [x] rebalance 跑过，答案分布 A/B/C/D = **3/3/2/2**（最高 30%）；正确答案文本 0 mismatch

### readWrite（6 题 fill_choice）
- [x] 全部围绕 family / job 主题，全部挂 u6:recall_family_job
- [x] rebalance 跑过，A/B/C = **2/2/2**（33%）

### 测试基线
- [x] registry.test.ts **29 通过**；全量 **103 通过 / 10 失败**（失败全在预存在 `slangLocalization.test.tsx`，零新增）
- 注：指令包写"102 通过"是 U5 后基线；U6 新增 1 条 readWrite 断言 → 103。10 个 yak-shaving 失败数字未变。

### 主考点对照（p.58 / p.61 / p.62）
- [x] How many people are there in your family?（p.58）→ finalQuiz 601、readWrite rw_06
- [x] Is this your uncle? / He's a football player.（p.61）→ finalQuiz 602、readWrite rw_02
- [x] What's your aunt's job? / She's a nurse.（p.61）→ finalQuiz 605、readWrite rw_03

## 拍摄环境

| 项 | 值 |
|----|-----|
| 分支 | `cursor/g4v1-u6-content`（从 main `d58bd3e5`+，含 PR #49–#53） |
| 来源 | localhost:8080 本地实拍（系统 Chrome via CDP / puppeteer-core） |
| Viewport | 390×844 |

### 深链
- vocab：`…/unit/g4v1_u6/stage/0` · readWrite：`…/stage/6` · finalQuiz：`…/stage/7`

---

## 1. vocab · stage/0 · 认识 10 个单词（含音标）

`after-g4v1_u6-vocab-10words-390px.png` — 标题「认识 10 个单词」，两组 Tab **家人 (0/5)** + **职业 (0/5)**。家人组 5 卡显示词 + IPA：parents `/ˈpeərənts/`、cousin `/ˈkʌzn/`、uncle `/ˈʌŋkl/`、aunt `/ɑːnt/`、baby brother `/ˈbeɪbi ˈbrʌðə(r)/`。

## 2. readWrite · stage/6 · 第 3/6 题（What's your aunt's job?）

`after-g4v1_u6-rw-aunt-job-390px.png` — 题号 **3/6**，句子 `What's your aunt's ___ ? She's a nurse.`，提示「工作 / 职业」，选项 **job** / name / home。nowrap 组 `aunt's ___ ? She's` 不孤悬。

```html
<p class="text-left text-[22px] font-bold leading-snug text-[#2C2C2A] sm:text-center">What's your <span class="whitespace-nowrap">aunt's <span class="mx-0.5 inline border-b-2 border-dashed border-[#FF6B35] text-[#FF6B35]" style="min-width: 3ch;">___</span> ? She's</span> a nurse.</p>
```

## 3. finalQuiz · stage/7 · q.id=601（主考点 How many people）

`after-g4v1_u6-finalquiz-601-390px.png` — 锁定 **q.id=601** `—How many people are there in your family? —____.`，考点角标 **`u6:recall_family_job`**，选项 A I'm fine / B Yes, it is / C She's a nurse / **D Five**（正确答案 Five 落 **D 位**，旁证重平衡生效、不再全 A）。

> 屏上「第 8 / 10 题」因题序随机；「第 N / **10** 题」实证 601-611 跳 606 = 10 题。

## 4. 测试日志

| 文件 | 内容 |
|------|------|
| `npm-test-full-console.txt` | `npm test` 完整 console |
| `capture-console.txt` | CDP 截图脚本输出（三项 `ok=true` + readWrite DOM + finalQuiz steppedPast） |

命令：
```bash
python scripts/content/patch_g4v1_u6.py
python scripts/content/rebalance_quiz_answers.py
python scripts/content/rebalance_readwrite_answers.py
npm run dev          # localhost:8080
npm test
```

## 截图说明（与指令包 5 张清单的差异）

指令包列了 `finalquiz_list.png` / `recall_anchors.png` 两张——真实 app **没有**"题目列表页"或"锚分布页"（finalQuiz 一次一题，锚是题上的 badge）。故沿用 U5 实拍 3 张：vocab / readWrite / finalQuiz(601)。锚分布以数据校验佐证（u6×8 + u5×1 + u3×1，见上）。
