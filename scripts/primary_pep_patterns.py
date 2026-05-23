"""PEP primary (G3–G6) dialogue templates, sentence patterns, and quiz helpers."""
from __future__ import annotations

import random
import re
from typing import Callable

from primary_pep_dialogues import get_unit_dialogues

DialogueBuilder = Callable[[list[dict], str, str], list[dict]]

# Thematic distractor pools (same POS / theme plausible wrong answers)
THEME_POOLS: dict[str, list[str]] = {
    "school_place": ["library", "classroom", "playground", "art room", "music room", "computer room", "teachers' office"],
    "school_item": ["schoolbag", "book", "pencil", "ruler", "notebook", "storybook"],
    "room": ["bedroom", "living room", "kitchen", "bathroom", "study"],
    "food": ["bread", "milk", "egg", "rice", "noodles", "soup", "chicken", "beef"],
    "fruit": ["apple", "pear", "banana", "orange", "watermelon"],
    "animal": ["cat", "dog", "duck", "pig", "bear", "panda", "tiger", "monkey"],
    "colour": ["red", "blue", "green", "yellow", "black", "white", "brown", "orange"],
    "body": ["head", "eye", "ear", "nose", "mouth", "arm", "hand", "leg"],
    "family": ["father", "mother", "brother", "sister", "uncle", "aunt", "cousin"],
    "job": ["doctor", "nurse", "driver", "farmer", "cook", "teacher"],
    "weather": ["sunny", "cloudy", "rainy", "windy", "snowy", "cold", "hot", "warm", "cool"],
    "farm": ["tomato", "potato", "carrot", "horse", "cow", "sheep", "hen", "goat"],
    "clothes": ["shirt", "dress", "skirt", "coat", "jacket", "pants", "shorts", "hat"],
    "time": ["breakfast", "lunch", "dinner", "get up", "go to school", "go to bed"],
    "transport": ["bus", "bike", "car", "plane", "ship", "subway", "train"],
    "feeling": ["happy", "sad", "angry", "tired", "hungry", "worried"],
    "season": ["spring", "summer", "autumn", "winter"],
    "floor": ["first floor", "second floor", "third floor"],
    "prep": ["on", "in", "under", "next to", "near"],
    "number_cn": ["一楼", "二楼", "三楼", "四楼", "五楼"],
    "meal_cn": ["早餐", "午餐", "晚餐", "午饭", "早饭"],
    "room_cn": ["卧室", "客厅", "厨房", "浴室", "书房", "教室", "图书馆"],
    "weather_cn": ["晴朗", "多云", "下雨", "刮风", "下雪", "寒冷", "炎热"],
}


def article(noun: str) -> str:
    return "an" if noun[:1].lower() in "aeiou" else "a"


def find_word(vocab: list[dict], *patterns: str, default_idx: int = 0) -> dict:
    for pat in patterns:
        rx = re.compile(pat, re.I)
        for v in vocab:
            if rx.search(v["en"]):
                return v
    return vocab[default_idx] if vocab else {"en": "it", "cn": "它", "emoji": "📘"}


def pick_words(vocab: list[dict], n: int = 3) -> list[dict]:
    return vocab[:n] if vocab else []


def _line(role: str, text: str, cn: str) -> dict:
    return {"role": role, "text": text, "cn": cn}


def _dlg(title: str, *lines: dict) -> dict:
    return {"title": title, "lines": list(lines)}


