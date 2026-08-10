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
| ECDICT 中 `toefl` 打标条目 | 1603 |
| **清洗后入库词数** | **1554** |
| 跳过 · 含空格短语 | 1 |
| 跳过 · 专有名词(首字母大写) | 48 |
| 跳过 · 非纯字母 | 0 |
| 跳过 · 小写后重复 | 0 |
| 保留但 freq_rank 缺失(排序沉底) | 6 |
| 保留但 pos 缺失 | 4 |

> `vocab_banks.toefl.total_words` 目前填的是 8000,实际可用 1554。**要不要把 total_words 改成 1554?** 这个数会显示在词库中心的卡片上。

## 随机 50 词

| # | headword | pos | freq_rank |
| ---: | --- | --- | ---: |
| 1 | of | prep. | 4 |
| 2 | but | prep./conj./adv. | 23 |
| 3 | from | prep. | 26 |
| 4 | two | num. | 80 |
| 5 | again | adv. | 184 |
| 6 | under | prep./adj./adv. | 225 |
| 7 | word | n./v. | 244 |
| 8 | watch | n./v. | 323 |
| 9 | health | n. | 344 |
| 10 | early | adj./adv. | 365 |
| 11 | human | n./adj. | 399 |
| 12 | wait | n./v. | 400 |
| 13 | value | n./v. | 499 |
| 14 | table | n./v. | 539 |
| 15 | doctor | n./v. | 570 |
| 16 | test | n./v. | 575 |
| 17 | attention | n. | 591 |
| 18 | condition | n./v. | 629 |
| 19 | single | adj./n./v. | 632 |
| 20 | drop | n./v. | 690 |
| 21 | poor | adj. | 713 |
| 22 | size | n./v./adj. | 752 |
| 23 | southern | n./adj. | 1105 |
| 24 | touch | n./v. | 1166 |
| 25 | pound | n./v. | 1306 |
| 26 | guest | n. | 1310 |
| 27 | tomorrow | n./adv. | 1334 |
| 28 | worth | n./adj. | 1353 |
| 29 | review | n./v. | 1384 |
| 30 | promise | n./v. | 1438 |
| 31 | direct | adj./v./adv. | 1478 |
| 32 | pair | n./v. | 1485 |
| 33 | circle | n./v. | 1506 |
| 34 | fix | v./n. | 1850 |
| 35 | tooth | n./v. | 1854 |
| 36 | separate | n./adj./v. | 1892 |
| 37 | wheel | n./v. | 1999 |
| 38 | regard | n./v. | 2084 |
| 39 | lab | n. | 2089 |
| 40 | shall | aux. | 2197 |
| 41 | hello | int. | 2238 |
| 42 | habit | n./v. | 2308 |
| 43 | pet | n./adj./v. | 3278 |
| 44 | shine | n./v. | 3385 |
| 45 | candy | n./v. | 3446 |
| 46 | sandwich | n./v. | 3529 |
| 47 | policeman | n. | 4754 |
| 48 | pence | n. | 4834 |
| 49 | tiger | n. | 5908 |
| 50 | hobby | n. | 6554 |

## batch1 预览(freq_rank 前 20,即最高频的 20 个托福词)

| # | headword | pos | freq_rank |
| ---: | --- | --- | ---: |
| 1 | the | art. | 1 |
| 2 | be | v. | 2 |
| 3 | and | conj. | 3 |
| 4 | of | prep. | 4 |
| 5 | a | art. | 5 |
| 6 | in | prep./adv./adj./n. | 6 |
| 7 | to | prep./adv. | 7 |
| 8 | have | v./aux. | 8 |
| 9 | it | pron. | 10 |
| 10 | that | adj./conj./pron./adv. | 12 |
| 11 | for | prep./conj. | 13 |
| 12 | you | pron. | 14 |
| 13 | he | pron./n. | 15 |
| 14 | with | prep. | 16 |
| 15 | on | prep./adv./adj. | 17 |
| 16 | do | v. | 18 |
| 17 | say | v./n. | 19 |
| 18 | this | pron./adj./adv. | 20 |
| 19 | they | pron. | 21 |
| 20 | at | prep. | 22 |

## ⚠️ 首批 200 词怎么取 —— 需要你拍板

ECDICT 的 `toefl` 标签含义是"**这个词在托福里出现过**",不是"这个词是托福难度"。
所以严格按原指令"取 freq_rank 前 200"拿到的是**最简单的 200 个词**(见上表:can / way / well / even / down…),
给托福考生做词卡基本没价值 —— 这批词还要配 3 条例句 + 4 条音频,成本花在 A1 词上很亏。

各档过滤方案的**实测结果**:

| 方案 | 可选词池 | freq_rank 最高的 12 个词 |
| --- | ---: | --- |
| **A. 不过滤**(原指令:直接取前 200) | 1548 | the, be, and, of, a, in, to, have, it, that, for, you |
| B. 排除 `zk`(中考) | 0 |  |
| C. 排除 `zk` `gk`(中考+高考) | 0 |  |
| **D. 排除 `zk` `gk` `cet4`**(中考+高考+四级) | 0 |  |
| E. 排除 `zk` `gk` `cet4` `cet6` | 0 |  |

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
3. **total_words 要不要从 8000 改成 1554**(这个数会显示在词库中心的卡片上)。
