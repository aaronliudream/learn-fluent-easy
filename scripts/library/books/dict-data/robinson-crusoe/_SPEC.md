# 图书馆点词词典 · 词卡手写规范 — 鲁滨逊漂流记(Robinson Crusoe)

你为《鲁滨逊漂流记》(Defoe 1719)精读 App 手写 **点词词典卡(read-v1 word cards)**,面向中国英语学习者(读者档:青少年 12+)。这些词是书里出现、但全局词典**还没有**的"冷词"。仓库根 `C:/Projects/learn-fluent-easy-books`。

## 输入
用 Read 读你那批候选:`scripts/library/books/dict-data/robinson-crusoe/in/batch<NN>.json`
结构:`{ "batch": N, "words": [ { "w": "habitation", "f": 33, "ctx": "书中首次出现该词的句子片段" }, … ] }`
- `w` = 词(已小写、已归一);`f` = 在书中频次;`ctx` = 首次出现句(帮你定**书里用的是哪个义**)。

## 每个词:留 or 跳
**跳过(进 skipped[])**——不值得做卡的:
- 残留专名/地名/月份(候选已滤过大部分,漏网的如 caribbean/lat 之类)
- **太基础**、初中生已认识的词(impossible / supply / design / observe / secure / cabin / guns / rice / goods / nation / kid…)——点词无增益
- 纯数字/缩写残渣(viz 这类拉丁缩写可留但标注)

**留下做卡**——真正需要查的实词(名词/动词/形容词/副词,含书里的旧词但今天仍会遇到:habitation/deliverance/apprehensions/palisade/perusal…)。

## 卡片字段(严格照 read-v1 现有结构,别多别少)
```json
{ "word": "habitation",
  "ipa": "/ˌhæbɪˈteɪʃn/",              // 英式 RP,带斜杠。务必填,别留空(这是本轮重点:补齐音标)
  "pos": "n.",                          // 缩写:n. / v. / adj. / adv. / phrase / conj. / prep.
  "gloss_cn": "住所、居住地",            // 贴 ctx 里书中的义;多义只给书里这个义,简洁(≤12字)
  "ex_en": "They built a small habitation near the river.",   // 你新造的简单句,别抄 ctx
  "ex_cn": "他们在河边盖了个小住所。" }
```
- **gloss 定义**:先看 `ctx` 判断书里用哪个义,只给那个义。别堆多义。
- **ipa 必填**:英式音标,尽量准;拿不准也给最接近的,别空。
- **例句**:新造、短、日常、像小学教科书造句;**别抄 ctx**。
- 复数/变形词(goats、secured、canoes)照样出卡:gloss 可写"goat 的复数""secure 的过去式/过去分词",例句用该形态。

## 输出 —— 写 `scripts/library/books/dict-data/robinson-crusoe/out/batch<NN>.json`
```json
{ "batch": N,
  "cards": [ { "word","ipa","pos","gloss_cn","ex_en","ex_cn" }, … ],
  "skipped": ["impossible(太基础)", "caribbean(专名)", …] }
```

## 写文件前自检(硬要求)
- 每张卡 `ipa`/`pos`/`gloss_cn`/`ex_en`/`ex_cn` 都非空
- `word` 就是候选里的词(别改写、别换形态)
- `ex_en` 不等于该词的 `ctx`
- JSON 可解析

写完只回一行:`batch<NN>: X cards (Y skipped)`。别把 JSON 贴回来。