def theme_for_book_unit(book: str, unit_num: int) -> str:
    key = f"{book}:{unit_num}"
    mapping = {
        "3A:1": "school_item", "3A:2": "colour", "3A:3": "body", "3A:4": "animal",
        "3A:5": "food", "3A:6": "family",
        "3B:1": "school_item", "3B:2": "family", "3B:3": "animal", "3B:4": "transport",
        "3B:5": "fruit", "3B:6": "number",
        "4A:1": "school_place", "4A:2": "school_item", "4A:3": "family", "4A:4": "room",
        "4A:5": "food", "4A:6": "family",
        "4B:1": "school_place", "4B:2": "time", "4B:3": "weather", "4B:4": "farm",
        "4B:5": "clothes", "4B:6": "clothes",
        "5A:1": "family", "5A:2": "time", "5A:3": "food", "5A:4": "sport",
        "5A:5": "room", "5A:6": "nature",
        "5B:1": "season", "5B:2": "season", "5B:3": "season", "5B:4": "clothes",
        "5B:5": "animal", "5B:6": "school_place",
        "6A:1": "transport", "6A:2": "transport", "6A:3": "time", "6A:4": "family",
        "6A:5": "job", "6A:6": "feeling",
        "6B:1": "family", "6B:2": "time", "6B:3": "transport", "6B:4": "family",
    }
    return mapping.get(key, "school_item")


def themed_distractors(theme: str, correct: str, vocab_pool: list[str], extra: list[str] | None = None) -> list[str]:
    pool = list(dict.fromkeys(vocab_pool + THEME_POOLS.get(theme, []) + (extra or [])))
    return [x for x in pool if x != correct]


def similar_sentence_distractors(sentence: str, vocab_en: list[str]) -> list[str]:
    """Build plausible listening distractors by swapping one content word."""
    words = sentence.replace("?", ".").replace("!", ".").split()
    out: list[str] = []
    for w in vocab_en:
        if w.lower() in sentence.lower() and w.lower() not in {"a", "an", "the", "is", "it", "to", "do", "you"}:
            alt = sentence.replace(w, vocab_en[(vocab_en.index(w) + 1) % len(vocab_en)] if w in vocab_en else w)
            if alt != sentence and alt not in out:
                out.append(alt)
    if len(out) < 3:
        for alt_tpl in [
            sentence.replace("?", "."),
            sentence.replace("It's", "It is"),
            sentence.replace("What's", "What is"),
            sentence.replace("Where's", "Where is"),
        ]:
            if alt_tpl != sentence and alt_tpl not in out:
                out.append(alt_tpl)
    return out[:3]


# ---------------------------------------------------------------------------
# Per-unit PEP dialogue builders (book, unit_num) -> dialogues
# ---------------------------------------------------------------------------

def _3a_u1(v, title, cn):
    w0, w1 = find_word(v, "ruler", "pencil"), find_word(v, "bag", "book", default_idx=1)
    return [
        _dlg("A Let's talk",
             _line("Sarah", "Hello! I'm Sarah.", "你好！我是萨拉。"),
             _line("Mike", "Hi, Sarah! I'm Mike.", "嗨，萨拉！我是迈克。"),
             _line("Sarah", f"What's this?", "这是什么？"),
             _line("Mike", f"It's {article(w0['en'])} {w0['en']}.", f"是{article(w0['en'])}{w0['cn']}。"),
             _line("Sarah", f"What's that?", "那是什么？"),
             _line("Mike", f"It's {article(w1['en'])} {w1['en']}.", f"是{article(w1['en'])}{w1['cn']}。")),
        _dlg("B Let's talk",
             _line("Chen Jie", "Good morning! I'm Miss White.", "早上好！我是怀特老师。"),
             _line("Students", "Good morning, Miss White!", "早上好，怀特老师！"),
             _line("Chen Jie", "Show me your pencil.", "给我看看你的铅笔。"),
             _line("Student", "OK! Here you are.", "好的！给你。")),
    ]


