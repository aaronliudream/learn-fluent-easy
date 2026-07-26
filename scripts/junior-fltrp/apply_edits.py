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

★★输入约定(第四次踩坑后补上)★★
    **old 和 new 都必须传"解码后的原文形态"**,即撇号写单个 `'`,不要自己转义。
    函数会:用 old 的原形与转义形分别去找;写入时**永远**写 esc(new)。
    2026-07-25 有一次把已转义的 `''…''` 当 old **和** new 传进来,
    结果写成四重引号 `''''…''''`,解析里出现字面的两个撇号。
    记住:**你看到的文件字节里是 `''`,但你要传的是 `'`**。
    唯一例外:若 old 只能用文件字节形态定位(如已损坏的四重引号),
    old 可传字节形态,但 new 仍必须传解码形态。

用法(在脚本里):
    from apply_edits import apply_pairs
    apply_pairs('SQLAA/xxx.sql', [(old1, new1), (old2, new2)], table='junior_reading')
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from past_perfect_gate import split_stmts, parse_values, split_tuples  # noqa: E402


def esc(s):
    """SQL 单引号转义。新串一律走这里。"""
    return s.replace("'", "''")


def structure_ok(path, table=None):
    """校验:每个 VALUES 元组的列数与值数相等(截断必然导致不等)。

    ★2026-07-25 修:听力那种「单条 INSERT 带 36 个值元组」此前根本没被校到★
    旧实现两处失效:
      ① 用 `('INSERT INTO public.' + table) not in s` 匹配,而 table 默认 'junior_reading'
         —— 调用方不显式传听力表名时,听力 INSERT 被整条跳过,校验是 no-op;
      ② 就算匹配上,`parse_values(tail[:-1])` 把 `(t1), (t2), …` 当成**一个**元组解,
         列数必然对不上,反过来变成假报警。
    现在:走 split_tuples 逐元组解;table=None 表示**所有表都校**(默认值改成 None,
    宁可多校也不要静默跳过 —— 静默跳过正是这次踩的坑)。
    """
    txt = open(path, encoding='utf-8').read()
    total = bad = 0
    for s in split_stmts(txt):
        m = re.search(r'INSERT INTO public\.(\w+)\s*\(([^)]*?)\)\s*VALUES\s*', s, re.S)
        if not m:
            continue
        if table and m.group(1) != table.replace('public.', ''):
            continue
        cols = [c.strip() for c in m.group(2).split(',')]
        tups = split_tuples(s[m.end():])
        if not tups:                      # 有 VALUES 却切不出元组 = 结构已坏
            bad += 1
            continue
        for tup in tups:
            total += 1
            if len(cols) != len(parse_values(tup)):
                bad += 1
    return total, bad


def apply_pairs(path, pairs, table=None, verbose=True):
    """把 (old, new) 逐条替换进 path。

    old  —— 按【原文形态】给(不用自己转义);函数会同时尝试原形与转义形。
    new  —— 按【原文形态】给;函数**总是**以转义形写入,与 old 命中哪种形态无关。
    每条必须恰好命中 1 次,否则记为失败并跳过(不做部分替换)。
    替换后校验文件结构;若被破坏,抛异常并保持文件不变。
    """
    orig = open(path, encoding='utf-8').read()
    # ★替换前先记基线元组数★(2026-07-25 自测挖出来的第二层洞)
    # 只校"每个元组列数=值数"不够:未转义撇号会把相邻元组**粘成一个**,
    # 而粘连出的那个元组凑巧也可能解出正确的值数 → bad=0 假绿灯,
    # 真正的信号是 total 从 3 掉到 1。文本替换在任何情况下都不该改变元组总数。
    base_total, base_bad = structure_ok(path, table)
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
    if bad > base_bad or total != base_total:
        open(path, 'w', encoding='utf-8', newline='\n').write(orig)   # 回滚
        raise RuntimeError(
            '替换破坏了文件结构,已回滚(文件保持原样)。'
            '元组数 %d→%d(应不变),列数不匹配 %d→%d(应不增)。'
            '多半是新串里的撇号未转义,把相邻元组粘成了一个。'
            % (base_total, total, base_bad, bad))
    if verbose:
        print('替换 %d/%d,结构校验 %d 个 VALUES 元组全部完好(元组数未变)'
              % (done, len(pairs), total))
        for r, o in fails:
            print('  !! %s: %s' % (r, o))
    return done, fails
