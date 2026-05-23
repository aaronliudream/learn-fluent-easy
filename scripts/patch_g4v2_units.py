# -*- coding: utf-8 -*-
import copy
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src/data/primaryHub/courseData.json"

UNIT_META = {
    "g4v2_u2": {
        "cn": "几点了",
        "emoji": "🕐",
        "vocabulary": [
            ("time", "时间", "⏰"),
            ("o'clock", "……点钟", "🕐"),
            ("get up", "起床", "🛏️"),
            ("go to school", "去上学", "🏫"),
            ("go home", "回家", "🏠"),
            ("go to bed", "上床睡觉", "😴"),
            ("hurry up", "快点", "🏃"),
            ("ready", "准备好的", "✅"),
            ("come on", "快点；加油", "👋"),
            ("breakfast", "早餐", "🥣"),
            ("lunch", "午餐", "🍱"),
            ("dinner", "晚餐", "🍽️"),
            ("English class", "英语课", "📘"),
            ("music class", "音乐课", "🎵"),
            ("PE class", "体育课", "⚽"),
        ],
    },
    "g4v2_u3": {
        "cn": "天气",
        "emoji": "🌤️",
        "vocabulary": [
            ("cold", "冷的", "🥶"),
            ("cool", "凉的", "😎"),
            ("warm", "温暖的", "🌡️"),
            ("hot", "热的", "🔥"),
            ("sunny", "阳光充足的", "☀️"),
            ("windy", "多风的", "💨"),
            ("cloudy", "多云的", "☁️"),
            ("snowy", "下雪的", "❄️"),
            ("rainy", "阴雨的", "🌧️"),
            ("outside", "在户外", "🌳"),
            ("be careful", "小心", "⚠️"),
            ("weather", "天气", "🌈"),
            ("New York", "纽约", "🗽"),
            ("London", "伦敦", "🇬🇧"),
            ("Sydney", "悉尼", "🇦🇺"),
        ],
    },
    "g4v2_u4": {
        "cn": "在农场",
        "emoji": "🐄",
        "vocabulary": [
            ("horse", "马", "🐴"),
            ("cow", "母牛；奶牛", "🐄"),
            ("sheep", "羊；绵羊", "🐑"),
            ("hen", "母鸡", "🐔"),
            ("goat", "山羊", "🐐"),
            ("tomato", "西红柿", "🍅"),
            ("potato", "马铃薯；土豆", "🥔"),
            ("green beans", "豆角；四季豆", "🫛"),
            ("carrot", "胡萝卜", "🥕"),
            ("these", "这些", "👆"),
            ("those", "那些", "👉"),
            ("farm", "农场", "🌾"),
            ("garden", "花园；菜园", "🌻"),
            ("animal", "兽；动物", "🐾"),
            ("eat", "吃", "😋"),
        ],
    },
    "g4v2_u5": {
        "cn": "我的衣服",
        "emoji": "👕",
        "vocabulary": [
            ("clothes", "衣服；服装", "👔"),
            ("pants", "裤子", "👖"),
            ("hat", "帽子", "🎩"),
            ("dress", "连衣裙", "👗"),
            ("skirt", "女裙", "👗"),
            ("coat", "外衣；大衣", "🧥"),
            ("sweater", "毛衣", "🧶"),
            ("sock", "短袜", "🧦"),
            ("shorts", "短裤", "🩳"),
            ("jacket", "夹克衫", "🧥"),
            ("shirt", "衬衫", "👔"),
            ("whose", "谁的", "❓"),
            ("mine", "我的", "📦"),
            ("pack", "收拾（行李）", "🎒"),
            ("wait", "等待", "⏳"),
        ],
    },
    "g4v2_u6": {
        "cn": "购物",
        "emoji": "🛍️",
        "vocabulary": [
            ("glove", "手套", "🧤"),
            ("scarf", "围巾；披巾", "🧣"),
            ("umbrella", "伞；雨伞", "☂️"),
            ("sunglasses", "太阳镜", "🕶️"),
            ("pretty", "美观的；精致的", "✨"),
            ("expensive", "昂贵的；花钱多的", "💎"),
            ("cheap", "花钱少的；便宜的", "🏷️"),
            ("nice", "好的", "👍"),
            ("try on", "试穿", "👗"),
            ("size", "尺码；号", "📏"),
            ("of course", "当然", "✅"),
            ("too", "太；过于", "⚠️"),
            ("just", "正好；恰好", "👌"),
            ("dollar", "元（美国货币）", "💵"),
            ("sale", "特价销售；大减价", "🛒"),
        ],
    },
}


def find_unit(data, unit_id):
    for u in data["grade4"]["semesters"]["grade4_volume2"]["units"]:
        if u["id"] == unit_id:
            return u
    raise KeyError(unit_id)