def _3a_u2(v, title, cn):
    red = find_word(v, "red")
    blue = find_word(v, "blue", default_idx=1)
    return [
        _dlg("A Let's talk",
             _line("Miss White", f"I see {red['en']}.", f"我看见{red['cn']}。"),
             _line("Amy", f"I see {blue['en']}.", f"我看见{blue['cn']}。"),
             _line("Miss White", "Show me green.", "给我看看绿色。"),
             _line("Amy", "OK!", "好的！")),
        _dlg("B Let's talk",
             _line("Sarah", f"Colour it {red['en']}.", f"把它涂成{red['cn']}。"),
             _line("John", "OK.", "好的。"),
             _line("Sarah", f"Colour it {blue['en']}.", f"把它涂成{blue['cn']}。"),
             _line("John", "Great!", "太棒了！")),
    ]


def _3a_u3(v, title, cn):
    eye = find_word(v, "eye")
    nose = find_word(v, "nose", default_idx=1)
    return [
        _dlg("A Let's talk",
             _line("Sarah", "Good morning!", "早上好！"),
             _line("Mike", "Good morning!", "早上好！"),
             _line("Sarah", "Look at me!", "看看我！"),
             _line("Mike", "This is my face.", "这是我的脸。"),
             _line("Sarah", f"This is my {eye['en']}.", f"这是我的{eye['cn']}。"),
             _line("Mike", f"This is my {nose['en']}.", f"这是我的{nose['cn']}。")),
    ]


def _3a_u4(v, title, cn):
    cat = find_word(v, "cat", "dog", "duck")
    panda = find_word(v, "panda", "bear", default_idx=1)
    return [
        _dlg("A Let's talk",
             _line("Sarah", f"Look! {article(cat['en']).capitalize()} {cat['en']}.", f"看！一{cat['cn']}。"),
             _line("Mike", "Cool! I like it.", "酷！我喜欢。"),
             _line("Sarah", f"Look! {article(panda['en']).capitalize()} {panda['en']}.", f"看！一{panda['cn']}。"),
             _line("Mike", "Super! I like it.", "超级棒！我喜欢。")),
        _dlg("B Let's talk",
             _line("Zhang Peng", "What's this?", "这是什么？"),
             _line("Amy", f"It's {article(cat['en'])} {cat['en']}.", f"是{article(cat['en'])}{cat['cn']}。"),
             _line("Zhang Peng", "What's that?", "那是什么？"),
             _line("Amy", f"It's {article(panda['en'])} {panda['en']}.", f"是{article(panda['en'])}{panda['cn']}。")),
    ]


def _3a_u5(v, title, cn):
    bread = find_word(v, "bread", "egg")
    juice = find_word(v, "juice", "milk", default_idx=1)
    return [
        _dlg("A Let's talk",
             _line("Sarah", "I'd like some bread, please.", "我想要一些面包。"),
             _line("Amy", "I'd like some juice, please.", "我想要一些果汁。"),
             _line("Sarah", f"Have some {bread['en']}.", f"吃些{bread['cn']}。"),
             _line("Amy", "Thanks.", "谢谢。")),
        _dlg("B Let's talk",
             _line("Mike", f"Do you like {juice['en']}?", f"你喜欢{juice['cn']}吗？"),
             _line("John", "Yes, I do.", "是的，我喜欢。"),
             _line("Mike", f"Do you like {bread['en']}?", f"你喜欢{bread['cn']}吗？"),
             _line("John", "No, I don't.", "不，我不喜欢。")),
    ]


def _3a_u6(v, title, cn):
    return [
        _dlg("A Let's talk",
             _line("Sarah", "This one, please.", "请给我这个。"),
             _line("Shopkeeper", "Sure. How many?", "当然。多少个？"),
             _line("Sarah", "Three.", "三个。"),
             _line("Shopkeeper", "OK. Here you are.", "好的。给你。")),
        _dlg("B Let's talk",
             _line("John", "How old are you?", "你几岁了？"),
             _line("Sarah", "I'm six years old.", "我六岁了。"),
             _line("John", "Happy birthday!", "生日快乐！"),
             _line("Sarah", "Thank you!", "谢谢你！")),
    ]


