# -*- coding: utf-8 -*-
"""U3 产物核实:json.load + 脏字节/残渣 + 结构(题数/选项唯一/答案唯一/空号连续/qid唯一/答案分布)。照搬 u2 _verify_files.py 思路,覆盖 5 文件。"""
import json, os, io, sys, collections
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
DIR = r"C:\Projects\learn-fluent-easy\scripts\g9\u3"
LET = "ABCD"
BAD = ['\x00', '.split(', 'if False', '::jsonb', 'lambda', 'Counter(']
problems = []
allqids = []

def scan(s):
    return [b for b in BAD if b in s]

def check_opts(qid, opts):
    if len(opts) != 4: problems.append(f"{qid}: 选项数={len(opts)}≠4")
    if len(set(opts)) != 4: problems.append(f"{qid}: 选项重复 {opts}")

def load(name):
    p = os.path.join(DIR, name); raw = open(p, "rb").read()
    bom = raw[:3] == b"\xef\xbb\xbf"; nul = raw.count(b"\x00")
    hits = scan(raw.decode("utf-8", "replace"))
    try:
        obj = json.loads(raw.decode("utf-8"))
    except Exception as e:
        print(f"[X] {name}: 解析失败 {e}"); problems.append(f"{name}: JSON错"); return None
    print(f"[OK] {name}: load OK bytes={len(raw)} BOM={bom} NUL={nul} 残渣={hits}")
    if bom: problems.append(f"{name}: 有BOM")
    if nul: problems.append(f"{name}: {nul}个NUL")
    if hits: problems.append(f"{name}: 残渣{hits}")
    return obj

# grammar
g = load("g9-u3-grammar.json")
if g:
    qs = g["questions"]; allqids += [q["qid"] for q in qs]
    for q in qs:
        check_opts(q["qid"], q["options"])
        if q["options"][q["answer_index"]] != q["answer_text"]:
            problems.append(f"{q['qid']}: answer_text不符")
    dist = dict(sorted(collections.Counter(q["answer_index"] for q in qs).items()))
    bycode = collections.Counter(q["code"] for q in qs)
    print(f"     grammar: {len(qs)}题 按点={dict(bycode)} idx分布={dist}")

# reading / cloze / listening
for name, kind in [("g9-u3-reading.json","r"),("g9-u3-cloze.json","c"),("g9-u3-listening.json","l")]:
    d = load(name)
    if not d: continue
    ps = d["passages"]; nq = 0; letters = collections.Counter()
    for pa in ps:
        blanks = []
        for q in pa["questions"]:
            nq += 1; allqids.append(q["qid"]); check_opts(q["qid"], q["options"])
            ai = q["answer_index"]
            if "answer" in q and LET[ai] != q["answer"]:
                problems.append(f"{q['qid']}: answer字母≠index")
            letters[LET[ai]] += 1
            if kind == "c" and "blank" in q: blanks.append(q["blank"])
        if kind == "c" and blanks != list(range(1, len(blanks)+1)):
            problems.append(f"{pa['code']}: 空号不连续 {blanks}")
    print(f"     {name}: {len(ps)}篇/{nq}题 字母分布={dict(sorted(letters.items()))}")

# writing
w = load("g9-u3-writing.json")
if w: print(f"     writing: code={w['writing']['code']}")

dups = [x for x, c in collections.Counter(allqids).items() if c > 1]
if dups: problems.append(f"重复qid: {dups}")
print(f"\n总qid={len(allqids)} 重复={dups if dups else '无'}")
print("问题:", "无 ✅" if not problems else "")
for p in problems: print("  -", p)
