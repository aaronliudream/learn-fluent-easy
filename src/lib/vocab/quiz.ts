/**
 * 出题:英汉选择(看词选义)。
 *
 * 干扰项规则:**同库 + 同词性**里抽。
 *   · 同库:跨库抽会出现"托福题里混进中考词"的违和感,也让难度不可控
 *   · 同词性:释义的中文形态跟词性强相关(动词"引用"、形容词"慢性的"、名词"律师"),
 *     不同词性的选项一眼就能排除,题目会失去区分度
 * 同词性不够 4 个时才放宽到同库任意词 —— 宁可放宽也不能出不满 4 个选项的题。
 *
 * ⚠️ 释义**只取第一义项**(分号前)。选项里塞「防御；辩护」这种双义,
 *    四个选项会长短不一、还容易和别的词的某一义撞上,判分变得含糊。
 */
import type { VocabWord } from "@/lib/vocab/data";

export type QuizQuestion = {
  word: VocabWord;
  /** 4 个选项(已打乱),内容是释义文本 */
  options: string[];
  /** 正确项在 options 里的下标 */
  answerIndex: number;
};

/** 取主词性(pos 形如 "n./v." 时取第一段)。 */
function primaryPos(w: VocabWord): string {
  return (w.pos || "").split("/")[0].trim();
}

/** 释义只取第一义项;defMode=en 时用英文释义。 */
export function optionText(w: VocabWord, defMode: "zh" | "en"): string {
  if (defMode === "en") return (w.def_en || "").trim();
  return (w.def_zh || "").split("；")[0].trim();
}

/**
 * 释义的"体量":中文数字数,英文数词数。
 * 用来让四个选项长度相近 —— 三短一长时,学生不用认识这个词也能靠排除法秒杀,
 * 题目就失去区分度了(实测:attorney「律师」的干扰项里混进「大型购物中心」)。
 */
function sizeOf(text: string, defMode: "zh" | "en"): number {
  return defMode === "en" ? text.split(/\s+/).filter(Boolean).length : [...text].length;
}

/**
 * 中文释义的具象度粗分类。**只用后缀判**,判不出就归 unknown。
 * 这是个启发式,不追求准确:目的只是别把「大型购物中心」这种具体场所
 * 混进「正直」「意识」这类抽象词的选项里,反之亦然。
 * 判不出时按 unknown 处理,优先级居中,不会因为分类不准而排除掉好干扰项。
 */
type Concreteness = "concrete" | "abstract" | "unknown";
const CONCRETE_TAIL = /(人|员|师|家|者|机|器|车|场|店|厅|楼|房|馆|所|物|品|具|剂|药|币|证|书|表|卡|球|刀|灯|站|区|城|岛|山|河|食|肉|果)$/;
const ABSTRACT_TAIL = /(性|度|力|感|观|论|义|率|化|法|制|权|策|念|识|态|系|状|况|序|情|意|想|风|德|理)$/;
function concretenessOf(text: string, defMode: "zh" | "en"): Concreteness {
  if (defMode === "en") return "unknown";       // 英文释义不做这个判断,规则不通用
  const head = text.split("；")[0].trim();
  if (CONCRETE_TAIL.test(head)) return "concrete";
  if (ABSTRACT_TAIL.test(head)) return "abstract";
  return "unknown";
}

/** 确定性洗牌(seed 固定则每次同序),便于复现问题。 */
function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed >>> 0;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 出一组题。
 * @param pool     该词库全部词(干扰项从这里抽)
 * @param targets  本轮要考的词(复习队列 / 随机挑)
 * @param defMode  选项用中文释义还是英文释义
 */
export function buildQuestions(pool: VocabWord[], targets: VocabWord[], defMode: "zh" | "en"): QuizQuestion[] {
  const usable = pool.filter(w => optionText(w, defMode));
  const out: QuizQuestion[] = [];

  targets.forEach((word, qi) => {
    const correct = optionText(word, defMode);
    if (!correct) return;                       // 该模式下没释义文本的词跳过,不出残题

    const samePos = usable.filter(w =>
      w.id !== word.id && primaryPos(w) === primaryPos(word) && optionText(w, defMode) !== correct);
    // 同词性不够就放宽到同库任意词 —— 宁可放宽,也不出不满 4 个选项的题
    const fallback = usable.filter(w => w.id !== word.id && optionText(w, defMode) !== correct);
    const source = samePos.length >= 3 ? samePos : fallback;

    /* 干扰项打分:**长度相近 + 具象度同类** 优先。
     * 不做硬过滤而是打分排序 —— 硬过滤在候选不足时会直接出不了题,
     * 打分则是"够好的排前面,不够时自动放宽",不会把题目卡死。 */
    const size0 = sizeOf(correct, defMode);
    const class0 = concretenessOf(correct, defMode);
    const scored = shuffle(source, word.id.charCodeAt(0) * 31 + qi).map(w => {
      const t = optionText(w, defMode);
      const d = Math.abs(sizeOf(t, defMode) - size0);
      const c = concretenessOf(t, defMode);
      let score = 0;
      if (d <= 3) score += 10;                  // ±3 字以内优先
      score -= d;                               // 超出部分按差距递减
      if (c === class0) score += 6;             // 同为具体 / 同为抽象
      else if (c === "unknown" || class0 === "unknown") score += 3;   // 判不出的居中,不惩罚
      return { t, score };
    }).sort((a, b) => b.score - a.score);

    const picked: string[] = [];
    const seen = new Set<string>([correct]);
    for (const { t } of scored) {
      if (seen.has(t)) continue;                // 选项去重:两个词释义撞了会出现两个"正确答案"
      seen.add(t); picked.push(t);
      if (picked.length === 3) break;
    }
    if (picked.length < 3) return;              // 池子太小,出不了 4 选项,跳过这个词

    const options = shuffle([correct, ...picked], qi * 7919 + 13);
    out.push({ word, options, answerIndex: options.indexOf(correct) });
  });

  return out;
}

