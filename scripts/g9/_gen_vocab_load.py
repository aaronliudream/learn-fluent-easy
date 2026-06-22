# -*- coding: utf-8 -*-
"""U3/U4 vocab 覆盖灌库 SQL(volume='9',对齐前端 useUnitVocab 查 unit.book='9')。
   DELETE(键=grade9+volume'9'+unit)与 INSERT 分段,每步 count,末尾查重。Aaron 分步跑。"""
import json, os, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
ROOT = r"C:\Projects\learn-fluent-easy\scripts\g9"
def q(s): return str(s).replace("'", "''")
S = ["-- ===== U3/U4 vocab 覆盖灌库(volume='9')。分步跑,每步贴回 count。=====", ""]
for ukey, U, expect in [("u3","U3",31), ("u4","U4",39)]:
    d = json.load(open(os.path.join(ROOT, ukey, f"g9-{ukey}-vocab.json"), encoding="utf-8"))
    assert d["volume"] == "9", f"{ukey} volume 必须='9'"
    ws = d["words"]
    S.append(f"\n-- ========================= {U} ({len(ws)} 词) =========================")
    S.append(f"-- [step0] 灌前 count(预期 {31 if U=='U3' else 29})")
    S.append(f"SELECT '{U} 灌前' tag, count(*) FROM public.junior_vocab WHERE grade=9 AND volume='9' AND unit='{U}';")
    S.append(f"\n-- [step1] DELETE 旧词(键对准旧骨架实际存储:grade=9 volume='9' unit='{U}')")
    S.append(f"DELETE FROM public.junior_vocab WHERE grade=9 AND volume='9' AND unit='{U}';")
    S.append(f"-- [step1 验证] 预期 0")
    S.append(f"SELECT '{U} DELETE后' tag, count(*) FROM public.junior_vocab WHERE grade=9 AND volume='9' AND unit='{U}';")
    S.append(f"\n-- [step2] INSERT 官方 {len(ws)} 词(volume='9';含 WHERE NOT EXISTS 防重)")
    for i, w in enumerate(ws, 1):
        wid = f"jr-9-{U}-{i:04d}"
        ipa = w.get("ipa", "")
        ph  = w.get("phrase_en", "")
        pos = w.get("pos", "")
        S.append(
            "INSERT INTO public.junior_vocab (id, grade, word, pos, phonetic, meaning_cn, phrase_en, freq_rank, word_id, stage, volume, unit, source_type, confidence) "
            f"SELECT gen_random_uuid(), 9, '{q(w['word'])}', '{q(pos)}', '{q(ipa)}', '{q(w['meaning_cn'])}', '{q(ph)}', {w['freq_rank']}, '{wid}', 'junior', '9', '{U}', 'wordlist', 'high' "
            f"WHERE NOT EXISTS (SELECT 1 FROM public.junior_vocab WHERE grade=9 AND volume='9' AND unit='{U}' AND word='{q(w['word'])}');")
    S.append(f"-- [step2 验证] 预期 {len(ws)}")
    S.append(f"SELECT '{U} INSERT后' tag, count(*) FROM public.junior_vocab WHERE grade=9 AND volume='9' AND unit='{U}';")
S.append("\n-- ========================= 末尾查重(预期 0 行) =========================")
S.append("SELECT word, unit, count(*) FROM public.junior_vocab WHERE grade=9 AND volume='9' AND unit IN ('U3','U4') GROUP BY word, unit HAVING count(*) > 1;")
OUT = os.path.join(ROOT, "g9-u34-vocab-load.sql")
open(OUT, "w", encoding="utf-8").write("\n".join(S))
ins = sum(1 for x in S if x.startswith("INSERT"))
print("SQL ->", OUT)
print("INSERT 行:", ins, "(U3 39 + U4 39 = 78)")
print("DELETE 行:", sum(1 for x in S if x.startswith("DELETE")))