def _3b_u1(v, title, cn):
    w = find_word(v, "bag", "book", "pencil")
    return [
        _dlg("A Let's talk",
             _line("Amy", "Welcome back!", "欢迎回来！"),
             _line("Mike", "Nice to see you again!", "很高兴再次见到你！"),
             _line("Amy", f"I have {article(w['en'])} {w['en']}.", f"我有一个{w['cn']}。"),
             _line("Mike", "Me too!", "我也是！")),
    ]


def _3b_u2(v, title, cn):
    mum = find_word(v, "mother", "mum", "dad", "father")
    sister = find_word(v, "sister", "brother", default_idx=1)
    return [
        _dlg("A Let's talk",
             _line("Amy", "Who's that woman?", "那位女士是谁？"),
             _line("Sarah", f"She's my {mum['en']}.", f"她是我{mum['cn']}。"),
             _line("Amy", "Who's that girl?", "那个女孩是谁？"),
             _line("Sarah", f"She's my {sister['en']}.", f"她是我{sister['cn']}。")),
    ]


def _3b_u3(v, title, cn):
    giraffe = find_word(v, "giraffe", "tall")
    monkey = find_word(v, "monkey", "short", default_idx=1)
    return [
        _dlg("A Let's talk",
             _line("Zhang Peng", f"Look at that {giraffe['en'] if 'giraffe' in giraffe['en'].lower() else 'giraffe'}.", "看那只长颈鹿。"),
             _line("Mike", "It's so tall!", "它好高啊！"),
             _line("Zhang Peng", f"Look at that {monkey['en'] if 'monkey' in monkey['en'].lower() else 'monkey'}.", "看那只猴子。"),
             _line("Mike", "It's so short!", "它好矮啊！")),
    ]


def _3b_u4(v, title, cn):
    car = find_word(v, "car", "ball", "toy")
    return [
        _dlg("A Let's talk",
             _line("John", f"Where is my {car['en']}?", f"我的{car['cn']}在哪里？"),
             _line("Mike", "Is it in the toy box?", "在玩具箱里吗？"),
             _line("John", "No, it isn't.", "不，不在。"),
             _line("Mike", "Look! It's under the chair.", "看！在椅子下面。")),
    ]


def _3b_u5(v, title, cn):
    pear = find_word(v, "pear", "apple")
    banana = find_word(v, "banana", "orange", default_idx=1)
    return [
        _dlg("A Let's talk",
             _line("Mike", f"Do you like {pear['en']}s?", f"你喜欢{pear['cn']}吗？"),
             _line("Sarah", "Yes, I do.", "是的，我喜欢。"),
             _line("Mike", f"Do you like {banana['en']}s?", f"你喜欢{banana['cn']}吗？"),
             _line("Sarah", "No, I don't.", "不，我不喜欢。")),
    ]


def _3b_u6(v, title, cn):
    return [
        _dlg("A Let's talk",
             _line("Amy", "How many kites do you see?", "你看见多少只风筝？"),
             _line("Sarah", "I see 12!", "我看见12只！"),
             _line("Amy", "How many crayons do you have?", "你有多少支蜡笔？"),
             _line("Sarah", "I have 16.", "我有16支。")),
    ]


def _4a_u1(v, title, cn):
    light = find_word(v, "light", "door", "window")
    desk = find_word(v, "desk", "teacher", default_idx=1)
    return [
        _dlg("A Let's talk",
             _line("Sarah", "Hey, Zhang Peng. We have a new classroom.", "嘿，张鹏。我们有新教室了。"),
             _line("Zhang Peng", "Really? What's in the classroom?", "真的吗？教室里有什么？"),
             _line("Sarah", f"Let's go and see!", "我们去看看吧！"),
             _line("Zhang Peng", f"It's so big! We have {article(desk['en'])} {desk['en']}.", f"好大啊！我们有{desk['cn']}。")),
        _dlg("B Let's talk",
             _line("Zhang Peng", f"Turn on the {light['en']}.", f"打开{light['cn']}。"),
             _line("Sarah", "OK.", "好的。"),
             _line("Zhang Peng", "Let's clean the classroom.", "我们打扫教室吧。"),
             _line("Sarah", "Good idea!", "好主意！")),
    ]


