# 图书馆建书手册 (LIBRARY BOOK PLAYBOOK)

> **用途**：新增一本图书馆书籍时，CC 照此手册自主执行，无需 Aaron 逐层指导。
> **来源**：鲁滨逊漂流记全流程 + 四本书技术债清理的实战沉淀。
> **地位**：与 `CONSTITUTION.md` 同级的执行规范。凡本手册已规定的，不必再问 Aaron。

---

## 0. 铁律（违反必出事，无例外）

| # | 铁律 | 代价（真实踩过） |
|---|---|---|
| 1 | **SQL 一律 `ON CONFLICT ... DO UPDATE`，禁止 `DO NOTHING`** | 330 条 chunk 多版叠加，DB ≠ 任何单一版本，ch6 DB 22 条 > SQL 声明 14 条 |
| 2 | **DELETE 严格限 `book_key/book_id AND chapter_idx`；只删 `library_chunks`，永不删 `phrase_explanations`** | 卡片是全局共享的，删了影响其他书 |
| 3 | **含 `\b` 的正则只能用 Write 工具落文件**，inline 和 heredoc 都会吃转义 | 踩 4 次；导致喂给子代理的 ctx 全空、35 个候选凭空猜 |
| 4 | **造任何新内容前，先查现有表有没有** | 28 条候选里 15 条是已有的，一半工作量白做 |
| 5 | **边缘函数永不实时 AI 生成**：三查找器全 miss → 返回 `not_found` | 大陆用户点词等 5–15 秒，比没这功能还糟 |
| 6 | **所有 SQL 由 Aaron 在 Supabase Dashboard 跑**，CC 只出文件 | CC 只有 anon key，被 RLS 挡住 |
| 7 | **审核从原始文件读，不看自述报告** | CC 自查通过的批次仍有问题；反之 Web Claude 凭粗糙 grep 误报过两次 |

---

## 1. 建书流水线（8 层，按序执行）

```
① seed 正文+中译  →  ② 封面  →  ③ 点词词典(全词覆盖)  →  ④ 词干回退护栏
        ↓
⑤ chunk 语块  →  ⑥ 按书覆盖(library_word_senses)  →  ⑦ 多义卡  →  ⑧ 发布
```

**每层的通用节奏**：先做小样 → Web Claude 审 → 定标准 → 批量铺开 → 每批审 → Aaron 跑 SQL → 真机验。
**绝不**：全量造完再审（返工代价极大，多义卡样板审出收藏取义 bug 就是靠这个顺序省下的）。

---

## 2. 各层规范

### ① seed（正文 + 中译）

- 源：Gutenberg 公版；**逐句原文，不改写**（除非明确定为改写版）
- 结构：`chapters[] → paragraphs[] → sentences[]`，全书连续 `seq`
- 中译：文学质量，非直译
- `is_published` 初始 `false`，全部层做完再翻 `true`
- 元数据：`age_band`（儿童/少儿/青少年）、`visibility='public'`

### ② 封面 / 插图

- 元素取自书中真实意象，避免通用书籍插画
- **儿童内容适宜性先于美学**：无裸露、暴力、宗教/死亡意象、负面联想词
- 涉及族裔角色时以尊严姿态呈现

**插图铁律（2026-07-20 补，血的教训）**

- 🔴 **AI 生成的插图一律不自动上线，必须人工逐张过目通过才入库**。生成 → 发 Aaron 看 → 通过才 process/传桶/写库。杜绝"生成即上线"。
- 🔴 **高危构图优先改构图，而非改提示词**：AI 对某些构图（**倒下的树 / 动物拟人 / 横躺的物体 / 密集肢体**）模型先验弱，靠加词、加负面词压不住，换个构图角度才是根治。
- 反例（fir-tree ch5，已撤下）：构图=「整棵倒下的枯枞树占画面主体，一个孩子在摸它」。AI 把倒树渲染成**金色巨虫**——树干成分节肉质囊体、侧生细枝成节肢腿、松针树皮质感全无。根因三合一:①倒树本身模型弱 ②"金箔星"的金色泛化到全树 ③侧生细枝触地必被读作腿。**改词重生成无效,必须换构图**。改法=特写「金箔星＋孩子伸手」、枯枝只露几根梢、**树主体出画**；材质硬约束(dried fir/brown pine needles/woody bark/straight woody trunk、只有星是金)＋负面词(no creature/insect/larva/limbs、not an animal)。

