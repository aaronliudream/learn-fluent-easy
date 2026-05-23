#!/usr/bin/env python3
"""Generate primary hub JSON (grades 3–6) from docs/vocab/primary_*_clean.csv."""
from __future__ import annotations

import csv
import json
import random
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))

from primary_pep_patterns import (  # noqa: E402
    THEME_POOLS,
    make_unit_dialogues,
    make_unit_quiz_extras,
    similar_sentence_distractors,
    theme_for_book_unit,
    themed_distractors,
)

THEME_POOLS_CN: dict[str, list[str]] = {
    "school_place": THEME_POOLS["room_cn"] + ["教师办公室", "操场", "计算机房"],
    "school_item": ["书包", "铅笔", "尺子", "笔记本", "故事书"],
    "room": THEME_POOLS["room_cn"],
    "food": ["面包", "牛奶", "鸡蛋", "面条", "汤", "鸡肉", "牛肉"],
    "fruit": ["苹果", "梨", "香蕉", "橙子", "西瓜"],
    "animal": ["猫", "狗", "鸭子", "猪", "熊", "熊猫", "老虎", "猴子"],
    "colour": ["红色", "蓝色", "绿色", "黄色", "黑色", "白色", "棕色", "橙色"],
    "body": ["头", "眼睛", "耳朵", "鼻子", "嘴", "胳膊", "手", "腿"],
    "family": ["父亲", "母亲", "兄弟", "姐妹", "叔叔", "阿姨", "表亲"],
    "job": ["医生", "护士", "司机", "农民", "厨师", "老师"],
    "weather": THEME_POOLS["weather_cn"],
    "farm": ["西红柿", "土豆", "胡萝卜", "马", "牛", "羊", "母鸡", "山羊"],
    "clothes": ["衬衫", "连衣裙", "裙子", "外套", "夹克", "裤子", "短裤", "帽子"],
    "time": ["早餐", "午餐", "晚餐", "起床", "去上学", "上床睡觉"],
    "transport": ["公共汽车", "自行车", "汽车", "飞机", "轮船", "地铁", "火车"],
    "feeling": ["开心", "难过", "生气", "累", "饿", "担心"],
    "season": ["春天", "夏天", "秋天", "冬天"],
}
VOCAB_DIR = ROOT / "docs" / "vocab"
OUT_DIR = ROOT / "src" / "data" / "primaryHub"
LEGACY_G4_U1 = ROOT / "src" / "data" / "primaryHub" / "legacy_g4v2_u1.json"

BOOK_TO_SEM = {
    "3A": ("grade3", "grade3_volume1"),
    "3B": ("grade3", "grade3_volume2"),
    "4A": ("grade4", "grade4_volume1"),
    "4B": ("grade4", "grade4_volume2"),
    "5A": ("grade5", "grade5_volume1"),
    "5B": ("grade5", "grade5_volume2"),
    "6A": ("grade6", "grade6_volume1"),
    "6B": ("grade6", "grade6_volume2"),
}

GRADE_NAMES = {3: "三年级", 4: "四年级", 5: "五年级", 6: "六年级"}

