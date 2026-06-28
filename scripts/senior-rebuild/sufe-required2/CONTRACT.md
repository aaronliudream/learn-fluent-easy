# 上外必修二 单元内容生产契约(每个单元 9 个 JSON 文件)

你为**一个单元**生产全部内容文件,落在 `scripts/senior-rebuild/sufe-required2/<u>/`,命名严格为
`required2-<u>-<name>.json`(小写,如 `required2-u1-vocab.json`)。

参考样板(必修二 U5,质量已真机验收,**字段名/结构 1:1 照抄,只换内容**):
`scripts/senior-rebuild/required1-u5/required1-u5-*.json`

## 铁律(违反 = 返工)
1. **只考本单元语法点**;句子让该语法点**自然成立**,不为凑考点硬套别扭动词(catch+进行将来那种)。句子必须地道。
2. 语法**零术语**:不出"选出""作什么成分""哪项是X短语";全是带 `____` 空格的应用题,选项是英文。
3. 阅读答案**非照抄**:答案是对原文的概括转述,**不得**是正文里 ≥5 词的连续子串。
4. 完形**无双解**:每空只一个答案成立,4 选项同词性。
5. 听力答案可在 transcript 找到依据。
6. 三关(阅读/完形/听力)文章**互不重复**(jaccard<0.6,即不复用同一篇)。
7. 词汇:**真词**(用给你的 wordlist JSON,课标词优先,跳过专有名词)+ IPA(英音,标准词典)+ 例句含目标词且本单元主题 + 多义给多个中文释义。
8. 解析(explanation)**不引用选项字母/位置**(A/B/第一项),因为入库前会重排选项 —— 只讲为什么这个词/这个形式对。

## 各文件 schema(题量是硬性,QC 会卡)

### required2-<u>-vocab.json  —— 词汇 44~52 个
```
{ "volume":"required2","unit":"U1","book_cn":"必修第二册","unit_cn":"...","source":"...",
  "words":[ { "word":"heritage","ipa":"/ˈherɪtɪdʒ/","ipa_us":"(英美不同才给)","note":"(可选,如美式拼写)",
    "pos":"n.","meaning_cn":"遗产;传统","phrase_en":"cultural heritage",
    "example_en":"We must protect our cultural heritage.","example_cn":"我们必须保护我们的文化遗产。","freq_rank":1 } ] }
```
- 每个 word 的 `example_en` 必须含该词(或其词形);IPA 必须形如 `/.../`。

### required2-<u>-grammar.json —— 3 点 × 20 题 = **60 题**
```
{ "volume":"required2","unit":"U1","grammar_title":"...","source":"...",
  "points":[ {"code":"u1.01","point":"who/whom(指人)","overview":"..."},
             {"code":"u1.02","point":"which/that(指物)","overview":"..."},
             {"code":"u1.03","point":"介词+which/whom · whose · where/when/why","overview":"..."} ],
  "questions":[ {"code":"u1.01","stem":"The archaeologist ____ found the relics is famous.",
    "options":["who","which","when","whose"],"answer_index":0,
    "explanation":"先行词 archaeologist 指人、从句缺主语 → who。"} ] }
```
- `code` 必须是上面三个之一,**每个 code 恰好 20 题**(共60)。stem 必须含 `____`。

### required2-<u>-reading.json —— **6 篇**,每篇 3 题(共18),body **120~210 词**
```
{ "volume":"required2","unit":"U1","topic":"Cultural Heritage","source":"...",
  "passages":[ {"code":"rd1","title":"...","topic_cn":"说明·...","body":"... 120-210 词 ...",
    "vocab_notes":[{"word":"heritage","cn":"遗产"},{"word":"relic","cn":"遗迹"}],
    "questions":[ {"stem":"What is the main idea?","options":["...","...","...","..."],"answer_index":0,
      "explanation":"..."} ] } ] }
```
- 6 篇主题围绕本单元、彼此不同子题材;答案转述、不照抄。

