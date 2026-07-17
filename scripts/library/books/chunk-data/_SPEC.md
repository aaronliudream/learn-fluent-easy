# 图书馆语块(chunk)手抽规范 — Tom Sawyer

你为《汤姆·索亚历险记》某章手抽高价值 **language chunks(语块)**,面向中国英语学习者的精读 App。这是人工判断的**读+挑**任务(**不是**机器抽取)。仓库根 `C:/Projects/learn-fluent-easy-books`。

## 读该章
`node -e 'const b=require("./scripts/library/books/tom-sawyer.json");let s=0;for(const ch of b.chapters)for(const p of ch.paragraphs)for(const x of p){s++;if(s>=<A>&&s<=<B>)console.log("["+s+"] "+x.en)}'`
(把 `<A> <B>` 换成你那章的 seq 范围;正文长可分两段跑)

## 收(collect)—— 可迁移的多词单位,读者别处还会遇到、能自己用出来
- 短语动词:look after / give up / put off / run away / turn out
- 惯用固定表达:at once / after all / make fun of / by and by / make up one's mind
- 强搭配/连接语:pay attention to / in order to / lose one's temper / catch sight of
判据:**可迁移**("学了别处还会遇到、还能自己用")。**宁缺毋滥**——按章长挑 ~10–25(短章少、长章多),质量优先。

## 不收(skip)—— 记进 skipped 数组
- 专名/人名(Aunt Polly / Injun Joe / Muff Potter / Cardiff Hill / Becky)
- 一次性描述性组合(gray prairie / board fence)
- 重方言拼写表面形(warn't / 'low / dasn't / gwine / a body / becuz / spunk-water)——迁移弱
- 拟声/一次性喊话(Ting-a-ling-ling / 航海令)
- 一次性文学/古语/迷信惯语,读者见一次不能复用(hove in sight / girded up his loins)→ 归难句层,**不当 chunk**
- 太基础/纯语法(going to / of course / full of / according to)除非确是有用定式

## 表面形规则(关键——下划线靠对正文的精确连续匹配)
每个出现处记**实际出现的表面形**(小写),且必须是该句里**连续**的词串(屈折形 OK:"gave up"/"looking out for")。若该 chunk 在句中被词**隔开**(如 "make a world of fun of him" 之于 "make fun of")→ 无法连续下划线 → 标 `cardOnly`(只入词典卡、本章不画虚线)。

## 例句规则(关键——绝不能重蹈覆辙)
`ex_en`/`ex_cn` = 你**新造**的一个简单句演示该 chunk。**铁律:绝不复制/改写正文出处句**(读者正读那句;且 Twain 句子长难)。要短、日常、像小学教科书造句,只突出这个 chunk 怎么用。若 chunk 多义,例句贴**本章**用的那个义。

## literal(逐词)
每个组成词 `{word, meaning_cn, note_cn?}`。`note_cn` **仅**在该词此处义**不透明/异于常见义**时给(如 draw 在 draw near = "(此处)渐渐移动",note "非'画/拉'义";fool 在 fool with = "胡闹",非"傻瓜")。透明词不给 note_cn。

## 输出 —— 写 JSON 到 `scripts/library/books/chunk-data/ch<N>.json`,精确结构:
```json
{
  "chapter": <N>,
  "chunks": [
    { "head": "look out for", "gloss": "提防、留意", "ipa": "/lʊk aʊt fɔːr/",
      "note": "look out for sb/sth = 小心提防。",
      "literal": [{"word":"look out","meaning_cn":"当心、提防"},{"word":"for","meaning_cn":"盯着、为了"}],
      "ex_en": "Look out for cars when you cross the street.", "ex_cn": "过马路时当心车。",
      "occ": [[<seq>,"looking out for"]] },
    { "head": "make fun of", "gloss":"取笑、拿…开玩笑", "ipa":"/meɪk fʌn əv/",
      "note":"本章出处为分离式,故 card-only。",
      "literal":[{"word":"make","meaning_cn":"做出"},{"word":"fun","meaning_cn":"取乐"},{"word":"of","meaning_cn":"拿…(取乐)"}],
      "ex_en":"The kids made fun of his funny hat.", "ex_cn":"孩子们取笑他那顶滑稽的帽子。",
      "cardOnly": true, "key":"make fun of", "exSeq": <seq> }
  ],
  "skipped": ["方言块 e.g. …", "拟声", "一次性文学惯语 e.g. …"]
}
```

## 质量样板(ch1/ch2 定稿,照此水准)
- play hookey → 逃学; ex "The boys decided to play hookey and go fishing."; literal play=玩(此处非"玩"), hookey=逃学(旧俚,几乎只用在此搭配)
- pay attention to → ex "Pay attention to the teacher."
- after all → 毕竟、终究; ex "Don't be angry—he's only a child, after all."
- make up one's mind → 下定决心; ex "She made up her mind to study harder."

## 写文件前自检(硬要求)
- 每个非 cardOnly 的 surface,小写后**逐字连续**出现在其 seq 句里
- 每个 `ex_en` **不等于**任何出处句;gloss 与例句义一致
- JSON 可解析

写完 `ch<N>.json` 后,只回一行:`ch<N>: X chunks (Y cardOnly)`。别把 JSON 贴回来。
