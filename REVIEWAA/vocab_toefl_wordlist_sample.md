# 托福词表 · 送审样本

> 生成: `node scripts/vocab/ingest-toefl.mjs` · 抽样种子固定(20260803),复跑抽到的是同 50 词。

## 数据来源与授权

| 项 | 值 |
| --- | --- |
| 仓库 | [skywind3000/ECDICT](https://github.com/skywind3000/ECDICT) |
| 文件 | `ecdict.csv`(770,611 行) |
| 授权 | **MIT License, Copyright (c) 2025 Linwei** |
| 核实 | 2026-08-03 经 GitHub API 确认 `license.spdx_id === "MIT"` |

**被否掉的候选源**:`kajweb/dict`、`mahavivo/english-wordlists` 两个仓库 `license` 字段均为 `null`(无授权声明),按"确认 license 后才可用"弃用。

**词频来源**:同一份 ECDICT 自带 `frq`(COCA 当代语料库排名)与 `bnc`(英国国家语料库排名),故未再引第三方词频表。取值 `frq > 0 ? frq : (bnc > 0 ? bnc : 空)`。

## 总量

| 指标 | 数量 |
| --- | ---: |
| ECDICT 中 `toefl` 打标条目 | 6974 |
| **清洗后入库词数** | **6955** |
| 跳过 · 含空格短语 | 4 |
| 跳过 · 专有名词(首字母大写) | 15 |
| 跳过 · 非纯字母 | 0 |
| 跳过 · 小写后重复 | 0 |
| 保留但 freq_rank 缺失(排序沉底) | 127 |
| 保留但 pos 缺失 | 53 |

> `vocab_banks.toefl.total_words` 目前填的是 8000,实际可用 6955。**要不要把 total_words 改成 6955?** 这个数会显示在词库中心的卡片上。

## 随机 50 词

| # | headword | pos | freq_rank |
| ---: | --- | --- | ---: |
| 1 | stand | n./v. | 281 |
| 2 | private | adj./n. | 672 |
| 3 | deal | n./v. | 674 |
| 4 | associate | n./v. | 1354 |
| 5 | practical | adj. | 2281 |
| 6 | fiber | n. | 2594 |
| 7 | strip | n./v. | 2754 |
| 8 | colonial | adj. | 3321 |
| 9 | reverse | n./adj./v. | 3497 |
| 10 | tune | n./v. | 3646 |
| 11 | oral | n./adj. | 3875 |
| 12 | endorse | v. | 3884 |
| 13 | stimulus | n. | 4525 |
| 14 | authorize | v. | 4767 |
| 15 | delicious | adj. | 4985 |
| 16 | commentary | n. | 5032 |
| 17 | shiny | adj. | 5128 |
| 18 | grind | n./v. | 5372 |
| 19 | congressman | n. | 5390 |
| 20 | wit | n. | 5755 |
| 21 | inhabitant | n. | 5914 |
| 22 | fracture | n./v. | 6123 |
| 23 | blaze | n./v. | 8056 |
| 24 | overtime | n./adj./adv./v. | 8317 |
| 25 | accomplished | adj. | 8941 |
| 26 | factual | adj. | 8973 |
| 27 | tutor | n./v. | 9093 |
| 28 | expansive | adj. | 9197 |
| 29 | extinct | adj. | 9357 |
| 30 | maritime | adj. | 9625 |
| 31 | turbulent | adj. | 9806 |
| 32 | humorous | adj. | 9877 |
| 33 | invaluable | adj. | 10081 |
| 34 | recital | n. | 11952 |
| 35 | adjoining | adj. | 11972 |
| 36 | interdependence | n. | 12165 |
| 37 | millimeter | n. | 12635 |
| 38 | absentee | n. | 13021 |
| 39 | courier | n. | 13082 |
| 40 | laurel | n./v. | 13523 |
| 41 | persevere | v. | 13798 |
| 42 | emphatic | adj. | 14058 |
| 43 | ablaze | adj./adv. | 16903 |
| 44 | cog | n./v. | 17219 |
| 45 | chateau | n. | 17389 |
| 46 | valor | n. | 17697 |
| 47 | downcast | adj. | 21594 |
| 48 | subtraction | n. | 21980 |
| 49 | conversant | adj. | 25681 |
| 50 | eclecticism | n. | 27332 |

## batch1 预览(freq_rank 前 20,即最高频的 20 个托福词)

| # | headword | pos | freq_rank |
| ---: | --- | --- | ---: |
| 1 | can | v./n./aux. | 37 |
| 2 | way | n./adv. | 84 |
| 3 | well | n./v./adj./adv./int. | 100 |
| 4 | even | adj./v./adv./n. | 107 |
| 5 | down | adj./adv./prep./n. | 118 |
| 6 | still | n./v./adj./adv./conj. | 126 |
| 7 | mean | adj./v./n. | 154 |
| 8 | company | n./v. | 189 |
| 9 | system | n. | 191 |
| 10 | issue | n./v. | 248 |
| 11 | head | n./v./adj. | 251 |
| 12 | long | adj./v./adv./n. | 254 |
| 13 | house | n./v. | 257 |
| 14 | provide | v. | 262 |
| 15 | stand | n./v. | 281 |
| 16 | community | n. | 296 |
| 17 | team | n./v. | 307 |
| 18 | minute | n./v./adj. | 308 |
| 19 | lead | n./v./adj. | 318 |
| 20 | understand | v. | 320 |

## ⚠️ 首批 200 词怎么取 —— 需要你拍板

ECDICT 的 `toefl` 标签含义是"**这个词在托福里出现过**",不是"这个词是托福难度"。
所以严格按原指令"取 freq_rank 前 200"拿到的是**最简单的 200 个词**(见上表:can / way / well / even / down…),
给托福考生做词卡基本没价值 —— 这批词还要配 3 条例句 + 4 条音频,成本花在 A1 词上很亏。

各档过滤方案的**实测结果**:

| 方案 | 可选词池 | freq_rank 最高的 12 个词 |
| --- | ---: | --- |
| **A. 不过滤**(原指令:直接取前 200) | 6828 | can, way, well, even, down, still, mean, company, system, issue, head, long |
| B. 排除 `zk`(中考) | 6494 | system, issue, community, process, actually, effect, former, major, economic, military, federal, tax |
| C. 排除 `zk` `gk`(中考+高考) | 5389 | issue, community, actually, economic, military, federal, site, image, realize, opportunity, congress, current |
| **D. 排除 `zk` `gk` `cet4`**(中考+高考+四级) | 4349 | defense, democrat, attorney, participant, concerned, involved, neighbor, context, voter, grab, theater, regional |
| E. 排除 `zk` `gk` `cet4` `cet6` | 3278 | defense, democrat, concerned, involved, neighbor, voter, theater, regional, opposition, coverage, honor, remaining |

**我的建议是 D**:剔掉中考/高考/四级已覆盖的词之后,首批变成
defense / attorney / participant / context / regime / perception 这一档 —— 明显是托福该练的词,
而且仍然按词频排序,不是随机挑难词。

**当前交付的 `SQLAA/vocab_toefl_words_batch1.sql` 走的是方案 A(严格按原指令)。**
你要是选 D,我重跑一条命令就换掉,不用改任何代码:

```
node scripts/vocab/ingest-toefl.mjs --exclude-tags=zk,gk,cet4 --emit-sql
```


## 请 Aaron 确认四件事

1. **⚠️ 首批取哪 200 词**(见上面的对比表,这条最要紧)。
2. **词表本身**:上面 50 词是不是托福该有的样子?有没有明显不该在托福库里的?
3. **屈折形是否算独立词条**:ECDICT 把 `abandon` / `abandoned` / `abandonment` 都打了 toefl 标,本脚本**全部保留**为独立词条(`abandoned` 有独立的形容词义"被抛弃的",托福词表通常也这么收)。如果你要按原形合并,说一声,清洗规则加一条即可。
4. **total_words 要不要从 8000 改成 6955**。
