#!/usr/bin/env python3
"""Generate gaokao hub JSON (高一/高二/高三) from pep-bundle + unit map — mirrors junior hub schema."""
from __future__ import annotations

import json
import random
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BUNDLE = ROOT / "src" / "data" / "gaokao" / "pep-bundle.json"
UNIT_MAP = ROOT / "docs" / "gaokao" / "pep_unit_map.json"
OUT_DIR = ROOT / "src" / "data" / "gaokaoHub"

BOOK_TO_YEAR = {
    "required1": (1, "gk_required1"),
    "required2": (1, "gk_required2"),
    "required3": (2, "gk_required3"),
    "elective1": (2, "gk_elective1"),
    "elective2": (3, "gk_elective2"),
    "elective3": (3, "gk_elective3"),
    "elective4": (3, "gk_elective4"),
}

BOOK_LABELS = {
    "required1": "必修第一册",
    "required2": "必修第二册",
    "required3": "必修第三册",
    "elective1": "选择性必修第一册",
    "elective2": "选择性必修第二册",
    "elective3": "选择性必修第三册",
    "elective4": "选择性必修第四册",
}

YEAR_NAMES = {1: "高一", 2: "高二", 3: "高三"}

DEFAULT_STAGES = [
    {"id": "s1", "title": "核心词汇", "subtitle": "教材单词", "icon": "📚", "type": "vocab", "time": "8分钟"},
    {"id": "s2", "title": "听音辨词", "subtitle": "听力辨词", "icon": "🎧", "type": "listenWord", "time": "6分钟"},
    {"id": "s3", "title": "词义配对", "subtitle": "巩固记忆", "icon": "🎮", "type": "match", "time": "5分钟"},
    {"id": "s4", "title": "语法专项", "subtitle": "五关语法测", "icon": "🧩", "type": "grammar", "time": "12分钟"},
    {"id": "s5", "title": "课文阅读", "subtitle": "阅读理解", "icon": "📖", "type": "reading", "time": "8分钟"},
    {"id": "s6", "title": "听力短文", "subtitle": "听音答题", "icon": "👂", "type": "listening", "time": "8分钟"},
    {"id": "s7", "title": "写作练习", "subtitle": "本单元句型", "icon": "✍️", "type": "writing", "time": "10分钟"},
    {"id": "s8", "title": "单元通关", "subtitle": "综合检测", "icon": "🏆", "type": "finalQuiz", "time": "12分钟"},
]


def _mcq(q: str, correct: str, pool: list[str], point: str = "词汇", dim: str = "vocab") -> dict:
    distractors = [x for x in pool if x != correct]
    random.shuffle(distractors)
    opts = [correct]
    for d in distractors:
        if d not in opts and len(opts) < 4:
            opts.append(d)
    while len(opts) < 4:
        opts.append(f"选项{len(opts)}")
    random.shuffle(opts)
    return {"q": q, "opts": opts, "answer": opts.index(correct), "point": point, "dim": dim}


