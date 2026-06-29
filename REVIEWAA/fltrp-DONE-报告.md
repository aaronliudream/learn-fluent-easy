# 外研社(fltrp)全 7 册 — 完成交接报告

> 状态:**7 册 42 单元全部内容做完 + hub 接入做完 + SQL 全部备好(本地)**。
> SQL **待 Aaron 跑**;跑完即在 hub `?publisher=fltrp` 显示。**本批未 push**(等 Aaron :8080 核)。

## 一、总览(7 册 × 6 单元 = 42 单元)

| hub 年级 | 册 | hub 学期 id | DB grade | 前缀 | SQL 状态 |
|---|---|---|---|---|---|
| 高一 | 必修第一册 | gk_required1 | 10 | f1 | ⏳待跑 |
| 高一 | 必修第二册 | gk_required2 | 10 | f2 | ⏳待跑 |
| 高一 | 必修第三册 | gk_required3 | 10 | f3 | ⏳待跑 |
| 高二 | 选必第一册 | gk_elective1 | 11 | fe1 | ⏳待跑 |
| 高二 | 选必第二册 | gk_elective2 | 11 | fe2 | ⏳待跑 |
| 高三 | 选必第三册 | gk_elective3 | 12 | fe3 | ⏳待跑 |
| 高三 | 选必第四册 | gk_elective4 | 12 | fe4 | ⏳待跑 |

每单元 9 关内容:vocab 44–52 / grammar 3点×20=60 / reading 6 / cloze 6 / listening 6 / writing 1 / grammar-tips 1 / finalreading 1 / hub 内联。全部过 `qc-unit.mjs` **硬卡 FAIL: 0**。单元结构+考点见 `REVIEWAA/fltrp-结构与考点.md`。

## 二、★Aaron 待跑 SQL 清单(Supabase service role)★

> 每个 load.sql 自带 BEGIN/COMMIT + 前后 COUNT,幂等。DELETE 全带 `publisher='fltrp'`,**绝不动人教/上外**。
> 每册:6 个 u*-load + 1 context + 1 listening-audio-url = 8 个 SQL。7 册 = **56 个 SQL**。
> 建议每册顺序:u1..u6 load → context → listening-audio-url。

```
# 必修一/二/三(grade10)
SQLAA/fltrp-required1-u1..u6-load.sql  + fltrp-required1-context-questions-load.sql + fltrp-required1-listening-audio-url.sql
SQLAA/fltrp-required2-u1..u6-load.sql  + ...context... + ...listening-audio-url...
SQLAA/fltrp-required3-u1..u6-load.sql  + ...context... + ...listening-audio-url...
# 选必一/二(grade11)
SQLAA/fltrp-elective1-u1..u6-load.sql  + ...context... + ...listening-audio-url...
SQLAA/fltrp-elective2-u1..u6-load.sql  + ...context... + ...listening-audio-url...
# 选必三/四(grade12)
SQLAA/fltrp-elective3-u1..u6-load.sql  + ...context... + ...listening-audio-url...
SQLAA/fltrp-elective4-u1..u6-load.sql  + ...context... + ...listening-audio-url...
```

## 三、hub 接入(已改,前端零回归)

- `src/data/gaokaoHub/fltrp-courses.json`(生成物):全 7 册 42 单元(高一必修1/2/3·高二选必1/2·高三选必3/4),9 关 stages + grammarCodes(f1…fe4)+ 内联 writing/finalReading。
- 生成器 `scripts/senior-rebuild/_gen_fltrp_hub_courses.mjs`(重灌后重跑)。
- `src/lib/gaokaoHub/courseData.ts`:`coursesFor('fltrp')` 由原 EMPTY_COURSES 改为返回 `FLTRP_COURSES`(导入 fltrp-courses.json)。
- `src/lib/juniorHub/courseData.ts`:`FORK_COURSES` 加入 fltrp(关卡播放器按 `fltrp_*` unitId 兜底解析;id 全局唯一,人教/初中/上外不受影响)。
- 人教零回归不变:不带 `?publisher` 或 `=pep` → 仍走人教 year*.json,字节级一致。`tsc 0` + `vite build` 通过。
- 9 关内容全 DB 驱动(grade+book+unitKey+publisher);SQL 没跑前结构能显示但进关内容为空——跑完即满。

## 四、:8080 验收链接(SQL 跑完后)

```
高一必修一  http://localhost:8080/gaokao/hub/1/semester/gk_required1?publisher=fltrp
高一必修二  http://localhost:8080/gaokao/hub/1/semester/gk_required2?publisher=fltrp
高一必修三  http://localhost:8080/gaokao/hub/1/semester/gk_required3?publisher=fltrp
高二选必一  http://localhost:8080/gaokao/hub/2/semester/gk_elective1?publisher=fltrp
高二选必二  http://localhost:8080/gaokao/hub/2/semester/gk_elective2?publisher=fltrp
高三选必三  http://localhost:8080/gaokao/hub/3/semester/gk_elective3?publisher=fltrp
高三选必四  http://localhost:8080/gaokao/hub/3/semester/gk_elective4?publisher=fltrp
```
人教零回归对照(不带 publisher,必须和现在一模一样):`/gaokao/hub/1 /2 /3`

## 五、复核材料(给网页版 Claude)
- 总结构+考点:`REVIEWAA/fltrp-结构与考点.md`
- 每单元 8 JSON + `_语义复核清单.md`:`REVIEWAA/fltrp-<vol>-U<n>/`(共 42 个)

## 六、★听力音频:OpenAI 配额用尽,部分待补★
本批 TTS 跑量大,中途 **OpenAI 配额(429 quota exceeded)用尽**。当前状态:
| 册 | 音频 |
|---|---|
| required1 / required2 / required3 / elective1 / elective2 | ✅ 36/36 |
| elective3 | ⚠️ 34/36(缺 U6 两条:Caring for Birds in Winter、A Book That Changed Minds) |
| elective4 | ❌ 0/36(配额耗尽时刚好轮到) |

**修复:Aaron 给 OpenAI 充值/恢复配额后,重跑这两个即补齐(幂等、内容寻址、已生成的不重复花钱):**
```
node scripts/senior-rebuild/fltrp-elective3/_gen_audio.mjs   # 补 2 条
node scripts/senior-rebuild/fltrp-elective4/_gen_audio.mjs   # 生成 36 条
```
跑完会刷新 `SQLAA/fltrp-elective3|4-listening-audio-url.sql`,再跑这两个 SQL 即可。
**注:音频只影响"听力关播放声音";听力题目本身(transcript/选项/答案)不依赖音频,已全部就绪。**
