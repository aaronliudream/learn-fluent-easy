# -*- coding: utf-8 -*-
"""U3/U4 题库灌库 SQL(volume='9',对齐前端 hook 查 unit.book='9')。
   仅 grammar/reading/cloze/listening/writing 五类(vocab 已单独按 '9' 覆盖灌,不在此)。
   DELETE 键用 '9';category 用实测 id(U3 clause/other、U4 verb)。
   cloze 兼容 body/text;listening 为 exercises schema;writing 字段映射。
   输出 scripts/g9/uX/g9-uX-load.sql。不真跑。"""
import json, os, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
ROOT = r"C:\Projects\learn-fluent-easy\scripts\g9"
LET = "ABCD"
VOL = "9"   # ← U3+ 一律 '9'(不是 'g9')
CAT = {
 "clause": "c49e0d84-1b6d-4bea-bb83-35ff7558dc8f",
 "other":  "e05f9874-6401-42f8-a361-28f1dee3a58e",
 "verb":   "158797be-3277-482a-b730-75b29dfa47b4",
}
NUM = {"01": "①", "02": "②", "03": "③"}
CFG = {
 "u3": {"unit": "U3", "cefr": "B1", "ltopic": "九年级 Unit3 听力·问路与礼貌请求"},
 "u4": {"unit": "U4", "cefr": "B1", "ltopic": "九年级 Unit4 听力·成长变化(used to)"},
 "u5": {"unit": "U5", "cefr": "B1", "ltopic": "九年级 Unit5 听力·被动语态/制作工艺"},
}
def q(s): return str(s).replace("'", "''")
def jb(o): return "'" + json.dumps(o, ensure_ascii=False).replace("'", "''") + "'::jsonb"

