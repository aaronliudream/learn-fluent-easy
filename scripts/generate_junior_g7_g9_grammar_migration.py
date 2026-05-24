#!/usr/bin/env python3
"""Generate SQL migration for g7.xx / g9.xx junior grammar points + 5-level question banks."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SEED = ROOT / "docs" / "junior" / "g7_g9_grammar_seed.json"
OUT = ROOT / "supabase" / "migrations" / "20260527120000_g7_g9_grammar_points_and_banks.sql"

Question = tuple  # (stem, qtype, a, b, c, d, answer, explanation)


def bank_for(code: str, title: str) -> list[Question]:
    """12 questions: 4 mcq, 3 fill, 2 correction, 2 transform, 1 translation."""
    topic = title.split("·")[0].strip()
    return [
        (f"Choose the best answer for 「{topic}」: ___ is correct.", "mcq", "Option A", "Option B", "Option C", "Option D", "A", f"考查{topic}。"),
        (f"Which sentence uses 「{topic}」 correctly?", "mcq", "Wrong form A", "Correct form B", "Wrong form C", "Wrong form D", "B", f"正确用法见{code}。"),
        (f"Fill in: This question tests 「{topic}」 — choose ___ .", "mcq", "the right one", "a wrong one", "another wrong", "none", "A", f"{topic}基础题。"),
        (f"「{topic}」 — pick the answer.", "mcq", "Answer 1", "Answer 2", "Answer 3", "Answer 4", "C", f"对应{code}。"),
        (f"Complete: ({code}) ____ (test) this grammar point.", "fill", None, None, None, None, "tests", "动词原形/正确形式。"),
        (f"Fill: She ____ (study) this topic every day.", "fill", None, None, None, None, "studies", "第三人称单数。"),
        (f"Fill: They ____ (be) learning 「{topic}」 now.", "fill", None, None, None, None, "are", "复数 be 动词。"),
        (f'改错： "This sentence have a 「{topic}」 mistake."', "correction", None, None, None, None, f"This sentence has a 「{topic}」 mistake.", "主谓一致 has。"),
        (f'改错： "He don''t know 「{topic}」."', "correction", None, None, None, None, f"He doesn't know 「{topic}」.", "第三人称 doesn't。"),
        (f'句型转换： "I learn 「{topic}」." → 一般疑问句', "transform", None, None, None, None, f"Do you learn 「{topic}」?", "Do you ...?"),
        (f'句型转换： "She likes 「{topic}」." → 否定句', "transform", None, None, None, None, f"She doesn't like 「{topic}」.", "doesn't + 原形。"),
        (f"把这句话译成英文：我学习了{topic}。", "translation", None, None, None, None, f"I learned {topic.split()[0] if topic else 'grammar'}.", f"翻译考查{topic}。"),
    ]


# Curated overrides for high-traffic points
OVERRIDES: dict[str, list[Question]] = {
    "g7.01": [
        ("I ___ a student.", "mcq", "am", "is", "are", "be", "A", "I → am。"),
        ("She ___ my English teacher.", "mcq", "am", "is", "are", "be", "B", "She → is。"),
        ("They ___ in Class 3.", "mcq", "am", "is", "are", "be", "C", "They → are。"),
        ("— How ___ you? — I'm fine.", "mcq", "am", "is", "are", "be", "C", "How are you?"),
        ("Tom ____ (be) very happy today.", "fill", None, None, None, None, "is", "Tom 单数 → is。"),
        ("We ____ (be) good friends.", "fill", None, None, None, None, "are", "We → are。"),
        ("My parents ____ (be) at home now.", "fill", None, None, None, None, "are", "parents 复数。"),
        ('改错： "He are a boy."', "correction", None, None, None, None, "He is a boy.", "He → is。"),
        ('改错： "I is fine, thank you."', "correction", None, None, None, None, "I am fine, thank you.", "I → am。"),
        ('句型转换（否定）： "She is a nurse."', "transform", None, None, None, None, "She is not a nurse.", "be + not。"),
        ('句型转换（疑问）： "They are students."', "transform", None, None, None, None, "Are they students?", "be 提前。"),
        ("把这句话译成英文：我是七年级学生。", "translation", None, None, None, None, "I am a Grade 7 student.", "I am + 名词。"),
    ],
    "g7.12": [
        ("___ you play the guitar?", "mcq", "Can", "Do", "Are", "Does", "A", "Can 表能力。"),
        ("— Can Tom swim? — Yes, ___.", "mcq", "he can", "he does", "he is", "he can't", "A", "Yes, he can。"),
        ("She ___ play chess.", "mcq", "can", "cans", "can to", "can plays", "A", "can + 原形。"),
        ("___ they speak English?", "mcq", "Can", "Do", "Are", "Does", "A", "Can they ...?"),
        ("____ (can) you draw?", "fill", None, None, None, None, "Can", "Can you ...?"),
        ("He ____ (can not) play the drums.", "fill", None, None, None, None, "can't", "can't + 原形。"),
        ("We ____ (can) sing and dance.", "fill", None, None, None, None, "can", "can + 原形。"),
        ('改错： "Can she plays the piano?"', "correction", None, None, None, None, "Can she play the piano?", "can 后原形。"),
        ('改错： "I can to swim."', "correction", None, None, None, None, "I can swim.", "can 后不用 to。"),
        ('句型转换： "I can play basketball." → 疑问', "transform", None, None, None, None, "Can you play basketball?", "Can you ...?"),
        ('句型转换： "He can draw well." → 否定', "transform", None, None, None, None, "He can't draw well.", "can't。"),
        ("把这句话译成英文：你会弹吉他吗？", "translation", None, None, None, None, "Can you play the guitar?", "Can you play ...?"),
    ],
    "g9.01": [
        ("English ___ in many countries.", "mcq", "speaks", "is spoken", "spoke", "was speak", "B", "被动 is spoken。"),
        ("The room ___ every day.", "mcq", "cleans", "is cleaned", "cleaned", "was clean", "B", "一般现在被动。"),
        ("Rice ___ in the south of China.", "mcq", "grows", "is grown", "grew", "was grow", "B", "is grown。"),
        ("These books ___ in the library.", "mcq", "keep", "are kept", "kept", "are keep", "B", "复数 are kept。"),
        ("The window ____ (break) by the boy.", "fill", None, None, None, None, "is broken", "被动 is broken。"),
        ("Tea ____ (drink) in China.", "fill", None, None, None, None, "is drunk", "is drunk。"),
        ("Many trees ____ (plant) every spring.", "fill", None, None, None, None, "are planted", "are planted。"),
        ('改错： "English speaks in Canada."', "correction", None, None, None, None, "English is spoken in Canada.", "被动语态。"),
        ('改错： "The song is sing by her."', "correction", None, None, None, None, "The song is sung by her.", "sing → sung。"),
        ('句型转换： "People speak Chinese in China." → 被动', "transform", None, None, None, None, "Chinese is spoken in China.", "被动转换。"),
        ('句型转换： "They make bikes in this factory." → 被动', "transform", None, None, None, None, "Bikes are made in this factory.", "复数被动。"),
        ("把这句话译成英文：这些花每天都被浇水。", "translation", None, None, None, None, "These flowers are watered every day.", "一般现在被动。"),
    ],
    "g9.03": [
        ("When I arrived, he ___ already left.", "mcq", "has", "had", "was", "did", "B", "过去的过去 had left。"),
        ("She ___ finished her homework before dinner.", "mcq", "has", "had", "was", "did", "B", "had finished。"),
        ("By 2020, I ___ learned English for 5 years.", "mcq", "have", "had", "was", "did", "B", "by + 过去时间 → had。"),
        ("They ___ gone home when we got there.", "mcq", "have", "had", "were", "did", "B", "had gone。"),
        ("When I got to school, the class ____ (start).", "fill", None, None, None, None, "had started", "had + 过去分词。"),
        ("He ____ (leave) before I called him.", "fill", None, None, None, None, "had left", "had left。"),
        ("By last year, she ____ (live) here for ten years.", "fill", None, None, None, None, "had lived", "had lived for ...。"),
        ('改错： "When I arrived, he has left."', "correction", None, None, None, None, "When I arrived, he had left.", "过去完成时。"),
        ('改错： "She had go home before 6."', "correction", None, None, None, None, "She had gone home before 6.", "go → gone。"),
        ('句型转换： "I finished homework. Then Mom came home." → 合并', "transform", None, None, None, None, "Mom came home after I had finished my homework.", "过去完成表先后。"),
        ('句型转换： "He left. I arrived." → 用 before', "transform", None, None, None, None, "He had left before I arrived.", "had ... before。"),
        ("把这句话译成英文：我到车站时，火车已经开走了。", "translation", None, None, None, None, "When I got to the station, the train had already left.", "过去完成时。"),
    ],
}


def esc(s: str | None) -> str:
    if s is None:
        return "NULL"
    return "'" + s.replace("'", "''") + "'"


def q_values(code: str, sort_base: int, questions: list[Question]) -> list[str]:
    rows: list[str] = []
    ai_types = {"correction", "transform", "translation"}
    for i, (stem, qtype, a, b, c, d, ans, expl) in enumerate(questions):
        accepted = f"ARRAY[{esc(ans)}]::text[]" if qtype != "mcq" else "NULL::text[]"
        use_ai = "true" if qtype in ai_types else "false"
        diff = 3 if qtype == "translation" else (2 if qtype in {"correction", "transform"} else 1)
        rows.append(
            f"  ({esc(stem)}, {esc(qtype)}, {esc(a)}, {esc(b)}, {esc(c)}, {esc(d)}, "
            f"{esc(ans)}, {accepted}, {esc(expl)}, '{{}}'::jsonb, NULL, {esc(code)}, "
            f"{use_ai}, {diff}, {sort_base + i})"
        )
    return rows


def main() -> None:
    seed = json.loads(SEED.read_text(encoding="utf-8"))
    lines: list[str] = [
        "-- g7.xx / g9.xx grammar points + 5-level question banks for junior hub",
        "-- Generated by scripts/generate_junior_g7_g9_grammar_migration.py",
        "",
    ]

    for pt in seed:
        code = pt["code"]
        expl = pt["explanation"].replace("'", "''")
        lines.append(
            f"INSERT INTO junior_grammar_points "
            f"(category_id, code, title, cefr, grade, summary, explanation_md, examples, sort_order, content_depth) "
            f"SELECT id, {esc(code)}, {esc(pt['title'])}, 'A2', {pt['grade']}, "
            f"{esc(pt['summary'])}, E'{expl}', '[]'::jsonb, "
            f"{100 + int(code.split('.')[1])}, 1 "
            f"FROM junior_grammar_categories WHERE code = {esc(pt['category'])} "
            f"ON CONFLICT (code) DO UPDATE SET "
            f"title = EXCLUDED.title, summary = EXCLUDED.summary, "
            f"explanation_md = EXCLUDED.explanation_md, content_depth = GREATEST(junior_grammar_points.content_depth, 1);"
        )
        lines.append("")

    for pt in seed:
        code = pt["code"]
        sort_base = 7000 + int(code.split(".")[1]) * 100 if code.startswith("g7.") else 9000 + int(code.split(".")[1]) * 100
        questions = OVERRIDES.get(code) or bank_for(code, pt["title"])
        lines.append(f"DELETE FROM junior_grammar_questions")
        lines.append(f"WHERE point_id = (SELECT id FROM junior_grammar_points WHERE code = {esc(code)})")
        lines.append(f"  AND sort_order BETWEEN {sort_base} AND {sort_base + 99};")
        lines.append("")
        lines.append("WITH p AS (SELECT id FROM junior_grammar_points WHERE code = " + esc(code) + ")")
        lines.append("INSERT INTO junior_grammar_questions")
        lines.append("  (point_id, stem, question_type, option_a, option_b, option_c, option_d, correct_answer,")
        lines.append("   accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,")
        lines.append("   difficulty, sort_order)")
        lines.append("SELECT p.id, q.stem, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d,")
        lines.append("       q.correct_answer, q.accepted_answers, q.explanation, q.distractors,")
        lines.append("       q.natural_note, q.grammar_topic, q.use_ai_grading, q.difficulty, q.sort_order")
        lines.append("FROM p, (VALUES")
        qrows = q_values(code, sort_base, questions)
        lines.append(",\n".join(qrows))
        lines.append(") AS q(stem, question_type, option_a, option_b, option_c, option_d, correct_answer,")
        lines.append("       accepted_answers, explanation, distractors, natural_note, grammar_topic, use_ai_grading,")
        lines.append("       difficulty, sort_order);")
        lines.append("")

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {OUT} ({len(seed)} points)")


if __name__ == "__main__":
    main()
