# 美语课程 · 逐题解释(④ perq)管线规范

> 分工铁律:**内容(解释文案)Aaron 出,CC 只管管线**。CC 生成"填写模板"→ Aaron 填 →
> CC 落库。解释逐字使用,勿改写勿增删。

## 一、防旧快照复发(2026-07-04 立,起因:am1 单元2 模板基于丰富化前旧快照,40/222 死题)

1. **现查 DB,禁缓存**:任何"填写模板"或 perq SQL,生成时必须**实时查 DB**取 qid/payload,不许复用旧 md/缓存。
2. **qid 存在性前置校验**:CC 在发模板/出 SQL **之前**必须跑一遍 (stage,seq)→qid 全命中校验,
   把 **"命中 N/N + 生成时间(ISO)"** 写进模板头/SQL 头。校验前置,不能等填完 222 条才发现死题。
3. **断言必附证据**:凡文档头写"带 DB 实际答案""覆盖率 X""零重合"之类断言,必须同时给出**当次实测证据**
   (计数/命中率/对账),不得凭记忆或旧状态声称。

## 二、模板必带字段(Aaron 才能写"意思+场合"型解释)

- 通用:qid + 题干 + 选项 + **DB 实际答案**。
- **关8 听力题**:附「听力原文」= american_sentences 播放内容(听的是哪几句)。
- **关9 情景题**:题干即**完整场景描述**(payload.stem 全文)。
- 生成器:`scripts/american/gen-perq-template.mjs <out.md> <stages> <lesson...>`(已内置上述三条)。

## 三、落库三重校验(出 SQL 后、发 Aaron 前必跑)

1. **计数对账**:前 with_expl → 后 with_expl,报"前 X 后 Y"。
2. **答案词命中**:每题 DB 正确答案(或其核心词)出现在该题解释中;宽松归一后仍不命中的**逐条列出人工核**
   (防措辞改写误报,非串味则放行)。
3. **情景题防串味**:关8/关9/关10 情景类解释**零语法术语**(主语/谓语/系动词/句型/时态…)。

## 四、解释文案硬规则

- **禁引选项字母(a/b/c/d)**:选项经 LCG 打散后位置因人而异,字母会指错。只引用选项内容本身。
- 语法题:规则 + 正例(✓)+ 易错点。情景/套话题:这句话意思 + 什么场合用。
- 术语首现:白话拆解本题句子(见 terminology_spec.md §一.3)。

## 五、幂等落库口径

- `UPDATE ... SET payload = payload || jsonb_build_object('explanation_cn', …) WHERE id='<qid>';`(按 qid,幂等可重跑)。
- ⚠️ **seed 与 perq 一致性**:seed 用 `ON CONFLICT DO UPDATE SET payload=EXCLUDED.payload` 会覆盖整个 payload。
  故 am2 seed 生成器(gen-book2-seed.mjs)已内置合并 `<id>_explanations_final.md`,重跑 seed 不抹解释。
  第一册(build_perq 路线)如需重跑基础 seed,须在其后补跑对应 perq。
- 镜像 SQLAA/,Aaron service role 跑,CC anon 验前后计数。
