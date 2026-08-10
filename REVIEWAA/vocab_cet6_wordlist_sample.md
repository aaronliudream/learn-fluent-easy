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
| ECDICT 中 `toefl` 打标条目 | 5407 |
| **清洗后入库词数** | **5370** |
| 跳过 · 含空格短语 | 0 |
| 跳过 · 专有名词(首字母大写) | 36 |
| 跳过 · 非纯字母 | 1 |
| 跳过 · 小写后重复 | 0 |
| 保留但 freq_rank 缺失(排序沉底) | 24 |
| 保留但 pos 缺失 | 7 |

> `vocab_banks.toefl.total_words` 目前填的是 8000,实际可用 5370。**要不要把 total_words 改成 5370?** 这个数会显示在词库中心的卡片上。

## 随机 50 词

| # | headword | pos | freq_rank |
| ---: | --- | --- | ---: |
| 1 | political | adj. | 277 |
| 2 | tax | n./v. | 509 |
| 3 | director | n. | 510 |
| 4 | direction | n. | 928 |
| 5 | fair | n./adj./adv./v. | 1484 |
| 6 | analyst | n. | 1672 |
| 7 | slip | n./v./adj. | 1786 |
| 8 | perceive | v. | 2165 |
| 9 | moreover | adv. | 2282 |
| 10 | engineering | n. | 2385 |
| 11 | protein | n./adj. | 2523 |
| 12 | jail | n./v. | 2528 |
| 13 | violate | v. | 2909 |
| 14 | efficiency | n. | 3047 |
| 15 | naked | adj. | 3185 |
| 16 | operator | n. | 3210 |
| 17 | powder | n./v. | 3260 |
| 18 | reward | n./v. | 3392 |
| 19 | receiver | n. | 3401 |
| 20 | mud | n./v. | 3610 |
| 21 | landing | n. | 3688 |
| 22 | electrical | adj. | 3789 |
| 23 | spy | n./v. | 4846 |
| 24 | bureaucracy | n. | 4976 |
| 25 | alert | adj./n./v. | 5318 |
| 26 | outbreak | n. | 5343 |
| 27 | correspond | v. | 5415 |
| 28 | semester | n. | 5465 |
| 29 | omit | v. | 5550 |
| 30 | outrage | n./v. | 5684 |
| 31 | shave | n./v. | 5779 |
| 32 | repetition | n. | 5821 |
| 33 | reservoir | n./v. | 5907 |
| 34 | gradual | adj./n. | 6796 |
| 35 | void | n./adj. | 6815 |
| 36 | cushion | n./v. | 6893 |
| 37 | paralyze | v. | 7146 |
| 38 | kin | n./adj. | 7340 |
| 39 | lipstick | n. | 7372 |
| 40 | enlarge | v. | 7530 |
| 41 | poultry | n. | 7625 |
| 42 | cubic | adj. | 7772 |
| 43 | needless | adj. | 9297 |
| 44 | kite | n./v. | 9509 |
| 45 | microscopic | adj. | 9581 |
| 46 | radiant | adj. | 9731 |
| 47 | wasp | n. | 11805 |
| 48 | strait | n./adj. | 12059 |
| 49 | scorch | n./v. | 14072 |
| 50 | radish | n. | 14920 |

## batch1 预览(freq_rank 前 20,即最高频的 20 个托福词)

| # | headword | pos | freq_rank |
| ---: | --- | --- | ---: |
| 1 | state | n./adj./v. | 137 |
| 2 | system | n. | 191 |
| 3 | program | n./v. | 194 |
| 4 | government | n. | 201 |
| 5 | point | n./v. | 211 |
| 6 | national | adj. | 231 |
| 7 | business | n. | 246 |
| 8 | issue | n./v. | 248 |
| 9 | provide | v. | 262 |
| 10 | line | n./v. | 276 |
| 11 | political | adj. | 277 |
| 12 | lose | v. | 283 |
| 13 | law | n./v. | 287 |
| 14 | include | v. | 292 |
| 15 | continue | v. | 293 |
| 16 | later | adv. | 295 |
| 17 | community | n. | 296 |
| 18 | least | n./adj./adv. | 302 |
| 19 | president | n. | 303 |
| 20 | real | adj./n./adv. | 305 |

## ⚠️ 首批 200 词怎么取 —— 需要你拍板

ECDICT 的 `toefl` 标签含义是"**这个词在托福里出现过**",不是"这个词是托福难度"。
所以严格按原指令"取 freq_rank 前 200"拿到的是**最简单的 200 个词**(见上表:can / way / well / even / down…),
给托福考生做词卡基本没价值 —— 这批词还要配 3 条例句 + 4 条音频,成本花在 A1 词上很亏。

各档过滤方案的**实测结果**:

| 方案 | 可选词池 | freq_rank 最高的 12 个词 |
| --- | ---: | --- |
| **A. 不过滤**(原指令:直接取前 200) | 5346 | state, system, program, government, point, national, business, issue, provide, line, political, lose |
| B. 排除 `zk`(中考) | 4793 | system, program, issue, political, later, community, within, process, actually, nation, local, effect |
| C. 排除 `zk` `gk`(中考+高考) | 3247 | program, issue, community, actually, economic, military, federal, site, image, republican, source, realize |
| **D. 排除 `zk` `gk` `cet4`**(中考+高考+四级) | 1733 | environmental, attorney, participant, client, context, grab, corporate, analyst, currently, ethnic, rating, landscape |
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
3. **total_words 要不要从 8000 改成 5370**(这个数会显示在词库中心的卡片上)。
