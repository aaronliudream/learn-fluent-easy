# 图书馆语块(chunk)手抽规范 — 鲁滨逊漂流记(Robinson Crusoe)

你为《鲁滨逊漂流记》(Defoe, 1719)某章手抽高价值 **language chunks(语块)**,面向中国英语学习者的精读 App(读者档:青少年 12+)。这是人工判断的**读+挑**任务(**不是**机器抽取)。仓库根 `C:/Projects/learn-fluent-easy-books`。

## 读该章
`node -e 'const b=require("./scripts/library/books/robinson-crusoe.json");let s=0;for(const ch of b.chapters)for(const p of ch.paragraphs)for(const x of p){s++;if(s>=<A>&&s<=<B>)console.log("["+s+"] "+x.en)}'`
(把 `<A> <B>` 换成你那章的 seq 范围;正文长可分两段跑)

## 收(collect)—— 可迁移的多词单位,读者别处还会遇到、能自己用出来
- 短语动词:set sail / give over / take notice of / put to sea / carry on / lay up / break out / come ashore
- 惯用固定表达:in order to / by degrees / make haste / take care of / at length / in the meantime / of late / take pains
- 强搭配/连接语:take notice of / a great deal of / for the most part / on shore / put an end to
判据:**可迁移且今天仍用得上**("学了别处还会遇到、还能自己用")。**宁缺毋滥**——按章长挑 ~10–22(短章少、长章多),质量优先。

## 不收(skip)—— 记进 skipped 数组
- 专名/人名/地名(Crusoe / Friday / Xury / Sallee / the Brazils / Yarmouth / the Moors)
- 一次性描述性组合、纯物件名(nautical 一次性硬词:larboard / boltsprit / the offing / a road〔锚地〕)
- **18世纪古语/生僻词**,读者今天基本用不到:thither / hither / whither / betwixt / methought / durst / hath / thence / hitherto / an〔=if〕—— 迁移弱,归难句层不当 chunk
- 一次性文学/宗教/道德训诫套语(读一次即可,不能自造复用)e.g. "Providence had ordered" / "the wild Zee"
- 太基础/纯语法(going to / of course / a lot of)除非确是有用定式
- ⚠️ **过时惯用语要克制**:come to pass / by and by / a great while〔很久〕这类虽是固定表达但已陈旧 —— 若今天口语/写作几乎不用,归 skip;拿不准就 skip(质量优先)

## 表面形规则(关键——下划线靠对正文的精确连续匹配)
每个出现处记**实际出现的表面形**(小写),且必须是该句里**连续**的词串(屈折形 OK:"set sail"/"setting sail"/"took notice of")。若该 chunk 在句中被词**隔开**(如 "take particular notice of" 之于 "take notice of")→ 无法连续下划线 → 标 `cardOnly`(只入词典卡、本章不画虚线),给 `key` 和 `exSeq`。

## 例句规则(关键——绝不能重蹈覆辙)
`ex_en`/`ex_cn` = 你**新造**的一个简单句演示该 chunk。**铁律:绝不复制/改写正文出处句**(读者正读那句;且 Defoe 句子长而正式)。要短、日常、像小学教科书造句,只突出这个 chunk 怎么用。若 chunk 多义,例句贴**本章**用的那个义。

## literal(逐词)
每个组成词 `{word, meaning_cn, note_cn?}`。`note_cn` **仅**在该词此处义**不透明/异于常见义**时给(如 give 在 give over = "(此处)停止、放弃",note "非'给'义";lay 在 lay up = "储存、搁置")。透明词不给 note_cn。

## 输出 —— 写 JSON 到 `scripts/library/books/chunk-data/robinson-crusoe/ch<N>.json`,精确结构:
```json
{
  "chapter": <N>,
  "chunks": [
    { "head": "set sail", "gloss": "起航、扬帆出发", "ipa": "/set seɪl/",
      "note": "set sail (for …) = 启航前往某地。",
      "literal": [{"word":"set","meaning_cn":"张起、开始"},{"word":"sail","meaning_cn":"帆"}],
      "ex_en": "The ship set sail for India at dawn.", "ex_cn": "船在黎明时起航前往印度。",
      "occ": [[<seq>,"set sail"]] },
    { "head": "take notice of", "gloss":"注意到、留意", "ipa":"/teɪk ˈnoʊtɪs əv/",
      "note":"本章出处为分离式(take particular notice of),故 card-only。",
      "literal":[{"word":"take","meaning_cn":"加以"},{"word":"notice","meaning_cn":"注意","note_cn":"名词'注意'"},{"word":"of","meaning_cn":"对…"}],
      "ex_en":"Nobody took notice of the small boat.", "ex_cn":"没人注意到那只小船。",
      "cardOnly": true, "key":"take notice of", "exSeq": <seq> }
  ],
  "skipped": ["古语 e.g. thither/durst/methought", "一次性 nautical e.g. larboard", "宗教训诫套语 e.g. …"]
}
```

## 质量样板(照此水准)
- by degrees → 逐渐、一点一点地; ex "By degrees the room grew warm."; literal by=按照(此处非"被"), degrees=程度(此处"阶段")
- make haste → 赶快、急忙; ex "We must make haste or we'll miss the bus."
- take care of → 照料、照顾; ex "She takes care of her little brother after school."
- in order to → 为了; ex "He got up early in order to catch the train."

## 写文件前自检(硬要求)
- 每个非 cardOnly 的 surface,小写后**逐字连续**出现在其 seq 句里(可先跑上面的读章命令核对)
- 每个 `ex_en` **不等于**任何出处句;gloss 与例句义一致
- JSON 可解析

写完 `ch<N>.json` 后,只回一行:`ch<N>: X chunks (Y cardOnly)`。别把 JSON 贴回来。