def _4a_u2(v, title, cn):
    bag = find_word(v, "schoolbag")
    maths = find_word(v, "maths", default_idx=1)
    return [
        _dlg("A Let's talk",
             _line("Amy", "I have a new schoolbag.", "我有一个新书包。"),
             _line("Sarah", "Really? What's in your schoolbag?", "真的吗？书包里有什么？"),
             _line("Amy", f"A {maths['en']}.", f"一本{maths['cn']}。"),
             _line("Sarah", "It's black and white.", "它是黑白色的。")),
        _dlg("B Let's talk",
             _line("Zhang Peng", f"Excuse me. I lost my {bag['en']}.", f"打扰一下。我丢了{bag['cn']}。"),
             _line("Teacher", "What colour is it?", "它是什么颜色的？"),
             _line("Zhang Peng", "It's blue and white.", "蓝白色的。"),
             _line("Teacher", "OK. Here it is!", "好的。找到了！")),
    ]


def _4a_u3(v, title, cn):
    strong = find_word(v, "strong", "friendly", "quiet")
    glasses = find_word(v, "glasses", "shoe", default_idx=1)
    return [
        _dlg("A Let's talk",
             _line("John", "I have a friend.", "我有一个朋友。"),
             _line("Zhang Peng", "A boy or girl?", "男孩还是女孩？"),
             _line("John", "A boy. He's tall and strong.", "男孩。他又高又壮。"),
             _line("Zhang Peng", f"Who is he?", "他是谁？")),
        _dlg("B Let's talk",
             _line("Amy", f"He has {glasses['en']}.", f"他戴着{glasses['cn']}。"),
             _line("Mike", f"Is he {strong['en']}?", f"他{strong['cn']}吗？"),
             _line("Amy", "Yes, he is.", "是的。"),
             _line("Mike", "Great!", "太棒了！")),
    ]


def _4a_u4(v, title, cn):
    bedroom = find_word(v, "bedroom", "living")
    kitchen = find_word(v, "kitchen", "bathroom", default_idx=1)
    return [
        _dlg("A Let's talk",
             _line("Sarah", "Where are the keys?", "钥匙在哪里？"),
             _line("John", "Are they on the table?", "在桌子上吗？"),
             _line("Sarah", "No, they aren't.", "不，不在。"),
             _line("John", "Look! They're in the door.", "看！在门里。")),
        _dlg("B Let's talk",
             _line("Amy", f"Is she in the {bedroom['en']}?", f"她在{bedroom['cn']}吗？"),
             _line("Chen Jie", "No, she isn't.", "不，不在。"),
             _line("Amy", f"Is she in the {kitchen['en']}?", f"她在{kitchen['cn']}吗？"),
             _line("Chen Jie", "Yes, she is.", "是的，在。")),
    ]


def _4a_u5(v, title, cn):
    beef = find_word(v, "beef", "chicken", "noodle")
    soup = find_word(v, "soup", "vegetable", default_idx=1)
    return [
        _dlg("A Let's talk",
             _line("Mother", "Dinner's ready! Help yourself.", "晚餐好了！请随便吃。"),
             _line("Amy", "Thanks.", "谢谢。"),
             _line("Mother", f"Would you like some {beef['en']}?", f"你想要些{beef['cn']}吗？"),
             _line("Amy", "Yes, please.", "好的，谢谢。")),
        _dlg("B Let's talk",
             _line("John", f"What would you like?", "你想吃什么？"),
             _line("Amy", f"I'd like some {soup['en']}, please.", f"我想要些{soup['cn']}。"),
             _line("John", "OK. Here you are.", "好的。给你。"),
             _line("Amy", "Thank you.", "谢谢你。")),
    ]


