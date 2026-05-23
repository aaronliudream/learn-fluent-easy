import { supabase } from "@/integrations/supabase/client";
import type { AdventureStep } from "@/lib/dailyAdventure";
import { primaryHubPath, readPrimaryGradeFromStorage } from "@/lib/primaryGrade";
import { countPrimaryDue, isPrimaryWordMastered } from "@/lib/primaryMasteryStats";
import {
  fetchPrimaryVocabByVolume,
  listUnitsInVolume,
  PEP_VOLUME_GRADE,
  PEP_VOLUME_TOTALS,
  type PrimaryPepVocabRow,
} from "@/lib/primaryPepVocab";
import type { ContinuePick, StageOverview } from "@/hooks/useMasteryOverview";
import { pickContinue } from "@/hooks/useMasteryOverview";

export const PRIMARY_VOLUME_KEY = "primary:pepVolume";
export const PRIMARY_ONBOARDED_KEY = "primary:g3Onboarded";

/** 预备级 G1–G2；三年级起点主线 G3–G6 */
export function isPrepGrade(grade: number): boolean {
  return grade <= 2;
}

export const PEP_VOLUMES = ["3A", "3B", "4A", "4B", "5A", "5B", "6A", "6B"] as const;
export type PepVolume = (typeof PEP_VOLUMES)[number];

/** Map school grade → default PEP semester volume (上学期). */
export function defaultVolumeForGrade(grade: number): PepVolume {
  if (grade <= 3) return "3A";
  if (grade === 4) return "4A";
  if (grade === 5) return "5A";
  return "6A";
}

export function readPepVolumeFromStorage(grade: number): PepVolume {
  if (typeof window === "undefined") return defaultVolumeForGrade(grade);
  try {
    const raw = localStorage.getItem(PRIMARY_VOLUME_KEY);
    if (raw && PEP_VOLUMES.includes(raw as PepVolume)) return raw as PepVolume;
  } catch {
    /* ignore */
  }
  return defaultVolumeForGrade(grade);
}

export function writePepVolumeToStorage(volume: PepVolume): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PRIMARY_VOLUME_KEY, volume);
  } catch {
    /* ignore */
  }
}

export type PrimaryTrackSnapshot = {
  grade: number;
  /** Current textbook unit from lesson map */
  unitTitle: string | null;
  unitEmoji: string | null;
  unitIndex: number;
  pepVolume: PepVolume;
  /** PEP 词表单元，如 Unit 1 */
  pepUnit: string | null;
  nextListeningLessonId: string | null;
  nextReadingArticleId: string | null;
  nextSpeakingLessonId: string | null;
  nextAnyLessonId: string | null;
  dueVocabCount: number;
  readingDone: number;
  readingTotal: number;
};

