/**
 * 图书馆词库复习 · 把用户收藏搭成选择题(QuizItem[])。两种模式共用一套引擎/收藏/掌握/错题:
 *   · zh(懂中文):en2cn 英译中 / cn2en 中译英 / cloze 用法填空(带中文提示)。
 *   · en(不懂中文 / 想沉浸):endef 英英释义(给 gloss_en 选词)/ cloze(gloss_en 当提示、无中文)。
 * 干扰项护栏(答案唯一铁律):从同 kind 池挑干扰,但**排除**与标答:
 *   ① 同 sense_key 的(语义近义,zh/en 共用同一套 sense_key,读自 read-v1 卡);
 *   ② 屈折变体的(lived/live、prairies/prairie —— 词干规则,不用 AI)。
 * 排除后凑不满 3 个干扰 → 跳过该题(宁可不出,不出废题)。sense_key 未落库时护栏自动只剩 ② 生效。
 */
import { supabase } from "@/integrations/supabase/client";
import { tokenize } from "@/components/TappableLine";
import type { QuizItem } from "@/components/library/LibraryQuizRunner";
import type { LibraryFavorite, LibraryFavoriteKind } from "@/lib/library/favorites";
import { posFine, posCoarse, isFunctionWord, type Fine } from "@/lib/library/wordClass";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export type ReviewMode = "zh" | "en";
export type ReviewQType = "en2cn" | "cn2en" | "cloze" | "endef";
export type ReviewItemMeta = { kind: LibraryFavoriteKind; term: string; qtype: ReviewQType };
export type BuiltReview = { items: QuizItem[]; meta: Record<string, ReviewItemMeta> };

type PoolItem = { value: string; term: string }; // value=显示的选项文本(词或中文);term=来源英文词(查 sense/lemma 用)

const norm = (s: string) => s.trim().toLowerCase();
// 与 read-v1 落库口径一致(edge/prewarm 同式子),用于按 normalized 命中 phrase_explanations。
const normalizeCard = (s: string) => s.toLowerCase().replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 屈折变体判定(不用 AI):生成一个词的可能词干集合,两词词干相交(≥3 字符)即同源。 */
function lemmas(w: string): Set<string> {
  w = w.toLowerCase().trim();
  const s = new Set<string>([w]);
  for (const suf of ["ies", "es", "ing", "ed", "s", "d"]) {
    if (w.length > suf.length + 1 && w.endsWith(suf)) {
      const base = w.slice(0, -suf.length);
      s.add(base);
      if (suf === "ies") s.add(base + "y");
      if (suf === "ed" || suf === "ing") s.add(base + "e");
    }
  }
  if (w.endsWith("e")) s.add(w.slice(0, -1));
  return s;
}
function sameLemma(a: string, b: string): boolean {
  if (a === b) return true;
  const A = lemmas(a), B = lemmas(b);
  for (const x of A) if (x.length > 2 && B.has(x)) return true;
  return false;
}

/**
 * 从池挑 n 个干扰:去重、≠答案、不被 exclude(sense/词干护栏)命中。
 * 词类护栏:sameClass 硬过滤(实词题不收虚词干扰,反之亦然);samePos 软优先(同细词性排前,不足再放宽到同大类)。
 * 词类未知(other)→ 不参与过滤,宁松勿误杀。不足 n 返回已有(assemble 会因 <3 跳过该题)。
 */
function pickDistractors(
  pool: PoolItem[],
  correct: string,
  n: number,
  exclude: (term: string) => boolean,
  cls?: { sameClass: (term: string) => boolean; samePos: (term: string) => boolean },
): string[] {
  const seen = new Set([norm(correct)]);
  const elig: PoolItem[] = [];
  for (const it of shuffle(pool)) {
    if (!it.value) continue;
    const k = norm(it.value);
    if (seen.has(k)) continue;
    if (exclude(it.term)) continue;
    if (cls && !cls.sameClass(it.term)) continue; // 硬:不跨实词/虚词
    seen.add(k);
    elig.push(it);
  }
  if (!cls) return elig.slice(0, n).map((it) => it.value);
  const same = elig.filter((it) => cls.samePos(it.term)); // 同细词性优先
  const rest = elig.filter((it) => !cls.samePos(it.term)); // 同大类兜底
  return [...same, ...rest].slice(0, n).map((it) => it.value);
}