def _4a_u6(v, title, cn):
    father = find_word(v, "father", "dad", "parent")
    doctor = find_word(v, "doctor", "nurse", "driver", default_idx=1)
    return [
        _dlg("A Let's talk",
             _line("Amy", "How many people are there in your family?", "你家有几口人？"),
             _line("Chen Jie", "Three.", "三口。"),
             _line("Amy", f"Is this your {father['en']}?", f"这是你{father['cn']}吗？"),
             _line("Chen Jie", "Yes, it is.", "是的。")),
        _dlg("B Let's talk",
             _line("Sarah", f"What's your {father['en']}'s job?", f"你{father['cn']}做什么工作？"),
             _line("Amy", f"He's a {doctor['en']}.", f"他是{doctor['cn']}。"),
             _line("Sarah", "Cool!", "酷！"),
             _line("Amy", "Thank you.", "谢谢。")),
    ]


def _4b_u2(v, title, cn):
    breakfast = find_word(v, "breakfast")
    lunch = find_word(v, "lunch", default_idx=2)
    dinner = find_word(v, "dinner", default_idx=5)
    pe = find_word(v, "PE", default_idx=4)
    return [
        _dlg("A Let's talk",
             _line("Zhang Peng", "What time is it?", "几点了？"),
             _line("Amy", "It's 7 o'clock. It's time to get up.", "七点了。该起床了。"),
             _line("Zhang Peng", "It's time to go to school.", "该去上学了。"),
             _line("Mother", f"It's 7:30. Time for {breakfast['en']}.", f"七点半了。该吃{breakfast['cn']}了。")),
        _dlg("B Let's talk",
             _line("Amy", "School is over. Let's go home.", "放学了。我们回家吧。"),
             _line("Amy", "What time is it?", "几点了？"),
             _line("Zhang Peng", f"It's 5 o'clock. Time for {dinner['en']}.", f"五点了。该吃{dinner['cn']}了。"),
             _line("Mike", f"It's 6 o'clock. Time for {pe['en']}.", f"六点了。该上{pe['cn']}了。")),
    ]


def _4b_u3(v, title, cn):
    cold = find_word(v, "cold", "cool")
    warm = find_word(v, "warm", "hot", default_idx=1)
    return [
        _dlg("A Let's talk",
             _line("Chen Jie", "Hi, Mark! What time is it in New York?", "嗨，马克！纽约几点了？"),
             _line("Mark", "It's 8 o'clock.", "八点了。"),
             _line("Chen Jie", "It's rainy outside.", "外面在下雨。"),
             _line("Mark", f"Can I go outside?", "我能出去吗？")),
        _dlg("B Let's talk",
             _line("Amy", f"What's the weather like in Beijing?", "北京天气怎么样？"),
             _line("Sarah", f"It's {warm['en']} and {cold['en'] if cold['en'] != warm['en'] else 'sunny'}.", f"天气{warm['cn']}。"),
             _line("Amy", "Is it cold?", "冷吗？"),
             _line("Sarah", "No, it isn't. It's warm.", "不冷。很暖和。")),
    ]


def _4b_u4(v, title, cn):
    tomato = find_word(v, "tomato", "potato")
    carrot = find_word(v, "carrot", "bean", default_idx=1)
    return [
        _dlg("A Let's talk",
             _line("Amy", "Look at these!", "看这些！"),
             _line("Tom", f"They're {tomato['en']}s.", f"是{tomato['cn']}。"),
             _line("Amy", "What are these?", "这些是什么？"),
             _line("Tom", f"They're {carrot['en']}s.", f"是{carrot['cn']}。")),
        _dlg("B Let's talk",
             _line("Sarah", "What are those?", "那些是什么？"),
             _line("Mike", "They're horses.", "是马。"),
             _line("Sarah", "Are they hens?", "是母鸡吗？"),
             _line("Mike", "No, they aren't. They're ducks.", "不是。是鸭子。")),
    ]


