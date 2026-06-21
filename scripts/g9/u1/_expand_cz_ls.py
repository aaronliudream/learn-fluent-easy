# -*- coding: utf-8 -*-
"""U1 完形/听力按用户12篇蓝本重出(题目全原创):6完形×10空 + 6听力×5题。
   词汇限 U1+中考常用;同篇答案不重复;不改写阅读/不复用原听力。真正写入 json + 打印全文 + QC。"""
import json, os, sys, io, collections
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
DIR = r"C:\Projects\learn-fluent-easy\scripts\g9\u1"
V, U = "g9", "U1"
def dump(n, o):
    with open(os.path.join(DIR, n), "w", encoding="utf-8") as f: json.dump(o, f, ensure_ascii=False, indent=2)
def mkopts(correct, dis, idx):
    o = list(dis); o.insert(idx, correct); return o

# ===================== 完形 6 篇 × 10 空 =====================
# (correct, [d1,d2,d3], idx, expl)
CLOZE = [
 ("g9u1.cz1","Learning from English Shows",
  "Tony has found a fun way to (1)____ English: watching English TV shows. Every evening he watches one "
  "short (2)____ with subtitles. He does not just watch for fun. He listens to how the actors (3)____ "
  "the words and then copies them. When he hears a useful (4)____, he says it again and again until it "
  "sounds (5)____. Sometimes he covers the Chinese subtitles and tries to (6)____ what the actors are "
  "saying. At first it was (7)____, but slowly he could understand more. His listening and (8)____ have "
  "both got better. Now Tony can speak more (9)____ than before. He says learning English can be as fun "
  "as (10)____ a show.",
  [("learn",["teach","forget","draw"],0,"a way to learn 学习的方法"),
   ("show",["song","game","meal"],1,"a short show 一集节目"),
   ("pronounce",["write","count","draw"],2,"how actors pronounce 发音"),
   ("expression",["number","colour","size"],3,"useful expression 有用表达"),
   ("natural",["terrible","silent","empty"],0,"sound natural 听起来自然"),
   ("guess",["forget","lose","drop"],1,"guess what 猜测"),
   ("hard",["easy","free","lucky"],2,"at first hard 起初难"),
   ("pronunciation",["weather","money","health"],3,"listening and pronunciation 听力和发音"),
   ("easily",["slowly","quietly","sadly"],1,"speak more easily 更轻松地说"),
   ("watching",["watch","watched","watches"],2,"as fun as watching 和看节目一样有趣(动名词)")]),
 ("g9u1.cz2","My Mistake Notebook",
  "After every test, many students just look at their (1)____ and forget about them. But Linda does "
  "something (2)____. She keeps a mistake notebook. In it, she writes down every question she got "
  "(3)____. Next to it, she writes the (4)____ answer and the reason for her mistake. This helps her "
  "understand (5)____ she was wrong. Every weekend, she (6)____ her notebook and does the wrong "
  "questions (7)____. Slowly, she stops making the same mistakes. Her teacher says a mistake notebook "
  "is a very (8)____ tool. \"Your mistakes can become your best (9)____,\" she always says. Linda's "
  "grades have really (10)____ since she started.",
  [("scores",["friends","songs","games"],1,"look at scores 看分数"),
   ("different",["boring","easy","late"],0,"something different 不一样的事"),
   ("wrong",["right","easy","new"],2,"got wrong 做错的"),
   ("correct",["same","free","short"],3,"the correct answer 正确答案"),
   ("why",["who","when","where"],1,"understand why 明白为什么"),
   ("reviews",["forgets","loses","sells"],0,"review 复习"),
   ("again",["never","once","seldom"],2,"do them again 重做"),
   ("useful",["terrible","silly","empty"],3,"a useful tool 有用工具"),
   ("teachers",["enemies","games","secrets"],0,"best teachers 最好的老师"),
   ("improved",["fallen","stopped","ended"],1,"grades improved 成绩提高")]),
 ("g9u1.cz3","Little Bits of Time",
  "Peter is always busy, but he still learns many English words. His (1)____ is using little bits of "
  "time. He makes small word (2)____ and carries them in his (3)____. On the bus to school, he takes "
  "them (4)____ and reads a few. While he is (5)____ for his friends, he looks at one or two more. He "
  "even reviews them for a minute before he goes to (6)____. Each time is very (7)____, but the minutes "
  "add (8)____. In this way, Peter learns about ten new words every (9)____ without spending extra "
  "hours. He believes that time is like gold and should never be (10)____.",
  [("secret",["problem","mistake","rule"],2,"his secret 秘诀"),
   ("cards",["songs","games","books"],3,"word cards 单词卡"),
   ("pocket",["head","garden","river"],0,"in his pocket 口袋里"),
   ("out",["off","away","down"],1,"take them out 拿出来"),
   ("waiting",["sleeping","running","singing"],2,"waiting for 等待"),
   ("bed",["school","work","class"],3,"go to bed 睡觉"),
   ("short",["long","hard","free"],0,"very short 很短"),
   ("up",["down","off","in"],1,"add up 累积"),
   ("day",["year","week","month"],3,"every day 每天"),
   ("wasted",["saved","used","kept"],2,"never be wasted 不该浪费")]),
 ("g9u1.cz4","Speaking in Front of Others",
  "Maria used to be very (1)____. She was afraid to speak English in (2)____ of the class. Her face "
  "turned red whenever the teacher asked her a (3)____. One day, the teacher asked everyone to give a "
  "short (4)____ about their hobby. Maria was so (5)____ that she could not sleep. But she decided to "
  "(6)____ it a try. She practised her talk many times at (7)____ and read it (8)____ until she knew it "
  "well. When the big day came, she stood up and spoke (9)____. Everyone listened and clapped for her. "
  "After that, Maria was no longer afraid to (10)____ in public.",
  [("shy",["brave","tall","happy"],3,"used to be shy 曾很害羞"),
   ("front",["back","top","middle"],0,"in front of 在……前面"),
   ("question",["song","game","story"],1,"ask a question 提问"),
   ("talk",["song","game","meal"],2,"give a short talk 做简短发言"),
   ("nervous",["glad","free","lucky"],3,"so nervous 紧张得"),
   ("give",["take","make","get"],0,"give it a try 试一试"),
   ("home",["school","noon","night"],1,"at home 在家"),
   ("aloud",["quietly","slowly","alone"],2,"read aloud 朗读"),
   ("clearly",["badly","loudly","slowly"],0,"spoke clearly 说得清楚"),
   ("speak",["sleep","sing","run"],3,"speak in public 当众说")]),
 ("g9u1.cz5","Asking a Classmate for Help",
  "Jack was good at most subjects, but he had trouble with English (1)____. He could not understand how "
  "to use the object (2)____. His homework was often (3)____, and he felt worried. Instead of giving up, "
  "he decided to ask his (4)____ Lily for help. Lily was happy to (5)____ him. She explained the rule "
  "with simple (6)____ and made him a few practice (7)____. \"Don't worry,\" she said. \"Everyone needs "
  "help (8)____.\" With her help, Jack slowly began to (9)____ the grammar. His next test was much "
  "(10)____. Jack learned that asking a classmate for help is a smart thing to do.",
  [("grammar",["music","sports","art"],0,"English grammar 英语语法"),
   ("clause",["song","game","number"],1,"object clause 宾语从句"),
   ("wrong",["right","easy","free"],2,"often wrong 常做错"),
   ("classmate",["teacher","brother","neighbour"],3,"ask his classmate 问同学"),
   ("help",["stop","watch","leave"],0,"happy to help 乐意帮"),
   ("examples",["colours","songs","games"],1,"with examples 用例子"),
   ("questions",["pictures","meals","trips"],2,"practice questions 练习题"),
   ("sometimes",["never","seldom","hardly"],3,"needs help sometimes 有时需要帮助"),
   ("understand",["forget","lose","drop"],1,"understand the grammar 理解语法"),
   ("better",["worse","harder","smaller"],0,"much better 好多了")]),
 ("g9u1.cz6","Making a Study Plan",
  "Exams were coming, and Emma had a lot to (1)____. At first she felt worried because there was so much "
  "to do. Then she decided to make a study (2)____. She wrote down all the subjects and how much (3)____ "
  "she needed for each one. She put the most difficult subject (4)____. Every day, she studied for a "
  "short (5)____ and then took a break. She did not try to learn everything in one (6)____. Before bed, "
  "she quickly (7)____ what she had studied that day. Because of her plan, Emma felt (8)____ and ready. "
  "She did not need to (9)____ all night before the exam. A good plan, she found, makes study easier and "
  "(10)____.",
  [("review",["sing","draw","buy"],0,"a lot to review 很多要复习"),
   ("plan",["game","song","rule"],1,"a study plan 学习计划"),
   ("time",["money","food","water"],2,"how much time 多少时间"),
   ("first",["last","late","slow"],3,"the hardest first 最难的先做"),
   ("while",["year","week","month"],0,"a short while 一小会儿"),
   ("night",["day","week","hour"],1,"in one night 一晚之内"),
   ("checked",["lost","dropped","sold"],2,"checked what 检查所学"),
   ("calm",["angry","sad","tired"],3,"felt calm 感到平静"),
   ("study",["sleep","eat","play"],0,"study all night 通宵学"),
   ("better",["worse","harder","slower"],1,"easier and better 更轻松更好")]),
]
cloze_passages = []
for code, title, text, blanks in CLOZE:
    qs = []
    seen = set()
    for i, (correct, dis, idx, expl) in enumerate(blanks, 1):
        o = mkopts(correct, dis, idx)
        assert len(set(o)) == 4 and o[idx] == correct, f"{code} b{i} opts"
        if correct in seen: print(f"  ⚠️ {code} 答案重复: {correct}")
        seen.add(correct)
        qs.append({"qid": f"{code}.q{i}","volume": V,"unit": U,"code": code,"blank": i,
                   "options": o,"answer_index": idx,"answer_text": correct,"explanation": expl})
    cloze_passages.append({"code": code,"title": title,"text": text,"questions": qs})