### ③ 点词词典（read-v1 卡）—— 全词覆盖，一个不跳

**这是最容易出错的一层，规范最细。**

**覆盖范围（不许跳任何一类）**
- ✅ 实义词、生僻词、航海/宗教/专业词
- ✅ **专名**（人名/地名/民族/船名）→ `proper: true`，前端隐藏收藏钮，但**必须有解释**（"不该收藏" ≠ "不该有解释"）
- ✅ **基础常见词**（coast/impossible/supply/labour）—— 曾以"太基础"跳过，结果这些**恰恰是读者最常点的**，没卡就落实时生成、等 15 秒
- ⛔ 唯一可省：能被词干回退安全覆盖的规则屈折形（见 ④）

**🔴 铁律（2026-07-20 补，fir-tree 血教训）：回读 ctx 检验的范围 = 本书正文会呈现的【全部卡】= 新造 + 已有全局卡，不是只检验新造那批。**
- 覆盖率统计里"已有全局卡 654 张"**不等于**"这 654 张对本书都是对的"。read-v1 是全局共享词典，很多旧卡是**脱离语境批量造**的，把罕见义/次要义/错词性当了默认义（fir-tree 实测 654 张旧卡里 ~28 张回读不通：withered=使羞愧→枯萎、hang=见鬼→悬挂、star=明星adj→星星n、squeak=告密→吱吱叫、nurse/plant/troop/rest/court/matter 词性+次要义错配）。
- **做法**：coverage 判为"已覆盖"的旧卡,**逐张拿本书 ctx 回读**;不通的——若是全局普遍错(罕见义当默认)→**改全局卡**(B,把默认义改成主流义,连带修好其他书);若某本确实依赖旧义→**退回按书覆盖**(A,library_word_senses)。默认走 B、A 是例外。
- 出修正审稿每条带：现全局义 / 拟改默认义 / 本书出处 ctx / 其他书是否有依赖旧义的出处（决定 B 还是 A）。

**卡片字段（8 项，缺一不可）**

| 字段 | 规范 |
|---|---|
| `word` | 必须 == SQL 的 `phrase` 值 |
| `pos` | 按**书中实际用法**定，不按词典首义 |
| `ipa` | **必须美音**、必须含真音标符号（`ɪ ː ə ɛ æ ʌ θ ð ʃ ʒ ŋ ɔ ɑ ɜ ʊ ɡ` 至少一个）；禁 `/SKIN/` 占位、禁 `/bim/` 类 ASCII 拼写 |
| `gloss_cn` | 贴**书中义**；末尾无句号；非描述式 |
| `gloss_en` | 对应同一个书中义（中英必须同义，否则 English only 复习会错）；小写开头、末尾无句号、≤12 词、不循环定义 |
| `example.en/cn` | **另造简单句，严禁抄原文**；例句本身要能说明用法 |
| `sense_key` | 小写英文语义键，近义同 key |
| `senses[]` | 可选，多义词才有（见 ⑦） |

**释义判定三条判据**
1. **回读检验**：拿 gloss_cn 回读该词的书中出处句，**逻辑通不通**？不通即错。
2. **判据是"义盖不盖得住"，不是词性**：`attends` 虽是规则动词变位，但 `attend` 卡="出席"盖不住书中"降临"义，故仍需独立造卡。
3. **多义词写通用一点**：别只写最高频那个引申义。`punctuate` 只写"讲话中穿插"，就盖不住"用动作配节奏"那处。

**审核抽样规则（Web Claude 审时按此组织审稿）**
- **古今异义（false friend）→ 必须全量扫，抽样天然抓不到**（它们伪装成常见词，不进任何"生僻词"筛子）
- 航海词 / 宗教词 / 题材专业词 → 全抽或大比例抽
- 专名 → 大比例抽（事实性内容，角色/地名说错风险高）
- 普通实词 → 随机 25–30
- **每条必带书中出处 ctx**，否则无法核释义贴不贴语境

### ④ 词干回退护栏

**目的**：规则屈折形（goats→goat）不必逐个造卡，但**必须有护栏**，否则显示错卡。

**查找顺序（不可调换）**
```
表面形直查 read-v1  →  命中即返回（leaves/lives 有卡就走这条，永不进剥词干）
      ↓ miss
EXCLUDE 排除集      →  命中即放弃回退（改真造卡）
      ↓
不规则映射表        →  irregular-first，必须先于规则剥离
      ↓
规则剥离            →  最小剥离优先 + 长度护栏
      ↓ 剥出的 lemma 必须在 read-v1
返回 lemma 卡；否则 not_found
```

