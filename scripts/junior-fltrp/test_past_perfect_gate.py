#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""past_perfect_gate 的反向验证。

"全库 0 拦截" 这种结论只有配上反例才有意义 —— 门必须证明它抓得住,
而且证明它在 backshift 上不误伤、在未解禁单元上不放水。

    python scripts/junior-fltrp/test_past_perfect_gate.py
退出码:0=全过
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import past_perfect_gate as g  # noqa: E402

CASES = [
    # (说明, 文本, volume, unit, whole, 期望)
    ('修前 wy8A U1 原句', 'I have travelled by bus many times, but until last week I had never taken a long train ride.', 'wy8A', 'U1', False, 'standalone'),
    ('修后 wy8A U1', 'I have travelled by bus many times, but I have never taken a long train ride until now.', 'wy8A', 'U1', False, None),
    ('修后 wy8A U6', 'so we did something we did not often do.', 'wy8A', 'U6', False, None),
    ('修后 听力 wy8A U3', 'By the end of the year, I read twenty books.', 'wy8A', 'U3', False, None),
    ('修后 wy7B U6', 'by evening I was as tired as a runner after a long race.', 'wy7B', 'U6', False, None),
    ('wy8B U5 宾从 backshift(正课)', 'He said that he had seen the film before.', 'wy8B', 'U5', False, 'backshift'),
    ('wy8B U6 宾从 backshift(正课)', 'She asked me if I had finished my homework.', 'wy8B', 'U6', False, 'backshift'),
    # ↓ 三个防放水反例:形态一样但单元/册没解禁宾从,必须拦
    ('同句放 wy8B U2(宾从未解禁)', 'He said that he had seen the film before.', 'wy8B', 'U2', False, 'standalone'),
    ('同句放 wy8A(整册无宾从)', 'He said that he had seen the film before.', 'wy8A', 'U6', False, 'standalone'),
    ('wy7B 独立过去完成', 'Everyone in my family had gone out.', 'wy7B', 'U2', False, 'standalone'),
    # ↓ 两个防误报反例:had 不是完成时助动词
    ('had to = 不得不', 'We had to leave early.', 'wy7B', 'U2', False, None),
    ('had a/the = 实义动词', 'It had a bad smell and had the best view.', 'wy8A', 'U2', False, None),
]


def main():
    ok = True
    for desc, text, vol, unit, whole, want in CASES:
        hits = g.scan_text(text, vol, unit, whole)
        got = hits[0]['kind'] if hits else None
        if got != want:
            ok = False
        print('%-4s %-34s 期望=%-11s 实得=%s' % ('PASS' if got == want else 'FAIL',
                                              desc, str(want), str(got)))
    print('')
    print('SELFTEST_ALL_PASS=%s (%d 例)' % (ok, len(CASES)))
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
