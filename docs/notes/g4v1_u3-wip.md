# g4v1_u3（My friends）WIP

> **状态:截图已完成,等用户审 + 开 PR。** 今晚未 commit、未 PR。明早继续。

## 当前分支
`cursor/readwrite-wrap-fix`(换行修复已合 main 的那条;U3 改动目前**叠在此分支工作区、未提交**)。
⚠️ 明早决定:U3 是否另起干净分支再 commit,还是就在此分支续推 → 用户开 PR。

## 已落盘文件(全部未提交)
| 文件 | 动作 | 说明 |
|------|------|------|
| `src/data/primaryHub/readWrite/g4v1_u3_read_write.json` | 新增 | 6 题 fill_choice(Q1 his / Q2 her / Q3 long / Q4 shoes / Q5 friendly / Q6 glasses) |
| `scripts/content/g4v1_u3_unit.json` | 新增 | 完整 unit 源(8 关、8 词 vocab+语义 emoji、3 vocabGroups、10 quiz、3 listening) |
| `scripts/content/patch_g4v1_u3.py` | 新增 | 整块注入 grade4.json(克隆 u2 patch) |
| `src/data/primaryHub/grade4.json` | 修改 | g4v1_u3 块已被 patch 替换 |
| `src/lib/primaryHub/registry.test.ts` | 修改 | readWrite 计数 8→9 + 新增 g4v1_u3 加载断言 |
| `docs/screenshots/g4v1_u3/` | 新增 | 3 截图 + capture-console.txt + npm-test-full-console.txt |
| `scripts/tmp_rw_wrap_capture.mjs` | 临时 | 一次性截图脚本,**commit 前删** |

## 测试
`npm test`:**1 文件失败 / 10 用例** —— 全是预存在的 `src/i18n/__tests__/slangLocalization.test.tsx`(supabase.auth/jsdom,与 U3 无关,见 yak-shaving.md)。其余 **14 文件 / 100 用例通过**,含新增 g4v1_u3 registry 断言。U3 改动**零新增失败**。

## 截图(390×844,均已肉眼核对)
| 文件 | 内容 | 判定 |
|------|------|------|
| `after-g4v1_u3-rw-q1-his-390px.png` | 读写 第 1/6 题 his | 换行组 `is ___ name?` 不断行,空格不孤悬 ✅ |
| `after-g4v1_u3-rw-q2-her-390px.png` | 读写 第 2/6 题 her | 同上,新题面换行无回归 ✅ |
| `after-g4v1_u3-finalquiz-301-390px.png` | finalQuiz 第 1/10 题(u3:recall_appearance) | finalQuiz 渲染正常 ✅ |

DOM 片段见 `capture-console.txt`(证 whitespace-nowrap 范围正确)。

## 待用户审 / 明早事项
1. **vocab Tab 词集判断**:我定 8 词 = 6 黑体 + his + her(`or`/`right`/`hat` 按 U1「功能/白体词不占 Tab」先例未进 Tab)。请确认是否接受,还是要纳入 4A 词表全部 11 词。
2. **finalQuiz 题序随机**:首屏非 301(本次截到 307);截图角标误写「Q301」。若需指定题号截图,明早调 capture。
3. **分支 + commit 策略**,然后**用户开 PR**(不要我开)。
4. **ACCEPTANCE.md** 待写(对齐 `docs/screenshots/readwrite-wrap-fix/ACCEPTANCE.md` 格式)。
5. commit 前删 `scripts/tmp_rw_wrap_capture.mjs`。

## 内容来源(审计用)
题面唯一文本依据 = 用户补全的 PEP p.25 / p.28-29 / p.30-31 课本原文 + 仓库 `primary_pep_dialogues.py` 转录;`patterns.py` 仅句型佐证不引用。考点映射表见对话记录(已审定:301-311 跳号 306,readWrite 6 题,s6 听辨 3 题)。