**护栏细则**
- 禁裸 `d`（否则 `god → go`，159 次高频，灾难）
- `s` 仅词长 ≥5 才剥（保 is/has/this）
- **最小剥离优先**（否则 `noted → not`，而 `not` 在库里，闸门放行 → 显示错卡）
- **不规则映射先于规则剥离**（否则 `leaves → leave`、`lives → live` 被规则先命中）
- ves→f 族入映射：leaves/lives/halves/shelves/thieves/loaves/wives/knives/calves/wolves

**EXCLUDE 排除集（复数义 ≠ 单数义，闸门拦不住，必须排除）**

已验证的约 97 词，含：
`goods rights works waters senses thanks arms means pains stores provisions woods hands manners spirits irons quarters relations airs parts effects colours glasses sands pieces wits grounds forces terms papers necessaries remains letters customs contents heavens spectacles odds looks bounds sails staves spies judges watches returns wounds shots springs troops wills characters states interests impressions conditions measures virtues wonders crosses fronts rushes attends casts hurts shoots wrongs husbands fevers wells flags wedges squares paces trades`

**通用闸门（比人工列表可靠）**：对所有名词复数回退对，跑"回读 ctx"检查——拿单数卡 gloss_cn 配复数形在书中出处句回读，不通就排除。

**⚠️ 必做一步**：生成 pairs 列表（原形→词干）**人工扫一遍**。护栏拦不住"剥出的是另一个真词"这类（`noted→not` 就是靠扫 pairs 才发现的）。

### ⑤ chunk 语块

**收录标准**
- ✅ **逐词猜不出**的固定搭配 —— 这是唯一标准
- ✅ **题材固定搭配务必收**：航海（come to an anchor / before the wind / spring a leak / all hands / weigh anchor / slip a cable / shoulder-of-mutton sail）
- ✅ **老式构式务必收**：`what's gone with sb`、`let on`、`make out`、`take and + 动词`、`a power of`
- ⛔ **语境自明的不收**：`I reckon`×64、`by and by`×20 —— 收了虚线满屏，**稀释真正需要提示的地方**

**关键架构（不要按"规范键"思路改，会点坏）**
- **chunk 查卡按表面形（surface form）**，不是按规范形
- 因此**每个表面形一张卡是必要的**（`come up with` 和 `came up with` 两张卡 = 正确）
- 因此 `normalized` **必须存实际屈折形**（`took him by surprise`），存规范形会导致点不出卡
- `library_chunks` 只索引正文真实出现的表面形 → 划线、卡、occ 三者天然一致

**字段规范**
- `head` 规范形、`occ: [[seq, 实际表面形]]`
- `literal[]` 逐词拆解 + `note_cn` 消歧（`leave off` 标"非离开"、`bound for` 标"此 bound 非捆绑"）
- `note` 讲清用法/词源/古今义（`to the bitter end` 讲锚缆放到 bitt 缆桩末端）
- 按章消歧：同一 chunk 在本章是哪个义要写明（`clear up` 标"本章为天气义"）
- 可分式（`took him by surprise`）→ **整段划线含宾语**，不用 cardOnly（cardOnly = 无虚线 = 读者根本不知道这是搭配）
- 中间插入过长（5+ 词宾语）才退 cardOnly
- **`occ` 为空的 chunk 必须删除**（无出处 = 永不触发的废卡）

**clean-rebuild 模板（每章一个事务）**
```sql
BEGIN;
  -- 卡片：upsert，不删
  INSERT INTO phrase_explanations (...) VALUES (...)
  ON CONFLICT (normalized, target_lang) DO UPDATE SET ...;
  -- 索引：先删本章，再重插
  DELETE FROM library_chunks WHERE book_id=<本书> AND chapter_idx=<本章>;
  INSERT INTO library_chunks (...) VALUES (...)
  ON CONFLICT (book_id, chapter_idx, term, src_seq) DO UPDATE SET ...;
COMMIT;
```

### ⑥ 按书覆盖 `library_word_senses`

**为什么需要**：read-v1 是**全局共享词典**，一个 term 全站只有一张卡（取首现版本）。同一个词在不同书里义不同时，全局卡必然有一本是错的。

**表结构**：`book_key, normalized, ipa, pos, sense_key, gloss_cn, gloss_en, archaic, modern_cn, modern_en, example, proper`