# PEP unit titles (en, cn, emoji)
UNIT_META: dict[str, dict[str, tuple[str, str, str]]] = {
    "3A": {
        "Unit 1": ("Hello!", "你好！", "👋"),
        "Unit 2": ("Colours", "颜色", "🎨"),
        "Unit 3": ("Look at me!", "看看我", "😊"),
        "Unit 4": ("We love animals", "我们爱动物", "🐼"),
        "Unit 5": ("Let's eat!", "一起吃饭吧", "🍎"),
        "Unit 6": ("Happy birthday!", "生日快乐", "🎂"),
    },
    "3B": {
        "Unit 1": ("Welcome back", "欢迎回来", "🏫"),
        "Unit 2": ("My family", "我的家人", "👨‍👩‍👧"),
        "Unit 3": ("At the zoo", "在动物园", "🦁"),
        "Unit 4": ("Where is my car?", "我的小汽车在哪里", "🚗"),
        "Unit 5": ("Do you like pears?", "你喜欢梨吗", "🍐"),
        "Unit 6": ("How many?", "有多少", "🔢"),
    },
    "4A": {
        "Unit 1": ("My classroom", "我的教室", "🏫"),
        "Unit 2": ("My schoolbag", "我的书包", "🎒"),
        "Unit 3": ("My friends", "我的朋友", "👫"),
        "Unit 4": ("My home", "我的家", "🏠"),
        "Unit 5": ("Dinner's ready", "晚餐准备好了", "🍽️"),
        "Unit 6": ("Meet my family", "见到我的家人", "👪"),
    },
    "4B": {
        "Unit 1": ("My school", "我的学校", "🏫"),
        "Unit 2": ("What time is it?", "几点了", "⏰"),
        "Unit 3": ("Weather", "天气", "☀️"),
        "Unit 4": ("At the farm", "在农场", "🐮"),
        "Unit 5": ("My clothes", "我的衣服", "👕"),
        "Unit 6": ("Shopping", "购物", "🛍️"),
    },
    "5A": {
        "Unit 1": ("What's he like?", "他什么样", "👨‍🏫"),
        "Unit 2": ("My week", "我的一周", "📅"),
        "Unit 3": ("What would you like?", "你想吃什么", "🥗"),
        "Unit 4": ("What can you do?", "你能做什么", "🎸"),
        "Unit 5": ("There is a big bed", "大床在哪里", "🛏️"),
        "Unit 6": ("In a nature park", "在自然公园", "🌲"),
    },
    "5B": {
        "Unit 1": ("When is Easter?", "复活节是什么时候", "🐰"),
        "Unit 2": ("My favourite season", "我最喜欢的季节", "🍂"),
        "Unit 3": ("My school calendar", "校历", "📆"),
        "Unit 4": ("Shopping", "去购物", "🛒"),
        "Unit 5": ("Whose dog is it?", "这是谁的狗", "🐕"),
        "Unit 6": ("Work quietly!", "安静地工作", "🤫"),
    },
    "6A": {
        "Unit 1": ("How can I get there?", "怎么去那里", "🗺️"),
        "Unit 2": ("Ways to go to school", "上学的方式", "🚌"),
        "Unit 3": ("My weekend plan", "周末计划", "📋"),
        "Unit 4": ("I have a pen pal", "我有个笔友", "✉️"),
        "Unit 5": ("What does he do?", "他做什么工作", "👷"),
        "Unit 6": ("How do you feel?", "你感觉怎么样", "😊"),
    },
    "6B": {
        "Unit 1": ("How tall are you?", "你有多高", "📏"),
        "Unit 2": ("Last weekend", "上个周末", "📅"),
        "Unit 3": ("Where did you go?", "你去哪儿了", "🏕️"),
        "Unit 4": ("Then and now", "那时和现在", "⏳"),
    },
}

EMOJI_MAP: list[tuple[str, str]] = [
    (r"\b(school|classroom|teacher|student)\b", "🏫"),
    (r"\b(book|read|library)\b", "📚"),
    (r"\b(cat|dog|pig|duck|bear|animal|zoo|tiger|panda)\b", "🐾"),
    (r"\b(apple|food|eat|bread|milk|juice|water|fruit)\b", "🍎"),
    (r"\b(red|blue|green|yellow|colour|color)\b", "🎨"),
    (r"\b(time|clock|hour|minute)\b", "⏰"),
    (r"\b(weather|rain|sun|snow|wind|cold|hot)\b", "☀️"),
    (r"\b(car|bus|bike|train|plane|ship)\b", "🚌"),
    (r"\b(family|mother|father|mum|dad|parent)\b", "👨‍👩‍👧"),
    (r"\b(friend|hello|hi)\b", "👋"),
    (r"\b(home|room|bed|door|window)\b", "🏠"),
    (r"\b(clothes|shirt|dress|hat|shoe)\b", "👕"),
    (r"\b(farm|horse|cow|sheep)\b", "🐮"),
    (r"\b(music|song|sing)\b", "🎵"),
    (r"\b(sport|football|basketball)\b", "⚽"),
]

DEFAULT_STAGES = [
    {"id": "s1", "title": "认识单词", "subtitle": "核心单词", "icon": "📚", "type": "vocab", "time": "5分钟"},
    {"id": "s2", "title": "听音辨词", "subtitle": "听力训练", "icon": "🎧", "type": "listenWord", "time": "5分钟"},
    {"id": "s3", "title": "单词配对", "subtitle": "巩固词义", "icon": "🎮", "type": "match", "time": "5分钟"},
    {"id": "s4", "title": "学习句型", "subtitle": "核心句型", "icon": "💬", "type": "sentence", "time": "5分钟"},
    {"id": "s5", "title": "默写挑战", "subtitle": "动手拼写", "icon": "✏️", "type": "write", "time": "8分钟"},
    {"id": "s6", "title": "听力测试", "subtitle": "听句选答案", "icon": "🎯", "type": "listenSent", "time": "6分钟"},
    {"id": "s7", "title": "最终通关", "subtitle": "综合挑战", "icon": "🏆", "type": "finalQuiz", "time": "10分钟"},
]


