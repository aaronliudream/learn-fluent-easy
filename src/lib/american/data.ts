/**
 * 美语课程 · 数据访问层 —— 直连 american_* 表(方案 A)。
 * 掌握/进度绑定内容 ID(词绑 word_id、题绑考点/题 ID),答对 2 次 = 掌握;
 * 将来"美语专项板块"必须读写这同一份表(互通铁律,见 docs/american/美语课程_关卡结构_v1.1.md §一)。
 *
 * 注:american_* 表尚未进 supabase 生成类型(types.ts),这里对 client 做 `as any`,
 *     并把结果 cast 成本文件定义的接口 —— tsc 干净,运行期照常。
 */
import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// 答对 2 次 = 掌握(全站统一口径:词/单题环)
export const AM_MASTER_AT = 2;
// Plan C #2 考点口径收紧:净分(答对+1/答错-1下限0)≥3 且末次答对 = 考点掌握
export const AM_GP_MASTER_AT = 3;

/** 关5「语法小知识」折叠卡内容(TipContent 同形;用 GrammarTipsView 渲染)。 */
export type AmericanGrammarCard = {
  title?: string;
  intro?: string;
  table?: { headers: string[]; rows: string[][] };
  specialRules?: { rule: string; mark?: string }[];
  why?: string[];
  examVsReal?: { exam: string; real: string; note?: string }[];
};

export type AmericanLesson = {
  id: string;
  unit_no: number;
  lesson_no: number;
  title_en: string;
  title_cn: string;
  grammar_focus: string | null;
  scene: string | null;
  prelisten_question: PrelistenQuestion | null;
  grammar_card?: AmericanGrammarCard | null; // 关5 折叠卡(可能未落库→undefined)
};

export type PrelistenQuestion = { q: string; options: string[]; answer_index: number };

export type AmericanSentence = {
  id: string;
  lesson_id: string;
  seq: number;
  speaker: string | null;
  text_en: string;
  text_cn: string;
  audio_key: string | null;
};

export type AmericanWord = {
  id: string;
  lesson_id: string;
  word: string;
  ipa: string | null;
  pos: string | null;
  meaning_cn: string | null;
  example: string | null;
};

export type AmericanGrammarPoint = {
  id: string;
  lesson_id: string;
  name: string;
  body_md: string | null;
};

export type AmericanQuestion = {
  id: string;
  lesson_id: string;
  stage: number;
  grammar_point_id: string | null;
  qtype: "choice" | "cloze" | "transform" | "scenario";
  payload: {
    stem: string;
    options?: string[];
    answer_index?: number;
    answer_text?: string;
    context?: string;
    blank_no?: number;
    situation?: string;
    explanation_cn?: string; // 语法点评(答题后显示;按 lesson×gp 共享同一段)
    stem_cn?: string; // 关5/关10句型题:填入正确答案后整句的中文翻译(答对后显示在点评上方);无则不显示
    audio?: string; // 关10听力题:要朗读的本课词/句/对话文本(speakUS 播,自动上CDN;题干只显示指令不露此文本)
    passage?: string; // 关10阅读题:题目上方显示的本课课文(对着读作答,真·阅读理解)
  };
  seq: number | null;
};

export type AmericanContrast = {
  id: string;
  lesson_id: string;
  us: string;
  uk: string;
  note_cn: string | null;
  // 方案A改良:同表混装「语块卡」。有 example1 = 语块卡(chunk+ipa+中文+2例句),无 = 美英对照卡。
  // 这些列可能尚未落库(加字段 SQL 未跑),故 fetch 用 select("*"),缺列时为 undefined → 当对照卡渲染。
  ipa?: string | null;
  example1?: string | null;
  example1_cn?: string | null;
  example2?: string | null;
  example2_cn?: string | null;
};

export type AmericanUnit = { unit_no: number; lessons: AmericanLesson[] };

