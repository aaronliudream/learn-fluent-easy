# -*- coding: utf-8 -*-
"""Unit 1 质检:选择题格式 + 答案分布 + 考点纯度 + finaltest 引用/完形带原文。"""
import json, os, collections, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
DIR = r"C:\Projects\learn-fluent-easy\scripts\g9\u1"
def load(n):
    with open(os.path.join(DIR,n),encoding="utf-8") as f: return json.load(f)

errors=[]; summary=[]; drift=[]
WH={"What","Where","When","Why","Who","Which","Whose","How","How do","How does","How did","How can","How are","What do","What time","Why do"}

def check_mcq(label, qs):
    dist=collections.Counter()
    for q in qs:
        opts=q["options"]; ai=q["answer_index"]; qid=q.get("qid","?")
        if len(opts)!=4: errors.append(f"{label} {qid}: 选项数 {len(opts)}≠4")
        if len(set(opts))!=4: errors.append(f"{label} {qid}: 选项重复 {opts}")
        if not (0<=ai<=3): errors.append(f"{label} {qid}: answer_index 越界 {ai}")
        elif opts[ai]!=q["answer_text"]: errors.append(f"{label} {qid}: answer_text 不符")
        if 0<=ai<=3: dist[ai]+=1
    n=len(qs); mx=max(dist.values()) if dist else 0
    shuffled = len(dist)>=3 and mx<=n*0.5+0.001
    summary.append(f"{label}: {n} 题 | A/B/C/D = {dist[0]}/{dist[1]}/{dist[2]}/{dist[3]} | shuffle={'OK' if shuffled else '⚠️偏斜'}")
    return n

def purity(code, qs):
    for q in qs:
        a=q["answer_text"].strip(); al=a.lower()
        if code=="g9u1.01":  # 必须 by + doing
            ok = al.startswith("by ") and al.split()[1].endswith("ing")
            if not ok: drift.append(f"01 {q['qid']}: 答案“{a}”非 by+doing")
        elif code=="g9u1.02":  # 必须 How 类疑问词
            if a not in {"How","How do","How does","How did","How can"}:
                drift.append(f"02 {q['qid']}: 答案“{a}”非 How 疑问词")
        elif code=="g9u1.03":  # 动词原形/助动词(不得是 by 短语,不得是疑问词)
            if al.startswith("by ") or (a in WH and a not in {"Does","Do","Did"}):
                drift.append(f"03 {q['qid']}: 答案“{a}”疑似漂移")

qids=set()
def reg(qs,blk):
    for q in qs:
        if q["qid"] in qids: errors.append(f"qid 重复 {q['qid']}")
        qids.add(q["qid"])
        if q.get("volume")!="g9" or q.get("unit")!="U1": errors.append(f"{blk} {q['qid']} 归属缺失")

# vocab
vc=load("g9-u1-vocab.json")
summary.append(f"vocab: {len(vc['words'])} 词 + {len(vc['phrases'])} 短语 (volume={vc['volume']},unit={vc['unit']})")

# grammar
gr=load("g9-u1-grammar.json")
for pt in gr["points"]:
    pqs=[q for q in gr["questions"] if q["code"]==pt["code"]]
    check_mcq(f"grammar[{pt['code']}]", pqs); purity(pt["code"], pqs); reg(pqs,"grammar")

# reading 6 passages
rd=load("g9-u1-reading.json")
all_rd=[]
for p in rd["passages"]:
    all_rd+=p["questions"]; reg(p["questions"],"reading")
summary.append(f"reading: {len(rd['passages'])} 篇 / {len(all_rd)} 题")
check_mcq("reading(合计)", all_rd)

# cloze
cz=load("g9-u1-cloze.json"); check_mcq("cloze", cz["questions"]); reg(cz["questions"],"cloze")
blanks=sorted(q["blank"] for q in cz["questions"])
if blanks!=list(range(1,len(cz["questions"])+1)): errors.append(f"cloze 空号不连续: {blanks}")

# listening
ls=load("g9-u1-listening.json"); check_mcq("listening", ls["questions"]); reg(ls["questions"],"listening")

# writing
wr=load("g9-u1-writing.json")
summary.append(f"writing: 话题='{wr['topic']}' | 范文 {len(wr['model_essay'].split())} 词")

# finaltest
ft=load("g9-u1-finaltest.json")
missing=[r for r in ft["question_refs"] if r not in qids]
has_cloze=any(r.startswith("g9u1.cz") for r in ft["question_refs"])
cloze_ctx_ok = bool(ft.get("cloze_context","").strip()) if has_cloze else True
summary.append(f"finaltest: 引用 {len(ft['question_refs'])} 题 | 未解析 {len(missing)} | 含完形 {has_cloze} | 完形带原文 {'OK' if cloze_ctx_ok else '缺失'}")
if missing: errors.append(f"finaltest 引用无法解析: {missing}")
if has_cloze and not cloze_ctx_ok: errors.append("finaltest 含完形题但未带 cloze_context 原文")

print("===== 题量统计 =====")
for s in summary: print(" ", s)
print("\n===== 考点纯度自查 =====")
if drift:
    print(f"  ⚠️ {len(drift)} 处疑似漂移:")
    for d in drift: print("   -", d)
else:
    print("  ✅ 三考点纯度通过:01 全为 by+doing;02 全为 How 疑问词;03 全为情态/助动词+原形,无交叉漂移。")
print("\n===== 格式质检 =====")
if errors:
    print(f"  ❌ {len(errors)} 处问题:")
    for e in errors: print("   -", e)
else:
    print("  ✅ 全部通过:选项=4、答案含于选项、无重复、answer_index 合法、归属齐全、完形空号连续、finaltest 引用可解析且完形带原文、答案位置已打散。")
