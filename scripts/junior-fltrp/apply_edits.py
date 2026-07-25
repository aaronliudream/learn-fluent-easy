#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""对灌库 SQL 做安全的文本替换(把踩了三次的转义坑一次堵死)。

★为什么要有这个★
手写替换器踩了三次同一个坑,形态都不同、根因一样:
  ① 2026-07-25 批次 SQL:body/questions 转义了,WHERE 里的 title 忘了 → 语句截断
  ② 宾从修正:老串没撇号走"未转义"分支,新串 `'I like football…'` 原样写入 → 截断
  ③ wy7A 承载补齐:同 ②,新串 `Grandpa's` / `neighbours'` 原样写入 → 截断
共同点:**老串有没有撇号,和新串有没有撇号,是两回事**。老串决定"怎么找",
新串必须**永远按 SQL 转义写入**。

本模块只暴露一个函数,强制这个规则,并在替换后校验文件结构没被破坏。

用法(在脚本里):
    from apply_edits import apply_pairs
    apply_pairs('SQLAA/xxx.sql', [(old1, new1), (old2, new2)], table='junior_reading')
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from past_perfect_gate import split_stmts, parse_values  # noqa: E402


def esc(s):
    """SQL 单引号转义。新串一律走这里。"""
    return s.replace("'", "''")


def structure_ok(path, table):
    """校验:每条 INSERT 的列数与值数相等(截断必然导致不等)。"""
    txt = open(path, encoding='utf-8').read()
    total = bad = 0
    for s in split_stmts(txt):
        if ('INSERT INTO public.' + table) not in s:
            continue
        m = re.search(r'\(([^)]*)\) VALUES \(', s)
        if not m:
            continue
        cols = [c.strip() for c in m.group(1).split(',')]
        tail = s[m.end():].strip()
        if not tail.endswith(')'):
            bad += 1
            continue
        total += 1
        if len(cols) != len(parse_values(tail[:-1])):
            bad += 1
    return total, bad


def apply_pairs(path, pairs, table='junior_reading', verbose=True):
    """把 (old, new) 逐条替换进 path。

    old  —— 按【原文形态】给(不用自己转义);函数会同时尝试原形与转义形。
    new  —— 按【原文形态】给;函数**总是**以转义形写入,与 old 命中哪种形态无关。
    每条必须恰好命中 1 次,否则记为失败并跳过(不做部分替换)。
    替换后校验文件结构;若被破坏,抛异常并保持文件不变。
    """
    orig = open(path, encoding='utf-8').read()
    t = orig
    done, fails = 0, []
    for old, new in pairs:
        for probe in (old, esc(old)):
            c = t.count(probe)
            if c == 1:
                t = t.replace(probe, esc(new))   # ★新串永远转义★
                done += 1
                break
            if c > 1:
                fails.append(('命中 %d 次(需唯一)' % c, old[:56]))
                break
        else:
            fails.append(('未命中', old[:56]))

    open(path, 'w', encoding='utf-8', newline='\n').write(t)
    total, bad = structure_ok(path, table)
    if bad:
        open(path, 'w', encoding='utf-8', newline='\n').write(orig)   # 回滚
        raise RuntimeError('替换破坏了文件结构(%d 条列数不匹配),已回滚。'
                           '多半是新串里的撇号未转义。' % bad)
    if verbose:
        print('替换 %d/%d,结构校验 %d 条 INSERT 全部完好' % (done, len(pairs), total))
        for r, o in fails:
            print('  !! %s: %s' % (r, o))
    return done, fails
