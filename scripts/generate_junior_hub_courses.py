#!/usr/bin/env python3
"""Generate junior hub JSON (grades 7–9) from docs/vocab/junior_merged.csv + PEP unit map."""
from __future__ import annotations

import csv
import json
import random
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VOCAB_CSV = ROOT / "docs" / "vocab" / "junior_merged.csv"
GRAMMAR_MAP = ROOT / "docs" / "junior" / "pep_unit_grammar_map.json"
LESSON_JSON = ROOT / "docs" / "junior" / "pep_lesson_content.json"
OUT_DIR = ROOT / "src" / "data" / "juniorHub"

BOOK_TO_SEM = {
    "7A": ("grade7", "grade7_volume1"),
    "7B": ("grade7", "grade7_volume2"),
    "8A": ("grade8", "grade8_volume1"),
    "8B": ("grade8", "grade8_volume2"),
    "9": ("grade9", "grade9_full"),
}

GRADE_NAMES = {7: "七年级", 8: "八年级", 9: "九年级"}

UNIT_META: dict[str, dict[str, tuple[str, str, str]]] = {
    "7A": {
        "SU1": ("Good morning!", "早上好", "🌅"),
        "SU2": ("What's this in English?", "这个用英语怎么说", "📖"),
        "SU3": ("What color is it?", "它是什么颜色", "🎨"),
        "U1": ("My name's Gina.", "我叫吉娜", "👋"),
        "U2": ("This is my sister.", "这是我的姐姐", "👨‍👩‍👧"),
        "U3": ("Is this your pencil?", "这是你的铅笔吗", "✏️"),
        "U4": ("Where's my schoolbag?", "我的书包在哪里", "🎒"),
        "U5": ("Do you have a soccer ball?", "你有足球吗", "⚽"),
        "U6": ("Do you like bananas?", "你喜欢香蕉吗", "🍌"),
        "U7": ("How much are these socks?", "这些袜子多少钱", "🧦"),
        "U8": ("When is your birthday?", "你的生日是什么时候", "🎂"),
        "U9": ("My favorite subject is science.", "我最喜欢的科目是科学", "🔬"),
    },
    "7B": {
        "U1": ("Can you play the guitar?", "你会弹吉他吗", "🎸"),
        "U2": ("What time do you go to school?", "你几点上学", "⏰"),
        "U3": ("How do you get to school?", "你怎么去学校", "🚌"),
        "U4": ("Don't eat in class.", "上课不要吃", "🏫"),
        "U5": ("Why do you like pandas?", "你为什么喜欢熊猫", "🐼"),
        "U6": ("I'm watching TV.", "我在看电视", "📺"),
        "U7": ("It's raining!", "下雨了", "🌧️"),
        "U8": ("Is there a post office near here?", "附近有邮局吗", "📮"),
        "U9": ("What does he look like?", "他长什么样", "👤"),
        "U10": ("I'd like some noodles.", "我想要一些面条", "🍜"),
        "U11": ("How was your school trip?", "你的学校旅行怎么样", "🏕️"),
        "U12": ("What did you do last weekend?", "你上周末做了什么", "📅"),
    },
    "8A": {
        "U1": ("Where did you go on vacation?", "你去哪里度假了", "🏖️"),
        "U2": ("How often do you exercise?", "你多久锻炼一次", "🏃"),
        "U3": ("I'm more outgoing than my sister.", "我比我姐姐外向", "😊"),
        "U4": ("What's the best movie theater?", "哪家电影院最好", "🎬"),
        "U5": ("Do you want to watch a game show?", "你想看游戏节目吗", "📺"),
        "U6": ("I'm going to study computer science.", "我打算学计算机", "💻"),
        "U7": ("Will people have robots?", "人们会有机器人吗", "🤖"),
        "U8": ("How do you make a banana milk shake?", "怎么做香蕉奶昔", "🥤"),
        "U9": ("Can you come to my party?", "你能来我的派对吗", "🎉"),
        "U10": ("If you go to the party, you'll have a great time!", "如果你去派对会玩得很开心", "🎊"),
    },
    "8B": {
        "U1": ("What's the matter?", "怎么了", "🤒"),
        "U2": ("I'll help to clean up the city parks.", "我会帮忙清理城市公园", "🌳"),
        "U3": ("Could you please clean your room?", "你能打扫房间吗", "🧹"),
        "U4": ("Why don't you talk to your parents?", "你为什么不和父母谈谈", "💬"),
        "U5": ("What were you doing when the rainstorm came?", "暴风雨来时你在做什么", "⛈️"),
        "U6": ("An old man tried to move the mountains.", "愚公移山", "⛰️"),
        "U7": ("What's the highest mountain in the world?", "世界上最高的山是什么", "🏔️"),
        "U8": ("Have you read Treasure Island yet?", "你读过金银岛吗", "📚"),
        "U9": ("Have you ever been to a museum?", "你去过博物馆吗", "🏛️"),
        "U10": ("I've had this bike for three years.", "这辆自行车我骑了三年", "🚲"),
    },
    "9": {
        "U1": ("How can we become good learners?", "怎样成为好的学习者", "📚"),
        "U2": ("I think that mooncakes are delicious!", "我觉得月饼很好吃", "🥮"),
        "U3": ("Could you please tell me where the restrooms are?", "请问洗手间在哪里", "🚻"),
        "U4": ("I used to be afraid of the dark.", "我过去怕黑", "🌙"),
        "U5": ("What are the shirts made of?", "这些衬衫是什么做的", "👕"),
        "U6": ("When was it invented?", "它是什么时候发明的", "💡"),
        "U7": ("Teenagers should be allowed to choose their own clothes.", "青少年应被允许自己选衣服", "👔"),
        "U8": ("It must belong to Carla.", "它一定是卡拉的", "🔍"),
        "U9": ("I like music that I can dance to.", "我喜欢能跳舞的音乐", "🎵"),
        "U10": ("You're supposed to shake hands.", "你应该握手", "🤝"),
        "U11": ("Sad movies make me cry.", "悲伤的电影让我哭", "😢"),
        "U12": ("Life is full of the unexpected.", "生活充满意外", "✨"),
        "U13": ("We're trying to save the earth!", "我们在努力拯救地球", "🌍"),
        "U14": ("I remember meeting all of you in Grade 7.", "我记得七年级认识你们", "🎓"),
    },
}