/** 答案与干扰打乱成 4 选项。干扰不足 3 → null(跳过该题)。 */
function assemble(correct: string, distractors: string[]): { options: string[]; answerIndex: number } | null {
  if (distractors.length < 3) return null;
  const options = shuffle([correct, ...distractors.slice(0, 3)]);
  const answerIndex = options.findIndex((o) => norm(o) === norm(correct));
  if (answerIndex < 0) return null;
  return { options, answerIndex };
}

/** tokenize 挖第一处 tap-token → ____(避裸正则三坑)。找不到 → null。 */
function blankSentence(sentence: string, term: string): string | null {
  const target = norm(term);
  const toks = tokenize(sentence, [target]);
  let done = false;
  const parts = toks.map((t) => {
    if (!done && t.kind === "tap" && t.phrase === target) { done = true; return "____"; }
    return t.text;
  });
  return done ? parts.join("") : null;
}

const zhFromExplanation = (j: unknown): string | null => {
  if (!j || typeof j !== "object") return null;
  const o = j as Record<string, unknown>;
  const v = o.gloss_cn ?? o.one_line_cn ?? o.meaning_cn; // read-v1 存 gloss_cn;老重卡才 one_line_cn/meaning_cn
  return typeof v === "string" && v.trim() ? v.trim() : null;
};
const strField = (j: unknown, field: string): string | null => {
  if (!j || typeof j !== "object") return null;
  const v = (j as Record<string, unknown>)[field];
  return typeof v === "string" && v.trim() ? v.trim() : null;
};

type FallbackItem = { term: string; zh: string | null; sense: string | null; pos: string | null };
/** phrase_explanations(read-v1)兜底池:term(必)+ zh + sense_key + pos。仅在收藏同 kind 不足时查一次。 */
async function fetchFallbackPools(): Promise<Record<LibraryFavoriteKind, FallbackItem[]>> {
  const pools: Record<LibraryFavoriteKind, FallbackItem[]> = { word: [], chunk: [] };
  try {
    const { data } = await db.from("phrase_explanations").select("phrase, explanation").eq("target_lang", "read-v1").limit(500);
    for (const r of (data ?? []) as { phrase: string; explanation: unknown }[]) {
      if (!r.phrase) continue;
      const kind: LibraryFavoriteKind = r.phrase.trim().includes(" ") ? "chunk" : "word";
      pools[kind].push({
        term: r.phrase.trim(),
        zh: zhFromExplanation(r.explanation),
        sense: strField(r.explanation, "sense_key")?.toLowerCase() ?? null,
        pos: strField(r.explanation, "pos"),
      });
    }
  } catch (e) {
    console.warn("[library review] fallback pool query failed", e);
  }
  return pools;
}

/** 收藏词的 read-v1 卡元信息:normalizeCard(term) → {gloss_en, sense_key}。两模式都用(en 取 gloss_en 当题干;护栏取 sense_key)。 */
async function fetchCardMeta(favs: LibraryFavorite[]): Promise<Map<string, { gloss_en: string | null; sense: string | null }>> {
  const map = new Map<string, { gloss_en: string | null; sense: string | null }>();
  const norms = [...new Set(favs.map((f) => normalizeCard(f.term)).filter(Boolean))];
  if (norms.length === 0) return map;
  try {
    const { data } = await db.from("phrase_explanations").select("normalized, explanation").eq("target_lang", "read-v1").in("normalized", norms);
    for (const r of (data ?? []) as { normalized: string; explanation: unknown }[]) {
      map.set(r.normalized, { gloss_en: strField(r.explanation, "gloss_en"), sense: strField(r.explanation, "sense_key")?.toLowerCase() ?? null });
    }
  } catch (e) {
    console.warn("[library review] card meta query failed", e);
  }
  return map;
}