dump("g9-u1-cloze.json", {"volume": V,"unit": U,"passages": cloze_passages})

# ===================== 听力 6 篇 × 5 题 =====================
def D(*a): return list(a)
LISTEN = [
 ("g9u1.ls1","九年级 U1 听力·对话 How to Practise Listening","dialogue","long","us_female",
  D("Anna: Ben, my listening is really weak. How can I practise it?",
    "Ben: I listen to short English songs and stories every day.",
    "Anna: Do you understand everything?",
    "Ben: No, not at first. But I listen to the same one a few times.",
    "Anna: That's a good idea. Anything else?",
    "Ben: Yes. I try to catch the key words, not every word.",
    "Anna: So I don't need to understand every word?",
    "Ben: Right. Just relax and listen a little every day. You'll get better."),
  "Anna说听力弱,问Ben怎么练。Ben:每天听英文歌和故事,起初听不懂就同一段多听几遍,只抓关键词而非每个词,放松、每天听一点就会进步。",
  [("What is Anna's problem?","Her listening is weak.",["Her reading is weak.","Her writing is weak.","Her speaking is weak."],0),
   ("How does Ben practise listening?","By listening to songs and stories every day.",["By reading books.","By writing diaries.","By playing games."],1),
   ("Does Ben understand everything at first?","No.",["Yes, all of it.","Yes, most of it.","He never listens."],2),
   ("What does Ben try to catch?","The key words.",["Every word.","The Chinese.","The music only."],3),
   ("What is Ben's advice?","Relax and listen a little every day.",["Stop listening.","Listen only before exams.","Translate every word."],0)]),
 ("g9u1.ls2","九年级 U1 听力·短文 Listening While Running","passage","short","us_male",
  D("Every morning, I go running in the park. But I don't just run. I also learn English. I put on my "
    "earphones and listen to short English news on my phone. At first, the news was too fast, and I "
    "could not follow it. But I did not stop. I listened to the same news again later and read the words. "
    "Now I can understand most of it. Running and listening together save me time, and they make my "
    "morning happy."),
  "“我”每天清晨在公园跑步,同时戴耳机听手机里的英文短新闻。起初语速太快跟不上,但没放弃,事后又听同一条并读文字,现在大部分能懂。边跑边听省时,清晨更愉快。",
  [("Where does the speaker run?","In the park.",["At school.","On the playground.","At home."],1),
   ("What does the speaker listen to?","Short English news.",["English songs.","Chinese stories.","Pop music."],2),
   ("What was the problem at first?","The news was too fast.",["The phone was broken.","The park was noisy.","The words were Chinese."],3),
   ("What did the speaker do to understand better?","Listened again and read the words.",["Gave up.","Asked a friend.","Ran faster."],0),
   ("Why does the speaker like this way?","It saves time.",["It is expensive.","It is boring.","It wastes time."],1)]),
 ("g9u1.ls3","九年级 U1 听力·对话 Guessing Words While Reading","dialogue","long","us_female",
  D("Tom: Lily, you read English so fast. What's your secret?",
    "Lily: When I meet a new word, I don't stop to look it up.",
    "Tom: Really? But how do you know the meaning?",
    "Lily: I guess it from the other words in the sentence.",
    "Tom: Doesn't that slow you down?",
    "Lily: No. Stopping for every word slows you down more.",
    "Tom: So I should just keep reading?",
    "Lily: Yes. You can check important words later. Guessing helps you read faster."),
  "Tom问Lily读得快的秘诀。Lily:遇生词不停下查词典,而是根据句中其他词猜义;每个词都停反而更慢;重要的词可稍后再查,猜词帮助读得更快。",
  [("What is Lily good at?","Reading English fast.",["Writing stories.","Singing songs.","Drawing pictures."],2),
   ("What does Lily do when she meets a new word?","She doesn't stop to look it up.",["She stops at once.","She skips the page.","She asks Tom."],3),
   ("How does Lily know the meaning?","She guesses from the sentence.",["She uses a phone.","She asks the teacher.","She reads Chinese."],0),
   ("What slows readers down more?","Stopping for every word.",["Reading in groups.","Guessing words.","Reading aloud."],1),
   ("When can Tom check important words?","Later.",["Never.","Before reading.","In a song."],2)]),
 ("g9u1.ls4","九年级 U1 听力·短文 Using a Learner's Dictionary","passage","short","us_male",
  D("When I learn a new word, I like to use a learner's dictionary. It is different from a normal "
    "dictionary. It uses simple English to explain each word, so I can understand the meaning easily. It "
    "also gives example sentences, which show me how to use the word. Sometimes one word has several "
    "meanings, and the dictionary shows them all. After I read the example, I make my own sentence with "
    "the word. A good dictionary is like a quiet teacher that is always ready to help."),
  "学新词时,“我”爱用学习型词典。它和普通词典不同:用简单英语解释,容易懂;还给例句示范用法;一词多义时全列出。读完例句后我用该词自己造句。好词典像一位随时帮忙的安静老师。",
  [("What does the speaker use to learn a new word?","A learner's dictionary.",["A phone game.","A storybook.","A song list."],3),
   ("How is it different from a normal dictionary?","It uses simple English to explain.",["It uses pictures only.","It has no words.","It is in Chinese."],0),
   ("What else does the dictionary give?","Example sentences.",["Free gifts.","Music.","Games."],1),
   ("What does the speaker do after reading the example?","Makes his own sentence.",["Closes the book.","Forgets the word.","Draws a picture."],2),
   ("What is a good dictionary compared to?","A quiet teacher.",["A loud radio.","A fast train.","A big game."],3)]),
 ("g9u1.ls5","九年级 U1 听力·对话 Starting a Study Group","dialogue","long","us_female",
  D("Lucy: Shall we start an English study group?",
    "Mark: Good idea! How many people should we have?",
    "Lucy: About four. Too many people will be noisy.",
    "Mark: OK. When and where shall we meet?",
    "Lucy: Every Sunday afternoon at my home.",
    "Mark: What will we do in the group?",
    "Lucy: We can read together, share word cards and test each other.",
    "Mark: Great! Studying with friends is more fun than studying alone."),
  "Lucy提议办英语学习小组。两人商定:约四人(太多会吵);每周日下午在Lucy家;活动是一起读、分享单词卡、互相测验。Mark觉得和朋友一起学比一个人学更有趣。",
  [("What do they want to start?","An English study group.",["A sports team.","A music band.","A book shop."],0),
   ("How many people does Lucy want?","About four.",["About ten.","About twenty.","Only two."],1),
   ("Why not too many people?","It will be noisy.",["It will be cheap.","It will be boring.","It will be easy."],2),
   ("When will they meet?","Every Sunday afternoon.",["Every morning.","On Monday night.","Every day."],3),
   ("What does Mark think about studying with friends?","It is more fun than studying alone.",["It is harder.","It is boring.","It wastes time."],0)]),
 ("g9u1.ls6","九年级 U1 听力·短文 Getting Ready Before Class","passage","short","us_female",
  D("Many students only study after class, but I also get ready before class. The night before, I read "
    "the new lesson in my textbook. I look at the new words and mark the parts I don't understand. Then, "
    "in class, I listen more carefully to those difficult parts. Because I am ready, I can follow the "
    "teacher easily and answer more questions. Getting ready before class only takes ten minutes, but it "
    "makes the lesson much easier. I think it is one of the best study habits."),
  "许多同学只在课后学,而“我”也在课前预习:前一晚读课本新课,看生词、标出不懂的地方;上课时更专心听那些难点。因为有准备,能轻松跟上老师、多回答问题。预习每次只花十分钟,却让课变得简单,是最好的学习习惯之一。",
  [("What does the speaker do that many students don't?","Get ready before class.",["Sleep in class.","Skip homework.","Eat in class."],1),
   ("When does the speaker read the new lesson?","The night before.",["After the exam.","During the holiday.","In the morning only."],3),
   ("What does the speaker mark?","The parts he doesn't understand.",["The easy parts.","The pictures.","The page numbers."],2),
   ("What is the result in class?","He can follow the teacher easily.",["He feels sleepy.","He is always late.","He cannot hear."],0),
   ("How long does getting ready take?","Ten minutes.",["Two hours.","A whole day.","One minute."],1)]),
]
exercises = []
for code, title, typ, kind, spk, transcript, trcn, qs in LISTEN:
    qlist = []
    for i, item in enumerate(qs, 1):
        stem, correct, dis, idx = item
        o = mkopts(correct, dis, idx)
        assert len(set(o)) == 4 and o[idx] == correct, f"{code} q{i} opts"
        qlist.append({"qid": f"{code}.q{i}","volume": V,"unit": U,"code": code,"stem": stem,
                      "options": o,"answer_index": idx,"answer_text": correct})
    exercises.append({"code": code,"title": title,"type": typ,"kind": kind,"speaker": spk,
                      "transcript": transcript,"translation_cn": trcn,"questions": qlist})
