#!/usr/bin/env python3
"""
Build src/data/gaokao/pep-bundle.json from scripts/out/gaokao-pep-extract.json.
Generates grammar questions (5 types × 4+ per topic) and reading articles per PEP book.

Run: python scripts/build_gaokao_pep_content.py
Requires prior: python scripts/extract_gaokao_pep.py
"""
from __future__ import annotations

import json
import re
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXTRACT_PATH = ROOT / "scripts" / "out" / "gaokao-pep-extract.json"
OUT_PATH = ROOT / "src" / "data" / "gaokao" / "pep-bundle.json"

BOOK_META = {
    "required1": {"label": "必修第一册", "grade_band": "g1", "year_band": 1},
    "required2": {"label": "必修第二册", "grade_band": "g1", "year_band": 1},
    "required3": {"label": "必修第三册", "grade_band": "g2", "year_band": 2},
    "elective1": {"label": "选择性必修第一册", "grade_band": "g2", "year_band": 2},
    "elective2": {"label": "选择性必修第二册", "grade_band": "g3", "year_band": 3},
    "elective3": {"label": "选择性必修第三册", "grade_band": "g3", "year_band": 3},
    "elective4": {"label": "选择性必修第四册", "grade_band": "g3", "year_band": 3},
}

# 3 grammar topics per book (21 total)
TOPICS = [
    # required1
    {"slug": "pep-r1-welcome-basic-sentences", "book": "required1", "unit": "Welcome Unit", "title": "基本句型（SV / SVO / SP）", "cefr": "A2", "module": "sentence", "cat": "basic-sv", "sort": 1},
    {"slug": "pep-r1-u1-noun-phrases", "book": "required1", "unit": "Unit 1", "title": "名词短语与形容词短语", "cefr": "B1", "module": "sentence", "cat": "phrases", "sort": 2},
    {"slug": "pep-r1-u2-present-continuous-future", "book": "required1", "unit": "Unit 2", "title": "现在进行时表将来计划", "cefr": "B1", "module": "tense", "cat": "present-continuous", "sort": 3},
    # required2
    {"slug": "pep-r2-u1-restrictive-clauses", "book": "required2", "unit": "Unit 1", "title": "限制性定语从句", "cefr": "B1", "module": "clause", "cat": "phrases", "sort": 10},
    {"slug": "pep-r2-u2-past-tense", "book": "required2", "unit": "Unit 2", "title": "一般过去时与过去进行", "cefr": "B1", "module": "tense", "cat": "present-continuous", "sort": 11},
    {"slug": "pep-r2-u3-heritage", "book": "required2", "unit": "Unit 3", "title": "文化遗产表达", "cefr": "B1", "module": "sentence", "cat": "phrases", "sort": 12},
    # required3
    {"slug": "pep-r3-passive-voice", "book": "required3", "unit": "Unit 1", "title": "被动语态", "cefr": "B2", "module": "tense", "cat": "present-continuous", "sort": 20},
    {"slug": "pep-r3-u2-morals", "book": "required3", "unit": "Unit 2", "title": "情态动词与道德选择", "cefr": "B2", "module": "clause", "cat": "phrases", "sort": 21},
    {"slug": "pep-r3-u3-diverse-cultures", "book": "required3", "unit": "Unit 3", "title": "多元文化阅读表达", "cefr": "B2", "module": "sentence", "cat": "basic-sv", "sort": 22},
    # elective1
    {"slug": "pep-e1-nonfinite-verbs", "book": "elective1", "unit": "Unit 1", "title": "非谓语动词", "cefr": "B2", "module": "clause", "cat": "phrases", "sort": 30},
    {"slug": "pep-e1-u2-bridging-cultures", "book": "elective1", "unit": "Unit 2", "title": "跨文化交际句型", "cefr": "B2", "module": "sentence", "cat": "phrases", "sort": 31},
    {"slug": "pep-e1-u3-science", "book": "elective1", "unit": "Unit 3", "title": "科技主题语法", "cefr": "B2", "module": "tense", "cat": "present-continuous", "sort": 32},
    # elective2
    {"slug": "pep-e2-subjunctive", "book": "elective2", "unit": "Unit 1", "title": "虚拟语气", "cefr": "B2", "module": "clause", "cat": "phrases", "sort": 40},
    {"slug": "pep-e2-u2-health", "book": "elective2", "unit": "Unit 2", "title": "健康话题语法", "cefr": "B2", "module": "tense", "cat": "present-continuous", "sort": 41},
    {"slug": "pep-e2-u3-ethics", "book": "elective2", "unit": "Unit 3", "title": "伦理与论证句型", "cefr": "B2", "module": "sentence", "cat": "basic-sv", "sort": 42},
    # elective3
    {"slug": "pep-e3-inversion", "book": "elective3", "unit": "Unit 1", "title": "倒装句", "cefr": "C1", "module": "sentence", "cat": "basic-sv", "sort": 50},
    {"slug": "pep-e3-u2-adversity", "book": "elective3", "unit": "Unit 2", "title": "逆境主题语法", "cefr": "C1", "module": "clause", "cat": "phrases", "sort": 51},
    {"slug": "pep-e3-u3-poetry", "book": "elective3", "unit": "Unit 3", "title": "诗歌与修辞", "cefr": "C1", "module": "sentence", "cat": "phrases", "sort": 52},
    # elective4
    {"slug": "pep-e4-discourse", "book": "elective4", "unit": "Unit 1", "title": "语篇衔接与逻辑", "cefr": "C1", "module": "sentence", "cat": "phrases", "sort": 60},
    {"slug": "pep-e4-u2-icons", "book": "elective4", "unit": "Unit 2", "title": "人物传记语法", "cefr": "C1", "module": "tense", "cat": "present-continuous", "sort": 61},
    {"slug": "pep-e4-u3-success", "book": "elective4", "unit": "Unit 3", "title": "成功与目标表达", "cefr": "C1", "module": "clause", "cat": "phrases", "sort": 62},
]

