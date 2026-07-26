#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""闸门反向自测:听力语料必须真的被扫到、结构校验必须真的会失败。

★为什么要有这个★
2026-07-25 收官时发现两个"看起来绿、其实没扫"的失效:
  ① ngram_similarity 只扫 reading load,听力 transcript 一个字都没比过 → 报 0 处雷同;
  ② apply_edits.structure_ok 的 table 默认 'junior_reading',听力那种
     **单条 INSERT 带 N 个值元组**被整条跳过,校验是 no-op。
两者共同点:**沉默的 0 命中**。所以本测试全部写成**反向用例**——先构造一个
必然该被抓住的坏样本,断言"抓住了";再构造干净样本,断言"没误报"。
只跑正向绿灯的测试对这类失效毫无防御力。

用法:
    python scripts/junior-fltrp/test_gates_listening.py
退出码:0=全过,1=有失败
"""
import os
import re
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ngram_similarity as NG            # noqa: E402
from apply_edits import structure_ok, apply_pairs, esc   # noqa: E402

FAILS = []


def check(name, got, want):
    ok = got == want
    print('  %s %-52s 实得 %-22s 期望 %s' % ('✓' if ok else '✗', name, repr(got), repr(want)))
    if not ok:
        FAILS.append(name)


# ── 样本构造 ────────────────────────────────────────────────────────
LIS_COLS = "grade, publisher, volume, unit, title, transcript, kind, difficulty"


def listening_sql(rows):
    """一条 INSERT 带 N 个值元组 —— 复刻听力灌库的真实形态。"""
    tup = ",\n".join(
        "  (%d, 'junior_fltrp', '%s', '%s', '%s', '%s', 'dialogue', 1)"
        % (g, vol, unit, esc(title), esc(text)) for g, vol, unit, title, text in rows)
    return ("-- 听力灌库(单条多元组)\n"
            "INSERT INTO public.junior_listening_exercises (%s) VALUES\n%s;\n" % (LIS_COLS, tup))


READ_COLS = "publisher, volume, unit, difficulty, title, body, word_count"


def reading_sql(rows):
    """一条 INSERT 一个元组 —— 复刻阅读灌库的真实形态。"""
    return "".join(
        "INSERT INTO public.junior_reading (%s) VALUES ('junior_fltrp', '%s', '%s', %d, '%s', '%s', %d);\n"
        % (READ_COLS, vol, unit, diff, esc(title), esc(text), len(text.split()))
        for vol, unit, diff, title, text in rows)


SHARED = ("the little seed will need water and sunlight to grow into a tall tree")
OTHER_A = ("my brother plays basketball every saturday with his classmates in the park")
OTHER_B = ("we visited the science museum and saw a huge model of the solar system")


def write(tmp, name, body):
    p = os.path.join(tmp, name)
    open(p, 'w', encoding='utf-8', newline='\n').write(body)
    return p


# ── ① ngram:听力必须被载入、三个方向都必须真的比 ──────────────────
def test_ngram(tmp):
    print('\n【① ngram_similarity 听力扫描】')
    write(tmp, 'wy9A-listening-load.sql', listening_sql([
        (9, 'wy9A', 'U1', 'Seed talk', 'Today ' + SHARED + ' and then it will bloom.'),
        (9, 'wy9A', 'U2', 'Museum day', 'Last week ' + OTHER_B + ' before lunch.'),
    ]))
    write(tmp, 'wy9A-reading-load.sql', reading_sql([
        ('wy9A', 'U1', 0, 'A tree begins', 'In spring ' + SHARED + ' beside our school gate.'),
        ('wy9A', 'U3', 1, 'Weekend', 'On weekends ' + OTHER_A + ' near the river.'),
    ]))
    NG.__dict__['_sqlaa'] = lambda: tmp          # 把语料根指到临时目录

    lis, rd = NG.load_listening(), NG.load_passages()
    check('听力被载入(此前恒为 0)', len(lis), 2)
    check('阅读被载入', len(rd), 2)
    check('单条多元组 INSERT 全部解出', sorted(x['title'] for x in lis), ['Museum day', 'Seed talk'])

    ps = rd + lis
    grams = [NG.ngrams(NG.tokens(p['body']), 8) for p in ps]
    hits = {}
    for i in range(len(ps)):
        for j in range(i + 1, len(ps)):
            n = len(set(grams[i]) & set(grams[j]))
            if n:
                hits[NG.pair_kind(ps[i], ps[j])] = hits.get(NG.pair_kind(ps[i], ps[j]), 0) + 1
    # 埋的重合只在「听力 Seed talk × 阅读 A tree begins」之间
    check('听力×阅读 抓到植入的重合', hits.get('听力×阅读', 0), 1)
    check('听力×听力 无误报(两篇无关)', hits.get('听力×听力', 0), 0)
    check('阅读×阅读 无误报(两篇无关)', hits.get('阅读×阅读', 0), 0)
    check('pair_kind 方向标签正确', NG.pair_kind(lis[0], rd[0]), '听力×阅读')


# ── ② structure_ok:多元组必须逐个校,坏的必须被抓 ────────────────
def test_structure(tmp):
    print('\n【② apply_edits.structure_ok 多元组校验】')
    good = write(tmp, 'good.sql', listening_sql([
        (9, 'wy9A', 'U1', "Grandpa's talk", "He said it's fine."),
        (9, 'wy9A', 'U2', 'Plain', 'Nothing special here.'),
        (9, 'wy9A', 'U3', 'Third', 'A third row.'),
    ]))
    check('3 个元组全部被校(旧实现为 0 = no-op)', structure_ok(good), (3, 0))
    check('显式传听力表名结果一致', structure_ok(good, 'junior_listening_exercises'), (3, 0))
    check('传别的表名 → 不校这张表', structure_ok(good, 'junior_reading'), (0, 0))

    # ★坏样本:未转义撇号把相邻元组**粘成一个**★
    # 注意它的表现形式:列数校验看不出来(粘连元组凑巧也解出 8 个值 → bad 仍是 0),
    # 真正的信号是元组总数 3→1。所以断言要盯 total,不能只盯 bad。
    broken_txt = open(good, encoding='utf-8').read().replace("'Plain'", "'Grandpa's talk'")
    bad = write(tmp, 'bad.sql', broken_txt)
    tot, nbad = structure_ok(bad)
    check('未转义撇号使元组被粘连(total 3→1)', tot, 1)
    check('——且列数校验单独看不出来(印证只校列数不够)', nbad, 0)

    # apply_pairs 的不变量:替换后元组数必须不变,否则回滚 + 抛异常。
    # 这里故意让 old 吃掉一个右引号 → 元组粘连 → 必须被拦。
    before = open(good, encoding='utf-8').read()
    raised = False
    try:
        apply_pairs(good, [("Nothing special here.'", 'Nothing special here.')], verbose=False)
    except RuntimeError:
        raised = True
    check('替换致元组粘连 → 抛异常', raised, True)
    check('——且文件已回滚到原样(逐字节相同)', open(good, encoding='utf-8').read() == before, True)
    check('——回滚后结构完好', structure_ok(good), (3, 0))

    # 正向:新串带撇号,apply_pairs 自动 esc,不该报错、结构不该坏
    ok_raised = False
    try:
        apply_pairs(good, [('Nothing special here.', "Grandpa's garden is quiet.")], verbose=False)
    except RuntimeError:
        ok_raised = True
    check('新串撇号被自动转义、不误拦', (ok_raised, structure_ok(good)), (False, (3, 0)))
    check('——且替换真的发生了', "Grandpa''s garden" in open(good, encoding='utf-8').read(), True)


def main():
    with tempfile.TemporaryDirectory() as tmp:
        test_ngram(tmp)
        test_structure(tmp)
    print('\nSELFTEST_ALL_PASS=%s (%d 例失败)' % (not FAILS, len(FAILS)))
    for f in FAILS:
        print('  !! 失败: %s' % f)
    return 1 if FAILS else 0


if __name__ == '__main__':
    sys.exit(main())
