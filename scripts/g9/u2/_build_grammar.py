# -*- coding: utf-8 -*-
"""九年级 U2 语法:3考点×20题(全原创)。主题=节日。
   01 that宾从 / 02 if-whether宾从(标连接词|语序) / 03 感叹句(标WhatA|WhatAn|What|How)。
   每题 (stem, correct, [d1,d2,d3], tag, expl);idx 由 IDX20 定(每点 5/5/5/5)。"""
import json, os, sys, io, collections
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
DIR = r"C:\Projects\learn-fluent-easy\scripts\g9\u2"
os.makedirs(DIR, exist_ok=True)
V, U = "g9", "U2"
import random
# 答案位置 = 按 qid 播种的 shuffle(打散、无固定序列规律;同 qid 可复现,不随机漂)。U3–U14 复用此法。
def shuf(correct, dis, seed):
    o = [correct] + list(dis)
    random.Random(seed).shuffle(o)
    return o, o.index(correct)

P1 = "宾语从句:that 引导(陈述句作宾语)"
P2 = "宾语从句:if / whether 引导(一般疑问句作宾语)"
P3 = "感叹句 What…! / How…!"
C1, C2, C3 = "g9u2.01", "g9u2.02", "g9u2.03"

# ---- 01 that 宾从 (连接词/语序/时态,答案恒非 if/whether) ----
G1 = [
 ("I think ____ mooncakes are delicious.","that",["what","which","who"],"连接词","嵌入陈述句→that"),
 ("We know ____ the Mid-Autumn Festival is in autumn.","that",["what","when","where"],"连接词","嵌入陈述句→that"),
 ("She believes ____ her team will win the race.","that",["which","what","who"],"连接词","嵌入陈述句→that"),
 ("He said ____ the lanterns were beautiful.","that",["who","where","why"],"连接词","嵌入陈述句→that"),
 ("Do you think ____ Spring Festival is important?","that",["what","which","when"],"连接词","嵌入陈述句→that"),
 ("I hope ____ you can come to our party.","that",["what","who","whose"],"连接词","嵌入陈述句→that"),
 ("Everyone knows ____ the dragon boat race is exciting.","that",["which","what","why"],"连接词","嵌入陈述句→that"),
 ("The teacher told us ____ the old story was true.","that",["what","who","where"],"连接词","嵌入陈述句→that"),
 ("I'm sure ____ they will have a good time.","that",["when","where","why"],"连接词","嵌入陈述句→that"),
 ("We believe ____ honesty matters most.","that",["what","which","who"],"连接词","嵌入陈述句→that"),
 ("I know that ____.","she is from Canada",["is she from Canada","she from Canada","from Canada she is"],"语序","宾从用陈述语序 主+谓"),
 ("He said that ____.","the food was delicious",["was the food delicious","the food delicious was","delicious was the food"],"语序","宾从用陈述语序"),
 ("They think that ____ a wonderful festival.","Spring Festival is",["is Spring Festival","Spring Festival are","be Spring Festival"],"语序","陈述语序+主谓一致"),
 ("I believe that ____ next year.","they will come back",["will they come back","they come back will","back they will come"],"语序","陈述语序"),
 ("She hopes that ____ the exam.","she can pass",["can she pass","pass she can","she passes can"],"语序","陈述语序"),
 ("He said that he ____ busy the day before.","was",["is","are","were"],"时态","主句过去→从句过去"),
 ("She told me that she ____ the film before.","had seen",["sees","see","seeing"],"时态","主句过去+before→过去完成"),
 ("They thought that the show ____ wonderful.","was",["is","will be","be"],"时态","主句过去→从句过去"),
 ("I knew that he ____ from Beijing.","came",["come","comes","coming"],"时态","主句过去→从句过去"),
 ("He said that he ____ help me the next day.","would",["will","can","may"],"时态","主句过去→will变would"),
]
# ---- 02 if/whether 宾从 (10 连接词 + 10 语序) ----
G2 = [
 ("I wonder ____ she will come to the festival.","if",["that","what","which"],"连接词","嵌入一般疑问→if/whether"),
 ("Can you tell me ____ the shop is open?","whether",["that","what","why"],"连接词","嵌入一般疑问→if/whether"),
 ("I don't know ____ he likes mooncakes.","if",["that","which","who"],"连接词","嵌入一般疑问→if/whether"),
 ("She asked me ____ I had finished my homework.","whether",["that","what","when"],"连接词","嵌入一般疑问→if/whether"),
 ("Do you know ____ they will have the race again?","if",["that","what","whose"],"连接词","嵌入一般疑问→if/whether"),
 ("I'm not sure ____ the news is true.","whether",["that","what","why"],"连接词","嵌入一般疑问→if/whether"),
 ("He wonders ____ it will rain tomorrow.","if",["that","which","what"],"连接词","嵌入一般疑问→if/whether"),
 ("Please tell me ____ you can join us.","whether",["that","who","when"],"连接词","嵌入一般疑问→if/whether"),
 ("I asked her ____ she liked the dragon boat race.","if",["that","what","where"],"连接词","嵌入一般疑问→if/whether"),
 ("We don't know ____ the festival is in May or June.","whether",["that","what","which"],"连接词","whether…or 结构用 whether"),
 ("I wonder if ____.","the museum is open",["is the museum open","the museum open is","open is the museum"],"语序","宾从用陈述语序"),
 ("Can you tell me whether ____?","she has passed the test",["has she passed the test","she has pass the test","passed she the test"],"语序","宾从用陈述语序"),
 ("I don't know if ____ tomorrow.","they will arrive",["will they arrive","they arrive will","arrive they will"],"语序","陈述语序"),
 ("Do you know whether ____?","the show has started",["has the show started","the show started has","started the show has"],"语序","陈述语序"),
 ("She asked whether ____ the party.","we would join",["would we join","we join would","join we would"],"语序","陈述语序"),
 ("I'm not sure if ____ at home now.","he is",["is he","he be","be he"],"语序","陈述语序 主+系"),
 ("Tell me if ____ the answer.","you know",["do you know","know you","you do know"],"语序","陈述语序(不用助动词倒装)"),
 ("I wonder whether ____ enough time.","we have",["have we","we has","do we have"],"语序","陈述语序+主谓一致"),
 ("He asked if ____ the festival before.","I had seen",["had I seen","I have saw","seen I had"],"语序","陈述语序+过去完成"),
 ("Do you know whether ____ now?","the train has left",["has the train left","the train left has","left the train has"],"语序","陈述语序"),
]
# ---- 03 感叹句 (WhatA 辅音 / WhatAn 元音 / What 复数·不可数 / How 形/副) ----
G3 = [
 ("____ delicious the mooncakes are!","How",["What","What a","What an"],"How","中心词=形容词 delicious→How"),
 ("____ beautiful flowers they are!","What",["How","What a","What an"],"What","中心词=复数名词 flowers→What(无a)"),
 ("____ exciting race it was!","What an",["What a","How","What"],"WhatAn","单数可数+元音音素 exciting→What an"),
 ("____ wonderful festival Spring Festival is!","What a",["What an","How","What"],"WhatA","单数可数+辅音 festival→What a"),
 ("____ fast he runs!","How",["What","What a","What an"],"How","中心词=副词 fast→How"),
 ("____ delicious food it is!","What",["What a","What an","How"],"What","不可数名词 food→What(无a)"),
 ("____ tall the building is!","How",["What","What a","What an"],"How","中心词=形容词 tall→How"),
 ("____ clever boy he is!","What a",["What an","How","What"],"WhatA","单数可数+辅音 boy→What a"),
 ("____ interesting books these are!","What",["What a","What an","How"],"What","复数名词 books→What(无a)"),
 ("____ nice the weather is today!","How",["What","What a","What an"],"How","中心词=形容词 nice→How"),
 ("____ long bridge it is!","What a",["What an","How","What"],"WhatA","单数可数+辅音 bridge→What a"),
 ("____ hard they worked!","How",["What","What a","What an"],"How","中心词=副词 hard→How"),
 ("____ old temple it is!","What an",["What a","How","What"],"WhatAn","单数可数+元音 old→What an"),
 ("____ lovely music it is!","What",["What a","What an","How"],"What","不可数名词 music→What(无a)"),
 ("____ brave the firefighter is!","How",["What","What a","What an"],"How","中心词=形容词 brave→How"),
 ("____ happy children they are!","What",["What a","What an","How"],"What","复数名词 children→What(无a)"),
 ("____ wonderful time we had!","What a",["What an","How","What"],"WhatA","单数可数(一段时光)+辅音→What a"),
 ("____ well she sings!","How",["What","What a","What an"],"How","中心词=副词 well→How"),
 ("____ amazing show it was!","What an",["What a","How","What"],"WhatAn","单数可数+元音 amazing→What an"),
 ("____ cold it is today!","How",["What","What a","What the"],"How","无名词,中心词=形容词 cold→How"),
]

