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
| **清洗后入库词数** | **4470** |
| 跳过 · 含空格短语 | 4 |
| 跳过 · 专有名词(首字母大写) | 9 |
| 跳过 · 非纯字母 | 0 |
| 跳过 · 小写后重复 | 0 |
| 保留但 freq_rank 缺失(排序沉底) | 124 |
| 保留但 pos 缺失 | 53 |

> `vocab_banks.toefl.total_words` 目前填的是 8000,实际可用 4470。**要不要把 total_words 改成 4470?** 这个数会显示在词库中心的卡片上。

## 随机 50 词

| # | headword | pos | freq_rank |
| ---: | --- | --- | ---: |
| 1 | theater | n. | 1535 |
| 2 | testify | v. | 2790 |
| 3 | representation | n. | 2908 |
| 4 | extended | adj. | 4083 |
| 5 | loom | n./v. | 5292 |
| 6 | methodology | n. | 5679 |
| 7 | predominantly | adv. | 5942 |
| 8 | escort | n./v. | 6668 |
| 9 | temporal | adj./n. | 6868 |
| 10 | hue | n. | 7062 |
| 11 | raft | n./v. | 7376 |
| 12 | nutritional | adj. | 7381 |
| 13 | anatomy | n. | 8160 |
| 14 | vault | n./v. | 8437 |
| 15 | mint | n./v. | 8674 |
| 16 | shred | n./v. | 8713 |
| 17 | prudent | adj. | 8823 |
| 18 | displacement | n. | 9099 |
| 19 | shun | v. | 9114 |
| 20 | motionless | adj. | 9497 |
| 21 | disdain | n./v. | 9653 |
| 22 | condemnation | n. | 9852 |
| 23 | ransom | n./v. | 11907 |
| 24 | fable | n./v. | 12174 |
| 25 | imbue | v. | 12805 |
| 26 | paraphrase | n./v. | 12845 |
| 27 | inundate | v. | 13018 |
| 28 | vindicate | v. | 13147 |
| 29 | unquestionably | adv. | 13286 |
| 30 | brandish | v./n. | 13627 |
| 31 | disband | v. | 13868 |
| 32 | percussion | n. | 13946 |
| 33 | ambience | n. | 14090 |
| 34 | concise | adj. | 15935 |
| 35 | tutorial | n./adj. | 15959 |
| 36 | shameless | adj. | 16159 |
| 37 | intoxicate | v. | 16545 |
| 38 | humanistic | adj. | 16807 |
| 39 | topsoil | n. | 16882 |
| 40 | preservative | adj./n. | 17163 |
| 41 | knapsack | n. | 17327 |
| 42 | sieve | n./v. | 17578 |
| 43 | overburden | v. | 20715 |
| 44 | impersonation | n. | 21249 |
| 45 | venerate | v. | 21355 |
| 46 | magnificence | n. | 21679 |
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
词池从 6955 收到 **4470**,再按 freq_rank 取前 200 作 batch1。

这么做的原因:ECDICT 的 `toefl` 标签含义是"托福里出现过",不是"托福难度"。
不过滤时前 200 全是 `can / way / well / even` 这类 A1 词,给托福考生做词卡没价值。


## 请 Aaron 确认三件事

1. **词表本身**:上面 50 词是不是托福该有的样子?有没有明显不该在托福库里的?
2. **屈折形是否算独立词条**:ECDICT 把 `abandon` / `abandoned` / `abandonment` 都打了 toefl 标,本脚本**全部保留**为独立词条(`abandoned` 有独立的形容词义"被抛弃的",托福词表通常也这么收)。如果你要按原形合并,说一声,清洗规则加一条即可。
3. **total_words 要不要从 8000 改成 4470**(这个数会显示在词库中心的卡片上)。
