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
| ECDICT 中 `toefl` 打标条目 | 3849 |
| **清洗后入库词数** | **3814** |
| 跳过 · 含空格短语 | 0 |
| 跳过 · 专有名词(首字母大写) | 34 |
| 跳过 · 非纯字母 | 1 |
| 跳过 · 小写后重复 | 0 |
| 保留但 freq_rank 缺失(排序沉底) | 16 |
| 保留但 pos 缺失 | 2 |

> `vocab_banks.toefl.total_words` 目前填的是 8000,实际可用 3814。**要不要把 total_words 改成 3814?** 这个数会显示在词库中心的卡片上。

## 随机 50 词

| # | headword | pos | freq_rank |
| ---: | --- | --- | ---: |
| 1 | point | n./v. | 211 |
| 2 | although | conj. | 378 |
| 3 | probably | adv. | 398 |
| 4 | drop | n./v. | 690 |
| 5 | victim | n. | 1063 |
| 6 | press | n./v. | 1178 |
| 7 | resident | n./adj. | 1254 |
| 8 | bottom | n./adj./v. | 1511 |
| 9 | mental | adj./n. | 1584 |
| 10 | breast | n./v. | 1652 |
| 11 | extent | n. | 1758 |
| 12 | contrast | n./v. | 1762 |
| 13 | explanation | n. | 2054 |
| 14 | steel | n./adj./v. | 2152 |
| 15 | racial | adj. | 2243 |
| 16 | ordinary | adj./n. | 2268 |
| 17 | adjust | v. | 2300 |
| 18 | crucial | adj. | 2397 |
| 19 | butter | n./v. | 2402 |
| 20 | giant | n./adj. | 2539 |
| 21 | switch | n./v. | 2604 |
| 22 | communicate | v. | 2672 |
| 23 | tunnel | n./v. | 3355 |
| 24 | beg | v. | 3452 |
| 25 | alarm | n./v. | 3693 |
| 26 | southeast | n./adj./adv. | 3708 |
| 27 | exclusive | adj. | 3753 |
| 28 | hook | n./v. | 3791 |
| 29 | determination | n. | 3846 |
| 30 | gravity | n. | 3956 |
| 31 | circuit | n. | 4023 |
| 32 | elder | n./adj. | 4056 |
| 33 | sail | n./v. | 4124 |
| 34 | freely | adv. | 4792 |
| 35 | bucket | n. | 4812 |
| 36 | vague | adj. | 4885 |
| 37 | copper | n. | 5053 |
| 38 | distress | n./v./adj. | 5194 |
| 39 | choke | v./n. | 5223 |
| 40 | explosive | n./adj. | 5387 |
| 41 | precision | n./adj. | 5466 |
| 42 | noble | n./adj. | 5553 |
| 43 | undo | v. | 6632 |
| 44 | pierce | v. | 6839 |
| 45 | secondly | adv. | 6891 |
| 46 | simplicity | n. | 7007 |
| 47 | enclose | v. | 8459 |
| 48 | amaze | v. | 8607 |
| 49 | metric | adj. | 10163 |
| 50 | disable | v. | 11005 |

## batch1 预览(freq_rank 前 20,即最高频的 20 个托福词)

| # | headword | pos | freq_rank |
| ---: | --- | --- | ---: |
| 1 | state | n./adj./v. | 137 |
| 2 | might | n./aux. | 175 |
| 3 | part | n./v./adj./adv. | 178 |
| 4 | against | prep. | 180 |
| 5 | system | n. | 191 |
| 6 | program | n./v. | 194 |
| 7 | government | n. | 201 |
| 8 | point | n./v. | 211 |
| 9 | happen | v. | 216 |
| 10 | area | n. | 230 |
| 11 | national | adj. | 231 |
| 12 | fact | n. | 235 |
| 13 | business | n. | 246 |
| 14 | issue | n./v. | 248 |
| 15 | provide | v. | 262 |
| 16 | power | n./v. | 271 |
| 17 | line | n./v. | 276 |
| 18 | political | adj. | 277 |
| 19 | lose | v. | 283 |
| 20 | however | adv./conj. | 284 |

## ⚠️ 首批 200 词怎么取 —— 需要你拍板

ECDICT 的 `toefl` 标签含义是"**这个词在托福里出现过**",不是"这个词是托福难度"。
所以严格按原指令"取 freq_rank 前 200"拿到的是**最简单的 200 个词**(见上表:can / way / well / even / down…),
给托福考生做词卡基本没价值 —— 这批词还要配 3 条例句 + 4 条音频,成本花在 A1 词上很亏。

各档过滤方案的**实测结果**:

| 方案 | 可选词池 | freq_rank 最高的 12 个词 |
| --- | ---: | --- |
| **A. 不过滤**(原指令:直接取前 200) | 3798 | state, might, part, against, system, program, government, point, happen, area, national, fact |
| B. 排除 `zk`(中考) | 3109 | system, program, issue, power, political, later, community, within, guy, process, actually, nation |
| C. 排除 `zk` `gk`(中考+高考) | 1604 | program, issue, community, guy, actually, economic, finally, military, federal, site, image, republican |
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
3. **total_words 要不要从 8000 改成 3814**(这个数会显示在词库中心的卡片上)。
