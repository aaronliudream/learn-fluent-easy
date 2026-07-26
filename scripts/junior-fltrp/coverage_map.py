#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
外研社四册·单元语法点【承载】自查(25 单元全量缺口地图)

★为什么需要这个★
两道时序门只查"有没有**超前**",不查"该有的**有没有**"。泛读若通篇一般现在时,
门永远报 0,但单元语法点可能一次都没出现。补审中已人工撞见四次:
  wy8A U2 延续性(since/for/How long/been-gone)、wy8A U4 使役省 to、
  wy7A U1 名词性物主代词、wy7A U2 do/does 否定疑问。
再往下查 wy7A U3-U6,发现**泛读几乎全空、承载全靠精读**(U5 将来时泛读 will=0)。
说明这是流水线的系统性问题,不是个别疏漏 —— 故做成常驻脚本,一次看全 25 单元。

★两级判定(关键)★
  CORE  = 该语法点的基本形式(有它才算"教到了")
  HARD  = 该点的**难点分支**(最易错、最该练的)
前四次缺口全部是 "CORE 有、HARD 无" —— 例如三单 -s 满篇都是,但否定疑问
(doesn't play / Does he play?)一处没有。所以两级必须分开报。

★判定基准★
  精读(difficulty=0)与泛读(difficulty=1)分开统计。精读通常承载充分,
  真问题在泛读。一个单元若"精读满、泛读空",就是典型缺口。

用法:
    python scripts/junior-fltrp/coverage_map.py                 # 全部四册
    python scripts/junior-fltrp/coverage_map.py wy7A            # 单册
    python scripts/junior-fltrp/coverage_map.py --detail wy7A U5  # 逐篇明细
退出码:0=无缺口,1=有缺口
"""
import os
import re
import sys
import glob

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from past_perfect_gate import split_stmts, parse_values  # noqa: E402

# ── 25 单元语法点:CORE(基本形式)/ HARD(难点分支)────────────────────
# 每项 = (显示名, 正则)。正则在正文上跑,大小写不敏感。
P = {
('wy7A', 'Starter'): ('综合基础(be/there be/冠词/复数)', [
    ('be 三形', r"\b(?:am|is|are)\b"),
    ('there be', r"\bthere\s+(?:is|are)\b"),
], [
    ('there are+复数', r"\bthere\s+are\b"),
    ('指示代词 this/that/these/those', r"\b(?:this|that|these|those)\b"),
    ('a/an 区分', r"\ban\s+[aeiou]"),
]),
('wy7A', 'U1'): ('人称代词和物主代词', [
    ('形容词性物主', r"\b(?:my|your|his|her|its|our|their)\s+\w+"),
    ('主格', r"\b(?:I|you|he|she|we|they)\b"),
], [
    ('名词性物主(mine/yours/hers…)', r"\b(?:mine|yours|hers|ours|theirs)\b"),
    ('宾格', r"\b(?:me|him|us|them)\b"),
]),
('wy7A', 'U2'): ('一般现在时', [
    ('三单 -s/-es', r"\b(?:he|she|it|[A-Z][a-z]+|everyone|everybody)\s+\w+(?:s|es)\b"),
], [
    ('三单否定 doesn\'t', r"\b(?:does\s+not|doesn't)\b"),
    ('三单疑问 Does…?', r"\bdoes\s+\w+\s+\w+"),
    ('复数否定 don\'t', r"\b(?:do\s+not|don't)\b"),
]),
('wy7A', 'U3'): ('名词所有格', [
    ("单数 's", r"\b\w+'s\b"),
], [
    ("复数 s'", r"\b\w+s'(?!\w)"),
    ('of 结构(无生命)', r"\bthe\s+\w+\s+of\s+the\s+\w+"),
]),
('wy7A', 'U4'): ('频度副词', [
    ('五词任一', r"\b(?:always|usually|often|sometimes|never)\b"),
], [
    ('五词是否齐', r"__ALL_FIVE__"),
    ('be 动词后', r"\b(?:am|is|are)\s+(?:always|usually|often|sometimes|never)\b"),
    ('实义动词前', r"\b(?:always|usually|often|sometimes|never)\s+(?!am\b|is\b|are\b)[a-z]+\b"),
    ('How often 提问', r"\bhow\s+often\b"),
]),
('wy7A', 'U5'): ('一般将来时', [
    ('will + 原形', r"\bwill\s+\w+"),
    ('be going to', r"\b(?:am|is|are)\s+going\s+to\s+\w+"),
], [
    ("否定 won't / not going to", r"\b(?:will\s+not|won't|not\s+going\s+to)\b"),
    ('疑问 Will…? / Are you going to…?', r"(?:^|[.!?]\s+)(?:Will\b|Are\s+you\s+going\s+to\b)"),
]),
('wy7A', 'U6'): ('现在进行时', [
    ('be + -ing', r"\b(?:am|is|are)\s+(?:not\s+)?\w+ing\b"),
], [
    ('双写末辅音', r"\b\w*(?:bb|dd|gg|mm|nn|pp|rr|tt)ing\b"),
    ('去 e 加 ing', r"\b(?:mak|tak|writ|com|giv|danc|smil|us|liv|rid|driv|clos|mov|shar|hav)ing\b"),
    ('否定 be not doing', r"\b(?:am|is|are)\s+not\s+\w+ing\b"),
    ('疑问 Is/Are…doing?', r"(?:^|[.!?]\s+)(?:Is|Are|Am)\s+\w+\s+\w+ing"),
]),
('wy7B', 'U1'): ('一般过去时', [
    ('不规则过去式', r"\b(?:was|were|went|came|saw|got|took|made|said|began|ran|felt|heard|found|left|gave|told|knew|bought|thought|sat|stood|won|lost|met|ate|wrote|spoke|drew|grew|threw|chose|broke|spent|sent|built|held|kept|led|fell)\b"),
], [
    ('规则 -ed', r"\b\w{3,}ed\b"),
    ("否定 didn't", r"\b(?:did\s+not|didn't)\b"),
    ('疑问 Did…?', r"(?:^|[.!?]\s+)Did\s+\w+"),
]),
('wy7B', 'U2'): ('不定代词', [
    ('some/any/every/no + thing/one/body', r"\b(?:some|any|every|no)(?:thing|one|body)\b"),
], [
    ('作主语配单数谓语', r"\b(?:everyone|everybody|everything|someone|somebody|something|nobody|nothing|anyone|anything)\s+(?:is|was|has|does|\w+s)\b"),
    ('形容词后置', r"\b(?:something|anything|nothing|someone|anyone)\s+(?:strange|new|nice|good|special|important|else|fun|hard)\b"),
]),
('wy7B', 'U3'): ('系动词', [
    ('系动词 + 形容词', r"\b(?:look|looks|looked|sound|sounds|sounded|taste|tastes|tasted|smell|smells|smelled|feel|feels|felt|seem|seems|become|becomes|turn|turns|grow|grows|get|gets)\s+(?:very\s+|so\s+|really\s+)?[a-z]+\b"),
], [
    # 只收原形会漏掉过去式(`He **tasted** the soup twice`),补全时态形态
    ('系动词 vs 实义动词对照',
     r"\b(?:tastes?|tasted|smells?|smelled|smelt|feels?|felt|looks?|looked)\s+(?:the|a|an|my|his|her|our|their|some)\b"),
    ('系动词 + like', r"\b(?:looks?|sounds?|feels?|tastes?|smells?)\s+like\b"),
]),
('wy7B', 'U4'): ('祈使句', [
    ('肯定祈使', r"(?:^|[.!?]\s+|,\s+and\s+)(?:[A-Z][a-z]+)\s+(?:your|the|it|some|one|a)\b"),
], [
    ("否定 Don't", r"\bdon't\s+\w+"),
    ('Never', r"(?:^|[.!?]\s+)Never\s+\w+"),
    ('Please', r"\bplease\s+\w+"),
    ("Let's", r"\blet's\s+\w+"),
]),
('wy7B', 'U5'): ('比较级和最高级', [
    ('比较级 -er/more … than', r"\b(?:\w{3,}(?:ier|er)|more\s+\w+)\s+than\b"),
    ('最高级 the -est/most', r"\bthe\s+(?:\w{3,}est|most\s+\w+)\b"),
], [
    ('双写(bigger/hotter)', r"\b\w*(?:bb|dd|gg|mm|nn|pp|tt)(?:er|est)\b"),
    ('y→i(busier/happiest)', r"\b\w+i(?:er|est)\b"),
    ('不规则(better/best/worse)', r"\b(?:better|best|worse|worst|more|most)\b"),
]),
('wy7B', 'U6'): ('as…as 同级比较', [
    ('as + 原级 + as', r"\bas\s+\w+\s+as\b"),
], [
    ('否定 not as…as', r"\bnot\s+as\s+\w+\s+as\b"),
    ('not so…as', r"\bnot\s+so\s+\w+\s+as\b"),
]),
('wy8A', 'U1'): ('现在完成时(一)·经历与结果', [
    ('have/has + 过去分词', r"\b(?:have|has)\s+(?:never\s+|already\s+|just\s+|ever\s+)?\w+(?:ed|en|ne|me|d|t)\b"),
], [
    ('ever/never', r"\b(?:ever|never)\b"),
    ('already/just/yet', r"\b(?:already|just|yet)\b"),
    ('疑问 Have you ever…?', r"(?:^|[.!?]\s+)Have\s+you\s+ever\b"),
]),
('wy8A', 'U2'): ('现在完成时(二)·延续', [
    ('have/has + 过去分词', r"\b(?:have|has)\s+\w+(?:ed|en|ne|me|d|t)\b"),
], [
    ('since + 时间点', r"\bsince\s+\w+"),
    ('for + 时间段', r"\bfor\s+(?:\w+\s+)?(?:years?|months?|weeks?|days?|hours?|a\s+long\s+time)\b"),
    ('How long…?', r"\bhow\s+long\b"),
    ('have been to / gone to', r"\b(?:has|have)\s+(?:been|gone)\s+to\b"),
]),
('wy8A', 'U3'): ('不定式与动名词作宾语', [
    ('接 to do', r"\b(?:want|wants|hope|hopes|decide|decides|decided|plan|plans|agree|agrees|agreed|promise|promised|choose|chose|learn|learnt|refuse|refused|manage|managed)\s+to\s+\w+"),
    ('接 doing', r"\b(?:enjoy|enjoys|enjoyed|finish|finished|mind|minded|keep|keeps|kept|practise|practises|imagine|avoid|suggest)\s+\w+ing\b"),
], [
    ('双形动词 forget/remember/stop', r"\b(?:forget|forgets|forgot|remember|remembers|remembered|stop|stops|stopped)\s+(?:to\s+\w+|\w+ing)\b"),
    ('like/love/start 两可', r"\b(?:like|likes|love|loves|start|starts|started|begin|begins|began)\s+(?:to\s+\w+|\w+ing)\b"),
]),
('wy8A', 'U4'): ('不定式作宾语补足语', [
    ('带 to 的宾补', r"\b(?:want|wants|wanted|ask|asks|asked|tell|tells|told|allow|allows|allowed|encourage|encourages|encouraged|remind|reminds|teach|teaches|taught|expect|expects)\s+(?:me|him|her|us|them|\w+)\s+to\s+\w+"),
], [
    ('使役省 to(make/let/have sb do)', r"\b(?:make|makes|made|let|lets|have|has|had)\s+(?:me|him|her|us|them)\s+(?!to\b)[a-z]+\b"),
    ('help sb (to) do', r"\bhelps?\s+(?:me|him|her|us|them|\w+)\s+(?:to\s+)?\w+"),
]),
('wy8A', 'U5'): ('不定式表目的', [
    ('句中 to do 表目的', r"\b(?:go|goes|went|come|came|get|got|use|used|work|worked|save|saved|practise|practised|plant|planted|study|studied|run|ran|read|write|wrote|stop|stopped|set|put)\s+[\w\s]{0,18}\bto\s+\w+"),
], [
    ('句首前置 To…, S+V', r"(?:^|[.!?]\s+)To\s+\w+[^,.]{0,40},\s+\w+"),
    ('in order to', r"\bin\s+order\s+to\b"),
]),
('wy8A', 'U6'): ('过去进行时', [
    ('was/were + -ing', r"\b(?:was|were)\s+(?:not\s+)?\w+ing\b"),
], [
    ('while + 进行(背景)', r"\bwhile\s+\w+\s+(?:was|were)\s+\w+ing\b"),
    # ★2026-07-25 修误报★ 原式要求 when + 主语 + 动词紧邻,漏掉了中间插副词的写法
    # (`when the lights **suddenly** went out`),把 wy8A U6 误报成缺口。允许主语为
    # 多词名词短语、动词前插 0-2 个副词。
    ('when + 一般过去(打断)',
     r"\bwhen\s+(?:the\s+|a\s+|his\s+|her\s+|my\s+|our\s+|their\s+)?\w+(?:\s+\w+)?\s+"
     r"(?:\w+ly\s+){0,2}(?:\w+ed|went|came|got|saw|began|stopped|rang|fell|lost|left|hit|broke|arrived)\b"),
    ('否定 was/were not doing', r"\b(?:was|were)\s+not\s+\w+ing\b"),
]),
('wy8B', 'U1'): ('被动语态(现在/将来)', [
    ('is/are + 过去分词', r"\b(?:is|are)\s+(?:not\s+)?\w+(?:ed|en|t)\b"),
], [
    ('will be + 过去分词', r"\bwill\s+be\s+\w+(?:ed|en|t)\b"),
    ('by + 施动者', r"\bby\s+(?:robots|computers|machines|people|students|workers|us|them|\w+s)\b"),
]),
('wy8B', 'U2'): ('被动语态(过去)', [
    ('was/were + 过去分词', r"\b(?:was|were)\s+(?:not\s+)?\w+(?:ed|en|t)\b"),
], [
    ('by + 施动者', r"\bby\s+\w+"),
    ('否定 was/were not + pp', r"\b(?:was|were)\s+not\s+\w+(?:ed|en|t)\b"),
]),
('wy8B', 'U3'): ('情态动词(一)·能力义务许可', [
    ('can/must/should/may/have to', r"\b(?:can|cannot|can't|must|should|may|have\s+to|has\s+to)\b"),
], [
    ('must vs have to', r"\b(?:must|have\s+to|has\s+to)\b"),
    ("否定 mustn't / don't have to", r"\b(?:mustn't|must\s+not|don't\s+have\s+to|doesn't\s+have\s+to)\b"),
]),
('wy8B', 'U4'): ('情态动词(二)·推测与建议', [
    ('may/might/could 推测', r"\b(?:may|might|could)\s+(?:be|\w+)\b"),
], [
    ("must be(肯定推测)", r"\bmust\s+be\b"),
    ("can't be(否定推测)", r"\b(?:can't|cannot)\s+be\b"),
]),
('wy8B', 'U5'): ('宾语从句(一)·that', [
    ('报告动词 + that', r"\b(?:said|says|told|tells|thinks|thought|knows|knew|believes|hopes|found)\s+(?:me\s+|us\s+|him\s+|her\s+)?that\b"),
], [
    # 省略 that 后的从句主语不只是代词,也可能是动名词/名词(`said **reading** is food…`)
    ('省略 that',
     r"\b(?:said|says|told|thinks|thought|knows|knew|believes?|believed)\s+(?:me\s+|us\s+|him\s+|her\s+)?"
     r"(?:I|you|he|she|it|we|they|the|this|that|\w+ing|\w+s)\s+(?:is|are|was|were|can|will|has|have|do|does|\w+s)\b"),
    ('时态呼应(主过去→从过去)', r"\b(?:said|told|thought|knew)\s+(?:me\s+|us\s+)?that\s+\w+\s+(?:was|were|had|would|could)\b"),
]),
('wy8B', 'U6'): ('宾语从句(二)·if/whether/wh-', [
    ('if/whether 引导', r"\b(?:asked|ask|asks|wonder|wondered|know|knew|see|saw)\s+(?:me\s+|us\s+|him\s+|her\s+)?(?:if|whether)\b"),
    ('wh- 引导', r"\b(?:asked|ask|asks|know|knew|wonder|wondered|tell|told|see|saw)\s+(?:me\s+|us\s+|him\s+|her\s+)?(?:what|why|how|where|when|who)\b"),
], [
    ('陈述语序(非疑问倒装)', r"\b(?:what|why|how|where|when|who|if|whether)\s+(?:I|you|he|she|it|we|they|the\s+\w+)\s+(?:am|is|are|was|were|do|does|did|can|will|had|have|has|\w+ed|\w+s)\b"),
]),

# ══ wy9A 九上(2026-07-26 加)════════════════════════════════════════
# 语法点取自课本 Scope and sequence + 附录 Guide to the language use(p129-137):
#   U1 条件 if + 原因 because/since      U2 时间六类 + 地点 where/wherever
#   U3 目的 so that + 结果 so/such…that  U4 who/whom 定从
#   U5 that/which 定从 + 引导词省略      U6 构词法(派生/转化/合成)
# ★与 clause_gate 的分工★:clause_gate 管「不该早出现」(超前),本表管「该出现却没有」(承载)。
#   U1/U2 的四类状从在前四册已大量在用,故 clause_gate 不拦它们;但九上是系统化讲解,
#   本表仍要求篇目**实质承载**,两者不冲突。
('wy9A', 'U1'): ('条件状语从句 if + 原因状语从句 because/since', [
    ('if 条件从句', r"\bif\s+(?:I|you|he|she|it|we|they|the|this|that|\w+)\s+(?:am|is|are|do|does|don't|doesn't|\w+s|\w+)\b"),
    ('because 原因从句', r"\bbecause\s+(?:I|you|he|she|it|we|they|the|this|that|\w+)\b"),
], [
    # ★三条首版写窄,U1 精读实测漏检(内容有、门看不见)→ 放宽★
    #   主将从现:逗号后主句可能先出现主语短语再到 will/情态(your hands will…),不能要求紧邻
    #   if+祈使:祈使动词表要含 be/keep/try 等,不能只列位移动词
    #   since 既然:句首 Since…, 即「既然」;时间义 since 从句一般在后半句且主句用完成时
    ('主将从现(从句现在时→主句将来/情态)',
     r"\bif\s+[^.!?]{3,60}?,\s*[^.!?]{0,30}?\b(?:will|won't|can|may|must|should)\b"
     r"|\b(?:will|won't|can|may|must|should)\s+[^.!?]{3,60}?\bif\s+\w+\s+(?:is|are|do|does|\w+s|\w+)\b"),
    # 祈使动词表两次写窄(第一版无 be,第二版无 show)。教训:枚举式动词表天生会漏。
    # 改成「逗号后首词是动词原形」的形态判据 —— 收常见祈使动词 + 排除主语类词开头。
    ('if + 祈使句',
     r"\bif\s+[^.!?]{3,60}?,\s*(?!(?:I|you|he|she|it|we|they|the|a|an|this|that|these|those|"
     r"my|your|his|her|our|their|there|nobody|no\s+one|some|many|most|it's)\b)"
     r"(?:please\s+)?(?:do\s+not\s+|don't\s+)?[a-z]{2,}\b"),
    ('since 表既然', r"(?:^|[.!?\"]\s+)since\s+[^.!?]{3,60}?,"),
]),
('wy9A', 'U2'): ('时间状语从句(六类)+ 地点状语从句', [
    ('when/before/after/as soon as 时间从句',
     r"\b(?:when|before|after|as\s+soon\s+as)\s+(?:I|you|he|she|it|we|they|the|this|that|\w+)\s+\w+"),
    # 首版用 (?<!\w\s) 想排除「先行词 + where」的定从,结果把任何前面有词的 where 都挡了
    # (`it sits where he can see it` 里的 `sits ` 就命中了那个否定环视)。
    # 改成只排除**表地点的先行词**(place/room/school…),与 clause_gate 的 PLACE_HEAD 同口径。
    ('where/wherever 地点从句(无先行词)',
     r"(?<!\bplace\s)(?<!\broom\s)(?<!\bschool\s)(?<!\bcity\s)(?<!\btown\s)(?<!\bpark\s)"
     r"(?<!\bshop\s)(?<!\bhouse\s)(?<!\bhome\s)(?<!\bgarden\s)(?<!\bcorner\s)"
     r"\b(?:where|wherever|anywhere)\s+(?:I|you|he|she|it|we|they)\s+\w+"),
], [
    ('while + 进行时', r"\bwhile\s+(?:I|you|he|she|it|we|they|the\s+\w+)\s+(?:am|is|are|was|were)\s+\w+ing\b"),
    ('until / not…until', r"\b(?:not\s+[^.!?]{0,30}?\buntil|until)\s+\w+"),
    # 窗口首版 30/40 太短:`since we started the box in September, nobody in our class has bought`
    # 从 since 到 has 隔了 52 字符,被漏检。放宽到 60/80(仍不跨句末标点)。
    ('since + 主句完成时',
     r"\b(?:has|have)\s+\w+(?:ed|en|n|t)?\s+[^.!?]{0,60}?\bsince\b"
     r"|\bsince\s+[^.!?]{0,80}?\b(?:has|have)\s+\w+"),
]),
('wy9A', 'U3'): ('目的状语从句 so that + 结果状语从句 so/such…that', [
    ('so that 目的', r"\bso\s+that\s+\w+"),
], [
    ('so + 形容词/副词 + that', r"\bso\s+\w+\s+that\s+\w+"),
    ('such + a/an + 形容词 + 名词 + that', r"\bsuch\s+(?:a|an)\s+\w+\s+\w+\s+that\s+\w+"),
    ('目的从句带情态(can/could/may/would)', r"\bso\s+that\s+(?:\w+\s+){1,3}?(?:can|could|may|might|will|would)\b"),
]),
('wy9A', 'U4'): ('who / whom 引导的定语从句', [
    ('先行词 + who', r"\b(?:the|a|an|my|your|his|her|our|their|every|some|any)\s+\w+\s+who\b"
                     r"|\b(?:everyone|anyone|someone|people|those|all)\s+who\b"),
], [
    ('whom 作宾语', r"\bwhom\b"),
    # 两条首版都写窄:限定词与先行词之间只许一个词(挡掉 `the only person`)、
    # who 与谓语之间不许有副词(挡掉 `who still remembers`)。U4 精读实测双双漏检。
    # 放宽:限定词后允许 0-2 个修饰词,who 后允许 0-2 个副词。
    ('从句谓语与先行词数一致(复数)',
     r"\b(?:people|students|doctors|workers|children|neighbours|those|\w+s)\s+who\s+"
     r"(?:\w+ly\s+|still\s+|always\s+|never\s+|often\s+){0,2}(?:are|were|have|do|live|know|\w+(?<!s))\b"),
    ('从句谓语与先行词数一致(单数)',
     r"\b(?:the|a|an|my|your|his|her|our|their)\s+(?:\w+\s+){0,2}?\w+?(?<!s)\s+who\s+"
     r"(?:\w+ly\s+|still\s+|always\s+|never\s+|often\s+){0,2}(?:is|was|has|does|\w+s)\b"),
]),
('wy9A', 'U5'): ('that / which 定语从句 + 引导词省略', [
    ('that / which 引导定从',
     r"\b(?:the|a|an|my|your|his|her|our|their|this|these|those)\s+\w+\s+(?:that|which)\s+\w+"),
], [
    ('which 只指物', r"\b(?:the|a|an|this|these|those)\s+\w+\s+which\s+\w+"),
    # 同一处窄法在本单元出现两次:限定词与中心名词之间不许有修饰词
    # (`The small fish that we saw` / `The bird book we bought` 都被漏检)。统一放宽 0-2 词。
    ('引导词作宾语(可省形态:名词 + that/which + 主语)',
     r"\b(?:the|a|an|my|your|his|her|our|their|this|these|those)\s+(?:\w+\s+){0,2}\w+\s+"
     r"(?:that|which)\s+(?:I|you|he|she|it|we|they|people|cars|scientists)\b"),
    # 首版要求限定词与中心名词之间只隔一个词,`The bird book we bought` 这种
    # 两词名词短语被漏检(U5 精读实测)。放宽到 0-2 个修饰词。
    # ★中间词不许是关系词★ 放宽到 0-2 个修饰词后,`The small fish that we saw` 里的 that
    # 被当成修饰词吃掉,一个**有引导词**的定从被误判成「省略式」(Aaron 2026-07-26 抓到)。
    # 省略式的定义就是没有引导词,故中间任一词是 that/which/who/whom 时必须排除。
    # ★两次栽在同一处:先是「中间词吃掉 that」误判,再是「动词枚举只收过去式」漏检
    #   (The cloth bag we use / The answer we got / a plan nobody follows 全漏)。
    #   改判据不改枚举:名词短语 + 紧跟的从句主语 + 任意谓语词,且中间不得出现关系词。
    #   主语位收代词与 nobody/somebody/everybody(`a plan nobody follows` 正是这型)。
    ('省略引导词的定从(名词 + 主语 + 谓语)',
     r"\b(?:the|a|an|my|your|his|her|our|their|this|these|those)\s+"
     r"(?:(?!(?:that|which|who|whom)\s)\w+\s+){1,3}"
     r"(?:I|you|he|she|we|they|nobody|somebody|everybody)\s+(?:\w+ly\s+)?[a-z]{2,}\b"),
]),
('wy9A', 'U6'): ('构词法(派生·转化·合成)', [
    ('派生后缀 -ful/-less/-ly/-al/-ity/-ation',
     r"\b\w{3,}(?:ful|less|ally|ical|ity|ation|ment)\b|\b(?:loudly|wisely|deeply|smoothly|slowly|quickly)\b"),
], [
    ('否定/使动前缀 un-/dis-/en-/re-/up-',
     r"\b(?:un\w{3,}|dis\w{3,}|en(?:able|joy|courage)\w*|re(?:use|cycle|build|write|turn)\w*|upcycle\w*)\b"),
    ('-ed 修饰人 / -ing 修饰物 的对照',
     r"\b(?:interested|surprised|amazed|worried|excited)\b|\b(?:interesting|surprising|amazing|exciting)\b"),
    # 合成词有两种形态:带连字符(long-lasting)与**闭合式**(greenhouse / moneybox / toothbrush)。
    # 首版只认连字符,闭合式全漏(U6 泛读实测:greenhouse 在文中却报 0)。
    # 闭合式没有结构线索,只能列举 —— 这是本表唯一一处必须用枚举的地方,词源取自九上及前四册词表。
    ('转化(同形不同词性)与合成词',
     r"\ba\s+(?:long\s+)?talk\b|\bwater\s+the\b"
     r"|\b\w+-\w+(?:ing|ed|ic|al)?\b"
     r"|\b(?:greenhouse|moneybox|toothbrush|farmland|businessman|scarecrow|matchbox|dreamland|"
     r"footstep|northwest|upcycle|overfish|multimedia|playground|classroom|homework|notebook|"
     r"sunlight|birthday|weekend|something|everything|nothing|anything)\w*\b"),
]),
}

FIVE_ADV = ['always', 'usually', 'often', 'sometimes', 'never']


def load_rows():
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'SQLAA')
    out = []
    for path in sorted(glob.glob(os.path.join(root, '**', 'wy*-reading-load.sql'), recursive=True)):
        txt = open(path, encoding='utf-8').read()
        for s in split_stmts(txt):
            if 'INSERT INTO public.junior_reading' not in s:
                continue
            m = re.search(r'\(([^)]*)\) VALUES \(', s)
            cols = [c.strip() for c in m.group(1).split(',')]
            vals = parse_values(s[m.end():].strip()[:-1])
            if len(cols) != len(vals):
                continue
            d = dict(zip(cols, vals))
            out.append({'vol': d['volume'], 'unit': d['unit'],
                        'kind': '精读' if d['difficulty'] == '0' else '泛读',
                        'title': d['title'].replace("''", "'"),
                        'body': d['body'].replace("''", "'")})
    return out


def hits(body, pattern):
    if pattern == '__ALL_FIVE__':
        got = sum(1 for a in FIVE_ADV if re.search(r'\b%s\b' % a, body, re.I))
        return got if got == len(FIVE_ADV) else 0
    return len(re.findall(pattern, body, re.I))


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    detail = '--detail' in sys.argv
    rows = load_rows()
    if not rows:
        print('!! 一篇都没载入')
        return 2

    by = {}
    for r in rows:
        by.setdefault((r['vol'], r['unit']), []).append(r)

    print('外研社四册·单元语法点承载地图')
    print('CORE=基本形式(有它才算教到) / HARD=难点分支(最易错、最该练)')
    print('★真问题看"泛读"列:精读满而泛读空 = 典型缺口★')
    print('')
    gaps = []
    for key in sorted(by, key=lambda k: (k[0], k[1].replace('Starter', 'U0'))):
        vol, unit = key
        if args and vol not in args and unit not in args:
            continue
        spec = P.get(key)
        if not spec:
            continue
        name, core, hard = spec
        jing = [r for r in by[key] if r['kind'] == '精读']
        fan = [r for r in by[key] if r['kind'] == '泛读']
        print('── %s %-8s %s' % (vol, unit, name))
        for label, pat in [('CORE', core), ('HARD', hard)]:
            for feat, pattern in pat:
                if pattern == '__ALL_FIVE__':
                    # ★单元级判定★ "五个频度副词齐"是**整个单元**要教到,不是每篇都得有五个。
                    # 逐篇判会把"分散到四篇、合起来齐"误报成缺口(2026-07-25 踩过)。
                    nj = hits(' '.join(r['body'] for r in jing), pattern)
                    nf = hits(' '.join(r['body'] for r in fan), pattern)
                else:
                    nj = sum(hits(r['body'], pattern) for r in jing)
                    nf = sum(hits(r['body'], pattern) for r in fan)
                cov = sum(1 for r in fan if hits(r['body'], pattern) > 0)
                flag = ''
                if nf == 0:
                    flag = '  ★泛读 0★'
                    gaps.append((vol, unit, label, feat, nj, nf))
                elif label == 'CORE' and cov <= 1 and len(fan) >= 3:
                    flag = '  ⚠泛读仅 %d/%d 篇' % (cov, len(fan))
                    gaps.append((vol, unit, label, feat, nj, nf))
                print('   %-4s %-30s 精读 %-4d 泛读 %-4d (覆盖 %d/%d 篇)%s'
                      % (label, feat, nj, nf, cov, len(fan), flag))
        if detail:
            for r in fan:
                print('        · %s' % r['title'])
        print('')

    print('=' * 74)
    print('缺口合计 %d 项' % len(gaps))
    hard_gap = [g for g in gaps if g[2] == 'HARD']
    core_gap = [g for g in gaps if g[2] == 'CORE']
    print('  CORE 缺口 %d 项(基本形式都没有,最严重):' % len(core_gap))
    for g in core_gap:
        print('    %s %-8s %s   精读%d/泛读%d' % (g[0], g[1], g[3], g[4], g[5]))
    print('  HARD 缺口 %d 项(难点分支缺失):' % len(hard_gap))
    for g in hard_gap:
        print('    %s %-8s %s   精读%d/泛读%d' % (g[0], g[1], g[3], g[4], g[5]))
    return 1 if gaps else 0


if __name__ == '__main__':
    sys.exit(main())
