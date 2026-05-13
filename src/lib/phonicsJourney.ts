// Phonics learning journey — 把"学新音"和"用一下/读绘本"串成微循环。
// 不动数据库,纯函数 + localStorage 计数。
import { PHONICS_ITEMS, PHONICS_GROUPS, type PhonicsItem } from "@/data/primaryPhonics";
import { PHONICS_ITEMS_G2, PHONICS_GROUPS_G2 } from "@/data/primaryPhonicsG2";
import { SIGHT_WORD_ITEMS, type SightWordItem } from "@/data/primarySightWords";
import { SIGHT_WORD_ITEMS_G2 } from "@/data/primarySightWordsG2";
import { PRIMARY_STORY_BOOKS, type StoryBook } from "@/data/primaryStoryBooks";
import { PRIMARY_STORY_BOOKS_G2 } from "@/data/primaryStoryBooksG2";
import { isDue, type PhonicsMastery, type PhonicsMasteryMap } from "@/lib/phonicsMastery";

export type Grade = 1 | 2 | 3 | 4;

function isG2Id(phonicsId: string): boolean {
  return PHONICS_ITEMS_G2.some((it) => it.id === phonicsId);
}

export function getPhonicsPool(grade: number) {
  return grade >= 2 ? PHONICS_ITEMS_G2 : PHONICS_ITEMS;
}
export function getGroupsPool(grade: number) {
  return grade >= 2 ? PHONICS_GROUPS_G2 : PHONICS_GROUPS;
}

/** 取此音"代表字母"用作子串匹配。digraph(ai/oa/ee)直接用 letter,单字母用 letter。 */
function focusKey(item: PhonicsItem): string {
  return (item.letter || "").toLowerCase();
}

/** 含此 letter 子串的 sight words(优先短词、rank 靠前) */
export function findSightWordsContaining(
  letter: string,
  grade: number,
  n = 3
): SightWordItem[] {
  const pool = grade >= 2 ? SIGHT_WORD_ITEMS_G2 : SIGHT_WORD_ITEMS;
  const k = letter.toLowerCase();
  const matches = pool.filter((w) => w.word.toLowerCase().includes(k));
  // 偏短 + Fry rank 靠前
  matches.sort((a, b) => a.word.length - b.word.length || a.rank - b.rank);
  return matches.slice(0, n);
}

/** 找一本"含此音"且未读完的绘本 */
export function findStoryBookForSound(
  letter: string,
  grade: number,
  doneIds: Set<string> = new Set()
): StoryBook | null {
  const books: StoryBook[] = grade >= 2
    ? [...PRIMARY_STORY_BOOKS, ...PRIMARY_STORY_BOOKS_G2]
    : PRIMARY_STORY_BOOKS;
  const k = letter.toLowerCase();
  const containsLetter = (b: StoryBook) =>
    b.pages.some((p) => p.text_en.toLowerCase().includes(k));

  // 1) 未读且含此音
  const unread = books.filter((b) => !doneIds.has(b.id) && containsLetter(b));
  if (unread.length) {
    unread.sort((a, b) => a.level - b.level || a.sortOrder - b.sortOrder);
    return unread[0];
  }
  // 2) 含此音(允许复读)
  const any = books.filter(containsLetter);
  if (any.length) {
    any.sort((a, b) => a.level - b.level || a.sortOrder - b.sortOrder);
    return any[0];
  }
  // 3) fallback:最简单的未读
  const fallback = books.filter((b) => !doneIds.has(b.id))
    .sort((a, b) => a.level - b.level || a.sortOrder - b.sortOrder)[0];
  return fallback ?? books[0] ?? null;
}

/** 在一段英文中找出所有含此 letter 子串的"词" */
export function highlightWordsInText(text: string, letter: string): string[] {
  const k = letter.toLowerCase();
  return text.split(/\b/).filter((tok) => /[a-z]/i.test(tok) && tok.toLowerCase().includes(k));
}

// ─── 每日"已学新音"小计数(localStorage) ────────────────────────
const NEW_SOUND_KEY = "primary:phonics:newSoundsToday:v1";
type NewSoundLog = { date: string; ids: string[] };

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function loadLog(): NewSoundLog {
  try {
    const raw = localStorage.getItem(NEW_SOUND_KEY);
    if (raw) {
      const v = JSON.parse(raw) as NewSoundLog;
      if (v.date === todayStr()) return v;
    }
  } catch {/* noop */}
  return { date: todayStr(), ids: [] };
}
export function recordNewSoundLearned(id: string) {
  const log = loadLog();
  if (!log.ids.includes(id)) log.ids.push(id);
  localStorage.setItem(NEW_SOUND_KEY, JSON.stringify(log));
}
export function newSoundsLearnedToday(): number {
  return loadLog().ids.length;
}

// ─── 今日是否已读绘本(localStorage 标记) ────────────────────────
const TODAY_READ_KEY = "primary:phonics:readBookToday:v1";
export function markStoryBookReadToday() {
  localStorage.setItem(TODAY_READ_KEY, todayStr());
}
export function hasReadBookToday(): boolean {
  return localStorage.getItem(TODAY_READ_KEY) === todayStr();
}

// ─── "学完一个音的下一步" 决策 ──────────────────────────────────
export type NextAction =
  | { kind: "useIt"; letter: string; href: string }
  | { kind: "challenge"; groupId: string; href: string }
  | { kind: "readBook"; bookId: string; letter: string; href: string }
  | { kind: "review"; href: string }
  | { kind: "newSound"; href: string };