export async function fetchPrimaryTrackSnapshot(
  userId: string | null,
  grade: number
): Promise<PrimaryTrackSnapshot> {
  const pepVolume = readPepVolumeFromStorage(grade);
  const empty: PrimaryTrackSnapshot = {
    grade,
    unitTitle: null,
    unitEmoji: null,
    unitIndex: 0,
    pepVolume,
    pepUnit: null,
    nextListeningLessonId: null,
    nextReadingArticleId: null,
    nextSpeakingLessonId: null,
    nextAnyLessonId: null,
    dueVocabCount: 0,
    readingDone: 0,
    readingTotal: 0,
  };

  const syncGrade = PEP_VOLUME_GRADE[pepVolume];
  const vocabRows = await fetchPrimaryVocabByVolume(pepVolume);
  const vocabIdSet = new Set(vocabRows.map((v) => v.id));

  const [lessonsRes, articlesRes, readingProgRes, masteryRes] = await Promise.all([
    supabase
      .from("primary_lessons")
      .select(
        "id,primary_skill,sort_order,progress:primary_lesson_progress(completed_at),unit:primary_units!inner(id,title_cn,emoji,sort_order,grade)"
      )
      .eq("unit.grade", grade)
      .order("sort_order"),
    supabase.from("primary_reading_articles").select("id,sort_order").eq("grade", grade).order("sort_order"),
    userId
      ? supabase
          .from("primary_reading_progress")
          .select("article_id,completed_at")
          .eq("user_id", userId)
      : Promise.resolve({ data: [] as { article_id: string; completed_at: string | null }[] }),
    userId
      ? supabase
          .from("primary_word_mastery")
          .select("mastery_level,due_at")
          .eq("user_id", userId)
          .eq("grade", syncGrade)
      : Promise.resolve({ data: [] as { word_id: string; mastery_level: number | null; due_at: string | null }[] }),
  ]);

  const masteryInVolume = ((masteryRes.data ?? []) as { word_id: string; mastery_level: number | null; due_at: string | null }[]).filter(
    (r) => vocabIdSet.has(r.word_id)
  );
  const mMap = new Map(masteryInVolume.map((r) => [r.word_id, r]));
  const pepUnit = inferCurrentPepUnit(vocabRows, mMap);

  const lessons = (lessonsRes.data ?? []) as any[];
  const articles = (articlesRes.data ?? []) as { id: string }[];
  const readDoneIds = new Set(
    ((readingProgRes.data ?? []) as any[])
      .filter((p) => p.completed_at)
      .map((p) => p.article_id as string)
  );

  const firstIncomplete = (skill?: string) =>
    lessons.find(
      (l) =>
        !(l.progress?.[0]?.completed_at) &&
        (!skill || (l.primary_skill || "").toLowerCase() === skill)
    ) ?? null;

  const nextAny = firstIncomplete();
  const nextListen = firstIncomplete("listening") ?? nextAny;
  const nextSpeak = firstIncomplete("speaking") ?? firstIncomplete("reading") ?? nextAny;
  const nextRead =
    (articlesRes.data ?? []).find((a: any) => !readDoneIds.has(a.id)) ?? (articlesRes.data ?? [])[0];

  let unitTitle: string | null = null;
  let unitEmoji: string | null = null;
  let unitIndex = 0;
  const anchor = nextAny ?? lessons[0];
  if (anchor?.unit) {
    unitTitle = anchor.unit.title_cn ?? null;
    unitEmoji = anchor.unit.emoji ?? null;
    const units = [...new Map(lessons.map((l: any) => [l.unit.id, l.unit])).values()].sort(
      (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    );
    unitIndex = Math.max(0, units.findIndex((u: any) => u.id === anchor.unit.id));
  }

  return {
    grade: syncGrade,
    unitTitle,
    unitEmoji,
    unitIndex,
    pepVolume,
    pepUnit,
    nextListeningLessonId: nextListen?.id ?? null,
    nextReadingArticleId: (nextRead as any)?.id ?? null,
    nextSpeakingLessonId: nextSpeak?.id ?? null,
    nextAnyLessonId: nextAny?.id ?? null,
    dueVocabCount: countPrimaryDue(masteryInVolume),
    readingDone: readDoneIds.size,
    readingTotal: articles.length,
  };
}

function inferCurrentPepUnit(
  vocab: PrimaryPepVocabRow[],
  mastery: Map<string, { mastery_level?: number | null }>
): string | null {
  for (const unit of listUnitsInVolume(vocab)) {
    const words = vocab.filter((v) => v.unit === unit);
    const hasOpen = words.some((w) => !isPrimaryWordMastered(mastery.get(w.id)?.mastery_level));
    if (hasOpen) return unit;
  }
  return listUnitsInVolume(vocab)[0] ?? null;
}

export function formatPrimaryTrackLabel(snap: PrimaryTrackSnapshot): string {
  const unitPart = snap.pepUnit ?? snap.unitTitle;
  return unitPart ? `人教 PEP ${snap.pepVolume} · ${unitPart}` : `人教 PEP ${snap.pepVolume}`;
}

const VOLUME_SEMESTER: Record<PepVolume, string> = {
  "3A": "grade3_volume1",
  "3B": "grade3_volume2",
  "4A": "grade4_volume1",
  "4B": "grade4_volume2",
  "5A": "grade5_volume1",
  "5B": "grade5_volume2",
  "6A": "grade6_volume1",
  "6B": "grade6_volume2",
};

function pepUnitId(volume: PepVolume, pepUnit: string | null): string {
  const g = PEP_VOLUME_GRADE[volume];
  const v = volume.endsWith("B") ? "v2" : "v1";
  const n = pepUnit ? parseInt(pepUnit.replace(/\D/g, ""), 10) || 1 : 1;
  return `g${g}${v}_u${n}`;
}

export function primaryVocabPath(grade: number, opts?: { focus?: "due" | "weak"; volume?: PepVolume; unit?: string | null }): string {
  const vol = opts?.volume ?? readPepVolumeFromStorage(grade);
  const sem = VOLUME_SEMESTER[vol];
  const unitId = pepUnitId(vol, opts?.unit ?? null);
  const base = `/primary/hub/${grade}/semester/${sem}/unit/${unitId}`;
  if (opts?.focus === "due") return `${base}/stage/0`;
  return base;
}

/** Child-facing subtitle for the next adventure step kind. */
export function stepKindLabel(kind: AdventureStep["kind"]): string {
  const map: Record<AdventureStep["kind"], string> = {
    listening: "听",
    reading: "读故事",
    vocab: "认词",
    roleplay: "开口说",
    lesson: "上课",
    phonics: "拼读",
    culture: "复习",
    game: "玩一玩",
  };
  return map[kind] ?? "学习";
}

export type BuildStandardOpts = {
  grade: number;
  track: PrimaryTrackSnapshot;
  continuePick?: ContinuePick | null;
};

/** G3–G6: 听 → 故事 → 词 → 复习（与家长中心 due / 阅读 / 词汇口径一致） */
export function buildStandardDailySteps(opts: BuildStandardOpts): AdventureStep[] {
  const { grade, track, continuePick } = opts;
  const steps: AdventureStep[] = [];

  const listenTo = track.nextListeningLessonId
    ? primaryHubPath(grade)
    : primaryHubPath(grade);

  steps.push({
    kind: "listening",
    emoji: "🎧",
    title: track.unitTitle ? `听 · ${track.unitTitle}` : "听 Spark 聊天",
    sparkLine: "先竖起小耳朵,听懂再说——语感就是这样来的!",
    cta: track.nextListeningLessonId ? "开始听力课" : "去听一听",
    to: listenTo,
    estMinutes: 5,
  });

  const readTo = primaryHubPath(grade);

  steps.push({
    kind: "reading",
    emoji: "📖",
    title: "读一个有趣故事",
    sparkLine: `今天的故事在等你!已读完 ${track.readingDone}/${track.readingTotal} 篇`,
    cta: track.nextReadingArticleId ? "打开故事" : "去选故事",
    to: readTo,
    estMinutes: 5,
  });

  steps.push({
    kind: "vocab",
    emoji: "🗣",
    title: "和 Spark 读单词",
    sparkLine: "大声读给 Spark 听,认词也要用耳朵!",
    cta: "和 Spark 读单词",
    to: primaryVocabPath(grade, { volume: track.pepVolume, unit: track.pepUnit }),
    estMinutes: 4,
  });

  const review = continuePick ?? null;
  if (track.dueVocabCount > 0 || (review?.kind === "due" && review.module === "vocab")) {
    const n = track.dueVocabCount;
    steps.push({
      kind: "culture",
      emoji: "⏰",
      title: n > 0 ? `复习到期单词 · ${n} 个` : "复习单词",
      sparkLine: "家长中心也显示这些词到期了,我们一起巩固!",
      cta: "开始复习",
      to: primaryVocabPath(grade, { focus: "due", volume: track.pepVolume }),
      estMinutes: 5,
    });
  } else if (track.nextSpeakingLessonId) {
    steps.push({
      kind: "roleplay",
      emoji: "🗣️",
      title: "开口说一说",
      sparkLine: "听懂了、读过了,现在轮到你开口啦!",
      cta: "开始口语",
      to: primaryHubPath(grade),
      estMinutes: 5,
    });
  } else {
    steps.push({
      kind: "roleplay",
      emoji: "💬",
      title: "跟 Spark 练口语",
      sparkLine: "跟 Spark 说几句今天学的,我会帮你纠错!",
      cta: "去练口语",
      to: primaryHubPath(grade),
      estMinutes: 4,
    });
  }

  return steps;
}

/** Resolve continue pick with grade-aware routes (matches Learning Center). */
export function pickPrimaryContinue(ov: StageOverview, grade?: number): ContinuePick {
  const g = grade ?? readPrimaryGradeFromStorage();
  const pick = pickContinue("primary", ov);
  if (pick.module === "vocab") {
    const vol = readPepVolumeFromStorage(g);
    const to =
      pick.kind === "due"
        ? primaryVocabPath(g, { focus: "due", volume: vol })
        : primaryVocabPath(g, { volume: vol });
    return { ...pick, to };
  }
  if (pick.module === "reading") {
    return { ...pick, to: primaryHubPath(g) };
  }
  if (pick.module === "lesson") {
    return { ...pick, to: primaryHubPath(g) };
  }
  return { ...pick, to: primaryHubPath(g) };
}
