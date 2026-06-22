# -*- coding: utf-8 -*-
"""U2 整单元灌库 SQL(幂等)。vocab(真实词+IPA+phrase_en+freq_rank)+grammar(3点60题)
   +reading6(带vocab_notes)+cloze6+listening6+writing1。answer→字母,jsonb 同 U1。输出 scripts/g9/u2/。"""
import json, os
DIR = r"C:\Projects\learn-fluent-easy\scripts\g9\u2"
def load(n):
    with open(os.path.join(DIR, n), encoding="utf-8") as f: return json.load(f)
def q(s): return str(s).replace("'", "''")
def jb(o): return "'" + json.dumps(o, ensure_ascii=False).replace("'", "''") + "'::jsonb"
LET = "ABCD"
V, U = "g9", "U2"
CAT = {"clause": "c49e0d84-1b6d-4bea-bb83-35ff7558dc8f", "other": "e05f9874-6401-42f8-a361-28f1dee3a58e"}

# ===== 词汇:U2 课本真实词表(IPA 标准重写)+ 原创真实搭配 chunk =====
VOCAB = [
 ("stranger","/ˈstreɪndʒə(r)/","n.","陌生人","talk to a stranger"),
 ("relative","/ˈrelətɪv/","n.","亲戚","visit my relatives"),
 ("pound","/paʊnd/","n.","磅;英镑","put on five pounds"),
 ("dessert","/dɪˈzɜːt/","n.","甜点","have some dessert"),
 ("garden","/ˈɡɑːdn/","n.","花园;院子","sit in the garden"),
 ("tie","/taɪ/","n.","领带","wear a tie"),
 ("treat","/triːt/","n./v.","款待;招待;特别的享受","a special treat"),
 ("Christmas","/ˈkrɪsməs/","n.","圣诞节","at Christmas"),
 ("novel","/ˈnɒvl/","n.","小说","read a novel"),
 ("business","/ˈbɪznəs/","n.","生意;商业","good for business"),
 ("warmth","/wɔːmθ/","n.","温暖","the warmth of family"),
 ("steal","/stiːl/","v.","偷(stole)","steal money"),
 ("lay","/leɪ/","v.","摆放;放置(laid)","lay out the food"),
 ("admire","/ədˈmaɪə(r)/","v.","欣赏;钦佩","admire the view"),
 ("lie","/laɪ/","n./v.","谎言;说谎","tell a lie"),
 ("punish","/ˈpʌnɪʃ/","v.","惩罚","punish the boy"),
 ("warn","/wɔːn/","v.","警告;提醒","warn the children"),
 ("spread","/spred/","v.","传播;展开","spread the news"),
 ("dead","/ded/","adj.","死的","a dead tree"),
 ("present","/ˈpreznt/","n.","礼物","a birthday present"),
 ("fantastic","/fænˈtæstɪk/","adj.","极好的","a fantastic show"),
 ("crowded","/ˈkraʊdɪd/","adj.","拥挤的","a crowded street"),
 ("delicious","/dɪˈlɪʃəs/","adj.","美味的","delicious mooncakes"),
 ("traditional","/trəˈdɪʃənl/","adj.","传统的","a traditional festival"),
 ("pretty","/ˈprɪti/","adj.","漂亮的","a pretty dress"),
 ("exciting","/ɪkˈsaɪtɪŋ/","adj.","令人兴奋的","an exciting race"),
 ("special","/ˈspeʃl/","adj.","特别的","a special day"),
 ("scary","/ˈskeəri/","adj.","吓人的","a scary story"),
 ("popular","/ˈpɒpjələ(r)/","adj.","受欢迎的","a popular festival"),
]
VOCAB_JSON = {"volume": V, "unit": U, "topic": "I think that mooncakes are delicious!",
 "words": [{"word": w, "ipa": ipa, "pos": p, "meaning_cn": cn, "phrase_en": ph, "freq_rank": i+1}
           for i, (w, ipa, p, cn, ph) in enumerate(VOCAB)]}
with open(os.path.join(DIR, "g9-u2-vocab.json"), "w", encoding="utf-8") as f:
    json.dump(VOCAB_JSON, f, ensure_ascii=False, indent=2)

# 阅读 vocab_notes(每篇3个,节日相关词)
VNOTES = {
 "g9u2.rd1": [{"word":"reunion","cn":"团聚;团圆"},{"word":"filling","cn":"馅"},{"word":"lunar","cn":"农历的"}],
 "g9u2.rd2": [{"word":"couplet","cn":"对联"},{"word":"firecracker","cn":"鞭炮"},{"word":"red packet","cn":"红包"}],
 "g9u2.rd3": [{"word":"calendar","cn":"日历;历法"},{"word":"turkey","cn":"火鸡"},{"word":"custom","cn":"风俗;习俗"}],
 "g9u2.rd4": [{"word":"row","cn":"划(船)"},{"word":"drum","cn":"鼓"},{"word":"poet","cn":"诗人"}],
 "g9u2.rd5": [{"word":"old-fashioned","cn":"过时的"},{"word":"generation","cn":"一代人"},{"word":"culture","cn":"文化"}],
 "g9u2.rd6": [{"word":"bad luck","cn":"厄运"},{"word":"join","cn":"参加;加入"},{"word":"visitor","cn":"游客"}],
}

