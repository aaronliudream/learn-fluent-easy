# -*- coding: utf-8 -*-
"""把 U3/U4 listening 从 passages(string transcript) 转成 U1/U2 的 exercises schema
   (transcript 行数组 + title/kind/speaker)。questions 对齐 U2:qid/volume/unit/code/stem/options/answer_index/answer_text。
   顺修 U3 l.01 transcript: 'opens until six' -> 'stays open until six'。"""
import json, io, sys, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
ROOT = r"C:\Projects\learn-fluent-easy\scripts\g9"
# 英文标题(按各篇 transcript 主题拟),对话=对话/long/us_male,独白=短文/short/us_female
TITLES = {
 "g9u3.l.01": "Asking the Way to the Library",
 "g9u3.l.02": "Asking About Places to Visit",
 "g9u3.l.03": "Ordering at a Restaurant",
 "g9u3.l.04": "Shopping for Books",
 "g9u3.l.05": "Welcome to Maple City",
 "g9u3.l.06": "Asking for Help at School",
 "g9u4.l.01": "Meeting an Old Classmate",
 "g9u4.l.02": "How I Have Changed",
 "g9u4.l.03": "Talking About Old Fears",
 "g9u4.l.04": "My Cousin Mike",
 "g9u4.l.05": "Life in the Old Days",
 "g9u4.l.06": "Sharing How We Have Changed",
}
LET = "ABCD"
def convert(unit):
    p = os.path.join(ROOT, unit, f"g9-{unit}-listening.json")
    d = json.load(open(p, encoding="utf-8"))
    vol, un = d["volume"], d["unit"]
    uu = un  # 'U3'/'U4'
    cnlabel = {"U3": "九年级 U3 听力", "U4": "九年级 U4 听力"}[uu]
    exercises = []
    for pa in d["passages"]:
        code = pa["code"]
        typ = pa["type"]  # dialogue / monologue
        is_dlg = (typ == "dialogue")
        out_type = "dialogue" if is_dlg else "passage"
        kind = "long" if is_dlg else "short"
        speaker = "us_male" if is_dlg else "us_female"
        zh_kind = "对话" if is_dlg else "短文"
        title = f"{cnlabel}·{zh_kind} {TITLES[code]}"
        tr = pa["transcript"]
        # U3 l.01 transcript 错修正
        tr = tr.replace("Yes, it opens until six in the evening.",
                        "Yes, it stays open until six in the evening.")
        transcript_lines = tr.split("\n")
        qs = []
        for q in pa["questions"]:
            ai = q["answer_index"]
            qs.append({
                "qid": q["qid"], "volume": vol, "unit": un, "code": code,
                "stem": q["stem"], "options": q["options"],
                "answer_index": ai, "answer_text": q["options"][ai],
            })
        exercises.append({
            "code": code, "title": title, "type": out_type, "kind": kind,
            "speaker": speaker, "transcript": transcript_lines,
            "translation_cn": pa["translation_cn"], "questions": qs,
        })
    out = {"volume": vol, "unit": un, "exercises": exercises}
    json.dump(out, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    return out

for unit in ["u3", "u4"]:
    o = convert(unit)
    print(f"=== {unit} listening 转换完成: {len(o['exercises'])} 篇 ===")
    for e in o["exercises"]:
        print(f"  {e['code']} | type={e['type']} kind={e['kind']} speaker={e['speaker']} | transcript {len(e['transcript'])}行 | {e['title']}")
