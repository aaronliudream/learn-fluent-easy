# 图书阅读中心 (Reading Center)

通用、可扩展的阅读中心:学生读文章 / 读物 / 章节,然后做阅读测试。独立分支 `feat-reading-center`,自成一体。

## 范围
- **内容形态(三种都要)**:①分级读物/绘本(graded reader)②整本书/章节(book chapter)③考试型阅读理解(exam passage)。
- **学段全覆盖**:小学 / 初中 / 高中 / 通用 —— 架构从第一天就跨学段 + 跨内容类型,不写死某学段。

## 协作模型
- web Claude 出规划 + 审内容;CC 本地执行;Aaron 真机验收后合并。
- **内容需审核**:阅读原文 / 题目 DB commit 前必须先经 web Claude 审;纯技术/UI 改动可直接推。
- 上传的 zip 是过时副本 —— 一律以本地最新 `main` 为准。

## 文档
- `INVENTORY.md` —— 现有基建盘点(✅可复用/🟡需改造/🆕需新建 + 风险 R1–R7)。
- `DECISIONS.md` —— 决策日志(D1–D10 + 后续 TODO)。
- `ARCHITECTURE.md` —— 表 DDL / 落库链路 / 路由 / 组件方案。

## 分支落地(worktree)
本项目在**独立 worktree** 干,与美语会话互不打架:
```bash
# 从 main 检出执行,worktree 从 origin/main 切(不要从 feat-american-course 切)
git worktree add -b feat-reading-center C:\Projects\learn-fluent-easy-books origin/main
```
之后阅读中心所有活都在 `C:\Projects\learn-fluent-easy-books`(另开 CC 会话,工作目录指向它)。

## 当前状态(2026-07-08)
- ✅ §2 盘点完成 → `INVENTORY.md`。
- ✅ §4 架构对齐 → `DECISIONS.md` / `ARCHITECTURE.md`(含对文档 §4.1 的一处修正:题目 schema 是 `{q,options,answer}` 不是 `num/type/stem`)。
- ✅ §7 开放问题 Aaron 已拍板(全落进 DECISIONS D7/D8/D9):`/reading` 全站一级入口 · 词数分级 · 样板自编初中短文纯人工题 · 整本书仅公有领域文本。
- ⬜ §5 样板(1 篇初中自编分级读物 + 4 题闭环)—— 在 worktree 里开工;内容先回传 web Claude 审,再 DB commit。

## 铁律(摘)
- 禁区文件永不结构性改:`PrimaryHubUnit.tsx` / `unitRoutingConfig.ts` / `PrimaryHubUnitDispatch.tsx` / `PrimaryHubUnitGamified.tsx`(仅允许往 `GAMIFIED_UNIT_IDS` 加白名单字符串)。
- 内容审核铁律:原文/题目落库前先审。
- 待跑 SQL 存 `SQLAA/`,清晰命名,提醒 Aaron 去跑(跑完 `DONE_` 前缀)。
- edge function 改后必 `supabase functions deploy <name>`。
- iOS 音频:`unlockAudioSync()` 必须手势 handler 内同步调用,禁 async/await。
- 题目语义匹配:题干==答案,三干扰项都可验证为错。
- 找不到合法内容源就停下问 Aaron,绝不编造原文/题目。
