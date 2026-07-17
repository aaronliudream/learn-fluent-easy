# DECISIONS — 图书阅读中心(feat-reading-center)

记录容易踩错、影响多处的关键约定。新决定往上加,写清「为什么」。

---

## 插图 position 语义 = 章内段号(1-based),不是全书 para_idx
**日期**:2026-07-12

`library_illustrations.position` 表示「这张图渲染在**本章第 position 段之前**」,段号从 **1** 开始按**章内**计数:

- `position = 0` → 章首(所有正文之前)
- `position = P`(1 ≤ P ≤ 本章段数)→ 本章第 P 段之前
- `position > 本章段数` → 章末
- `position < 0` → 退休图隔离用,**不渲染**(退休 = is_published=false + position 挪负数)

**为什么写死这条**:`library_sentences.para_idx` 是**全书连续递增**的(`build-seed.mjs` 的 `let para=0` 在章循环外、跨章不重置),不是每章从 1 起。例:ch1 = para_idx 1..20,ch2 = 21..79,ch3 = 80..135……

历史 bug:渲染端曾用 `position === para_idx`(全局)、`position < 首段para_idx → 章首`。于是给 ch2 写的 position=2/6/11 全 < 首段 21 → 全落「章首」分支、堆在正文最前。ch1 只是**碰巧对**(offset=0,章内序号==全局序号)。这是会影响 **ch2 及之后每一章**的系统性错。

**修法(根因,非补丁)**:`LibraryReader.tsx` 改成用段落在本章数组里的**下标+1**作章内段号来比对 position(段落已按 chapter_idx 拉取),`topFigs = position===0`、`tailFigs = position>本章段数`。作图时**一律按「章内第几段」写 position**,直觉、跨章一致、零偏移量心算。

**作图口径**:一本书的 position 全用章内段号;`0` 专留章首图;退休老图挪负数。
