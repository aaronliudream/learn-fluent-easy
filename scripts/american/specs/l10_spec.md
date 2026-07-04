# 美语课程 ⑤ 关10 丰富化 · 造题规范(子代理必读)

> ⚠️ 册号通用:文中示例 lesson_id 写作 `am1_lNN`,第 N 册一律读作 `amN_lNN`(如第二册 `am2_l01`..`am2_l96`)。结构/字段/判据完全一致;每单元课数第一册=6、第二册起=8,不影响本规范。

把某课"关10 本课通关"从单调语法题改成**五题型综合检验**。**只造内容不碰库**。全部用本课已教内容出题,**零超纲**。

## 你会读到的每课素材文件(l10_<lesson>.json)
- `lesson` 课号, `courseLen` 课文句数, `listeningTier` = "short"(短课) / "long"(长课)
- `sentences` 课文逐句(seq/speaker/en/cn), `passage` 拼好的课文对话(带说话人,直接用作阅读题课文)
- `words` 本课词汇(word/ipa/cn), `existingStage10` 现有关10题, `dialogueScenes` 本课关7对话场景

## 关10 五题型构成(每课约 11–13 题,全对通关)
① **句型(保留3-4)** — 从 `existingStage10` 里**挑 3-4 道最核心的语法 choice 题保留**(be动词 Is/物主 your/代词 it 之类);**删掉**全部 transform(变疑问句)重复题 + 多余的非语法 choice(情景/词汇类,因为②③会新出)。
② **词义(2)** — 从本课 `words` 出:中文释义↔英文词 互选(4选1)。
③ **情景(2)** — 从本课对话场景(`dialogueScenes`/`passage`)出:给情景选得体英文回应。
④ **阅读(2-3)** — 从本课 `passage` 出:读课文选择/判断。**每道阅读题必须带 `passage` 字段=本课课文原文**(前端会在题上方显示课文框)。
⑤ **听力(自适应 1-3)** — 见下。

## 听力自适应(按 listeningTier,铁律)
**short 短课** → 简单听力 1-2 道:
- 听词选义:`audio`=本课某个词 → stem="🔊 听录音,选出这个词的意思",options 4个中文释义(1对3错,干扰用本课其他词的意思)。
- 或 听句选答:`audio`=本课某句 → 选得体回应或判断。

**long 长课(对话/叙事)** → 综合小对话 2-3 道:
- `audio`=本课课文里**连续 2-4 轮对话片段**(从 sentences 摘,带说话人,原文照抄)。
- 出 2-3 道理解题(谁做了什么/在哪/什么时候/说话人语气态度/对话结论),这 2-3 道的 `audio` 都填**同一个片段**(便于重听)。
- stem 只写问题,**不写对话原文**(不露答案)。

## 取材铁律(每课都遵守,超纲即错)
- 词义题=本课 words 的词;情景题=本课对话场景;阅读题=本课 passage;听力 audio=本课词/句/对话片段;句型题=保留的本课语法题。
- **绝不用其他课/超纲词句**。某课素材出不齐某题型 → 该型少出或不出,别硬凑超纲。

## 每题都要
- choice 题型:`stem` + `options`(正好4个) + `answer_index`(0-3) + `explanation_cn`(考点+为什么对,一两句)。
- 答案唯一、3个干扰项确定错(同类但都不对)。
- 阅读题额外带 `passage`(本课课文);听力题额外带 `audio`(本课要朗读的文本)。

## L1 已验收样板(照此风格)
- 词义:stem"选出 lifesaver 的意思" options["救星、帮大忙的人","椅子","手机","女士"] ai=0
- 情景:stem"你捡到别人的手机,要递还,你说：" options["Here you go.","Thank you.","Excuse me?","No problem."] ai=0
- 阅读(带passage=课文):stem"(读课文)Emma 为什么说 Tyler 是 a lifesaver？" options["因为 Tyler 把她的手机还给了她",...] ai=0
- 听力(短课):stem"🔊 听录音,选出这个词的意思" audio"chair" options["椅子","手机","女士","救星"] ai=0

## 拿不准就 flag
课文太短/太特殊出不齐五题型、某题型疑似超纲、长课对话片段怎么切拿不准、阅读问法拿不准 → 该项加 `"flag":"待裁决:<原因>"`,给出最佳判断但让人复核。

## 输出(**只输出 JSON,无解释文字**),每课一个对象,合成数组:
```json
[
 {"lesson":"am1_l07","listeningTier":"long",
  "keepSeqs":[1,2,3,8],
  "deleteSeqs":[4,5,6,7,9,10],
  "newQuestions":[
    {"type":"vocab","stem":"...","options":["..","..","..",".."],"answer_index":0,"explanation_cn":"...","flag":null},
    {"type":"scenario","stem":"...","options":["..","..","..",".."],"answer_index":1,"explanation_cn":"...","flag":null},
    {"type":"reading","stem":"...","options":["..","..","..",".."],"answer_index":0,"explanation_cn":"...","passage":"<本课passage原文>","flag":null},
    {"type":"listening","stem":"🔊 ...","audio":"<本课词/句/片段>","options":["..","..","..",".."],"answer_index":2,"explanation_cn":"...","flag":null}
  ]}
]
```
- `keepSeqs`/`deleteSeqs` 来自 existingStage10 的 seq(保留的+删除的,两者并集=现有全部)。
- newQuestions 里 type ∈ vocab/scenario/reading/listening;数量约 词义2/情景2/阅读2-3/听力(short:1-2 / long:2-3)。
- reading 每题带 passage;listening 每题带 audio。
