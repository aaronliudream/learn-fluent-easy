#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""clause_gate 反向自测:成对用例(同句不同册/单元结果必须相反)。"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from clause_gate import scan_text  # noqa

CASES = [
    # ★成对:同句在 wy9A 解禁单元前后结果相反
    ('so that 在 wy9A U2', 'She left early so that she could catch the train.', 'wy9A', 'U2', 'violation'),
    ('so that 在 wy9A U3(正课)', 'She left early so that she could catch the train.', 'wy9A', 'U3', 'allowed'),
    ('so…that 在 wy9A U2', 'He worked so hard that he won the prize.', 'wy9A', 'U2', 'violation'),
    ('so…that 在 wy9A U3(正课)', 'He worked so hard that he won the prize.', 'wy9A', 'U3', 'allowed'),
    ('such…that 在 wy9A U1', 'It was such a cold day that we stayed at home.', 'wy9A', 'U1', 'violation'),
    ('who 定从在 wy9A U3', "He's the boy who won the prize.", 'wy9A', 'U3', 'violation'),
    ('who 定从在 wy9A U4(正课)', "He's the boy who won the prize.", 'wy9A', 'U4', 'allowed'),
    ('which 定从在 wy9A U4', 'The photo which we liked best is here.', 'wy9A', 'U4', 'violation'),
    ('which 定从在 wy9A U5(正课)', 'The photo which we liked best is here.', 'wy9A', 'U5', 'allowed'),
    ('that 定从在 wy9A U4', 'The film that tells of an adventure is good.', 'wy9A', 'U4', 'violation'),
    ('that 定从在 wy9A U5(正课)', 'The film that tells of an adventure is good.', 'wy9A', 'U5', 'allowed'),
    # ★前四册整册拦
    ('so that 在 wy8B U6', 'We save water so that the city can grow.', 'wy8B', 'U6', 'violation'),
    ('who 定从在 wy7A U1', 'The girl who sings is my friend.', 'wy7A', 'U1', 'violation'),
    # ★不该拦的:本门明确不碰的四类状从(前四册已在用)
    ('because 任何册', 'I stayed at home because it rained.', 'wy7A', 'U1', None),
    ('if 条件', 'If it rains, we will stay at home.', 'wy7A', 'U1', None),
    ('when 时间', 'When the weather is fine, we go out.', 'wy7A', 'U1', None),
    ('where 地点', 'Please keep sitting where you are.', 'wy7A', 'U1', None),
    ('until/while', 'He waited until all the guests left.', 'wy8A', 'U2', None),
    # ★白名单/误报陷阱
    ('such as = 例如', 'Sports such as football are popular.', 'wy7A', 'U1', None),
    ('疑问 who', 'Who is the girl over there?', 'wy7A', 'U1', None),
    ('that is why', 'It rained, and that is why we stayed.', 'wy7A', 'U1', None),
    ('so far', 'We have done so much so far.', 'wy8A', 'U1', None),
    ('报告动词后 that = 宾从', 'He said that the film was good.', 'wy8B', 'U5', None),
    ('think that = 宾从', 'I think that the answer is right.', 'wy8B', 'U5', None),
]

def main():
    bad = 0
    for name, text, vol, unit, want in CASES:
        hits = scan_text(text, vol, unit)
        got = None
        if any(h['kind'] == 'violation' for h in hits):
            got = 'violation'
        elif hits:
            got = 'allowed'
        ok = got == want
        if not ok:
            bad += 1
        print('  %s %-34s %-8s → 实得 %-10s 期望 %s' %
              ('✓' if ok else '✗', name, vol + ' ' + unit, str(got), str(want)))
    print('\nSELFTEST_ALL_PASS=%s (%d 例,%d 失败)' % (bad == 0, len(CASES), bad))
    return 1 if bad else 0

if __name__ == '__main__':
    sys.exit(main())