// ---------- 元数据本地缓存(版本化):老用户秒出骨架 → 后台刷新(性能修复③)----------
const META_VER = "v1";
function cacheGet<T>(key: string): T | null {
  try { const raw = localStorage.getItem(`am.meta.${META_VER}.${key}`); return raw ? (JSON.parse(raw) as T) : null; } catch { return null; }
}
function cacheSet(key: string, val: unknown): void {
  try { localStorage.setItem(`am.meta.${META_VER}.${key}`, JSON.stringify(val)); } catch { /* quota — 忽略 */ }
}
/** 同步读缓存的册总览/单元列表(供组件首帧即渲染,随后 fetch 刷新)。 */
export function cachedBooks(): AmericanBook[] | null { return cacheGet<AmericanBook[]>("books"); }
export function cachedUnits(bookNo: number): AmericanUnit[] | null { return cacheGet<AmericanUnit[]>(`units.${bookNo}`); }

export type LessonBundle = {
  lesson: AmericanLesson;
  sentences: AmericanSentence[];
  words: AmericanWord[];
  grammarPoints: AmericanGrammarPoint[];
  questions: AmericanQuestion[];
  contrast: AmericanContrast[];
};

/** 内容 id 前缀(am1_ / am2_ …)推册号;等价于 book_no,前端据此按册分组,不依赖 3a schema 落库。 */
export function bookOf(id: string): number {
  const m = String(id).match(/^am(\d+)_/);
  if (!m) {
    // id 理应恒为 amN_ 前缀(所有查询都按 amN_l% 过滤)。走到这里=数据异常。
    // 渲染路径不宜 throw(bookOf 在 fetchBooks 里遍历全部课程,一条坏数据会连累整册落地页),
    // 故显式告警报人 + 安全兜底 1,而非静默默认。
    console.warn(`[american] bookOf: 无法从 id "${id}" 解析册号(期望 amN_ 前缀),兜底为第 1 册`);
    return 1;
  }
  return Number(m[1]);
}

/**
 * 某册的单元列表 —— 从 american_lessons 按册(lesson_id 前缀 amN_)过滤 + distinct unit_no。
 * 每单元课数不硬编码,来自 DB 实际分组(第一册 6 课/单元、第二册 8 课/单元同一套代码)。
 * bookNo 默认 1:旧调用点(AmericanUnit 深链 /american/hub/:unit)保持解析第一册,零回归。
 */