**三类内容进覆盖表**
1. **撞名专名**：`Tom`（鲁滨逊=水手汤姆·史密斯 / Tom Sawyer=主人公）、`spaniard`、`america`、`bob`、`latin`
2. **实词真分歧**：`coast`（海岸 / coast clear 无人无险）、`letter`（文书证书 / 字母）、`secure`（v.保护 / adj.安全放心的）、`sick`（晕船 / 生病）、`depended`（取决于 / 悬垂）
3. **古今异义（false friend）**：`design`（打算意图 / 设计）、`train`（火药引线 / 火车）、`lucifer`（火柴 / 路西法）、`meat`（食物活物 / 肉）、`orgies`

**铁律**
- **全局卡放现代义**（这样将来新书自动正确），**古义走按书覆盖**
- **只装真分歧，不装近义**（否则变成"每本书一套词典"，全局共享失去意义）
- 两书同义 → **不建行**，全局留一张（`god` 就是这么处理的）
- 某义在书中是少数出处 → **不建行**（`mean` 25 处里 21 处是现代义"意思是"，只 4 处"低微"，故不建）
- 中英文都要贴书中义（`gloss_en` 也是书中义，否则 English only 复习照样误导）
- 复习出题取**书中义**

**古今异义扫描流程（唯一可靠的做法）**
```
① 对全书正文做文本级扫描（不是卡片级！queer/gay/awful 是常见词，已在全局卡里、不在 gap 里）
② 文件脚本抽真 ctx（含 \b 一律用 Write 落文件）
③ 子代理判：书中义 vs 现代义
④ ⚠️ 逐个核实真 ctx，剔假阳性 ← 这一步不能省
⑤ Web Claude 审
⑥ 出 SQL
```
**第 ④ 步的价值**：35 个候选里剔出 4 个假阳性——`quarry` 书中是"old quarry 采石场"（现代义），盲扫标成"猎物"，读者点了理解不通还以为自己英语差。

### ⑦ 多义卡 `senses[]`

**何时需要**：一个词在书中**既作名词又作动词**（`skin` 名词皮肤 / 动词扒皮）。

**检测器（便宜，先跑）**：扫每个词在书中的句法位置，同词既出现在名词位（前接 the/a/my 或后接 of）又出现在动词位（前接情态/助动/let/I'd），且各 ≥2 次 → 高危。
实测四本书命中 57 张，真多义 33 个。**其余 ~6960 张单义卡在书里就是单词性，不受影响。**

**schema（纯加法，零 DDL 风险）**
```json
{
  "word": "...", "pos": "...", "ipa": "...", "gloss_cn": "...", "gloss_en": "...",
  "example": {...},
  "senses": [
    {"pos":"v.", "gloss_cn":"...", "gloss_en":"...", "ipa":"...", "example":{...}, "sense_key":"..."},
    {"pos":"n.", ...}
  ]
}
```
- **老卡零迁移**：无 `senses[]` 的卡按平铺字段渲染（= 视作 `senses[0]`）
- **每义可带独立 ipa** —— 这是多义卡的核心价值（`present` 动 `/prɪˈzɛnt/` vs 名 `/ˈprɛznt/`；`lead` v.`/liːd/` vs n.铅 `/lɛd/`；`judge` 同理）
- **主义（书中义）在上，次义折叠**

**主义判定：按全书频次，不按第一处出现**
- `smoke`（Tom）：动词 ≈16 > 名词 ≈7，且 ch16 学抽烟斗是整章核心 → 主义 = v. 抽烟
- `judge`（鲁滨逊）：19 处全是"评估推断"，0 处法官义 → 主义 = v. 评估
- `lie`（Tom）：躺 18 ≫ 说谎 2 → 主义 = v. 躺
- **双主义并列**也可以（`fire` 火焰 + 开火在鲁滨逊都高频）

**按 occ 取义（显示 + 收藏都要走）**
```
① 屈折形优先（最强信号）：fired/firing/smoked/judging → 动词，接近确定
② 前置词线索：the/a/of → 名词；to/情态/助动 → 动词
③ 分级回退：解析不出 → 该书主义 sense_key → senses[0]（= 最坏等于旧行为，不会更差）
```
- 卡片**显示顺序**随点词位置变（在 `fired a gun` 处点词，"开火"排最上）
- **收藏冻结当次 sense_key**（`library_vocab_favorites.sense_key`），复习测那个义

