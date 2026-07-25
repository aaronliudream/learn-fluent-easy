#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""待跑 SQL 的出厂校验(失败即退出码 1,可用于 `&&` 门控提交)。

★为什么要有这个★
两次踩同一个坑:生成 SQL 时给 body/questions 转义了单引号,却忘了给 **WHERE 子句
里的 title** 转义 —— `title='Grandpa's silent love'` 截断字符串,整个文件语句结构崩掉。
第二次我的校验其实已经报警(奇数引号行 11),但 commit 是用 `&&` 串在校验后面的,
而校验脚本无论如何都退出 0,所以没拦住。教训:**校验必须能让流程失败**。

检查项:
  1. 单引号平衡(排除 '' 转义与 $$ 块;跨行字符串按整文件计,不按行)
  2. 语句可切分,UPDATE 条数符合预期(--expect-updates)
  3. questions JSON 可解析,answer ∈ ABCD 且 options 恰 4 项
  4. RAISE EXCEPTION 的 % 占位符与参数配平
  5. BEGIN/COMMIT 配对
  6. 无 <填这里> 之类占位符残留

用法:
    python scripts/junior-fltrp/verify_sql.py SQLAA/xxx.sql --expect-updates 63
"""
import re
import os
import sys
import json
import argparse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from past_perfect_gate import split_stmts  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('path')
    ap.add_argument('--expect-updates', type=int, default=None)
    ap.add_argument('--table', default='public.junior_reading')
    args = ap.parse_args()

    t = open(args.path, encoding='utf-8').read()
    fails = []

    # 1) 引号平衡 —— 整文件计数(跨行字符串按行统计会假警报)
    body = re.sub(r'\$\$.*?\$\$', '', t, flags=re.S)
    body = body.replace("''", "")
    # 去掉 -- 注释行(注释里的撇号对 Postgres 无害)
    body = '\n'.join(l for l in body.split('\n') if not l.lstrip().startswith('--'))
    if body.count("'") % 2 == 1:
        fails.append('单引号不平衡(整文件计数为奇数)——很可能有未转义的撇号')

    # 2) 语句切分 + UPDATE 条数
    stmts = split_stmts(t)
    n_up = sum(1 for s in stmts if ('UPDATE ' + args.table) in s)
    if args.expect_updates is not None and n_up != args.expect_updates:
        fails.append('UPDATE 条数 %d,期望 %d' % (n_up, args.expect_updates))

    # 3) questions JSON
    bad_json = 0
    for s in stmts:
        for m in re.finditer(r"questions\s*=\s*'(.*?)'::jsonb", s, re.S):
            try:
                qs = json.loads(m.group(1).replace("''", "'"))
                for q in qs:
                    if q.get('answer') not in ('A', 'B', 'C', 'D'):
                        bad_json += 1
                    if len(q.get('options', [])) != 4:
                        bad_json += 1
            except Exception as e:
                bad_json += 1
                fails.append('questions JSON 解析失败:%s' % e)
    if bad_json:
        fails.append('questions JSON/答案键异常 %d 处' % bad_json)

    # 4) RAISE 占位符
    for l in t.split('\n'):
        if 'RAISE EXCEPTION' not in l:
            continue
        msg = re.search(r"RAISE EXCEPTION\s+'((?:[^']|'')*)'", l)
        if not msg:
            continue
        nph = msg.group(1).count('%')
        nargs = len([x for x in l.split("',", 1)[1].split(',') if x.strip().rstrip(';')]) \
            if "'," in l else 0
        if nph != nargs:
            fails.append('RAISE 占位符/参数不配平:%s' % l.strip()[:80])

    # 5) BEGIN/COMMIT
    if t.count('\nBEGIN;') != t.count('\nCOMMIT;'):
        fails.append('BEGIN/COMMIT 不配对')

    # 6) 占位符残留
    for ph in ('<填', 'TODO', 'XXX', '<here>'):
        if ph in t:
            fails.append('残留占位符 %s' % ph)

    print('校验 %s' % args.path)
    print('  语句 %d,UPDATE %d' % (len(stmts), n_up))
    if fails:
        print('  ✗ 不通过:')
        for f in fails:
            print('    - %s' % f)
        return 1
    print('  ✓ 全部通过')
    return 0


if __name__ == '__main__':
    sys.exit(main())