def _4b_u5(v, title, cn):
    coat = find_word(v, "coat", "jacket")
    shirt = find_word(v, "shirt", "dress", default_idx=1)
    return [
        _dlg("A Let's talk",
             _line("Sarah", f"Are they yours, Mike?", "是你的吗，迈克？"),
             _line("Mike", f"No, they aren't. They're Chen Jie's.", "不是。是陈杰的。"),
             _line("Sarah", f"Is this yours?", "这是你的吗？"),
             _line("Mike", "Yes, it is.", "是的。")),
        _dlg("B Let's talk",
             _line("Amy", f"Whose {coat['en']} is this?", f"这是谁的{coat['cn']}？"),
             _line("Mike", "It's mine.", "是我的。"),
             _line("Amy", f"Whose {shirt['en']} is this?", f"这是谁的{shirt['cn']}？"),
             _line("Mike", "It's your brother's.", "是你哥哥的。")),
    ]


def _4b_u6(v, title, cn):
    return [
        _dlg("A Let's talk",
             _line("Saleswoman", "Can I help you?", "需要帮忙吗？"),
             _line("Sarah", "Yes. These shoes are nice.", "是的。这双鞋很漂亮。"),
             _line("Saleswoman", "What size?", "什么尺码？"),
             _line("Sarah", "Size 5, please.", "请给我5码。")),
        _dlg("B Let's talk",
             _line("Amy", "How much are these?", "这些多少钱？"),
             _line("Saleswoman", "They're three yuan.", "三元。"),
             _line("Amy", "How much is this?", "这个多少钱？"),
             _line("Saleswoman", "It's two yuan.", "两元。")),
    ]


def _generic_by_theme(v, title, cn, theme: str):
    """Fallback: topic-appropriate Q&A instead of 'Look! A …'."""
    w0, w1 = find_word(v, ".*"), find_word(v, ".*", default_idx=min(1, len(v) - 1))
    builders = {
        "school_place": lambda: [
            _dlg("Let's talk",
                 _line("A", f"Where's the {w0['en']}?", f"{w0['cn']}在哪里？"),
                 _line("B", f"It's on the {w1['en']}.", f"在{w1['cn']}。")),
        ],
        "time": lambda: [
            _dlg("Let's talk",
                 _line("A", "What time is it?", "几点了？"),
                 _line("B", "It's 7 o'clock.", "七点了。"),
                 _line("A", f"Time for {w0['en']}.", f"该{w0['cn']}了。"),
                 _line("B", "OK!", "好的！")),
        ],
        "weather": lambda: [
            _dlg("Let's talk",
                 _line("A", "What's the weather like?", "天气怎么样？"),
                 _line("B", f"It's {w0['en']}.", f"天气{w0['cn']}。")),
        ],
        "food": lambda: [
            _dlg("Let's talk",
                 _line("A", f"Do you like {w0['en']}?", f"你喜欢{w0['cn']}吗？"),
                 _line("B", "Yes, I do.", "是的，我喜欢。")),
        ],
        "animal": lambda: [
            _dlg("Let's talk",
                 _line("A", f"What's this?", "这是什么？"),
                 _line("B", f"It's {article(w0['en'])} {w0['en']}.", f"是{article(w0['en'])}{w0['cn']}。")),
        ],
        "clothes": lambda: [
            _dlg("Let's talk",
                 _line("A", f"Whose {w0['en']} is this?", f"这是谁的{w0['cn']}？"),
                 _line("B", "It's mine.", "是我的。")),
        ],
        "family": lambda: [
            _dlg("Let's talk",
                 _line("A", f"Who's that?", "那是谁？"),
                 _line("B", f"He's my {w0['en']}.", f"他是我{w0['cn']}。")),
        ],
        "transport": lambda: [
            _dlg("Let's talk",
                 _line("A", "How do you go to school?", "你怎么去学校？"),
                 _line("B", f"I go by {w0['en']}.", f"我乘{w0['cn']}去。")),
        ],
    }
    fn = builders.get(theme)
    if fn:
        return fn()
    return [
        _dlg("Let's talk",
             _line("A", f"What's this?", "这是什么？"),
             _line("B", f"It's {article(w0['en'])} {w0['en']}.", f"是{article(w0['en'])}{w0['cn']}。"),
             _line("A", f"Do you like {w1['en']}?", f"你喜欢{w1['cn']}吗？"),
             _line("B", "Yes, I do!", "是的，我喜欢！")),
    ]