export async function fetchUnits(bookNo = 1): Promise<AmericanUnit[]> {
  const { data, error } = await db
    .from("american_lessons")
    .select("id,unit_no,lesson_no,title_en,title_cn,grammar_focus,scene,prelisten_question")
    .like("id", `am${bookNo}_l%`)
    .order("unit_no", { ascending: true })
    .order("lesson_no", { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as AmericanLesson[];
  const byUnit = new Map<number, AmericanLesson[]>();
  for (const r of rows) {
    if (!byUnit.has(r.unit_no)) byUnit.set(r.unit_no, []);
    byUnit.get(r.unit_no)!.push(r);
  }
  const units = [...byUnit.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([unit_no, lessons]) => ({ unit_no, lessons }));
  cacheSet(`units.${bookNo}`, units);
  return units;
}

export type AmericanBook = { bookNo: number; launched: boolean; lessonCount: number };

/**
 * 四册总览 —— 扫 american_lessons id 前缀,统计每册已落库课数;有课=已上线可进,无课=制作中。
 * 数据驱动:am2 落库后第二册自动点亮,无需改前端。
 */
export async function fetchBooks(): Promise<AmericanBook[]> {
  const { data, error } = await db.from("american_lessons").select("id");
  if (error) throw error;
  const count = new Map<number, number>();
  for (const r of (data ?? []) as { id: string }[]) {
    const b = bookOf(r.id);
    count.set(b, (count.get(b) ?? 0) + 1);
  }
  const books = [1, 2, 3, 4].map((bookNo) => {
    const lessonCount = count.get(bookNo) ?? 0;
    return { bookNo, launched: lessonCount > 0, lessonCount };
  });
  cacheSet("books", books);
  return books;
}

/** 一课全部内容(6 关素材一次取全)。 */
export async function fetchLessonBundle(lessonId: string): Promise<LessonBundle | null> {
  const [lessonRes, sRes, wRes, gRes, qRes, cRes] = await Promise.all([
    // select("*"):grammar_card 列可能尚未落库(加字段 SQL 未跑),用 * 避免"列不存在"报错清空整课(缺列→undefined→不渲染卡)。
    db.from("american_lessons").select("*").eq("id", lessonId).maybeSingle(),
    db.from("american_sentences").select("id,lesson_id,seq,speaker,text_en,text_cn,audio_key").eq("lesson_id", lessonId).order("seq", { ascending: true }),
    db.from("american_words").select("id,lesson_id,word,ipa,pos,meaning_cn,example").eq("lesson_id", lessonId),
    db.from("american_grammar_points").select("id,lesson_id,name,body_md").eq("lesson_id", lessonId).order("id", { ascending: true }),
    db.from("american_questions").select("id,lesson_id,stage,grammar_point_id,qtype,payload,seq").eq("lesson_id", lessonId).order("stage", { ascending: true }).order("seq", { ascending: true }),
    // select("*"):新增的 ipa/example* 列可能尚未落库,用 * 避免"列不存在"报错清空关6(缺列→undefined→当对照卡)。
    db.from("american_amencontrast").select("*").eq("lesson_id", lessonId),
  ]);
  const lesson = lessonRes.data as AmericanLesson | null;
  if (!lesson) return null;
  return {
    lesson,
    sentences: (sRes.data ?? []) as AmericanSentence[],
    words: (wRes.data ?? []) as AmericanWord[],
    grammarPoints: (gRes.data ?? []) as AmericanGrammarPoint[],
    questions: (qRes.data ?? []) as AmericanQuestion[],
    contrast: (cRes.data ?? []) as AmericanContrast[],
  };
}

// ---------- 用户态:进度 + 掌握(需登录;RLS auth.uid()=user_id) ----------

async function uid(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/** 每关聚合进度(完成环 + 掌握环用)。key = stage(1–10)。 */
export type StageProgress = { done: boolean; masteredFrac: number };

/** 关卡完成:写 american_lesson_progress(幂等,重复完成不报错)。 */
export async function markStageComplete(lessonId: string, stage: number): Promise<void> {
  const user = await uid();
  if (!user) return;
  await db
    .from("american_lesson_progress")
    .upsert({ user_id: user, lesson_id: lessonId, stage }, { onConflict: "user_id,lesson_id,stage", ignoreDuplicates: true });
}

/** 已完成的关卡集合。 */
export async function fetchCompletedStages(lessonId: string): Promise<Set<number>> {
  const user = await uid();
  if (!user) return new Set();
  const { data } = await db.from("american_lesson_progress").select("stage").eq("user_id", user).eq("lesson_id", lessonId);
  return new Set(((data ?? []) as { stage: number }[]).map((r) => r.stage));
}

/** 批量:一组课各自已完成的关卡数(单元页 6 张课卡的完成环用,一次查询)。 */
export async function fetchCompletedCounts(lessonIds: string[]): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const id of lessonIds) out[id] = 0;
  const user = await uid();
  if (!user || !lessonIds.length) return out;
  const { data } = await db
    .from("american_lesson_progress")
    .select("lesson_id")
    .eq("user_id", user)
    .in("lesson_id", lessonIds);
  for (const r of (data ?? []) as { lesson_id: string }[]) out[r.lesson_id] = (out[r.lesson_id] ?? 0) + 1;
  return out;
}

/**
 * 单元完成度(hub 单元卡用)。
 * 口径:单课完成度=已通关卡数/10;单元完成度=该单元各课均值,四舍五入取整 N%。
 * 未登录 → loggedIn=false(不显示百分比,不显示 0%)。按传入的实际单元一次查询(数据驱动,不假设单元数)。
 */
export async function fetchUnitCompletion(units: AmericanUnit[]): Promise<{ loggedIn: boolean; pct: Record<number, number> }> {
  const pct: Record<number, number> = {};
  const user = await uid();
  if (!user) return { loggedIn: false, pct };
  const allIds = units.flatMap((u) => u.lessons.map((l) => l.id));
  const counts = await fetchCompletedCounts(allIds);
  for (const u of units) {
    if (!u.lessons.length) { pct[u.unit_no] = 0; continue; }
    const sum = u.lessons.reduce((a, l) => a + Math.min(counts[l.id] ?? 0, 10) / 10, 0);
    pct[u.unit_no] = Math.round((sum / u.lessons.length) * 100);
  }
  return { loggedIn: true, pct };
}

export type AmMasteryItemType =
  | "am_sentence" // 关1 逐句点读覆盖(correct_count>=1 = 点读过)
  | "am_prelisten" // 关1 前置题
  | "am_question" // 关5-10 题(correct>=2 = 掌握)
  | "am_grammar_point"; // 关5 考点(correct>=2 = 考点掌握)

// ---- Plan C #1 SRS 复习池(仅 am_question,复用 american_user_mastery 现有 due_at 列)----
// 阶梯:答错→入池/打回,due=now(下轮必出);答对且在池中→+1天→+3天→+7天→出池(due=NULL)。
// 从不答错的题永不入池(入池的唯一触发是答错)。
const AM_SRS_LADDER_DAYS = [1, 3, 7];
const DAY_MS = 86400000;

/** 记录一次掌握尝试(read-then-write,复刻 junior 口径)。am_question 附带 SRS 复习调度。 */
export async function recordMastery(itemType: AmMasteryItemType, itemId: string, isCorrect: boolean): Promise<void> {
  const user = await uid();
  if (!user) return;
  const { data: prev } = await db
    .from("american_user_mastery")
    .select("id,correct_count,wrong_count,mastery_matrix,lapses,due_at")
    .eq("user_id", user)
    .eq("item_type", itemType)
    .eq("item_id", itemId)
    .maybeSingle();
  const prevCorrect = prev?.correct_count ?? 0;
  const wrong = (prev?.wrong_count ?? 0) + (isCorrect ? 0 : 1);
  let correct: number;
  let level: number;
  if (itemType === "am_grammar_point") {
    // #2 收紧:correct_count 作净分(答对+1/答错-1,下限0);掌握 = 净分≥3 且这次答对
    correct = isCorrect ? prevCorrect + 1 : Math.max(0, prevCorrect - 1);
    level = correct >= AM_GP_MASTER_AT && isCorrect ? 4 : correct + wrong > 0 ? 1 : 0;
  } else {
    // 其余(单题/句/前置题):累计答对,答对2次=掌握
    correct = prevCorrect + (isCorrect ? 1 : 0);
    level = correct >= AM_MASTER_AT ? 4 : correct + wrong > 0 ? 1 : 0;
  }
  const now = new Date();
  const payload: Record<string, unknown> = {
    correct_count: correct,
    wrong_count: wrong,
    mastery_level: level,
    last_seen_at: now.toISOString(),
    last_result: isCorrect ? "correct" : "wrong",
  };
  if (itemType === "am_question") {
    const matrix = (prev?.mastery_matrix ?? {}) as Record<string, unknown>;
    const inPool = prev?.due_at != null; // 当前是否在复习池(有到期时间)
    if (!isCorrect) {
      // 答错 → 入池/打回 step0,下轮必出
      payload.mastery_matrix = { ...matrix, srs_step: 0 };
      payload.due_at = now.toISOString();
      payload.next_review_at = now.toISOString();
      payload.lapses = (prev?.lapses ?? 0) + 1;
    } else if (inPool) {
      // 在池中答对 → 按阶梯推进,连过 1/3/7 天三档后毕业出池
      let step = Number(matrix.srs_step ?? 0);
      let dueAt: string | null;
      if (step < AM_SRS_LADDER_DAYS.length) {
        dueAt = new Date(now.getTime() + AM_SRS_LADDER_DAYS[step] * DAY_MS).toISOString();
        step += 1;
      } else {
        dueAt = null; // 毕业出池
      }
      payload.mastery_matrix = { ...matrix, srs_step: step };
      payload.due_at = dueAt;
      payload.next_review_at = dueAt;
    }
    // 不在池中 + 答对 → 不动 SRS(永不因答对而入池)
  }
  if (prev?.id) await db.from("american_user_mastery").update(payload).eq("id", prev.id);
  else await db.from("american_user_mastery").insert({ user_id: user, item_type: itemType, item_id: itemId, ...payload });
}

/** 复习池到期题数(hub"今日复习"卡角标)。 */
export async function fetchReviewCount(): Promise<number> {
  const user = await uid();
  if (!user) return 0;
  const { count } = await db
    .from("american_user_mastery")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user)
    .eq("item_type", "am_question")
    .not("due_at", "is", null)
    .lte("due_at", new Date().toISOString());
  return count ?? 0;
}