def normalize_word(w: str) -> str:
    w = w.replace("\u2020", "'").replace("\u2019", "'").replace("‛", "'")
    w = re.sub(r"\s*=\s*.*$", "", w).strip()
    return w


def short_cn(gloss: str) -> str:
    g = gloss.split("；")[0].split(";")[0].strip()
    g = re.sub(r"（[^）]*）", "", g).strip()
    g = re.sub(r"\([^)]*\)", "", g).strip()
    return g[:24] if g else gloss[:24]


def pick_emoji(en: str) -> str:
    low = en.lower()
    for pat, em in EMOJI_MAP:
        if re.search(pat, low):
            return em
    return "📘"


def should_skip_word(en: str, gloss: str) -> bool:
    if len(en) <= 1 and en.isalpha():
        return True
    if re.match(r"^we'?ll\s*=", en, re.I):
        return True
    if "缩写" in gloss and "=" in en:
        return True
    return False


def pick_core_vocab(rows: list[dict], limit: int = 8) -> list[dict]:
    out: list[dict] = []
    seen: set[str] = set()
    for row in rows:
        en = normalize_word(row["word"])
        if not en or en.lower() in seen:
            continue
        gloss = row["gloss"]
        if should_skip_word(en, gloss):
            continue
        seen.add(en.lower())
        cn = short_cn(gloss)
        out.append({"en": en, "cn": cn, "emoji": pick_emoji(en)})
        if len(out) >= limit:
            break
    return out


def _mcq(q: str, correct: str, pool: list[str], point: str = "词汇", dim: str = "vocab") -> dict:
    distractors = [x for x in pool if x != correct]
    random.shuffle(distractors)
    opts = [correct]
    for d in distractors:
        if d not in opts and len(opts) < 4:
            opts.append(d)
    while len(opts) < 4:
        opts.append(f"干扰项{len(opts)}")
    random.shuffle(opts)
    return {"q": q, "opts": opts, "answer": opts.index(correct), "point": point, "dim": dim}


def make_quiz(vocab: list[dict], unit_cn: str, book: str, unit_num: int) -> list[dict]:
    if not vocab:
        return []
    theme = theme_for_book_unit(book, unit_num)
    qs: list[dict] = []
    all_cn = [v["cn"] for v in vocab]
    all_en = [v["en"] for v in vocab]
    cn_pool = themed_distractors(theme, "", all_cn, THEME_POOLS_CN.get(theme, []))
    for v in vocab:
        pool = [x for x in all_cn if x != v["cn"]] + [x for x in cn_pool if x != v["cn"]]
        qs.append(_mcq(f"「{v['en']}」是什么意思？", v["cn"], pool))
    if len(vocab) >= 2:
        v0, v1 = vocab[0], vocab[1]
        en_pool = themed_distractors(theme, v0["en"], all_en)
        qs.append(_mcq(f"哪个是「{v0['cn']}」？", v0["en"], en_pool + all_en))
        qs.append(_mcq(f"「{v1['en']}」的中文是？", v1["cn"], [x for x in all_cn if x != v1["cn"]] + cn_pool))
    theme_en = themed_distractors(theme, vocab[0]["en"], all_en)
    qs.append(
        _mcq(
            f"本单元「{unit_cn}」核心词是？",
            vocab[0]["en"],
            theme_en + all_en,
        )
    )
    qs.extend(make_unit_quiz_extras(book, unit_num, vocab, unit_cn))
    return qs[:15]


def make_listening(vocab: list[dict], dialogues: list[dict]) -> list[dict]:
    out: list[dict] = []
    sentences: list[str] = []
    for d in dialogues:
        for line in d.get("lines", []):
            text = line.get("text", "").strip()
            if len(text) > 4 and text not in sentences:
                sentences.append(text)
    all_en = [v["en"] for v in vocab]
    for audio in sentences[:6]:
        opts = [audio]
        for alt in similar_sentence_distractors(audio, all_en):
            if alt not in opts and len(opts) < 4:
                opts.append(alt)
        for other in vocab:
            if len(opts) >= 4:
                break
            alt = other["en"] if " " not in other["en"] else f"It's {other['en']}."
            if alt not in opts and alt != audio:
                opts.append(alt)
        while len(opts) < 4:
            opts.append(f"Option {len(opts)}")
        out.append({"audio": audio, "opts": opts[:4], "answer": 0})
    if not out:
        for v in vocab[:6]:
            audio = v["en"] if len(v["en"]) > 8 else f"This is {v['en']}."
            opts = [audio]
            for other in vocab:
                if other["en"] != v["en"] and len(opts) < 4:
                    alt = other["en"] if " " not in other["en"] else f"This is {other['en']}."
                    if alt not in opts:
                        opts.append(alt)
            while len(opts) < 4:
                opts.append(f"Option {len(opts)}")
            out.append({"audio": audio, "opts": opts[:4], "answer": 0})
    return out


