#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""基础词豁免表 + 超前词检查(wy9A 起用)。

★为什么需要它★
九上词表标的是「本册在哪一页首次**列出**」,不是「首次接触」。像 thing / could /
better / later 这类基础词,前四册从来没被列进词表(不需要教),但学生早就读到过。
若按「出现在后续单元词表 = 尚未学」判超前,会反复误报,逼着为躲一个基础词绕路改写。

★入表条件(Aaron 2026-07-26 定,三选一,均须机器可查或附页码)★
  a. 前四册【词表】已收录(junior_vocab volume in wy7A..wy8B)
  c. 前四册【正文语料】已实际使用 —— 阅读 body / 听力 transcript /
     语法题干与正确答案。「学生在九上之前已经读到/听到过」才是「已暴露」的定义。
     ⚠️ 语法题干算暴露:wy7B U5 是比较级单元,better 是那一课被正式教过的内容本体,
        学生对着它做过题、看过解析,暴露强度高于泛读。收紧口径会把「被教过的词」
        排除在「已暴露」外,逻辑倒挂。
  b. 课本语法页 / Guide 原文在该单元之前使用(如 could,附页码)——逐个提名。

★不入表★:仅凭「显然是基础词」的常识判断 —— 常识不是证据。

★可审计★:检查器读表豁免,但报告必须**单列「豁免命中 N 处」**,不得静默吞掉。
"""
import json
import os
import re

EXEMPT_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'basic_word_exempt.json')


def load_exempt():
    """返回 {小写词: 证据串}。表不存在时返回空表(不静默假装豁免)。"""
    if not os.path.exists(EXEMPT_FILE):
        return {}
    d = json.load(open(EXEMPT_FILE, encoding='utf-8'))
    return {e['word'].lower(): e for e in d['entries']}


def forms(w):
    """屈折形(复数/三单/过去/进行/比较级)。与词表检查全站同一套规则。"""
    s = {w}
    if ' ' not in w:
        s |= {w + 's', w + 'es', w + 'ed', w + 'ing', w + 'er', w + 'est'}
        if w.endswith('e'):
            s |= {w + 'd', w[:-1] + 'ing'}
        if w.endswith('y'):
            s |= {w[:-1] + 'ies', w[:-1] + 'ied'}
    return s


UNIT_ORDER = ['U1', 'U2', 'U3', 'U4', 'U5', 'U6']


def check_ahead(text, unit, wordlist_path='REVIEWAA/wy9A/wy9A-wordlist.json'):
    """扫 text 里有没有「本单元之后才出现的词」。

    返回 (violations, exempted):
      violations = [(出现形, 词表词, 所属单元)]   —— 真超前,必须改
      exempted   = [(出现形, 词表词, 证据)]        —— 命中豁免表,报告须单列
    """
    wl = json.load(open(wordlist_path, encoding='utf-8'))
    i = UNIT_ORDER.index(unit)
    ok = {w['word'].lower() for w in wl if UNIT_ORDER.index(w['unit']) <= i}
    later = {w['word'].lower(): w['unit'] for w in wl
             if UNIT_ORDER.index(w['unit']) > i}
    later = {k: v for k, v in later.items() if k not in ok}
    ex = load_exempt()

    lmap = {}
    for w in later:
        for f in forms(w):
            lmap.setdefault(f, w)

    violations, exempted = [], []
    for tok in re.findall(r"[A-Za-z']+", text.lower()):
        base = lmap.get(tok)
        if not base:
            continue
        if base in ex:
            item = (tok, base, ex[base]['evidence'])
            if item not in exempted:
                exempted.append(item)
        else:
            item = (tok, base, later[base])
            if item not in violations:
                violations.append(item)
    return violations, exempted


def report(text, unit, label=''):
    """打印一行式结论,豁免命中单列(可审计,不静默)。"""
    v, e = check_ahead(text, unit)
    print('  %s超前词:%s   豁免命中:%d 处%s'
          % (label + ' ' if label else '',
             v if v else '0 ✓',
             len(e),
             ('(' + ', '.join(x[0] for x in e) + ')') if e else ''))
    return v, e