/** 拉到期复习题(跨全课程,按 due_at 升序),回捞 american_questions 原题供 QuizRunner。 */
export async function fetchReviewDue(limit = 30): Promise<AmericanQuestion[]> {
  const user = await uid();
  if (!user) return [];
  const { data } = await db
    .from("american_user_mastery")
    .select("item_id")
    .eq("user_id", user)
    .eq("item_type", "am_question")
    .not("due_at", "is", null)
    .lte("due_at", new Date().toISOString())
    .order("due_at", { ascending: true })
    .limit(limit);
  const ids = ((data ?? []) as { item_id: string }[]).map((r) => r.item_id);
  if (!ids.length) return [];
  const { data: qs } = await db
    .from("american_questions")
    .select("id,lesson_id,stage,grammar_point_id,qtype,payload,seq")
    .in("id", ids);
  // 保持 due_at 顺序
  const order = new Map(ids.map((id, i) => [id, i]));
  return ((qs ?? []) as AmericanQuestion[]).sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

/** 关1 逐句点读:某句点读过一次即记覆盖(item_type=am_sentence)。 */
export async function markSentenceRead(sentenceId: string): Promise<void> {
  return recordMastery("am_sentence", sentenceId, true);
}

// ---------- 词掌握(关2/3/4 共享,答对 2 次=掌握;schema 无 consec,按总答对数判定) ----------
export type WordGame = "quiz" | "listen" | "match";

/** 记录一次词游戏结果 → american_word_mastery(per-game 计数 + 总答对>=2 置掌握)。 */
export async function recordWordMastery(wordId: string, unitNo: number, game: WordGame, isCorrect: boolean): Promise<void> {
  const user = await uid();
  if (!user) return;
  const cCol = `${game}_correct`;
  const wCol = `${game}_wrong`;
  const { data: prev } = await db
    .from("american_word_mastery")
    .select("id,quiz_correct,listen_correct,match_correct,quiz_wrong,listen_wrong,match_wrong")
    .eq("user_id", user)
    .eq("word_id", wordId)
    .maybeSingle();
  const base = prev ?? { quiz_correct: 0, listen_correct: 0, match_correct: 0, quiz_wrong: 0, listen_wrong: 0, match_wrong: 0 };
  const next: Record<string, number> = {
    quiz_correct: base.quiz_correct ?? 0, listen_correct: base.listen_correct ?? 0, match_correct: base.match_correct ?? 0,
    quiz_wrong: base.quiz_wrong ?? 0, listen_wrong: base.listen_wrong ?? 0, match_wrong: base.match_wrong ?? 0,
  };
  next[isCorrect ? cCol : wCol] += 1;
  const totalCorrect = next.quiz_correct + next.listen_correct + next.match_correct;
  const mastery_level = totalCorrect >= AM_MASTER_AT ? 4 : totalCorrect > 0 ? 1 : 0;
  const payload = { ...next, mastery_level, last_seen_at: new Date().toISOString() };
  if (prev?.id) await db.from("american_word_mastery").update(payload).eq("id", prev.id);
  else await db.from("american_word_mastery").insert({ user_id: user, word_id: wordId, grade: unitNo, ...payload });
}

/** 一课词掌握:返回 {mastered, total}(总答对>=2 计掌握,三游戏共享)。 */
export async function fetchWordProgress(words: AmericanWord[]): Promise<{ mastered: number; total: number }> {
  const total = words.length;
  const user = await uid();
  if (!user || !total) return { mastered: 0, total };
  const ids = words.map((w) => w.id);
  const { data } = await db
    .from("american_word_mastery")
    .select("word_id,quiz_correct,listen_correct,match_correct")
    .eq("user_id", user)
    .in("word_id", ids);
  let mastered = 0;
  for (const r of (data ?? []) as { quiz_correct: number; listen_correct: number; match_correct: number }[]) {
    if ((r.quiz_correct ?? 0) + (r.listen_correct ?? 0) + (r.match_correct ?? 0) >= AM_MASTER_AT) mastered++;
  }
  return { mastered, total };
}

/** 读取一课的掌握明细,聚合成每关的 masteredFrac(供列表页双环)。 */
export async function fetchLessonMastery(bundle: LessonBundle): Promise<Record<number, StageProgress>> {
  const user = await uid();
  const completed = await fetchCompletedStages(bundle.lesson.id);
  const result: Record<number, StageProgress> = {};
  for (let s = 1; s <= 10; s++) result[s] = { done: completed.has(s), masteredFrac: 0 };
  if (!user) return result;

  // american_user_mastery 全量(该课相关 item)
  const { data: mData } = await db
    .from("american_user_mastery")
    .select("item_type,item_id,correct_count")
    .eq("user_id", user);
  const rows = (mData ?? []) as { item_type: string; item_id: string; correct_count: number }[];
  const byItem = new Map<string, number>();
  for (const r of rows) byItem.set(`${r.item_type}:${r.item_id}`, r.correct_count);

  // 关1 掌握 = 逐句点读覆盖率 +(前置题作答)/(句数+prelisten)
  const sentTotal = bundle.sentences.length + (bundle.lesson.prelisten_question ? 1 : 0);
  if (sentTotal > 0) {
    let read = 0;
    for (const s of bundle.sentences) if ((byItem.get(`am_sentence:${s.id}`) ?? 0) >= 1) read++;
    if (bundle.lesson.prelisten_question && (byItem.get(`am_prelisten:${bundle.lesson.id}`) ?? 0) >= 1) read++;
    result[1].masteredFrac = read / sentTotal;
  }

  // 关2/3/4 掌握 = 已掌握词 / 总词(三游戏共享同一份词掌握)
  if (bundle.words.length) {
    const wp = await fetchWordProgress(bundle.words);
    const frac = wp.total ? wp.mastered / wp.total : 0;
    for (const s of [2, 3, 4]) result[s] = { done: completed.has(s), masteredFrac: frac };
  }

  // 关5-10 掌握 = 该关题答对>=2 占比
  const qByStage = new Map<number, AmericanQuestion[]>();
  for (const q of bundle.questions) {
    if (!qByStage.has(q.stage)) qByStage.set(q.stage, []);
    qByStage.get(q.stage)!.push(q);
  }
  for (const [stage, qs] of qByStage) {
    if (!qs.length) continue;
    let mastered = 0;
    for (const q of qs) if ((byItem.get(`am_question:${q.id}`) ?? 0) >= AM_MASTER_AT) mastered++;
    result[stage] = { done: completed.has(stage), masteredFrac: mastered / qs.length };
  }
  return result;
}