SENTENCE_RE = re.compile(r"(?<=[.!?])\s+(?=[A-Z\"'])")
PASSAGE_TITLE_RE = re.compile(r"^[A-Z][A-Z\s\-—]{8,}$", re.M)


def ns_id(seed: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, f"gaokao-pep:{seed}"))


def clean_text(t: str) -> str:
    t = t.replace("\u2019", "'").replace("\u2018", "'").replace("\u201c", '"').replace("\u201d", '"')
    t = re.sub(r"[\u4e00-\u9fff]+", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t


def extract_sentences(text: str, min_len: int = 20, max_len: int = 200) -> list[str]:
    out: list[str] = []
    for chunk in SENTENCE_RE.split(clean_text(text)):
        s = chunk.strip()
        if min_len <= len(s) <= max_len and re.search(r"[a-zA-Z]{4}", s):
            if not re.match(r"^(UNIT|WELCOME|Page|Reading|Listening|Discovering)", s, re.I):
                if s.count(" ") >= 3:
                    out.append(s)
    return out


def pick_sentences(book_data: dict, topic_index: int, count: int = 24) -> list[str]:
    sents = list(book_data.get("sample_sentences") or [])
    for rb in book_data.get("reading_blocks") or []:
        sents.extend(rb.get("sentences") or [])
        sents.extend(extract_sentences(rb.get("preview", "")))
    seen: set[str] = set()
    unique: list[str] = []
    for s in sents:
        k = s.lower()
        if k not in seen:
            seen.add(k)
            unique.append(s)
    if not unique:
        return []
    start = (topic_index * 7) % max(1, len(unique))
    picked = []
    for i in range(count):
        picked.append(unique[(start + i) % len(unique)])
    return picked


def wrong_options(correct: str, pool: list[str]) -> tuple[str, str, str]:
    opts = []
    for s in pool:
        w = s.split()[-1].rstrip(".,!?") if s.split() else "form"
        if w.lower() != correct.lower() and w not in opts:
            opts.append(w)
        if len(opts) >= 3:
            break
    while len(opts) < 3:
        opts.append(["quickly", "was", "have", "will"][len(opts)])
    return opts[0], opts[1], opts[2]


def gen_questions(slug: str, sentences: list[str], topic_title: str) -> list[dict]:
    if len(sentences) < 8:
        sentences = sentences * 3
    qs: list[dict] = []
    order = 9001

    def add(q: dict) -> None:
        nonlocal order
        q["id"] = f"pep-{slug}-{order}"
        q["sort_order"] = order
        order += 1
        qs.append(q)

    # 4 MCQ
    for i, sent in enumerate(sentences[:4]):
        words = [w for w in re.findall(r"[A-Za-z']+", sent) if len(w) > 2]
        if len(words) < 2:
            continue
        target = words[i % len(words)]
        stem = sent.replace(target, "______", 1) + f"\n\n（{topic_title} · 教材原句）"
        oa, ob, oc = wrong_options(target, sentences)
        add({
            "stem": stem,
            "question_type": "mcq",
            "option_a": target,
            "option_b": oa,
            "option_c": ob,
            "option_d": oc,
            "correct_answer": "A",
            "explanation": f"教材原句：{sent}",
            "difficulty": 1 + (i % 3),
            "use_ai_grading": False,
        })

    # 4 fill
    for i, sent in enumerate(sentences[4:8]):
        words = [w for w in re.findall(r"[A-Za-z']+", sent) if len(w) > 2]
        if not words:
            continue
        target = words[-1] if i % 2 else words[min(1, len(words) - 1)]
        stem = re.sub(re.escape(target), "______", sent, count=1) + "\n\n（填空）"
        add({
            "stem": stem,
            "question_type": "fill",
            "option_a": None,
            "option_b": None,
            "option_c": None,
            "option_d": None,
            "correct_answer": target.rstrip(".,!?"),
            "accepted_answers": [target.rstrip(".,!?")],
            "explanation": f"完整句：{sent}",
            "difficulty": 2,
            "use_ai_grading": False,
        })

    # 4 correction
    for i, sent in enumerate(sentences[8:12]):
        words = re.findall(r"[A-Za-z']+", sent)
        if len(words) < 3:
            continue
        wrong = sent
        if " is " in sent:
            wrong = sent.replace(" is ", " are ", 1)
        elif " are " in sent:
            wrong = sent.replace(" are ", " is ", 1)
        elif " was " in sent:
            wrong = sent.replace(" was ", " were ", 1)
        elif words[-1].endswith("ed"):
            wrong = sent[:-1] + "ing."
        else:
            wrong = sent.replace(words[1], words[1] + "s", 1)
        add({
            "stem": f"改错：\n*{wrong}*",
            "question_type": "correction",
            "option_a": None,
            "option_b": None,
            "option_c": None,
            "option_d": None,
            "correct_answer": sent,
            "accepted_answers": [sent],
            "explanation": f"正确形式来自教材：{sent}",
            "difficulty": 2 + (i % 2),
            "use_ai_grading": False,
        })

    # 4 transform
    for i, sent in enumerate(sentences[12:16]):
        add({
            "stem": f"用完整句回答（教材句型）：\n→ ______\n（提示：{sent[:40]}...）",
            "question_type": "transform",
            "option_a": None,
            "option_b": None,
            "option_c": None,
            "option_d": None,
            "correct_answer": sent,
            "accepted_answers": [sent],
            "explanation": f"参考答案：{sent}",
            "difficulty": 2,
            "use_ai_grading": False,
        })

    # 4 translation / production
    for i, sent in enumerate(sentences[16:20]):
        add({
            "stem": f"造句：请用英文表达与下列教材句相近的意思。\n中文提示：……（主题：{topic_title}）",
            "question_type": "translation",
            "option_a": None,
            "option_b": None,
            "option_c": None,
            "option_d": None,
            "correct_answer": sent,
            "accepted_answers": [sent],
            "explanation": f"教材例句：{sent}",
            "difficulty": 3,
            "use_ai_grading": True,
        })

    return qs


def extract_passage_body(preview: str) -> str:
    lines = preview.split("\n")
    body_parts: list[str] = []
    in_body = False
    for line in lines:
        line = line.strip()
        if not line:
            continue
        if PASSAGE_TITLE_RE.match(line) or line.isupper() and len(line) > 12:
            in_body = True
            continue
        if re.match(r"^(Reading|Listening|Discovering|\d+\s)", line, re.I):
            if body_parts:
                break
            continue
        if in_body or re.search(r"[a-z]{4}", line):
            if re.search(r"[A-Za-z]{3}", line) and len(line) > 30:
                body_parts.append(clean_text(line))
    text = "\n\n".join(body_parts)
    if len(text) < 120:
        sents = extract_sentences(preview, 40, 250)
        text = " ".join(sents[:8])
    return text[:3500]


STOPWORDS = {
    "that", "this", "with", "from", "they", "them", "their", "there", "these", "those",
    "have", "has", "had", "were", "been", "being", "would", "could", "should", "about",
    "which", "when", "what", "where", "while", "will", "your", "more", "some", "than",
    "then", "also", "into", "only", "other", "such", "very", "just", "like", "over",
    "after", "before", "because", "through", "during", "without", "between", "under",
    "again", "each", "both", "most", "much", "many", "well", "even", "back", "here",
    "make", "made", "said", "says", "know", "think", "take", "come", "want", "look",
    "give", "find", "tell", "work", "call", "try", "ask", "need", "feel", "seem",
    "help", "turn", "start", "show", "hear", "play", "run", "move", "live", "believe",
    "hold", "bring", "happen", "write", "provide", "sit", "stand", "lose", "pay",
    "meet", "include", "continue", "set", "learn", "change", "lead", "understand",
    "watch", "follow", "stop", "create", "speak", "read", "allow", "add", "grow",
    "open", "walk", "win", "offer", "remember", "love", "consider", "appear", "buy",
    "wait", "serve", "die", "send", "expect", "build", "stay", "fall", "cut", "reach",
    "kill", "remain", "suggest", "raise", "pass", "sell", "require", "report", "decide",
    "pull", "the", "and", "for", "are", "but", "not", "you", "all", "can", "her", "was",
    "one", "our", "out", "day", "get", "him", "his", "how", "its", "may", "new", "now",
    "old", "see", "two", "way", "who", "boy", "did", "she", "use", "man", "men", "own",
}


def guess_pos(word: str) -> str:
    wl = word.lower()
    if wl.endswith("ly"):
        return "adv."
    if wl.endswith("ing") or wl.endswith("ed"):
        return "v."
    if wl.endswith("tion") or wl.endswith("sion") or wl.endswith("ment"):
        return "n."
    if wl.endswith("ness") or wl.endswith("ity"):
        return "n."
    if wl.endswith("ful") or wl.endswith("ous") or wl.endswith("ive") or wl.endswith("al"):
        return "adj."
    return "n."


def stable_shuffle(seed: str, items: list[str]) -> list[str]:
    import random

    rng = random.Random(seed)
    out = list(items)
    rng.shuffle(out)
    return out


def corpus_sentences(books: dict[str, dict]) -> list[tuple[str, str, dict]]:
    """(book_id, sentence, meta)"""
    out: list[tuple[str, str, dict]] = []
    for book_id, b in books.items():
        meta = BOOK_META[book_id]
        for s in b.get("sample_sentences") or []:
            out.append((book_id, s, meta))
        for rb in b.get("reading_blocks") or []:
            for s in rb.get("sentences") or []:
                out.append((book_id, s, meta))
            for s in extract_sentences(rb.get("preview", "")):
                out.append((book_id, s, meta))
    return out


def build_vocab(books: dict[str, dict]) -> list[dict]:
    items: list[dict] = []
    per_book_cap = 140
    for book_id in [
        "required1", "required2", "required3", "elective1", "elective2", "elective3", "elective4"
    ]:
        meta = BOOK_META[book_id]
        seen: set[str] = set()
        rank = 0
        for bid, sent, _ in corpus_sentences({book_id: books.get(book_id, {})}):
            if bid != book_id:
                continue
            for raw in re.findall(r"[A-Za-z][A-Za-z'-]{2,}", sent):
                wl = raw.lower().strip("'")
                if len(wl) < 4 or wl in STOPWORDS or wl in seen:
                    continue
                seen.add(wl)
                rank += 1
                display = raw[0].upper() + raw[1:] if raw.islower() else raw
                items.append({
                    "id": ns_id(f"vocab:{book_id}:{wl}"),
                    "word": display,
                    "phonetic": None,
                    "pos": guess_pos(wl),
                    "meaning_cn": f"（{meta['label']} 课文词汇）",
                    "meaning_en": None,
                    "example_en": sent[:160],
                    "example_cn": "见教材例句",
                    "star_level": 3 if meta["year_band"] == 3 else 2,
                    "accent": "BOTH",
                    "theme": meta["label"],
                    "freq_rank": rank + (meta["year_band"] - 1) * 500,
                    "exam_frequency": max(1, 5 - meta["year_band"]),
                    "gaokao_level": meta["year_band"],
                    "year_band": meta["year_band"],
                    "grade_band": meta["grade_band"],
                    "pep_book": book_id,
                    "is_hot_topic": False,
                })
                if rank >= per_book_cap:
                    break
            if rank >= per_book_cap:
                break
    return items


def build_writing_prompts(articles: list[dict]) -> list[dict]:
    prompts: list[dict] = []
    by_book: dict[str, list[dict]] = {}
    for art in articles:
        by_book.setdefault(art["pep_book"], []).append(art)
    for book_id, arts in by_book.items():
        meta = BOOK_META[book_id]
        for i, art in enumerate(arts[:2]):
            sents = extract_sentences(art["body"], 25, 180)
            sample = " ".join(sents[:4])[:500] if sents else art["body"][:500]
            prompts.append({
                "id": ns_id(f"writing:{art['id']}"),
                "topic": art["title"][:60],
                "year_band": meta["year_band"],
                "grade_band": meta["grade_band"],
                "pep_book": book_id,
                "prompt_cn": (
                    f"根据人教版《{meta['label']}》课文《{art['title'][:40]}》的主题，"
                    f"写一篇 80–120 词的英语短文，可描述经历、观点或建议。"
                ),
                "prompt_en": (
                    f"Write an 80–120 word passage based on the textbook theme "
                    f"\"{art['title'][:50]}\" (PEP {meta['label']})."
                ),
                "requirements": ["使用课文中的关键表达", "结构完整（开头—主体—结尾）", "80–120 词"],
                "min_words": 80,
                "max_words": 120,
                "difficulty": 2 + meta["year_band"],
                "sample_answer": sample,
                "scoring_rubric": "内容完整、语言准确、衔接自然（人教版课文标准）",
                "title_en": art["title"][:80],
                "high_sentences": [s for s in sents[:3]] if sents else [],
                "error_pairs": [],
                "paragraph_template": None,
            })
    return prompts


def build_listening_exercises(articles: list[dict]) -> list[dict]:
    exercises: list[dict] = []
    for art in articles:
        sents = extract_sentences(art["body"], 30, 200)
        if len(sents) < 4:
            continue
        transcript = " ".join(sents[:12])[:2200]
        questions = []
        for qi, probe in enumerate(sents[:5]):
            wrong = [s for s in sents if s != probe][:3]
            while len(wrong) < 3:
                wrong.append("Not mentioned in the passage.")
            opts = stable_shuffle(f"{art['id']}:q{qi}", [probe[:72], wrong[0][:72], wrong[1][:72], wrong[2][:72]])
            correct = chr(65 + opts.index(probe[:72]))
            questions.append({
                "type": "choice",
                "q": f"According to the listening script, which line best matches the speaker's point?",
                "options": opts,
                "answer": correct,
                "explanation": probe[:120],
            })
        kv = []
        for w in re.findall(r"\b[A-Za-z]{4,}\b", transcript)[:12]:
            wl = w.lower()
            if wl in STOPWORDS:
                continue
            kv.append({"word": w, "cn": f"（{art['theme_context']} 词汇）"})
        exercises.append({
            "id": ns_id(f"listening:{art['id']}"),
            "title": f"听力 · {art['title'][:50]}",
            "topic": art["specific_topic"],
            "year_band": art["year_band"],
            "grade_band": art["grade_band"],
            "pep_book": art["pep_book"],
            "difficulty": art["difficulty"],
            "kind": "passage",
            "duration_sec": max(90, min(240, len(transcript.split()) // 2)),
            "transcript": transcript,
            "translation_cn": f"（{art['source_label']} 课文节选 · TTS 朗读）",
            "questions": questions,
            "key_vocab": kv[:10],
            "audio_url": None,
        })
    return exercises


def build_cloze_passages(articles: list[dict]) -> list[dict]:
    passages: list[dict] = []
    topic_groups = ["人与自我", "人与社会", "人与自然"]
    for idx, art in enumerate(articles):
        words = re.findall(r"\b[A-Za-z]{4,}\b", art["body"])
        blank_words: list[str] = []
        seen: set[str] = set()
        for w in words:
            wl = w.lower()
            if wl in STOPWORDS or wl in seen:
                continue
            seen.add(wl)
            blank_words.append(w)
            if len(blank_words) >= 10:
                break
        if len(blank_words) < 6:
            continue
        body_ph = art["body"]
        blanks: list[dict] = []
        for bi, w in enumerate(blank_words, 1):
            body_ph = re.sub(r"\b" + re.escape(w) + r"\b", f"__{bi}__", body_ph, count=1)
            pool = [x for x in blank_words if x.lower() != w.lower()]
            distractors = pool[:3] if len(pool) >= 3 else pool + ["form", "term", "word"][:3 - len(pool)]
            opts = stable_shuffle(f"cloze:{art['id']}:{bi}", [w, distractors[0], distractors[1], distractors[2]])
            letter = chr(65 + opts.index(w))
            blanks.append({
                "id": ns_id(f"cloze-blank:{art['id']}:{bi}"),
                "blank_no": bi,
                "option_a": opts[0],
                "option_b": opts[1],
                "option_c": opts[2],
                "option_d": opts[3],
                "correct_answer": letter,
                "pos_tag": guess_pos(w),
                "skill_tag": "词汇辨析",
                "skill_method": "语境+搭配",
                "general_explanation": f"人教版 {art['source_label']} 原词：{w}",
                "explanation_a": None,
                "explanation_b": None,
                "explanation_c": None,
                "explanation_d": None,
            })
        passages.append({
            "id": ns_id(f"cloze:{art['id']}"),
            "passage_no": idx + 1,
            "title": art["title"][:80],
            "topic": art["specific_topic"],
            "topic_group": topic_groups[idx % 3],
            "genre": art["genre_label"],
            "difficulty": art["difficulty"],
            "word_count": art["word_count"],
            "blank_count": len(blanks),
            "recommended_minutes": max(10, min(16, len(blanks) + 4)),
            "source_book_label": art["source_label"],
            "year_band": art["year_band"],
            "grade_band": art["grade_band"],
            "pep_book": art["pep_book"],
            "is_published": True,
            "sort_order": art["sort_order"],
            "body_with_placeholders": body_ph,
            "translation_zh": "（教材段落 · 暂无官方译文）",
            "article_analysis": f"选自 {art['source_label']}，共 {len(blanks)} 空。",
            "exam_points": "语境理解、词汇辨析",
            "blanks": blanks,
        })
    return passages


def build_reading_articles(books: dict[str, dict]) -> list[dict]:
    articles: list[dict] = []
    sort = 1
    for topic_idx, book_id in enumerate(
        ["required1", "required2", "required3", "elective1", "elective2", "elective3", "elective4"]
    ):
        meta = BOOK_META[book_id]
        b = books.get(book_id, {})
        blocks = b.get("reading_blocks") or []
        for bi, rb in enumerate(blocks[:3]):
            body = extract_passage_body(rb.get("preview", ""))
            if len(body) < 100:
                continue
            sents = extract_sentences(body, 30, 220)
            if len(sents) < 3:
                continue
            aid = f"pep-{book_id}-reading-{rb['page']}"
            title_match = re.search(r"^[A-Z][A-Z\s\-—]{6,}$", rb.get("preview", ""), re.M)
            title = clean_text(title_match.group(0)) if title_match else f"{meta['label']} · Reading {bi + 1}"
            wc = len(body.split())
            q_stem_base = sents[0] if sents else body[:80]
            questions = []
            for qi, probe in enumerate(sents[:4]):
                questions.append({
                    "id": f"{aid}-q{qi + 1}",
                    "sort_order": qi + 1,
                    "stem": f"According to the passage, which best reflects the meaning of: \"{probe[:60]}...\"?",
                    "question_type": "detail" if qi < 2 else "inference",
                    "question_type_cn": "细节题" if qi < 2 else "推断题",
                    "option_a": probe[:70],
                    "option_b": "The opposite is stated.",
                    "option_c": "It is not mentioned.",
                    "option_d": "Only a related idea appears.",
                    "correct_answer": "A",
                    "explanation_a": "Matches the textbook passage wording.",
                    "explanation_b": None,
                    "explanation_c": None,
                    "explanation_d": None,
                    "general_explanation": f"人教版 {meta['label']} p.{rb['page']}",
                    "locate_paragraph": qi + 1,
                    "key_sentence": probe,
                    "difficulty": 2,
                })
            articles.append({
                "id": aid,
                "title": title[:80],
                "body": body,
                "grade_band": meta["grade_band"],
                "year_band": meta["year_band"],
                "pep_book": book_id,
                "pep_unit": f"p.{rb['page']}",
                "word_count": wc,
                "recommended_minutes": max(8, min(18, wc // 20)),
                "difficulty": 2 + (topic_idx % 2),
                "cefr_level": "B1" if meta["year_band"] == 1 else "B2" if meta["year_band"] == 2 else "C1",
                "genre": "narrative",
                "genre_label": "记叙/说明",
                "specific_topic": title[:40],
                "topic_group": "PEP Reading",
                "theme_context": meta["label"],
                "lexile_score": 720 + topic_idx * 40,
                "sub_band": book_id,
                "source_label": f"人教版{meta['label']}",
                "sort_order": sort,
                "paragraph_structure": None,
                "writing_techniques": None,
                "core_question_types": "detail, inference",
                "exam_strategies": None,
                "topic_connection": None,
                "useful_sentences": [{"en": s, "cn": "（教材原句）"} for s in sents[:2]],
                "argumentation_logic": None,
                "questions": questions,
            })
            sort += 1
    return articles


def build_catalog_points() -> list[dict]:
    points = []
    for i, t in enumerate(TOPICS):
        meta = BOOK_META[t["book"]]
        points.append({
            "id": ns_id(t["slug"]),
            "slug": t["slug"],
            "kp_id": f"PEP-{t['book'].upper()}-{i + 1:03d}",
            "title": t["title"],
            "cefr": t["cefr"],
            "grade_band": meta["grade_band"],
            "year_band": meta["year_band"],
            "pep_book": t["book"],
            "pep_unit": t["unit"],
            "module_code": t["module"],
            "category_code": t["cat"],
            "explanation": f"人教版{meta['label']} · {t['unit']} · Discovering Useful Structures / 课文句型",
            "typical_example": None,
            "common_mistake": None,
            "exam_frequency": "high",
            "difficulty": 2 + (i % 3),
            "sort_order": t["sort"],
        })
    return points


def main() -> None:
    if not EXTRACT_PATH.is_file():
        raise SystemExit(f"Missing {EXTRACT_PATH}. Run extract_gaokao_pep.py first.")

    extract = json.loads(EXTRACT_PATH.read_text(encoding="utf-8"))
    books = {b["book_id"]: b for b in extract if not b.get("error")}

    grammar: dict[str, list] = {}
    for ti, topic in enumerate(TOPICS):
        book = books.get(topic["book"], {})
        sents = pick_sentences(book, ti, 24)
        grammar[topic["slug"]] = gen_questions(topic["slug"], sents, topic["title"])

    articles = build_reading_articles(books)
    vocab = build_vocab(books)
    writing_prompts = build_writing_prompts(articles)
    listening_exercises = build_listening_exercises(articles)
    cloze_passages = build_cloze_passages(articles)

    unit_map_path = ROOT / "docs" / "gaokao" / "pep_unit_map.json"
    unit_map = json.loads(unit_map_path.read_text(encoding="utf-8")) if unit_map_path.is_file() else {}
    classroom_units = sum(len(v) for v in unit_map.values())

    bundle = {
        "version": 3,
        "source": "人教版普通高中英语教科书 (2019) · auto-built from PDF extract",
        "generated_from": str(EXTRACT_PATH.relative_to(ROOT)),
        "classroomSync": {
            "books": list(unit_map.keys()),
            "units_per_book": {k: len(v) for k, v in unit_map.items()},
            "total_units": classroom_units,
            "stages_per_unit": 8,
            "total_stages": classroom_units * 8,
            "year_bands": {
                "g1": ["required1", "required2"],
                "g2": ["required3", "elective1"],
                "g3": ["elective2", "elective3", "elective4"],
            },
        },
        "points": build_catalog_points(),
        "grammarQuestions": grammar,
        "readingArticles": articles,
        "vocab": vocab,
        "writingPrompts": writing_prompts,
        "listeningExercises": listening_exercises,
        "clozePassages": cloze_passages,
        "stats": {
            "books": {bid: {"pages": books[bid].get("page_count"), "reading_blocks": len(books[bid].get("reading_blocks", []))} for bid in books},
            "grammar_topics": len(grammar),
            "grammar_questions": sum(len(v) for v in grammar.values()),
            "reading_articles": len(articles),
            "vocab_words": len(vocab),
            "writing_prompts": len(writing_prompts),
            "listening_exercises": len(listening_exercises),
            "cloze_passages": len(cloze_passages),
            "classroom_units": classroom_units,
            "classroom_stages": classroom_units * 8,
        },
    }

    OUT_PATH.write_text(json.dumps(bundle, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {OUT_PATH}")
    print(json.dumps(bundle["stats"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