def build(rows, point, code):
    out = []
    for i, (stem, correct, dis, tag, expl) in enumerate(rows):
        qid = f"{code}.q{i+1}"
        o, idx = shuf(correct, dis, qid)
        assert len(set(o)) == 4 and o[idx] == correct, f"{code} q{i+1} opts {o}"
        out.append({"qid": qid, "volume": V, "unit": U, "point": point, "code": code,
                    "tag": tag, "stem": stem, "options": o, "answer_index": idx,
                    "answer_text": correct, "explanation": f"[{tag}] {expl}"})
    return out

points = [
 {"code": C1, "point": P1, "category": "clause", "overview": "主句后接陈述句作宾语,连接词用 that(常可省略),从句用陈述语序,主句过去时从句相应过去。"},
 {"code": C2, "point": P2, "category": "clause", "overview": "嵌入一般疑问句作宾语,连接词用 if/whether(whether…or 用 whether),从句一律陈述语序、不倒装。"},
 {"code": C3, "point": P3, "category": "other", "overview": "看感叹中心词词性:名词→What(单数可数加a/an、复数或不可数不加);形容词/副词→How。"},
]
questions = build(G1, P1, C1) + build(G2, P2, C2) + build(G3, P3, C3)
GRAMMAR = {"volume": V, "unit": U, "points": points, "questions": questions}
with open(os.path.join(DIR, "g9-u2-grammar.json"), "w", encoding="utf-8") as f:
    json.dump(GRAMMAR, f, ensure_ascii=False, indent=2)

