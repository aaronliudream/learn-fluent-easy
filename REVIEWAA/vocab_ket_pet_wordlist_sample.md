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
| ECDICT 中 `toefl` 打标条目 | 5361 |
| **清洗后入库词数** | **3049** |
| 跳过 · 含空格短语 | 1 |
| 跳过 · 专有名词(首字母大写) | 112 |
| 跳过 · 非纯字母 | 2 |
| 跳过 · 小写后重复 | 0 |
| 保留但 freq_rank 缺失(排序沉底) | 0 |
| 保留但 pos 缺失 | 1 |

> `vocab_banks.toefl.total_words` 目前填的是 8000,实际可用 3049。**要不要把 total_words 改成 3049?** 这个数会显示在词库中心的卡片上。

## 随机 50 词

| # | headword | pos | freq_rank |
| ---: | --- | --- | ---: |
| 1 | to | prep./adv. | 7 |
| 2 | make | v./n. | 45 |
| 3 | time | n./v./adj. | 52 |
| 4 | same | adj./pron./adv. | 161 |
| 5 | reason | n./v. | 359 |
| 6 | six | num. | 424 |
| 7 | voice | n./v. | 465 |
| 8 | brother | n. | 614 |
| 9 | involve | v. | 656 |
| 10 | nature | n. | 696 |
| 11 | occur | v. | 756 |
| 12 | ready | n./adj./adv./v. | 758 |
| 13 | contain | v. | 931 |
| 14 | instead | adv. | 994 |
| 15 | finger | n./v. | 1042 |
| 16 | shot | n./v./adj. | 1053 |
| 17 | audience | n. | 1074 |
| 18 | safety | n./v. | 1132 |
| 19 | troop | n./v. | 1137 |
| 20 | scale | n./v. | 1223 |
| 21 | farm | n./v. | 1258 |
| 22 | earn | v. | 1305 |
| 23 | notion | n. | 1714 |
| 24 | ourselves | pron. | 1766 |
| 25 | requirement | n. | 1885 |
| 26 | somewhat | n./adv. | 1897 |
| 27 | busy | adj./v. | 1924 |
| 28 | oppose | v. | 1945 |
| 29 | apart | adv./adj. | 1971 |
| 30 | succeed | v. | 2018 |
| 31 | gay | adj. | 2056 |
| 32 | illegal | adj. | 2071 |
| 33 | metre | n. | 2099 |
| 34 | bury | v. | 2398 |
| 35 | butter | n./v. | 2402 |
| 36 | belt | n. | 2430 |
| 37 | apparent | adj. | 2502 |
| 38 | substantial | n./adj. | 2544 |
| 39 | advise | v. | 2552 |
| 40 | chemical | n./adj. | 2617 |
| 41 | spin | n./v. | 2644 |
| 42 | tissue | n. | 2688 |
| 43 | crack | n./v./adj./adv. | 3008 |
| 44 | reservation | n. | 3046 |
| 45 | fabric | n. | 3059 |
| 46 | loud | adj./adv. | 3094 |
| 47 | container | n. | 3361 |
| 48 | upset | adj./v. | 3388 |
| 49 | rat | n./v. | 3558 |
| 50 | random | n./adj./adv. | 3619 |

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
| **A. 不过滤**(原指令:直接取前 200) | 3049 | the, be, and, of, a, in, to, have, it, that, for, you |
| B. 排除 `zk`(中考) | 1738 | last, case, system, program, million, issue, power, political, later, community, within, guy |
| C. 排除 `zk` `gk`(中考+高考) | 657 | program, issue, community, guy, actually, economic, finally, military, federal, site, image, republican |
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
3. **total_words 要不要从 8000 改成 3049**(这个数会显示在词库中心的卡片上)。
