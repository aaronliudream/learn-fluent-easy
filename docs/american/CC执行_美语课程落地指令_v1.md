# 【CC执行】美语课程落地指令 v1.0
> 依据文档：《美语课程_内容生产规格_v1》《美语课程_关卡结构_v1.1》《美语课程_72课语法大纲_v1》
> 内容源：《美语第1课_定稿v2.md》《美语课程_批次1_第2-6课.md》（单元1全部6课，内容已定稿，禁止改写内容本身）

## 0. 硬约束（先读，全程有效）

1. **禁触文件**：`PrimaryHubUnit.tsx`、`unitRoutingConfig.ts`、`PrimaryHubUnitDispatch.tsx`、`PrimaryHubUnitGamified.tsx` 一律不碰。
2. **iOS 音频铁律**：所有播放入口必须在手势回调内**同步**调用 `unlockAudioSync()`，禁止 async/await 包裹。
3. **数据互通铁律**：掌握度绑定内容 ID（词/考点），答对 2 次 = 掌握；未来任何美语专项板块必须读写同一份 american 掌握表，禁止另建进度表。
4. **SQL 规范**：所有待执行 SQL 写入 `SQLAA/`，命名 `american_phaseN_xxx.sql`，执行完由 Aaron 改前缀 `DONE_`。Supabase 项目 ref：`degqpiiddkxcuzwombwp`。
5. **Git**：新建分支 `feat-american-course`，本地提交，**真机验收通过前不 push**。
6. 若涉及 edge function，改动后需单独 `supabase functions deploy`（Vercel 只发前端）——本期预计纯前端 + SQL，无 edge function 改动，若发现需要，先停下来报告。
7. 产品页面内不得出现"新概念 / NCE"字样。

## 1. Phase 1：建表 + 种子数据（SQL 到 SQLAA/）

**方案 A（已定）：新建 american_* 表，掌握表结构照抄 junior 同名表。**
先读取 `junior_user_mastery`、`junior_word_mastery` 实际 schema，字段与判定口径 1:1 照抄（改表名前缀），确保掌握逻辑代码可直接复用。

内容表（RLS：内容表匿名可读，用户表 user 自域读写，参照 junior 区现行策略）：

```
american_lessons        -- 课
  id text pk            -- 'am1_l01' ... 'am1_l72'
  unit_no int           -- 1–12（单元tab）
  lesson_no int         -- 1–72
  title_en text, title_cn text
  grammar_focus text    -- 本课语法目标（中文短语）
  scene text            -- 场景标签
  prelisten_question jsonb  -- {q, options[], answer_index}

american_sentences      -- 课文逐句（关1点读/对照）
  id uuid pk, lesson_id fk
  seq int, speaker text
  text_en text, text_cn text
  audio_key text        -- 音频文件键，见 Phase 4

american_words          -- 生词（关2/3/4）
  id uuid pk (uuid5(lesson_id + word) 保持幂等), lesson_id fk
  word text, ipa text, pos text, meaning_cn text, example text

american_grammar_points -- 语法考点（关5掌握度绑定用）
  id text pk            -- 'am1_l01_gp1'
  lesson_id fk, name text, body_md text

american_questions      -- 各关题目
  id uuid pk, lesson_id fk
  stage int             -- 5语法 / 6美语点睛小测 / 7填空 / 8听对话 / 9情景 / 10通关
  grammar_point_id text nullable
  qtype text            -- choice / cloze / transform / scenario
  payload jsonb         -- {stem, options[], answer_index/answer_text, blank_no?}
  ⚠️ 选项顺序按 assignAnswerPositions 配额规则打散后入库，不得全 A

american_amencontrast   -- 美语vs英语对照（关6）
  id uuid pk, lesson_id fk, us text, uk text, note_cn text

american_user_mastery / american_word_mastery  -- 照抄 junior 结构
american_lesson_progress -- 每关完成度：user_id, lesson_id, stage, completed_at
```

种子数据：把 6 个课程 md 文件解析为 SQL insert（或 seed 脚本）。**内容一字不改**，仅结构化。逐句表的 speaker 从"TYLER:"前缀拆出。

## 2. Phase 2：路由 + Hub 页

- `/american` → 课程首页（12 单元 tab，仿 gaokao hub 册tab 布局；单元 1 亮，2–12 显示"制作中"）
- `/american/hub/{unit}` → 6 张课卡（卡面：课号、英文标题、场景 emoji、双环缩略：x/10 关完成、掌握度%）
- `/american/lesson/{lessonId}` → 关卡页，仿 gaokao 单元关卡页样式（截图已确认），10 关列表，每关右侧双环
- 全局导航接入现有 nav（断点规则沿用站内统一断点），带"← 返回首页"与返回上级，补齐返回键（吸取 back-button 检查教训）
- PWA：确认"返回主页"路径正常（此前 mobile PWA bug 的回归点）

## 3. Phase 3：关卡组件（重点是关1）

**关1 课文学习（本期核心组件，新建 `AmericanTextStage.tsx`）**
- 顶部三态切换：纯英文（默认）/ 中英对照 / 纯中文
- 逐句渲染复用 `TappableLine.tsx`（⚠️ 共享依赖陷阱：只消费不改动该组件；如需扩展，包一层本地 wrapper）
- 整篇播放（顺序播 sentences 音频）+ 单句点读 + 语速切换 常速/0.75x
- 进入先弹前置听力问题卡：播放整篇 → 作答 → 对/错反馈
- 完成判定：整篇播完 + 前置题已答 → 写 progress；点读覆盖率写掌握度

**关2–4 词汇三关**：复用初中/高中现成词卡、听辨、配对组件，数据源换 american_words；三关共写 american_word_mastery（同词同环）。
**关5 语法专项**：题目按 grammar_point_id 分组出题，掌握度按考点。
**关6 美语点睛**：对照卡片浏览 + 每条 1 道小测（qtype=choice，stage=6）。
**关7/8/9/10**：复用现有选择/填空题组件，题量从 questions 表读，**不在前端写死题数**（弹性规则：不同课题量不同）。
**错题**：全部接入现有错题本体系。

## 4. Phase 4：音频

- TTS 美音声线，方案与 alexVoice.ts 对齐（只参照，不修改 alexVoice.ts 本体——共享依赖陷阱）
- 按句生成：`public/audio/american/{lessonId}/{seq}.mp3`（audio_key 即此路径）
- 双角色对话若声线方案支持男女两声线则区分 speaker，不支持则统一声线（不阻塞验收）
- 慢速用播放器 playbackRate=0.75 实现，不生成第二套音频

## 5. 交付与验收

CC 自查后输出：变更文件清单 + SQLAA 待执行 SQL 清单 + 本地预览路径。
**Aaron 真机验收清单：**
1. /american → 单元1亮 → 6 张课卡显示正常（手机断点不破版）
2. 第 1 课关1：三态切换 / 整篇播放 / 单句点读（iOS Safari 首次点击即出声）/ 慢速 / 前置题
3. 词汇关刷词答对 2 次 → 关2/3/4 掌握环同步涨（互通验证）
4. 关7 填空、关8 听对话、关10 通关流程走通，错题进错题本
5. 完成一关 → 关卡页完成度、课卡双环、单元页进度联动
6. 初中/高中/小学专区回归点检：导航、路由无串区（吸取高中掉初中区教训）
验收通过 → push + PR；单元 2 内容届时另批交付。
