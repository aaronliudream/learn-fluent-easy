import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, Loader2, Sparkles, ChevronRight, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type LessonRow = {
  id: string; title_cn: string; estimated_minutes: number;
  unit: { id: string; title_cn: string; emoji: string | null; grade: number };
  progress?: { completed_at: string | null }[];
};

const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];
const PACE_PRESETS = [
  { n: 2, label: "轻松节奏", hint: "每周 2 课 · 适合 5 岁起步", color: "from-emerald-400 to-teal-500" },
  { n: 3, label: "标准节奏", hint: "每周 3 课 · 推荐", color: "from-sky-500 to-blue-500" },
  { n: 5, label: "进阶节奏", hint: "每周 5 课 · 备考冲刺", color: "from-amber-500 to-orange-500" },
  { n: 7, label: "每日打卡", hint: "每周 7 课 · 高强度", color: "from-rose-500 to-pink-500" },
];

export default function PacingSettings() {
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [perWeek, setPerWeek] = useState(3);
  const [days, setDays] = useState<number[]>([1, 3, 5]);
  const [grade, setGrade] = useState<number>(() => Number(localStorage.getItem("primary:lastGrade") ?? "1"));
  const [lessons, setLessons] = useState<LessonRow[]>([]);

  // Load profile
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const id = u?.user?.id ?? null;
      setUid(id);
      if (!id) { setLoading(false); return; }
      const { data } = await supabase
        .from("profiles")
        .select("lessons_per_week, study_days")
        .eq("user_id", id)
        .maybeSingle();
      if (data) {
        setPerWeek((data as any).lessons_per_week ?? 3);
        const sd = (data as any).study_days as number[] | null;
        if (sd && sd.length) setDays(sd);
      }
      setLoading(false);
    })();
  }, []);

  // Load remaining lessons for current grade
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("primary_lessons")
        .select("id,title_cn,estimated_minutes,unit:primary_units!inner(id,title_cn,emoji,grade,sort_order),progress:primary_lesson_progress(completed_at)")
        .eq("unit.grade", grade)
        .order("sort_order");
      setLessons((data ?? []) as any);
    })();
  }, [grade, uid]);

  async function saveProfile(next: { lessons_per_week?: number; study_days?: number[] }) {
    if (!uid) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update(next).eq("user_id", uid);
    setSaving(false);
    if (error) toast.error("保存失败：" + error.message);
    else toast.success("已保存 ✓");
  }

  function toggleDay(d: number) {
    const next = days.includes(d) ? days.filter(x => x !== d) : [...days, d].sort();
    if (next.length === 0) { toast.info("至少选一天"); return; }
    setDays(next);
    saveProfile({ study_days: next });
  }

  function setPace(n: number) {
    setPerWeek(n);
    // Auto-suggest a balanced study-day distribution if mismatch
    const next = suggestDays(n);
    setDays(next);
    saveProfile({ lessons_per_week: n, study_days: next });
  }

  // Build the next-N-weeks schedule
  const schedule = useMemo(() => buildSchedule(lessons, days, perWeek, 4), [lessons, days, perWeek]);
  const remaining = lessons.filter(l => !l.progress?.[0]?.completed_at).length;
  const weeksToFinish = remaining > 0 && perWeek > 0 ? Math.ceil(remaining / perWeek) : 0;

  if (loading) {
    return (
      <section className="mb-4 rounded-3xl border-2 border-border bg-card p-4 text-sm text-muted-foreground">
        <Loader2 className="mr-2 inline size-4 animate-spin" /> 加载学习节奏…
      </section>
    );
  }
  if (!uid) return null;

  return (
    <section className="mb-4 rounded-3xl border-2 border-border bg-card p-4 shadow-tile md:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-5 text-violet-500" />
          <div>
            <div className="text-sm font-extrabold">📅 学习节奏 & 个性化周计划</div>
            <div className="text-[11px] text-muted-foreground">家长设置每周节奏，系统自动排课</div>
          </div>
        </div>
        {saving && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
      </div>

      {/* Pace presets */}
      <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4">
        {PACE_PRESETS.map(p => (
          <button
            key={p.n}
            onClick={() => setPace(p.n)}
            className={cn(
              "rounded-2xl border-2 p-3 text-left transition hover:-translate-y-0.5",
              perWeek === p.n
                ? "border-violet-500 bg-gradient-to-br from-violet-50 to-sky-50 shadow dark:from-violet-950/30 dark:to-sky-950/30"
                : "border-border bg-card"
            )}
          >
            <div className={cn("inline-flex rounded-full bg-gradient-to-r px-2 py-0.5 text-[10px] font-extrabold text-white", p.color)}>
              {p.n} 课/周
            </div>
            <div className="mt-1.5 text-sm font-extrabold">{p.label}</div>
            <div className="text-[10px] text-muted-foreground">{p.hint}</div>
          </button>
        ))}
      </div>

      {/* Custom slider */}
      <div className="mb-3 rounded-2xl border border-border bg-secondary/30 p-3">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-bold">自定义：每周 <span className="text-violet-600">{perWeek}</span> 课</span>
          <span className="text-muted-foreground">{remaining} 课待学 · 预计 {weeksToFinish || "—"} 周完成</span>
        </div>
        <input
          type="range" min={1} max={7} step={1} value={perWeek}
          onChange={(e) => setPerWeek(Number(e.target.value))}
          onMouseUp={() => setPace(perWeek)}
          onTouchEnd={() => setPace(perWeek)}
          className="w-full accent-violet-500"
        />
      </div>

      {/* Study days */}
      <div className="mb-3">
        <div className="mb-1.5 text-xs font-bold">学习日（点击选择）</div>
        <div className="flex gap-1.5">
          {WEEKDAY_LABELS.map((lab, i) => {
            const on = days.includes(i);
            return (
              <button
                key={i}
                onClick={() => toggleDay(i)}
                className={cn(
                  "h-10 flex-1 rounded-xl border-2 text-sm font-extrabold transition",
                  on
                    ? "border-violet-500 bg-violet-500 text-white shadow"
                    : "border-border bg-card text-muted-foreground hover:border-violet-300"
                )}
              >
                {lab}
              </button>
            );
          })}
        </div>
        <div className="mt-1 text-[10px] text-muted-foreground">
          每周学习日 = {days.length} 天 · 平均每天 {Math.ceil(perWeek / Math.max(1, days.length))} 课
        </div>
      </div>

      {/* Schedule preview */}
      <div className="rounded-2xl border-2 border-violet-200 bg-violet-50/50 p-3 dark:border-violet-800 dark:bg-violet-950/20">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm font-extrabold">
            <Sparkles className="size-4 text-violet-600" /> 未来 4 周个性化课表 · G{grade}
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-secondary p-0.5 text-[10px] font-bold">
            {[1,2,3,4,5,6].map(g => (
              <button
                key={g}
                onClick={() => { setGrade(g); localStorage.setItem("primary:lastGrade", String(g)); }}
                className={cn("rounded-full px-2 py-0.5", g === grade ? "bg-violet-500 text-white" : "text-muted-foreground")}
              >G{g}</button>
            ))}
          </div>
        </div>

        {schedule.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            🎉 本年级所有课程已完成！可以切换更高年级继续。
          </div>
        ) : (
          <div className="space-y-2">
            {schedule.map(week => (
              <div key={week.label} className="rounded-xl border border-border bg-card p-2.5">
                <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold">
                  <span>{week.label}</span>
                  <span className="text-muted-foreground">{week.items.length} 课 · 约 {week.items.reduce((a, x) => a + (x.lesson.estimated_minutes || 8), 0)} 分钟</span>
                </div>
                <div className="space-y-1">
                  {week.items.map(it => (
                    <Link
                      key={it.lesson.id + it.dateKey}
                      to={`/primary/lesson/${it.lesson.id}`}
                      className="flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/40 p-2 text-xs transition hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30"
                    >
                      <span className="grid size-7 place-items-center rounded-lg bg-violet-100 text-[10px] font-extrabold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                        {it.dayLabel}
                      </span>
                      <span className="text-base">{it.lesson.unit.emoji ?? "📘"}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-extrabold">{it.lesson.title_cn}</div>
                        <div className="text-[10px] text-muted-foreground">{it.lesson.unit.title_cn} · {it.lesson.estimated_minutes || 8} 分钟</div>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
          <BookOpen className="size-3" /> 课表按「每周 {perWeek} 课 × 选定学习日」自动生成 · 完成一节自动进位
        </div>
      </div>
    </section>
  );
}

function suggestDays(n: number): number[] {
  // Spread n days as evenly as possible across Mon–Sun
  const presets: Record<number, number[]> = {
    1: [3], 2: [2, 5], 3: [1, 3, 5], 4: [1, 2, 4, 6],
    5: [1, 2, 3, 4, 5], 6: [1, 2, 3, 4, 5, 6], 7: [0, 1, 2, 3, 4, 5, 6],
  };
  return presets[Math.max(1, Math.min(7, n))] ?? [1, 3, 5];
}

type ScheduledItem = {
  lesson: LessonRow;
  dateKey: string;
  dayLabel: string;
};
type ScheduledWeek = { label: string; items: ScheduledItem[] };

function buildSchedule(
  lessons: LessonRow[],
  days: number[],
  _perWeek: number,
  weeksAhead: number,
): ScheduledWeek[] {
  const remaining = lessons.filter(l => !l.progress?.[0]?.completed_at);
  if (remaining.length === 0 || days.length === 0) return [];

  const out: ScheduledWeek[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let lessonIdx = 0;

  for (let w = 0; w < weeksAhead && lessonIdx < remaining.length; w++) {
    const items: ScheduledItem[] = [];
    // Find this week's Sunday-anchored start
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + w * 7);

    for (const d of days) {
      if (lessonIdx >= remaining.length) break;
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + d);
      // Skip past dates in current week
      if (w === 0 && date < today) continue;
      const lesson = remaining[lessonIdx++];
      items.push({
        lesson,
        dateKey: date.toISOString().slice(0, 10),
        dayLabel: `${date.getMonth() + 1}/${date.getDate()} 周${WEEKDAY_LABELS[d]}`,
      });
    }
    if (items.length > 0) {
      const label = w === 0 ? "本周" : w === 1 ? "下周" : `第 ${w + 1} 周`;
      out.push({ label, items });
    }
  }
  return out;
}