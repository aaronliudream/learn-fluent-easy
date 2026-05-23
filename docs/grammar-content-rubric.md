# 初中语法内容质量标准 · Junior Grammar Content Rubric

> **Use this rubric** when authoring, reviewing, or AI-generating content for any row in `junior_grammar_points`. Reference implementation: `code = 'g8.01'` 一般过去时 (set by `supabase/migrations/20260521120000_g8_01_past_simple_gold_standard.sql`).

A grammar point is **"ready for prod"** only when **every field below passes the checklist**. Anything less should stay in draft.

---

## 1. `summary` · 一句话钩子

- **Length**: 一行（≤ 40 中文字符或 ≤ 25 English words）
- **Content**: tells the student *what they'll be able to do* after this point, not what the grammar is
- ✅ `用动词的过去式描述昨天/上周/几年前发生的事 — 中考作文里至少一半的时态分在这里。`
- ❌ `Past Simple Tense.` (just labels — gives no motivation)

---

## 2. `hook_line` + `hook_line_cn` · 1-line motivational opener

- Shown in Lab Phase 0 (Briefing). Must answer "why should I care?"
- **Tone**: confident, specific, exam-relevant
- ✅ `中考英语的"第一道门"。把它拿下，作文里 50% 的时态分就稳了。`
- ❌ `Today we will learn about the past simple tense.` (textbook voice — boring)

---

## 3. `mnemonic` · 一行可背口诀

- ≤ 25 中文字符
- 必须**可背诵**：不是规则的完整描述，而是关键信号
- ✅ `过去 = V-ed 或 不规则；Did / Didn't 后永远跟动词原形。`
- ❌ `The past simple is used for actions completed in the past.` (a definition, not a hook)

---

## 4. `explanation_md` · 课堂讲义（markdown）

Must contain **all 6 sections** in this order:

1. **🎯 一句话搞定** — restate the rule in one sentence
2. **📐 核心公式** — formula table (肯定/否定/疑问/特殊疑问)
3. **⏰ 信号词清单** — time markers / trigger words
4. **🔥 高频项清单** — top 20 irregular verbs / fixed phrases / common collocations
5. **⚠️ Top 5 易错点** — actual Chinese-student mistakes with `✗ → ✓` pairs
6. **🧠 三秒判断口诀** — fast-decision heuristic for exam pressure

> **Length target**: 600–1000 中文字符 + tables. Renders via `react-markdown` inside the Lab Foundation phase.

---

## 5. `teacher_script` · 8 narrated segments

JSON array of `{ text, show, highlight?, duration }`:

- **text** (Chinese): natural classroom voice, ≤ 80 字, uses `**bold**` for keywords
- **show** (English): blackboard formula or example — NOT a translation of `text`
- **highlight**: substring of `show` that gets emerald color
- **duration**: 7–12 seconds (typewriter spends 80% of this, TTS speaks once)

**Structure must follow this 8-beat arc:**
1. Hook ("今天我们要拿下…") — 7–8s
2. Core formula — 9s
3. Regular case (with examples) — 9s
4. Irregular case / exception — 11–12s
5. Negative form rule — 10s
6. Question form rule — 10s
7. Signal words / time markers — 9–10s
8. Close + transition to drill — 7s

> Total runtime: ~75 seconds. Auto-advance is gated at 60% (~45s) before the "继续" button activates.

---

## 6. `immersion_cards` · 6 real-life triplets

JSON array of `{ situation, cn, en }`:

- **situation** (English): time + place + context (≤ 8 words). E.g. `"After PE class"`, `"Showing photos to a friend"`
- **cn**: natural Chinese sentence (not a literal translation of `en`)
- **en**: natural English — pass the "would a native say this?" test

**Diversity rule**: the 6 cards must cover **affirmative, negative, question, and time-marker variation** (not all "I + V-ed" sentences).

---

## 7. `contrast_table` · 6 Chinglish-vs-correct pairs

JSON array of `{ lhs (wrong), rhs (correct) }`.

**Must include the actual mistakes Chinese middle schoolers make**, not invented errors. For G8 past simple these are:

1. Irregular treated as regular (`goed`, `buyed`)
2. Did + past-tense doubling (`Did you saw`)
3. Didn't + past-tense doubling (`didn't went`)
4. Perfect + specific-past-time (`have visited … last summer`)
5. Wrong verb form after irregular
6. WH-question + past-tense doubling (`What time did … arrived`)

> The contrast table is what unlocks the "I've been making this mistake!" moment. Generic errors don't.

---

## 8. `reflex_cards` · 8 quick-fire cn → en

JSON array of `{ cn, en, keyword }`:

- **cn**: ≤ 12 中文字符 (must be fast to read)
- **en**: 1 short sentence (≤ 10 words)
- **keyword**: the substring of `en` to highlight (usually the verb form being tested)

**Diversity rule**: of the 8 cards, mix at least:
- 3 affirmative regular-verb cards
- 2 irregular-verb cards
- 1 negative card (`didn't`)
- 1 question card (`Did you …?`)
- 1 with explicit time marker (`in 2022`, `... ago`)