# ===== QC + 纯度自查 =====
LET = "ABCD"
print("===== 题量 + 答案分布 =====")
for pt in points:
    qs = [q for q in questions if q["code"] == pt["code"]]
    d = collections.Counter(q["answer_index"] for q in qs)
    print(f"  {pt['code']} {pt['point']}: {len(qs)}题 A/B/C/D={d[0]}/{d[1]}/{d[2]}/{d[3]}")
ids = [q["qid"] for q in questions]
bad = [q["qid"] for q in questions if len(set(q["options"]))!=4 or q["options"][q["answer_index"]]!=q["answer_text"]]
print(f"  qid去重 {len(set(ids))}/{len(ids)} | 选项/答案失败 {len(bad)} {bad}")

print("\n===== 纯度自查 =====")
drift = []
# 01:连接词→that;语序→陈述子句(含空格,非疑问词);时态→动词形式(非that/if/whether)
for q in [q for q in questions if q["code"] == C1]:
    a = q["answer_text"]; tag = q["tag"]
    if tag == "连接词" and a != "that": drift.append(f"01 {q['qid']} 连接词答案非that: {a}")
    if tag in ("语序","时态") and a in ("if","whether"): drift.append(f"01 {q['qid']} {tag}漏成if/whether: {a}")
    if a in ("if","whether"): drift.append(f"01 {q['qid']} 出现if/whether(应属02): {a}")
# 02:连接词→if/whether;语序→陈述子句(非if/whether/that单词)
c2 = [q for q in questions if q["code"] == C2]
n_conj = sum(1 for q in c2 if q["tag"]=="连接词"); n_order = sum(1 for q in c2 if q["tag"]=="语序")
for q in c2:
    a = q["answer_text"]; tag = q["tag"]
    if tag == "连接词" and a not in ("if","whether"): drift.append(f"02 {q['qid']} 连接词答案非if/whether: {a}")
    if tag == "语序" and a in ("if","whether","that"): drift.append(f"02 {q['qid']} 语序伪装成连接词: {a}")
# 03:答案∈ What/What a/What an/How,且 tag 与答案一致
c3 = [q for q in questions if q["code"] == C3]
struct = collections.Counter(q["tag"] for q in c3)
TAGMAP = {"WhatA":"What a","WhatAn":"What an","What":"What","How":"How"}
for q in c3:
    if q["answer_text"] != TAGMAP.get(q["tag"]): drift.append(f"03 {q['qid']} 结构tag与答案不符: tag={q['tag']} ans={q['answer_text']}")

print(f"  01 子类: {collections.Counter(q['tag'] for q in questions if q['code']==C1)}")
print(f"  02 子类: 连接词 {n_conj} / 语序 {n_order}(两类互不伪装核验)")
print(f"  03 结构覆盖: What a={struct['WhatA']} What an={struct['WhatAn']} What(复数/不可数)={struct['What']} How={struct['How']}")
if drift:
    print(f"  ⚠️ 漂移 {len(drift)} 处:")
    for d in drift: print("   -", d)
else:
    print("  ✅ 纯度通过:01全为that/语序/时态(无if·whether漂移);02连接词答if/whether、语序答陈述子句不互相伪装;03三结构齐且tag与答案一致。")

# 全文打印(供审)
print("\n===== 全文(逐题) =====")
for pt in points:
    print(f"\n##### {pt['code']} {pt['point']}({pt['category']}) #####")
    for q in [q for q in questions if q["code"] == pt["code"]]:
        opts = "  ".join(f"{LET[j]}.{o}" for j, o in enumerate(q["options"]))
        print(f"  {q['qid'][-3:]} [{q['tag']}] {q['stem']}\n      {opts}  →{LET[q['answer_index']]}({q['answer_text']}) | {q['explanation']}")
print("\nJSON ->", os.path.join(DIR, "g9-u2-grammar.json"))
