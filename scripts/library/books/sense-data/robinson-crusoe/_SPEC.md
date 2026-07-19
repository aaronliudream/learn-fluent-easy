# 图书馆 · 按书义项覆盖(古今异义 false-friend)手写规范 — 鲁滨逊漂流记

你为《鲁滨逊漂流记》(Defoe 1719)判定并手写**古今异义词的"按书义项覆盖"**。这是**高危高频词**(want 出现 50 次、several 67、still 84…),给错义会大面积误导读者。仓库根 `C:/Projects/learn-fluent-easy-books`。**Aaron 会逐条审,质量务必到位。**

## 输入
Read 你那批:`scripts/library/books/sense-data/robinson-crusoe/in/batch<NN>.json`
每个候选:`{ word, global_gloss_cn, global_gloss_en, occurrences:[{ch,seq,en,cn}] }`
- `global_*` = 现有全局词典给的义(通常是**现代义**)。
- `occurrences` = 该词在鲁滨逊的**真实出处句**(英文 + 已定稿中译),judge 书中义就看这些。

## 第一步:判"留 or 跳"(**铁律 · 规则③**)
逐词看 occurrences,判断**鲁滨逊里的实际义 是否 ≠ 全局/现代义**:
- **书中义 = 现代义**(该词在本书就是现代常见用法)→ **跳过**,进 skipped,**不建行**。别为了建而建——覆盖表只装"义变了"的词,否则全局共享就废了。
  例:several 在本书多是"几个/数股"(= 现代义)→ 跳。still 在本书是"仍然"(= 现代义)→ 跳。
- **书中义 ≠ 现代义**(18世纪义)→ **建覆盖行**。
  例:want=缺乏(非"想要)、mean=中等的/粗劣的(非"意思是)、ancient=(指人)年老的(非"古老的)、sensible=能察觉的(非"明智的)。
- ⚠️ 若一个词在本书**多义并存**(如 ancient 有"年老的/船旗/古时的"几处),gloss 写并列、**书中主用义在前**,并在 note 里说清(见字段)。

## 第二步:建行字段(中英都贴书中义 · 书中义在前)
```json
{ "word": "want",
  "normalized": "want",                    // = 小写归一(去标点)
  "ipa": "/wɒnt/",
  "pos": "n./v.",
  "sense_key": "lack",
  "gloss_cn": "缺乏、缺少",                  // 【书中义·测试取这个】按 occurrences 判
  "gloss_en": "a lack or shortage of something",  // 【书中义·英文·测试取这个】务必也是书中义,别写现代义
  "archaic": true,
  "modern_cn": "想要",                      // 现代常见义(卡片补充显示)
  "modern_en": "to wish for or desire something",
  "example_en": "For want of tools, the work went slowly.",  // 新造·演示【书中义】·别抄 occurrences
  "example_cn": "由于缺乏工具,活儿进展缓慢。" }
```
- **gloss_cn / gloss_en 必须都是书中义**(Aaron 核心要求:测试取书中义,英文错了 English only 测试照样误导)。
- **modern_cn / modern_en = 现代义**(读者对照,知道"这词今天啥意思")。
- 末尾都不带句号;gloss 非描述式;例句新造演示书中义、别抄 occurrences;无脏字。
- 多义并存的词:gloss_cn/gloss_en 写并列("(指人)年老的;(航海)船旗"),书中主用义在前。

## 输出 —— 写 `scripts/library/books/sense-data/robinson-crusoe/out/batch<NN>.json`
```json
{ "batch": N,
  "rows": [ { 上面那些字段 }, … ],
  "skipped": ["several(本书=几个,同现代义)", "still(=仍然,同现代义)", …] }
```

## 写前自检
- 每行 gloss_cn/gloss_en/modern_cn/modern_en/ipa/pos/sense_key 非空;gloss 末尾无句号
- gloss_* 是**书中义**(对着 occurrences 核过),modern_* 是现代义,别搞反
- 跳过的词写清"本书=现代义"的理由
- JSON 可解析

写完只回一行:`batch<NN>: X rows (Y skipped)`。别贴 JSON。
