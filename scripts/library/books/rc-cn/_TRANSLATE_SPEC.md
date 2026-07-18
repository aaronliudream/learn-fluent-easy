# 鲁滨逊漂流记 · 英译中规范(公版 Robinson Crusoe, Defoe 1719)

你为该书某一章做**英译中**,供中国青少年精读 App 逐句对照。仓库根 C:/Projects/learn-fluent-easy-books。

## 取本章句子(把 <N> 换成你的章号)
node -e 'const b=require("./scripts/library/books/robinson-crusoe.json");const s=b.chapters.find(c=>c.idx===<N>).paragraphs.flat();console.log("本章 "+s.length+" 句");s.forEach((x,i)=>console.log("["+i+"] "+x.en));'

## 翻译要求
- **逐句 1:1**:第 i 句英文 → 第 i 条中文。数量、顺序**完全一致**,绝不合并/拆分/增删句子。
- **语气**:忠实、自然、青少年(12+)可读的古典冒险名著中文;清楚流畅、好朗读;不幼稚、不生硬文绉绉;句子别太长。
- **专有名词固定译名**(跨章一致):Robinson Crusoe→鲁滨逊·克鲁索、Robinson→鲁滨逊、Crusoe→克鲁索、Friday→星期五、Xury→佐立、Sallee→萨累、Moors→摩尔人、Brazil(s)→巴西、Yarmouth→雅茅斯、Hull→赫尔、York→约克、Spaniard(s)→西班牙人、Portuguese→葡萄牙人。
- 对话引号保留(中文引号)。旧式长句可切成通顺短句,但**中文条数仍= 英文句数**(1 英 1 中)。

## 输出
写 JSON 到 scripts/library/books/rc-cn/ch<N>.json = **纯中文译文数组**,长度=本章句数,顺序对齐:
["第0句译文","第1句译文", ...]

## 写前自检(硬要求)
- 数组长度 === 本章句数(node 报的数);不等=错,回去对齐。
- 每条非空、是中文。JSON 可解析。

写完只回一行:`ch<N>: 译好 X/X 句`。别把译文贴回来。
