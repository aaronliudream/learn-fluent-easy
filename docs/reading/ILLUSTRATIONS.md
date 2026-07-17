# 图书馆插图 · 勘察 + v1 方案 + 章图映射

> 2026-07 · 给精读阅读器配公有领域插图。只读勘察 + v1 施工规格 + 待审映射表。

## 关键前提(已实测纠正)

**Gutenberg #55 现代版(txt + HTML)都没有内文插图,只有 `cover.jpg`。**
- 我们导入的纯文本 txt 里 `[Illustration]` 标记只有 1 个(封面),已被 `clean-gutenberg.mjs` 去掉。
- `55-h.htm` 配套 `images/` 目录也只有 `cover.jpg`(254KB)—— Gutenberg 自动化版把 Denslow 整套插图剥掉了。

→ **"靠 HTML 的 [Illustration] 标记自动还原图位置"这条路走不通**。改用 Commons 的 Denslow PD 图 + 人工挂章(每章一图,零位置复原)。

## 图源(已核实)

**Wikimedia Commons** 分类 *Illustrations of The Wonderful Wizard of Oz by W. W. Denslow*(~152 文件),两类:
- **场景/角色命名**(~25):`Dorothy and the Scarecrow 1900.jpg`、`Tin Woodman.png`、`Cowardly lion.jpg`、`Emerald City.jpg`、`Glinda.jpg` 等 —— 好核对、好挂章,**v1 首选**。
- **页扫描**(~110):`The Wonderful Wizard of Oz Book - pNNN.jpg`,按书页顺序 —— 补场景命名缺口用。

版权:Denslow 1915 卒、作品 1900 出版 → 美国公有领域;`credit` 存 "W. W. Denslow (1900) via Wikimedia Commons"(好习惯,非义务)。

## v1 施工规格

1. **挑 24 张章首代表图**(下方映射表,**先审再下载**)。
2. **离线管线** `scripts/library/fetch-illustrations.mjs`(照 prewarm-audio.mjs 骨架):按映射下载 Commons 原图 → **降采样到 ~1000px 宽 + 压缩(JPEG q80)** → 传桶 → 出 seed SQL。**必须降采样**(原扫描可达 2000px+,直传拖慢)。
3. **Storage 桶 `library-illustrations`**:公开读、仅 service_role 写、`Cache-Control: public, max-age=31536000, immutable`;路径 `${book_key}/ch${chapter_idx}-${slug}.jpg`。
4. **新表 `library_illustrations`**(待建,不在本轮):
   ```
   id, book_id, chapter_idx,
   position int,          -- 0=章首(v1 只用 0),>0 留给 v2 文中穿插
   image_path text, caption text, alt_text text, credit text,
   width int, height int, -- 必存,防 CLS 布局跳动
   is_published bool, created_at
   ```
   RLS:`SELECT USING(is_published)`、仅服务端写(内容表老套路)。
5. **前端**:`LibraryReader` 切章时 `getChapterIllustrations(bookId, chapterIdx)` 和句子一起取,渲染在章标题下方;`<img loading="lazy">` + 写死 `width/height`(防跳动);每章只取本章图。

## 定稿:章号 → 图 映射(24 章 · 全 Wikisource 逐章核过)

**核对方法**:逐章打开 Wikisource 的 1900 插图版,看每章实际内嵌的 Denslow 插图 + 原书图注,挑"最能代表该章内容的内文场景图"。**统一用内文页扫描(`Book - pNNN.jpg`,同一套 Denslow 双色线稿,风格一致)**,不用彩板/散图,避免混搭。