**不为书中不存在的义造义项**：`a lick of`（丝毫）四本书 0 处 → 不补。按证据，不按词典完整性。

### ⑧ 发布

- 检查 `is_published=true`、`visibility='public'`、`age_band` 正确
- 图书馆入口 flag（`LIBRARY_HOME_ENABLED`）与首页 section 已是常开，**无需再翻**
- 难句卡、插图为可选增强，**不阻塞发布**

---

## 3. 质量闸门（机器可验证，生成时自动跑，不过就报错退出）

**内容闸**
- [ ] 例句抄原文 = 0（扫原文特征词）
- [ ] gloss 末尾句号 = 0
- [ ] 描述式释义 = 0
- [ ] `gloss_en` 缺失 = 0
- [ ] 8 字段非空
- [ ] `ipa` 含真音标符号，且无 `rr` / `ːː` 等非法叠加
- [ ] 儿童适宜性：无露骨/暴力/宗教死亡意象

**结构闸**
- [ ] **逐行原子校验**：每行的 `phrase` == 该行 `explanation.word`（**必须在同一行内取两个值，禁止用两个 regex 分别抓再按下标配对**）
- [ ] 头部声明卡数 == 实际 INSERT 行数
- [ ] `occ` 非空；surface 逐字命中出处句
- [ ] 跨章去重

**SQL 安全闸**
- [ ] `BEGIN` / `COMMIT` 成对
- [ ] `DELETE` 限本书本章
- [ ] 两处 `ON CONFLICT` 都是 `DO UPDATE`
- [ ] `phrase_explanations` 无 `DELETE`

**报告要求**：逐条列出校验结果（PASS/FAIL + 数字），不写"自查通过"；并贴 3 条实际卡的 head+gloss+example 供人眼扫。

---

## 4. 架构边界（不要尝试，已验证不值当）

### ⛔ 同词性多义 + 各出处义不同

`pens` 在书中：笔 ×2 + 圈栏 ×1。卡片写"笔"对大多数出处。
同类：`troops`（军队/群）、`waters`（大水/药酒）、`mounted`（架设/登上）。

**三套现有机制全部覆盖不了**：
- 多词性检测器 → 抓不到（找的是名词位 & 动词位冲突，这里两个都是名词）
- occ 解析器 → 分不开（靠词性线索，两个都是名词）
- `library_word_senses` blanket 覆盖 → **会帮倒忙**（为 1 处圈栏覆盖，读破 2 处笔）

**唯一解是 per-occ 逐出处标注，成本极高、ROI 极低。窄释义票已关闭。以后遇到别当新问题重开。**

### ⛔ 可推导规则 vs 不可推导词汇事实

- `\b` 那类是**可推导规则**被硬编码 → 该用规则
- **lot-cloth split 是不可推导的词汇事实** → 只能用词表

现代美语中 `cost/lost/off/cross/dog/long` 读 `ɔː`，而 `possible/hospital/hostile` 读 `ɑː`，**音位环境完全相同**。写成规则会误伤 30 个。这种情况**词表才准，规则反而错**。

cloth-set 词表：`off cost lost frost cross loss cloth moth broth soft often office cough dog long song strong wrong gone boss toss moss across along belong coffee soften aloft froth`
**匹配必须精确整词或标准屈折（-s/-ed/-ing/-ly），绝不前缀**：`cost≠costume`、`long≠longitude`、`clothes` 是 `/kloʊðz/` 不属于 cloth-set。

---

## 5. 音标标准

- **全站统一美音**（app 其余板块全美音、OpenAI TTS 念美音，眼耳必须对得上 > 还原作者国籍）
- 确定性英→美映射（**用规则，不用 AI**，AI 同词跑两次会给不同结果）：
  - `əʊ → oʊ`
  - `ɜː + 拼写 r → ɜːr`
  - `ɑː + 拼写 r → ɑːr`
  - 词尾 schwa + 拼写 r（-er/-or/-ar/-our/-re/-ure）→ `ər`
  - `ɒ → ɑː`（cloth-set 例外见上）
- 生成侧硬闸：`define-words` 边缘函数拦截无真音标符号的 ipa

---

## 6. 阅读体验（已上线，新书自动继承，无需重做）

**计时**：心跳 5s，仅当 `visible && focused && !idle` 才加秒
- `window.blur/focus` 是**台式机关键信号**（双屏用户切到 Excel 时标签页仍 `visible`）
- 动态 idle 阈值 = 视口可见词数 ÷ `READING_WPM` × 2，clamp [60s, 300s]（手机一屏 ~60 词 → ~72s；台式宽屏 ~300 词 → ~300s）
- 多标签不会翻倍：聚焦闸 + 云端 `mergeLibraryState` 取 `Math.max` 而非求和

