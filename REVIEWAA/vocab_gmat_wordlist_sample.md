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
| ECDICT 中 `toefl` 打标条目 | 7504 |
| **清洗后入库词数** | **3829** |
| 跳过 · 含空格短语 | 0 |
| 跳过 · 专有名词(首字母大写) | 19 |
| 跳过 · 非纯字母 | 0 |
| 跳过 · 小写后重复 | 0 |
| 保留但 freq_rank 缺失(排序沉底) | 0 |
| 保留但 pos 缺失 | 8 |

> `vocab_banks.toefl.total_words` 目前填的是 8000,实际可用 3829。**要不要把 total_words 改成 3829?** 这个数会显示在词库中心的卡片上。

## 随机 50 词

| # | headword | pos | freq_rank |
| ---: | --- | --- | ---: |
| 1 | lot | n./v. | 238 |
| 2 | shoulder | n./v. | 986 |
| 3 | collection | n. | 1045 |
| 4 | cast | n./v. | 2035 |
| 5 | stroke | n./v. | 3108 |
| 6 | ritual | n./adj. | 3404 |
| 7 | privilege | n./v. | 3612 |
| 8 | metropolitan | n./adj. | 4293 |
| 9 | tag | n./v. | 4442 |
| 10 | cemetery | n. | 4589 |
| 11 | spark | n./v. | 4805 |
| 12 | bucket | n. | 4812 |
| 13 | flaw | n. | 5399 |
| 14 | aftermath | n. | 5655 |
| 15 | bout | n. | 5865 |
| 16 | analogy | n. | 5913 |
| 17 | complicate | v. | 5983 |
| 18 | meditation | n. | 6196 |
| 19 | solidarity | n. | 6213 |
| 20 | archive | v./n. | 6515 |
| 21 | stalk | n./v. | 6634 |
| 22 | allocate | v. | 6763 |
| 23 | exquisite | adj. | 8096 |
| 24 | monumental | adj. | 8275 |
| 25 | commonplace | n./adj. | 8669 |
| 26 | groom | n./v. | 8693 |
| 27 | covert | adj./n. | 8772 |
| 28 | unanimous | adj. | 8826 |
| 29 | anecdote | n. | 8925 |
| 30 | bourgeois | n./adj. | 9071 |
| 31 | gamble | n./v. | 9148 |
| 32 | deprivation | n. | 9193 |
| 33 | terminology | n. | 9306 |
| 34 | gleam | n./v. | 10208 |
| 35 | torque | n. | 10225 |
| 36 | obese | adj. | 10333 |
| 37 | delineate | v. | 10523 |
| 38 | suggestive | adj. | 10711 |
| 39 | transient | n./adj. | 10735 |
| 40 | delusion | n. | 10894 |
| 41 | throng | n./adj./v. | 11014 |
| 42 | onslaught | n. | 11133 |
| 43 | burrow | n./v. | 12121 |
| 44 | agrarian | adj. | 12232 |
| 45 | crayon | n./v. | 12296 |
| 46 | billow | n./v. | 12401 |
| 47 | infuriate | adj./v. | 13254 |
| 48 | cultivated | adj. | 13324 |
| 49 | scrawl | v./n. | 13850 |
| 50 | turquoise | n. | 14012 |

## batch1 预览(freq_rank 前 20,即最高频的 20 个托福词)

| # | headword | pos | freq_rank |
| ---: | --- | --- | ---: |
| 1 | want | n./v. | 83 |
| 2 | even | adj./v./adv./n. | 107 |
| 3 | down | adj./adv./prep./n. | 118 |
| 4 | school | n./v. | 125 |
| 5 | mean | adj./v./n. | 154 |
| 6 | group | n./v. | 163 |
| 7 | hold | n./v. | 213 |
| 8 | lot | n./v. | 238 |
| 9 | issue | n./v. | 248 |
| 10 | meet | n./adj./v. | 288 |
| 11 | low | n./adj./adv./v. | 360 |
| 12 | guy | n./v. | 364 |
| 13 | moment | n. | 369 |
| 14 | die | v./n. | 403 |
| 15 | control | n./v. | 432 |
| 16 | base | n./v./adj. | 536 |
| 17 | table | n./v. | 539 |
| 18 | court | n./v. | 541 |
| 19 | produce | n./v. | 542 |
| 20 | available | adj. | 622 |

## ⚠️ 首批 200 词怎么取 —— 需要你拍板

ECDICT 的 `toefl` 标签含义是"**这个词在托福里出现过**",不是"这个词是托福难度"。
所以严格按原指令"取 freq_rank 前 200"拿到的是**最简单的 200 个词**(见上表:can / way / well / even / down…),
给托福考生做词卡基本没价值 —— 这批词还要配 3 条例句 + 4 条音频,成本花在 A1 词上很亏。

各档过滤方案的**实测结果**:

| 方案 | 可选词池 | freq_rank 最高的 12 个词 |
| --- | ---: | --- |
| **A. 不过滤**(原指令:直接取前 200) | 3829 | want, even, down, school, mean, group, hold, lot, issue, meet, low, guy |
| B. 排除 `zk`(中考) | 3753 | issue, guy, base, court, campaign, defense, subject, movement, significant, response, shoot, stock |
| C. 排除 `zk` `gk`(中考+高考) | 3289 | issue, guy, defense, significant, response, stock, individual, claim, impact, threat, attorney, release |
| **D. 排除 `zk` `gk` `cet4`**(中考+高考+四级) | 2718 | defense, attorney, context, corporate, ethnic, regime, perception, cite, asset, chip, transition, coalition |
| E. 排除 `zk` `gk` `cet4` `cet6` | 1912 | defense, championship, designer, buck, diversity, respondent, constitutional, infection, ken, scenario, founder, celebrity |

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
3. **total_words 要不要从 8000 改成 3829**(这个数会显示在词库中心的卡片上)。
