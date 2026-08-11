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
| ECDICT 中 `toefl` 打标条目 | 5040 |
| **清洗后入库词数** | **4972** |
| 跳过 · 含空格短语 | 2 |
| 跳过 · 专有名词(首字母大写) | 66 |
| 跳过 · 非纯字母 | 0 |
| 跳过 · 小写后重复 | 0 |
| 保留但 freq_rank 缺失(排序沉底) | 313 |
| 保留但 pos 缺失 | 22 |

> `vocab_banks.toefl.total_words` 目前填的是 8000,实际可用 4972。**要不要把 total_words 改成 4972?** 这个数会显示在词库中心的卡片上。

## 随机 50 词

| # | headword | pos | freq_rank |
| ---: | --- | --- | ---: |
| 1 | take | v./n. | 63 |
| 2 | black | n./adj. | 253 |
| 3 | law | n./v. | 287 |
| 4 | economy | n. | 645 |
| 5 | farm | n./v. | 1258 |
| 6 | daily | adj./adv./n. | 1483 |
| 7 | supreme | n./adj. | 1618 |
| 8 | wrap | n./v. | 2090 |
| 9 | existence | n. | 2213 |
| 10 | impose | v. | 2334 |
| 11 | protein | n./adj. | 2523 |
| 12 | employment | n. | 2534 |
| 13 | porch | n. | 3042 |
| 14 | shower | n./v. | 3204 |
| 15 | lap | n./v. | 3359 |
| 16 | related | adj. | 3391 |
| 17 | experimental | adj. | 3457 |
| 18 | skirt | n./v. | 3637 |
| 19 | tune | n./v. | 3646 |
| 20 | expertise | n. | 3898 |
| 21 | dynamic | adj./n. | 3978 |
| 22 | stadium | n. | 4128 |
| 23 | duration | n. | 5426 |
| 24 | triangle | n. | 5605 |
| 25 | elevate | v. | 6022 |
| 26 | appliance | n. | 6043 |
| 27 | tract | n. | 6133 |
| 28 | crisp | adj./v./n. | 6194 |
| 29 | contempt | n. | 6277 |
| 30 | inflict | v. | 6479 |
| 31 | volatile | adj./n. | 6603 |
| 32 | deter | v. | 6645 |
| 33 | scarce | adj. | 6771 |
| 34 | flicker | n./v. | 8044 |
| 35 | slate | n./adj./v. | 8061 |
| 36 | cycling | n. | 8200 |
| 37 | reckon | v. | 8525 |
| 38 | barren | adj./n. | 8809 |
| 39 | overlap | n./v. | 8870 |
| 40 | eradicate | v. | 9110 |
| 41 | chic | n./adj. | 9263 |
| 42 | paralyse | v. | 9462 |
| 43 | tonic | n./adj. | 12096 |
| 44 | subdue | v. | 12577 |
| 45 | checkup | n. | 12677 |
| 46 | rendezvous | n./v. | 12972 |
| 47 | pester | v. | 17263 |
| 48 | mannerism | n. | 17874 |
| 49 | slag | n./v. | 25329 |
| 50 | bitumen | n. | 35548 |

## batch1 预览(freq_rank 前 20,即最高频的 20 个托福词)

| # | headword | pos | freq_rank |
| ---: | --- | --- | ---: |
| 1 | in | prep./adv./adj./n. | 6 |
| 2 | on | prep./adv./adj. | 17 |
| 3 | say | v./n. | 19 |
| 4 | as | adv./prep./conj. | 33 |
| 5 | go | v./n. | 35 |
| 6 | get | v./n. | 39 |
| 7 | all | adj./adv./pron./n. | 43 |
| 8 | make | v./n. | 45 |
| 9 | one | n./pron./num./adj. | 51 |
| 10 | time | n./v./adj. | 52 |
| 11 | take | v./n. | 63 |
| 12 | come | v./int. | 70 |
| 13 | day | n. | 90 |
| 14 | give | n./v. | 98 |
| 15 | even | adj./v./adv./n. | 107 |
| 16 | back | adj./v./adv./n. | 108 |
| 17 | good | n./adj. | 110 |
| 18 | child | n. | 115 |
| 19 | may | n./aux. | 119 |
| 20 | call | n./v. | 122 |

## ⚠️ 首批 200 词怎么取 —— 需要你拍板

ECDICT 的 `toefl` 标签含义是"**这个词在托福里出现过**",不是"这个词是托福难度"。
所以严格按原指令"取 freq_rank 前 200"拿到的是**最简单的 200 个词**(见上表:can / way / well / even / down…),
给托福考生做词卡基本没价值 —— 这批词还要配 3 条例句 + 4 条音频,成本花在 A1 词上很亏。

各档过滤方案的**实测结果**:

| 方案 | 可选词池 | freq_rank 最高的 12 个词 |
| --- | ---: | --- |
| **A. 不过滤**(原指令:直接取前 200) | 4659 | in, on, say, as, go, get, all, make, one, time, take, come |
| B. 排除 `zk`(中考) | 4051 | case, system, program, million, issue, power, political, community, best, guy, process, local |
| C. 排除 `zk` `gk`(中考+高考) | 2984 | program, issue, community, best, guy, economic, center, site, image, source, opportunity, congress |
| **D. 排除 `zk` `gk` `cet4`**(中考+高考+四级) | 1993 | best, center, environmental, cultural, york, attorney, client, sales, terms, context, united, grab |
| E. 排除 `zk` `gk` `cet4` `cet6` | 1081 | best, center, cultural, york, sales, terms, united, educational, regional, gender, coverage, fishing |

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
1. **词表本身**:上面 50 词是不是托福该有的样子?有没有明显不该在托福库里的?
2. **屈折形是否算独立词条**:ECDICT 把 `abandon` / `abandoned` / `abandonment` 都打了 toefl 标,本脚本**全部保留**为独立词条(`abandoned` 有独立的形容词义"被抛弃的",托福词表通常也这么收)。如果你要按原形合并,说一声,清洗规则加一条即可。
3. **total_words 要不要从 8000 改成 4972**(这个数会显示在词库中心的卡片上)。