DIALOGUE_BUILDERS: dict[str, DialogueBuilder] = {
    "3A:1": _3a_u1, "3A:2": _3a_u2, "3A:3": _3a_u3, "3A:4": _3a_u4, "3A:5": _3a_u5, "3A:6": _3a_u6,
    "3B:1": _3b_u1, "3B:2": _3b_u2, "3B:3": _3b_u3, "3B:4": _3b_u4, "3B:5": _3b_u5, "3B:6": _3b_u6,
    "4A:1": _4a_u1, "4A:2": _4a_u2, "4A:3": _4a_u3, "4A:4": _4a_u4, "4A:5": _4a_u5, "4A:6": _4a_u6,
    "4B:2": _4b_u2, "4B:3": _4b_u3, "4B:4": _4b_u4, "4B:5": _4b_u5, "4B:6": _4b_u6,
}


def make_unit_dialogues(book: str, unit_num: int, vocab: list[dict], title: str, cn: str) -> list[dict]:
    textbook = get_unit_dialogues(book, f"Unit {unit_num}")
    if textbook:
        return textbook
    key = f"{book}:{unit_num}"
    builder = DIALOGUE_BUILDERS.get(key)
    if builder:
        return builder(vocab, title, cn)
    theme = theme_for_book_unit(book, unit_num)
    return _generic_by_theme(vocab, title, cn, theme)


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


def make_unit_quiz_extras(book: str, unit_num: int, vocab: list[dict], unit_cn: str) -> list[dict]:
    """Theme-aware sentence/pattern quiz items."""
    extras: list[dict] = []
    theme = theme_for_book_unit(book, unit_num)
    all_cn = [v["cn"] for v in vocab]
    all_en = [v["en"] for v in vocab]
    if not vocab:
        return extras

    if theme == "school_place":
        extras.append(_mcq("Where's the library? 在问什么？", "图书馆在哪", ["图书馆有什么", "图书馆在哪", "图书馆大吗", "是图书馆吗"], point="句型", dim="sentence"))
    elif theme == "time":
        extras.append(_mcq("What time is it? 的意思是？", "几点了", ["几点了", "什么时候", "几点钟了", "什么时间"], point="句型", dim="sentence"))
    elif theme == "weather":
        extras.append(_mcq("What's the weather like? 问的是？", "天气怎么样", ["天气怎么样", "天气热吗", "几点了", "在哪里"], point="句型", dim="sentence"))
    elif theme == "food" or theme == "fruit":
        w = vocab[0]
        extras.append(_mcq(f"Do you like {w['en']}? 喜欢怎么回答？", "Yes, I do.", ["Yes, I do.", "No, it isn't.", "Yes, it is.", "No, I am."], point="句型", dim="sentence"))
    elif theme == "clothes":
        extras.append(_mcq("Whose coat is this? 在问什么？", "这是谁的外套", ["多少钱", "这是谁的外套", "什么颜色", "在哪里"], point="句型", dim="sentence"))

    if len(vocab) >= 3:
        v = vocab[2]
        pool = themed_distractors(theme, v["cn"], all_cn)
        extras.append(_mcq(f"「{v['en']}」的意思是？", v["cn"], pool + all_cn))

    return extras[:4]
