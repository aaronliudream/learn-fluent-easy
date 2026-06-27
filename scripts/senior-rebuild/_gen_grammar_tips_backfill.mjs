// 生成 WU/U1/U2/U3 grammar_tips 回补 SQL(自动转义单引号,避免手写漏转义)。
import { writeFileSync } from 'node:fs';
const jb = o => "'" + JSON.stringify(o).replace(/'/g, "''") + "'::jsonb";

const TIPS = {
  WU: {
    title: "英语基本句型 速查",
    intro: "英语句子万变不离这几种基本结构;分析句子先找主语 + 谓语动词(及物/不及物/系动词),再判断结构。",
    table: { headers: ["基本句型", "例句"], rows: [
      ["主谓 SV", "The students are working hard."],
      ["主谓宾 SVO", "I like English."],
      ["主系表 SP", "The soup tastes good."],
      ["主谓双宾 SVOO", "She gave me a book."],
      ["主谓宾补 SVOC", "We call him Tom."],
      ["主谓状 SVA", "He lives in Beijing."],
      ["There be", "There is a book on the desk."],
    ] },
    specialRules: [
      { rule: "系动词(be/look/taste/sound/feel/become…)后接表语,不是宾语", mark: "SP ≠ SVO" },
      { rule: "双宾:间接宾语(人)在前、直接宾语(物)在后", mark: "give sb sth = give sth to sb" },
      { rule: "宾补补充说明宾语:call him Tom / make us happy", mark: "SVOC" },
      { rule: "There be 表存在,主语在 be 之后,就近一致", mark: "There is a pen and two books." },
    ],
    why: ["看懂长难句的第一步,是把它拆回这几种基本句型:先定主谓,再看动词类型。"],
    gaokaoPoints: ["辨析及物/不及物动词与系动词;长难句分析、语法填空都靠拆基本句型。"],
    examVsReal: [{ exam: "It tastes good.(完整主系表)", real: "Tastes good!(口语省略主语)", note: "考试要完整句;口语常省略主谓" }],
  },
  U1: {
    title: "名词短语 / 形容词短语 / 副词短语 速查",
    intro: "短语是句子的'积木':中心词 + 修饰成分。看懂长名词短语是读长难句的关键。",
    table: { headers: ["短语", "例子"], rows: [
      ["名词短语 NP", "a tall young teacher / the man in black"],
      ["形容词短语 AdjP", "be good at sports / interested in art"],
      ["副词短语 AdvP", "quite well / very carefully"],
      ["NP 后置定语", "the book on the desk"],
    ] },
    specialRules: [
      { rule: "多个形容词排序:限定词→描绘→大小→形状→年龄→颜色→国籍→材料→中心名词", mark: "OSASCOMP" },
      { rule: "形容词短语可作表语或后置定语", mark: "a boy interested in art / He is interested in art." },
      { rule: "副词短语修饰动词/形容词/副词", mark: "run very fast" },
    ],
    why: ["名词短语 = 中心名词 + 前后修饰;拆出中心词,长名词短语就不难懂了。"],
    gaokaoPoints: ["多重形容词排序、形容词短语作后置定语;语法填空高频。"],
    examVsReal: [{ exam: "a big old wooden house(按形容词顺序)", real: "口语里顺序没那么死", note: "考试按 OSASCOMP;日常交流不严格" }],
  },
  U2: {
    title: "将来时三式 速查",
    intro: "三种都表将来,区别在'计划程度'与'语气':已定安排 > 计划/打算 > 临时决定/预测。",
    table: { headers: ["用法", "例句"], rows: [
      ["be going to:计划/有迹象预测", "We are going to travel. / Look, it is going to rain."],
      ["will:临时决定/预测/承诺", "The phone is ringing—I will answer it."],
      ["现在进行时表将来:已定安排", "We are flying to Peru next Monday."],
    ] },
    specialRules: [
      { rule: "be going to:已有打算,或眼前有迹象的预测", mark: "Look at the clouds!" },
      { rule: "will:说话当下临时决定 / 承诺 / 主动提议", mark: "I will help you." },
      { rule: "现在进行时表将来:近期已定、常带将来时间状语", mark: "I am visiting them this weekend." },
      { rule: "进行时表将来用'安排类'动词,瞬间动词不自然", mark: "用 take/fly/meet/leave,不用 catch/arrive" },
    ],
    why: ["选哪种看'确定度':已订票=进行时;有计划=be going to;说话当下决定=will。"],
    gaokaoPoints: ["be going to vs will 辨析、现在进行时表将来;语法填空/单选高频。"],
    examVsReal: [{ exam: "I am leaving tomorrow.(已定)", real: "I will leave tomorrow.(口语也常用)", note: "考试看语境区分;口语 will / be going to 常通用" }],
  },
  U3: {
    title: "反意疑问句 速查",
    intro: "前肯后否、前否后肯;反问部分 = 助动词/be/情态 + 主语代词。浏览完做题更有把握。",
    table: { headers: ["陈述句", "反意疑问"], rows: [
      ["You play badminton,", "don't you?"],
      ["She is an athlete,", "isn't she?"],
      ["They won the match,", "didn't they?"],
      ["It isn't a real sport,", "is it?"],
      ["You have finished,", "haven't you?"],
      ["We can join the team,", "can't we?"],
    ] },
    specialRules: [
      { rule: "I am … , aren't I?", mark: "唯一特例:不用 amn't I" },
      { rule: "Let's … , shall we?", mark: "Let's 提议固定用 shall we" },
      { rule: "祈使句 … , will you?", mark: "Pass me the ball, will you?" },
      { rule: "Nobody/Nothing …, did they / can it?", mark: "否定词作主语 → 反问用肯定" },
      { rule: "Everyone/Somebody …, didn't they?", mark: "不定代词主语 → 反问用 they" },
      { rule: "There be … , …there?", mark: "There is…, isn't there?" },
    ],
    why: [
      "aren't I 是历史习惯:amn't I 拗口、英语里被淘汰,统一借用 aren't I。",
      "含 never / nobody / few / hardly 等否定词的句子视为否定 → 反问部分用肯定。",
    ],
    gaokaoPoints: [
      "高频考点:Let's→shall we;祈使句→will you;I am→aren't I。",
      "答语按事实:肯定事实用 Yes、否定事实用 No,与问句形式无关。",
    ],
    examVsReal: [
      { exam: "Let's go, shall we?", real: "OK? / right? / yeah?", note: "考试填 shall we;日常口语更自然多样" },
      { exam: "I'm right, aren't I?", real: "right?", note: "考试 aren't I;日常常说 right?" },
    ],
  },
};

let sql = `-- ============================================================
-- 回补/重写 必修一 WU/U1/U2/U3 语法小知识(通用 table 格式)。自动转义,生成脚本产出。
-- 依赖 junior_grammar_tips 表(已建)。Aaron 跑。幂等。
-- ============================================================
BEGIN;
DELETE FROM public.junior_grammar_tips WHERE volume='required1' AND unit IN ('WU','U1','U2','U3');
`;
for (const [unit, content] of Object.entries(TIPS)) {
  sql += `INSERT INTO public.junior_grammar_tips (grade, volume, unit, content) VALUES (10, 'required1', '${unit}', ${jb(content)});\n`;
}
sql += `\nCOMMIT;
-- ===== 自带校验:4 个单元都应有 grammar_tips =====
SELECT unit,
  jsonb_array_length(content->'table'->'rows') AS table_rows,
  jsonb_array_length(content->'specialRules') AS special_rules,
  jsonb_array_length(content->'examVsReal') AS exam_vs_real
FROM public.junior_grammar_tips
WHERE volume='required1' AND unit IN ('WU','U1','U2','U3') ORDER BY unit;
`;

writeFileSync('SQLAA/grammar-tips-backfill-wu-u1-u2-u3.sql', sql);
console.log('已重出 SQLAA/grammar-tips-backfill-wu-u1-u2-u3.sql(自动转义)');
