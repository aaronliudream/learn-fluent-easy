-- ============================================================
-- wy9A 九上词汇灌库(junior_vocab)· 237 条 / 6 单元
-- 源:外语教学与研究出版社_英语九年级上册定稿版 Words and expressions(课本 p138-143)
-- 提取件与四道闸对账见 REVIEWAA/wy9A/wy9A-wordlist-raw.md(Aaron 已审通过)
--
-- 沿用四册约定:star_level=3 / source_type='wordlist' / confidence='high' / stage='junior' /
--   theme·tip·meaning_en·example_*·phrase_en 留 NULL / source_page 填课本出处页 /
--   freq_rank 为单元内顺序号。
-- 九上新增:syllabus_level —— 3=课标三级词(课本加粗,进拼写考核)/ 2=非三级(认读卡)。
-- 短语(30 条)按四册惯例作为普通行进本表,pos 与 phonetic 留 NULL,不新建语块表。
-- 同词跨单元(post:U1 v.发布 / U4 n.岗位)保留为两行独立记录。
--
-- ⚠️ 前置:junior_vocab 需已有 syllabus_level 列。列不存在时本文件会在 INSERT 处报错
--    并整体回滚,不会留下半灌状态。
-- ============================================================

BEGIN;

-- 幂等:双限 DELETE(publisher + volume),绝不误伤其它册
DELETE FROM public.junior_vocab
 WHERE publisher = 'junior_fltrp' AND volume = 'wy9A';

