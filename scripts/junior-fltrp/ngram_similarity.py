#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
外研社初中语料·8-gram 雷同自查(常驻版)

背景:原生成流水线里有 8-gram 原创性检查,但那个脚本没进过仓库(和时序门当初一样),
补审阶段就用不上了 —— "改写雷同"只能靠人眼。这里补成常驻脚本。

做两件事:
  ① 篇目互比 —— 全库任意两篇之间的连续 N 词重合(默认 8)。同一批生成的稿子
     容易套模板,这是最常见的雷同来源。
  ② 对源文本比(可选) —— 给 --source 目录,逐篇与源文本比,查是否抄了原文。
     没有源文本时跳过,并**如实报告"未比对"**,不假装通过。

★为什么不能只报总数★
8-gram 重合里有大量是无害的高频串("I have never seen it before" 这类)。所以输出
把重合片段原文打出来,由人判是"模板雷同"还是"常用表达"。

★判定口径(2026-07-25 Aaron 定)★
  改:同一篇对 **≥3 处**连续重合,或明显是同单元照着另一篇句式写的模板雷同。
      例:wy8B U1 精读《So much is done for you》与泛读《Homes of the future》
      同写"未来能源",3 处重合 `energy will be made from the sun and the wind`
      —— 泛读是照精读句式写的,已改泛读那处。
  放:**1 处**且属话题固有表达或语法点本身的句式。
      例:春节两篇的 `on New Year's Eve the whole family sits`(除夕全家围坐,
      写春节几乎没法不这么说);山海两篇的 `but the view from the top was as`
      (U6 就是 as…as 单元,`was as` 是语法点本身)。
这和"词汇化习语 vs 语法结构"、"宾从 backshift vs 独立过去完成时"是同一个思路:
**形式命中 ≠ 真问题**,机器给证据,判定留给人。

用法:
    python scripts/junior-fltrp/ngram_similarity.py                # 全库互比,N=8
    python scripts/junior-fltrp/ngram_similarity.py --n 10         # 改窗口
    python scripts/junior-fltrp/ngram_similarity.py --min-hits 3   # 只报重合≥3处的篇对
    python scripts/junior-fltrp/ngram_similarity.py --source docs/源文本/
退出码:0=无超阈值雷同,1=有
"""
import os
import re
import sys
import glob
import json
import argparse
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from past_perfect_gate import split_stmts, parse_values  # noqa: E402

# 这些串是题型/体裁的固定骨架,不算雷同(说明文都会有 "what is the passage mainly about")
BOILERPLATE = [
    r"what is the passage mainly about",
    r"what is the best main idea of the passage",
    r"in the passage the word",
    r"we can infer that",
    r"according to the passage",
]
BOILER_RE = re.compile('|'.join(BOILERPLATE), re.I)


def tokens(text):
    return re.findall(r"[a-z]+(?:'[a-z]+)?", text.lower())


def ngrams(toks, n):
    return {tuple(toks[i:i + n]): i for i in range(len(toks) - n + 1)}


def load_passages():
    """从四册 reading SQL 抽 (册, 单元, 精/泛, 标题, 正文)"""
    out = []
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'SQLAA')
    # recursive:load 跑完会被归档进 SQLAA/done/,非递归 glob 会静默载入 0 篇
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
            out.append({
                'vol': d['volume'], 'unit': d['unit'],
                'kind': '精读' if d['difficulty'] == '0' else '泛读',
                'title': d['title'], 'body': d['body'],
            })
    return out


def load_sources(srcdir):
    out = []
    for path in sorted(glob.glob(os.path.join(srcdir, '**', '*.txt'), recursive=True)):
        out.append({'title': os.path.basename(path), 'body': open(path, encoding='utf-8').read()})
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--n', type=int, default=8, help='连续词窗口(默认 8)')
    ap.add_argument('--min-hits', type=int, default=1, help='一对篇目至少多少处重合才报')
    ap.add_argument('--source', default=None, help='源文本目录(可选)')
    args = ap.parse_args()

    ps = load_passages()
    print('载入篇目 %d 篇(%s)' % (len(ps), ', '.join(sorted({p['vol'] for p in ps}))))
    if not ps:
        print('!! 一篇都没载入,结果不可信')
        return 2

    grams = []
    for p in ps:
        toks = tokens(p['body'])
        grams.append(ngrams(toks, args.n))
        p['toks'] = toks
    print('平均每篇 %d 词、%d 个 %d-gram' %
          (sum(len(p['toks']) for p in ps) // len(ps),
           sum(len(g) for g in grams) // len(ps), args.n))
    print('')

    # ── ① 篇目互比 ───────────────────────────────────────────────
    pairs = defaultdict(list)
    for i in range(len(ps)):
        for j in range(i + 1, len(ps)):
            common = set(grams[i]) & set(grams[j])
            for c in common:
                phrase = ' '.join(c)
                if BOILER_RE.search(phrase):
                    continue
                pairs[(i, j)].append(phrase)

    flagged = {k: v for k, v in pairs.items() if len(v) >= args.min_hits}
    print('【篇目互比】%d 对篇目存在 %d-gram 重合(阈值 ≥%d 处)' %
          (len(flagged), args.n, args.min_hits))
    for (i, j), phrases in sorted(flagged.items(), key=lambda x: -len(x[1])):
        a, b = ps[i], ps[j]
        print('  %s %s %s《%s》  ×  %s %s %s《%s》  —— %d 处' % (
            a['vol'], a['unit'], a['kind'], a['title'],
            b['vol'], b['unit'], b['kind'], b['title'], len(phrases)))
        for ph in sorted(phrases)[:6]:
            print('      "%s"' % ph)
        if len(phrases) > 6:
            print('      …另 %d 处' % (len(phrases) - 6))

    # ── ② 对源文本比 ─────────────────────────────────────────────
    print('')
    if not args.source:
        print('【对源文本比】未执行 —— 没给 --source。')
        print('  注意:这不等于"与源文本无重合",只是没比。原创稿无源可比属正常;')
        print('  贴原文改写的册(如 AM3 贴 NCE3)必须给源目录再跑一次。')
    else:
        srcs = load_sources(args.source)
        print('【对源文本比】源 %d 篇' % len(srcs))
        if not srcs:
            print('  !! 源目录里一个 .txt 都没有,未实际比对')
        for p, gp in zip(ps, grams):
            for s in srcs:
                common = set(gp) & set(ngrams(tokens(s['body']), args.n))
                common = {c for c in common if not BOILER_RE.search(' '.join(c))}
                if common:
                    print('  %s %s《%s》 × 源《%s》 —— %d 处' %
                          (p['vol'], p['unit'], p['title'], s['title'], len(common)))
                    for c in sorted(common)[:4]:
                        print('      "%s"' % ' '.join(c))

    return 1 if flagged else 0


if __name__ == '__main__':
    sys.exit(main())
