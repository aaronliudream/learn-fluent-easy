#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
外研社初中语料·比较级/最高级/as…as 时序门 + 全量回扫器

姊妹件:past_perfect_gate.py。成因相同 —— 生成期时序门只覆盖时态类结构
(过去时/完成时/被动/宾从),没有比较级这条,于是 wy7A 全册、wy7B U1-U4
散落了 productive 的比较级/最高级,as…as 也提前到了 U3。

★这道门比 past_perfect 更容易砸正课★
wy7B **U5 就是比较级最高级、U6 就是 as…as**。一刀切会把整个 U5/U6 单元的
课文和语法题全拦掉。所以判定必须带三层排除:
  1. 单元阈值:unit ≥ 解禁点 → 放行(正课)
  2. 固定习语白名单:do your best / at least / as soon as possible …
  3. 词形陷阱:forest/honest/interest 不是最高级;most leaves(大多数)不是最高级

输出分三档,固定搭配类(my best friend / one of the best days)单独列一档,
因为"算不算超前"是内容口径问题,该由人定,门不替人拍板。

用法:
    python scripts/junior-fltrp/comparative_gate.py
    python scripts/junior-fltrp/comparative_gate.py wy7b
退出码:0=无真超前,1=有
"""
import os
import re
import sys
import glob

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from past_perfect_gate import rows_from_sql, unit_no  # noqa: E402

# ── 解禁点(unit 序号)。0 = 该册开篇即已解禁(前册教过);None = 整册未教 ──
GRAMMAR_UNLOCK = {
    'wy7A': {'comparative': None, 'as_as': None},   # 七上未教比较级
    'wy7B': {'comparative': 5, 'as_as': 6},         # U5 比较级最高级, U6 as…as
    'wy8A': {'comparative': 0, 'as_as': 0},         # 七下已教
    'wy8B': {'comparative': 0, 'as_as': 0},
}

# ── 白名单:形态像比较级/as…as,实为固定习语,任何单元放行 ──────────────
IDIOMS = [
    r"\b(?:do|does|did|doing|try|tries|tried|trying)\s+(?:your|his|her|their|my|our|its)\s+best\b",
    r"\bat\s+(?:least|most|best|worst)\b",
    r"\bmore\s+or\s+less\b",
    r"\bas\s+soon\s+as\b",                  # 时间连词"一…就…",非同级比较
    r"\bas\s+(?:usual|well)\b",
    r"\bas\s+(?:long|far)\s+as\b",          # 连词,非同级比较
    # `Years later` / `two days earlier` = 时间副词,不是比较级
    r"\b(?:years?|days?|weeks?|months?|hours?|minutes?|moments?|seconds?)\s+"
    r"(?:later|earlier)\b",
    r"\bas\s+much\s+as\s+possible\b",
    r"\bno\s+longer\b",
    r"\bwhat's\s+more\b",
]
IDIOM_RE = re.compile('|'.join(IDIOMS), re.I)

# ── 词形陷阱:结尾 -est 但不是最高级 ──────────────────────────────────
NOT_SUPERLATIVE = {
    'west', 'east', 'rest', 'test', 'guest', 'forest', 'honest', 'interest',
    'nest', 'quest', 'chest', 'request', 'protest', 'harvest', 'suggest',
    'modest', 'earnest', 'invest', 'contest', 'digest', 'arrest', 'vest',
}

# ── 结构识别 ────────────────────────────────────────────────────────
# 1) 显式比较:X-er than / more X than / better|worse|less than
COMP_THAN = re.compile(
    r"\b(?:\w{3,}(?:ier|er)|more\s+\w+|less\s+\w+|better|worse|farther|further)\s+than\b", re.I)
# 2) 裸比较级(无 than,仍是比较级形态)
COMP_BARE = re.compile(
    r"\b(?:better|worse|longer|shorter|bigger|smaller|older|younger|higher|lower|"
    r"faster|slower|stronger|weaker|warmer|cooler|colder|hotter|later|earlier|"
    r"harder|easier|nicer|happier|greater|deeper|closer|brighter|darker|"
    r"cleaner|richer|louder|quieter|safer|busier)\b", re.I)
# 3) 最高级
SUPERLATIVE = re.compile(r"\b(?:the\s+most\s+\w+|the\s+\w{3,}est|\w{3,}est|best|worst|least)\b", re.I)
# 4) 同级比较 as … as(排除 as long/far/soon as 等连词/习语,见 IDIOMS)
AS_AS = re.compile(r"\bas\s+\w+\s+as\b", re.I)

# ── 裸 best 的口径(2026-07-25 Aaron 定)────────────────────────────────
# 词汇化的固定表达 ≠ 最高级语法结构。同 try your best 白名单、宾从 backshift 一个道理。
#   放:like/love/enjoy … best(最喜欢,整块记)
#   放:the/my/our best + 名词(最好的X,泛指)
#   拦:the best X **in/of 范围**(明确三者以上比较 = 真最高级语法)
# 注意:本口径**只管裸 best**。happiest / sweetest / the most precious / the fastest
# 这类仍按普通最高级拦 —— 它们不是词汇化表达。
BEST_LEXICAL = re.compile(
    r"(?:\b(?:like|likes|liked|love|loves|loved|enjoy|enjoys|enjoyed|prefer|prefers)\b"
    r"[^.!?]{0,45}\bbest\b)"
    r"|(?:\b(?:the|my|your|his|her|their|our|its)\s+best\b(?!\s+\w+\s+(?:in|of)\b))"
    r"|(?:\bbe\s+the\s+best\b)", re.I)
BEST_REAL_SUPERLATIVE = re.compile(
    r"\bthe\s+best\s+\w+\s+(?:in|of)\s+", re.I)


def _spans(text, regex):
    for m in regex.finditer(text):
        yield m


def scan_text(text, volume, unit):
    """返回命中列表:{kind, structure, hit, context}
    kind: violation(真超前) / collocation(固定搭配待定) / allowed(正课或习语)
    """
    unlock = GRAMMAR_UNLOCK.get(volume, {'comparative': 0, 'as_as': 0})
    u = unit_no(unit)
    idiom_spans = [(m.start(), m.end()) for m in IDIOM_RE.finditer(text)]

    def in_idiom(a, b):
        return any(s <= a and b <= e for s, e in idiom_spans)

    out = []

    def emit(m, structure, feature):
        a, b = m.start(), m.end()
        if in_idiom(a, b):
            return
        hit = m.group(0)
        low = hit.lower().strip()
        # -est 词形陷阱
        if structure == 'superlative':
            bare = re.sub(r'^the\s+', '', low)
            if bare in NOT_SUPERLATIVE:
                return
            # "most leaves / most people" = 大多数,非最高级(须有 the 才算)
            if low.startswith('most ') and not low.startswith('the most'):
                return
        gate = unlock[feature]
        allowed = (gate is not None and u >= gate)
        ctx = text[max(0, a - 55):min(len(text), b + 55)].replace('\n', ' ')
        if allowed:
            kind = 'allowed'
        elif re.fullmatch(r'(?:the\s+)?best', low):
            # 裸 best 走专用口径:真最高级(the best X in/of Y)才拦,其余词汇化放行
            win = text[max(0, a - 60):min(len(text), b + 60)]
            if BEST_REAL_SUPERLATIVE.search(win):
                kind = 'violation'
            elif BEST_LEXICAL.search(win):
                return
            else:
                kind = 'collocation'
        else:
            kind = 'violation'
        out.append({'kind': kind, 'structure': structure, 'hit': hit, 'context': ctx})

    seen = set()
    for m in _spans(text, COMP_THAN):
        emit(m, 'comparative', 'comparative')
        seen.add((m.start(), m.end()))
    for m in _spans(text, COMP_BARE):
        # 已被 COMP_THAN 覆盖的不重复报
        if any(s <= m.start() and m.end() <= e for s, e in seen):
            continue
        emit(m, 'comparative', 'comparative')
    for m in _spans(text, SUPERLATIVE):
        emit(m, 'superlative', 'comparative')
    for m in _spans(text, AS_AS):
        emit(m, 'as_as', 'as_as')
    return out


def main():
    argv = sys.argv[1:]
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'SQLAA')
    files = sorted(glob.glob(os.path.join(root, 'wy*-*-load.sql')))
    if argv:
        files = [f for f in files if any(a.lower() in os.path.basename(f).lower() for a in argv)]

    buckets = {'violation': [], 'collocation': [], 'allowed': []}
    nchar = 0
    for path in files:
        for vol, unit, label, text, whole in rows_from_sql(path):
            nchar += len(text)
            for h in scan_text(text, vol, unit):
                h.update(file=os.path.basename(path), volume=vol, unit=unit,
                         title=label.split(' | ')[1], table=label.split(' | ')[0])
                buckets[h['kind']].append(h)

    print('扫描 %d 个文件,共 %d 字符' % (len(files), nchar))
    if nchar == 0:
        print('!! 一个字符都没扫到,结果不可信')
        return 2
    print('')
    print('【拦截·真超前】%d 处' % len(buckets['violation']))
    cur = None
    for r in buckets['violation']:
        key = (r['volume'], r['unit'], r['title'])
        if key != cur:
            cur = key
            print('  ── %s %s《%s》[%s]' % (r['volume'], r['unit'], r['title'], r['table']))
        print('     %-12s <<%s>>' % (r['structure'], r['hit']))
        print('        …%s…' % r['context'])
    print('')
    print('【待定·固定搭配类】%d 处(my best friend / one of the best …,口径由人定)'
          % len(buckets['collocation']))
    for r in buckets['collocation']:
        print('  %s %s《%s》 <<%s>>' % (r['volume'], r['unit'], r['title'], r['hit']))
        print('        …%s…' % r['context'])
    print('')
    print('【放行·正课单元/习语】%d 处' % len(buckets['allowed']))
    agg = {}
    for r in buckets['allowed']:
        k = (r['volume'], r['unit'], r['structure'])
        agg[k] = agg.get(k, 0) + 1
    for k in sorted(agg):
        print('  %s %s %-12s %d 处' % (k[0], k[1], k[2], agg[k]))
    return 1 if buckets['violation'] else 0


if __name__ == '__main__':
    sys.exit(main())