INSERT INTO public.junior_vocab (publisher, stage, grade, volume, unit, word, pos, phonetic, meaning_cn, source_page, source_type, confidence, star_level, freq_rank, syllabus_level) VALUES
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'lady', 'n.', '/ˈleɪdi/', '女士,女子', 4, 'wordlist', 'high', 3, 1, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'gentleman', 'n.', '/ˈdʒentlmən/', '先生', 4, 'wordlist', 'high', 3, 2, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'high school', NULL, NULL, '高中', 4, 'wordlist', 'high', 3, 3, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'puppet', 'n.', '/ˈpʌpɪt/', '(牵线)木偶;布袋木偶,手偶', 4, 'wordlist', 'high', 3, 4, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'performer', 'n.', '/pəˈfɔːmə/', '表演者', 4, 'wordlist', 'high', 3, 5, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'finger', 'n.', '/ˈfɪŋɡə/', '手指', 4, 'wordlist', 'high', 3, 6, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'teenager', 'n.', '/ˈtiːneɪdʒə/', '青少年', 5, 'wordlist', 'high', 3, 7, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'old-fashioned', 'adj.', '/ˌəʊldˈfæʃənd/', '老式的,过时的', 5, 'wordlist', 'high', 3, 8, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'take part in', NULL, NULL, '参加,参与', 5, 'wordlist', 'high', 3, 9, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'performance', 'n.', '/pəˈfɔːməns/', '表演;演出', 5, 'wordlist', 'high', 3, 10, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'unless', 'conj.', '/ʌnˈles/', '除非……', 5, 'wordlist', 'high', 3, 11, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'video', 'n.', '/ˈvɪdiəʊ/', '视频', 5, 'wordlist', 'high', 3, 12, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'amaze', 'v.', '/əˈmeɪz/', '使大为惊奇', 5, 'wordlist', 'high', 3, 13, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'post', 'v.', '/pəʊst/', '发布', 5, 'wordlist', 'high', 3, 14, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'be flooded with', NULL, NULL, '大量收到', 5, 'wordlist', 'high', 3, 15, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'hold on', NULL, NULL, '坚持下去', 5, 'wordlist', 'high', 3, 16, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'blood', 'n.', '/blʌd/', '血,血液', 5, 'wordlist', 'high', 3, 17, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'interested', 'adj.', '/ˈɪntrəstɪd/', '感兴趣的', 5, 'wordlist', 'high', 3, 18, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'surprising', 'adj.', '/səˈpraɪzɪŋ/', '令人惊奇的,使人吃惊的,出人意料的', 5, 'wordlist', 'high', 3, 19, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'lost', 'adj.', '/lɒst/', '全神贯注的', 5, 'wordlist', 'high', 3, 20, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'viewer', 'n.', '/ˈvjuːə/', '观众', 5, 'wordlist', 'high', 3, 21, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'attention', 'n.', '/əˈtenʃən/', '注意', 5, 'wordlist', 'high', 3, 22, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'abroad', 'adv.', '/əˈbrɔːd/', '在国外', 5, 'wordlist', 'high', 3, 23, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'teenage', 'adj.', '/ˈtiːneɪdʒ/', '青少年的', 6, 'wordlist', 'high', 3, 24, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'folk arts', NULL, NULL, '民间艺术', 7, 'wordlist', 'high', 3, 25, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'programme', 'n.', '/ˈprəʊɡræm/', '计划,方案', 7, 'wordlist', 'high', 3, 26, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'volunteer', 'n.', '/ˌvɒlənˈtɪə/', '志愿者,义务工作者', 7, 'wordlist', 'high', 3, 27, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'group', 'n.', '/ɡruːp/', '组,群;团体', 7, 'wordlist', 'high', 3, 28, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'report', 'n.', '/rɪˈpɔːt/', '报道', 9, 'wordlist', 'high', 3, 29, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'fence', 'n.', '/fens/', '栅栏,围栏,篱笆', 10, 'wordlist', 'high', 3, 30, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'kill', 'v.', '/kɪl/', '弄死,杀死', 10, 'wordlist', 'high', 3, 31, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'scarecrow', 'n.', '/ˈskeəkrəʊ/', '稻草人', 11, 'wordlist', 'high', 3, 32, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'educator', 'n.', '/ˈedjukeɪtə/', '教育家', 12, 'wordlist', 'high', 3, 33, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'country', 'n.', '/ˈkʌntri/', '国,国家', 12, 'wordlist', 'high', 3, 34, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'nation', 'n.', '/ˈneɪʃən/', '国家', 12, 'wordlist', 'high', 3, 35, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'shoulder the responsibility', NULL, NULL, '承担责任', 12, 'wordlist', 'high', 3, 36, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'energy', 'n.', '/ˈenədʒi/', '力量,活力', 12, 'wordlist', 'high', 3, 37, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'youth', 'n.', '/juːθ/', '青年,年轻人', 13, 'wordlist', 'high', 3, 38, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'wealthy', 'adj.', '/ˈwelθi/', '富有的,富裕的', 13, 'wordlist', 'high', 3, 39, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'independent', 'adj.', '/ˌɪndəˈpendənt/', '独立的,自主的', 13, 'wordlist', 'high', 3, 40, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U1', 'excerpt', 'n.', '/ˈeksɜːpt/', '(书籍、诗歌、音乐等的)摘录,节录', 13, 'wordlist', 'high', 3, 41, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'tin', 'n.', '/tɪn/', '金属盒', 20, 'wordlist', 'high', 3, 1, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'spare', 'adj.', '/speə/', '备用的;多余的,闲置的', 20, 'wordlist', 'high', 3, 2, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'moneybox', 'n.', '/ˈmʌnibɒks/', '储钱盒,存钱罐', 20, 'wordlist', 'high', 3, 3, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'own', 'adj.', '/əʊn/', '自己的,属于自己的', 20, 'wordlist', 'high', 3, 4, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'size', 'n.', '/saɪz/', '大小,尺寸', 20, 'wordlist', 'high', 3, 5, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'better', 'adj.', '/ˈbetə/', '更好的,较好的', 20, 'wordlist', 'high', 3, 6, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'make sense', NULL, NULL, '解释得通;有道理', 20, 'wordlist', 'high', 3, 7, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'dreamland', 'n.', '/ˈdriːmlænd/', '梦境;理想世界', 20, 'wordlist', 'high', 3, 8, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'manage', 'v.', '/ˈmænɪdʒ/', '成功应付,得以对付过去', 21, 'wordlist', 'high', 3, 9, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'key', 'n.', '/kiː/', '关键', 21, 'wordlist', 'high', 3, 10, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'deal', 'v.', '/diːl/', '处理,应付,应对', 21, 'wordlist', 'high', 3, 11, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'deal with', NULL, NULL, '处理,应付,应对', 21, 'wordlist', 'high', 3, 12, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'laptop', 'n.', '/ˈlæptɒp/', '笔记本电脑,便携式电脑', 21, 'wordlist', 'high', 3, 13, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'budget', 'n.', '/ˈbʌdʒɪt/', '预算', 21, 'wordlist', 'high', 3, 14, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'exactly', 'adv.', '/ɪɡˈzæktli/', '正是,不错', 21, 'wordlist', 'high', 3, 15, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'pleasure', 'n.', '/ˈpleʒə/', '愉快,快乐;满足', 22, 'wordlist', 'high', 3, 16, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'end', 'n. / v.', '/end/', '最后部分,末尾 / 结束,停止', 22, 'wordlist', 'high', 3, 17, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'save', 'v.', '/seɪv/', '储蓄,存(钱)', 22, 'wordlist', 'high', 3, 18, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'bank', 'n.', '/bæŋk/', '银行', 23, 'wordlist', 'high', 3, 19, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'account', 'n.', '/əˈkaʊnt/', '账户', 23, 'wordlist', 'high', 3, 20, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'expensive', 'adj.', '/ɪkˈspensɪv/', '昂贵的,花钱多的', 23, 'wordlist', 'high', 3, 21, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'price', 'n.', '/praɪs/', '价格,价钱', 23, 'wordlist', 'high', 3, 22, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'savings', 'n.', '/ˈseɪvɪŋz/', '积蓄;(尤指)银行存款,储蓄金', 23, 'wordlist', 'high', 3, 23, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'make ends meet', NULL, NULL, '使收支仅能相抵,勉强维持生计', 24, 'wordlist', 'high', 3, 24, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'date', 'n.', '/deɪt/', '日期,日子', 24, 'wordlist', 'high', 3, 25, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'sale', 'n.', '/seɪl/', '出售,销售', 24, 'wordlist', 'high', 3, 26, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'on sale', NULL, NULL, '出售;廉价出售', 24, 'wordlist', 'high', 3, 27, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'T-shirt', 'n.', '/ˈtiː ʃɜːt/', 'T恤(衫)', 24, 'wordlist', 'high', 3, 28, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'website', 'n.', '/ˈwebsaɪt/', '网站', 26, 'wordlist', 'high', 3, 29, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'worth', 'adj.', '/wɜːθ/', '值……钱', 29, 'wordlist', 'high', 3, 30, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'dollar', 'n.', '/ˈdɒlə/', '美元', 29, 'wordlist', 'high', 3, 31, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'cent', 'n.', '/sent/', '分,美分', 29, 'wordlist', 'high', 3, 32, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'penny', 'n.', '/ˈpeni/', '一分钱硬币(美国或加拿大货币)', 29, 'wordlist', 'high', 3, 33, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'couple', 'n.', '/ˈkʌpəl/', '一对夫妇;一对情侣', 29, 'wordlist', 'high', 3, 34, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'flat', 'n.', '/flæt/', '一套住房,一套公寓房,单元房', 29, 'wordlist', 'high', 3, 35, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'treasure', 'n.', '/ˈtreʒə/', '珍宝,珍品', 29, 'wordlist', 'high', 3, 36, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'Christmas Eve', NULL, NULL, '圣诞前夕,平安夜', 29, 'wordlist', 'high', 3, 37, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'certainly', 'adv.', '/ˈsɜːtnli/', '当然', 29, 'wordlist', 'high', 3, 38, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'chain', 'n.', '/tʃeɪn/', '链子,链条', 29, 'wordlist', 'high', 3, 39, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U2', 'comb', 'n.', '/kəʊm/', '梳子', 29, 'wordlist', 'high', 3, 40, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'guest', 'n.', '/ɡest/', '(某一场合的)嘉宾,宾客', 36, 'wordlist', 'high', 3, 1, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'remains', 'n.', '/rɪˈmeɪnz/', '遗迹', 36, 'wordlist', 'high', 3, 2, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'lie', 'v.', '/laɪ/', '位于', 36, 'wordlist', 'high', 3, 3, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'northwest', 'n.', '/ˌnɔːθˈwest/', '西北,西北方', 36, 'wordlist', 'high', 3, 4, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'such', 'deter.', '/sʌtʃ/', '这样,如此,非常(用于强调)', 36, 'wordlist', 'high', 3, 5, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'archaeologist', 'n.', '/ˌɑːkiˈɒlədʒɪst/', '考古学家', 36, 'wordlist', 'high', 3, 6, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'giant', 'n.', '/ˈdʒaɪənt/', '巨人', 36, 'wordlist', 'high', 3, 7, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'the fruit of', NULL, NULL, '……的成果', 36, 'wordlist', 'high', 3, 8, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'centre', 'n.', '/ˈsentə/', '中心', 37, 'wordlist', 'high', 3, 9, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'period', 'n.', '/ˈpɪəriəd/', '时期', 37, 'wordlist', 'high', 3, 10, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'form', 'v.', '/fɔːm/', '形成', 37, 'wordlist', 'high', 3, 11, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'valuable', 'adj.', '/ˈvæljuəbəl/', '宝贵的,有价值的', 37, 'wordlist', 'high', 3, 12, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'smoothly', 'adv.', '/ˈsmuːðli/', '顺利地(进行)', 37, 'wordlist', 'high', 3, 13, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'luck', 'n.', '/lʌk/', '好运,幸运', 37, 'wordlist', 'high', 3, 14, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'bring out', NULL, NULL, '使显现', 37, 'wordlist', 'high', 3, 15, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'cartoon', 'n.', '/kɑːˈtuːn/', '卡通(片),动画片', 39, 'wordlist', 'high', 3, 16, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'silk', 'n.', '/sɪlk/', '丝绸', 39, 'wordlist', 'high', 3, 17, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'matchbox', 'n.', '/ˈmætʃbɒks/', '火柴盒', 39, 'wordlist', 'high', 3, 18, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'weight', 'n.', '/weɪt/', '(某物的)重量,分量', 42, 'wordlist', 'high', 3, 19, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'around', 'adv.', '/əˈraʊnd/', '大约', 42, 'wordlist', 'high', 3, 20, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'ton', 'n.', '/tʌn/', '英吨', 42, 'wordlist', 'high', 3, 21, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'mystery', 'n.', '/ˈmɪstəri/', '神秘事物,谜', 42, 'wordlist', 'high', 3, 22, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'coast', 'n.', '/kəʊst/', '海岸,海滨', 43, 'wordlist', 'high', 3, 23, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'pretty', 'adj.', '/ˈprɪti/', '漂亮的,好看的,标致的', 44, 'wordlist', 'high', 3, 24, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'hit', 'n.', '/hɪt/', '风行一时的事物', 44, 'wordlist', 'high', 3, 25, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'besides', 'prep.', '/bɪˈsaɪdz/', '除……之外(还)', 44, 'wordlist', 'high', 3, 26, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'creativity', 'n.', '/ˌkriːeɪˈtɪvəti/', '独创性,创造性,创造力', 44, 'wordlist', 'high', 3, 27, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'come to life', NULL, NULL, '变得生动', 44, 'wordlist', 'high', 3, 28, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'technology', 'n.', '/tekˈnɒlədʒi/', '科技', 45, 'wordlist', 'high', 3, 29, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'multimedia', 'adj.', '/ˌmʌltiˈmiːdiə/', '多媒体的', 45, 'wordlist', 'high', 3, 30, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'noisy', 'adj.', '/ˈnɔɪzi/', '嘈杂的', 45, 'wordlist', 'high', 3, 31, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'collection', 'n.', '/kəˈlekʃən/', '(一批)收藏品', 45, 'wordlist', 'high', 3, 32, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'fever', 'n.', '/ˈfiːvə/', '狂热,亢奋', 45, 'wordlist', 'high', 3, 33, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'pride', 'n.', '/praɪd/', '自豪,骄傲', 45, 'wordlist', 'high', 3, 34, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'take pride in', NULL, NULL, '对……感到自豪', 45, 'wordlist', 'high', 3, 35, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'design', 'n.', '/dɪˈzaɪn/', '装饰图案', 45, 'wordlist', 'high', 3, 36, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'bat', 'n.', '/bæt/', '蝙蝠', 45, 'wordlist', 'high', 3, 37, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'scarf', 'n.', '/skɑːf/', '围巾;披肩', 45, 'wordlist', 'high', 3, 38, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'fridge', 'n.', '/frɪdʒ/', '冰箱,冰柜', 45, 'wordlist', 'high', 3, 39, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'fridge magnet', NULL, NULL, '冰箱磁贴', 45, 'wordlist', 'high', 3, 40, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U3', 'mirror', 'v.', '/ˈmɪrə/', '反映', 45, 'wordlist', 'high', 3, 41, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'great-aunt', 'n.', '/ˌɡreɪtˈɑːnt/', '舅婆;姑婆;姨婆;叔祖母;伯祖母', 52, 'wordlist', 'high', 3, 1, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'person', 'n.', '/ˈpɜːsən/', '人', 52, 'wordlist', 'high', 3, 2, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'fighter', 'n.', '/ˈfaɪtə/', '斗士,奋斗者', 52, 'wordlist', 'high', 3, 3, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'later', 'adv.', '/ˈleɪtə/', '之后', 53, 'wordlist', 'high', 3, 4, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'footstep', 'n.', '/ˈfʊtstep/', '足迹', 53, 'wordlist', 'high', 3, 5, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'name... after', NULL, NULL, '以……的名字给……命名', 53, 'wordlist', 'high', 3, 6, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'realise', 'v.', '/ˈrɪəlaɪz/', '明白;认识到', 53, 'wordlist', 'high', 3, 7, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'could', 'v.', '/kəd/', '能,可以', 53, 'wordlist', 'high', 3, 8, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'leave... behind', NULL, NULL, '离开,丢下', 53, 'wordlist', 'high', 3, 9, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'gentle', 'adj.', '/ˈdʒentl/', '温和的,温柔的', 53, 'wordlist', 'high', 3, 10, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'pity', 'n.', '/ˈpɪti/', '可惜,遗憾', 53, 'wordlist', 'high', 3, 11, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'war', 'n.', '/wɔː/', '战争', 54, 'wordlist', 'high', 3, 12, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'battle', 'n.', '/ˈbætl/', '战斗,战役', 55, 'wordlist', 'high', 3, 13, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'shock', 'n.', '/ʃɒk/', '令人震惊的事', 55, 'wordlist', 'high', 3, 14, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'survivor', 'n.', '/səˈvaɪvə/', '生还者,幸存者', 55, 'wordlist', 'high', 3, 15, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'temperature', 'n.', '/ˈtemprətʃə/', '温度,气温', 55, 'wordlist', 'high', 3, 16, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'front line', NULL, NULL, '前线', 55, 'wordlist', 'high', 3, 17, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'lose', 'v.', '/luːz/', '丧失,失去', 55, 'wordlist', 'high', 3, 18, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'post', 'n.', '/pəʊst/', '岗位', 55, 'wordlist', 'high', 3, 19, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'deeply', 'adv.', '/ˈdiːpli/', '非常,很深地', 55, 'wordlist', 'high', 3, 20, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'presenter', 'n.', '/prɪˈzentə/', '主持人,主播', 57, 'wordlist', 'high', 3, 21, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'recommend', 'v.', '/ˌrekəˈmend/', '推荐', 57, 'wordlist', 'high', 3, 22, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'co-pilot', 'n.', '/ˈkəʊˌpaɪlət/', '(飞机)副驾驶员', 58, 'wordlist', 'high', 3, 23, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'engine', 'n.', '/ˈendʒɪn/', '发动机,引擎', 59, 'wordlist', 'high', 3, 24, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'state', 'v.', '/steɪt/', '陈述;说明', 59, 'wordlist', 'high', 3, 25, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'dreamer', 'n.', '/ˈdriːmə/', '做梦的人', 60, 'wordlist', 'high', 3, 26, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'pick', 'v.', '/pɪk/', '采,摘', 60, 'wordlist', 'high', 3, 27, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'countless', 'adj.', '/ˈkaʊntləs/', '无数的,数不尽的', 60, 'wordlist', 'high', 3, 28, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'thing', 'n.', '/θɪŋ/', '东西,物', 60, 'wordlist', 'high', 3, 29, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'experiment', 'n.', '/ɪkˈsperəmənt/', '实验', 61, 'wordlist', 'high', 3, 30, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'scientific research', NULL, NULL, '科学研究', 61, 'wordlist', 'high', 3, 31, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'type', 'n.', '/taɪp/', '类型,种类', 61, 'wordlist', 'high', 3, 32, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'poor', 'adj.', '/pɔː/', '差的,不佳的', 61, 'wordlist', 'high', 3, 33, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'soil', 'n.', '/sɔɪl/', '土壤,土地,泥土', 61, 'wordlist', 'high', 3, 34, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'feed', 'v.', '/fiːd/', '养活', 61, 'wordlist', 'high', 3, 35, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'pass away', NULL, NULL, '过世,离世', 61, 'wordlist', 'high', 3, 36, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U4', 'socialist', 'adj.', '/ˈsəʊʃəlɪst/', '社会主义的', 61, 'wordlist', 'high', 3, 37, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'human', 'adj.', '/ˈhjuːmən/', '人的,人类的', 68, 'wordlist', 'high', 3, 1, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'drop', 'v.', '/drɒp/', '降低', 68, 'wordlist', 'high', 3, 2, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'tourist', 'n.', '/ˈtʊərɪst/', '游客', 68, 'wordlist', 'high', 3, 3, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'benefit', 'v.', '/ˈbenəfɪt/', '受益,得益', 68, 'wordlist', 'high', 3, 4, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'wonder', 'n.', '/ˈwʌndə/', '奇迹,奇观', 69, 'wordlist', 'high', 3, 5, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'once again', NULL, NULL, '再一次', 69, 'wordlist', 'high', 3, 6, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'admire', 'v.', '/ədˈmaɪə/', '欣赏,观赏', 69, 'wordlist', 'high', 3, 7, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'throughout', 'prep.', '/θruːˈaʊt/', '在整个期间,自始至终', 69, 'wordlist', 'high', 3, 8, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'mark', 'n.', '/mɑːk/', '痕迹;标记', 69, 'wordlist', 'high', 3, 9, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'rapid', 'adj.', '/ˈræpɪd/', '快速的,迅速的', 69, 'wordlist', 'high', 3, 10, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'society', 'n.', '/səˈsaɪəti/', '社会', 69, 'wordlist', 'high', 3, 11, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'cancel', 'v.', '/ˈkænsəl/', '取消', 69, 'wordlist', 'high', 3, 12, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'start over', NULL, NULL, '重新开始,从头来过', 69, 'wordlist', 'high', 3, 13, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'get along with', NULL, NULL, '与……相处融洽', 69, 'wordlist', 'high', 3, 14, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'permit', 'v.', '/pəˈmɪt/', '允许', 69, 'wordlist', 'high', 3, 15, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'affect', 'v.', '/əˈfekt/', '影响', 71, 'wordlist', 'high', 3, 16, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'organisation', 'n.', '/ˌɔːɡənaɪˈzeɪʃən/', '组织,团体,机构', 71, 'wordlist', 'high', 3, 17, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'harm', 'v.', '/hɑːm/', '伤害', 71, 'wordlist', 'high', 3, 18, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'punish', 'v.', '/ˈpʌnɪʃ/', '处罚,惩罚', 71, 'wordlist', 'high', 3, 19, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'global warming', NULL, NULL, '全球变暖', 71, 'wordlist', 'high', 3, 20, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'rubbish', 'n.', '/ˈrʌbɪʃ/', '垃圾', 71, 'wordlist', 'high', 3, 21, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'overfish', 'v.', '/ˌəʊvəˈfɪʃ/', '过度捕捞', 71, 'wordlist', 'high', 3, 22, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'gas', 'n.', '/ɡæs/', '气,气体', 72, 'wordlist', 'high', 3, 23, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'greenhouse gases', NULL, NULL, '温室气体', 72, 'wordlist', 'high', 3, 24, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'square', 'adj.', '/skweə/', '平方的', 74, 'wordlist', 'high', 3, 25, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'logging', 'n.', '/ˈlɒɡɪŋ/', '伐木', 75, 'wordlist', 'high', 3, 26, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'solar panel', NULL, NULL, '太阳能电池板', 75, 'wordlist', 'high', 3, 27, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'microphone', 'n.', '/ˈmaɪkrəfəʊn/', '麦克风,话筒,传声器,扩音器', 75, 'wordlist', 'high', 3, 28, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'alarm', 'n.', '/əˈlɑːm/', '警报', 75, 'wordlist', 'high', 3, 29, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'guard', 'n.', '/ɡɑːd/', '警卫;门卫', 75, 'wordlist', 'high', 3, 30, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'foreigner', 'n.', '/ˈfɒrənə/', '外国人', 76, 'wordlist', 'high', 3, 31, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'logo', 'n.', '/ˈləʊɡəʊ/', '标识,标志,徽标', 76, 'wordlist', 'high', 3, 32, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'endangered', 'adj.', '/ɪnˈdeɪndʒəd/', '濒危的,濒临灭绝的', 76, 'wordlist', 'high', 3, 33, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'vulnerable', 'adj.', '/ˈvʌlnərəbəl/', '易受伤的', 76, 'wordlist', 'high', 3, 34, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'protection', 'n.', '/prəˈtekʃən/', '保护', 77, 'wordlist', 'high', 3, 35, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U5', 'farmland', 'n.', '/ˈfɑːmlænd/', '农田,耕地', 77, 'wordlist', 'high', 3, 36, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'consider', 'v.', '/kənˈsɪdə/', '认为', 84, 'wordlist', 'high', 3, 1, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'material', 'n.', '/məˈtɪəriəl/', '材料(如木材、塑料、金属等)', 84, 'wordlist', 'high', 3, 2, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'shape', 'v.', '/ʃeɪp/', '使成为某种形状,使成形', 84, 'wordlist', 'high', 3, 3, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'long-lasting', 'adj.', '/ˌlɒŋˈlɑːstɪŋ/', '耐用的', 84, 'wordlist', 'high', 3, 4, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'cheap', 'adj.', '/tʃiːp/', '便宜的,廉价的', 84, 'wordlist', 'high', 3, 5, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'environmental', 'adj.', '/ɪnˌvaɪrənˈmentl/', '自然环境的;生态环境的', 84, 'wordlist', 'high', 3, 6, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'toothbrush', 'n.', '/ˈtuːθbrʌʃ/', '牙刷', 85, 'wordlist', 'high', 3, 7, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'glove', 'n.', '/ɡlʌv/', '手套', 85, 'wordlist', 'high', 3, 8, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'former', 'adj.', '/ˈfɔːmə/', '以前的,从前的', 85, 'wordlist', 'high', 3, 9, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'wing', 'n.', '/wɪŋ/', '翅膀,翼', 85, 'wordlist', 'high', 3, 10, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'tie', 'v.', '/taɪ/', '系,扎,拴,捆', 85, 'wordlist', 'high', 3, 11, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'stuck', 'adj.', '/stʌk/', '卡住的,无法移动的,动不了的', 85, 'wordlist', 'high', 3, 12, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'bin', 'n.', '/bɪn/', '箱,柜;垃圾箱,垃圾桶', 85, 'wordlist', 'high', 3, 13, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'mistake... for...', NULL, NULL, '把……错当成', 85, 'wordlist', 'high', 3, 14, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'average', 'n.', '/ˈævərɪdʒ/', '平均数', 85, 'wordlist', 'high', 3, 15, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'on average', NULL, NULL, '平均来看', 85, 'wordlist', 'high', 3, 16, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'gram', 'n.', '/ɡræm/', '克(公制基本重量单位)', 85, 'wordlist', 'high', 3, 17, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'tiny', 'adj.', '/ˈtaɪni/', '极(微)小的', 85, 'wordlist', 'high', 3, 18, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'break down', NULL, NULL, '分解', 85, 'wordlist', 'high', 3, 19, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'trouble', 'n.', '/ˈtrʌbəl/', '麻烦,问题', 85, 'wordlist', 'high', 3, 20, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'wisely', 'adv.', '/ˈwaɪzli/', '明智地', 85, 'wordlist', 'high', 3, 21, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'highlight', 'v.', '/ˈhaɪlaɪt/', '突出,强调', 86, 'wordlist', 'high', 3, 22, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'pollute', 'v.', '/pəˈluːt/', '污染', 87, 'wordlist', 'high', 3, 23, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'electronic', 'adj.', '/ˌelɪkˈtrɒnɪk/', '电子的;电子器件的', 87, 'wordlist', 'high', 3, 24, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'truck', 'n.', '/trʌk/', '货车,卡车', 87, 'wordlist', 'high', 3, 25, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'emission', 'n.', '/ɪˈmɪʃən/', '排放物,散发物', 87, 'wordlist', 'high', 3, 26, 2),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'upcycle', 'v.', '/ˈʌpˌsaɪkəl/', '升级改造', 89, 'wordlist', 'high', 3, 27, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'reuse', 'v.', '/ˌriːˈjuːz/', '再使用,重复使用', 90, 'wordlist', 'high', 3, 28, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'fox', 'n.', '/fɒks/', '狐狸', 92, 'wordlist', 'high', 3, 29, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'loudly', 'adv.', '/ˈlaʊdli/', '响亮地,大声地', 92, 'wordlist', 'high', 3, 30, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'land', 'v.', '/lænd/', '掉落', 92, 'wordlist', 'high', 3, 31, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'village', 'n.', '/ˈvɪlɪdʒ/', '乡村,村庄', 93, 'wordlist', 'high', 3, 32, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'reporter', 'n.', '/rɪˈpɔːtə/', '记者', 93, 'wordlist', 'high', 3, 33, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'depth', 'n.', '/depθ/', '深,深度', 93, 'wordlist', 'high', 3, 34, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'suggest', 'v.', '/səˈdʒest/', '建议,提议', 93, 'wordlist', 'high', 3, 35, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'businessman', 'n.', '/ˈbɪznəsmən/', '商人;企业家', 93, 'wordlist', 'high', 3, 36, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'industrial', 'adj.', '/ɪnˈdʌstriəl/', '工业的', 93, 'wordlist', 'high', 3, 37, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'litter', 'n.', '/ˈlɪtə/', '垃圾,废弃物', 93, 'wordlist', 'high', 3, 38, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'peace', 'n.', '/piːs/', '和平;平静,安宁', 93, 'wordlist', 'high', 3, 39, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'business', 'n.', '/ˈbɪznəs/', '公司,企业,商业机构', 93, 'wordlist', 'high', 3, 40, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'building', 'n.', '/ˈbɪldɪŋ/', '建筑物;楼房,房子,楼宇', 93, 'wordlist', 'high', 3, 41, 3),
  ('junior_fltrp', 'junior', 9, 'wy9A', 'U6', 'imagination', 'n.', '/ɪˌmædʒəˈneɪʃən/', '幻想', 93, 'wordlist', 'high', 3, 42, 2);

DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.junior_vocab
   WHERE publisher = 'junior_fltrp' AND volume = 'wy9A';
  IF n <> 237 THEN RAISE EXCEPTION 'wy9A 词条 % 行,期望 237', n; END IF;

  SELECT count(*) INTO n FROM public.junior_vocab
   WHERE publisher = 'junior_fltrp' AND volume = 'wy9A' AND unit = 'U1';
  IF n <> 41 THEN RAISE EXCEPTION 'U1 % 条,期望 41', n; END IF;
  SELECT count(*) INTO n FROM public.junior_vocab
   WHERE publisher = 'junior_fltrp' AND volume = 'wy9A' AND unit = 'U2';
  IF n <> 40 THEN RAISE EXCEPTION 'U2 % 条,期望 40', n; END IF;
  SELECT count(*) INTO n FROM public.junior_vocab
   WHERE publisher = 'junior_fltrp' AND volume = 'wy9A' AND unit = 'U3';
  IF n <> 41 THEN RAISE EXCEPTION 'U3 % 条,期望 41', n; END IF;
  SELECT count(*) INTO n FROM public.junior_vocab
   WHERE publisher = 'junior_fltrp' AND volume = 'wy9A' AND unit = 'U4';
  IF n <> 37 THEN RAISE EXCEPTION 'U4 % 条,期望 37', n; END IF;
  SELECT count(*) INTO n FROM public.junior_vocab
   WHERE publisher = 'junior_fltrp' AND volume = 'wy9A' AND unit = 'U5';
  IF n <> 36 THEN RAISE EXCEPTION 'U5 % 条,期望 36', n; END IF;
  SELECT count(*) INTO n FROM public.junior_vocab
   WHERE publisher = 'junior_fltrp' AND volume = 'wy9A' AND unit = 'U6';
  IF n <> 42 THEN RAISE EXCEPTION 'U6 % 条,期望 42', n; END IF;

  SELECT count(*) INTO n FROM public.junior_vocab
   WHERE publisher = 'junior_fltrp' AND volume = 'wy9A' AND syllabus_level = 3;
  IF n <> 175 THEN RAISE EXCEPTION '三级词 % 条,期望 175', n; END IF;

  -- ★分流字段不许漏填★ 这列在别的册全 NULL 是常态,漏填不报错、只静默变成「未标注」
  SELECT count(*) INTO n FROM public.junior_vocab
   WHERE publisher = 'junior_fltrp' AND volume = 'wy9A' AND syllabus_level IS NULL;
  IF n <> 0 THEN RAISE EXCEPTION '有 % 行 syllabus_level 为 NULL,分流字段漏填', n; END IF;

  SELECT count(*) INTO n FROM public.junior_vocab
   WHERE publisher = 'junior_fltrp' AND volume = 'wy9A' AND pos IS NULL;
  IF n <> 30 THEN RAISE EXCEPTION '短语(pos IS NULL) % 条,期望 30', n; END IF;

  SELECT count(*) INTO n FROM public.junior_vocab
   WHERE publisher = 'junior_fltrp' AND volume = 'wy9A' AND word = 'post';
  IF n <> 2 THEN RAISE EXCEPTION 'post 应有 2 行(U1/U4),实得 %', n; END IF;
END $$;

COMMIT;

-- ============================================================
-- 跑完必看:期望 6 行;total 列 41·40·41·37·36·42,lv3+lv2=total,漏填全 0
-- ============================================================
SELECT unit,
       count(*) AS total,
       count(*) FILTER (WHERE syllabus_level = 3) AS lv3_spell,
       count(*) FILTER (WHERE syllabus_level = 2) AS lv2_read,
       count(*) FILTER (WHERE syllabus_level IS NULL) AS missing,
       count(*) FILTER (WHERE pos IS NULL) AS phrases
  FROM public.junior_vocab
 WHERE publisher = 'junior_fltrp' AND volume = 'wy9A'
 GROUP BY unit ORDER BY unit;