| 章 | 场景(原书图注) | 定稿文件 | 说明 |
|---|---|---|---|
| 1 | 多萝西storm中抓住托托 | `The Wonderful Wizard of Oz, 014.png` | 换(原 house.jpg 未核)。⚠️此张属另一套上传命名,同书同风格 |
| 2 | "我是北方的女巫" | `Wizoz munch.png` | 换。ch2 实际内文图(北方好女巫/芒奇金) |
| 3 | 多萝西端详稻草人 | `The Wonderful Wizard of Oz Book - p45.jpg` | 统一为页扫描(同场景) |
| 4 | "我昨天才被造出来"稻草人 | `…Book - p55.jpg` | 核正(原图注其实是 ch3 的,已纠) |
| 5 | "这下舒服了"铁皮人 | `…Book - p69.jpg` | 统一为页扫描 |
| 6 | "你不害臊吗!"多萝西斥狮子 | `…Book - p81.jpg` | 统一为页扫描 |
| 7 | 树轰然倒进深沟(卡力达) | `…Book - p97.jpg` | **换**(原 p89 只是章头装饰) |
| 8 | 致命罂粟田 | `…Book - p114.jpg` | **换**(原 p105 是装饰首字母) |
| 9 | "容我引见田鼠女王陛下" | `…Book - p123.jpg` | **换**(原 p115) |
| 10 | ⚠️无守门人图 | `…Book - p137.jpg` 或**留空** | ch10 无确切"城门守卫"插图;p137 是章内用餐场景(弱)。**建议留空**,你定 |
| 11 | 巨大的头颅奥兹 | `…Book - p151.jpg` | **换**(Jellia/Emerald City 根本不在 ch11) |
| 12 | 坏女巫场景 | `…Book - p177.jpg`(备 p185) | ⚠️下载时确认画的是女巫/融化;ch12 内文图多 |
| 13 | 铁匠修补铁皮人 | `…Book - p191.jpg` | **换**(原 p173 其实在 ch12) |
| 14 | 飞猴抓走多萝西 | `…Book - p203.jpg` | **换**(原 p185 在 ch12) |
| 15 | "正是!我是个骗子" | `…Book - p219.jpg` | **换**(我草稿把 p219 误挂到 ch17;它是 ch15) |
| 16 | "我觉得自己有智慧了"稻草人 | `…Book - p235.jpg` | 统一为页扫描 |
| 17 | 热气球升空、奥兹离开 | `…Book - p245.jpg` | **换**(原 p219 是 ch15) |
| 18 | 稻草人坐上大王座 | `…Book - p251.jpg` | **换**(原 p231 在 ch16) |
| 19 | 树枝弯下缠住他 | `Fighting tree.jpg` | ch19 实际内文图(名字虽是散图,即该页插图) |
| 20 | "这些人都是瓷做的" | `…Book - p271.jpg` | 统一为页扫描 |
| 21 | ⚠️狮子/大蜘蛛 | `…Book - p283.jpg` | 在 ch21 蜘蛛段落内,但未确认画面;下载时确认,不对换 p279 |
| 22 | 锤头人弹出脑袋撞稻草人 | `…Book - p291.jpg` | 统一为页扫描(锤头人场景) |
| 23 | 格林达"把金冠给我" | `…Book - p301.jpg` | 统一为页扫描(格林达场景) |
| 24 | 多萝西与艾姆婶婶重逢 | `…Book - p309b.jpg` | **换**(原 p311b 只是尾饰) |

**改动小结**:草稿 24 条里,**改了 ~20 条**——多数是把"章头装饰/装饰首字母/尾饰"或"猜错章"的图,换成 Wikisource 核实过的**真·内文场景图**;并全表统一到 `Book - pNNN` 页扫描风格。3 处仍需下载时肉眼确认:ch10(无守门人图,倾向留空)、ch12(确认画女巫)、ch21(确认画蜘蛛)。ch1/ch2/ch19 用了另一命名的上传,但同属 Denslow 1900、风格一致。

## 难点 / 风险 / 分阶段

- **最大坑=位置复原**:已绕开(每章一图挂 `chapter_idx`)。
- **图片优化**:原扫描大,必须降采样+压缩,离线管线一步到位。
- **风格统一**:优先场景命名的成幅插图,避免混黑白小线稿。
- **? 那 8 章**:无独立命名图,靠页扫描;下载前逐张核对场景,不对就换同章其他页。
- 阶段:v1=每章一图(本文);v2=文中穿插(`position=para_idx`);v3=推广其他书;绘本模式另立(与本轮无关)。

## 边界

SQL 给 Aaron 跑;映射先审再下载入桶;不合 main、不动 P0 /reading、不碰掌握表。