export async function buildReviewQuestions(
  favs: LibraryFavorite[],
  mode: ReviewMode = "zh",
  poolFavs: LibraryFavorite[] = favs,
): Promise<BuiltReview> {
  // 出题只针对 favs(通常=今日待复习子集);干扰项池从 poolFavs(通常=全部收藏)抽,同 kind。
  const favTerms: Record<LibraryFavoriteKind, PoolItem[]> = { word: [], chunk: [] };
  const favZh: Record<LibraryFavoriteKind, PoolItem[]> = { word: [], chunk: [] };
  for (const f of poolFavs) {
    favTerms[f.kind].push({ value: f.term, term: f.term });
    if (f.zh) favZh[f.kind].push({ value: f.zh, term: f.term });
  }

  const kindsInUse = new Set(favs.map((f) => f.kind));
  const needTopup = [...kindsInUse].some((k) => favTerms[k].length < 4 || (mode === "zh" && favZh[k].length < 4));
  const fb = needTopup ? await fetchFallbackPools() : { word: [], chunk: [] };
  const poolTerms = (k: LibraryFavoriteKind): PoolItem[] => [...favTerms[k], ...fb[k].map((x) => ({ value: x.term, term: x.term }))];
  const poolZh = (k: LibraryFavoriteKind): PoolItem[] => [...favZh[k], ...fb[k].filter((x) => x.zh).map((x) => ({ value: x.zh as string, term: x.term }))];

  const cardMeta = await fetchCardMeta(poolFavs);
  // 古今异义按书覆盖:en 模式题干(gloss_en)对覆盖词取【书中义】,否则回退全局卡。key=`${book_key}|${normalized}`。
  const senseOv = new Map<string, string>(); // key → gloss_en
  const bookKeyOf = new Map<string, string>(); // book_id → book_key
  try {
    const bookIds = [...new Set(poolFavs.map((f) => f.book_id).filter(Boolean))] as string[];
    const ovNorms = [...new Set(poolFavs.map((f) => normalizeCard(f.term)).filter(Boolean))];
    if (bookIds.length && ovNorms.length) {
      const { data: books } = await db.from("library_books").select("id,book_key").in("id", bookIds);
      for (const b of (books ?? []) as { id: string; book_key: string }[]) bookKeyOf.set(b.id, b.book_key);
      const bookKeys = [...new Set([...bookKeyOf.values()])];
      if (bookKeys.length) {
        const { data } = await db.from("library_word_senses").select("book_key,normalized,gloss_en").in("book_key", bookKeys).in("normalized", ovNorms);
        for (const r of (data ?? []) as { book_key: string; normalized: string; gloss_en: string }[]) senseOv.set(`${r.book_key}|${r.normalized}`, r.gloss_en);
      }
    }
  } catch (e) {
    console.warn("[library review] word-sense override query failed", e);
  }
  // sense_key 查询表(收藏 + 兜底池),按 normalizeCard(term) 查。
  const senseByTerm = new Map<string, string>();
  for (const [n, m] of cardMeta) if (m.sense) senseByTerm.set(n, m.sense);
  for (const arr of [fb.word, fb.chunk]) for (const x of arr) if (x.sense) senseByTerm.set(normalizeCard(x.term), x.sense);
  const senseOf = (term: string): string | null => senseByTerm.get(normalizeCard(term)) ?? null;
  const glossEnOf = (term: string, bookId?: string | null): string | null => {
    const bk = bookId ? bookKeyOf.get(bookId) : null;
    const ov = bk ? senseOv.get(`${bk}|${normalizeCard(term)}`) : null; // 覆盖词取书中义 gloss_en
    return ov ?? cardMeta.get(normalizeCard(term))?.gloss_en ?? null;
  };

  // pos 查询表(收藏 + 兜底池)→ 词类过滤用。
  const posByTerm = new Map<string, string>();
  for (const f of poolFavs) if (f.pos) posByTerm.set(normalizeCard(f.term), f.pos);
  for (const arr of [fb.word, fb.chunk]) for (const x of arr) if (x.pos) posByTerm.set(normalizeCard(x.term), x.pos);
  const fineOf = (term: string): Fine => posFine(posByTerm.get(normalizeCard(term)) ?? "", term);
  // 词类护栏:两端词性都已知且大类不同(实词↔虚词/短语)→ 判为跨类不可比;任一未知 → 不过滤。
  const crossClass = (a: string, c: string): boolean => {
    const A = posCoarse(fineOf(a)), C = posCoarse(fineOf(c));
    if (A === "other" || C === "other") return false;
    return A !== C;
  };
  const clsFor = (answerTerm: string) => ({
    sameClass: (candTerm: string) => !crossClass(answerTerm, candTerm),
    samePos: (candTerm: string) => fineOf(answerTerm) === fineOf(candTerm),
  });

  // 护栏:排除与标答同 sense_key 或屈折同源的候选。
  const excludeFor = (answerTerm: string) => {
    const aSense = senseOf(answerTerm);
    return (candTerm: string) => sameLemma(candTerm, answerTerm) || (!!aSense && senseOf(candTerm) === aSense);
  };

  const items: QuizItem[] = [];
  const meta: Record<string, ReviewItemMeta> = {};
  let seq = 0;
  const push = (qtype: ReviewQType, f: LibraryFavorite, build: Omit<Extract<QuizItem, { kind: "choice" }>, "kind" | "id">) => {
    const id = `${qtype}:${f.kind}:${seq++}`;
    // 带上被复习的词/短语 + 音标 → 复习界面显示音标 + 发音按钮(单词才有 ipa;短语无 ipa 只发音)。
    items.push({ kind: "choice", id, term: f.term, ipa: f.ipa ?? undefined, ...build });
    meta[id] = { kind: f.kind, term: f.term, qtype };
  };

  // 一词一题(修 bug:旧实现一词出 2-3 型、同词连着反复出现,体验像坏了)。
  // 每个 fav 按可用数据列出候选题型,随机洗牌后取【第一个能凑齐 4 选项】的推入。跨天 +1 聚合逻辑不变(每词仍 1 条)。
  type Built = [ReviewQType, Omit<Extract<QuizItem, { kind: "choice" }>, "kind" | "id">];
  for (const f of favs) {
    // 虚词(the/of/because…)不作为题目本身出现 —— "the 是什么意思"是荒谬题,且占复习名额。历史遗留的直接跳过。
    if (isFunctionWord(f.term, f.pos)) continue;
    const exclude = excludeFor(f.term);
    const cls = clsFor(f.term);
    const builders: Array<() => Built | null> = [];
    if (mode === "zh") {
      if (f.zh) {
        builders.push(() => {
          const a = assemble(f.zh as string, pickDistractors(poolZh(f.kind), f.zh as string, 3, exclude, cls));
          return a ? ["en2cn", { stem: f.term, options: a.options, answerIndex: a.answerIndex }] : null;
        });
        builders.push(() => {
          const a = assemble(f.term, pickDistractors(poolTerms(f.kind), f.term, 3, exclude, cls));
          return a ? ["cn2en", { stem: f.zh as string, options: a.options, answerIndex: a.answerIndex }] : null;
        });
      }
      if (f.src_sentence && f.src_sentence.trim()) {
        builders.push(() => {
          const blanked = blankSentence(f.src_sentence as string, f.term);
          if (!blanked) return null;
          const a = assemble(f.term, pickDistractors(poolTerms(f.kind), f.term, 3, exclude, cls));
          return a ? ["cloze", {
            stem: f.zh ? `选出空格处应填的词:「${f.zh}」` : "选出空格处应填的词",
            options: a.options, answerIndex: a.answerIndex, context: blanked, stemCn: f.src_zh ?? undefined,
          }] : null;
        });
      }
    } else {
      const gen = glossEnOf(f.term, f.book_id);
      if (gen) {
        builders.push(() => {
          const a = assemble(f.term, pickDistractors(poolTerms(f.kind), f.term, 3, exclude, cls));
          return a ? ["endef", { stem: gen, options: a.options, answerIndex: a.answerIndex }] : null;
        });
        if (f.src_sentence && f.src_sentence.trim()) {
          builders.push(() => {
            const blanked = blankSentence(f.src_sentence as string, f.term);
            if (!blanked) return null;
            const a = assemble(f.term, pickDistractors(poolTerms(f.kind), f.term, 3, exclude, cls));
            return a ? ["cloze", {
              stem: `Which word fits the blank? — "${gen}"`,
              options: a.options, answerIndex: a.answerIndex, context: blanked,
            }] : null;
          });
        }
      }
    }
    for (const b of shuffle(builders)) {
      const res = b();
      if (res) { push(res[0], f, res[1]); break; } // 只推随机选中的第一个成功题型
    }
  }

  return { items: shuffle(items), meta };
}
