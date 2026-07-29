/**
 * 听力对话按说话人切分 —— **全站唯一实现**。
 *
 * 三个地方共用同一份：
 *   ① `juniorFinalQuiz.loadListeningItems`：决定某条题能不能进抽题池
 *   ② `scripts/audio/pickers.mjs`：算可达音频对象（Node 24 直接 import 这个 .ts）
 *   ③ `speakDialogue.ts`：播放与预热
 * 各写一份必然漂，漂了就是"生成的音频没人播 / 播的没人生成"。所以本文件**零依赖**
 * （不 import 任何东西、不碰 window），才能同时被浏览器与 Node 脚本使用。
 *
 * 规则（依据 244 条 dialogue 的实测格式，见 docs/audio/JUNIOR_4_dialogue.md）：
 *   1. 只认白名单标记 W / M / A / B / Boy / Girl，不用 `[A-Z]\w*:` 通配 ——
 *      正文里有 "remember four tips: listen carefully" 这类冒号，通配会把句子切碎。
 *   2. 性别固定：W / Girl / A → 女声；M / Boy / B → 男声。不随机、不按名字猜。
 *   3. 必须以标记开头才当对话切。
 *   4. 完全没有标记 → 独白，整段单人女声（41 条实际是叙述文，被标成了 dialogue）。
 *   5. 出现白名单以外的说话人标记（Linda: / Dr Lu: / Reporter: …）→ 返回 null
 *      ＝ "不可安全分角色"。这类**不进池、不生成**，宁可留着也不猜性别。
 */

export type DialogueGender = "female" | "male";

export type DialogueSegment = {
  /** 说话人标记原文（独白为 null） */
  speaker: string | null;
  /** 该轮的文本（已去掉标记，送 TTS 用） */
  text: string;
  gender: DialogueGender;
};

/** 白名单标记 → 性别。改这里等于改音色分配，两侧同时生效。 */
export const SPEAKER_GENDER: Readonly<Record<string, DialogueGender>> = {
  W: "female",
  Girl: "female",
  A: "female",
  M: "male",
  Boy: "male",
  B: "male",
};

/** 独白（无标记）按女声读——与既有听力/词汇的音色一致。 */
export const MONOLOGUE_GENDER: DialogueGender = "female";

const WHITELIST = Object.keys(SPEAKER_GENDER).sort((a, b) => b.length - a.length).join("|");
/** 白名单标记：行首或空白之后 + 标记 + 冒号 + 空白。 */
const KNOWN_MARK = new RegExp(`(^|\\s)(${WHITELIST})\\s*:\\s*`, "g");
/**
 * "看起来像说话人标记"的通用形态：大写开头的短词（可含 "Dr Lu" 这种带空格的称谓）+ 冒号 + 空格。
 * 只用来**判定不安全**，不用来切分。小写开头（"tips:"）不算，正文里的冒号因此不受影响。
 */
const ANY_MARK = /(^|\s)([A-Z][A-Za-z.'-]{0,9}(?:\s[A-Z][A-Za-z.'-]{0,9})?)\s*:\s/g;

const isKnown = (token: string): boolean =>
  Object.prototype.hasOwnProperty.call(SPEAKER_GENDER, token);

/**
 * @returns 切分后的段落；**null 表示不可安全分角色**（出现了白名单外的说话人标记）。
 *          无标记的整段叙述返回单段（speaker=null，女声）。
 */
export function splitDialogue(raw: string): DialogueSegment[] | null {
  const text = String(raw ?? "").trim();
  if (!text) return null;

  // 先看有没有"白名单以外的说话人标记" —— 有就是不可判，直接退出。
  ANY_MARK.lastIndex = 0;
  for (const m of text.matchAll(ANY_MARK)) {
    const token = m[2];
    // "Dr Lu" 这类两段式，取最后一段也不在白名单里才算未知；
    // 但只要整体或末段任一不在白名单，就按未知处理（不猜）。
    const last = token.split(/\s+/).pop() as string;
    if (!isKnown(token) && !isKnown(last)) return null;
  }

  KNOWN_MARK.lastIndex = 0;
  const marks = [...text.matchAll(KNOWN_MARK)];
  if (!marks.length) {
    // 无标记 → 独白，整段一个人读
    return [{ speaker: null, text, gender: MONOLOGUE_GENDER }];
  }
  // 必须以标记开头，否则第一段没有归属，属于形态异常 → 不猜
  if ((marks[0].index ?? -1) !== 0) return null;

  const out: DialogueSegment[] = [];
  for (let i = 0; i < marks.length; i++) {
    const m = marks[i];
    const speaker = m[2];
    const from = (m.index ?? 0) + m[0].length;
    const to = i + 1 < marks.length ? (marks[i + 1].index ?? text.length) : text.length;
    const seg = text.slice(from, to).trim();
    if (!seg) continue; // 标记后没内容：跳过该轮（实测 0 条，防御性）
    out.push({ speaker, text: seg, gender: SPEAKER_GENDER[speaker] });
  }
  return out.length ? out : null;
}

/** 能否安全分角色（供取数侧过滤用）。 */
export const canSplitDialogue = (raw: string): boolean => splitDialogue(raw) !== null;

/** 是否是需要分角色的多角色对话（独白/单轮返回 false）。 */
export function isMultiVoice(raw: string): boolean {
  const segs = splitDialogue(raw);
  if (!segs || segs.length < 2) return false;
  return new Set(segs.map((s) => s.gender)).size > 1;
}
