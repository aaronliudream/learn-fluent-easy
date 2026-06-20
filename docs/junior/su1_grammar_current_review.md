# 7A Starter U1 语法现状导出(只读·未删未改)

单元标题: **Starter 1 Hello!**

## 1) 当前关联的库语法点(grammarCode)
- grammarTitle: `问候与 be 动词`
- grammarCode(单): `null`
- grammarCodes(多): `null`
- grammarKpCode: `null`

**结论:Starter U1 未挂任何库语法点(grammarCode=null)。** 因此它在「语法专项」关里显示的是写死在 grade7.json 的 inline grammarQuiz(下方第2节),这些 inline 题**不在** junior_grammar_questions 表里,也**没有** question_skill_map 技能映射。

## 2) inline grammarQuiz 现状(共 13 道)

| # | 题干 | 选项 | 答案 | 考点(point 字段) |
|---|---|---|---|---|
| 1 | Hello! ___ name is Lin Tao. | A.My / B.I / C.Me | A. My | 形容词性物主代词 my |
| 2 | This ___ my friend, Mike. | A.is / B.are / C.am | A. is | be动词·三单 is |
| 3 | Can you ___ your name, please? | A.spell / B.spells / C.spelling | A. spell | 实义动词原形 |
| 4 | Nice to meet ___. | A.you / B.your / C.yours | A. you | 宾格 you |
| 5 | ___ I have your name, please? | A.May / B.Do / C.Am | A. May | 情态动词 May·礼貌请求 |
| 6 | — ___ is your name? — My name is Emma. | A.How / B.What / C.Where | B. What | 特殊疑问句 What·问姓名 |
| 7 | — ___ do you spell your name? — E-M-M-A. | A.What / B.Where / C.How | C. How | 特殊疑问句 How·问拼写 |
| 8 | I ___ Peter Brown. | A.am / B.is / C.are | A. am | be动词·第一人称 am |
| 9 | We ___ in the same class. | A.am / B.is / C.are | C. are | be动词·复数 are |
| 10 | — How ___ you? — I'm fine, thank you. | A.am / B.are / C.is | B. are | be动词·疑问 are |
| 11 | — Where ___ Ms Gao? — She is in the classroom. | A.are / B.is / C.am | B. is | be动词·疑问语序 is |
| 12 | — Let's go to class. ___! — Bye! | A.Goodbye / B.Thanks / C.Welcome | A. Goodbye | 告别语 Goodbye/Bye |
| 13 | ___ is my friend, Mike. | A.These / B.This / C.Those | B. This | 指示代词 this |

## 3) 技能映射(question_skill_map)
inline grammarQuiz 没有数据库 question_id,故 **0 条技能映射**。删/改这些 inline 题**不会破坏任何 question_skill_map / junior_skills**(它们只挂在 junior_grammar_questions 的 DB 题上)。

## 4) 参考:库中与 Starter U1 六考点对应的现成语法点(可选,未链)
(如将来想把 Starter U1 从 inline 改为链库点,这些是对应候选;括号为该点题数)

- `g7-t04` be 动词（am/is/are） — 185 题
- `g7-t02` 人称代词与物主代词 — 158 题
- `g7-t08` 疑问词（Wh-questions） — 121 题
- `g7-t01` 名词单复数 — 76 题
- `g7-t03` 冠词 a/an/the — 70 题
- `g7-t09` 指示代词 (this/that/these/those) — 51 题

六考点对应关系(初判):
1. Be动词+自我介绍 → `g7-t04` be动词
2. 特殊疑问词 How/What/Where → `g7-t08` Wh-疑问词
3. 情态动词 May 礼貌 → ⚠️ 库中**无**独立"May 礼貌请求"点(可能要新增或并入)
4. 物主代词 My/Your → `g7-t02` 人称代词与物主代词
5. 名词代词单复数一致 → `g7-t01` 名词单复数(+ g7-t02 代词)
6. 字母顺序/查词法 → ⚠️ 库中**无**字母表/查词法点(偏词法,非句法语法)
