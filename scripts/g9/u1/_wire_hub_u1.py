# -*- coding: utf-8 -*-
"""重写 grade9.json 的 g9full_u1:book='g9'、grammarCodes、9关(含cloze)、真实词汇/写作/内联兜底。
其余 13 个占位单元不动。词汇/写作取已灌的 json 保持一致。"""
import json, os
HUB = r"C:\Projects\learn-fluent-easy\src\data\juniorHub\grade9.json"
DIR = r"C:\Projects\learn-fluent-easy\scripts\g9\u1"
def load(n):
    with open(os.path.join(DIR, n), encoding="utf-8") as f: return json.load(f)
vocab = load("g9-u1-vocab.json")
writing = load("g9-u1-writing.json")

WORDS = [{"en": w["word"], "cn": w["meaning_cn"].split("；")[0].split("（")[0], "emoji": "📘"} for w in vocab["words"]]

# 词汇兜底测验(10题,英→中,3个同单元干扰项)
quiz = []
for i in range(10):
    tgt = WORDS[i]
    distract = [WORDS[(i + k) % len(WORDS)]["cn"] for k in (3, 7, 11)]
    opts = [tgt["cn"]] + distract
    # 简单错位让答案不总在A:按 i 轮转
    rot = i % 4
    opts = opts[-rot:] + opts[:-rot] if rot else opts
    quiz.append({"q": f'「{tgt["en"]}」的意思是？', "opts": opts, "answer": opts.index(tgt["cn"]),
                 "point": "词汇", "dim": "vocab"})

# 内联听力兜底(6题,听句选相符;finalQuiz 听力来源)
LISTEN = [
    "I study English by reading stories every night.",
    "How do you improve your listening?",
    "You can learn new words by making word cards.",
    "I improved my listening by watching English videos.",
    "Be patient, and you will get better step by step.",
    "Everyone can become a good learner by working hard.",
]
DISTRACT = ["This is a new schoolbag.", "The weather is fine today.", "She bought a scarf for her mom.", "We went to the museum yesterday."]
listening_questions = []
for i, s in enumerate(LISTEN):
    opts = [s] + DISTRACT[:3]
    rot = i % 4
    opts = opts[-rot:] + opts[:-rot] if rot else opts
    listening_questions.append({"audio": s, "opts": opts, "answer": opts.index(s)})

STAGES = [
    {"id": "s1", "title": "核心词汇", "subtitle": "29个教材词汇", "icon": "📚", "type": "vocab", "time": "8分钟"},
    {"id": "s2", "title": "听音辨词", "subtitle": "听力辨词", "icon": "🎧", "type": "listenWord", "time": "6分钟"},
    {"id": "s3", "title": "词义配对", "subtitle": "巩固记忆", "icon": "🎮", "type": "match", "time": "5分钟"},
    {"id": "s4", "title": "语法专项", "subtitle": "by+动名词 / How疑问 / 情态助动词", "icon": "🧩", "type": "grammar", "time": "12分钟"},
    {"id": "s5", "title": "课文阅读", "subtitle": "阅读理解(6篇)", "icon": "📖", "type": "reading", "time": "8分钟"},
    {"id": "s6", "title": "完形填空", "subtitle": "10空", "icon": "📝", "type": "cloze", "time": "8分钟"},
    {"id": "s7", "title": "听力短文", "subtitle": "听音答题", "icon": "👂", "type": "listening", "time": "8分钟"},
    {"id": "s8", "title": "写作练习", "subtitle": "How I Study English", "icon": "✍️", "type": "writing", "time": "10分钟"},
    {"id": "s9", "title": "单元通关", "subtitle": "综合检测", "icon": "🏆", "type": "finalQuiz", "time": "12分钟"},
]

new_u1 = {
    "id": "g9full_u1", "num": 1, "unitKey": "U1", "book": "g9",
    "title": "How can we become good learners?", "cn": "怎样成为优秀的学习者",
    "emoji": "📚", "available": True,
    "vocabulary": WORDS,
    "dialogues": [{"title": "Section A", "lines": [
        {"role": "A", "text": "How do you study for an English test?", "cn": "你怎样备考英语?"},
        {"role": "B", "text": "I study by working with a group and reading aloud.", "cn": "我通过小组学习和朗读来学。"},
        {"role": "A", "text": "Good idea! Practice makes perfect.", "cn": "好主意!熟能生巧。"},
    ]}],
    "stages": STAGES,
    "grammarTitle": "by+动名词 / How疑问句 / 情态助动词",
    "grammarCode": None,
    "grammarCodes": ["g9u1.01", "g9u1.02", "g9u1.03"],
    "grammarQuiz": [
        {"q": "I improve my English ____ English songs.", "opts": ["by singing", "by sing", "to sing", "sing"], "answer": 0, "point": "by+动名词", "dim": "grammar"},
        {"q": "____ do you study for a test? — By making notes.", "opts": ["What", "How", "Where", "Why"], "answer": 1, "point": "How疑问句", "dim": "grammar"},
    ],
    "reading": {
        "passage": "(本单元课文阅读共 6 篇,见题库:Becoming a Good Learner 等。)",
        "passageCn": "本单元阅读(How can we become good learners?)——原创 6 篇,体裁有梯度。",
        "questions": [{"q": "What is Unit 1 mainly about?", "opts": ["Festivals", "How to become a good learner", "Inventions", "Shopping"], "answer": 1, "point": "阅读主旨", "dim": "reading"}],
    },
    "writing": {
        "prompt": "Write a short passage (about 80 words) on \"How I Study English\". Use “... by doing ...” and give at least three study methods.",
        "promptCn": "以 “How I Study English” 为题写约 80 词短文:写出至少 3 种学习方法,必须用 “... by doing ...” 句型,结尾给一句鼓励。",
        "sampleWords": [w["en"] for w in WORDS[:8]],
    },
    "quizQuestions": quiz,
    "listeningQuestions": listening_questions,
}

with open(HUB, encoding="utf-8") as f:
    data = json.load(f)
units = data["grade9"]["semesters"]["grade9_full"]["units"]
assert units[0]["id"] == "g9full_u1", f"units[0] 不是 u1: {units[0]['id']}"
units[0] = new_u1
with open(HUB, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("OK 重写 g9full_u1 | 词", len(WORDS), "| 关", len(STAGES), "| quiz", len(quiz), "| listening", len(listening_questions))
print("grammarCodes:", new_u1["grammarCodes"], "| book:", new_u1["book"])
print("stage 顺序:", [s["type"] for s in STAGES])
