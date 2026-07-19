# 图书馆词典 · 老卡增补规范(augment)— 鲁滨逊漂流记

你为《鲁滨逊漂流记》已上线的**老词典卡**补两个新字段(gloss_en + sense_key),**顺带标出"疑似释义偏窄"的卡**。仓库根 `C:/Projects/learn-fluent-easy-books`。**只加不改内容**。

## 输入(两个文件)
- `scripts/library/books/dict-data/robinson-crusoe/in/batch<NN>.json` → `words:[{w,f,ctx}]`(ctx=该词书中首次出处句)
- `scripts/library/books/dict-data/robinson-crusoe/out/batch<NN>.json` → `cards:[{word,ipa,pos,gloss_cn,ex_en,ex_cn}]`(现有 6 字段老卡)+ `skipped:[...]`

## 对每张 card 做两件事
### A. 补两个字段(**不改** word/ipa/pos/gloss_cn/ex_en/ex_cn)
- `gloss_en`:地道英语简释,**对应该卡现有的 gloss_cn(书中义)**;小写开头、**末尾无句号**、≤12 词、用简单词讲、别循环定义。
- `sense_key`:小写英文语义键(近义词同 key)。

### B. 判"疑似释义偏窄"(本轮重点)
拿该卡**现有的 gloss_cn** 回读该词的 `ctx`(书中出处句):
- **逻辑通不通**?该词在这句里的**对象/用法**,现 gloss_cn 覆盖得到吗?
- 若现 gloss_cn **只给了最常见的那个引申义、书里其实是另一个用法**(比 false-friend 更隐蔽)→ 记入 `suspect`。
- 反例教训(punctuate):"needed breath to punctuate the punches",对象是"一连串的捅",现释义"(讲话/文中)打断"→ 回读不通 → 该标。
- **只标不改**——释义改动由 Aaron/Web Claude 拍板。gloss_cn 一个字都别动。

## 输出 —— 覆写 `out/batch<NN>.json`
```json
{ "batch": N,
  "cards": [ { "word","ipa","pos","gloss_cn","gloss_en","sense_key","ex_en","ex_cn" }, … ],
  "skipped": [ …原样保留… ],
  "suspect": [ { "word","gloss_cn","ctx","issue":"哪里不贴/回读怎么不通","suggest":"建议改法" }, … ] }
```

## 写前自检
- 每张卡现在 **8 字段**齐(新增 gloss_en/sense_key)
- **gloss_cn / ex_en / ex_cn / word / ipa / pos 与原来逐字相同**(只加不改)
- gloss_en 小写开头、末尾无句号;sense_key 小写
- skipped 原样;JSON 可解析

写完只回一行:`batch<NN>: augmented X cards, Y suspect`。别贴 JSON。