EMOJI_MAP: list[tuple[str, str]] = [
    (r"\b(school|classroom|teacher|student)\b", "🏫"),
    (r"\b(book|read|library)\b", "📚"),
    (r"\b(cat|dog|animal|zoo|panda|tiger)\b", "🐾"),
    (r"\b(apple|food|eat|bread|milk|juice|fruit|banana)\b", "🍎"),
    (r"\b(time|clock|hour|minute)\b", "⏰"),
    (r"\b(weather|rain|sun|snow)\b", "☀️"),
    (r"\b(car|bus|bike|train|subway)\b", "🚌"),
    (r"\b(family|mother|father|parent|sister|brother)\b", "👨‍👩‍👧"),
    (r"\b(music|guitar|piano|drum|sing|dance)\b", "🎵"),
    (r"\b(sport|football|basketball|soccer)\b", "⚽"),
    (r"\b(robot|computer|science)\b", "🤖"),
]

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


def normalize_word(w: str) -> str:
    w = w.replace("\u2020", "'").replace("\u2019", "'").strip()
    w = re.sub(r"\s*=\s*.*$", "", w).strip()
    return w


def short_cn(gloss: str) -> str:
    g = gloss.split("；")[0].split(";")[0].strip()
    g = re.sub(r"（[^）]*）", "", g).strip()
    g = re.sub(r"\([^)]*\)", "", g).strip()
    return g[:32] if g else gloss[:32]


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


def pick_core_vocab(rows: list[dict], limit: int = 12) -> list[dict]:
    out: list[dict] = []
    seen: set[str] = set()
    for row in rows:
        en = normalize_word(row["word"])
        if not en or en.lower() in seen:
            continue
        gloss = row.get("meaning_cn") or row.get("gloss") or ""
        if should_skip_word(en, gloss):
            continue
        seen.add(en.lower())
        out.append({"en": en, "cn": short_cn(gloss), "emoji": pick_emoji(en)})
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
        opts.append(f"选项{len(opts)}")
    random.shuffle(opts)
    return {"q": q, "opts": opts, "answer": opts.index(correct), "point": point, "dim": dim}


def make_quiz(vocab: list[dict], unit_cn: str) -> list[dict]:
    if not vocab:
        return []
    qs: list[dict] = []
    all_cn = [v["cn"] for v in vocab]
    all_en = [v["en"] for v in vocab]
    for v in vocab[:8]:
        qs.append(_mcq(f"「{v['en']}」的意思是？", v["cn"], all_cn))
    if len(vocab) >= 2:
        qs.append(_mcq(f"哪个单词表示「{vocab[0]['cn']}」？", vocab[0]["en"], all_en))
    # ⚠️ 已禁用「本单元『{主题}』的核心词是?」题:单元主题非具体单词,无唯一答案=废题(2026-06 删)。
    # 别恢复:一个单元所有词都是核心词,任选 vocab[0] 当答案都不成立(且原干扰项是字母填充词,更乱)。
    return qs[:18]