export function nextActionAfterPhonicsLearn(opts: {
  item: PhonicsItem;
  mastery: PhonicsMasteryMap;
  grade: number;
  storyDoneIds?: Set<string>;
}): NextAction {
  const { item, mastery, grade, storyDoneIds = new Set() } = opts;
  const isG2 = isG2Id(item.id) || grade >= 2;
  const gradeQ = isG2 ? "?grade=2" : "";
  const ITEMS = getPhonicsPool(grade);

  const groupItems = ITEMS.filter((p) => p.groupId === item.groupId);
  const groupAllLearned = groupItems.every((p) => (mastery.get(p.id)?.mastery_level ?? 0) >= 1);
  const groupAllMastered = groupItems.every((p) => (mastery.get(p.id)?.mastery_level ?? 0) >= 2);

  // 1) 整组刚学完(每个音 ≥1)且未掌握 → 整组挑战
  if (groupAllLearned && !groupAllMastered) {
    return {
      kind: "challenge",
      groupId: item.groupId,
      href: `/primary/phonics/quiz/${item.groupId}${gradeQ}`,
    };
  }

  // 2) 今天还没读绘本 → 读绘本(把今天主音当主角)
  if (!hasReadBookToday()) {
    const book = findStoryBookForSound(focusKey(item), grade, storyDoneIds);
    if (book) {
      return {
        kind: "readBook",
        bookId: book.id,
        letter: focusKey(item),
        href: `/primary/reading/read/${book.id}?focus=${focusKey(item)}`,
      };
    }
  }

  // 3) 今天连学 ≥2 个新音 → 强制"用一下"
  if (newSoundsLearnedToday() >= 2) {
    return {
      kind: "useIt",
      letter: focusKey(item),
      href: `/primary/phonics/use/${focusKey(item)}${gradeQ}`,
    };
  }

  // 4) 默认:用一下(把音应用到 sight word)
  return {
    kind: "useIt",
    letter: focusKey(item),
    href: `/primary/phonics/use/${focusKey(item)}${gradeQ}`,
  };
}

// ─── PrimaryPhonics 主页 CTA 优先级 ────────────────────────────
export type DashboardCta =
  | { kind: "review"; count: number; href: string }
  | { kind: "useYesterday"; letter: string; href: string }
  | { kind: "readBook"; bookId: string; letter: string; href: string }
  | { kind: "challenge"; groupId: string; href: string }
  | { kind: "newSound"; itemId: string; href: string };

export function pickDashboardCtas(opts: {
  grade: number;
  mastery: PhonicsMasteryMap;
  storyDoneIds?: Set<string>;
}): DashboardCta[] {
  const { grade, mastery, storyDoneIds = new Set() } = opts;
  const isG2 = grade >= 2;
  const gradeQ = isG2 ? "?grade=2" : "";
  const ITEMS = getPhonicsPool(grade);
  const GROUPS = [...getGroupsPool(grade)].sort((a, b) => a.sortOrder - b.sortOrder);

  const out: DashboardCta[] = [];

  // a) 到期复习
  const due = ITEMS.filter((it) => isDue(mastery.get(it.id) as PhonicsMastery | undefined));
  if (due.length >= 3) {
    out.push({
      kind: "review",
      count: due.length,
      href: `/primary/phonics/quiz/review${gradeQ}`,
    });
  }

  // b) 今日还没读绘本 → 用最近一个学过的音作主角
  if (!hasReadBookToday()) {
    const recent = ITEMS
      .map((it) => ({ it, m: mastery.get(it.id) }))
      .filter((x) => x.m && (x.m.mastery_level ?? 0) >= 1 && x.m.last_seen_at)
      .sort((a, b) => (b.m!.last_seen_at! > a.m!.last_seen_at! ? 1 : -1))[0];
    if (recent) {
      const letter = focusKey(recent.it);
      const book = findStoryBookForSound(letter, grade, storyDoneIds);
      if (book) {
        out.push({
          kind: "readBook",
          bookId: book.id,
          letter,
          href: `/primary/reading/read/${book.id}?focus=${letter}`,
        });
      }
    }
  }

  // c) 当前未掌握组若整组已学过 → 整组挑战
  for (const g of GROUPS) {
    const items = ITEMS.filter((it) => it.groupId === g.id);
    if (!items.length) continue;
    const allLearned = items.every((it) => (mastery.get(it.id)?.mastery_level ?? 0) >= 1);
    const allMastered = items.every((it) => (mastery.get(it.id)?.mastery_level ?? 0) >= 2);
    if (allLearned && !allMastered) {
      out.push({ kind: "challenge", groupId: g.id, href: `/primary/phonics/quiz/${g.id}${gradeQ}` });
      break;
    }
  }

  // d) 学新音(若今天已经学了 ≥2 个,降级为"先去用一下")
  const learnedToday = newSoundsLearnedToday();
  const nextNew = ITEMS.find((it) => (mastery.get(it.id)?.mastery_level ?? 0) === 0);
  if (nextNew) {
    if (learnedToday >= 2) {
      const letter = focusKey(nextNew);
      out.push({ kind: "useYesterday", letter, href: `/primary/phonics/use/${letter}${gradeQ}` });
    } else {
      out.push({
        kind: "newSound",
        itemId: nextNew.id,
        href: `/primary/phonics/learn/${nextNew.id}${gradeQ}`,
      });
    }
  }

  return out;
}
