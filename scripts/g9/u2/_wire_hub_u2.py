# -*- coding: utf-8 -*-
"""重写 grade9.json 的 g9full_u2:book='g9'、unit='U2'、grammarCodes g9u2.*、9关(含cloze)、
   真实词汇/写作/内联兜底。其余单元不动。"""
import json, os
HUB = r"C:\Projects\learn-fluent-easy\src\data\juniorHub\grade9.json"
DIR = r"C:\Projects\learn-fluent-easy\scripts\g9\u2"
vocab = json.load(open(os.path.join(DIR, "g9-u2-vocab.json"), encoding="utf-8"))
writing = json.load(open(os.path.join(DIR, "g9-u2-writing.json"), encoding="utf-8"))
WORDS = [{"en": w["word"], "cn": w["meaning_cn"].split(";")[0].split("(")[0], "emoji": "📘"} for w in vocab["words"]]

quiz = []
for i in range(10):
    t = WORDS[i]; dis = [WORDS[(i + k) % len(WORDS)]["cn"] for k in (3, 7, 11)]
    opts = [t["cn"]] + dis; rot = i % 4; opts = opts[-rot:] + opts[:-rot] if rot else opts
    quiz.append({"q": f'「{t["en"]}」的意思是?', "opts": opts, "answer": opts.index(t["cn"]), "point": "词汇", "dim": "vocab"})

LISTEN = [
 "I think that mooncakes are delicious.",
 "What a wonderful festival it is!",
 "We watch the dragon boat races by the river.",
 "Families get together and look at the full moon.",
 "How exciting the lantern show is!",
 "People give red packets at Spring Festival.",
]
DIS = ["The shop is closed today.","She is reading a novel.","He plays football after school.","The train has left."]
lq = []
for i, s in enumerate(LISTEN):
    opts = [s] + DIS[:3]; rot = i % 4; opts = opts[-rot:] + opts[:-rot] if rot else opts
    lq.append({"audio": s, "opts": opts, "answer": opts.index(s)})

STAGES = [
 {"id":"s1","title":"核心词汇","subtitle":"29个教材词汇","icon":"📚","type":"vocab","time":"8分钟"},
 {"id":"s2","title":"听音辨词","subtitle":"听力辨词","icon":"🎧","type":"listenWord","time":"6分钟"},
 {"id":"s3","title":"词义配对","subtitle":"巩固记忆","icon":"🎮","type":"match","time":"5分钟"},
 {"id":"s4","title":"语法专项","subtitle":"宾语从句 that/if/whether · 感叹句","icon":"🧩","type":"grammar","time":"12分钟"},
 {"id":"s5","title":"课文阅读","subtitle":"阅读理解(6篇)","icon":"📖","type":"reading","time":"8分钟"},
 {"id":"s6","title":"完形填空","subtitle":"10空","icon":"📝","type":"cloze","time":"8分钟"},
 {"id":"s7","title":"听力短文","subtitle":"听音答题","icon":"👂","type":"listening","time":"8分钟"},
 {"id":"s8","title":"写作练习","subtitle":"My Favourite Festival","icon":"✍️","type":"writing","time":"10分钟"},
 {"id":"s9","title":"单元通关","subtitle":"综合检测","icon":"🏆","type":"finalQuiz","time":"12分钟"},
]
new_u2 = {
 "id":"g9full_u2","num":2,"unitKey":"U2","book":"g9",
 "title":"I think that mooncakes are delicious!","cn":"我觉得月饼很好吃","emoji":"🥮","available":True,
 "vocabulary":WORDS,
 "dialogues":[{"title":"Section A","lines":[
   {"role":"A","text":"What do you think of mooncakes?","cn":"你觉得月饼怎么样?"},
   {"role":"B","text":"I think that they are delicious! I love the Mid-Autumn Festival.","cn":"我觉得很好吃!我爱中秋节。"},
   {"role":"A","text":"What a wonderful festival it is!","cn":"多么美好的节日啊!"}]}],
 "stages":STAGES,
 "grammarTitle":"宾语从句 that / if·whether · 感叹句",
 "grammarCode":None,
 "grammarCodes":["g9u2.01","g9u2.02","g9u2.03"],
 "grammarQuiz":[
   {"q":"I think ____ mooncakes are delicious.","opts":["that","what","which","who"],"answer":0,"point":"宾语从句that","dim":"grammar"},
   {"q":"____ a wonderful festival it is!","opts":["How","What","What an","How a"],"answer":1,"point":"感叹句","dim":"grammar"}],
 "reading":{"passage":"(本单元课文阅读共6篇,见题库:The Mid-Autumn Festival 等。)","passageCn":"本单元阅读(节日)——原创6篇,体裁有梯度。",
   "questions":[{"q":"What is Unit 2 mainly about?","opts":["Learning methods","Festivals","Inventions","Sports"],"answer":1,"point":"阅读主旨","dim":"reading"}]},
 "writing":{"prompt":"Write a short passage (about 80 words) on \"My Favourite Festival\". Use object clauses (I think that…) and exclamations (What…!/How…!).",
   "promptCn":"以 \"My Favourite Festival\" 为题写约80词:节日名+时间、做什么吃什么、为什么喜欢;用宾语从句 I think/believe that… + 感叹句 What…!/How…!。",
   "sampleWords":[w["en"] for w in WORDS[:8]]},
 "quizQuestions":quiz,
 "listeningQuestions":lq,
}
data = json.load(open(HUB, encoding="utf-8"))
units = data["grade9"]["semesters"]["grade9_full"]["units"]
assert units[1]["id"] == "g9full_u2", f"units[1] 不是 u2: {units[1]['id']}"
units[1] = new_u2
json.dump(data, open(HUB, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print("OK 重写 g9full_u2 | book:", new_u2["book"], "| grammarCodes:", new_u2["grammarCodes"], "| 词", len(WORDS), "| 关", len(STAGES))
print("stage 顺序:", [s["type"] for s in STAGES])