---

## 9. `situation_drills` · 4 open-ended scenarios

JSON array of `{ situation, cn, en, accepted: [...] }`:

- **situation** (English): realistic 中学生 context that demands the target grammar — late to class, talking about the weekend, apologizing, etc.
- **cn**: what the student wants to say in Chinese
- **en**: best/most natural English answer
- **accepted**: 2–3 alternate phrasings the AI grader should also mark correct

> Drills go through the `check-grammar-rewrite` edge function — wide accepted set prevents false negatives.

---

## 10. `correction_tasks` · 6 error-spot

JSON array of `{ wrong, model, hint, why }`:

- **wrong**: sentence with **exactly one or two** clearly-identifiable errors
- **model**: the corrected sentence
- **hint**: ≤ 15 中文字符, points at *what category* of error (not the answer)
- **why**: ≤ 50 中文字符, names the rule + emoji `**bold**` for the key term

> Errors should map **1-to-1** to the contrast_table — students see "these are the traps" then prove they can spot them.

---

## 11. `boss_questions` · 4 final-gate MCQs

JSON array of `{ stem, option_a..d, correct_answer (letter), trap, why }`:

- **stem**: realistic exam-style sentence with 1–3 blanks (`___`)
- **options**: 4 plausible alternatives — every distractor must teach a specific mistake
- **correct_answer**: `"A"` / `"B"` / `"C"` / `"D"` (single letter)
- **trap**: explains *which* distractor catches students and *why they fall for it*
- **why**: the full rule, ≤ 80 中文字符, written for the student who got it wrong

**Difficulty curve across the 4 questions:**
1. Single-rule check (e.g. Did + 原形)
2. Two-rule check (e.g. tense consistency between clauses)
3. Irregular-verb landmine (e.g. lose/lost + find/found)
4. Mixed: be 动词 + irregular verb + fixed expression

---

## 12. `junior_grammar_questions` · 12 mixed-type practice items

For each grammar point, **at minimum 12 rows** with `sort_order` in the 9000–9099 range (reserved for gold-standard content), distributed across types:

| Type | Count | Notes |
|---|---|---|
| `mcq` | 4 | classic A/B/C/D, varied difficulty 1–3 |
| `fill` | 3 | parenthesized prompt e.g. `____ (visit)` |
| `transform` | 2 | "改写为否定句" / "改写为过去时" |
| `correction` | 2 | one-line wrong sentence, student rewrites |
| `translation` | 1 | Chinese → English, `use_ai_grading=true` |

Required fields on **every** row:
- `stem` (clear, exam-realistic)
- `correct_answer` (the single canonical answer)
- `accepted_answers` (for open types — include 2–4 natural variants)
- `explanation` (≤ 60 中文字符 with `**bold**` keywords)
- `difficulty` (1=foundation, 2=mainstream, 3=challenge)
- `sort_order` (9000–9099 for gold-standard; lower numbers reserved for legacy seed)
- `grammar_topic` (kebab/snake-case tag for analytics, e.g. `past_simple_irregular`)

---

## ❌ Auto-reject criteria (lint these before publishing)

Reject any field that:
- Contains untranslated `TODO`, `TBD`, `[PLACEHOLDER]`, or test markers
- Has any Chinese sentence ending in `." ` (English punctuation in Chinese context)
- Has any English sentence with smart-quote artifacts (`‘ ’ “ ”`) — use straight quotes only
- References a CEFR level that doesn't match the row's `cefr` column
- Uses a 不规则动词 that's not in the official 中考词汇表
- Mentions a 题型 the existing UI doesn't support (we have: mcq, fill, transform, translation, correction)
- Has fewer than the minimum item counts above (e.g. only 4 immersion_cards)

---

## 🪜 Authoring workflow

For each empty/stub grammar point:

1. **Survey** the existing `code`, `title`, `cefr`, `grade` — pin down the scope
2. **Draft** all 12 fields above in a working doc (markdown is fine)
3. **Self-review** against the checklist
4. **Pair-review** with another teacher or against the gold-standard reference (`g8.01`)
5. **Package** as a migration `supabase/migrations/YYYYMMDDHHMMSS_<code>_gold_standard.sql`
6. **Test locally** by running the Point page + Lab page end-to-end
7. **Promote** to prod once all checkboxes pass

---

## 🔭 Future: scale via AI

Once 5–6 points reach this gold standard, an AI orchestrator can be built to:
1. Take an empty point's title/cefr/grade
2. Prompt the model with the **gold-standard reference + this rubric**
3. Generate all 12 fields
4. Run automated lint checks (see § 12 auto-reject criteria)
5. Write to a `draft_*` column so a teacher can review side-by-side before promoting

The gold-standard reference is the spec. Without it, AI-generated content drifts.