def strip_storybook(unit: dict) -> dict:
    """Remove storybook stage/data from legacy hub units."""
    cleaned = dict(unit)
    cleaned.pop("storybook", None)
    vocab = cleaned.get("vocabulary") or []
    stages = [{**s} for s in DEFAULT_STAGES]
    if vocab:
        stages[0]["subtitle"] = f"{len(vocab)}个核心单词"
    cleaned["stages"] = stages
    return cleaned


def unit_id(grade: int, vol: str, num: int) -> str:
    v = "v1" if "volume1" in vol else "v2"
    return f"g{grade}{v}_u{num}"


def build_unit(book: str, unit_key: str, num: int, rows: list[dict], grade: int, sem_id: str) -> dict:
    meta = UNIT_META.get(book, {}).get(unit_key, (f"Unit {num}", f"第{num}单元", "📘"))
    title, cn, emoji = meta
    vocab = pick_core_vocab(rows)
    stages = [{**s, "subtitle": s["subtitle"].replace("核心单词", f"{len(vocab)}个核心单词")} for s in DEFAULT_STAGES]
    if stages and vocab:
        stages[0]["subtitle"] = f"{len(vocab)}个核心单词"
    uid = unit_id(grade, sem_id, num)
    available = len(vocab) > 0
    dialogues = make_unit_dialogues(book, num, vocab, title, cn) if available else []
    return {
        "id": uid,
        "num": num,
        "title": title,
        "cn": cn,
        "emoji": emoji,
        "available": available,
        "vocabulary": vocab,
        "dialogues": dialogues,
        "stages": stages,
        "quizQuestions": make_quiz(vocab, cn, book, num) if available else [],
        "listeningQuestions": make_listening(vocab, dialogues) if available else [],
    }


def load_csv(book: str) -> dict[str, list[dict]]:
    path = VOCAB_DIR / f"primary_{book}_clean.csv"
    by_unit: dict[str, list[dict]] = defaultdict(list)
    with path.open(encoding="utf-8") as f:
        for row in csv.DictReader(f):
            by_unit[row["unit"]].append(row)
    return by_unit


def load_g4_u1_full() -> dict | None:
    if not LEGACY_G4_U1.exists():
        return None
    return json.loads(LEGACY_G4_U1.read_text(encoding="utf-8"))


def main() -> None:
    random.seed(42)
    grades: dict[int, dict] = {}
    g4_u1 = load_g4_u1_full()

    for book in ["3A", "3B", "4A", "4B", "5A", "5B", "6A", "6B"]:
        grade_key, sem_id = BOOK_TO_SEM[book]
        grade_num = int(grade_key.replace("grade", ""))
        if grade_num not in grades:
            grades[grade_num] = {
                "name": GRADE_NAMES[grade_num],
                "semesters": {
                    f"grade{grade_num}_volume1": {"name": "上册", "available": False, "units": []},
                    f"grade{grade_num}_volume2": {"name": "下册", "available": False, "units": []},
                },
            }
        by_unit = load_csv(book)
        units = []
        for i, uk in enumerate(sorted(by_unit.keys(), key=lambda x: int(re.search(r"\d+", x).group())), start=1):
            u = build_unit(book, uk, i, by_unit[uk], grade_num, sem_id)
            if g4_u1 and u["id"] == "g4v2_u1":
                u = strip_storybook(g4_u1)
            units.append(u)
        sem = grades[grade_num]["semesters"][sem_id]
        sem["units"] = units
        sem["available"] = any(u["available"] for u in units)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for g, course in grades.items():
        out = OUT_DIR / f"grade{g}.json"
        out.write_text(json.dumps({f"grade{g}": course}, ensure_ascii=False, indent=2), encoding="utf-8")
        u_count = sum(len(s["units"]) for s in course["semesters"].values())
        avail = sum(1 for s in course["semesters"].values() for u in s["units"] if u["available"])
        print(f"Wrote {out.name}: {u_count} units, {avail} available")


if __name__ == "__main__":
    main()
