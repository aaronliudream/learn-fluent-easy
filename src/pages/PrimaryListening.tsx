import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Lock, Headphones } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import BackLink from "@/components/BackLink";
import {
  PRIMARY_LISTENING_DIALOGUES,
  getDialoguesSorted,
  type ListeningDialogue,
  type ListeningTheme,
} from "@/data/primaryListeningDialogues";
import { PRIMARY_LISTENING_DIALOGUES_G2 } from "@/data/primaryListeningDialoguesG2";
import { supabase } from "@/integrations/supabase/client";

const THEME_META: Record<ListeningTheme, { label: string; emoji: string }> = {
  greetings:        { label: "打招呼", emoji: "☀️" },
  colors:           { label: "颜色",   emoji: "👕" },
  numbers:          { label: "数字",   emoji: "🔢" },
  body:             { label: "身体",   emoji: "🧒" },
  family:           { label: "家庭",   emoji: "👨‍👩‍👧" },
  animals:          { label: "动物",   emoji: "🐶" },
  food:             { label: "食物",   emoji: "🍎" },
  school:           { label: "学校",   emoji: "🏫" },
  going_to_school:  { label: "去学校", emoji: "🚌" },
  weather:          { label: "天气",   emoji: "☁️" },
  time:             { label: "时间",   emoji: "⏰" },
  clothes:          { label: "衣服",   emoji: "👕" },
  rooms:            { label: "房间",   emoji: "🛏️" },
  hobbies:          { label: "兴趣",   emoji: "🎨" },
  sports:           { label: "运动",   emoji: "⚽" },
  jobs:             { label: "职业",   emoji: "👩‍⚕️" },
  transport:        { label: "交通",   emoji: "🚗" },
};
const THEME_ORDER: ListeningTheme[] = [
  "greetings", "colors", "numbers", "body", "family",
  "animals", "food", "school", "going_to_school",
  "weather", "time", "clothes", "rooms", "hobbies", "sports", "jobs", "transport",
];
const DIFFICULTY_LABEL = { 1: "简单", 2: "一般", 3: "有点难" } as const;

const LOCAL_KEY = "primary_listening_completion_v1";
type CompRec = { questions_correct: number; questions_total: number; play_count: number };
function loadLocal(): Record<string, CompRec> {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}"); } catch { return {}; }
}

