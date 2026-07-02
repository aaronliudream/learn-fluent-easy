-- 美语课程 单元1 seed(生成器产出,勿手改;改 docs/american 源 md 后重跑 gen-unit1-seed.mjs)
-- 幂等:全部 ON CONFLICT。gap 未含:L1 词/关10、关6 小测、grammar_points.body_md。
BEGIN;
INSERT INTO public.american_lessons (id,unit_no,lesson_no,title_en,title_cn,grammar_focus,scene,prelisten_question) VALUES ('am1_l01',1,1,'Excuse me, is this your phone?','打扰一下，这是你的手机吗？','Is this...? 一般疑问句 · this · my/your · Excuse me','西雅图一家咖啡店','{"q":"Whose phone is it?","options":["选项：","Tyler''s","Emma''s","The waiter''s"],"answer_index":2}'::jsonb) ON CONFLICT (id) DO UPDATE SET title_en=EXCLUDED.title_en,title_cn=EXCLUDED.title_cn,grammar_focus=EXCLUDED.grammar_focus,scene=EXCLUDED.scene,prelisten_question=EXCLUDED.prelisten_question;
INSERT INTO public.american_lessons (id,unit_no,lesson_no,title_en,title_cn,grammar_focus,scene,prelisten_question) VALUES ('am1_l02',1,2,'Here''s my ticket','给您我的取车票','Here''s... / Here are... · 祈使句请求 · my/your + 名词 · I''m sorry（道歉）','酒店门口代客泊车（valet parking）','{"q":"What color is David''s car?","options":["Gray","Blue","Black"],"answer_index":1}'::jsonb) ON CONFLICT (id) DO UPDATE SET title_en=EXCLUDED.title_en,title_cn=EXCLUDED.title_cn,grammar_focus=EXCLUDED.grammar_focus,scene=EXCLUDED.scene,prelisten_question=EXCLUDED.prelisten_question;
INSERT INTO public.american_lessons (id,unit_no,lesson_no,title_en,title_cn,grammar_focus,scene,prelisten_question) VALUES ('am1_l03',1,3,'This is my friend Diego','这是我的朋友迭戈','冠词 a/an · 国籍表达 · This is + 人（介绍） · He''s/She''s','社区街区派对（block party）','{"q":"What is Diego''s job?","options":["A teacher","An engineer","A nurse"],"answer_index":1}'::jsonb) ON CONFLICT (id) DO UPDATE SET title_en=EXCLUDED.title_en,title_cn=EXCLUDED.title_cn,grammar_focus=EXCLUDED.grammar_focus,scene=EXCLUDED.scene,prelisten_question=EXCLUDED.prelisten_question;
INSERT INTO public.american_lessons (id,unit_no,lesson_no,title_en,title_cn,grammar_focus,scene,prelisten_question) VALUES ('am1_l04',1,4,'What''s your job?','你是做什么工作的？','Are you...? 问答 · What''s your job? · a/an + 职业 · 国籍问答','社区大学晚间英语班第一天','{"q":"What is Sofia''s job?","options":["A nurse","An electrician","A teacher"],"answer_index":0}'::jsonb) ON CONFLICT (id) DO UPDATE SET title_en=EXCLUDED.title_en,title_cn=EXCLUDED.title_cn,grammar_focus=EXCLUDED.grammar_focus,scene=EXCLUDED.scene,prelisten_question=EXCLUDED.prelisten_question;
INSERT INTO public.american_lessons (id,unit_no,lesson_no,title_en,title_cn,grammar_focus,scene,prelisten_question) VALUES ('am1_l05',1,5,'How are you today?','你今天好吗？','How are you? / How''s...? 问答 · 形容词作表语 · 美式寒暄告别语','清晨遛狗偶遇邻居','{"q":"How is Carlos''s puppy?","options":["Sick","Happy","Tired"],"answer_index":1}'::jsonb) ON CONFLICT (id) DO UPDATE SET title_en=EXCLUDED.title_en,title_cn=EXCLUDED.title_cn,grammar_focus=EXCLUDED.grammar_focus,scene=EXCLUDED.scene,prelisten_question=EXCLUDED.prelisten_question;
INSERT INTO public.american_lessons (id,unit_no,lesson_no,title_en,title_cn,grammar_focus,scene,prelisten_question) VALUES ('am1_l06',1,6,'Whose mug is this?','这是谁的马克杯？','Whose...? · 名词所有格 ''s · his/her · that','办公室茶水间认领马克杯','{"q":"Whose mug is it?","options":["Amanda''s","Tina''s","Chris''s"],"answer_index":2}'::jsonb) ON CONFLICT (id) DO UPDATE SET title_en=EXCLUDED.title_en,title_cn=EXCLUDED.title_cn,grammar_focus=EXCLUDED.grammar_focus,scene=EXCLUDED.scene,prelisten_question=EXCLUDED.prelisten_question;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l01',1,'Tyler','Excuse me, ma''am.','泰勒：打扰一下，女士。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l01',2,'Emma','Yes?','艾玛：什么事？') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l01',3,'Tyler','Is this your phone?','泰勒：这是你的手机吗？') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l01',4,'Tyler','It was on the chair.','泰勒：它刚才在椅子上。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l01',5,'Emma','Oh! Yes, it is.','艾玛：哦！是的，是我的。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l01',6,'Emma','It''s my phone.','艾玛：这是我的手机。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l01',7,'Tyler','Here you go.','泰勒：给你。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l01',8,'Emma','Thank you so much!','艾玛：太感谢了！') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l01',9,'Emma','You''re a lifesaver.','艾玛：你真是帮了大忙。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l01',10,'Tyler','No problem. Have a good one!','泰勒：不客气。祝你愉快！') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l02',1,'Marcus','Good evening, sir. Welcome to the Grandview Hotel.','马库斯：晚上好，先生。欢迎光临格兰景酒店。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l02',2,'David','Hi. Here''s my ticket.','大卫：你好。给您我的取车票。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l02',3,'Marcus','Thank you. One moment, please.','马库斯：谢谢。请稍等。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l02',4,'Marcus','Is this your car? The gray SUV?','马库斯：这是您的车吗？那辆灰色 SUV？') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l02',5,'David','No, it isn''t. My car is the blue one.','大卫：不，不是。我的车是蓝色那辆。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l02',6,'Marcus','Oh, I''m sorry, sir.','马库斯：哦，抱歉，先生。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l02',7,'Marcus','Here are your keys.','马库斯：给您钥匙。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l02',8,'David','Thanks. And this is your tip.','大卫：谢谢。这是给你的小费。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l02',9,'Marcus','Thank you, sir. Have a great night!','马库斯：谢谢您，先生。祝您夜晚愉快！') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l03',1,'Rachel','Hi, Ben! This is my friend Diego.','瑞秋：嗨，本！这是我的朋友迭戈。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l03',2,'Ben','Nice to meet you, Diego.','本：很高兴认识你，迭戈。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l03',3,'Diego','Nice to meet you too.','迭戈：我也很高兴认识你。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l03',4,'Ben','Are you new to the neighborhood?','本：你是新搬来这个社区的吗？') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l03',5,'Diego','Yes, I am. I''m from Mexico. I''m Mexican.','迭戈：是的。我来自墨西哥，我是墨西哥人。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l03',6,'Rachel','Diego is an engineer.','瑞秋：迭戈是一名工程师。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l03',7,'Ben','Oh, nice! I''m a teacher at the middle school.','本：真棒！我是中学的一名老师。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l03',8,'Diego','This is a great party.','迭戈：这个派对真不错。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l03',9,'Ben','Welcome to the block, Diego!','本：欢迎来到我们街区，迭戈！') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l04',1,'Kevin','Hi, I''m Kevin. Are you new here?','凯文：嗨，我是凯文。你是新来的吗？') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l04',2,'Sofia','Yes, I am. My name''s Sofia.','索菲亚：是的。我叫索菲亚。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l04',3,'Kevin','Are you American?','凯文：你是美国人吗？') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l04',4,'Sofia','No, I''m not. I''m Brazilian.','索菲亚：不，我是巴西人。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l04',5,'Sofia','Are you a student here too?','索菲亚：你也是这里的学生吗？') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l04',6,'Kevin','Yes, I am.','凯文：是的。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l04',7,'Kevin','What''s your job, Sofia?','凯文：索菲亚，你是做什么工作的？') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l04',8,'Sofia','I''m a nurse. What about you?','索菲亚：我是护士。你呢？') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l04',9,'Kevin','I''m an electrician.','凯文：我是电工。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l04',10,'Sofia','Cool! Nice to meet you, Kevin.','索菲亚：真棒！很高兴认识你，凯文。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l05',1,'Megan','Good morning, Carlos! How are you today?','梅根：早上好，卡洛斯！你今天好吗？') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l05',2,'Carlos','I''m great, thanks. And you?','卡洛斯：我很好，谢谢。你呢？') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l05',3,'Megan','I''m pretty good.','梅根：我挺好的。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l05',4,'Megan','How''s your wife?','梅根：你妻子好吗？') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l05',5,'Carlos','She''s fine, thank you.','卡洛斯：她很好，谢谢。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l05',6,'Megan','And how''s your new puppy?','梅根：你家新来的小狗怎么样？') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l05',7,'Carlos','He''s a handful! But he''s happy.','卡洛斯：他可真难带！不过他很开心。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l05',8,'Megan','Ha! See you later, Carlos.','梅根：哈哈！回头见，卡洛斯。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l05',9,'Carlos','Take care, Megan!','卡洛斯：保重，梅根！') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l06',1,'Tina','Whose coffee mug is this? It was in the sink.','蒂娜：这是谁的咖啡杯？刚才在水槽里。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l06',2,'Jake','Is it Amanda''s mug?','杰克：是阿曼达的杯子吗？') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l06',3,'Tina','No, her mug is pink. This one is black.','蒂娜：不是，她的杯子是粉色的。这只是黑色的。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l06',4,'Jake','Maybe it''s Chris''s mug. His mug is black.','杰克：也许是克里斯的。他的杯子是黑色的。') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l06',5,'Tina','Chris! Is this your mug?','蒂娜：克里斯！这是你的杯子吗？') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l06',6,'Chris','Oh, yes! That''s my mug. Thanks, Tina!','克里斯：哦，是的！那是我的杯子。谢谢，蒂娜！') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l06',7,'Tina','No problem. Please wash it, okay?','蒂娜：不客气。请把它洗了，好吗？') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_sentences (lesson_id,seq,speaker,text_en,text_cn) VALUES ('am1_l06',8,'Chris','My bad. Sorry!','克里斯：我的错。抱歉！') ON CONFLICT (lesson_id,seq) DO UPDATE SET speaker=EXCLUDED.speaker,text_en=EXCLUDED.text_en,text_cn=EXCLUDED.text_cn;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l01','excuse me','/ɪkˈskjuz mi/','短语','打扰一下；借过','Excuse me, where''s the restroom?') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l01','ma''am','/mæm/','n.','女士（对陌生女性的礼貌称呼）','Can I help you, ma''am?') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l01','phone','/foʊn/','n.','手机（= cell phone）','my phone / on the phone') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l01','chair','/tʃɛr/','n.','椅子','on the chair') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l01','my','/maɪ/','pron.','我的','my phone, my name') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l01','your','/jʊr/','pron.','你的','your phone, your job') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l01','Here you go.','/hɪr ju ɡoʊ/','短语','给你（递东西时说）','递咖啡、找零时都可用') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l01','lifesaver','/ˈlaɪfˌseɪvər/','n.','救星；帮大忙的人','You''re a lifesaver!') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l01','No problem.','/noʊ ˈprɑbləm/','短语','不客气（美语高频）','回应 Thank you') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l01','Have a good one!','—','短语','祝你愉快（美语告别语）','店员、路人常用') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l02','evening','/ˈivnɪŋ/','n.','傍晚','Good evening.') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l02','sir','/sɜr/','n.','先生（礼貌称呼）','Welcome, sir.') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l02','welcome','/ˈwɛlkəm/','v./int.','欢迎','Welcome to Seattle.') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l02','hotel','/hoʊˈtɛl/','n.','酒店','a big hotel') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l02','ticket','/ˈtɪkɪt/','n.','票；取车票','Here''s my ticket.') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l02','moment','/ˈmoʊmənt/','n.','片刻','One moment, please.') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l02','car','/kɑr/','n.','汽车','my car') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l02','gray','/ɡreɪ/','adj.','灰色的','a gray SUV') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l02','blue','/blu/','adj.','蓝色的','the blue one') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l02','keys','/kiz/','n.','钥匙（复数）','Here are your keys.') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l02','tip','/tɪp/','n.','小费','This is your tip.') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l02','SUV','/ˌɛs ju ˈvi/','n.','运动型多用途车','a gray SUV') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l03','friend','/frɛnd/','n.','朋友','my friend Diego') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l03','new','/nu/','adj.','新的；新来的','new to the neighborhood') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l03','neighborhood','/ˈneɪbərˌhʊd/','n.','社区；街坊','a quiet neighborhood') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l03','from','/frʌm/','prep.','来自','I''m from Mexico.') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l03','Mexico','/ˈmɛksɪˌkoʊ/','n.','墨西哥','from Mexico') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l03','Mexican','/ˈmɛksɪkən/','adj./n.','墨西哥的；墨西哥人','I''m Mexican.') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l03','American','/əˈmɛrɪkən/','adj./n.','美国的；美国人','She''s American.') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l03','engineer','/ˌɛndʒəˈnɪr/','n.','工程师','an engineer') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l03','teacher','/ˈtitʃər/','n.','教师','a teacher') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l03','middle school','/ˈmɪdl skul/','n.','中学（美制6–8年级）','at the middle school') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l03','party','/ˈpɑrti/','n.','派对','a great party') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l03','block','/blɑk/','n.','街区','block party 街区派对') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l04','name','/neɪm/','n.','名字','My name''s Sofia.') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l04','student','/ˈstudnt/','n.','学生','a student here') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l04','Brazilian','/brəˈzɪljən/','adj./n.','巴西的；巴西人','I''m Brazilian.') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l04','job','/dʒɑb/','n.','工作','What''s your job?') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l04','nurse','/nɜrs/','n.','护士','I''m a nurse.') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l04','electrician','/ɪˌlɛkˈtrɪʃən/','n.','电工','an electrician') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l04','plumber','/ˈplʌmər/','n.','水管工','a plumber') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l04','cashier','/kæˈʃɪr/','n.','收银员','a cashier') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l04','driver','/ˈdraɪvər/','n.','司机','an Uber driver') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l04','cool','/kul/','adj.','酷的；真棒（口语）','Cool!') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l04','What about you?','—','短语','你呢？','回问对方') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l05','morning','/ˈmɔrnɪŋ/','n.','早晨','Good morning.') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l05','today','/təˈdeɪ/','adv.','今天','How are you today?') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l05','great','/ɡreɪt/','adj.','极好的','I''m great.') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l05','pretty good','/ˈprɪti ɡʊd/','短语','挺好的','I''m pretty good.') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l05','wife','/waɪf/','n.','妻子','How''s your wife?') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l05','fine','/faɪn/','adj.','好的','She''s fine.') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l05','puppy','/ˈpʌpi/','n.','小狗','a new puppy') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l05','handful','/ˈhændfʊl/','n.','难对付的人/动物','He''s a handful!') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l05','happy','/ˈhæpi/','adj.','开心的','He''s happy.') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l05','See you later.','—','短语','回头见','告别用语') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l05','Take care.','—','短语','保重','告别用语') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l06','whose','/huz/','pron.','谁的','Whose mug is this?') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l06','mug','/mʌɡ/','n.','马克杯','a coffee mug') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l06','sink','/sɪŋk/','n.','水槽','in the sink') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l06','her','/hɜr/','pron.','她的','her mug') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l06','his','/hɪz/','pron.','他的','his mug') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l06','pink','/pɪŋk/','adj.','粉色的','a pink mug') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l06','black','/blæk/','adj.','黑色的','a black mug') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l06','maybe','/ˈmeɪbi/','adv.','也许','Maybe it''s his.') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l06','that','/ðæt/','pron.','那个','That''s my mug.') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l06','wash','/wɑʃ/','v.','洗','wash it') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_words (lesson_id,word,ipa,pos,meaning_cn,example) VALUES ('am1_l06','My bad.','—','短语','我的错（美语口语）','My bad. Sorry!') ON CONFLICT (lesson_id,word) DO UPDATE SET ipa=EXCLUDED.ipa,pos=EXCLUDED.pos,meaning_cn=EXCLUDED.meaning_cn,example=EXCLUDED.example;
INSERT INTO public.american_grammar_points (id,lesson_id,name,body_md) VALUES ('am1_l01_gp1','am1_l01','Is this...? 一般疑问句与 it 应答','（Grammar）

### 1. be 动词一般疑问句：Is this...?

陈述句变问句，把 **is 提到句首**：

| 陈述句 | 一般疑问句 | 肯定回答 | 否定回答 |
|---|---|---|---|
| This is your phone. | **Is this** your phone? | Yes, **it is**. | No, **it isn''t**. |
| This is my seat. | **Is this** my seat? | Yes, it is. | No, it isn''t. |

⚠️ 回答时用 **it** 代替 this：不说 ~~Yes, this is~~，要说 **Yes, it is**。

### 2. 指示代词 this

**this** 指"这个"——离说话人**近**的一个东西。

- **This** is my phone.（这是我的手机。）
- Is **this** your coffee?（这是你的咖啡吗？）

### 3. 物主代词 my / your

| 人称代词 | 物主代词 | 例子 |
|---|---|---|
| I 我 | **my** 我的 | **my** phone |
| you 你 | **your** 你的 | **your** phone |

物主代词后面**必须跟名词**：my phone ✓　~~This is my.~~ ✗

### 4. Excuse me 的用法（美语点睛 🇺🇸）

| 场合 | 说法 |
|---|---|
| 引起陌生人注意 | **Excuse me**, is this your phone? |
| 借过、穿过人群 | **Excuse me.**（英式常说 Sorry） |
| 没听清对方的话 | **Excuse me?** / **Sorry?**（英式常说 Pardon?） |
| 做错事道歉 | **I''m sorry.** |

---') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,body_md=EXCLUDED.body_md;
INSERT INTO public.american_grammar_points (id,lesson_id,name,body_md) VALUES ('am1_l01_gp2','am1_l01','物主代词 my / your','（Grammar）

### 1. be 动词一般疑问句：Is this...?

陈述句变问句，把 **is 提到句首**：

| 陈述句 | 一般疑问句 | 肯定回答 | 否定回答 |
|---|---|---|---|
| This is your phone. | **Is this** your phone? | Yes, **it is**. | No, **it isn''t**. |
| This is my seat. | **Is this** my seat? | Yes, it is. | No, it isn''t. |

⚠️ 回答时用 **it** 代替 this：不说 ~~Yes, this is~~，要说 **Yes, it is**。

### 2. 指示代词 this

**this** 指"这个"——离说话人**近**的一个东西。

- **This** is my phone.（这是我的手机。）
- Is **this** your coffee?（这是你的咖啡吗？）

### 3. 物主代词 my / your

| 人称代词 | 物主代词 | 例子 |
|---|---|---|
| I 我 | **my** 我的 | **my** phone |
| you 你 | **your** 你的 | **your** phone |

物主代词后面**必须跟名词**：my phone ✓　~~This is my.~~ ✗

### 4. Excuse me 的用法（美语点睛 🇺🇸）

| 场合 | 说法 |
|---|---|
| 引起陌生人注意 | **Excuse me**, is this your phone? |
| 借过、穿过人群 | **Excuse me.**（英式常说 Sorry） |
| 没听清对方的话 | **Excuse me?** / **Sorry?**（英式常说 Pardon?） |
| 做错事道歉 | **I''m sorry.** |

---') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,body_md=EXCLUDED.body_md;
INSERT INTO public.american_grammar_points (id,lesson_id,name,body_md) VALUES ('am1_l01_gp3','am1_l01','Excuse me 的用法','（Grammar）

### 1. be 动词一般疑问句：Is this...?

陈述句变问句，把 **is 提到句首**：

| 陈述句 | 一般疑问句 | 肯定回答 | 否定回答 |
|---|---|---|---|
| This is your phone. | **Is this** your phone? | Yes, **it is**. | No, **it isn''t**. |
| This is my seat. | **Is this** my seat? | Yes, it is. | No, it isn''t. |

⚠️ 回答时用 **it** 代替 this：不说 ~~Yes, this is~~，要说 **Yes, it is**。

### 2. 指示代词 this

**this** 指"这个"——离说话人**近**的一个东西。

- **This** is my phone.（这是我的手机。）
- Is **this** your coffee?（这是你的咖啡吗？）

### 3. 物主代词 my / your

| 人称代词 | 物主代词 | 例子 |
|---|---|---|
| I 我 | **my** 我的 | **my** phone |
| you 你 | **your** 你的 | **your** phone |

物主代词后面**必须跟名词**：my phone ✓　~~This is my.~~ ✗

### 4. Excuse me 的用法（美语点睛 🇺🇸）

| 场合 | 说法 |
|---|---|
| 引起陌生人注意 | **Excuse me**, is this your phone? |
| 借过、穿过人群 | **Excuse me.**（英式常说 Sorry） |
| 没听清对方的话 | **Excuse me?** / **Sorry?**（英式常说 Pardon?） |
| 做错事道歉 | **I''m sorry.** |

---') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,body_md=EXCLUDED.body_md;
INSERT INTO public.american_grammar_points (id,lesson_id,name,body_md) VALUES ('am1_l02_gp1','am1_l02','Here''s / Here are 单复数','**① Here''s... / Here are...（递东西时说）**

| 单数 | 复数 |
|---|---|
| **Here''s** my ticket.（= Here is） | **Here are** your keys. |
| **Here''s** your coffee. | **Here are** your bags. |

⚠️ 后面名词是复数时必须用 Here are，不说 ~~Here''s your keys~~。

**② 礼貌请求与回应**：One moment, please.（请稍等）→ 常用于服务场景。

**③ I''m sorry vs Excuse me（承接第1课）**
- 做错了事（认错车、踩到脚）→ **I''m sorry.**
- 引起注意、借过 → **Excuse me.**

**④ my/your + 名词 复习**：my ticket / your keys / your tip。') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,body_md=EXCLUDED.body_md;
INSERT INTO public.american_grammar_points (id,lesson_id,name,body_md) VALUES ('am1_l02_gp2','am1_l02','I''m sorry vs Excuse me','**① Here''s... / Here are...（递东西时说）**

| 单数 | 复数 |
|---|---|
| **Here''s** my ticket.（= Here is） | **Here are** your keys. |
| **Here''s** your coffee. | **Here are** your bags. |

⚠️ 后面名词是复数时必须用 Here are，不说 ~~Here''s your keys~~。

**② 礼貌请求与回应**：One moment, please.（请稍等）→ 常用于服务场景。

**③ I''m sorry vs Excuse me（承接第1课）**
- 做错了事（认错车、踩到脚）→ **I''m sorry.**
- 引起注意、借过 → **Excuse me.**

**④ my/your + 名词 复习**：my ticket / your keys / your tip。') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,body_md=EXCLUDED.body_md;
INSERT INTO public.american_grammar_points (id,lesson_id,name,body_md) VALUES ('am1_l02_gp3','am1_l02','服务场景礼貌用语','**① Here''s... / Here are...（递东西时说）**

| 单数 | 复数 |
|---|---|
| **Here''s** my ticket.（= Here is） | **Here are** your keys. |
| **Here''s** your coffee. | **Here are** your bags. |

⚠️ 后面名词是复数时必须用 Here are，不说 ~~Here''s your keys~~。

**② 礼貌请求与回应**：One moment, please.（请稍等）→ 常用于服务场景。

**③ I''m sorry vs Excuse me（承接第1课）**
- 做错了事（认错车、踩到脚）→ **I''m sorry.**
- 引起注意、借过 → **Excuse me.**

**④ my/your + 名词 复习**：my ticket / your keys / your tip。') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,body_md=EXCLUDED.body_md;
INSERT INTO public.american_grammar_points (id,lesson_id,name,body_md) VALUES ('am1_l03_gp1','am1_l03','冠词 a / an','**① 冠词 a/an（一个）**

| 规则 | 例子 |
|---|---|
| 辅音音素开头 → **a** | **a** teacher, **a** party, **a** friend |
| 元音音素开头 → **an** | **an** engineer, **an** apple, **an** umbrella |

⚠️ 看**发音**不看字母：a university（/j/ 音）、an hour（h 不发音）。

**② This is + 人（介绍某人）**：This is my friend Diego. → 回应：Nice to meet you.

**③ 国籍表达**：I''m from + 国家（Mexico / China / Korea）；I''m + 国籍形容词（Mexican / Chinese / Korean / American）。

**④ He''s / She''s**：Diego is an engineer. = **He''s** an engineer.') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,body_md=EXCLUDED.body_md;
INSERT INTO public.american_grammar_points (id,lesson_id,name,body_md) VALUES ('am1_l03_gp2','am1_l03','This is + 人（介绍）与国籍表达','**① 冠词 a/an（一个）**

| 规则 | 例子 |
|---|---|
| 辅音音素开头 → **a** | **a** teacher, **a** party, **a** friend |
| 元音音素开头 → **an** | **an** engineer, **an** apple, **an** umbrella |

⚠️ 看**发音**不看字母：a university（/j/ 音）、an hour（h 不发音）。

**② This is + 人（介绍某人）**：This is my friend Diego. → 回应：Nice to meet you.

**③ 国籍表达**：I''m from + 国家（Mexico / China / Korea）；I''m + 国籍形容词（Mexican / Chinese / Korean / American）。

**④ He''s / She''s**：Diego is an engineer. = **He''s** an engineer.') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,body_md=EXCLUDED.body_md;
INSERT INTO public.american_grammar_points (id,lesson_id,name,body_md) VALUES ('am1_l04_gp1','am1_l04','Are you...? 问答','**① Are you...? 一般疑问句（主语是 you）**

| 问 | 肯定答 | 否定答 |
|---|---|---|
| **Are you** new here? | Yes, **I am**. | No, **I''m not**. |
| **Are you** American? | Yes, I am. | No, I''m not. |
| **Are you** a nurse? | Yes, I am. | No, I''m not. |

⚠️ 肯定简答不缩写：Yes, I am. ✓　~~Yes, I''m.~~ ✗

**② What''s your job? 问职业**
- 答：I''m a/an + 职业（I''m a nurse. / I''m an electrician.）
- 回问：What about you? / How about you?

**③ a/an + 职业 复习**：a nurse / a plumber / an electrician / an Uber driver。') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,body_md=EXCLUDED.body_md;
INSERT INTO public.american_grammar_points (id,lesson_id,name,body_md) VALUES ('am1_l04_gp2','am1_l04','What''s your job? 与 a/an + 职业','**① Are you...? 一般疑问句（主语是 you）**

| 问 | 肯定答 | 否定答 |
|---|---|---|
| **Are you** new here? | Yes, **I am**. | No, **I''m not**. |
| **Are you** American? | Yes, I am. | No, I''m not. |
| **Are you** a nurse? | Yes, I am. | No, I''m not. |

⚠️ 肯定简答不缩写：Yes, I am. ✓　~~Yes, I''m.~~ ✗

**② What''s your job? 问职业**
- 答：I''m a/an + 职业（I''m a nurse. / I''m an electrician.）
- 回问：What about you? / How about you?

**③ a/an + 职业 复习**：a nurse / a plumber / an electrician / an Uber driver。') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,body_md=EXCLUDED.body_md;
INSERT INTO public.american_grammar_points (id,lesson_id,name,body_md) VALUES ('am1_l05_gp1','am1_l05','How are you? / How''s...? 问答与告别语','**① How are you? 及其变体**

| 问 | 常见回答（好→一般） |
|---|---|
| How are you (today)? | I''m great. / I''m pretty good. / I''m fine. / Not bad. |
| How''s your wife? | She''s fine. / She''s doing well. |
| How''s your puppy? | He''s happy. / He''s a handful! |

**② 形容词作表语（be + 形容词）**：主语 + be + adj.
- I''m **great**. / She''s **fine**. / He''s **happy**. / We''re **tired**.

⚠️ 不加 a/an：~~I''m a fine.~~ ✗（对比：I''m **a** nurse. 职业是名词才加）

**③ How''s = How is**：问单个人/物的状态。') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,body_md=EXCLUDED.body_md;
INSERT INTO public.american_grammar_points (id,lesson_id,name,body_md) VALUES ('am1_l05_gp2','am1_l05','be + 形容词作表语','**① How are you? 及其变体**

| 问 | 常见回答（好→一般） |
|---|---|
| How are you (today)? | I''m great. / I''m pretty good. / I''m fine. / Not bad. |
| How''s your wife? | She''s fine. / She''s doing well. |
| How''s your puppy? | He''s happy. / He''s a handful! |

**② 形容词作表语（be + 形容词）**：主语 + be + adj.
- I''m **great**. / She''s **fine**. / He''s **happy**. / We''re **tired**.

⚠️ 不加 a/an：~~I''m a fine.~~ ✗（对比：I''m **a** nurse. 职业是名词才加）

**③ How''s = How is**：问单个人/物的状态。') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,body_md=EXCLUDED.body_md;
INSERT INTO public.american_grammar_points (id,lesson_id,name,body_md) VALUES ('am1_l06_gp1','am1_l06','Whose...? 与名词所有格 ''s','**① Whose...? 问归属**
- **Whose** mug is this? → It''s **Chris''s** mug. / It''s **his**（第49课学名词性物主代词，此处答 his mug）.

**② 名词所有格 ''s**

| 规则 | 例子 |
|---|---|
| 人名 + **''s** | Amanda**''s** mug, Chris**''s** mug, Tina**''s** desk |

⚠️ 以 s 结尾的人名也加 ''s：Chris → Chris**''s**（美语主流写法）。

**③ 物主代词扩展：his / her**

| 人称 | 物主代词 | 例子 |
|---|---|---|
| he 他 | **his** 他的 | his mug |
| she 她 | **her** 她的 | her mug |

（累计已学：my / your / his / her）

**④ this vs that**：近处用 this（This one is black.），稍远或刚才提到的用 that（That''s my mug.）。') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,body_md=EXCLUDED.body_md;
INSERT INTO public.american_grammar_points (id,lesson_id,name,body_md) VALUES ('am1_l06_gp2','am1_l06','物主代词 his / her','**① Whose...? 问归属**
- **Whose** mug is this? → It''s **Chris''s** mug. / It''s **his**（第49课学名词性物主代词，此处答 his mug）.

**② 名词所有格 ''s**

| 规则 | 例子 |
|---|---|
| 人名 + **''s** | Amanda**''s** mug, Chris**''s** mug, Tina**''s** desk |

⚠️ 以 s 结尾的人名也加 ''s：Chris → Chris**''s**（美语主流写法）。

**③ 物主代词扩展：his / her**

| 人称 | 物主代词 | 例子 |
|---|---|---|
| he 他 | **his** 他的 | his mug |
| she 她 | **her** 她的 | her mug |

（累计已学：my / your / his / her）

**④ this vs that**：近处用 this（This one is black.），稍远或刚才提到的用 that（That''s my mug.）。') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,body_md=EXCLUDED.body_md;
INSERT INTO public.american_grammar_points (id,lesson_id,name,body_md) VALUES ('am1_l06_gp3','am1_l06','this vs that','**① Whose...? 问归属**
- **Whose** mug is this? → It''s **Chris''s** mug. / It''s **his**（第49课学名词性物主代词，此处答 his mug）.

**② 名词所有格 ''s**

| 规则 | 例子 |
|---|---|
| 人名 + **''s** | Amanda**''s** mug, Chris**''s** mug, Tina**''s** desk |

⚠️ 以 s 结尾的人名也加 ''s：Chris → Chris**''s**（美语主流写法）。

**③ 物主代词扩展：his / her**

| 人称 | 物主代词 | 例子 |
|---|---|---|
| he 他 | **his** 他的 | his mug |
| she 她 | **her** 她的 | her mug |

（累计已学：my / your / his / her）

**④ this vs that**：近处用 this（This one is black.），稍远或刚才提到的用 that（That''s my mug.）。') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,body_md=EXCLUDED.body_md;
INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn) VALUES ('am1_l01','cell phone','mobile phone',NULL) ON CONFLICT DO NOTHING;
INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn) VALUES ('am1_l01','No problem.','Not at all.',NULL) ON CONFLICT DO NOTHING;
INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn) VALUES ('am1_l01','Excuse me?','Pardon?',NULL) ON CONFLICT DO NOTHING;
INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn) VALUES ('am1_l01','Have a good one!','Cheers!',NULL) ON CONFLICT DO NOTHING;
INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn) VALUES ('am1_l01','ma''am','madam',NULL) ON CONFLICT DO NOTHING;
INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn) VALUES ('am1_l02','gray','grey','灰色') ON CONFLICT DO NOTHING;
INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn) VALUES ('am1_l02','valet parking','—（美国特色服务）','代客泊车') ON CONFLICT DO NOTHING;
INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn) VALUES ('am1_l02','tip 文化','小费非普遍','美国服务业小费 15–20%') ON CONFLICT DO NOTHING;
INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn) VALUES ('am1_l02','Have a great night!','Good night!','晚间告别') ON CONFLICT DO NOTHING;
INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn) VALUES ('am1_l03','block party','street party','街区派对（美国社区文化）') ON CONFLICT DO NOTHING;
INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn) VALUES ('am1_l03','middle school','secondary school','中学') ON CONFLICT DO NOTHING;
INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn) VALUES ('am1_l03','Nice to meet you.','How do you do?（正式老派）','初次见面问候') ON CONFLICT DO NOTHING;
INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn) VALUES ('am1_l03','neighborhood','neighbourhood','社区（拼写差异）') ON CONFLICT DO NOTHING;
INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn) VALUES ('am1_l04','What do you do?（更常用）','What''s your job?','问职业最自然的说法') ON CONFLICT DO NOTHING;
INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn) VALUES ('am1_l04','Cool! / Awesome!','Brilliant! / Lovely!','表示"真棒"') ON CONFLICT DO NOTHING;
INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn) VALUES ('am1_l04','community college','—（学制不同）','社区大学（美国特色）') ON CONFLICT DO NOTHING;
INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn) VALUES ('am1_l04','electrician / plumber','同拼写，发音不同','蓝领职业高频词') ON CONFLICT DO NOTHING;
INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn) VALUES ('am1_l05','pretty good','quite good','挺好的（pretty=很，非"漂亮"）') ON CONFLICT DO NOTHING;
INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn) VALUES ('am1_l05','What''s up? / How''s it going?','How do you do?','熟人间随意问候') ON CONFLICT DO NOTHING;
INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn) VALUES ('am1_l05','See you later. / Take care.','Cheerio!','告别') ON CONFLICT DO NOTHING;
INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn) VALUES ('am1_l05','I''m good.（口语高频）','I''m well.（更正式）','我很好') ON CONFLICT DO NOTHING;
INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn) VALUES ('am1_l06','My bad.','My mistake. / Sorry.','我的错（美语高频口语）') ON CONFLICT DO NOTHING;
INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn) VALUES ('am1_l06','break room','staff room','茶水间/休息室') ON CONFLICT DO NOTHING;
INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn) VALUES ('am1_l06','okay?','all right?','好吗（句尾确认）') ON CONFLICT DO NOTHING;
INSERT INTO public.american_amencontrast (lesson_id,us,uk,note_cn) VALUES ('am1_l06','mug 文化','—','美国办公室人手一只专属马克杯') ON CONFLICT DO NOTHING;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',5,'am1_l01_gp1','choice','{"stem":"___ this your umbrella? — Yes, it is.","options":["Be","Is","Are","Am"],"answer_index":1}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',5,'am1_l01_gp1','choice','{"stem":"Is this your seat? — Yes, ___ is.","options":["it","this","he","that''s"],"answer_index":0}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',5,'am1_l01_gp1','choice','{"stem":"Is this your coffee? — No, it ___.","options":["aren''t","not","is","isn''t"],"answer_index":3}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',5,'am1_l01_gp1','transform','{"stem":"This is your backpack.（变一般疑问句）","answer_text":"Is this your backpack?"}'::jsonb,4) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',5,'am1_l01_gp2','choice','{"stem":"This is ___ phone.（我的）","options":["mine","I","my","me"],"answer_index":2}'::jsonb,5) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',5,'am1_l01_gp2','choice','{"stem":"Is this ___ car?（你的）","options":["your","yours","my","you"],"answer_index":0}'::jsonb,6) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',5,'am1_l01_gp2','transform','{"stem":"用\"我的钱包\"组句：This is ___ ___.","answer_text":"This is my wallet."}'::jsonb,7) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',5,'am1_l01_gp3','choice','{"stem":"你想引起前面陌生人的注意，先说：","options":["No problem.","Excuse me.","I''m sorry.","Thank you."],"answer_index":1}'::jsonb,8) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',5,'am1_l01_gp3','choice','{"stem":"没听清对方的话，美语常说：","options":["Excuse me?","My bad.","Yes?","Here you go."],"answer_index":0}'::jsonb,9) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',6,NULL,'choice','{"stem":"美国人说\"手机\"最常用：","options":["hand phone","telephone set","mobile phone","cell phone"],"answer_index":3}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',6,NULL,'choice','{"stem":"回应 \"Thank you\"，美语最高频的是：","options":["Not at all.","Pardon?","No problem.","Cheers!"],"answer_index":2}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',6,NULL,'choice','{"stem":"没听清对方的话，美语说：","options":["Pardon?","My bad.","Here you go.","Excuse me?"],"answer_index":3}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',6,NULL,'choice','{"stem":"告别时美国人常说：","options":["Not at all.","Cheers!","Have a good one!","How do you do?"],"answer_index":2}'::jsonb,4) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',6,NULL,'choice','{"stem":"对陌生女士的礼貌称呼，美语用：","options":["lady","ma''am","mister","boy"],"answer_index":1}'::jsonb,5) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',7,NULL,'cloze','{"stem":"第 1 空","context":"TYLER: ___1___, ma''am.\nTYLER: Is this ___2___ phone? It was on the chair.\nEMMA: Oh! Yes, ___3___ is. It''s my phone.\nTYLER: ___4___ you go.","blank_no":1,"options":["I''m sorry","Excuse me","Thank you","Hello you"],"answer_index":1}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',7,NULL,'cloze','{"stem":"第 2 空","context":"TYLER: ___1___, ma''am.\nTYLER: Is this ___2___ phone? It was on the chair.\nEMMA: Oh! Yes, ___3___ is. It''s my phone.\nTYLER: ___4___ you go.","blank_no":2,"options":["my","you","your","I"],"answer_index":2}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',7,NULL,'cloze','{"stem":"第 3 空","context":"TYLER: ___1___, ma''am.\nTYLER: Is this ___2___ phone? It was on the chair.\nEMMA: Oh! Yes, ___3___ is. It''s my phone.\nTYLER: ___4___ you go.","blank_no":3,"options":["this","that","phone","it"],"answer_index":3}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',7,NULL,'cloze','{"stem":"第 4 空","context":"TYLER: ___1___, ma''am.\nTYLER: Is this ___2___ phone? It was on the chair.\nEMMA: Oh! Yes, ___3___ is. It''s my phone.\nTYLER: ___4___ you go.","blank_no":4,"options":["Here","There","Give","Take"],"answer_index":0}'::jsonb,4) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',8,NULL,'choice','{"stem":"Where was the phone?","options":["On the floor","On the chair","On the table","In Emma''s bag"],"answer_index":1}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',8,NULL,'choice','{"stem":"Whose phone is it?","options":["The store''s","Tyler''s","Nobody''s","Emma''s"],"answer_index":3}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',8,NULL,'choice','{"stem":"What does Emma say to thank Tyler?","options":["\"Excuse me.\"","\"Have a good one!\"","\"You''re a lifesaver.\"","\"No problem.\""],"answer_index":2}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',9,NULL,'scenario','{"stem":"有人说 \"Thank you so much!\"","answer_text":"No problem. / You''re welcome."}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',9,NULL,'scenario','{"stem":"递东西给别人","answer_text":"Here you go."}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',9,NULL,'scenario','{"stem":"想引起陌生人注意","answer_text":"Excuse me!"}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',10,NULL,'choice','{"stem":"___ this your backpack? — Yes, it is.","options":["Am","Are","Is"],"answer_index":2}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',10,NULL,'choice','{"stem":"Is this ___ coffee? — No, it isn''t.","options":["your","you","I"],"answer_index":0}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',10,NULL,'choice','{"stem":"Is this your phone? — Yes, ___ is.","options":["that","it","this"],"answer_index":1}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',10,NULL,'choice','{"stem":"___, is this seat taken?","options":["I''m sorry","Thank you","Excuse me"],"answer_index":2}'::jsonb,4) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',10,NULL,'transform','{"stem":"This is your umbrella.（变一般疑问句）","answer_text":"Is this your umbrella?"}'::jsonb,5) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',10,NULL,'transform','{"stem":"This is my wallet.（变一般疑问句；注意 my → your）","answer_text":"Is this your wallet?"}'::jsonb,6) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l01',10,NULL,'transform','{"stem":"This is your car.（变一般疑问句）","answer_text":"Is this your car?"}'::jsonb,7) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',5,'am1_l02_gp1','choice','{"stem":"___ your coffee, ma''am.","options":["Here are","This are","Here''s","Here am"],"answer_index":2}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',5,'am1_l02_gp1','choice','{"stem":"___ your gloves, sir.","options":["Here are","This is","It is","Here''s"],"answer_index":0}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',5,'am1_l02_gp1','choice','{"stem":"Here ___ my ticket.","options":["be","am","is","are"],"answer_index":2}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',5,'am1_l02_gp1','transform','{"stem":"Here''s your key.（key 改为 keys）","answer_text":"Here are your keys."}'::jsonb,4) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',5,'am1_l02_gp2','choice','{"stem":"你在停车场认错了车主，应说：","options":["Have a great night.","Excuse me?","One moment.","I''m sorry."],"answer_index":3}'::jsonb,5) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',5,'am1_l02_gp2','choice','{"stem":"你想请远处的服务员过来，先说：","options":["Excuse me.","Welcome.","Thanks.","I''m sorry."],"answer_index":0}'::jsonb,6) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',5,'am1_l02_gp3','choice','{"stem":"顾客递来取车票，你需要一点时间去取车：","options":["Yes, it is.","One moment, please.","I''m sorry.","Here you go."],"answer_index":1}'::jsonb,7) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',5,'am1_l02_gp3','choice','{"stem":"服务结束向客人道别：","options":["One moment!","Excuse me!","Yes?","Have a great night!"],"answer_index":3}'::jsonb,8) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',6,NULL,'choice','{"stem":"\"灰色\"的美式拼写是：","options":["gray","grei","grey","graey"],"answer_index":0}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',6,NULL,'choice','{"stem":"酒店门口帮客人停车取车的服务叫：","options":["park service","valet parking","self parking","bus parking"],"answer_index":1}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',6,NULL,'choice','{"stem":"美国服务业的小费通常给：","options":["50%以上","不用给","15–20%","1–2%"],"answer_index":2}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',6,NULL,'choice','{"stem":"晚间与客人道别说：","options":["Have a great night!","Excuse me?","One moment!","Good morning!"],"answer_index":0}'::jsonb,4) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',7,NULL,'cloze','{"stem":"第 1 空","context":"DAVID: Hi. ___1___ my ticket.\nMARCUS: Thank you. One ___2___, please. Is this ___3___ car?\nMARCUS: I''m ___4___, sir. Here ___5___ your keys.","blank_no":1,"options":["Here''s","Here are","This are","You''re"],"answer_index":0}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',7,NULL,'cloze','{"stem":"第 2 空","context":"DAVID: Hi. ___1___ my ticket.\nMARCUS: Thank you. One ___2___, please. Is this ___3___ car?\nMARCUS: I''m ___4___, sir. Here ___5___ your keys.","blank_no":2,"options":["minute time","moment","clock","watch"],"answer_index":1}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',7,NULL,'cloze','{"stem":"第 3 空","context":"DAVID: Hi. ___1___ my ticket.\nMARCUS: Thank you. One ___2___, please. Is this ___3___ car?\nMARCUS: I''m ___4___, sir. Here ___5___ your keys.","blank_no":3,"options":["my","you","your","it"],"answer_index":2}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',7,NULL,'cloze','{"stem":"第 4 空","context":"DAVID: Hi. ___1___ my ticket.\nMARCUS: Thank you. One ___2___, please. Is this ___3___ car?\nMARCUS: I''m ___4___, sir. Here ___5___ your keys.","blank_no":4,"options":["excuse me","sorry","welcome","thank"],"answer_index":1}'::jsonb,4) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',7,NULL,'cloze','{"stem":"第 5 空","context":"DAVID: Hi. ___1___ my ticket.\nMARCUS: Thank you. One ___2___, please. Is this ___3___ car?\nMARCUS: I''m ___4___, sir. Here ___5___ your keys.","blank_no":5,"options":["is","am","be","are"],"answer_index":3}'::jsonb,5) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',8,NULL,'choice','{"stem":"Where is David?","options":["At a coffee shop","At a school","At an airport","At a hotel"],"answer_index":3}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',8,NULL,'choice','{"stem":"Is the gray SUV David''s car?","options":["Yes, it is.","Yes, it does.","No, it isn''t.","We don''t know."],"answer_index":2}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',8,NULL,'choice','{"stem":"What does David give Marcus at the end?","options":["A tip","His keys","His ticket","His phone"],"answer_index":0}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',9,NULL,'scenario','{"stem":"店员递给你咖啡，你没听清他刚才的话","answer_text":"Excuse me?"}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',9,NULL,'scenario','{"stem":"你把文件递给同事","answer_text":"Here''s the file. / Here you go."}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',9,NULL,'scenario','{"stem":"你不小心拿错了别人的伞","answer_text":"I''m sorry!"}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',10,NULL,'choice','{"stem":"___ your keys, sir. — Thank you!","options":["Here''s","This is","They is","Here are"],"answer_index":3}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',10,NULL,'choice','{"stem":"___ my ticket. — One moment, please.","options":["Here''s","You are","Here are","Give"],"answer_index":0}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',10,NULL,'choice','{"stem":"Is this your car? — No, ___.","options":["it is","this isn''t","it isn''t","I''m not"],"answer_index":2}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',10,NULL,'choice','{"stem":"你认错了人，应该说：","options":["I''m sorry.","No problem.","Excuse me?","Here you go."],"answer_index":0}'::jsonb,4) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',10,NULL,'transform','{"stem":"This is your tip.（变一般疑问句）","answer_text":"Is this your tip?"}'::jsonb,5) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',10,NULL,'transform','{"stem":"Here''s your key.（key 改为 keys）","answer_text":"Here are your keys."}'::jsonb,6) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l02',10,NULL,'transform','{"stem":"My car is the blue one.（变一般疑问句，my","answer_text":"your）→ Is your car the blue one?"}'::jsonb,7) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',5,'am1_l03_gp1','choice','{"stem":"He''s ___ engineer.","options":["a","an","不填","the"],"answer_index":1}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',5,'am1_l03_gp1','choice','{"stem":"She''s ___ teacher.","options":["a","an","不填","the"],"answer_index":0}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',5,'am1_l03_gp1','choice','{"stem":"It''s ___ apple.","options":["the","不填","an","a"],"answer_index":2}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',5,'am1_l03_gp1','choice','{"stem":"This is ___ great party.","options":["a","不填","an","the"],"answer_index":0}'::jsonb,4) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',5,'am1_l03_gp2','choice','{"stem":"___ is my friend Maria.","options":["You","She","This","He"],"answer_index":2}'::jsonb,5) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',5,'am1_l03_gp2','choice','{"stem":"朋友介绍新同事给你后，你回应：","options":["Nice to meet you.","One moment.","Here you go.","I''m sorry."],"answer_index":0}'::jsonb,6) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',5,'am1_l03_gp2','choice','{"stem":"I''m from Mexico. I''m ___.","options":["Mexico","Mexican","engineer","America"],"answer_index":1}'::jsonb,7) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',5,'am1_l03_gp2','transform','{"stem":"He is a teacher.（职业改为 engineer）","answer_text":"He is an engineer."}'::jsonb,8) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',6,NULL,'choice','{"stem":"美国社区的邻里聚会叫：","options":["work party","block party","class party","tea party"],"answer_index":1}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',6,NULL,'choice','{"stem":"美制 6–8 年级的学校叫：","options":["secondary school","high school","primary school","middle school"],"answer_index":3}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',6,NULL,'choice','{"stem":"初次见面，美语最自然的问候是：","options":["Nice to meet you.","One moment.","Take care!","How do you do?"],"answer_index":0}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',6,NULL,'choice','{"stem":"\"社区\"的美式拼写是：","options":["neighborhod","nabourhood","neighborhood","neighbourhood"],"answer_index":2}'::jsonb,4) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',7,NULL,'cloze','{"stem":"第 1 空","context":"RACHEL: Hi, Ben! ___1___ is my friend Diego.\nBEN: Nice to ___2___ you, Diego. Are you new to the neighborhood?\nDIEGO: Yes, I am. I''m ___3___ Mexico.\nRACHEL: Diego is ___4___ engineer.\nBEN: Oh, nice! I''m ___5___ teacher.","blank_no":1,"options":["He","This","You","My"],"answer_index":1}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',7,NULL,'cloze','{"stem":"第 2 空","context":"RACHEL: Hi, Ben! ___1___ is my friend Diego.\nBEN: Nice to ___2___ you, Diego. Are you new to the neighborhood?\nDIEGO: Yes, I am. I''m ___3___ Mexico.\nRACHEL: Diego is ___4___ engineer.\nBEN: Oh, nice! I''m ___5___ teacher.","blank_no":2,"options":["meet","see you","look","nice"],"answer_index":0}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',7,NULL,'cloze','{"stem":"第 3 空","context":"RACHEL: Hi, Ben! ___1___ is my friend Diego.\nBEN: Nice to ___2___ you, Diego. Are you new to the neighborhood?\nDIEGO: Yes, I am. I''m ___3___ Mexico.\nRACHEL: Diego is ___4___ engineer.\nBEN: Oh, nice! I''m ___5___ teacher.","blank_no":3,"options":["at","in","from","of"],"answer_index":2}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',7,NULL,'cloze','{"stem":"第 4 空","context":"RACHEL: Hi, Ben! ___1___ is my friend Diego.\nBEN: Nice to ___2___ you, Diego. Are you new to the neighborhood?\nDIEGO: Yes, I am. I''m ___3___ Mexico.\nRACHEL: Diego is ___4___ engineer.\nBEN: Oh, nice! I''m ___5___ teacher.","blank_no":4,"options":["a","an","the","不填"],"answer_index":1}'::jsonb,4) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',7,NULL,'cloze','{"stem":"第 5 空","context":"RACHEL: Hi, Ben! ___1___ is my friend Diego.\nBEN: Nice to ___2___ you, Diego. Are you new to the neighborhood?\nDIEGO: Yes, I am. I''m ___3___ Mexico.\nRACHEL: Diego is ___4___ engineer.\nBEN: Oh, nice! I''m ___5___ teacher.","blank_no":5,"options":["an","the","不填","a"],"answer_index":3}'::jsonb,5) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',8,NULL,'choice','{"stem":"Who is new to the neighborhood?","options":["Rachel","Nobody","Ben","Diego"],"answer_index":3}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',8,NULL,'choice','{"stem":"Where is Diego from?","options":["Mexico","Canada","The U.S.","Spain"],"answer_index":0}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',8,NULL,'choice','{"stem":"What is Ben''s job?","options":["An engineer","A student","A teacher","A nurse"],"answer_index":2}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',9,NULL,'scenario','{"stem":"朋友把新同事介绍给你（\"This is my coworker Lisa.\"）","answer_text":"Nice to meet you, Lisa."}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',9,NULL,'scenario','{"stem":"你把你的朋友 Sam 介绍给妈妈","answer_text":"Mom, this is my friend Sam."}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',9,NULL,'scenario','{"stem":"有人问 \"Are you new here?\"，你确实是新来的","answer_text":"Yes, I am."}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',10,NULL,'choice','{"stem":"Diego is ___ engineer.","options":["an","不填","a","the"],"answer_index":0}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',10,NULL,'choice','{"stem":"I''m ___ Mexico.","options":["at","from","to","on"],"answer_index":1}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',10,NULL,'choice','{"stem":"___ is my friend Kate.","options":["This","He","She","You"],"answer_index":0}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',10,NULL,'choice','{"stem":"She''s ___ teacher.","options":["an","two","a","不填"],"answer_index":2}'::jsonb,4) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',10,NULL,'transform','{"stem":"He is a teacher.（主语换成 engineer 职业句）","answer_text":"He is an engineer."}'::jsonb,5) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',10,NULL,'transform','{"stem":"This is my friend.（变一般疑问句，my","answer_text":"your）→ Is this your friend?"}'::jsonb,6) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l03',10,NULL,'transform','{"stem":"I''m from Mexico.（改为\"我是墨西哥人\"）","answer_text":"I''m Mexican."}'::jsonb,7) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',5,'am1_l04_gp1','choice','{"stem":"___ you a nurse? — Yes, I am.","options":["Am","Is","Are","Do"],"answer_index":2}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',5,'am1_l04_gp1','choice','{"stem":"Are you new here? — Yes, ___.","options":["I''m","I am","it is","you are"],"answer_index":1}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',5,'am1_l04_gp1','choice','{"stem":"Are you American? — No, ___.","options":["you aren''t","I amn''t","I not","I''m not"],"answer_index":3}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',5,'am1_l04_gp1','transform','{"stem":"You are a student.（变一般疑问句）","answer_text":"Are you a student?"}'::jsonb,4) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',5,'am1_l04_gp2','choice','{"stem":"What''s your job? — ___","options":["Nice to meet you.","Yes, I am.","I''m a cashier.","I''m fine."],"answer_index":2}'::jsonb,5) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',5,'am1_l04_gp2','choice','{"stem":"He''s ___ electrician.","options":["不填","a","the","an"],"answer_index":3}'::jsonb,6) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',5,'am1_l04_gp2','choice','{"stem":"你想反问对方的职业：","options":["What about you?","Excuse me?","Here you go?","Are you?"],"answer_index":0}'::jsonb,7) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',5,'am1_l04_gp2','choice','{"stem":"She''s ___ driver.","options":["an","a","不填","two"],"answer_index":1}'::jsonb,8) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',6,NULL,'choice','{"stem":"美国人日常问职业更常说：","options":["What is your work name?","How is your job?","What do you do?","Who are you?"],"answer_index":2}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',6,NULL,'choice','{"stem":"美语表示\"真棒！\"常用：","options":["Awesome!","Lovely!","How do you do!","Brilliant!"],"answer_index":0}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',6,NULL,'choice','{"stem":"美国面向社区成人、提供两年制课程的学校叫：","options":["middle school","kindergarten","community college","driving school"],"answer_index":2}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',6,NULL,'choice','{"stem":"修电路的工人叫：","options":["electrician","cashier","driver","plumber"],"answer_index":0}'::jsonb,4) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',7,NULL,'cloze','{"stem":"第 1 空","context":"KEVIN: Hi, I''m Kevin. ___1___ you new here?\nSOFIA: Yes, I ___2___. My name''s Sofia.\nSOFIA: No, I''m ___3___. I''m Brazilian.\nKEVIN: What''s your ___4___?\nSOFIA: I''m ___5___ nurse.","blank_no":1,"options":["Is","Are","Am","Be"],"answer_index":1}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',7,NULL,'cloze','{"stem":"第 2 空","context":"KEVIN: Hi, I''m Kevin. ___1___ you new here?\nSOFIA: Yes, I ___2___. My name''s Sofia.\nSOFIA: No, I''m ___3___. I''m Brazilian.\nKEVIN: What''s your ___4___?\nSOFIA: I''m ___5___ nurse.","blank_no":2,"options":["am","is","are","not"],"answer_index":0}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',7,NULL,'cloze','{"stem":"第 3 空","context":"KEVIN: Hi, I''m Kevin. ___1___ you new here?\nSOFIA: Yes, I ___2___. My name''s Sofia.\nSOFIA: No, I''m ___3___. I''m Brazilian.\nKEVIN: What''s your ___4___?\nSOFIA: I''m ___5___ nurse.","blank_no":3,"options":["no","isn''t","not","am"],"answer_index":2}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',7,NULL,'cloze','{"stem":"第 4 空","context":"KEVIN: Hi, I''m Kevin. ___1___ you new here?\nSOFIA: Yes, I ___2___. My name''s Sofia.\nSOFIA: No, I''m ___3___. I''m Brazilian.\nKEVIN: What''s your ___4___?\nSOFIA: I''m ___5___ nurse.","blank_no":4,"options":["name","job","home","class"],"answer_index":1}'::jsonb,4) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',7,NULL,'cloze','{"stem":"第 5 空","context":"KEVIN: Hi, I''m Kevin. ___1___ you new here?\nSOFIA: Yes, I ___2___. My name''s Sofia.\nSOFIA: No, I''m ___3___. I''m Brazilian.\nKEVIN: What''s your ___4___?\nSOFIA: I''m ___5___ nurse.","blank_no":5,"options":["an","the","不填","a"],"answer_index":3}'::jsonb,5) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',8,NULL,'choice','{"stem":"Where are Kevin and Sofia?","options":["At a hotel","At an English class","At a party","At a hospital"],"answer_index":1}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',8,NULL,'choice','{"stem":"Is Sofia American?","options":["We don''t know.","Yes, she is.","Yes, he is.","No, she isn''t."],"answer_index":3}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',8,NULL,'choice','{"stem":"What is Kevin''s job?","options":["A student only","A nurse","An electrician","A teacher"],"answer_index":2}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',9,NULL,'scenario','{"stem":"同学问 \"Are you new here?\"，你不是新来的","answer_text":"No, I''m not."}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',9,NULL,'scenario','{"stem":"别人问你职业，你想反问对方","answer_text":"I''m a/an ___. What about you?"}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',9,NULL,'scenario','{"stem":"对方说自己是消防员（firefighter），你表示赞叹","answer_text":"Cool! / Awesome!"}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',10,NULL,'choice','{"stem":"___ you a student? — Yes, I am.","options":["Are","Do","Am","Is"],"answer_index":0}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',10,NULL,'choice','{"stem":"What''s your job? — ___","options":["I''m fine.","Nice to meet you.","I''m a cashier.","Yes, I am."],"answer_index":2}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',10,NULL,'choice','{"stem":"Are you Brazilian? — No, ___.","options":["I''m not","I not","you aren''t","I amn''t"],"answer_index":0}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',10,NULL,'choice','{"stem":"He''s ___ Uber driver.","options":["the","不填","a","an"],"answer_index":3}'::jsonb,4) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',10,NULL,'transform','{"stem":"You are a nurse.（变一般疑问句）","answer_text":"Are you a nurse?"}'::jsonb,5) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',10,NULL,'transform','{"stem":"I''m a plumber.（变否定句）","answer_text":"I''m not a plumber."}'::jsonb,6) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l04',10,NULL,'transform','{"stem":"Are you new here?（作肯定简答）","answer_text":"Yes, I am."}'::jsonb,7) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',5,'am1_l05_gp1','choice','{"stem":"How ___ you today?","options":["be","are","is","am"],"answer_index":1}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',5,'am1_l05_gp1','choice','{"stem":"How ___ your husband? — He''s fine.","options":["are","do","am","is"],"answer_index":3}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',5,'am1_l05_gp1','choice','{"stem":"How are you? — ___","options":["I''m pretty good.","I''m a nurse.","This is Tom.","Yes, I am."],"answer_index":0}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',5,'am1_l05_gp1','transform','{"stem":"She is fine.（变 How 疑问句）","answer_text":"How is she?"}'::jsonb,4) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',5,'am1_l05_gp1','choice','{"stem":"道别时叮嘱对方保重：","options":["Excuse me!","Yes, I am!","Take care!","One moment!"],"answer_index":2}'::jsonb,5) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',5,'am1_l05_gp2','choice','{"stem":"The puppy is ___.","options":["an happy","happy","a happy","happies"],"answer_index":1}'::jsonb,6) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',5,'am1_l05_gp2','choice','{"stem":"I''m ___.（疲惫的）","options":["tireds","a tired","tired","the tired"],"answer_index":2}'::jsonb,7) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',5,'am1_l05_gp2','choice','{"stem":"They are ___ today.（很棒）","options":["great","the great","a great","greats"],"answer_index":0}'::jsonb,8) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',6,NULL,'choice','{"stem":"pretty good 里的 pretty 意思是：","options":["漂亮的","少许","很、相当","差劲的"],"answer_index":2}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',6,NULL,'choice','{"stem":"熟人间随意打招呼，美语常说：","options":["How do you do?","Cheerio!","Not at all.","What''s up?"],"answer_index":3}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',6,NULL,'choice','{"stem":"下列告别语中属于美语常用的是：","options":["Not at all.","See you later.","Pardon?","Cheerio!"],"answer_index":1}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',6,NULL,'choice','{"stem":"回答 How are you?，美语口语最高频的是：","options":["I''m a good.","I''m well.","Me is fine.","I''m good."],"answer_index":3}'::jsonb,4) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',7,NULL,'cloze','{"stem":"第 1 空","context":"MEGAN: Good morning, Carlos! ___1___ are you today?\nCARLOS: I''m ___2___, thanks. And you?\nMEGAN: I''m pretty good. ___3___ your wife?\nCARLOS: ___4___ fine, thank you.\nCARLOS: ___5___ care!","blank_no":1,"options":["What","How","Who","Where"],"answer_index":1}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',7,NULL,'cloze','{"stem":"第 2 空","context":"MEGAN: Good morning, Carlos! ___1___ are you today?\nCARLOS: I''m ___2___, thanks. And you?\nMEGAN: I''m pretty good. ___3___ your wife?\nCARLOS: ___4___ fine, thank you.\nCARLOS: ___5___ care!","blank_no":2,"options":["great","nurse","new","a great"],"answer_index":0}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',7,NULL,'cloze','{"stem":"第 3 空","context":"MEGAN: Good morning, Carlos! ___1___ are you today?\nCARLOS: I''m ___2___, thanks. And you?\nMEGAN: I''m pretty good. ___3___ your wife?\nCARLOS: ___4___ fine, thank you.\nCARLOS: ___5___ care!","blank_no":3,"options":["How are","What''s","How''s","Who''s"],"answer_index":2}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',7,NULL,'cloze','{"stem":"第 4 空","context":"MEGAN: Good morning, Carlos! ___1___ are you today?\nCARLOS: I''m ___2___, thanks. And you?\nMEGAN: I''m pretty good. ___3___ your wife?\nCARLOS: ___4___ fine, thank you.\nCARLOS: ___5___ care!","blank_no":4,"options":["He''s","I''m","You''re","She''s"],"answer_index":3}'::jsonb,4) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',7,NULL,'cloze','{"stem":"第 5 空","context":"MEGAN: Good morning, Carlos! ___1___ are you today?\nCARLOS: I''m ___2___, thanks. And you?\nMEGAN: I''m pretty good. ___3___ your wife?\nCARLOS: ___4___ fine, thank you.\nCARLOS: ___5___ care!","blank_no":5,"options":["See","Take","Have","Be"],"answer_index":1}'::jsonb,5) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',8,NULL,'choice','{"stem":"When do Megan and Carlos meet?","options":["At night","In the evening","In the morning","At noon"],"answer_index":2}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',8,NULL,'choice','{"stem":"How is Carlos today?","options":["Tired","Sad","Sick","Great"],"answer_index":3}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',8,NULL,'choice','{"stem":"Who is \"a handful\"?","options":["The puppy","Megan","Carlos''s wife","Carlos"],"answer_index":0}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',9,NULL,'scenario','{"stem":"邻居早上问你 \"How are you today?\"","answer_text":"I''m great, thanks. And you? / Pretty good, how about you?"}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',9,NULL,'scenario','{"stem":"你想问同事的孩子近况","answer_text":"How''s your son? / How''s your daughter?"}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',9,NULL,'scenario','{"stem":"和朋友道别，叮嘱他保重","answer_text":"Take care! / See you later!"}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',10,NULL,'choice','{"stem":"How ___ your husband? — He''s fine.","options":["be","is","are","am"],"answer_index":1}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',10,NULL,'choice','{"stem":"How are you? — ___","options":["I''m a teacher.","Yes, I am.","Here you go.","I''m pretty good."],"answer_index":3}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',10,NULL,'choice','{"stem":"The puppy is ___.","options":["happy","a happy","happies","an happy"],"answer_index":0}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',10,NULL,'choice','{"stem":"道别时说：","options":["Excuse me!","Take care!","Nice to meet you.","Here you go."],"answer_index":1}'::jsonb,4) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',10,NULL,'transform','{"stem":"She is fine.（变疑问句问状态：她怎么样？）","answer_text":"How is she?"}'::jsonb,5) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',10,NULL,'transform','{"stem":"I''m tired.（主语换成 He）","answer_text":"He''s tired."}'::jsonb,6) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l05',10,NULL,'transform','{"stem":"How are you?（用 great 回答）","answer_text":"I''m great, thanks."}'::jsonb,7) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',5,'am1_l06_gp1','choice','{"stem":"___ backpack is this? — It''s Tyler''s.","options":["What","Which","Whose","Who"],"answer_index":2}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',5,'am1_l06_gp1','choice','{"stem":"This is ___ desk.（Emma 的）","options":["Emma''s","Emmas","Emma","the Emma"],"answer_index":0}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',5,'am1_l06_gp1','transform','{"stem":"This is Chris''s jacket.（变 whose 疑问句）","answer_text":"Whose jacket is this?"}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',5,'am1_l06_gp2','choice','{"stem":"He is my brother. ___ name is Alex.","options":["Her","His","My","Your"],"answer_index":1}'::jsonb,4) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',5,'am1_l06_gp2','choice','{"stem":"She is my sister. ___ mug is pink.","options":["His","Your","My","Her"],"answer_index":3}'::jsonb,5) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',5,'am1_l06_gp2','choice','{"stem":"Amanda is a nurse. This is ___ car.","options":["hers","her","she","his"],"answer_index":1}'::jsonb,6) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',5,'am1_l06_gp3','choice','{"stem":"（手里拿着杯子）___ is my mug.","options":["This","Whose","Her","That"],"answer_index":0}'::jsonb,7) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',5,'am1_l06_gp3','choice','{"stem":"（指着桌子那头的杯子）___ is Jake''s mug.","options":["Whose","That","His","This"],"answer_index":1}'::jsonb,8) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',6,NULL,'choice','{"stem":"承认自己的小错误，美语口语说：","options":["I''m bad.","My wrong.","Bad me.","My bad."],"answer_index":3}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',6,NULL,'choice','{"stem":"办公室的茶水间/休息室，美语叫：","options":["staff room","rest home","break room","tea house"],"answer_index":2}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',6,NULL,'choice','{"stem":"\"Please wash it, ___?\" 句尾补哪个词表示\"好吗\"：","options":["welcome","okay","sorry","yes"],"answer_index":1}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',6,NULL,'choice','{"stem":"美国办公室文化中，员工通常人手一只专属的：","options":["TV（电视）","bike（自行车）","pillow（枕头）","mug（马克杯）"],"answer_index":3}'::jsonb,4) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',7,NULL,'cloze','{"stem":"第 1 空","context":"TINA: ___1___ coffee mug is this?\nTINA: No, ___2___ mug is pink. This one is black.\nJAKE: Maybe it''s ___3___ mug. His mug is black.\nCHRIS: Oh, yes! ___4___ my mug. Thanks!\nCHRIS: ___5___. Sorry!","blank_no":1,"options":["Who","Whose","What","Which"],"answer_index":1}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',7,NULL,'cloze','{"stem":"第 2 空","context":"TINA: ___1___ coffee mug is this?\nTINA: No, ___2___ mug is pink. This one is black.\nJAKE: Maybe it''s ___3___ mug. His mug is black.\nCHRIS: Oh, yes! ___4___ my mug. Thanks!\nCHRIS: ___5___. Sorry!","blank_no":2,"options":["his","my","your","her"],"answer_index":3}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',7,NULL,'cloze','{"stem":"第 3 空","context":"TINA: ___1___ coffee mug is this?\nTINA: No, ___2___ mug is pink. This one is black.\nJAKE: Maybe it''s ___3___ mug. His mug is black.\nCHRIS: Oh, yes! ___4___ my mug. Thanks!\nCHRIS: ___5___. Sorry!","blank_no":3,"options":["Chris''s","Chris","Chrises","the Chris"],"answer_index":0}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',7,NULL,'cloze','{"stem":"第 4 空","context":"TINA: ___1___ coffee mug is this?\nTINA: No, ___2___ mug is pink. This one is black.\nJAKE: Maybe it''s ___3___ mug. His mug is black.\nCHRIS: Oh, yes! ___4___ my mug. Thanks!\nCHRIS: ___5___. Sorry!","blank_no":4,"options":["This are","That''s","Those","Whose"],"answer_index":1}'::jsonb,4) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',7,NULL,'cloze','{"stem":"第 5 空","context":"TINA: ___1___ coffee mug is this?\nTINA: No, ___2___ mug is pink. This one is black.\nJAKE: Maybe it''s ___3___ mug. His mug is black.\nCHRIS: Oh, yes! ___4___ my mug. Thanks!\nCHRIS: ___5___. Sorry!","blank_no":5,"options":["No problem","Here you go","My bad","Take care"],"answer_index":2}'::jsonb,5) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET payload=EXCLUDED.payload;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',8,NULL,'choice','{"stem":"Where was the mug?","options":["On the chair","On the desk","In a bag","In the sink"],"answer_index":3}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',8,NULL,'choice','{"stem":"What color is Amanda''s mug?","options":["Black","Pink","Gray","Blue"],"answer_index":1}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',8,NULL,'choice','{"stem":"What does Tina ask Chris to do?","options":["Wash the mug","Give her the mug","Buy a new mug","Drink coffee"],"answer_index":0}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',9,NULL,'scenario','{"stem":"你在会议室捡到一副眼镜，问大家","answer_text":"Whose glasses are these?（教学提示：眼镜是复数用 are these）"}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',9,NULL,'scenario','{"stem":"同事提醒你外卖拿错了，你认错","answer_text":"My bad. Sorry!"}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',9,NULL,'scenario','{"stem":"有人问 \"Is this your pen?\"，是你同事 Maria 的","answer_text":"No, it''s Maria''s pen."}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',10,NULL,'choice','{"stem":"___ car is that? — It''s Jake''s.","options":["Which","Who","What","Whose"],"answer_index":3}'::jsonb,1) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',10,NULL,'choice','{"stem":"This is ___ desk.（Amanda 的）","options":["the Amanda","Amandas","Amanda''s","Amanda"],"answer_index":2}'::jsonb,2) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',10,NULL,'choice','{"stem":"She is my sister. ___ name is Emily.","options":["Her","Your","My","His"],"answer_index":0}'::jsonb,3) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',10,NULL,'choice','{"stem":"Is this your phone? — Yes, ___ my phone.","options":["whose","that''s","it are","this''re"],"answer_index":1}'::jsonb,4) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',10,NULL,'transform','{"stem":"This is Chris''s mug.（变 whose 疑问句）","answer_text":"Whose mug is this?"}'::jsonb,5) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',10,NULL,'transform','{"stem":"This is her bag.（her 换成\"杰克的\"）","answer_text":"This is Jake''s bag."}'::jsonb,6) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
INSERT INTO public.american_questions (lesson_id,stage,grammar_point_id,qtype,payload,seq) VALUES ('am1_l06',10,NULL,'transform','{"stem":"That is his jacket.（变一般疑问句）","answer_text":"Is that his jacket?"}'::jsonb,7) ON CONFLICT (lesson_id,stage,seq) DO UPDATE SET qtype=EXCLUDED.qtype,payload=EXCLUDED.payload,grammar_point_id=EXCLUDED.grammar_point_id;
COMMIT;
