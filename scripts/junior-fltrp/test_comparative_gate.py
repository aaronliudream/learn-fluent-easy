#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""comparative_gate 的反向验证。

这道门比 past_perfect 更容易砸正课:wy7B **U5 就是比较级最高级、U6 就是 as…as**。
所以最关键的用例是成对的 —— 同一个句子在 U3 必须拦、在 U5/U6 必须放。

    python scripts/junior-fltrp/test_comparative_gate.py
退出码:0=全过
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import comparative_gate as g  # noqa: E402

CASES = [
    # ★成对用例:同句不同单元,结果必须相反(防止门砸正课 / 防止门放水)
    ('比较级在 U3', 'The soup tastes better than any food.', 'wy7B', 'U3', 'violation'),
    ('比较级在 U5(正课)', 'The soup tastes better than any food.', 'wy7B', 'U5', 'allowed'),
    ('as…as 在 U3', 'a voice as sweet as a bird', 'wy7B', 'U3', 'violation'),
    ('as…as 在 U6(正课)', 'a voice as sweet as a bird', 'wy7B', 'U6', 'allowed'),
    ('as…as 在 U5 仍拦(U6 才教)', 'The air was as cool as autumn.', 'wy7B', 'U5', 'violation'),
    # 册级阈值
    ('wy7A 整册未教比较级', 'The ants are bigger than their food.', 'wy7A', 'U6', 'violation'),
    ('wy8A 整册已解禁', 'The river is cleaner than before.', 'wy8A', 'U1', 'allowed'),
    ('最高级在 U2', 'It was the sweetest surprise.', 'wy7B', 'U2', 'violation'),
    # ★be more than 的两面(2026-07-25 补)★
    # 现场:wy7A U2 听力题干把正文的说法加引号引用,系动词不再紧邻 more,
    # 白名单漏判 → 报成 wy7A 超前。放宽夹缝后必须仍拦住 worth/costs 那类真比较。
    ('be more than·紧邻', 'Collecting stamps is more than fun.', 'wy7A', 'U2', None),
    ('be more than·夹引号', "Why is Lucy's hobby ''more than fun''?", 'wy7A', 'U2', None),
    ('be more than·夹冠词', 'Her hobby is really more than a game.', 'wy7A', 'U2', None),
    ('worth more than 是真比较', 'This old book is worth more than gold.',
     'wy7A', 'U2', 'violation'),
    ('costs more than 是真比较', 'It costs more than a book.', 'wy7A', 'U2', 'violation'),
    ('matters more than 是真比较', 'Health matters more than money.',
     'wy7A', 'U2', 'violation'),
    ('there be more than 是数量', 'There were more than twenty people.', 'wy7A', 'U2', None),
    # 习语白名单
    ('do your best', 'Just do your best every day.', 'wy7B', 'U1', None),
    ('at least', 'It took at least two hours.', 'wy7B', 'U1', None),
    ('as soon as(时间连词)', 'As soon as I opened the door, it smelled nice.', 'wy7B', 'U3', None),
    ('as soon as possible', 'Come as soon as possible.', 'wy7B', 'U1', None),
    ('as usual', 'She came late as usual.', 'wy7B', 'U1', None),
    ('Years later(时间副词)', 'Years later, I still remember that day.', 'wy7B', 'U1', None),
    # 词形陷阱
    ('forest / honest 不是最高级', 'We walked in the forest and he is honest.', 'wy7B', 'U1', None),
    ('most leaves = 大多数', 'Most leaves turn yellow.', 'wy7B', 'U3', None),
    ('the most beautiful = 最高级', 'It was the most beautiful place.', 'wy7B', 'U3', 'violation'),
    # 真比较级不能被习语规则误放
    ('earlier 作比较级仍拦', 'You should go to bed earlier.', 'wy7A', 'U1', 'violation'),
    # ── 裸 best 口径(2026-07-25 Aaron 定):词汇化放、the best X in/of 范围拦 ──
    ('like English best', 'I like English best. It is fun.', 'wy7A', 'U1', None),
    ('the best gift(无范围)', 'the best gift is always my family', 'wy7A', 'U4', None),
    ('be the best', 'we do not need to be the best', 'wy7A', 'U2', None),
    ('their best work', 'Students bring their best work.', 'wy7A', 'U2', None),
    ('my best friend', 'My best friend gave me a book.', 'wy7B', 'U1', None),
    ('★the best X in 范围 → 拦', 'He is the best player in our class.', 'wy7B', 'U1', 'violation'),
    ('★the best X of 范围 → 拦', 'dinner time is the best time of the day', 'wy7A', 'U3', 'violation'),
    ('one of the best(无范围)', 'It was one of the best days.', 'wy7B', 'U1', None),
    ('★one of the best X of 范围 → 拦', 'one of the best days of my whole holiday', 'wy7B', 'U1', 'violation'),
    # 口径只管裸 best:其余最高级照常拦
    ('happiest 仍拦', 'It was the happiest birthday.', 'wy7B', 'U1', 'violation'),
    ('the most precious 仍拦', 'Simple food is the most precious.', 'wy7B', 'U3', 'violation'),
]


def main():
    ok = True
    for desc, text, vol, unit, want in CASES:
        hits = g.scan_text(text, vol, unit)
        got = hits[0]['kind'] if hits else None
        if got != want:
            ok = False
        print('%-4s %-30s 期望=%-12s 实得=%s' % ('PASS' if got == want else 'FAIL',
                                              desc, str(want), str(got)))
    print('')
    print('SELFTEST_ALL_PASS=%s (%d 例)' % (ok, len(CASES)))
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