def pick_vocab(bundle_vocab: list[dict], book: str, unit_idx: int, n_units: int, limit: int = 12) -> list[dict]:
    book_words = [v for v in bundle_vocab if v.get("pep_book") == book]
    if not book_words:
        return []
    chunk = max(1, len(book_words) // n_units)
    start = unit_idx * chunk
    slice_ = book_words[start : start + chunk]
    out = []
    for v in slice_[:limit]:
        w = v.get("word") or ""
        if not w:
            continue
        out.append({
            "en": w,
            "cn": (v.get("meaning_cn") or "课文词汇").replace("（", "").split("）")[0][:24],
            "emoji": "📘",
        })
    return out


def grammar_for_unit(points: list[dict], book: str, unit_label: str) -> tuple[str, str | None]:
    """Return (title, slug) from pep grammar points."""
    unit_norm = unit_label.replace("Unit ", "Unit ").strip()
    for p in points:
        if p.get("pep_book") != book:
            continue
        pu = (p.get("pep_unit") or "").strip()
        if pu.lower() == unit_label.lower() or pu == unit_norm:
            return p.get("title") or "本单元语法", p.get("slug")
        if unit_label.startswith("Welcome") and "welcome" in pu.lower():
            return p.get("title") or "本单元语法", p.get("slug")
    for p in points:
        if p.get("pep_book") == book:
            return p.get("title") or "本单元语法", p.get("slug")
    return "本单元语法", None


def grammar_quiz_from_bundle(grammar_qs: dict, slug: str | None, vocab: list[dict], title: str) -> list[dict]:
    if slug and slug in grammar_qs:
        raw = grammar_qs[slug][:8]
        qs = []
        for i, q in enumerate(raw):
            opts = [q.get("option_a"), q.get("option_b"), q.get("option_c"), q.get("option_d")]
            opts = [o for o in opts if o]
            if len(opts) >= 2:
                correct = q.get("correct_answer", "A")
                ans_idx = ord(correct[0]) - 65 if correct and len(correct) == 1 else 0
                ans_idx = min(ans_idx, len(opts) - 1)
                qs.append({
                    "q": (q.get("stem") or "")[:200],
                    "opts": opts[:4],
                    "answer": ans_idx,
                    "point": title,
                    "dim": "grammar",
                })
        if qs:
            return qs
    if not vocab:
        return []
    return [
        _mcq(
            f"本单元语法：{title}。「{vocab[0]['en']}」的意思是？",
            vocab[0]["cn"],
            [v["cn"] for v in vocab],
            point=title,
            dim="grammar",
        )
    ]


def article_for_unit(articles: list[dict], book: str, unit_idx: int) -> dict | None:
    book_arts = [a for a in articles if a.get("pep_book") == book]
    if not book_arts:
        return None
    art = book_arts[unit_idx % len(book_arts)]
    body = art.get("body") or ""
    sents = re.split(r"(?<=[.!?])\s+", body)
    sents = [s.strip() for s in sents if len(s.strip()) > 20][:6]
    questions = []
    for qi, probe in enumerate(sents[:4]):
        questions.append(
            _mcq(
                f"According to the passage: \"{probe[:50]}...\"",
                probe[:70],
                [probe[:70], "Not stated.", "Opposite meaning.", "Unrelated."],
                point="阅读细节",
                dim="reading",
            )
        )
    return {
        "passage": body[:1200],
        "passageCn": f"（{art.get('source_label', '人教版课文')} · 教材节选）",
        "questions": questions,
    }


def listening_for_unit(exercises: list[dict], book: str, unit_idx: int) -> list[dict]:
    book_ex = [e for e in exercises if e.get("pep_book") == book]
    if not book_ex:
        return []
    ex = book_ex[unit_idx % len(book_ex)]
    out = []
    for q in (ex.get("questions") or [])[:6]:
        opts = q.get("options") or []
        ans = q.get("answer") or "A"
        idx = ord(ans[0]) - 65 if ans else 0
        out.append({
            "audio": (ex.get("transcript") or "")[:80],
            "opts": opts[:4] if opts else ["A", "B", "C", "D"],
            "answer": min(idx, max(0, len(opts) - 1)),
        })
    return out


def writing_for_unit(prompts: list[dict], book: str, unit_idx: int, cn: str) -> dict:
    book_p = [p for p in prompts if p.get("pep_book") == book]
    if book_p:
        p = book_p[unit_idx % len(book_p)]
        return {
            "prompt": p.get("prompt_en") or "",
            "promptCn": p.get("prompt_cn") or f"本单元主题：{cn}",
            "sampleWords": [],
        }
    return {
        "prompt": f"Write 80–120 words about {cn}.",
        "promptCn": f"围绕「{cn}」写一篇 80–120 词的英语短文。",
        "sampleWords": [],
    }


def make_quiz(vocab: list[dict], unit_cn: str) -> list[dict]:
    if not vocab:
        return []
    qs = []
    all_cn = [v["cn"] for v in vocab]
    all_en = [v["en"] for v in vocab]
    for v in vocab[:8]:
        qs.append(_mcq(f"「{v['en']}」的意思是？", v["cn"], all_cn))
    if vocab:
        qs.append(_mcq(f"本单元「{unit_cn}」相关词是？", vocab[0]["en"], all_en + ["school", "teacher"]))
    return qs[:18]


def make_dialogues(vocab: list[dict], title: str) -> list[dict]:
    if len(vocab) < 2:
        return []
    a, b = vocab[0], vocab[1]
    return [
        {
            "title": "Reading and Thinking",
            "lines": [
                {"role": "A", "text": f"Let's discuss {title}.", "cn": f"我们来讨论{title}。"},
                {"role": "B", "text": f"Sure. I learned {a['en']} today.", "cn": f"好的，我今天学了{a['cn']}。"},
                {"role": "A", "text": f"And {b['en']} is important too.", "cn": f"{b['cn']}也很重要。"},
            ],
        }
    ]


def unit_id(year: int, sem_id: str, num: int) -> str:
    short = sem_id.replace("gk_", "")
    return f"gk{year}_{short}_u{num}"


def pep_unit_label(meta: dict) -> str:
    key = meta["key"]
    if key == "WU":
        return "Welcome Unit"
    return f"Unit {key[1:]}" if key.startswith("U") else key


def main() -> None:
    random.seed(42)
    if not BUNDLE.is_file():
        raise SystemExit(f"Missing {BUNDLE}. Run build_gaokao_pep_content.py first.")
    bundle = json.loads(BUNDLE.read_text(encoding="utf-8"))
    unit_map = json.loads(UNIT_MAP.read_text(encoding="utf-8"))
    points = bundle.get("points") or []
    grammar_qs = bundle.get("grammarQuestions") or {}
    articles = bundle.get("readingArticles") or []
    vocab_all = bundle.get("vocab") or []
    listening = bundle.get("listeningExercises") or []
    writing = bundle.get("writingPrompts") or []

    years: dict[int, dict] = {}

    for book_id, units_meta in unit_map.items():
        year, sem_id = BOOK_TO_YEAR[book_id]
        if year not in years:
            years[year] = {"name": YEAR_NAMES[year], "semesters": {}}
        if sem_id not in years[year]["semesters"]:
            years[year]["semesters"][sem_id] = {
                "name": BOOK_LABELS[book_id],
                "available": True,
                "units": [],
            }

        n_units = len(units_meta)
        built_units = []
        for i, meta in enumerate(units_meta, start=1):
            unit_label = pep_unit_label(meta)
            vocab = pick_vocab(vocab_all, book_id, i - 1, n_units, 12)
            grammar_title, grammar_slug = grammar_for_unit(points, book_id, unit_label)
            stages = [{**s} for s in DEFAULT_STAGES]
            if vocab:
                stages[0]["subtitle"] = f"{len(vocab)}个教材词汇"
            stages[3]["subtitle"] = grammar_title

            uid = unit_id(year, sem_id, i)
            reading = article_for_unit(articles, book_id, i - 1)
            available = bool(vocab or reading)
            unit = {
                "id": uid,
                "num": i,
                "unitKey": meta["key"],
                "book": book_id,
                "title": meta["title"],
                "cn": meta["cn"],
                "emoji": meta["emoji"],
                "available": available,
                "vocabulary": vocab,
                "dialogues": make_dialogues(vocab, meta["title"]) if available else [],
                "stages": stages,
                "grammarTitle": grammar_title,
                "grammarCode": grammar_slug,
                "grammarQuiz": grammar_quiz_from_bundle(grammar_qs, grammar_slug, vocab, grammar_title),
                "reading": reading if available and reading else None,
                "writing": writing_for_unit(writing, book_id, i - 1, meta["cn"]) if available else None,
                "quizQuestions": make_quiz(vocab, meta["cn"]) if available else [],
                "listeningQuestions": listening_for_unit(listening, book_id, i - 1) if available else [],
            }
            built_units.append(unit)

        years[year]["semesters"][sem_id]["units"] = built_units
        years[year]["semesters"][sem_id]["available"] = any(u["available"] for u in built_units)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for y, course in years.items():
        out = OUT_DIR / f"year{y}.json"
        out.write_text(json.dumps({f"year{y}": course}, ensure_ascii=False, indent=2), encoding="utf-8")
        u_count = sum(len(s["units"]) for s in course["semesters"].values())
        print(f"Wrote {out.name}: {u_count} units across {len(course['semesters'])} books")


if __name__ == "__main__":
    main()
