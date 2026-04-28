import type { LessonContent } from "@/data/course";
import { supabase } from "@/integrations/supabase/client";

const KEY_PREFIX = "lesson_ai_v1:";

const k = (level: number, unit: number, lesson: number) =>
  `${KEY_PREFIX}${level}-${unit}-${lesson}`;

/** Synchronous local-only read. Used as instant cache for fast paint. */
export const getLocalCachedLesson = (
  level: number,
  unit: number,
  lesson: number,
): LessonContent | null => {
  try {
    const raw = localStorage.getItem(k(level, unit, lesson));
    if (!raw) return null;
    return JSON.parse(raw) as LessonContent;
  } catch {
    return null;
  }
};

/** Synchronous local-only write. */
export const setLocalCachedLesson = (
  level: number,
  unit: number,
  lesson: number,
  content: LessonContent,
) => {
  try {
    localStorage.setItem(k(level, unit, lesson), JSON.stringify(content));
  } catch {
    // localStorage might be full; ignore.
  }
};

export const clearLocalCachedLesson = (
  level: number,
  unit: number,
  lesson: number,
) => {
  try {
    localStorage.removeItem(k(level, unit, lesson));
  } catch {
    /* noop */
  }
};

/**
 * Read from cloud (when logged in), falling back to local cache.
 * Returns whichever is found first; cloud result is mirrored to local.
 */
export const getCachedLesson = async (
  level: number,
  unit: number,
  lesson: number,
): Promise<LessonContent | null> => {
  const local = getLocalCachedLesson(level, unit, lesson);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return local;
    const { data, error } = await supabase
      .from("generated_lessons")
      .select("content")
      .eq("user_id", user.id)
      .eq("level", level)
      .eq("unit", unit)
      .eq("lesson", lesson)
      .maybeSingle();
    if (error) return local;
    if (data?.content) {
      const content = data.content as LessonContent;
      setLocalCachedLesson(level, unit, lesson, content);
      return content;
    }
    // Not in cloud yet — if we have a local copy, push it up so other devices see it
    if (local && user) {
      void supabase.from("generated_lessons").upsert(
        {
          user_id: user.id,
          level,
          unit,
          lesson,
          content: local as any,
        },
        { onConflict: "user_id,level,unit,lesson" },
      );
    }
    return local;
  } catch {
    return local;
  }
};

/** Save content to local immediately and push to cloud if logged in. */
export const setCachedLesson = async (
  level: number,
  unit: number,
  lesson: number,
  content: LessonContent,
) => {
  setLocalCachedLesson(level, unit, lesson, content);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("generated_lessons").upsert(
      {
        user_id: user.id,
        level,
        unit,
        lesson,
        content: content as any,
      },
      { onConflict: "user_id,level,unit,lesson" },
    );
  } catch {
    /* noop */
  }
};

/** Clear both local and cloud copies. */
export const clearCachedLesson = async (
  level: number,
  unit: number,
  lesson: number,
) => {
  clearLocalCachedLesson(level, unit, lesson);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("generated_lessons")
      .delete()
      .eq("user_id", user.id)
      .eq("level", level)
      .eq("unit", unit)
      .eq("lesson", lesson);
  } catch {
    /* noop */
  }
};