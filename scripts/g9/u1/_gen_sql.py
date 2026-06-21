# -*- coding: utf-8 -*-
"""读 scripts/g9/u1 的 7 个 json,生成幂等 SQL(WHERE NOT EXISTS)灌入 8 年级同款表。
volume='g9' unit='U1' grade=9 强制写满;answer_index→A/B/C/D;options[4]→option_a~d。
finaltest 不灌库(运行时组卷)。"""
import json, os
DIR = r"C:\Projects\learn-fluent-easy\scripts\g9\u1"
OUT = os.path.join(DIR, "g9-u1-load.sql")
def load(n):
    with open(os.path.join(DIR, n), encoding="utf-8") as f: return json.load(f)
def q(s):  # SQL 单引号转义
    return str(s).replace("'", "''")
def jb(obj):  # jsonb 字面量
    return "'" + json.dumps(obj, ensure_ascii=False).replace("'", "''") + "'::jsonb"
LET = "ABCD"

CAT_VERB = "158797be-3277-482a-b730-75b29dfa47b4"
CAT_OTHER = "e05f9874-6401-42f8-a361-28f1dee3a58e"
CAT = {"g9u1.01": CAT_VERB, "g9u1.02": CAT_OTHER, "g9u1.03": CAT_VERB}

vocab = load("g9-u1-vocab.json")
grammar = load("g9-u1-grammar.json")
reading = load("g9-u1-reading.json")
cloze = load("g9-u1-cloze.json")
listening = load("g9-u1-listening.json")
writing = load("g9-u1-writing.json")

S = []
S.append("-- 九年级 Unit 1 整单元灌库(幂等)。volume='g9' unit='U1' grade=9。")
S.append("-- finaltest 不灌(运行时 buildFinalQuiz 组卷)。\nBEGIN;\n")

# ===== 1) junior_vocab (29 词) =====
S.append("-- ===== junior_vocab (预期 29) =====")
for i, w in enumerate(vocab["words"], 1):
    wid = f"jr-g9-U1-{i:04d}"
    S.append(
        "INSERT INTO public.junior_vocab (id, grade, word, pos, phonetic, meaning_cn, word_id, stage, volume, unit, source_type, confidence) "
        f"SELECT gen_random_uuid(), 9, '{q(w['word'])}', '{q(w['pos'])}', '{q(w['ipa'])}', '{q(w['meaning_cn'])}', '{wid}', 'junior', 'g9', 'U1', 'wordlist', 'high' "
        f"WHERE NOT EXISTS (SELECT 1 FROM public.junior_vocab WHERE volume='g9' AND unit='U1' AND word='{q(w['word'])}');")

# ===== 2) junior_grammar_points (3) =====
S.append("\n-- ===== junior_grammar_points (预期 3) =====")
NUM = {"g9u1.01": "①", "g9u1.02": "②", "g9u1.03": "③"}
for pt in grammar["points"]:
    code = pt["code"]; title = NUM[code] + pt["point"]
    S.append(
        "INSERT INTO public.junior_grammar_points (id, category_id, code, title, cefr, grade, summary, sort_order, volume, unit) "
        f"SELECT gen_random_uuid(), '{CAT[code]}', '{code}', '{q(title)}', 'A2', 9, '对应:g9 U1', {int(code[-1])}, 'g9', 'U1' "
        f"WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='{code}');")

# ===== 3) junior_grammar_questions (60) =====
S.append("\n-- ===== junior_grammar_questions (预期 60) =====")
sortmap = {}
for qn in grammar["questions"]:
    code = qn["code"]; sortmap[code] = sortmap.get(code, 0) + 1; so = sortmap[code]
    opts = qn["options"]; letter = LET[qn["answer_index"]]; diff = (so - 1) % 3 + 1
    S.append(
        "INSERT INTO public.junior_grammar_questions (id, point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, grammar_topic, distractors) "
        f"SELECT gen_random_uuid(), (SELECT id FROM public.junior_grammar_points WHERE code='{code}'), "
        f"'{q(qn['stem'])}', '{q(opts[0])}', '{q(opts[1])}', '{q(opts[2])}', '{q(opts[3])}', '{letter}', '{q(qn['explanation'])}', {diff}, {so}, 'mcq', '{code}', '[]'::jsonb "
        f"WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions x JOIN public.junior_grammar_points p ON x.point_id=p.id WHERE p.code='{code}' AND x.stem='{q(qn['stem'])}');")

