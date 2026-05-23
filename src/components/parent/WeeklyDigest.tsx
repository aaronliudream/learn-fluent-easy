import { T } from "@/i18n/T";import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, Volume2, AlertCircle, Trophy, ChevronRight, Clock, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { speak } from "@/lib/speak";

type Mastery = {
  word_id: string;mastery_level: number | null;interval_days: number | null;
  quiz_correct: number | null;quiz_wrong: number | null;
  listen_correct: number | null;listen_wrong: number | null;
  spell_correct: number | null;spell_wrong: number | null;
  match_correct: number | null;match_wrong: number | null;
  last_seen_at: string | null;updated_at?: string | null;
};
type Vocab = {id: string;word: string;meaning_cn: string;};

function weekAgo(): Date {const d = new Date();d.setDate(d.getDate() - 7);return d;}

export default function WeeklyDigest() {
  const [grade, setGrade] = useState<number>(() => Number(localStorage.getItem("primary:lastGrade") ?? "1"));
  const [loading, setLoading] = useState(true);
  const [mastery, setMastery] = useState<Mastery[]>([]);
  const [vocabMap, setVocabMap] = useState<Map<string, Vocab>>(new Map());
  const [lessonsThisWeek, setLessonsThisWeek] = useState(0);
  const [minutesThisWeek, setMinutesThisWeek] = useState(0);

  useEffect(() => {
    const onChange = () => setGrade(Number(localStorage.getItem("primary:lastGrade") ?? "1"));
    window.addEventListener("storage", onChange);
    return () => window.removeEventListener("storage", onChange);
  }, []);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (!uid) {setLoading(false);return;}

      const since = weekAgo().toISOString();
      const [{ data: m }, { data: v }, { data: lp }] = await Promise.all([
      supabase.from("primary_word_mastery").
      select("word_id,mastery_level,interval_days,quiz_correct,quiz_wrong,listen_correct,listen_wrong,spell_correct,spell_wrong,match_correct,match_wrong,last_seen_at,updated_at").
      eq("user_id", uid).eq("grade", grade).
      gte("updated_at", since),
      supabase.from("primary_vocab").select("id,word,meaning_cn").eq("grade", grade),
      supabase.from("primary_lesson_progress").
      select("lesson_id,completed_at,primary_lessons!inner(estimated_minutes,unit_id,primary_units!inner(grade))").
      eq("user_id", uid).eq("primary_lessons.primary_units.grade", grade).
      gte("completed_at", since)]
      );
      const mm = (m ?? []) as Mastery[];
      setMastery(mm);
      const vm = new Map<string, Vocab>();
      (v ?? []).forEach((x: any) => vm.set(x.id, x));
      setVocabMap(vm);
      const completed = (lp ?? []).filter((r: any) => r.completed_at);
      setLessonsThisWeek(completed.length);
      setMinutesThisWeek(completed.reduce((a: number, r: any) => a + (r.primary_lessons?.estimated_minutes ?? 10), 0));
      setLoading(false);
    })();
  }, [grade]);

  const { newlyMastered, weakWords } = useMemo(() => {
    const newly: Vocab[] = [];
    const weak: {v: Vocab;wrong: number;total: number;}[] = [];
    mastery.forEach((m) => {
      const v = vocabMap.get(m.word_id);
      if (!v) return;
      const masteredNow = (m.mastery_level ?? 0) >= 3 && (m.interval_days ?? 0) >= 7;
      if (masteredNow) newly.push(v);
      const correct = (m.quiz_correct ?? 0) + (m.listen_correct ?? 0) + (m.spell_correct ?? 0) + (m.match_correct ?? 0);
      const wrong = (m.quiz_wrong ?? 0) + (m.listen_wrong ?? 0) + (m.spell_wrong ?? 0) + (m.match_wrong ?? 0);
      if (wrong >= 2 && wrong / Math.max(1, wrong + correct) >= 0.4) {
        weak.push({ v, wrong, total: wrong + correct });
      }
    });
    weak.sort((a, b) => b.wrong - a.wrong);
    return { newlyMastered: newly.slice(0, 12), weakWords: weak.slice(0, 6) };
  }, [mastery, vocabMap]);

  if (loading) {
    return (
      <section className="mb-4 rounded-3xl border border-border/60 bg-card p-5">
        <div className="flex items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> <T>整理本周报告…</T>
        </div>
      </section>);

  }

  const isQuiet = newlyMastered.length === 0 && weakWords.length === 0 && lessonsThisWeek === 0;

  return (
    <section className="mb-4 rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-amber-500" />
          <h2 className="text-base font-extrabold md:text-lg"><T>📰 本周快报 · G</T>{grade}</h2>
        </div>
        <span className="text-[11px] text-muted-foreground"><T>最近 7 天</T></span>
      </div>

      {isQuiet ?
      <div className="rounded-2xl border-2 border-dashed border-border bg-secondary/40 p-5 text-center">
          <div className="text-3xl">🌱</div>
          <p className="mt-1 text-sm font-bold"><T>本周还没有学习记录</T></p>
          <p className="mt-1 text-xs text-muted-foreground"><T>陪孩子一起开始第一节课吧</T></p>
          <Link to={`/primary/hub/${grade}`} className="mt-3 inline-flex items-center gap-1 rounded-full bg-violet-600 px-4 py-1.5 text-xs font-extrabold text-white hover:bg-violet-700">
            <T>开始今天的学习</T> <ChevronRight className="size-3" />
          </Link>
        </div> :

      <div className="grid gap-3 md:grid-cols-2">
          {/* 新掌握 */}
          <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 dark:border-emerald-900 dark:from-emerald-950/30 dark:to-teal-950/20">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Trophy className="size-4 text-emerald-600" />
                <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300"><T>本周新掌握</T></span>
              </div>
              <span className="text-2xl font-black tabular-nums text-emerald-700 dark:text-emerald-300">+{newlyMastered.length}</span>
            </div>
            {newlyMastered.length > 0 ?
          <div className="flex flex-wrap gap-1.5">
                {newlyMastered.map((w) =>
            <button
              key={w.id}
              onClick={() => speak(w.word)}
              className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-emerald-700 shadow-sm hover:scale-105 dark:bg-emerald-900/40 dark:text-emerald-200"
              title={w.meaning_cn}>
              
                    <Volume2 className="size-3" /> {w.word}
                  </button>
            )}
              </div> :

          <p className="text-xs text-muted-foreground"><T>还没新掌握的词，多练几次就上榜！</T></p>
          }
          </div>

          {/* 薄弱词 */}
          <div className="rounded-2xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-orange-50 p-4 dark:border-rose-900 dark:from-rose-950/30 dark:to-orange-950/20">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="size-4 text-rose-600" />
                <span className="text-sm font-extrabold text-rose-700 dark:text-rose-300"><T>本周薄弱词</T></span>
              </div>
              <span className="text-2xl font-black tabular-nums text-rose-700 dark:text-rose-300">{weakWords.length}</span>
            </div>
            {weakWords.length > 0 ?
          <>
                <div className="flex flex-wrap gap-1.5">
                  {weakWords.map(({ v, wrong, total }) =>
              <button
                key={v.id}
                onClick={() => speak(v.word)}
                className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-rose-700 shadow-sm hover:scale-105 dark:bg-rose-900/40 dark:text-rose-200"
                title={`${v.meaning_cn} · ${wrong}/${total} 错`}>
                
                      <Volume2 className="size-3" /> {v.word}
                    </button>
              )}
                </div>
                <Link to={`/primary/hub/${grade}`} className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-full bg-rose-600 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-rose-700">
                  <T>一键补练 6 题</T> <ChevronRight className="size-3" />
                </Link>
              </> :

          <p className="text-xs text-muted-foreground"><T>本周没有明显薄弱词，太棒了！</T></p>
          }
          </div>

          {/* 学习时长 */}
          <div className="rounded-2xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 p-4 dark:border-sky-900 dark:from-sky-950/30 dark:to-blue-950/20">
            <div className="mb-1 flex items-center gap-1.5">
              <Clock className="size-4 text-sky-600" />
              <span className="text-sm font-extrabold text-sky-700 dark:text-sky-300"><T>本周学习时长</T></span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black tabular-nums">{minutesThisWeek}</span>
              <span className="text-sm font-bold text-muted-foreground"><T>/ 60 分钟</T></span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/70 dark:bg-black/30">
              <div className="h-full bg-gradient-to-r from-sky-500 to-blue-500" style={{ width: `${Math.min(100, minutesThisWeek / 60 * 100)}%` }} />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {minutesThisWeek >= 60 ? "🎉 已达本周目标！" : `还差 ${60 - minutesThisWeek} 分钟达成本周目标`}
            </p>
          </div>

          {/* 课程 */}
          <div className="rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-4 dark:border-violet-900 dark:from-violet-950/30 dark:to-fuchsia-950/20">
            <div className="mb-1 flex items-center gap-1.5">
              <BookOpen className="size-4 text-violet-600" />
              <span className="text-sm font-extrabold text-violet-700 dark:text-violet-300"><T>本周完成课程</T></span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black tabular-nums">{lessonsThisWeek}</span>
              <span className="text-sm font-bold text-muted-foreground"><T>节</T></span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {lessonsThisWeek >= 3 ? "👍 节奏稳定，继续保持！" : "建议每周完成 3 节课，养成节奏。"}
            </p>
            <Link to={`/primary/hub/${grade}`} className="mt-2 inline-flex items-center gap-1 text-[11px] font-extrabold text-violet-700 hover:underline dark:text-violet-300">
              <T>继续下一节</T> <ChevronRight className="size-3" />
            </Link>
          </div>
        </div>
      }
    </section>);

}