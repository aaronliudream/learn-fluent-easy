#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
外研社初中语料·过去完成时(past perfect)时序门 + 全量回扫器

背景:2026-07-25 发现四册阅读/听力散落 13 处 `had + 过去分词`。过去完成时在本仓库
数据里挂 grade9 U12(九年级倒数第二单元),fltrp-grade7/grade8 全文不含该点,
故对 wy7A/wy7B/wy8A/wy8B 一律越界。原生成期时序门没有这条规则(全库无 past_perfect 串),
wy7A 之所以 0 命中只是"全一般现在时"那条约束顺带挡住的。

★关键设计:必须放行宾语从句 backshift★
外研社八下 U5(that 宾从)/U6(wh- 宾从)教材本身就教时态呼应:
    He said that he had seen the film before.
这是正课,不是越界。门若一刀切会砸掉 U5/U6 的语法题和听力材料。
故只有"独立过去完成时"才拦;"过去时报告动词 + 引导词 + had done"在宾从解禁后放行。

用法:
    python scripts/junior-fltrp/past_perfect_gate.py            # 扫全部 wy* SQL
    python scripts/junior-fltrp/past_perfect_gate.py wy7b       # 只扫某册
退出码:0=无越界,1=有越界
"""
import re
import sys
import glob
import json
import os

# ── 各册宾语从句解禁点(unit 序号;None = 该册整册未教宾从)────────────────
# wy7A/wy7B/wy8A 均未教宾语从句;wy8B U5=that宾从, U6=wh-宾从
OBJECT_CLAUSE_UNLOCK = {
    'wy7A': None,
    'wy7B': None,
    'wy8A': None,
    'wy8B': 5,
}

# 过去完成时本体:had + (副词)* + 过去分词
IRREGULAR_PP = (
    "been|gone|done|seen|taken|given|written|eaten|made|found|got|gotten|come|become|"
    "begun|broken|brought|bought|built|chosen|drawn|driven|fallen|felt|flown|forgotten|"
    "grown|heard|held|kept|known|left|lost|met|paid|put|read|run|said|sold|sent|shown|"
    "slept|spoken|spent|stood|swum|taught|told|thought|understood|worn|won|drunk|risen|"
    "hidden|learnt|learned|meant|sat|set|cut|hurt|let|beaten|blown|caught|cost|dug|fed|"
    "fought|frozen|laid|led|lent|ridden|rung|sung|stolen|stuck|struck|torn|thrown|woken"
)
ADVERBS = r"(?:never|already|just|not|ever|always|recently|only|n't)"
PAST_PERFECT = re.compile(
    r"\bhad\s+(?:%s\s+)*(?:%s|[a-z]+ed)\b" % (ADVERBS, IRREGULAR_PP), re.I)

# backshift 判定:报告/认知动词 + 引导词,出现在 had 之前的窗口内。
# 动词含原形/-ing —— 语料里有 `began to think about whether ... had ever said`,
# 过去性来自主句 began,从句动词是原形,只收过去式会漏。
# 真正的安全阀是下面的 unit ≥ 宾从解禁点,不是动词形态。
REPORTING_VERB = re.compile(
    r"\b(?:said|say|says|saying|asked|ask|asks|asking|told|tell|tells|telling|"
    r"thought|think|thinks|thinking|knew|know|knows|knowing|wondered|wonder|wonders|"
    r"found|find|finds|realised|realized|realise|realize|explained|explain|explains|"
    r"replied|reply|answered|answer|added|noticed|notice|remembered|remember|"
    r"forgot|forget|hoped|hope|believed|believe|felt|feel|wrote|write|heard|hear|"
    r"learnt|learned|learn|discovered|discover|decided|decide|saw|see|understood)\b", re.I)
# 引导词可能是填空题的下划线槽位(`The boy said ____ he ____ his homework already.`)
COMPLEMENTISER = re.compile(
    r"(?:\b(?:that|if|whether|what|why|how|where|when|who|whom|whose|which)\b|_{2,})", re.I)

# `had to` = 不得不,不是完成时;`had a/an/the/no/some ...` = 实义动词 have
NOT_PERFECT = re.compile(r"\bhad\s+(?:to\b|an?\b|the\b|no\b|some\b|any\b|nowhere\b|nothing\b)", re.I)


def unit_no(unit):
    """'U5' -> 5 ; 'Starter' -> 0"""
    m = re.search(r"(\d+)", unit or "")
    return int(m.group(1)) if m else 0


def classify(text, match, volume, unit, whole=False):
    """返回 ('backshift'|'standalone', 证据串)

    whole=True 用于语法整题:题干与选项被句号隔开,按句截窗口会看不见题干里的
    报告动词,从而把正课的宾从时态呼应误判成孤立过去完成时。
    """
    start = match.start()
    if whole:
        head = text[:start]
    else:
        # 取 had 之前同句的窗口(到上一个句末标点为止,最多 220 字符)
        head = text[max(0, start - 220):start]
        cut = max(head.rfind('. '), head.rfind('! '), head.rfind('? '))
        if cut >= 0:
            head = head[cut + 1:]
    rv = REPORTING_VERB.search(head)
    cp = COMPLEMENTISER.search(head[rv.end():]) if rv else None
    if rv and cp:
        unlock = OBJECT_CLAUSE_UNLOCK.get(volume)
        if unlock is not None and unit_no(unit) >= unlock:
            return 'backshift', (rv.group(0) + ' … ' + cp.group(0)).strip()
        return 'standalone', '疑似backshift但该册/单元未解禁宾从(%s %s)' % (volume, unit)
    return 'standalone', ''


def scan_text(text, volume, unit, whole=False):
    out = []
    for m in PAST_PERFECT.finditer(text):
        if NOT_PERFECT.match(text, m.start()):
            continue
        kind, ev = classify(text, m, volume, unit, whole)
        a, b = max(0, m.start() - 60), min(len(text), m.end() + 60)
        out.append({'kind': kind, 'hit': m.group(0), 'evidence': ev,
                    'context': text[a:b].replace('\n', ' ')})
    return out


# ── SQL 解析(与灌库脚本同一套)────────────────────────────────────────
def split_stmts(txt):
    out, cur, i, n, inq, indoll = [], [], 0, len(txt), False, False
    while i < n:
        c = txt[i]
        if indoll:
            if txt.startswith('$$', i):
                indoll = False; cur.append('$$'); i += 2; continue
        elif not inq and txt.startswith('$$', i):
            indoll = True; cur.append('$$'); i += 2; continue
        if inq:
            if c == "'":
                if i + 1 < n and txt[i + 1] == "'":
                    cur.append("''"); i += 2; continue
                inq = False
        else:
            if c == "'":
                inq = True
            elif c == ';' and not indoll:
                out.append(''.join(cur)); cur = []; i += 1; continue
        cur.append(c); i += 1
    if ''.join(cur).strip():
        out.append(''.join(cur))
    return out


def parse_values(s):
    vals, cur, depth, inq, i, n = [], [], 0, False, 0, len(s)
    while i < n:
        c = s[i]
        if inq:
            if c == "'":
                if i + 1 < n and s[i + 1] == "'":
                    cur.append("'"); i += 2; continue
                inq = False; i += 1; continue
            cur.append(c); i += 1; continue
        if c == "'":
            inq = True; i += 1; continue
        if c in '([':
            depth += 1
        elif c in ')]':
            depth -= 1
        if c == ',' and depth == 0:
            vals.append(''.join(cur).strip()); cur = []; i += 1; continue
        cur.append(c); i += 1
    vals.append(''.join(cur).strip())
    return vals


def _norm(raw):
    if raw.endswith('::jsonb'):
        raw = raw[:-7]
    if raw.lstrip().startswith('['):
        try:
            raw = ' '.join(json.dumps(json.loads(raw), ensure_ascii=False).split())
        except Exception:
            pass
    return raw


def split_tuples(tail):
    """把 VALUES 之后的 `(...), (...), (...)` 切成一个个顶层元组内容(不含外层括号)。

    ★必须支持多行 INSERT★ 听力灌库是一条 INSERT 带 36 个值元组;只吃单元组的解析器
    会静默产出 0 行,然后报"0 误伤"——那是最能骗人的假绿灯。
    """
    out, depth, inq, start, i, n = [], 0, False, None, 0, len(tail)
    while i < n:
        c = tail[i]
        if inq:
            if c == "'":
                if i + 1 < n and tail[i + 1] == "'":
                    i += 2; continue
                inq = False
            i += 1; continue
        if c == "'":
            inq = True; i += 1; continue
        if c == '(':
            if depth == 0:
                start = i + 1
            depth += 1
        elif c == ')':
            depth -= 1
            if depth == 0 and start is not None:
                out.append(tail[start:i]); start = None
        i += 1
    return out


def rows_from_sql(path):
    """产出 (volume, unit, label, text, whole) —— 覆盖阅读/听力/语法三类表

    ★三个坑★
    1. junior_grammar_questions 的 volume/unit 不在列里,在 point_id 子查询中
       (`WHERE volume='wy8B' AND code='wy8b-u5-object-clauses-1'`)→ 回退到整句正则。
    2. 语法题的报告动词在 stem、had done 在 option → 必须把 stem+四选项**合并成一段**
       再判 backshift,否则逐字段扫会把 'that; had seen' 当成孤立过去完成时误杀正课。
    3. 听力是单条多元组 INSERT → 见 split_tuples。
    """
    txt = open(path, encoding='utf-8').read()
    for s in split_stmts(txt):
        if 'INSERT INTO public.' not in s:
            continue
        m = re.search(r'INSERT INTO public\.(\w+)\s*\(([^)]*?)\)\s*VALUES\s*', s, re.S)
        if not m:
            continue
        table, cols = m.group(1), [c.strip() for c in m.group(2).split(',')]
        for tup in split_tuples(s[m.end():]):
            vals = parse_values(tup)
            if len(cols) != len(vals):
                continue
            d = dict(zip(cols, vals))

            vol = d.get('volume')
            if not vol or not re.match(r'^wy\w+$', vol):
                mv = re.search(r"volume\s*=\s*'(\w+)'", s)
                vol = mv.group(1) if mv else (vol or '?')
            unit = d.get('unit')
            if not unit or not re.match(r'^(U\d+|Starter)$', unit):
                mu = re.search(r"code\s*=\s*'\w+?-u(\d+)", tup, re.I)
                unit = ('U' + mu.group(1)) if mu else (unit or '?')
            title = (d.get('title') or d.get('stem') or '')[:44]

            if table == 'junior_grammar_questions':
                # 合并判定:题干 + 选项 + 解析,报告动词与 had done 才在同一段里
                #
                # ★只收正确选项,丢掉干扰项★
                # 选择题的错误选项是**故意写错的**,不是要学生学的内容。
                # 例:系动词单元 `The soup tastes ____.` 选项 goodly/good/well/best,
                # 答案是 good,`best` 只是干扰项 —— 按"教学内容"判它超前是误报。
                ans = (d.get('correct_answer') or '').strip().upper()
                keep = ['stem']
                if ans in ('A', 'B', 'C', 'D'):
                    keep.append('option_' + ans.lower())
                else:
                    keep += ['option_a', 'option_b', 'option_c', 'option_d']
                keep.append('explanation')
                merged = ' '.join(_norm(d[f]) for f in keep if d.get(f))
                if merged:
                    # whole=True:整题是一个判定单位,不按句号截窗口
                    yield vol, unit, '%s | %s | 题干+正解' % (table, title), merged, True
                continue

            for field in ('body', 'text', 'transcript', 'content', 'stem',
                          'option_a', 'option_b', 'option_c', 'option_d',
                          'questions', 'items'):
                raw = d.get(field)
                if not raw or raw == 'NULL':
                    continue
                yield vol, unit, '%s | %s | %s' % (table, title, field), _norm(raw), False


def main():
    argv = sys.argv[1:]
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'SQLAA')
    files = sorted(glob.glob(os.path.join(root, 'wy*-*-load.sql')))
    if argv:
        files = [f for f in files if any(a.lower() in os.path.basename(f).lower() for a in argv)]

    violations, allowed = [], []
    coverage = []
    for path in files:
        nfield = nchar = 0
        rows = set()
        for vol, unit, label, text, whole in rows_from_sql(path):
            nfield += 1
            nchar += len(text)
            rows.add((vol, unit, label.split(' | ')[1]))
            for h in scan_text(text, vol, unit, whole):
                rec = dict(h, file=os.path.basename(path), volume=vol, unit=unit, label=label)
                (violations if h['kind'] == 'standalone' else allowed).append(rec)
        coverage.append((os.path.basename(path), len(rows), nfield, nchar))

    print('扫描文件 %d 个' % len(files))
    print('')
    print('【覆盖率自证】0 命中若因解析器空转就是假绿灯,故先报实际扫到的量:')
    tot_rows = tot_char = 0
    for name, nrow, nfield, nchar in coverage:
        print('  %-32s 条目=%-4d 字段=%-5d 字符=%d' % (name, nrow, nfield, nchar))
        tot_rows += nrow
        tot_char += nchar
    print('  合计:条目=%d 字符=%d' % (tot_rows, tot_char))
    if tot_char == 0:
        print('  !! 一个字符都没扫到,结果不可信')
        return 2
    print('')
    print('【放行·宾从 backshift】%d 处' % len(allowed))
    for r in allowed:
        print('  %s %s  <<%s>>  证据: %s' % (r['volume'], r['unit'], r['hit'], r['evidence']))
        print('      …%s…' % r['context'])
    print('')
    print('【拦截·独立过去完成时】%d 处' % len(violations))
    for r in violations:
        print('  %s %s  %s  <<%s>>' % (r['volume'], r['unit'], r['label'], r['hit']))
        print('      …%s…' % r['context'])
    return 1 if violations else 0


if __name__ == '__main__':
    sys.exit(main())
