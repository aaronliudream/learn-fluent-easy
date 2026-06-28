# 上外(sufe)全 7 册 — 完成交接报告

> 状态:**7 册全部内容做完 + hub 接入做完 + SQL 全部备好(本地)**。
> ★必修一二 SQL 已跑、已上线、Aaron :8080 验过、已 push★。
> 选必/必修三的 SQL **待 Aaron 跑**;跑完即在 hub 显示。**本批未 push**(等 Aaron :8080 核)。

## 一、7 册总览

| hub 年级 | 册 | hub 学期 id | DB grade | 前缀 | 单元(4/册) | SQL 状态 |
|---|---|---|---|---|---|---|
| 高一 | 必修第一册 | gk_required1 | 10 | s1 | School Life / Language and Culture / Travel / Customs and Traditions | ✅已跑·上线 |
| 高一 | 必修第二册 | gk_required2 | 10 | s2 | Nature / Animals / Food / Sports | ✅已跑·上线 |
| 高一 | 必修第三册 | gk_required3 | 10 | s3 | Road to Success / Art and Artists / Healthy Lifestyle / Life and Technology | ⏳待跑 |
| 高二 | 选必第一册 | gk_elective1 | 11 | se1 | Learning for Life / Volunteering / Adventuring / Future Living | ⏳待跑 |
| 高二 | 选必第二册 | gk_elective2 | 11 | se2 | Scientists / Language and Mind / Charity / Disaster Survival | ⏳待跑 |
| 高三 | 选必第三册 | gk_elective3 | 12 | se3 | Fighting Stress / Cherishing Friendship / Exploring the Unknown / Protecting the Environment | ⏳待跑 |
| 高三 | 选必第四册 | gk_elective4 | 12 | se4 | Achieving Effective Communication / Learning about Trade and Economy / Delving into History / Approaching Classics | ⏳待跑 |

每单元 9 关内容:vocab 44–52 / grammar 3点×20=60 / reading 6篇 / cloze 6篇 / listening 6篇 / writing 1 / grammar-tips 1 / finalreading 1 / hub 内联。全部过 `qc-unit.mjs` **硬卡 FAIL: 0**。

## 二、★Aaron 待跑 SQL 清单(按册,在 Supabase service role 跑)★

> 每个 load.sql 自带 BEGIN/COMMIT + 前后 COUNT 校验,幂等(可重复跑)。DELETE 全部带 `publisher='sufe'`,**绝不动人教**。
> 建议顺序:先 4 个 u*-load(主内容)→ context(情景闯关)→ listening-audio-url(听力音频)。

### 必修第三册 required3(DB grade 10)
```
SQLAA/sufe-required3-u1-load.sql
SQLAA/sufe-required3-u2-load.sql
SQLAA/sufe-required3-u3-load.sql
SQLAA/sufe-required3-u4-load.sql
SQLAA/sufe-required3-context-questions-load.sql
SQLAA/sufe-required3-listening-audio-url.sql      (24条音频)
```
### 选必第一册 elective1(DB grade 11)
```
SQLAA/sufe-elective1-u1-load.sql ~ u4-load.sql
SQLAA/sufe-elective1-context-questions-load.sql
SQLAA/sufe-elective1-listening-audio-url.sql
```
### 选必第二册 elective2(DB grade 11)
```
SQLAA/sufe-elective2-u1-load.sql ~ u4-load.sql
SQLAA/sufe-elective2-context-questions-load.sql
SQLAA/sufe-elective2-listening-audio-url.sql
```
### 选必第三册 elective3(DB grade 12)
```
SQLAA/sufe-elective3-u1-load.sql ~ u4-load.sql
SQLAA/sufe-elective3-context-questions-load.sql
SQLAA/sufe-elective3-listening-audio-url.sql
```
### 选必第四册 elective4(DB grade 12)
```
SQLAA/sufe-elective4-u1-load.sql ~ u4-load.sql
SQLAA/sufe-elective4-context-questions-load.sql
SQLAA/sufe-elective4-listening-audio-url.sql
```

合计:5 册 × (4 load + 1 context + 1 audio) = **30 个 SQL**。

## 三、hub 接入(已改,前端零回归)

- `src/data/gaokaoHub/sufe-courses.json` 重新生成为**全 7 册 28 单元**(grade1=必修1/2/3,grade2=选必1/2,grade3=选必3/4),9 关 stages + grammarCodes(s1…se4)+ 内联 writing/finalReading。
- 生成器 `scripts/senior-rebuild/_gen_sufe_hub_courses.mjs` 扩成多年级多册(重灌后重跑即可)。
- 人教零回归不变:不带 `?publisher` 或 `=pep` → 仍走人教 year*.json,字节级一致(见 `sufe-hub-接入报告.md`)。
- 9 关内容全 DB 驱动(grade+book+unitKey+publisher);SQL 没跑前,单元结构能显示但进关内容为空——**跑完 SQL 即满**。

## 四、:8080 验收链接(SQL 跑完后)

```
高一必修三  http://localhost:8080/gaokao/hub/1/semester/gk_required3?publisher=sufe
高二选必一  http://localhost:8080/gaokao/hub/2/semester/gk_elective1?publisher=sufe
高二选必二  http://localhost:8080/gaokao/hub/2/semester/gk_elective2?publisher=sufe
高三选必三  http://localhost:8080/gaokao/hub/3/semester/gk_elective3?publisher=sufe
高三选必四  http://localhost:8080/gaokao/hub/3/semester/gk_elective4?publisher=sufe
```
人教零回归对照(不带 publisher,必须和现在一模一样):
```
http://localhost:8080/gaokao/hub/1   /2   /3
```

## 五、复核重点(给网页版 Claude)

- 每册 plan:`REVIEWAA/sufe-<vol>-plan.md`(单元结构 + 考点取证)。
- 每单元 8 JSON + `_语义复核清单.md`:`REVIEWAA/sufe-<vol>-U<n>/`。
- 语法造题铁律:零术语、应用型、答案唯一(干扰项错时态/语态/连接词/语序);阅读答案转述非照抄;完形同词性无双解;听力 transcript 有据。
- QC 6.5「超纲词」WARN 多为派生/复合/主题专名,非硬卡,按需润色。

## 六、未做(后续)

- 外研社(fltrp)7 册:publisher='fltrp',尚未开工。
- 上外真题卷 / 中考综合卷:未开工。