grammar = load("g9-u2-grammar.json")
reading = load("g9-u2-reading.json")
cloze = load("g9-u2-cloze.json")
listening = load("g9-u2-listening.json")
writing = load("g9-u2-writing.json")

S = ["-- 九年级 U2 整单元灌库(幂等)。volume='g9' unit='U2' grade=9。", "BEGIN;\n"]

# 1) vocab
S.append("-- ===== junior_vocab (预期 29) =====")
for i, (w, ipa, p, cn, ph) in enumerate(VOCAB, 1):
    wid = f"jr-g9-U2-{i:04d}"
    S.append("INSERT INTO public.junior_vocab (id, grade, word, pos, phonetic, meaning_cn, phrase_en, freq_rank, word_id, stage, volume, unit, source_type, confidence) "
        f"SELECT gen_random_uuid(), 9, '{q(w)}', '{q(p)}', '{q(ipa)}', '{q(cn)}', '{q(ph)}', {i}, '{wid}', 'junior', 'g9', 'U2', 'wordlist', 'high' "
        f"WHERE NOT EXISTS (SELECT 1 FROM public.junior_vocab WHERE volume='g9' AND unit='U2' AND word='{q(w)}');")

# 2) grammar points + questions
S.append("\n-- ===== junior_grammar_points (预期 3) =====")
NUM = {"g9u2.01": "①", "g9u2.02": "②", "g9u2.03": "③"}
for pt in grammar["points"]:
    code = pt["code"]; title = NUM[code] + pt["point"]; cat = CAT[pt["category"]]
    S.append("INSERT INTO public.junior_grammar_points (id, category_id, code, title, cefr, grade, summary, sort_order, volume, unit) "
        f"SELECT gen_random_uuid(), '{cat}', '{code}', '{q(title)}', 'A2', 9, '对应:g9 U2', {int(code[-1])}, 'g9', 'U2' "
        f"WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_points WHERE code='{code}');")
S.append("\n-- ===== junior_grammar_questions (预期 60) =====")
so = {}
for qn in grammar["questions"]:
    code = qn["code"]; so[code] = so.get(code, 0) + 1; n = so[code]; diff = (n - 1) % 3 + 1
    opts = qn["options"]; letter = LET[qn["answer_index"]]
    S.append("INSERT INTO public.junior_grammar_questions (id, point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type, grammar_topic, distractors) "
        f"SELECT gen_random_uuid(), (SELECT id FROM public.junior_grammar_points WHERE code='{code}'), "
        f"'{q(qn['stem'])}','{q(opts[0])}','{q(opts[1])}','{q(opts[2])}','{q(opts[3])}','{letter}','{q(qn['explanation'])}',{diff},{n},'mcq','{code}','[]'::jsonb "
        f"WHERE NOT EXISTS (SELECT 1 FROM public.junior_grammar_questions x JOIN public.junior_grammar_points p ON x.point_id=p.id WHERE p.code='{code}' AND x.stem='{q(qn['stem'])}');")

# 3) reading (DELETE 旧 g9/U2 → 灌6)
S.append("\n-- ===== junior_reading (预期 6) =====")
S.append("DELETE FROM public.junior_reading WHERE volume='g9' AND unit='U2';")
for p in reading["passages"]:
    wc = len(p["body"].split()); qs = [{"q": x["stem"], "answer": LET[x["answer_index"]], "options": x["options"], "explanation": x["explanation"]} for x in p["questions"]]
    vn = VNOTES.get(p["code"], [])
    S.append("INSERT INTO public.junior_reading (id, grade, title, body, topic, word_count, questions, vocab_notes, difficulty, volume, unit) "
        f"VALUES (gen_random_uuid(), 9, '{q(p['title'])}', '{q(p['body'])}', '{q(p['genre'])}', {wc}, {jb(qs)}, {jb(vn)}, 3, 'g9', 'U2');")

# 4) cloze
S.append("\n-- ===== junior_cloze (预期 6) =====")
S.append("DELETE FROM public.junior_cloze WHERE volume='g9' AND unit='U2';")
for i, p in enumerate(cloze["passages"], 1):
    wc = len(p["text"].split()); qs = [{"q": str(x["blank"]), "answer": LET[x["answer_index"]], "options": x["options"], "explanation": x["explanation"]} for x in p["questions"]]
    S.append("INSERT INTO public.junior_cloze (id, grade, volume, unit, title, body, word_count, difficulty, questions, sort_order) "
        f"VALUES (gen_random_uuid(), 9, 'g9', 'U2', '{q(p['title'])}', '{q(p['text'])}', {wc}, 3, {jb(qs)}, {i});")