### required2-<u>-cloze.json —— **6 篇**,每篇 10 空(共60)
```
{ "volume":"required2","unit":"U1","topic":"...","source":"...",
  "passages":[ {"code":"cz1","title":"...","text":"... 含 (1)…(10) 或挖空叙述 ...",
    "questions":[ {"blank":1,"options":["...","...","...","..."],"answer_index":0,"explanation":"..."} ] } ] }
```
- 每篇恰好 10 个 blank(1..10),选项同词性,无双解。text 与阅读关不复用。

### required2-<u>-listening.json —— **6 篇**,每篇 5 题(共30),long/short 交替(3长3短)
```
{ "volume":"required2","unit":"U1","topic":"...","tts_voice":"nova","source":"...",
  "exercises":[ {"code":"ls1","title":"...","type":"dialogue/passage 简述","kind":"long",
    "speaker":"uk_female","transcript":[{"speaker":"A","text":"..."},{"speaker":"B","text":"..."}],
    "translation_cn":"中文大意...","questions":[ {"stem":"...","options":["...","...","...","..."],"answer_index":0} ] } ] }
```
- kind 取 `long`(对话,transcript 用 {speaker,text} 数组)/`short`(独白,transcript 可为字符串)。顺序 long,short,long,short,long,short。
- 必有 `translation_cn` 和 `transcript`。

### required2-<u>-writing.json —— 1 篇(照 U5 字段全给)
含 topic,title_en,genre,source,prompt_cn,prompt_en,points[4],word_count,model_essay,model_translation,
scoring{total:15,rubric[3],required_structure[],key_expressions[],useful_words[10]},high_sentences[4],error_pairs[3],paragraph_template。

### required2-<u>-finalreading.json —— 单元通关迷你阅读
```
{ "volume":"required2","unit":"U1","note":"...",
  "finalReading":{ "passage":"独立短文 2-3 句(不撞阅读关)","questions":[
    {"q":"...","options":["...","...","...","..."],"answer":0,"explanation":"..."},
    {"q":"...","options":["...","...","...","..."],"answer":0,"explanation":"..."} ] } }
```
- passage **2-3 句**;≥2 题;答案不照抄短文。

### required2-<u>-grammar-tips.json —— 语法小知识卡
```
{ "volume":"required2","unit":"U1","grade":10,
  "content":{ "title":"...速查","intro":"...","table":{"headers":["...","..."],"rows":[["..","..],...]},
    "specialRules":[{"rule":"...","mark":"..."}],"why":["..."],
    "gaokaoPoints":["..."],
    "examVsReal":[{"exam":"考试这么填","real":"真实英语更灵活","note":"..."}] } }
```
- 结构:速查表 + 特殊规则 + 为什么(简短) + 高考考点 + **考试vs真实对照**。

### required2-<u>-hub.json —— hub 内联(小)
```
{ "listeningQuestions":[ {"audio":"一句英文","opts":["对应中文✓","错","错","错"],"answer":0} ],  // 恰好6条
  "quizQuestions":[ {"q":"题干","opts":["..","..","..",".."],"answer":0,"point":"词汇/语法/听力","dim":"vocab/grammar/listening","audio":"(dim=listening时给英文句)"} ], // 10条:4词汇+4语法+2听力
  "reading":{ "passage":"2-3句短文","passageCn":"中文","questions":[{"q":"..","opts":["..","..","..",".."],"answer":0}] },
  "writing":{ "prompt":"...","promptCn":"...","sampleWords":["w1",...,"w10"] },
  "dialogues":[ {"title":"...","lines":[{"role":"A","text":"...","cn":"..."},{"role":"B","text":"...","cn":"..."}]} ] }
```

## 完成前必须自检(在你的单元目录上跑,迭代到 0 FAIL)
```
node scripts/senior-rebuild/sufe-required2/_balance.mjs --unit <u>
node scripts/qc-unit.mjs --dir scripts/senior-rebuild/sufe-required2/<u> --vol required2 --unit <U大写> --outlabel sufe-required2-<U大写>
```
- `_balance` 会自动均衡答案分布(你不必手工凑分布)。
- QC 必须 `硬卡 FAIL: 0`。WARN(超纲词等)可忽略。
- **只**有 0 FAIL 才算完成,返回时报告每文件题量 + QC 结果。
