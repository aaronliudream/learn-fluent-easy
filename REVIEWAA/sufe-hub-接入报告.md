# 上外(sufe)课本同步 9 关 hub 接入 — 改动报告(待 Aaron :8080 验过再 push)

目标:`/gaokao/hub/1/semester/gk_required1?publisher=sufe` 显示上外真实单元(School Life/Language and Culture/Travel/Customs),点单元进 9 关读上外 DB 内容。必修一二已灌库,可真机验。

## 一、人教零回归怎么保的(机制,非靠手测)
1. **所有新增 publisher 参数都默认 `'pep'`**:`getGradeCourse/findSemester/findUnit/…(grade, publisher='pep')`、`GaokaoHubProvider publisher='pep'`。不带 `?publisher` → 全部走人教 year*.json,与改前**同一份数据、同一条码路**。
2. **`withPublisher(path,'pep') === path`**:pep 下所有 hub 内部跳转 URL 字节不变(老书签/深链不带 publisher → 默认 pep,直达人教,不弹回不变样)。
3. **DB 关本来就按 `'pep'` 过滤**:阅读/完形/听力/词汇/语法关原本 `publisherForBasePath(basePath)`(无 sp)=`'pep'`,改后 pep 仍解析 `'pep'`——**同一过滤**,只有 `?publisher=sufe` 时才变 `'sufe'`。
4. **初中(/junior)零触碰**:`publisherForBasePath('/junior', sp)` 永远 `null` → 查询不加 `publisher` 过滤;`findUnit` 的上外兜底只对**未在人教/初中命中的** `sufe_*` id 生效(id 全局唯一),初中 7/8/9 单元永不匹配。
5. **类型/构建**:`tsc --noEmit` 0 报错,`vite build` 通过。

## 二、改了哪些文件
**数据源(新增)**
- `src/data/gaokaoHub/sufe-courses.json`(生成物):上外 grade1 = gk_required1+gk_required2 共 8 单元;9 关标准 stages + grammarCodes(s1/s2 前缀)+ 内联 writing/finalReading/(required2 另含 listening/quiz/reading)。9 关内容**全部 DB 驱动**(按 grade+book+unitKey+publisher 取),内联只作兜底/写作水关。
- `scripts/senior-rebuild/_gen_sufe_hub_courses.mjs`:从各单元 JSON + hub.json 生成上述结构。重灌新书后重跑即可。

**publisher 串进链路(改)**
- `src/lib/gaokaoHub/courseData.ts`:加 `coursesFor(publisher)`(sufe→上外/fltrp→空/其它→人教);所有查询函数加 `publisher='pep'` 默认参。
- `src/lib/gaokaoHub/context.tsx`:`GaokaoHubProvider` 收 `publisher`,暴露给 context,`completeStage/addMistake` 的 `findUnit` 带 publisher。
- `src/pages/gaokaoHub/GaokaoHubLayout.tsx`:从 URL 读 `?publisher=` 传给 Provider;底栏/返回链接 `withPublisher`。
- `GaokaoHubSemester / GaokaoHubUnit / GaokaoHubCourse / GaokaoHubHome / GaokaoHubProfile / GaokaoHubAITest`:用 `context.publisher` 取课本结构 + 所有内部跳转 `withPublisher` 保 publisher。
- `GaokaoHubStage.tsx`:跳转 `withPublisher`(关卡 URL 始终带 publisher → 关卡播放器能读到)。

**关卡播放器(共用组件,改)**
- `src/pages/juniorHub/JuniorHubStagePlay.tsx`:
  - 主组件 publisher 改为 `publisherForBasePath(basePath, hubSearch)`(读 `?publisher=`,/junior 仍 null)。
  - 把 publisher 传进 Grammar/Reading/Cloze/Listening 四个 DB 关(它们原本各自 `publisherForBasePath(basePath)` 无 sp → 永远 pep;现优先用传入值,未传则回退原行为)。
  - 子页 `returnTo` 改带 `window.location.search`(保 `?publisher` 回跳不丢);语法综合测/真题测/kp 路径非 pep 时补 `&publisher=`。
- `src/lib/juniorHub/courseData.ts`:`findUnit` 末尾兜底查 sufe-courses(认出 `sufe_*` 单元;人教/初中先命中,零影响)。

## 三、Aaron :8080 自测清单
**人教零回归(必须和改前一模一样)**
- [ ] `/gaokao/hub/1/semester/gk_required1`(不带 publisher):仍是 WU+Teenage Life+…6 单元;点几个单元 9 关都进得去、内容如常。
- [ ] 必修二三 + 选必 各点 1-2 单元:单元列表、9 关、橙/绿环、进度、错题、AI 测 与改前一致。
- [ ] 老深链(不带 publisher)直达人教,不弹回。

**上外能显示(必修一二)**
- [ ] `/gaokao/hub/1/semester/gk_required1?publisher=sufe`:显示 School Life / Language and Culture / Travel / Customs and Traditions(**不是**人教那 6 个)。
- [ ] 点 U1 → 9 关;词汇/语法/阅读/完形/听力关都能读到上外内容(必修一二 SQL 已跑)。
- [ ] gk_required2?publisher=sufe:Nature/Animals/Food/Sports。
- [ ] 关卡内跳子页(语法测/阅读/完形/听力详情)后返回,仍停在 `?publisher=sufe`(不掉回人教)。

**边界**
- [ ] 上外 required3/选必(未灌库):books 页仍"整理中"、进不去(按 DB count 门控)。
- [ ] 外研社(fltrp):books 页整理中;若深链 hub 显示空"建设中"(不泄漏人教单元)。

验过没问题再 push。如要回滚:本接入是独立提交,`git revert` 该提交即可,数据 SQL 不受影响。