# 5) listening
S.append("\n-- ===== junior_listening_exercises (预期 6) =====")
S.append("DELETE FROM public.junior_listening_exercises WHERE volume='g9' AND unit='U2';")
for e in listening["exercises"]:
    tr = "\n".join(e["transcript"]); qs = [{"q": x["stem"], "type": "choice", "answer": LET[x["answer_index"]], "options": x["options"]} for x in e["questions"]]
    S.append("INSERT INTO public.junior_listening_exercises (id, grade, title, topic, difficulty, transcript, translation_cn, speaker, questions, key_vocab, kind, volume, unit) "
        f"VALUES (gen_random_uuid(), 9, '{q(e['title'])}', '九上 Unit2 听力·节日', 2, '{q(tr)}', '{q(e['translation_cn'])}', '{q(e['speaker'])}', {jb(qs)}, '[]'::jsonb, '{q(e['kind'])}', 'g9', 'U2');")

# 6) writing
S.append("\n-- ===== junior_writing_prompts (预期 1) =====")
w = writing
prompt_cn = "以 “My Favourite Festival(我最喜欢的节日)” 为题写约 80 词短文。要点:" + "；".join(w["points"])
high = [
 "My favourite festival is the Mid-Autumn Festival.（我最喜欢的节日是中秋节。）",
 "On that day, my family gets together.（那天全家团聚。）",
 "I think that the festival brings us closer.（我认为这个节日让我们更亲近。）",
 "What a wonderful festival it is!（多么美好的节日啊!）",
 "How happy we are on this day!（这一天我们多开心啊!）",
 "I believe that traditional festivals are important.（我相信传统节日很重要。）",
]
errs = [
 {"wrong":"What a delicious food!","correct":"What delicious food!","note":"food 不可数,What 后不加 a。"},
 {"wrong":"How a beautiful day!","correct":"What a beautiful day!","note":"day 是单数可数名词,用 What a + 名词。"},
 {"wrong":"I wonder that she will come.","correct":"I wonder if she will come.","note":"嵌入一般疑问句用 if/whether,不用 that。"},
]
tmpl = ("【段落结构】第1段:点题——My favourite festival is …，时间。\n第2段:做什么吃什么——On that day, we …。"
        "用 I think/believe that … 和 What…!/How…!。\n第3段:为什么喜欢 + 收尾。")
rubric = ("【15分制】A(13-15):要点全、正确用宾语从句+感叹句、语法基本无误;B(10-12):较全、少量错误;"
          "C(7-9):要点偏少、句型简单;D(0-6):不完整、错误多。")
S.append("INSERT INTO public.junior_writing_prompts (id, grade, topic, prompt_cn, prompt_en, requirements, min_words, max_words, sample_answer, scoring_rubric, difficulty, title_en, high_sentences, error_pairs, paragraph_template, volume, unit) "
    f"SELECT gen_random_uuid(), 9, '{q(w['topic'])}', '{q(prompt_cn)}', 'Write a short passage on the topic: \"My Favourite Festival\".', {jb(w['points'])}, 70, 100, '{q(w['model_essay'])}', '{q(rubric)}', 3, 'My Favourite Festival', {jb(high)}, {jb(errs)}, '{q(tmpl)}', 'g9', 'U2' "
    f"WHERE NOT EXISTS (SELECT 1 FROM public.junior_writing_prompts WHERE volume='g9' AND unit='U2' AND topic='{q(w['topic'])}');")

S.append("\nCOMMIT;\n")
S.append("-- ===== count 校验 =====")
S.append("SELECT 'vocab' k, count(*) v, 29 expect FROM public.junior_vocab WHERE volume='g9' AND unit='U2'")
S.append("UNION ALL SELECT 'grammar_points', count(*), 3 FROM public.junior_grammar_points WHERE volume='g9' AND unit='U2'")
S.append("UNION ALL SELECT 'grammar_questions', count(*), 60 FROM public.junior_grammar_questions x JOIN public.junior_grammar_points p ON x.point_id=p.id WHERE p.volume='g9' AND p.unit='U2'")
S.append("UNION ALL SELECT 'reading', count(*), 6 FROM public.junior_reading WHERE volume='g9' AND unit='U2'")
S.append("UNION ALL SELECT 'cloze', count(*), 6 FROM public.junior_cloze WHERE volume='g9' AND unit='U2'")
S.append("UNION ALL SELECT 'listening', count(*), 6 FROM public.junior_listening_exercises WHERE volume='g9' AND unit='U2'")
S.append("UNION ALL SELECT 'writing', count(*), 1 FROM public.junior_writing_prompts WHERE volume='g9' AND unit='U2';")

OUT = os.path.join(DIR, "g9-u2-load.sql")
with open(OUT, "w", encoding="utf-8") as f: f.write("\n".join(S))
print("SQL ->", OUT)
print("INSERT 行:", sum(1 for x in S if x.startswith("INSERT")), "| DELETE:", sum(1 for x in S if x.startswith("DELETE")))
print("vocab 写入 g9-u2-vocab.json:", len(VOCAB), "词(均带 phrase_en + freq_rank)")