def make_vocab(items):
    return [{"en": en, "cn": cn, "emoji": em} for en, cn, em in items]


def make_stages(n_vocab):
    return copy.deepcopy(
        [
            {
                "id": "s1",
                "title": "单词学习",
                "subtitle": f"{n_vocab}个核心词",
                "icon": "📖",
                "type": "vocab",
                "time": "5分",
            },
            {
                "id": "s2",
                "title": "听音辨词",
                "subtitle": "听音选词",
                "icon": "👂",
                "type": "listenWord",
                "time": "5分",
            },
            {
                "id": "s3",
                "title": "中英配对",
                "subtitle": "连线配对",
                "icon": "🔗",
                "type": "match",
                "time": "5分",
            },
            {
                "id": "s4",
                "title": "绘本阅读",
                "subtitle": "情景故事",
                "icon": "📚",
                "type": "storybook",
                "time": "8分",
            },
            {
                "id": "s5",
                "title": "句型练习",
                "subtitle": "重点句型",
                "icon": "✏️",
                "type": "sentence",
                "time": "5分",
            },
            {
                "id": "s6",
                "title": "默写练习",
                "subtitle": "看中文写英文",
                "icon": "📝",
                "type": "write",
                "time": "8分",
            },
            {
                "id": "s7",
                "title": "听句理解",
                "subtitle": "听句子选答案",
                "icon": "🎧",
                "type": "listenSent",
                "time": "6分",
            },
            {
                "id": "s8",
                "title": "单元测验",
                "subtitle": "综合检测",
                "icon": "🏆",
                "type": "finalQuiz",
                "time": "10分",
            },
        ]
    )


def make_storybook(unit_title, vocab):
    pages = []
    for i, v in enumerate(vocab[:4]):
        pages.append(
            {
                "emoji": v["emoji"],
                "en": f"This is about {v['en']}.",
                "cn": f"本课学习：{v['cn']}（{v['en']}）",
                "hint": unit_title,
            }
        )
    q1 = vocab[0]
    wrong = [v["en"] for v in vocab[1:4]]
    while len(wrong) < 3:
        wrong.append("school")
    return {
        "title": f"{unit_title} Story",
        "pages": pages,
        "questions": [
            {
                "q": f"Which word is in this unit?",
                "opts": [q1["en"], wrong[0], wrong[1], wrong[2]],
                "answer": 0,
            },
            {
                "q": f"What does '{q1['en']}' mean?",
                "opts": [q1["cn"], wrong[0], "再见", "谢谢"],
                "answer": 0,
            },
        ],
    }


def make_dialogues(vocab):
    a, b = vocab[0], vocab[1] if len(vocab) > 1 else vocab[0]
    return [
        {
            "title": "Dialogue 1",
            "lines": [
                {"speaker": "A", "en": f"Look! {a['en']}.", "cn": f"看！{a['cn']}。"},
                {"speaker": "B", "en": f"Yes. And {b['en']}.", "cn": f"是的。还有{b['cn']}。"},
            ],
        }
    ]


def make_quiz(vocab):
    qs = []
    for i, v in enumerate(vocab):
        others = [x for x in vocab if x["en"] != v["en"]]
        opts = [v["cn"]] + [others[j % len(others)]["cn"] for j in range(3)]
        qs.append({"q": f"What is '{v['en']}' in Chinese?", "opts": opts, "answer": 0})
    return qs[:15]


def make_listening(vocab):
    ls = []
    for v in vocab[:6]:
        others = [x["en"] for x in vocab if x["en"] != v["en"]]
        opts = [v["en"], others[0], others[1] if len(others) > 1 else "book", others[2] if len(others) > 2 else "desk"]
        ls.append({"audio": v["en"], "opts": opts, "answer": 0})
    return ls


def main():
    data = json.loads(DATA.read_text(encoding="utf-8"))
    template = find_unit(data, "g4v2_u1")
    for unit_id, meta in UNIT_META.items():
        u = find_unit(data, unit_id)
        vocab = make_vocab(meta["vocabulary"])
        u["cn"] = meta["cn"]
        u["emoji"] = meta["emoji"]
        u["available"] = True
        u["vocabulary"] = vocab
        u["stages"] = make_stages(len(vocab))
        u["storybook"] = make_storybook(u["title"], vocab)
        u["dialogues"] = make_dialogues(vocab)
        u["quizQuestions"] = make_quiz(vocab)
        u["listeningQuestions"] = make_listening(vocab)
        if "sentences" in template:
            u["sentences"] = copy.deepcopy(template.get("sentences", []))

    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("patched", ", ".join(UNIT_META))


if __name__ == "__main__":
    main()
