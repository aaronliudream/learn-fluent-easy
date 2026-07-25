# DECISIONS — 图书阅读中心(feat-reading-center)

记录容易踩错、影响多处的关键约定。新决定往上加,写清「为什么」。

---

## 绘本模式:chunk 表 = library_sentences(reading_book_chunks 不存在)· ⚠️ 触红线 5,待 Aaron 拍板
**日期**:2026-07-24

绘本模式样张指令书 §2 要求 `alter table reading_book_chunks add image_url, page_index`。**这张表在本库不存在**:

```
GET /rest/v1/reading_book_chunks → 404 PGRST205
"Could not find the table 'public.reading_book_chunks' in the schema cache"
hint: "Perhaps you meant the table 'public.library_chunks'"
```

`/library/:bookKey/read` 这条链路上真实存在的表只有:
- `library_sentences` —— 正文内容原子,**一行 = 一句**(伊索 ch1 = 11 句 / 3 段),阅读器 `getChapterSentences` 就读它;
- `library_chunks` —— 是**语块(固定搭配)**表(正文虚线那套),不是"绘本页";
- `library_illustrations` —— 章内插图(position = 章内段号,见下一条)。

这触发了指令书红线 5(「需要改 schema 以外的表结构 → 停」)。**本轮按下面的口径先做,请 Aaron 确认或改判**:

**决定**:两列加在 `library_sentences` 上,`page_index` 允许**同页多句共号**(一页 = 一组连续句),
`image_url` 存**桶内相对路径**(沿用 `library-illustrations` 公开桶,不建新桶)。伊索 ch1 恰好 3 段 = 3 页,
与指令书「查出 3 条 chunk」对得上 —— 指令书说的"chunk"实为**段落**。

**为什么不新建 reading_book_chunks 表**:红线 3 明文"不新建表";且正文只有一份事实来源,
另起一张页表会和 `library_sentences` 的 seq/para_idx/audio_url 分叉,点词/朗读/进度全要各写一套。

**兜底**:前端 `buildPages()` 在 `page_index` 全空时**按 para_idx 回退分页**,`getChapterSentences`
在两列不存在时(42703)自动退回基础列。=> SQL 没跑之前绘本模式也能正常显示,不报错、不白屏。

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