def make_grammar_quiz(vocab: list[dict], grammar_title: str) -> list[dict]:
    if not vocab:
        return []
    qs = []
    v0 = vocab[0]
    qs.append(
        _mcq(
            f"本单元语法重点：{grammar_title}。下列哪项与「{v0['en']}」词义最接近？",
            v0["cn"],
            [v["cn"] for v in vocab],
            point=grammar_title,
            dim="grammar",
        )
    )
    if len(vocab) >= 2:
        qs.append(
            _mcq(
                f"选择正确的英文：「{vocab[1]['cn']}」",
                vocab[1]["en"],
                [v["en"] for v in vocab],
                point=grammar_title,
                dim="grammar",
            )
        )
    return qs


def make_listening(vocab: list[dict]) -> list[dict]:
    out: list[dict] = []
    for v in vocab[:8]:
        audio = v["en"] if " " not in v["en"] else f"Listen: {v['en']}."
        opts = [audio]
        for other in vocab:
            if other["en"] != v["en"] and len(opts) < 4:
                alt = other["en"] if " " not in other["en"] else f"Listen: {other['en']}."
                if alt not in opts:
                    opts.append(alt)
        while len(opts) < 4:
            opts.append(f"Option {len(opts)}")
        out.append({"audio": audio, "opts": opts[:4], "answer": 0})
    return out


def make_reading(vocab: list[dict], title: str, cn: str) -> dict:
    words = ", ".join(v["en"] for v in vocab[:6])
    passage = (
        f"This unit is about {title}. "
        f"In this lesson we learn words like {words}. "
        f"Students practice reading and using these words in sentences about {cn}."
    )
    passage_cn = f"本单元主题是「{cn}」。我们学习 {words} 等词汇，并在句子中运用。"
    qs = []
    if vocab:
        qs.append(
            _mcq(
                "What is this unit mainly about?",
                title,
                [title, "Sports only", "Math class", "Cooking"],
                point="阅读主旨",
                dim="reading",
            )
        )
        qs.append(
            _mcq(
                f"What does 「{vocab[0]['en']}」 mean in Chinese?",
                vocab[0]["cn"],
                [v["cn"] for v in vocab],
                point="词汇理解",
                dim="reading",
            )
        )
    return {"passage": passage, "passageCn": passage_cn, "questions": qs}


def make_writing(vocab: list[dict], title: str, cn: str) -> dict:
    prompt = f"Write 3–5 sentences about 「{cn}」 ({title}). Use at least 3 words from this unit."
    prompt_cn = f"用 3–5 个句子描述「{cn}」，至少使用本单元 3 个词汇。"
    sample_words = [v["en"] for v in vocab[:5]]
    return {"prompt": prompt, "promptCn": prompt_cn, "sampleWords": sample_words}


def make_listening_from_lines(lines: list[str], vocab: list[dict]) -> list[dict]:
    out: list[dict] = []
    for line in lines[:8]:
        audio = line
        opts = [audio]
        for v in vocab:
            alt = v["en"] if " " not in v["en"] else f"This is {v['en']}."
            if alt not in opts and len(opts) < 4:
                opts.append(alt)
        while len(opts) < 4:
            opts.append(f"Option {len(opts)}")
        out.append({"audio": audio, "opts": opts[:4], "answer": 0})
    return out or make_listening(vocab)


def apply_lesson_extract(
    unit: dict,
    extracted: dict | None,
    vocab: list[dict],
    title: str,
    cn: str,
) -> None:
    if not extracted:
        return
    if extracted.get("dialogues"):
        unit["dialogues"] = extracted["dialogues"]
    reading = extracted.get("reading")
    if reading and reading.get("passage"):
        passage = reading["passage"]
        unit["reading"] = {
            "passage": passage,
            "passageCn": reading.get("passageCn") or f"本单元阅读：{cn}",
            "questions": make_reading(vocab, title, cn)["questions"],
        }
        # Add passage-based MCQ
        unit["reading"]["questions"].insert(
            0,
            _mcq(
                "According to the passage, this unit is mainly about:",
                title,
                [title, "A different topic", "Only grammar", "Only listening"],
                point="课文理解",
                dim="reading",
            ),
        )
    lines = extracted.get("listeningLines") or []
    if lines:
        unit["listeningQuestions"] = make_listening_from_lines(lines, vocab)
    writing = extracted.get("writing")
    if writing and writing.get("prompt"):
        unit["writing"] = {
            "prompt": writing["prompt"],
            "promptCn": writing.get("promptCn") or unit["writing"]["promptCn"],
            "sampleWords": [v["en"] for v in vocab[:6]],
        }


def load_lesson_content() -> dict:
    if not LESSON_JSON.exists():
        return {}
    return json.loads(LESSON_JSON.read_text(encoding="utf-8"))


