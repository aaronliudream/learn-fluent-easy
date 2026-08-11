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
| ECDICT 中 `toefl` 打标条目 | 4801 |
| **清洗后入库词数** | **4787** |
| 跳过 · 含空格短语 | 0 |
| 跳过 · 专有名词(首字母大写) | 14 |
| 跳过 · 非纯字母 | 0 |
| 跳过 · 小写后重复 | 0 |
| 保留但 freq_rank 缺失(排序沉底) | 2 |
| 保留但 pos 缺失 | 5 |

> `vocab_banks.toefl.total_words` 目前填的是 8000,实际可用 4787。**要不要把 total_words 改成 4787?** 这个数会显示在词库中心的卡片上。

## 随机 50 词

| # | headword | pos | freq_rank |
| ---: | --- | --- | ---: |
| 1 | national | adj. | 231 |
| 2 | reach | n./v. | 422 |
| 3 | require | v. | 446 |
| 4 | recognize | v. | 779 |
| 5 | potential | n./adj. | 1260 |
| 6 | wave | n./v. | 1398 |
| 7 | tie | n./v. | 1501 |
| 8 | bowl | n./v. | 1829 |
| 9 | cite | v. | 1932 |
| 10 | accuse | v. | 2024 |
| 11 | diet | n./v. | 2139 |
| 12 | brief | n./adj./v. | 2146 |
| 13 | install | v. | 2505 |
| 14 | heaven | n. | 2626 |
| 15 | whereas | conj. | 2731 |
| 16 | interpret | v. | 2755 |
| 17 | pride | n./v. | 2801 |
| 18 | poet | n. | 2923 |
| 19 | radical | n./adj. | 2929 |
| 20 | helicopter | n./v. | 3100 |
| 21 | offensive | adj. | 3168 |
| 22 | powder | n./v. | 3260 |
| 23 | costume | n. | 4152 |
| 24 | mechanic | n./adj. | 4260 |
| 25 | dip | v./n. | 4532 |
| 26 | partial | adj./n. | 4546 |
| 27 | rim | n./v. | 4602 |
| 28 | bacterium | n. | 4650 |
| 29 | soar | n./v. | 4707 |
| 30 | arrow | n. | 4832 |
| 31 | dock | n./v. | 4912 |
| 32 | dictate | v./n. | 4933 |
| 33 | concession | n. | 5001 |
| 34 | foolish | adj. | 5783 |
| 35 | balcony | n. | 5799 |
| 36 | outlook | n. | 5863 |
| 37 | appliance | n. | 6043 |
| 38 | fling | n./v. | 6172 |
| 39 | tomb | n./v. | 6183 |
| 40 | arch | n./v./adj. | 6326 |
| 41 | darling | n./adj. | 6421 |
| 42 | contention | n. | 6547 |
| 43 | adore | v. | 7705 |
| 44 | simulate | v. | 7892 |
| 45 | conserve | n./v. | 7938 |
| 46 | biscuit | n. | 8068 |
| 47 | plentiful | adj. | 9587 |
| 48 | abdomen | n. | 9711 |
| 49 | deduct | v. | 11281 |
| 50 | ox | n. | 11804 |

## batch1 预览(freq_rank 前 20,即最高频的 20 个托福词)

| # | headword | pos | freq_rank |
| ---: | --- | --- | ---: |
| 1 | state | n./adj./v. | 137 |
| 2 | might | n./aux. | 175 |
| 3 | part | n./v./adj./adv. | 178 |
| 4 | against | prep. | 180 |
| 5 | system | n. | 191 |
| 6 | government | n. | 201 |
| 7 | point | n./v. | 211 |
| 8 | happen | v. | 216 |
| 9 | area | n. | 230 |
| 10 | national | adj. | 231 |
| 11 | fact | n. | 235 |
| 12 | business | n. | 246 |
| 13 | issue | n./v. | 248 |
| 14 | provide | v. | 262 |
| 15 | power | n./v. | 271 |
| 16 | line | n./v. | 276 |
| 17 | political | adj. | 277 |
| 18 | lose | v. | 283 |
| 19 | however | adv./conj. | 284 |
| 20 | law | n./v. | 287 |

## ⚠️ 首批 200 词怎么取 —— 需要你拍板

ECDICT 的 `toefl` 标签含义是"**这个词在托福里出现过**",不是"这个词是托福难度"。
所以严格按原指令"取 freq_rank 前 200"拿到的是**最简单的 200 个词**(见上表:can / way / well / even / down…),
给托福考生做词卡基本没价值 —— 这批词还要配 3 条例句 + 4 条音频,成本花在 A1 词上很亏。

各档过滤方案的**实测结果**:

| 方案 | 可选词池 | freq_rank 最高的 12 个词 |
| --- | ---: | --- |
| **A. 不过滤**(原指令:直接取前 200) | 4785 | state, might, part, against, system, government, point, happen, area, national, fact, business |
| B. 排除 `zk`(中考) | 4110 | system, issue, power, political, later, community, within, guy, process, nation, local, effect |
| C. 排除 `zk` `gk`(中考+高考) | 2523 | issue, community, guy, economic, finally, military, federal, site, image, republican, source, opportunity |
| **D. 排除 `zk` `gk` `cet4`**(中考+高考+四级) | 1175 | attorney, participant, labor, client, neighbor, context, grab, theater, ethnic, gender, regime, perception |
| E. 排除 `zk` `gk` `cet4` `cet6` | 304 | labor, neighbor, theater, gender, coverage, honor, prosecutor, housing, cop, infection, celebrity, guideline |

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
3. **total_words 要不要从 8000 改成 4787**(这个数会显示在词库中心的卡片上)。
