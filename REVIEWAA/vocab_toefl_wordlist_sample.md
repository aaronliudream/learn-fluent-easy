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
| **清洗后入库词数** | **4472** |
| 跳过 · 含空格短语 | 4 |
| 跳过 · 专有名词(首字母大写) | 9 |
| 跳过 · 非纯字母 | 0 |
| 跳过 · 小写后重复 | 0 |
| 保留但 freq_rank 缺失(排序沉底) | 124 |
| 保留但 pos 缺失 | 53 |

> `vocab_banks.toefl.total_words` 目前填的是 8000,实际可用 4472。**要不要把 total_words 改成 4472?** 这个数会显示在词库中心的卡片上。

## 随机 50 词

| # | headword | pos | freq_rank |
| ---: | --- | --- | ---: |
| 1 | theater | n. | 1535 |
| 2 | awareness | n. | 2784 |
| 3 | constitute | v. | 2887 |
| 4 | nominee | n. | 4081 |
| 5 | lure | n./v. | 5288 |
| 6 | divert | v. | 5673 |
| 7 | recreational | adj. | 5934 |
| 8 | lucrative | adj. | 6660 |
| 9 | muscular | adj. | 6864 |
| 10 | accidentally | adv. | 7057 |
| 11 | imitation | n. | 7375 |
| 12 | shifting | — | 7378 |
| 13 | haze | n./v. | 8157 |
| 14 | bodily | adj./adv. | 8434 |
| 15 | persuasive | adj. | 8672 |
| 16 | moss | n./v. | 8708 |
| 17 | forefront | n. | 8815 |
| 18 | bouquet | n. | 9088 |
| 19 | augment | v. | 9113 |
| 20 | limp | n./adj./v. | 9496 |
| 21 | traverse | n./v./adj. | 9649 |
| 22 | discrete | adj. | 9847 |
| 23 | stratum | n. | 11902 |
| 24 | crimson | n./adj./v. | 12173 |
| 25 | deficient | adj. | 12804 |
| 26 | promulgate | v. | 12844 |
| 27 | inundate | v. | 13018 |
| 28 | discernible | adj. | 13124 |
| 29 | repertory | n. | 13284 |
| 30 | flamboyant | adj. | 13626 |
| 31 | genesis | n. | 13864 |
| 32 | unparalleled | adj. | 13944 |
| 33 | graft | n./v. | 14077 |
| 34 | concise | adj. | 15935 |
| 35 | antagonist | n. | 15957 |
| 36 | baroque | n./adj. | 16149 |
| 37 | frugal | adj. | 16538 |
| 38 | scraping | n./adj. | 16806 |
| 39 | choppy | adj. | 16878 |
| 40 | preservative | adj./n. | 17163 |
| 41 | knapsack | n. | 17327 |
| 42 | sieve | n./v. | 17578 |
| 43 | overburden | v. | 20715 |
| 44 | singe | v. | 21246 |
| 45 | venerate | v. | 21355 |
| 46 | pauper | n. | 21664 |
| 47 | portraitist | n. | 25892 |
| 48 | gyration | n. | 26430 |
| 49 | celsius | adj. | 30514 |
| 50 | fulsome | adj. | 32604 |

## batch1 预览(freq_rank 前 20,即最高频的 20 个托福词)

| # | headword | pos | freq_rank |
| ---: | --- | --- | ---: |
| 1 | defense | n. | 657 |
| 2 | attorney | n. | 1069 |
| 3 | participant | n./adj. | 1103 |
| 4 | concerned | adj. | 1128 |
| 5 | involved | adj. | 1174 |
| 6 | neighbor | n./v./adj. | 1424 |
| 7 | context | n. | 1427 |
| 8 | voter | n. | 1452 |
| 9 | grab | n./v. | 1477 |
| 10 | theater | n. | 1535 |
| 11 | regional | adj. | 1645 |
| 12 | currently | adv. | 1700 |
| 13 | ethnic | adj. | 1729 |
| 14 | landscape | n./v. | 1827 |
| 15 | regime | n. | 1848 |
| 16 | perception | n. | 1866 |
| 17 | opposition | n. | 1876 |
| 18 | coverage | n. | 1877 |
| 19 | intervention | n. | 1926 |
| 20 | cite | v. | 1932 |

## 选词口径(已定:方案 D)

按 `--exclude-tags=zk,gk,cet4` 剔除 **2488** 个已被中考/高考/四级覆盖的词,
词池从 6955 收到 **4472**,再按 freq_rank 取前 200 作 batch1。

这么做的原因:ECDICT 的 `toefl` 标签含义是"托福里出现过",不是"托福难度"。
不过滤时前 200 全是 `can / way / well / even` 这类 A1 词,给托福考生做词卡没价值。


## 请 Aaron 确认三件事

1. **词表本身**:上面 50 词是不是托福该有的样子?有没有明显不该在托福库里的?
2. **屈折形是否算独立词条**:ECDICT 把 `abandon` / `abandoned` / `abandonment` 都打了 toefl 标,本脚本**全部保留**为独立词条(`abandoned` 有独立的形容词义"被抛弃的",托福词表通常也这么收)。如果你要按原形合并,说一声,清洗规则加一条即可。
3. **total_words 要不要从 8000 改成 4472**(这个数会显示在词库中心的卡片上)。
