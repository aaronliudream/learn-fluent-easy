# 图书馆章节插图 · 选景规范 — 鲁滨逊漂流记(Robinson Crusoe)

你为《鲁滨逊漂流记》(Defoe 1719)精读 App 的**某一章挑 6 个可作画的关键场景**,供 AI 出水彩插图。你只负责**选景 + 写清画什么**;统一画风/人物设定由汇编脚本注入,你别写风格。仓库根 `C:/Projects/learn-fluent-easy-books`。

## 读该章
`node -e 'const b=require("./scripts/library/books/robinson-crusoe.json");let s=0;for(const ch of b.chapters)for(const p of ch.paragraphs)for(const x of p){s++;if(s>=<A>&&s<=<B>)console.log("["+s+"] "+x.en)}'`
(把 `<A> <B>` 换成你那章的 seq 范围)

## 选 6 景(硬要求)
- **必须是本章真实发生的事/出现的场景**——读文本,别编;别把别的章的情节挪进来。
- **按阅读顺序**沿章铺开(开头/发展/高潮各有),别 6 张全挤在一段。
- **画面各异**:远景全景 / 人物近景动作 / 风景地标 / 物件特写 交替,别 6 张同一构图。
- 每景可作画、具体、有画面感(一个明确动作或一处明确场景),不要抽象心理描写。
- 记下该景所依据的**句 seq**(那句话所在,供插图定位)。

## 每景给这几项(别写画风/人物长相,脚本会统一加)
- `k`:1–6(章内顺序)
- `slug`:短横杠英文,3–5 词,概括画面(如 `footprint-in-sand`)
- `seq`:该场景对应的句 seq(整数)
- `scene`:**画什么**,1–2 句具体英文——谁、在做什么、在哪、关键物件。只写这一画面的内容,不写 "watercolor"/"no text"/人物长相(脚本统一加)。
- `alt`:一句英文 alt 文本(无障碍/入库用),平实描述画面。

## 输出 —— 写 `scripts/library/books/illus-data/robinson-crusoe/ch<N>.json`
```json
{ "chapter": <N>,
  "images": [
    { "k":1, "slug":"ship-leaves-harbour", "seq":12,
      "scene":"Young Robinson boards a three-masted sailing ship at a crowded English harbour quay, his bag in hand, waving back at the shore.",
      "alt":"A young man boards a sailing ship at a busy harbour." },
    … 共 6 条 …
  ] }
```

## 写文件前自检
- 正好 6 景;seq 都在本章范围内;scene/alt/slug 非空;JSON 可解析;6 景是本章真实情节且画面各异。

写完只回一行:`ch<N>: 6 scenes`。别贴 JSON。