def gen(ukey):
    cfg = CFG[ukey]; U = cfg["unit"]; D = os.path.join(ROOT, ukey)
    def load(n): return json.load(open(os.path.join(D, n), encoding="utf-8"))
    grammar = load(f"g9-{ukey}-grammar.json")
    reading = load(f"g9-{ukey}-reading.json")
    cloze   = load(f"g9-{ukey}-cloze.json")
    listening = load(f"g9-{ukey}-listening.json")
    writing = load(f"g9-{ukey}-writing.json")

    S = [f"-- 九年级 {U} 题库灌库(幂等)。volume='{VOL}' unit='{U}' grade=9。vocab 不在此(已单独按 '9' 灌)。", "BEGIN;\n"]

    # 1) grammar points + questions
    S.append(f"-- ===== junior_grammar_points (预期 {len(grammar['points'])}) =====")
    for pt in grammar["points"]:
        code = pt["code"]; title = NUM[code[-2:]] + pt["point"]; cat = CAT[pt["category"]]
        S.append("INSERT INTO public.junior_grammar_points (id, category_id, code, title, cefr, grade, summary, sort_order, volume, unit) "
            f"SELECT gen_random_uuid(), '{cat}', '{code}', '{q(title)}', '{cfg['cefr']}', 9, '对应:九年级 {U}', {int(code[-1])}, '{VOL}', '{U}' "
            f"WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='{code}');")
    S.append(f"\n-- ===== junior_grammar_questions (预期 {len(grammar['questions'])}) =====")
    so = {}
    for qn in grammar["questions"]:
        code = qn["code"]; so[code] = so.get(code, 0) + 1; n = so[code]; diff = (n - 1) % 3 + 1
        opts = qn["options"]; letter = LET[qn["answer_index"]]
        S.append("INSERT INTO public.junior_grammar_questions (id, point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, grammar_topic, distractors) "
            f"SELECT gen_random_uuid(), (SELECT id FROM public.junior_grammar_points WHERE code='{code}'), "
            f"'{q(qn['stem'])}','{q(opts[0])}','{q(opts[1])}','{q(opts[2])}','{q(opts[3])}','{letter}','{q(qn['explanation'])}',{diff},{n},'mcq','{code}','[]'::jsonb "
            f"WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions x JOIN public.junior_grammar_points p ON x.point_id=p.id WHERE p.code='{code}' AND x.stem='{q(qn['stem'])}');")

    # 2) reading
    S.append(f"\n-- ===== junior_reading (预期 {len(reading['passages'])}) =====")
    S.append(f"DELETE FROM public.junior_reading WHERE volume='{VOL}' AND unit='{U}';")
    for p in reading["passages"]:
        wc = len(p["body"].split())
        genre = p.get("genre") or p.get("topic") or ""   # 兼容 genre/topic
        qs = [{"q": x.get("stem") or x.get("q"), "answer": LET[x["answer_index"]], "options": x["options"], "explanation": x.get("explanation", "")} for x in p["questions"]]  # 兼容 stem/q
        vn = p.get("vocab_notes", [])   # g8 基线必填:每篇3生词
        S.append("INSERT INTO public.junior_reading (id, grade, title, body, topic, word_count, questions, vocab_notes, difficulty, volume, unit) "
            f"VALUES (gen_random_uuid(), 9, '{q(p['title'])}', '{q(p['body'])}', '{q(genre)}', {wc}, {jb(qs)}, {jb(vn)}, 3, '{VOL}', '{U}');")

    # 3) cloze(兼容 body/text)
    S.append(f"\n-- ===== junior_cloze (预期 {len(cloze['passages'])}) =====")
    S.append(f"DELETE FROM public.junior_cloze WHERE volume='{VOL}' AND unit='{U}';")
    for i, p in enumerate(cloze["passages"], 1):
        txt = p.get("text") or p.get("body"); wc = len(txt.split())
        qs = [{"q": str(x["blank"]), "answer": LET[x["answer_index"]], "options": x["options"], "explanation": x["explanation"]} for x in p["questions"]]
        S.append("INSERT INTO public.junior_cloze (id, grade, volume, unit, title, body, word_count, difficulty, questions, sort_order) "
            f"VALUES (gen_random_uuid(), 9, '{VOL}', '{U}', '{q(p['title'])}', '{q(txt)}', {wc}, 3, {jb(qs)}, {i});")

    # 4) listening(exercises schema)
    S.append(f"\n-- ===== junior_listening_exercises (预期 {len(listening['exercises'])}) =====")
    S.append(f"DELETE FROM public.junior_listening_exercises WHERE volume='{VOL}' AND unit='{U}';")
    for e in listening["exercises"]:
        tr = "\n".join(e["transcript"])
        kind = "long" if e.get("type") == "dialogue" else "short"   # 按 type 派生,统一 long/short(兼容 kind=passage)
        tcn = e.get("translation_cn", "")
        qs = [{"q": x["stem"], "type": "choice", "answer": LET[x["answer_index"]], "options": x["options"]} for x in e["questions"]]
        S.append("INSERT INTO public.junior_listening_exercises (id, grade, title, topic, difficulty, transcript, translation_cn, speaker, questions, key_vocab, kind, volume, unit) "
            f"VALUES (gen_random_uuid(), 9, '{q(e['title'])}', '{q(cfg['ltopic'])}', 2, '{q(tr)}', '{q(tcn)}', '{q(e['speaker'])}', {jb(qs)}, '[]'::jsonb, '{kind}', '{VOL}', '{U}');")

    # 5) writing(字段映射)
    S.append("\n-- ===== junior_writing_prompts (预期 1) =====")
    w = writing["writing"] if "writing" in writing else writing
    topic = w["title"]; prompt_en = f'Write a short passage on the topic: "{w["title"]}".'
    sc = w.get("scoring")   # 兼容 dict / list
    if isinstance(sc, dict): rubric = "；".join(f"{k}:{v}" for k, v in sc.items())
    elif isinstance(sc, list): rubric = "；".join(str(x) for x in sc)
    else: rubric = "按内容/语言/结构/字数四档评分"
    paragraph_template = "要点:" + "；".join(w.get("key_points", []))
    high = w.get("useful_expressions", []); errs = []
    S.append("INSERT INTO public.junior_writing_prompts (id, grade, topic, prompt_cn, prompt_en, requirements, min_words, max_words, sample_answer, scoring_rubric, difficulty, title_en, high_sentences, error_pairs, paragraph_template, volume, unit) "
        f"SELECT gen_random_uuid(), 9, '{q(topic)}', '{q(w['prompt_cn'])}', '{q(prompt_en)}', {jb(w.get('key_points', []))}, 70, 100, '{q(w['sample'])}', '{q(rubric)}', 3, '{q(w['title'])}', {jb(high)}, {jb(errs)}, '{q(paragraph_template)}', '{VOL}', '{U}' "
        f"WHERE NOT EXISTS (SELECT 1 FROM public.junior_writing_prompts WHERE volume='{VOL}' AND unit='{U}' AND topic='{q(topic)}');")

    S.append("\nCOMMIT;\n")
    S.append("-- ===== count 校验 =====")
    S.append(f"SELECT 'grammar_points' k, count(*) v, 3 expect FROM public.junior_grammar_points WHERE volume='{VOL}' AND unit='{U}'")
    S.append(f"UNION ALL SELECT 'grammar_questions', count(*), 60 FROM public.junior_grammar_questions x JOIN public.junior_grammar_points p ON x.point_id=p.id WHERE p.volume='{VOL}' AND p.unit='{U}'")
    S.append(f"UNION ALL SELECT 'reading', count(*), 6 FROM public.junior_reading WHERE volume='{VOL}' AND unit='{U}'")
    S.append(f"UNION ALL SELECT 'cloze', count(*), 6 FROM public.junior_cloze WHERE volume='{VOL}' AND unit='{U}'")
    S.append(f"UNION ALL SELECT 'listening', count(*), 6 FROM public.junior_listening_exercises WHERE volume='{VOL}' AND unit='{U}'")
    S.append(f"UNION ALL SELECT 'writing', count(*), 1 FROM public.junior_writing_prompts WHERE volume='{VOL}' AND unit='{U}';")

    OUT = os.path.join(D, f"g9-{ukey}-load.sql")
    open(OUT, "w", encoding="utf-8").write("\n".join(S))
    ins = sum(1 for x in S if x.startswith("INSERT")); dele = sum(1 for x in S if x.startswith("DELETE"))
    cats = {pt['code']: f"{pt['category']}={CAT[pt['category']][:8]}…" for pt in grammar['points']}
    print(f"[{ukey}] -> {OUT}  INSERT={ins} DELETE={dele} volume='{VOL}'  grammar分类={cats}")

for u in ["u5"]:
    gen(u)
