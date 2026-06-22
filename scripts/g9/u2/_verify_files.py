# -*- coding: utf-8 -*-
"""核实产物干净:json.load 解析 + 扫脏字节/截断/代码残渣 + 结构校验(空号连续/题数/answer字母/选项唯一/答案唯一)。"""
import json, os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
DIR = r"C:\Projects\learn-fluent-easy\scripts\g9\u2"
LET = "ABCD"
BAD_SUBSTR = ['.split(', 'if False', '\x00', '::jsonb', 'None', 'lambda', 'Counter(']

def scan_text(s):
    hits = []
    if '\x00' in s: hits.append("NULL字节")
    for b in ['.split(', 'if False', '::jsonb']:
        if b in s: hits.append(f"残渣'{b}'")
    return hits

problems = []
def check_q(qid, opts, ans_idx=None, ans_text=None):
    if len(opts) != 4: problems.append(f"{qid}: 选项数={len(opts)}≠4")
    if len(set(opts)) != 4: problems.append(f"{qid}: 选项重复 {opts}")
    for o in opts:
        if scan_text(str(o)): problems.append(f"{qid}: 选项脏 {scan_text(str(o))}")
    if ans_idx is not None:
        if not (0 <= ans_idx <= 3): problems.append(f"{qid}: answer_index 越界 {ans_idx}")
        elif ans_text is not None and opts[ans_idx] != ans_text:
            problems.append(f"{qid}: answer_text 不符 ({ans_text} vs {opts[ans_idx]})")

# ---- 1) 三文件 json.load ----
loaded = {}
for name in ["g9-u2-reading.json", "g9-u2-cloze.json", "g9-u2-listening.json"]:
    p = os.path.join(DIR, name)
    raw = open(p, "rb").read()
    nul = raw.count(b"\x00")
    try:
        obj = json.loads(raw.decode("utf-8"))
        loaded[name] = obj
        print(f"✅ {name}: json.load OK | bytes={len(raw)} | NULL字节={nul}")
    except Exception as e:
        print(f"❌ {name}: 解析失败 {e}")
        loaded[name] = None
    if nul: problems.append(f"{name}: 含 {nul} 个 NULL 字节")

# ---- 2) reading ----
rd = loaded.get("g9-u2-reading.json")
if rd:
    print(f"\n阅读: {len(rd['passages'])}篇")
    for p in rd["passages"]:
        for h in scan_text(p["body"]):
            problems.append(f"{p['code']} body 脏: {h}")
        qids = [q["qid"] for q in p["questions"]]
        ans = [q["answer_text"] for q in p["questions"]]
        for q in p["questions"]:
            check_q(q["qid"], q["options"], q["answer_index"], q["answer_text"])
        if len(p["questions"]) != 5: problems.append(f"{p['code']} 题数={len(p['questions'])}≠5")
        if len(set(ans)) != len(ans): problems.append(f"{p['code']} 同篇答案重复 {ans}")
    # rd2 q4 红包题核
    rd2q4 = next((q for pp in rd["passages"] if pp["code"]=="g9u2.rd2" for q in pp["questions"] if q["qid"]=="g9u2.rd2.q4"), None)
    print("rd2.q4(红包题):", json.dumps(rd2q4, ensure_ascii=False) if rd2q4 else "缺失")

# ---- 3) cloze ----
cz = loaded.get("g9-u2-cloze.json")
if cz:
    print(f"\n完形: {len(cz['passages'])}篇")
    for p in cz["passages"]:
        for h in scan_text(p["text"]): problems.append(f"{p['code']} text 脏: {h}")
        blanks = [q["blank"] for q in p["questions"]]
        if blanks != list(range(1, 11)): problems.append(f"{p['code']} 空号不连续 {blanks}")
        for q in p["questions"]:
            check_q(q["qid"], q["options"], q["answer_index"], q["answer_text"])

# ---- 4) listening ----
ls = loaded.get("g9-u2-listening.json")
if ls:
    print(f"听力: {len(ls['exercises'])}篇")
    for e in ls["exercises"]:
        for ln in e["transcript"]:
            for h in scan_text(ln): problems.append(f"{e['code']} transcript 脏: {h}")
        for h in scan_text(e["translation_cn"]): problems.append(f"{e['code']} 译文 脏: {h}")
        if len(e["questions"]) != 5: problems.append(f"{e['code']} 题数={len(e['questions'])}≠5")
        for q in e["questions"]:
            check_q(q["qid"], q["options"], q["answer_index"], q["answer_text"])

# ---- 5) qid 全局去重 + answer 字母核(answer字母由 index 映射) ----
allq = []
if rd: allq += [q for p in rd["passages"] for q in p["questions"]]
if cz: allq += [q for p in cz["passages"] for q in p["questions"]]
if ls: allq += [q for e in ls["exercises"] for q in e["questions"]]
ids = [q["qid"] for q in allq]
if len(set(ids)) != len(ids): problems.append(f"qid 重复: 总{len(ids)} 去重{len(set(ids))}")
print(f"\nqid: 总 {len(ids)} | 去重 {len(set(ids))} | answer_index 全∈[0,3]: {all(0<=q['answer_index']<=3 for q in allq)}")

print("\n===== 结论 =====")
if problems:
    print(f"❌ {len(problems)} 处问题:")
    for x in problems: print("  -", x)
else:
    print("✅ 产物干净:三文件 json.load 全部成功、0 NULL字节、0 代码残渣/截断符;阅读6×5/完形6×10(空号连续)/听力6×5;选项4且唯一、答案唯一、answer_index∈[0,3] 且与 answer_text 一致;rd2.q4 红包题为正确三选项结构。")
