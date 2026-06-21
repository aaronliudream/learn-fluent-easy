# 9年级 U1 vs 8年级 基准对照体检报告

> 机器逐表逐字段 diff。✅一致 / ⚠️偏差(8年级有值、9年级缺)。生成自 `scripts/g9/_audit_vs_g8.mjs`。

## 1. 字段完整性(8年级有值 → 9年级是否也有)

### junior_vocab  (8年级 {"volume":"8A","unit":"U1"}:64行 | 9年级 g9/U1:29行)
- ✅ word:8=100% / 9=100%
- ✅ pos:8=86% / 9=100%
- ✅ phonetic:8=0% / 9=100%
- ✅ meaning_cn:8=100% / 9=100%
- ✅ phrase_en:8=98% / 9=100%
- ✅ example_en:8=0% / 9=0%
- ✅ star_level:8=100% / 9=100%
- ✅ freq_rank:8=80% / 9=100%
- ✅ source_type:8=92% / 9=100%
- ✅ confidence:8=92% / 9=100%

### junior_reading  (8年级 {"volume":"8A","unit":"U1"}:5行 | 9年级 g9/U1:6行)
- ✅ title:8=100% / 9=100%
- ✅ body:8=100% / 9=100%
- ✅ topic:8=100% / 9=100%
- ✅ word_count:8=100% / 9=100%
- ✅ questions:8=100% / 9=100%
- ✅ vocab_notes:8=100% / 9=100%
- ✅ difficulty:8=100% / 9=100%

### junior_cloze  (8年级 {"volume":"7B"}:16行 | 9年级 g9/U1:1行)
- ✅ title:8=100% / 9=100%
- ✅ body:8=100% / 9=100%
- ✅ word_count:8=100% / 9=100%
- ✅ questions:8=100% / 9=100%
- ✅ difficulty:8=100% / 9=100%
- ✅ sort_order:8=100% / 9=100%

### junior_listening_exercises  (8年级 {"volume":"8A","unit":"U1"}:6行 | 9年级 g9/U1:2行)
- ✅ title:8=100% / 9=100%
- ✅ topic:8=100% / 9=100%
- ✅ difficulty:8=100% / 9=100%
- ✅ transcript:8=100% / 9=100%
- ✅ translation_cn:8=0% / 9=100%
- ✅ speaker:8=100% / 9=100%
- ✅ questions:8=100% / 9=100%
- ✅ kind:8=100% / 9=100%

### junior_grammar_points / questions
- points:8A/U1 3个 / g9/U1 3个
  - ✅ points.code:8=100% / 9=100%
  - ✅ points.title:8=100% / 9=100%
  - ✅ points.cefr:8=100% / 9=100%
  - ✅ points.category_id:8=100% / 9=100%
  - ✅ points.sort_order:8=100% / 9=100%
  - ✅ points.volume:8=100% / 9=100%
  - ✅ points.unit:8=100% / 9=100%
- questions:8A/U1 18题 / g9/U1 60题
  - ✅ q.stem:8=100% / 9=100%
  - ✅ q.option_a:8=100% / 9=100%
  - ✅ q.option_b:8=100% / 9=100%
  - ✅ q.option_c:8=100% / 9=100%
  - ✅ q.option_d:8=100% / 9=100%
  - ✅ q.correct_answer:8=100% / 9=100%
  - ✅ q.explanation:8=100% / 9=100%
  - ✅ q.difficulty:8=100% / 9=100%
  - ✅ q.question_type:8=100% / 9=100%
  - ✅ q.grammar_topic:8=100% / 9=100%

### junior_writing_prompts
- 参照(任意已填充写作)61行 / g9/U1 1行
  - ✅ topic:ref=100% / 9=100%
  - ✅ prompt_cn:ref=100% / 9=100%
  - ✅ prompt_en:ref=100% / 9=100%
  - ✅ requirements:ref=100% / 9=100%
  - ✅ min_words:ref=100% / 9=100%
  - ✅ max_words:ref=100% / 9=100%
  - ✅ sample_answer:ref=100% / 9=100%
  - ✅ scoring_rubric:ref=100% / 9=100%
  - ✅ title_en:ref=100% / 9=100%
  - ✅ high_sentences:ref=100% / 9=100%
  - ✅ error_pairs:ref=67% / 9=100%
  - ✅ paragraph_template:ref=100% / 9=100%

## 2. 归属完整性(9年级 volume/unit/grade 非空)
- ✅ junior_vocab:29行,缺归属 0
- ✅ junior_reading:6行,缺归属 0
- ✅ junior_cloze:1行,缺归属 0
- ✅ junior_listening_exercises:2行,缺归属 0
- ✅ junior_grammar_points:3行,缺归属/分类 0

## 3. 掌握度口径一致性(9年级与8年级同表→同函数→同阈值)
| 关 | 表/字段 | 阈值 | 9年级 |
|---|---|---|---|
| 核心词汇 | junior_word_mastery | mastery_level≥3 | ✅ 同 loadUnitVocabProgress |
| 听音辨词 | junior_word_mastery.listen_correct | ≥2 | ✅ 同 |
| 词义配对 | junior_word_mastery.match_consec | ≥2 | ✅ 同 |
| 语法专项 | junior_user_mastery(grammar_question) | correct_count≥2 | ✅ 同 loadProgressForCodes |
| 课文阅读 | mastery_progress(junior_reading) | best_pct≥80/stars≥5 | ✅ 同 |
| 完形填空 | mastery_progress | best_pct≥80 | ✅ 同(9年级新增关,机制同阅读) |
| 听力 | junior_listening_attempts | 正确率≥80% | ✅ 同 |
| 写作 | junior_writing_attempts | overall_score≥80 | ✅ 同 |
| 通关 | junior_user_mastery(grammar_point) | 仅回写语法FSRS | ✅ 同 |

> 口径由共享表+grade无关的读取函数(loadProgressForCodes/loadUnitVocabProgress/useMasteryOverview 按 code/wordId/item_type 查,不按 grade)保证;9年级内容入同表 → 自动同口径。

## 4. 关数与顺序(grade9 U1 vs grade8 单元)
- 8年级(8A U1)关序:`vocab / listenWord / match / grammar / reading / cloze / listening / writing / finalQuiz` (9关)
- 9年级(g9 U1)关序:`vocab / listenWord / match / grammar / reading / cloze / listening / writing / finalQuiz` (9关)
- ✅ 9年级关序 符合预期(完形在阅读后、听力前)
- 完形位置:第 6 关(应=6);8年级无完形关(9关)→ 9年级 +完形 = 9关

## 5. hub 接入(book / grammarCodes / wordIds)
- book:8年级=`8A`(分卷字母) / 9年级=`g9` ✅(全一册统一 g9)
- grammarCodes:8年级=`g8au1.01,g8au1.02,g8au1.03` / 9年级=`g9u1.01,g9u1.02,g9u1.03` ✅(数组,与DB code一致)
- ✅ grammarCodes 在 DB 命中:3/3
- wordIds 机制:9年级与8年级同走 useUnitVocab(grade+volume=book+unit 查 junior_vocab → .id)✅ 同函数
- ✅ useUnitVocab(grade=9,volume='g9',unit='U1') 命中词数:29(应=29;若0说明 book 与 DB volume 不匹配)

## 总结
- 字段缺口(⚠️):**0** 项
- 归属缺失:**0** 行
- 关序:✅ 符合