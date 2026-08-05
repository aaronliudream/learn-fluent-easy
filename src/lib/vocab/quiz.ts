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

    const picked: string[] = [];
    const seen = new Set<string>([correct]);
    for (const w of shuffle(source, word.id.charCodeAt(0) * 31 + qi)) {
      const t = optionText(w, defMode);
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