dump("g9-u1-listening.json", {"volume": V,"unit": U,"exercises": exercises})

# finaltest 引用更新
ft = {"volume": V,"unit": U,"code": "g9u1.final","title": "Unit 1 单元通关",
      "note": "运行时 buildFinalQuiz 组卷:语法7(g9u1.01/02/03 DB)+听力3(内联)+词汇2。完形题携带原文。",
      "cloze_context": cloze_passages[0]["text"],
      "question_refs": ["g9u1.01.q1","g9u1.01.q12","g9u1.02.q2","g9u1.02.q10","g9u1.03.q5","g9u1.03.q16",
        "g9u1.rd1.q1","g9u1.rd3.q2","g9u1.rd5.q4",
        "g9u1.cz1.q2","g9u1.cz4.q4","g9u1.cz6.q1",
        "g9u1.ls1.q1","g9u1.ls4.q4","g9u1.ls6.q5"]}
dump("g9-u1-finaltest.json", ft)

# ===================== 全文打印 =====================
LET = "ABCD"
print("############### 完形 g9-u1-cloze.json 全文 ###############")
for p in cloze_passages:
    print(f"\n===== {p['code']} 《{p['title']}》({len(p['questions'])}空) =====")
    print(p['text'])
    for q in p['questions']:
        opts = "  ".join(f"{LET[j]}.{o}" for j, o in enumerate(q['options']))
        print(f"  ({q['blank']}) {opts}  →答案 {LET[q['answer_index']]}({q['answer_text']}) | {q['explanation']}")