export default function PrimaryListening() {
  const [search] = useSearchParams();
  const gradeParam = search.get("grade");
  const lastGrade = Number(typeof window !== "undefined" ? localStorage.getItem("primary:lastGrade") : "") || 1;
  const isG2 = gradeParam === "2" || (gradeParam !== "1" && lastGrade >= 2);
  const DATA = isG2 ? PRIMARY_LISTENING_DIALOGUES_G2 : PRIMARY_LISTENING_DIALOGUES;
  const gradeQ = isG2 ? "?grade=2" : "";
  const gradeHome = isG2 ? "/primary/adventure/2" : "/primary";
  const playPath = (id: string) => `/primary/listening/play/${id}${gradeQ}`;
  const [completed, setCompleted] = useState<Record<string, CompRec>>(() => loadLocal());

  useEffect(() => {
    document.title = "和 Spark 听对话 · 听力练习 | FluentPath";
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id ?? null;
      if (!userId) return;
      const { data } = await supabase
        .from("primary_listening_completion")
        .select("dialogue_id,questions_correct,questions_total,play_count")
        .eq("user_id", userId);
      if (data) {
        const map: Record<string, CompRec> = {};
        for (const r of data as any[]) {
          map[r.dialogue_id] = {
            questions_correct: r.questions_correct ?? 0,
            questions_total: r.questions_total ?? 0,
            play_count: r.play_count ?? 1,
          };
        }
        const merged = { ...loadLocal(), ...map };
        setCompleted(merged);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(merged));
      }
    })();
  }, []);

  const sorted = useMemo(
    () => [...DATA].sort((a, b) => a.sortOrder - b.sortOrder),
    [DATA]
  );
  const poolIds = useMemo(() => new Set(DATA.map(d => d.id)), [DATA]);
  const completedIds = useMemo(
    () => new Set(Object.keys(completed).filter(id => poolIds.has(id))),
    [completed, poolIds]
  );

  function isUnlocked(d: ListeningDialogue): boolean {
    const idx = sorted.findIndex(x => x.id === d.id);
    if (idx <= 0) return true;
    return completedIds.has(sorted[idx - 1].id);
  }

  const totalDone = completedIds.size;
  const total = sorted.length;
  const nextD = sorted.find(d => !completedIds.has(d.id)) ?? null;

  const grouped = useMemo(() => {
    return THEME_ORDER.map(t => ({
      t,
      meta: THEME_META[t],
      items: DATA
        .filter(d => d.theme === t)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    })).filter(g => g.items.length > 0);
  }, [DATA]);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-6 pb-24 md:px-6">
      <BackLink to={gradeHome} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {isG2 ? "返回二年级冒险" : "返回小学专区"}
      </BackLink>

      {/* Spark 顶卡 — 蓝绿渐变,与 Roleplay 紫色区分 */}
      <section className="rounded-3xl bg-gradient-to-br from-sky-200 via-cyan-200 to-emerald-200 p-5 text-center shadow-tile dark:from-sky-950/40 dark:via-cyan-950/40 dark:to-emerald-950/40">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-white/70 text-5xl shadow-md">🦊</div>
        <p className="mx-auto mt-3 max-w-md text-base font-extrabold leading-snug text-cyan-900 dark:text-cyan-100">
          "和 Spark 听 {total} 个生活里的对话,听听别人怎么说!"
        </p>
        <div className="mx-auto mt-3 flex max-w-xs items-center justify-between gap-3 text-xs font-bold text-cyan-700 dark:text-cyan-200">
          <span>已完成 {totalDone} / {total}</span>
          <span>{nextD ? `下一个 · ${DIFFICULTY_LABEL[nextD.difficulty]}级` : "全部完成 ✨"}</span>
        </div>
        <div className="mx-auto mt-1.5 h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/60">
          <div className="h-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 transition-all" style={{ width: `${(totalDone / Math.max(1, total)) * 100}%` }} />
        </div>
      </section>

      {/* 继续听 CTA */}
      {nextD && (
        <Link
            to={playPath(nextD.id)}
          className="mt-4 block rounded-3xl bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 p-4 text-left text-white shadow-tile transition hover:-translate-y-0.5"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">🎧 继续听新对话</div>
          <div className="mt-1 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-lg font-extrabold">和 Spark 听 "{nextD.title_cn}"</div>
              <div className="text-xs opacity-90">你已完成 {totalDone}/{total}</div>
            </div>
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/20 text-2xl backdrop-blur-sm">▶</div>
          </div>
        </Link>
      )}

      {/* 听力地图 */}
      <section className="mt-6 space-y-5">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">📚 你的听力地图</div>
        {grouped.map(g => (
          <div key={g.t}>
            <div className="mb-2 flex items-center gap-2 text-sm font-extrabold">
              <span className="text-lg">{g.meta.emoji}</span>
              <span>{g.meta.label}</span>
              <span className="text-xs font-bold text-muted-foreground">· {g.items.length} 个对话</span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {g.items.map(d => {
                const unlocked = isUnlocked(d);
                const done = completedIds.has(d.id);
                const rec = completed[d.id];
                const fullScore = rec && rec.questions_total > 0 && rec.questions_correct === rec.questions_total;
                const card = (
                  <div className={`group relative overflow-hidden rounded-2xl p-3 text-left text-white shadow-tile transition ${
                    unlocked ? `bg-gradient-to-br ${d.bg} hover:-translate-y-0.5` : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="text-3xl">{d.emoji}</div>
                      <div className="flex items-center gap-1">
                        {!unlocked && <Lock className="size-3.5" />}
                        {done && <span className="text-base">{fullScore ? "🌟" : "✓"}</span>}
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${unlocked ? "bg-white/25 backdrop-blur-sm" : "bg-card text-muted-foreground"}`}>
                          {DIFFICULTY_LABEL[d.difficulty]}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-base font-extrabold">{d.title_cn}</div>
                    <div className="text-[12px] font-bold opacity-90">{d.title_en}</div>
                    <div className="mt-1 line-clamp-1 text-[14px] opacity-90">📖 {d.scene_cn}</div>
                  </div>
                );
                return unlocked ? (
                  <Link key={d.id} to={playPath(d.id)}>{card}</Link>
                ) : (
                  <div key={d.id}>{card}</div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <p className="mt-8 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
        <Headphones className="size-3" /> 一个一个听,下一个就会亮起来!
      </p>

      {/* G1 → G2 解锁入口 */}
      {!isG2 && (() => {
        const allG1Done = PRIMARY_LISTENING_DIALOGUES.every(d => completedIds.has(d.id));
        if (!allG1Done) return null;
        return (
          <section className="mt-6 rounded-3xl border-2 border-violet-300 bg-gradient-to-br from-violet-100 via-fuchsia-100 to-pink-100 p-5 text-center shadow-tile dark:border-violet-700 dark:from-violet-950/40 dark:via-fuchsia-950/40 dark:to-pink-950/40">
            <div className="text-2xl">🎉</div>
            <p className="mt-1 text-base font-extrabold text-violet-900 dark:text-violet-100">
              G1 听力对话全部完成!
            </p>
            <Link
              to="/primary/listening?grade=2"
              className="mt-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-5 py-2 text-sm font-extrabold text-white shadow-tile transition hover:-translate-y-0.5"
            >
              去解锁 G2 听力对话 →
            </Link>
          </section>
        );
      })()}
      {isG2 && (
        <div className="mt-4 text-center">
          <Link to="/primary/listening?grade=1" className="text-xs text-muted-foreground underline-offset-2 hover:underline">
            ← 回到 G1 听力
          </Link>
        </div>
      )}
    </main>
  );
}
