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

## 卡片字段(read-v1 结构 · 本轮新增 gloss_en + sense_key)
```json
{ "word": "habitation",
  "ipa": "/ˌhæbɪˈteɪʃn/",              // 英式 RP,带斜杠。务必填,别留空
  "pos": "n.",                          // 缩写:n. / v. / adj. / adv. / phrase / conj. / prep.
  "gloss_cn": "住所、居住地",            // 贴 ctx 里书中的义;多义只给书里这个义,简洁(≤12字)
  "gloss_en": "a place where someone lives",   // 【新增】英语简释,给"English only"复习当题干
  "sense_key": "dwelling",              // 【新增】小写英文语义键,复习干扰项护栏用(见下)
  "ex_en": "They built a small habitation near the river.",   // 你新造的简单句,别抄 ctx
  "ex_cn": "他们在河边盖了个小住所。" }
```
- **gloss_cn 定义**:先看 `ctx` 判断书里用哪个义,只给那个义。别堆多义。**禁描述式**("一种…的动物/工具")——直接给对应中文词(perch→河鲈,不是"一种鱼");**末尾不带句号**;别机翻腔生硬。
- ⚠️⚠️ **18世纪古今义不同(false-friend)—— 本书铁律**:Defoe 是 1719 年英语,**很多词今天还在用、但义变了**。**必须对着 `ctx` 判该给哪个义,绝不默认现代义**——给错义读者会理解错整句。常见雷(看到务必按 ctx 核):`want`=缺乏(非"想要)、`mean`=中等的/粗劣的(非"意思是)、`ancient`=(指人)年老的/(航海)船旗(非只"古老的)、`sensible`=能察觉的/意识到的、`prevent`=(有时)先于/预先、`artificial`=巧妙的、`conversation`=交往/为人、`suffer`=容许、`own`=(动词)承认、`presently`=不久/当即、`nice`=精细/挑剔、`several`=各自的、`generous`=高贵的、`mere`=纯粹的、`sad`=严肃的。**拿不准就贴 ctx 里的实际义,别猜现代义**。
- **gloss_en 【新增·本轮重点】**:一句**地道**英语释义(给英英复习当题干)。要求:小写开头、**末尾不带句号**、≤12 词、别用生僻词解生僻词(用简单词讲)、贴书中义(和 gloss_cn 同一个义)。例:deliverance→"the act of being rescued or set free"。
- **sense_key 【新增】**:一个**小写英文单词/短横短语**,概括核心语义,给复习出题时"排除近义干扰"用(同 sense_key 的词不会互为选项)。近义词给同一个 key:habitation/dwelling/abode→`dwelling`;rescue/deliverance→`rescue`;afraid/frightened→`fear`。拿不准就用该词最核心的英文近义词。
- **ipa 必填**:英式音标,尽量准;拿不准也给最接近的,别空。
- **例句**:新造、短、日常、像小学教科书造句;**别抄 ctx**;无脏字。
- **'s / 缩写**:所有格 `'s`(sailor's)不当独立词收;缩写(don't)判准词形。
- 复数/变形词(goats、secured)照样出卡:gloss 可写"goat 的复数""secure 的过去式",例句用该形态。

## 输出 —— 写 `scripts/library/books/dict-data/robinson-crusoe/out/batch<NN>.json`
```json
{ "batch": N,
  "cards": [ { "word","ipa","pos","gloss_cn","gloss_en","sense_key","ex_en","ex_cn" }, … ],
  "skipped": ["impossible(太基础)", "caribbean(专名)", …] }
```

## 写文件前自检(硬要求)
- 每张卡 `ipa`/`pos`/`gloss_cn`/`gloss_en`/`sense_key`/`ex_en`/`ex_cn` 都非空
- `gloss_cn` 与 `gloss_en` **末尾都不带句号**;gloss_cn 非描述式;gloss_en 小写开头
- `word` 就是候选里的词(别改写、别换形态)
- `ex_en` 不等于该词的 `ctx`
- JSON 可解析

写完只回一行:`batch<NN>: X cards (Y skipped)`。别把 JSON 贴回来。

写完只回一行:`batch<NN>: X cards (Y skipped)`。别把 JSON 贴回来。