def make_dialogues(vocab: list[dict], title: str) -> list[dict]:
    if len(vocab) < 2:
        return []
    a, b = vocab[0], vocab[1]
    return [
        {
            "title": "Section A",
            "lines": [
                {"role": "A", "text": f"Do you know {a['en']}?", "cn": f"你知道{a['cn']}吗？"},
                {"role": "B", "text": f"Yes, and {b['en']} too.", "cn": f"知道，还有{b['cn']}。"},
                {"role": "A", "text": f"Great! Let's talk about {title}.", "cn": f"太好了！我们来聊聊{title}。"},
            ],
        }
    ]


def unit_sort_key(uk: str) -> tuple:
    if uk.startswith("SU"):
        return (0, int(re.search(r"\d+", uk).group()))
    return (1, int(re.search(r"\d+", uk).group()))


def unit_id(grade: int, vol: str, num: int) -> str:
    if "volume1" in vol:
        v = "v1"
    elif "volume2" in vol:
        v = "v2"
    else:
        v = "full"
    return f"g{grade}{v}_u{num}"


def load_junior_csv() -> dict[tuple[str, str], list[dict]]:
    by: dict[tuple[str, str], list[dict]] = defaultdict(list)
    with VOCAB_CSV.open(encoding="utf-8") as f:
        for row in csv.DictReader(f):
            by[(row["volume"], row["unit"])].append(row)
    return by


def main() -> None:
    random.seed(42)
    grammar_map = json.loads(GRAMMAR_MAP.read_text(encoding="utf-8"))
    lesson_content = load_lesson_content()
    by_vol_unit = load_junior_csv()
    grades: dict[int, dict] = {}

    for book in ["7A", "7B", "8A", "8B", "9"]:
        grade_key, sem_id = BOOK_TO_SEM[book]
        grade_num = int(grade_key.replace("grade", ""))
        if grade_num not in grades:
            grades[grade_num] = {
                "name": GRADE_NAMES[grade_num],
                "semesters": {},
            }
        if sem_id not in grades[grade_num]["semesters"]:
            grades[grade_num]["semesters"][sem_id] = {
                "name": "全一册" if book == "9" else ("上册" if "volume1" in sem_id else "下册"),
                "available": False,
                "units": [],
            }

        unit_keys = sorted(
            [uk for (vol, uk) in by_vol_unit if vol == book],
            key=unit_sort_key,
        )
        units = []
        for i, uk in enumerate(unit_keys, start=1):
            rows = by_vol_unit[(book, uk)]
            meta = UNIT_META.get(book, {}).get(uk, (f"Unit {uk}", f"第{uk}单元", "📘"))
            title, cn, emoji = meta
            ginfo = grammar_map.get(book, {}).get(uk, {})
            grammar_title = ginfo.get("title") or "本单元语法"
            grammar_code = ginfo.get("grammarCode")

            vocab = pick_core_vocab(rows, limit=12)
            stages = [{**s} for s in DEFAULT_STAGES]
            if vocab:
                stages[0]["subtitle"] = f"{len(vocab)}个教材词汇"
            stages[3]["subtitle"] = grammar_title

            uid = unit_id(grade_num, sem_id, i)
            available = len(vocab) > 0
            unit = {
                "id": uid,
                "num": i,
                "unitKey": uk,
                "book": book,
                "title": title,
                "cn": cn,
                "emoji": emoji,
                "available": available,
                "vocabulary": vocab,
                "dialogues": make_dialogues(vocab, title) if available else [],
                "stages": stages,
                "grammarTitle": grammar_title,
                "grammarCode": grammar_code,
                "grammarQuiz": make_grammar_quiz(vocab, grammar_title),
                "reading": make_reading(vocab, title, cn) if available else None,
                "writing": make_writing(vocab, title, cn) if available else None,
                "quizQuestions": make_quiz(vocab, cn) if available else [],
                "listeningQuestions": make_listening(vocab) if available else [],
            }
            apply_lesson_extract(
                unit,
                lesson_content.get(book, {}).get(uk),
                vocab,
                title,
                cn,
            )
            units.append(unit)

        sem = grades[grade_num]["semesters"][sem_id]
        sem["units"] = units
        sem["available"] = any(u["available"] for u in units)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for g, course in grades.items():
        out = OUT_DIR / f"grade{g}.json"
        out.write_text(json.dumps({f"grade{g}": course}, ensure_ascii=False, indent=2), encoding="utf-8")
        u_count = sum(len(s["units"]) for s in course["semesters"].values())
        print(f"Wrote {out.name}: {u_count} units")


if __name__ == "__main__":
    main()