# ===== 4) junior_reading (6) =====
S.append("\n-- ===== junior_reading (预期 6) =====")
RDIFF = {"g9u1.rd1":3,"g9u1.rd2":2,"g9u1.rd3":3,"g9u1.rd4":2,"g9u1.rd5":4,"g9u1.rd6":3}
for p in reading["passages"]:
    title = p["title"]; body = p["body"]; wc = len(body.split())
    qs = [{"q": x["stem"], "answer": LET[x["answer_index"]], "options": x["options"], "explanation": x["explanation"]} for x in p["questions"]]
    S.append(
        "INSERT INTO public.junior_reading (id, grade, title, body, topic, word_count, questions, vocab_notes, difficulty, volume, unit) "
        f"SELECT gen_random_uuid(), 9, '{q(title)}', '{q(body)}', '{q(p['genre'])}', {wc}, {jb(qs)}, '[]'::jsonb, {RDIFF.get(p['code'],3)}, 'g9', 'U1' "
        f"WHERE NOT EXISTS (SELECT 1 FROM public.junior_reading WHERE volume='g9' AND unit='U1' AND title='{q(title)}');")

# ===== 5) junior_cloze (1) =====
S.append("\n-- ===== junior_cloze (预期 1) =====")
cz_title = "九年级 U1 完形:How Li Lei Changed"
cz_body = cloze["text"]; cz_wc = len(cz_body.split())
cz_qs = [{"q": str(x["blank"]), "answer": LET[x["answer_index"]], "options": x["options"], "explanation": x["explanation"]} for x in cloze["questions"]]
S.append(
    "INSERT INTO public.junior_cloze (id, grade, volume, unit, title, body, word_count, difficulty, questions, sort_order) "
    f"SELECT gen_random_uuid(), 9, 'g9', 'U1', '{q(cz_title)}', '{q(cz_body)}', {cz_wc}, 3, {jb(cz_qs)}, 1 "
    f"WHERE NOT EXISTS (SELECT 1 FROM public.junior_cloze WHERE volume='g9' AND unit='U1' AND title='{q(cz_title)}');")

# ===== 6) junior_listening_exercises (2:对话+短文) =====
S.append("\n-- ===== junior_listening_exercises (预期 2) =====")
mats = listening["materials"]; lq = listening["questions"]
def ls_q(items):
    return [{"q": x["stem"], "type": "choice", "answer": LET[x["answer_index"]], "options": x["options"]} for x in items]
rows = [
    ("九年级 U1 听力·对话 How Sarah Studies", "\n".join(mats[0]["transcript"]), mats[0]["translation_cn"], "us_female", "long", 2, lq[0:5]),
    ("九年级 U1 听力·短文 How Mike Changed", mats[1]["transcript"][0], mats[1]["translation_cn"], "us_male", "short", 2, lq[5:10]),
]
for title, tr, trcn, spk, kind, diff, items in rows:
    S.append(
        "INSERT INTO public.junior_listening_exercises (id, grade, title, topic, difficulty, transcript, translation_cn, speaker, questions, key_vocab, kind, volume, unit) "
        f"SELECT gen_random_uuid(), 9, '{q(title)}', '九上 Unit1 听力', {diff}, '{q(tr)}', '{q(trcn)}', '{spk}', {jb(ls_q(items))}, '[]'::jsonb, '{kind}', 'g9', 'U1' "
        f"WHERE NOT EXISTS (SELECT 1 FROM public.junior_listening_exercises WHERE volume='g9' AND unit='U1' AND title='{q(title)}');")

# ===== 7) junior_writing_prompts (1) =====
S.append("\n-- ===== junior_writing_prompts (预期 1) =====")
w_topic = "How I Study English"
prompt_cn = "以 “How I Study English(我怎样学习英语)” 为题写一篇短文(80 词左右)。要点:" + "；".join(writing["points"])
reqs = writing["points"]
high = [
 "I build my vocabulary by making word cards.（我通过做单词卡片积累词汇。）",
 "I improve my listening by watching English videos.（我通过看英语视频提高听力。）",
 "I practise speaking by talking with my classmates.（我通过和同学交谈练习口语。）",
 "When I meet a new word, I guess its meaning by reading the sentences around it.（遇到生词时,我通过读上下文猜词义。）",
 "Learning a language takes time, so be patient.（学习语言需要时间,要有耐心。）",
]
errs = [
 {"wrong":"I study English by read books.","correct":"I study English by reading books.","note":"介词 by 后接动名词 doing。"},
 {"wrong":"I improve it by listen to tapes.","correct":"I improve it by listening to tapes.","note":"by + 动名词。"},
 {"wrong":"How you study English?","correct":"How do you study English?","note":"一般现在时特殊疑问要加助动词 do。"},
]
tmpl = ("【段落结构模板】\n第1段:开场——Everyone wants to learn English well, and here is how I do it.\n"
        "第2段:方法——I ... by doing ...（写出至少3种,用 by+doing 句型）\n"
        "第3段:结尾——鼓励/建议:Learning takes time, so be patient. ... you will become a good learner!")