/**
 * 取 n 个**互不相同、且不等于正确项**的干扰项。
 *
 * ⚠️ 这道去重不是洁癖,是**答案唯一性**:托福库里 559 组词的中文首义项完全相同
 *    (heritage/legacy、initially/originally、depict/portray…),干扰项不去重就会
 *    出现两个一模一样的选项 —— 学生选了"另一个对的"却被判错。
 * ⚠️ 判据用的是**选项文本**不是 word_id:两个不同的词共享同一条释义时,
 *    按 id 去重完全拦不住 —— 这正是踩过的那个坑。
 *
 * `buildQuestions` 内部另有一套等价逻辑(带打分排序),没有合并到这里:
 * 那边要先按"长度相近 + 具象度同类"打分再去重,顺序不能颠倒。两处判据一致即可。
 */
export function dedupeTake(candidates: string[], correct: string, n: number): string[] {
  const seen = new Set<string>([correct]);
  const out: string[] = [];
  for (const c of candidates) {
    if (!c || seen.has(c)) continue;
    seen.add(c); out.push(c);
    if (out.length === n) break;
  }
  return out;
}

/** 从词库里挑本轮要考的词:优先没学过的,按 freq_rank 靠前。 */
export function pickTargets(pool: VocabWord[], count: number, statuses: Record<string, string>): VocabWord[] {
  const fresh = pool.filter(w => (statuses[w.id] ?? "new") === "new");
  const rest = pool.filter(w => (statuses[w.id] ?? "new") !== "new");
  return [...fresh, ...rest].slice(0, count);
}

/** 反馈弹层自动朗读的开关(spec:设置项可关,默认开)。 */
export const AUTOPLAY_KEY = "vocab_autoplay_feedback";
export function readAutoplay(): boolean {
  try { return localStorage.getItem(AUTOPLAY_KEY) !== "0"; } catch { return true; }
}
export function writeAutoplay(on: boolean) {
  try { localStorage.setItem(AUTOPLAY_KEY, on ? "1" : "0"); } catch { /* 隐私模式忽略 */ }
}

/**
 * 自动朗读**几条**例句(1/2/3),默认 1。
 * ⚠️ 与上面那个总开关**并存不互斥**:开关管"要不要自动读",这个管"读几条"。
 *    关掉开关时这个值原样保留 —— 用户再打开时不该被重置回 1。
 * ⚠️ 读到脏值(手改 localStorage / 老版本残留)一律回落 1,不要让它变成 NaN 条。
 */
const AUTOPLAY_COUNT_KEY = "vocab_autoplay_count";
export type AutoplayCount = 1 | 2 | 3;

export function readAutoplayCount(): AutoplayCount {
  try {
    const n = Number(localStorage.getItem(AUTOPLAY_COUNT_KEY));
    return n === 2 || n === 3 ? n : 1;
  } catch { return 1; }
}
export function writeAutoplayCount(n: AutoplayCount) {
  try { localStorage.setItem(AUTOPLAY_COUNT_KEY, String(n)); } catch { /* 隐私模式忽略 */ }
}

/* ── 先想后翻(PR-8)────────────────────────────────────────────
 * 词卡默认只显英文,点一下才翻出中文。
 * ⚠️ 这是**回忆**而不是**辨认**:看着中英并排读一遍,大脑只做了辨认;
 *    先自己想一遍再翻,才是真的在取回记忆。默认关(不打扰老用户),
 *    开了之后全站词卡一致 —— 与「自动朗读」同一套持久化写法。
 */
export const THINK_FIRST_KEY = "vocab_think_first";

export function readThinkFirst(): boolean {
  try { return localStorage.getItem(THINK_FIRST_KEY) === "1"; } catch { return false; }
}

export function writeThinkFirst(on: boolean) {
  try { localStorage.setItem(THINK_FIRST_KEY, on ? "1" : "0"); } catch { /* 隐私模式:不持久化也不报错 */ }
}
