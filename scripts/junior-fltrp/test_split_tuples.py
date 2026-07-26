#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""split_tuples 反向自测。

起因(2026-07-26,wy9A 听力):元组之间的 `-- …club's…` 注释里有撇号,
被当成字符串起始,引号状态错位 → 36 个元组被切成 50 个,**而且不报错**,
只是少解出 10 篇。这类"静默少解"是最难发现的,所以正反两向都要钉住。
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from past_perfect_gate import split_tuples   # noqa

CASES = [
    ('普通三元组', "\n  (1, 'a'),\n  (2, 'b'),\n  (3, 'c');", 3),
    ('注释里带撇号(踩过的那个)',
     "\n  -- U5 dialogue《The bird club's first morning》85 词\n  (1, 'a'),\n"
     "  -- U6 notice《Ben's plan》\n  (2, 'b');", 2),
    ('字符串里带 ASCII 括号',
     "\n  (1, '摔不烂的(un- + break + -able)'),\n  (2, 'x');", 2),
    ('字符串里带转义单引号',
     "\n  (1, 'Teachers'' Day is on Friday'),\n  (2, 'y');", 2),
    ('字符串里带 -- 不应被当注释',
     "\n  (1, 'a -- not a comment '')'),\n  (2, 'b');", 2),
    ('注释里带括号',
     "\n  -- (这行是注释,带括号)\n  (1, 'a');", 1),
    ('多行字符串(听力 transcript 带换行)',
     "\n  (1, 'A: hi\nB: hello'),\n  (2, 'z');", 2),
]


def main():
    fails = 0
    for name, tail, want in CASES:
        got = len(split_tuples(tail))
        ok = got == want
        fails += 0 if ok else 1
        print('  %s %-28s → 实得 %d 个  期望 %d 个' % ('✓' if ok else '✗', name, got, want))
    print('\nSELFTEST_ALL_PASS=%s (%d 例,%d 失败)' % (not fails, len(CASES), fails))
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main())