rubric = ("【15 分制】A 档(13-15):3+ 学习方法、正确使用 by+doing、语法基本无误、条理清楚;"
          "B 档(10-12):方法较全、少量错误;C 档(7-9):方法偏少、句型简单、错误较多;D 档(0-6):内容不完整、错误多。")
sample = writing["model_essay"]
S.append(
    "INSERT INTO public.junior_writing_prompts (id, grade, topic, prompt_cn, prompt_en, requirements, min_words, max_words, sample_answer, scoring_rubric, difficulty, title_en, high_sentences, error_pairs, paragraph_template, volume, unit) "
    f"SELECT gen_random_uuid(), 9, '{q(w_topic)}', '{q(prompt_cn)}', 'Write a short passage on the topic: \"How I Study English\".', {jb(reqs)}, 70, 100, '{q(sample)}', '{q(rubric)}', 3, 'How I Study English', {jb(high)}, {jb(errs)}, '{q(tmpl)}', 'g9', 'U1' "
    f"WHERE NOT EXISTS (SELECT 1 FROM public.junior_writing_prompts WHERE volume='g9' AND unit='U1' AND topic='{q(w_topic)}');")

S.append("\nCOMMIT;\n")

# ===== count 校验 =====
S.append("-- ===== count 校验(实际 vs 预期) =====")
S.append("SELECT 'vocab' tbl, count(*) actual, 29 expected FROM public.junior_vocab WHERE volume='g9' AND unit='U1'")
S.append("UNION ALL SELECT 'grammar_points', count(*), 3 FROM public.junior_grammar_points WHERE volume='g9' AND unit='U1'")
S.append("UNION ALL SELECT 'grammar_questions', count(*), 60 FROM public.junior_grammar_questions x JOIN public.junior_grammar_points p ON x.point_id=p.id WHERE p.volume='g9' AND p.unit='U1'")
S.append("UNION ALL SELECT 'reading', count(*), 6 FROM public.junior_reading WHERE volume='g9' AND unit='U1'")
S.append("UNION ALL SELECT 'cloze', count(*), 1 FROM public.junior_cloze WHERE volume='g9' AND unit='U1'")
S.append("UNION ALL SELECT 'listening', count(*), 2 FROM public.junior_listening_exercises WHERE volume='g9' AND unit='U1'")
S.append("UNION ALL SELECT 'writing', count(*), 1 FROM public.junior_writing_prompts WHERE volume='g9' AND unit='U1';")

# ===== 校验3:未挂归属/未映射 =====
S.append("\n-- ===== 校验3:未挂归属/未映射条目(应全部 0 行) =====")
S.append("SELECT 'vocab_null_attr' chk, id::text, word detail FROM public.junior_vocab WHERE grade=9 AND (volume IS NULL OR unit IS NULL)")
S.append("UNION ALL SELECT 'gpoint_null_attr', id::text, code FROM public.junior_grammar_points WHERE code LIKE 'g9u1.%' AND (volume IS NULL OR unit IS NULL OR category_id IS NULL)")
S.append("UNION ALL SELECT 'gquestion_orphan', x.id::text, x.stem FROM public.junior_grammar_questions x LEFT JOIN public.junior_grammar_points p ON x.point_id=p.id WHERE x.grammar_topic LIKE 'g9u1.%' AND p.id IS NULL")
S.append("UNION ALL SELECT 'reading_null_attr', id::text, title FROM public.junior_reading WHERE grade=9 AND (volume IS NULL OR unit IS NULL)")
S.append("UNION ALL SELECT 'cloze_null_attr', id::text, title FROM public.junior_cloze WHERE grade=9 AND (volume IS NULL OR unit IS NULL)")
S.append("UNION ALL SELECT 'listening_null_attr', id::text, title FROM public.junior_listening_exercises WHERE grade=9 AND (volume IS NULL OR unit IS NULL)")
S.append("UNION ALL SELECT 'writing_null_attr', id::text, topic FROM public.junior_writing_prompts WHERE grade=9 AND (volume IS NULL OR unit IS NULL);")

with open(OUT, "w", encoding="utf-8") as f:
    f.write("\n".join(S))
print("SQL ->", OUT)
print("lines:", len(S))