print("\n\n############### 听力 g9-u1-listening.json 全文 ###############")
for e in exercises:
    print(f"\n===== {e['code']} 《{e['title']}》[{e['type']}/{e['kind']}/{e['speaker']}]({len(e['questions'])}题) =====")
    print("transcript:")
    for ln in e['transcript']: print("  " + ln)
    print("translation_cn: " + e['translation_cn'])
    for i, q in enumerate(e['questions'], 1):
        opts = "  ".join(f"{LET[j]}.{o}" for j, o in enumerate(q['options']))
        print(f"  Q{i} {q['stem']}\n     {opts}  →答案 {LET[q['answer_index']]}({q['answer_text']})")

# ===================== QC =====================
print("\n\n############### QC ###############")
cd = collections.Counter()
for p in cloze_passages:
    seqok = [q["blank"] for q in p["questions"]] == list(range(1, 11))
    dupans = len(set(q["answer_text"] for q in p["questions"])) != len(p["questions"])
    for q in p["questions"]: cd[q["answer_index"]] += 1
    print(f"  {p['code']} 10空 连续={'OK' if seqok else '✗'} 同篇答案重复={'有!' if dupans else '无'}")
print(f"  完形 {sum(len(p['questions']) for p in cloze_passages)}空 A/B/C/D={cd[0]}/{cd[1]}/{cd[2]}/{cd[3]}")
ld = collections.Counter()
for e in exercises:
    for q in e["questions"]: ld[q["answer_index"]] += 1
print(f"  听力 {sum(len(e['questions']) for e in exercises)}题 A/B/C/D={ld[0]}/{ld[1]}/{ld[2]}/{ld[3]}")
allq = [q for p in cloze_passages for q in p["questions"]] + [q for e in exercises for q in e["questions"]]
ids = [q["qid"] for q in allq]
bad = [q["qid"] for q in allq if len(set(q["options"]))!=4 or q["options"][q["answer_index"]]!=q["answer_text"]]
print(f"  qid去重 {len(set(ids))}/{len(ids)} | 选项/答案失败 {len(bad)} {bad}")
# 超纲词粗检(列出可能偏难的答案词,人工再核)
HARD = {"imitation","intonation","persistence","appreciate","fluently","subtitle","subtitles"}
hardhit = sorted({q["answer_text"] for q in allq if q["answer_text"].lower() in HARD})
print(f"  答案词超纲粗检命中: {hardhit if hardhit else '无'}")