**完成度**：`furthest_seq` **只在活跃心跳期间**推进（"扫过 ≠ 读过"）；目录跳章、`scrollIntoView` 续读定位、朗读挂机都不推进

**分节里程碑**：`M = clamp(round(章词数 / 300), 3, 10)`，章 < 600 词不分节；贪心在**段落边界**切，绝不按句数机械切；段间发丝线 + `N / M` 淡灰小字，**无弹窗/撒花/音效**

**剩余时间**：顶部「本章约剩 T 分钟」，个人 wpm 由心跳实测（活跃 ≥120s 且读过 ≥50 句），clamp [60, 250]，不足退 `READING_WPM`；T<1 显"不到 1 分钟"

---

## 7. 协作与审核协议

**分工**
- Web Claude：分析、内容审核、SQL/规范审查 → 出结论
- CC：本地执行、生成、git、边缘函数部署（部署为 gated，等 Aaron 发话）
- Aaron：Supabase Dashboard 跑 SQL、真机验收、产品决策

**审核铁律**
- 从**原始文件**审（bash 读盘），不审自述报告
- **逐行原子解析**：一行内同时取 phrase 和 gloss。用三个 regex 分别抓再按下标 zip 会误报（Web Claude 因此误报过两次：SQL 转义单引号 `out of one''s wits` 导致 rows 只抓到 11 条而 gloss 抓到 16 条；`grep -c "DO NOTHING"` 把注释也数进去）
- 文件上传给 Web Claude 常为空 → **粘文本或截图**最可靠

**CC 的正确行为（已验证，应保持）**
- 不盲从 Web Claude 的裁定，去核实证据后反驳（`characters` 是真分歧、`attends` 该保留排除、`pretend` ch8 确是"假装"、ch3/4 没有错位）
- 发现自己搞砸时主动说（`\b` 导致 ctx 全空那次）
- 跨红线操作前先查状态（合并 main 前确认图书馆是否已首次公开）
- 不为凑数收假阳性（`light out` = 扑灭蜡烛、`a sight of` = catch sight of，都主动剔除）

---

## 8. 新书检查清单（逐项打勾）

```
[ ] ① seed：章节/句子/中译/元数据，is_published=false
[ ] ② 封面：书中意象、儿童适宜性
[ ] ③ 词典：全词覆盖（专名 proper:true / 基础词一个不跳），8 字段齐，美音
[ ]    └ 古今异义全量文本级扫描 → 逐个核真 ctx → 剔假阳性
[ ]    └ 按类别出审稿（航海/宗教/专名/随机基础词），带书中 ctx
[ ] ④ 词干回退：EXCLUDE + 不规则映射优先 + pairs 列表人工扫一遍
[ ] ⑤ chunk：逐词猜不出才收，题材/老式固定搭配务必收，语境自明不收
[ ]    └ 每章 clean-rebuild（DELETE 限本章 + DO UPDATE + 同事务）
[ ] ⑥ 按书覆盖：撞名专名 + 实词真分歧 + 古今异义（只装真分歧）
[ ] ⑦ 多义卡：检测器 → 高危词 → senses[] → 按 occ 取义 + 收藏冻结 sense_key
[ ] ⑧ 发布：is_published=true
[ ] 全程：每批过质量闸 → Web Claude 审 → Aaron 跑 SQL → 真机验
```

---

## 9. 历史根因（已全部结构性关闭，勿重蹈）

| 根因 | 表现 | 解法 |
|---|---|---|
| `DO NOTHING` 多版叠加 | chunk 330 条版本混乱，DB ≠ 任何单一 JSON | clean-rebuild + `DO UPDATE` |
| 边缘函数实时 AI 兜底 | 大陆点词等 15 秒 | 三查找器全 miss → `not_found`；全词覆盖 + 词干回退 |
| 计时只认 `visibilityState` | 显示"已读 20 小时"、完成度 41% 但续读在第 1 章 | `visible && focused && !idle` 状态机；`furthest_seq` 只在活跃心跳推进 |
| 一词=一卡=一义，且只看首处 ctx | punctuate / ancient / skin / judge / present / fire | 多词性检测器 → 33 词 `senses[]` → 按 occ 取义 |
