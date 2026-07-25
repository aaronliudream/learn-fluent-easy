#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
补审贴文审计:核对"贴给 Aaron 审的正文"是否等于灌库文件里的真实正文。

背景(2026-07-25):补审过程中发现两次 —— 贴给 Aaron 的四篇泛读正文是照单元
体裁重写的,不是从源拉的。标题、语法点、体裁都对,只有正文是假的,人工分辨不出。
本脚本把"我贴了什么"固化成探针(每篇首句),回源文件比对,给出可复现的判定。

★为什么用源文件而不是查 DB★
没有 DB 查询工具。但"是不是编造"用源文件就能判死:编造的文本在文件的
**任何一个历史版本**里都不存在。脚本同时比对当前版本和基线版本,避免把
"后来被修过"误判成"编造"。
DB 与文件的已知差异 = 尚未执行的 UPDATE SQL,与本判定无关。

用法:
    python scripts/junior-fltrp/audit_presented_text.py
退出码:0=全部为真文本,1=存在编造
"""
import os
import re
import sys
import subprocess

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from past_perfect_gate import split_stmts, parse_values  # noqa: E402

BASELINE = '5fa515b6'   # 泛读补齐那批的原始提交
FILES = {'wy7B': 'SQLAA/wy7b-reading-load.sql', 'wy8A': 'SQLAA/wy8a-reading-load.sql'}

# 贴给 Aaron 审的那一版,每篇首句(探针)
PRESENTED = {
    ('wy7B', 'U1'): ["Last Sunday, my family went to the zoo",
                     "Last week was my twelfth birthday",
                     "Yesterday, something worried me a lot",
                     "Last Sunday, it rained all day"],
    ('wy7B', 'U2'): ["One evening, I was alone at home",
                     "This morning, something in my school bag felt heavy",
                     "Last Monday, our class had a special morning",
                     "On the first day of the holiday, I had nothing to do"],
    ('wy7B', 'U3'): ["I love my grandma's kitchen",
                     "Last night, I went to a school concert",
                     "Autumn is my favourite season",
                     "Today my father cooked dinner"],
    ('wy7B', 'U4'): ["Do you want to stay healthy? Here are some simple rules",
                     "Everyone wants a good friend, but how can you be one",
                     "Do you want to plant a flower at home",
                     "Our classroom is our second home, so let's keep it clean. Please put your rubbish"],
    ('wy7B', 'U5'): ["My hometown is beautiful all year",
                     "There are five people in my family",
                     "My family once lived in a big city",
                     "I love reading, and I once looked for the best place"],
    ('wy7B', 'U6'): ["I have two best friends, Anna and Kate",
                     "Last summer, my family visited both the mountains and the sea",
                     "My neighbours have twin boys, Tom and Sam",
                     "Yesterday was as busy as any school day"],
    ('wy8A', 'U1'): ["Have you ever kept a pet? I have had a little cat called Mimi",
                     "I have travelled by bus and by car many times",
                     "This year, I have started a happy new habit",
                     "I have kept the same hobby since I was seven"],
    ('wy8A', 'U2'): ["Our small town has changed a lot in the last few years",
                     "Something wonderful has happened",
                     "At the start of this term, our class was just a group of strangers",
                     "The small river behind our school has come back to life"],
    ('wy8A', 'U3'): ["School finishes at four o'clock",
                     "Last term I decided to learn to cook",
                     "Many of my classmates prefer watching short videos",
                     "I always look forward to the weekend, because I get to choose what to do"],
    ('wy8A', 'U4'): ["My mother wants me to grow into a kind and useful person",
                     "Our football coach, Mr Li, is strict but kind",
                     "Last year, I was weak in maths",
                     "My little brother is only six"],
}


def repo(path):
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', path)


def unesc(t):
    return t.replace("''", "'")


def real_titles(vol, unit):
    txt = open(repo(FILES[vol]), encoding='utf-8').read()
    out = []
    for s in split_stmts(txt):
        if 'INSERT INTO public.junior_reading' not in s:
            continue
        m = re.search(r'\(([^)]*)\) VALUES \(', s)
        cols = [c.strip() for c in m.group(1).split(',')]
        vals = parse_values(s[m.end():].strip()[:-1])
        if len(cols) != len(vals):
            continue
        d = dict(zip(cols, vals))
        if d['unit'] == unit and d['difficulty'] == '1':
            out.append(unesc(d['title']))
    return out


def main():
    cur = {k: unesc(open(repo(v), encoding='utf-8').read()) for k, v in FILES.items()}
    base = {}
    for k, v in FILES.items():
        r = subprocess.run(['git', 'show', BASELINE + ':' + v],
                           capture_output=True, cwd=repo('.'))
        base[k] = unesc(r.stdout.decode('utf-8'))

    print('探针 = 贴给 Aaron 的那一版每篇首句;比对当前版本(cur)与基线 %s(base)' % BASELINE)
    print('')
    print('%-6s %-5s %-8s %-9s %s' % ('册', '单元', '首句命中', '标题一致', '结论'))
    print('-' * 62)
    bad = 0
    for (vol, unit), probes in PRESENTED.items():
        where = ['cur' if p in cur[vol] else ('base' if p in base[vol] else 'MISS')
                 for p in probes]
        miss = where.count('MISS')
        titles_ok = len(real_titles(vol, unit)) == len(probes)
        if miss == len(probes):
            verdict = '★编造(正文全不存在)'
            bad += 1
        elif miss == 0:
            verdict = '真文本'
        else:
            verdict = '部分对不上 %d/%d' % (miss, len(probes))
            bad += 1
        print('%-6s %-5s %-8s %-9s %s' % (
            vol, unit, '%d/%d' % (len(probes) - miss, len(probes)),
            '是' if titles_ok else '否', verdict))
    print('')
    print('结论:%d 个单元为真文本,%d 个单元存在编造。' % (len(PRESENTED) - bad, bad))
    print('')
    print('★注意★ 编造件的**标题**与源一致 —— 这正是人工分辨不出的原因;')
    print('        只有正文是照体裁重写的。判定必须比正文,不能比标题。')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
