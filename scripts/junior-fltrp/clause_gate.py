#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
外研社·从句时序门(九上 wy9A 专用三类)+ 全量回扫器

★为什么只拦三类(Aaron 2026-07-26 裁决①「非对称方案」)★
建门前先数了四册真实语料:

    结构                        wy7A  wy7B  wy8A  wy8B
    because(原因)                  39    32    31    45
    when(时间)                     36    32    52    75
    where(地点)                    36    28    26    51
    if(条件)                       11    16    10    31
    before/after                    6    12    20    20
    while                           3     3    23     6
    ──────────────────────────────────────────────────
    ★so that(目的)                  0     0     2     5
    ★such…that / so…that(结果)      0     2     1     2
    ★who(定从)                      2     0     1     5
    ★which/that(定从)               0     0     0     0

**时间/条件/原因/地点四类状语从句在前四册早已大量自然使用**(because 147 次、
when 195 次)。九上 U1-U2 是「系统化讲解」不是「首次引入」——若按「wy9A U1 才解禁」
建门,会把已上线的四册整体判成超前,那是门错不是内容错,且会制造 500+ 条误报。
所以本门**不碰**这四类,只拦真正稀有、确实到九上才教的三类(前四册存量仅 0-5 处)。

解禁点(wy9A 内部单元序):
    目的/结果状语从句(so that / so…that / such…that)  → U3
    who / whom 定语从句                                 → U4
    that / which 定语从句(含引导词省略)                → U5
前四册(wy7A/wy7B/wy8A/wy8B)整册拦。

★U6 构词法不在本门★ 构词法是形态学、不产生超前句法结构,归 OOV 词表门管。

用法:
    python scripts/junior-fltrp/clause_gate.py            # 扫全部 wy* load SQL
    python scripts/junior-fltrp/clause_gate.py wy9a       # 只扫某册
退出码:0=无真超前,1=有,2=一个字都没扫到(结果不可信)
"""
import os
import re
import sys
import glob
import json
import hashlib

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from past_perfect_gate import rows_from_sql, unit_no  # noqa: E402

# ── 解禁点。None = 该册整册未教 ────────────────────────────────────
UNLOCK = {
    'wy7A': {'purpose_result': None, 'rel_who': None, 'rel_that': None},
    'wy7B': {'purpose_result': None, 'rel_who': None, 'rel_that': None},
    'wy8A': {'purpose_result': None, 'rel_who': None, 'rel_that': None},
    'wy8B': {'purpose_result': None, 'rel_who': None, 'rel_that': None},
    'wy9A': {'purpose_result': 3, 'rel_who': 4, 'rel_that': 5},
}

# ── ① 目的状语从句 so that + 结果状语从句 so/such … that ──────────
PURPOSE = re.compile(r"\bso\s+that\b", re.I)
# so + 形容词/副词 + that;such + (a/an) + … + that。中间不跨句末标点。
RESULT = re.compile(r"\b(?:so|such)\b(?:(?![.!?])[^\n]){1,40}?\bthat\b", re.I)

# ── ② who/whom 定语从句 ───────────────────────────────────────────
# 先行词(限定词+名词 / 专有名词 / everyone 一类)+ who,且 who 不在句首(疑问)。
REL_WHO = re.compile(
    r"\b(?:the|a|an|my|your|his|her|our|their|this|that|these|those|every|some|any|no)\s+\w+\s+who(?:m)?\b"
    r"|\b(?:everyone|everybody|someone|somebody|anyone|anybody|people|those|all)\s+who(?:m)?\b"
    r"|\b[A-Z][a-z]+\s*,\s*who(?:m)?\b", re.I)

# ── ③ that/which 定语从句 ────────────────────────────────────────
# which 作关系词:名词 + which + 谓语。that 作关系词极易与宾从/指示词混,
# 故只收「名词 + that + 助动/系动/实义动词」且排除 say/think 一类报告动词后的 that。
REL_WHICH = re.compile(
    r"\b(?:the|a|an|my|your|his|her|our|their|this|that|these|those|some|any|no)\s+\w+\s+which\b"
    r"|\b\w+s\s+which\b", re.I)
REPORTING = re.compile(
    r"\b(?:say|says|said|think|thinks|thought|know|knows|knew|hope|hopes|hoped|believe|believes|"
    r"find|finds|found|mean|means|meant|show|shows|showed|agree|agrees|agreed|realise|realises|"
    r"realised|realize|realizes|realized|remember|remembers|remembered|feel|feels|felt|"
    r"tell|tells|told|explain|explains|explained|learn|learns|learnt|learned|notice|notices|noticed)\b",
    re.I)
REL_THAT = re.compile(
    r"\b(?:the|a|an|my|your|his|her|our|their|this|these|those)\s+\w+\s+that\s+"
    r"(?:is|are|was|were|has|have|had|can|will|would|could|should|makes?|made|tells?|told|"
    r"gives?|gave|helps?|helped|shows?|showed|comes?|came|goes?|went|looks?|looked)\b", re.I)
# ★关系词作宾语的形态(2026-07-26 补)★
# `the photo that we took` / `the gas which cars give out` —— that/which 后面直接跟
# **从句主语**(代词或名词)而不是谓语。原 REL_THAT 只收「名词 + that + 谓语动词」,
# 把这一整类漏在门外:U5 造题时两侧验证只数到 7/15,才暴露出来。
# 关系词后紧跟主语时不可能是宾语从句的 that(宾从的 that 后是完整句、且前面得有报告动词),
# 故前面仍保留 REPORTING 排除即可。
REL_OBJ = re.compile(
    r"\b(?:the|a|an|my|your|his|her|our|their|this|these|those)\s+\w+\s+(?:that|which)\s+"
    r"(?:I|you|he|she|it|we|they|people|students|children|cars|scientists|workers|everyone)\b",
    re.I)

# ── ④ where 引导的定语从句(Aaron 2026-07-26 指出的缺口)────────────
# 九上 U2 教的是**地点状语从句**(`Put it back where you found it.` —— where 前无先行词);
# 而 `the place where we met` 是**定语从句**(where 前有表地点的先行词,作关系副词)。
# 两者形似、教学阶段不同:课本 Guide 的定从只讲 who/whom/that/which + 省略,
# **关系副词 where 在九上根本没教**,故按最保守口径挂到 rel_that(U5)——
# 真要用也不该早于 that/which 定从解禁。判据 = where 前是否有表地点的先行词。
PLACE_HEAD = (r"place|room|school|city|town|village|country|park|shop|street|house|home|"
              r"garden|library|museum|hall|office|farm|island|hotel|station|market|corner")
REL_WHERE = re.compile(
    r"\b(?:the|a|an|this|that|these|those|my|your|his|her|our|their|every|some|any|no)\s+"
    r"(?:\w+\s+)?(?:%s)s?\s+where\b" % PLACE_HEAD, re.I)

# ── 白名单:形似但不是本门要拦的结构 ─────────────────────────────
IDIOMS = [
    r"\bso\s+that\s+is\b",              # "so that is why…" 不是目的状从
    r"\bso\s+much\s+so\s+that\b",
    r"\bwho\s+(?:is|are|was|were|do|does|did|can|will)\b",   # 疑问句 who
    r"\bthat's\b", r"\bthat\s+is\s+why\b", r"\bso\s+far\b",
    r"\bsuch\s+as\b",                   # such as = 例如,不是结果状从
]
IDIOM_RE = re.compile('|'.join(IDIOMS), re.I)


def scan_text(text, volume, unit):
    """返回命中列表 {kind, feature, hit, context}。kind: violation / allowed"""
    unlock = UNLOCK.get(volume)
    if unlock is None:                      # 未登记的册不判(如人教)
        return []
    u = unit_no(unit)
    idiom = [(m.start(), m.end()) for m in IDIOM_RE.finditer(text)]

    def in_idiom(a, b):
        return any(s <= a and b <= e for s, e in idiom)

    out = []

    def emit(m, feature, label):
        a, b = m.start(), m.end()
        if in_idiom(a, b):
            return
        gate = unlock[feature]
        allowed = (gate is not None and u >= gate)
        out.append({
            'kind': 'allowed' if allowed else 'violation',
            'feature': feature, 'label': label, 'hit': m.group(0)[:60],
            'context': text[max(0, a - 55):min(len(text), b + 55)].replace('\n', ' '),
        })

    seen = []
    result_spans = []          # so/such…that 结果结构的跨度,供下方定从判定排除
    for m in PURPOSE.finditer(text):
        emit(m, 'purpose_result', '目的状从 so that')
        seen.append((m.start(), m.end()))
        result_spans.append((m.start(), m.end()))
    for m in RESULT.finditer(text):
        result_spans.append((m.start(), m.end()))
        if any(s <= m.start() and m.end() <= e for s, e in seen):
            continue
        # so/such…that 里若 that 后紧跟报告动词的宾语从句形态,交给别的门,不在此拦
        emit(m, 'purpose_result', '结果状从 so/such…that')

    def in_result(pos):
        """★2026-07-26 补★ `He was so happy with the answer that he told…` —— 这里的 that
        属于 so…that 结果状从,不是定语从句。REL_OBJ 的「名词 + that + 主语」形态与它撞车,
        误把 `the answer that he` 判成定从(U3 泛读实测踩到)。故 that 落在结果结构跨度内时跳过。"""
        return any(s <= pos < e for s, e in result_spans)
    for m in REL_WHO.finditer(text):
        emit(m, 'rel_who', 'who/whom 定从')
    for m in REL_WHICH.finditer(text):
        emit(m, 'rel_that', 'which 定从')
    for m in REL_WHERE.finditer(text):
        emit(m, 'rel_that', 'where 定从(先行词+where)')
    for m in REL_OBJ.finditer(text):
        if in_result(m.start()):
            continue
        emit(m, 'rel_that', 'that/which 定从(关系词作宾语)')
    for m in REL_THAT.finditer(text):
        if in_result(m.start()):
            continue
        head = text[max(0, m.start() - 60):m.start()]
        if REPORTING.search(head):          # 报告动词后的 that = 宾从,不是定从
            continue
        emit(m, 'rel_that', 'that 定从')
    return out


# ── known-legacy 白名单(2026-07-26 Aaron 裁决②)────────────────────
# 前四册存量 42 处已裁定 backlog 不清(密度约每 8000 字符 1 处,低于真实教材,
# 且 `a friend who is honest` 这类正是 i+1 可理解输入)。但若每次全量回扫都报这 42 处,
# 「拦截 42」会退化成背景噪音 —— **门的报警必须保持零基线,有噪音的门等于没有门**。
# 故按内容指纹登记为 legacy:命中原样存在 → 记 legacy 不报警;
# 文本一旦被改动(指纹变了)→ 重新按 violation 报,不会被白名单掩护。
LEGACY_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'clause_gate_legacy.json')


def fingerprint(h):
    """指纹 = 册+单元+篇名+结构类型+命中串+上下文。任一变化即视为新命中。"""
    raw = '|'.join([h['volume'], h['unit'], h.get('title', ''), h['feature'],
                    h['hit'].strip(), ' '.join(h['context'].split())])
    return hashlib.sha1(raw.encode('utf-8')).hexdigest()[:16]


def load_legacy():
    if not os.path.exists(LEGACY_FILE):
        return set()
    return set(json.load(open(LEGACY_FILE, encoding='utf-8'))['fingerprints'])


def main():
    argv = [a.lower() for a in sys.argv[1:]]
    update = '--update-legacy' in argv
    argv = [a for a in argv if not a.startswith('--')]
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'SQLAA')
    files = sorted(glob.glob(os.path.join(root, '**', 'wy*-*-load.sql'), recursive=True))
    if argv:
        files = [f for f in files if any(a in os.path.basename(f).lower() for a in argv)]

    legacy = set() if update else load_legacy()
    buckets = {'violation': [], 'allowed': [], 'legacy': []}
    nchar = 0
    for path in files:
        for vol, unit, label, text, _whole in rows_from_sql(path):
            nchar += len(text)
            for h in scan_text(text, vol, unit):
                h.update(file=os.path.basename(path), volume=vol, unit=unit,
                         title=label.split(' | ')[1] if ' | ' in label else label,
                         table=label.split(' | ')[0])
                if h['kind'] == 'violation' and fingerprint(h) in legacy:
                    h['kind'] = 'legacy'
                buckets[h['kind']].append(h)

    print('扫描 %d 个文件,共 %d 字符' % (len(files), nchar))
    if nchar == 0:
        print('!! 一个字都没扫到,结果不可信')
        return 2
    if update:
        fps = sorted({fingerprint(h) for h in buckets['violation']})
        json.dump({'note': '前四册存量,Aaron 2026-07-26 裁决 backlog 不清;'
                           '文本改动后指纹失效会重新报警',
                   'generated_from': '%d 处命中' % len(buckets['violation']),
                   'fingerprints': fps},
                  open(LEGACY_FILE, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print('已写入 legacy 白名单 %d 条 → %s' % (len(fps), os.path.basename(LEGACY_FILE)))
        return 0

    print('')
    print('【known-legacy·已裁定 backlog 不报警】%d 处(改动其文本会重新报警)'
          % len(buckets['legacy']))
    print('')
    print('【拦截·真超前】%d 处' % len(buckets['violation']))
    for h in buckets['violation']:
        print('  ── %s %s《%s》[%s]' % (h['volume'], h['unit'], h['title'], h['table']))
        print('     %s  <<%s>>' % (h['label'], h['hit']))
        print('        …%s…' % h['context'])
    print('')
    print('【放行·正课(已解禁单元)】%d 处' % len(buckets['allowed']))
    agg = {}
    for h in buckets['allowed']:
        agg[(h['volume'], h['unit'], h['label'])] = agg.get((h['volume'], h['unit'], h['label']), 0) + 1
    for k in sorted(agg):
        print('    %s %s %-22s %d 处' % (k[0], k[1], k[2], agg[k]))
    return 1 if buckets['violation'] else 0


if __name__ == '__main__':
    sys.exit(main())
