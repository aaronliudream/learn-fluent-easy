import { T } from "@/i18n/T";import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Loader2, Sparkles, Trophy } from "lucide-react";
import BackLink from "@/components/BackLink";
import { supabase } from "@/integrations/supabase/client";
import WordQuest from "@/components/WordQuest";
import {
  getMasteredSightWordsAsVocab,
  getMasteredSightWordsCount } from
"@/lib/masteredSightWords";
import type { GameVocab } from "@/lib/wordGameAdapter";

const MIN_WORDS = 6;
const MAX_STAGES = 6; // 1 词 × 6 关
const WORDS_PER_QUEST = 1;

function todayDate(): string {
  const d = new Date(Date.now() - 4 * 3600_000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export default function PrimaryWordQuest() {
  const [params] = useSearchParams();
  const grade = (Number(params.get("grade") || "1") === 2 ? 2 : 1) as 1 | 2;
  const nav = useNavigate();

  const [phase, setPhase] = useState<"loading" | "empty" | "already" | "ready">("loading");
  const [pool, setPool] = useState<GameVocab[]>([]);
  const [masteredCount, setMasteredCount] = useState(0);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    document.title = `🎮 单词奇旅 · G${grade} | FluentPath`;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id ?? null;
      setUid(userId);
      if (!userId) {
        setPhase("empty");
        return;
      }
      const cnt = await getMasteredSightWordsCount(userId, grade);
      setMasteredCount(cnt);
      if (cnt < MIN_WORDS) {
        setPhase("empty");
        return;
      }
      // 今日已玩?
      const { data: today } = await supabase.
      from("primary_word_quest_attempts").
      select("id,levels_completed,total_levels,perfect,score").
      eq("user_id", userId).
      eq("grade", grade).
      eq("date", todayDate()).
      maybeSingle();
      if (today) {
        setPhase("already");
        return;
      }
      const vocab = await getMasteredSightWordsAsVocab(userId, grade, 80);
      setPool(vocab);
      setPhase("ready");
    })();
  }, [grade]);

  const back = `/primary/adventure/${grade}`;

  if (phase === "loading") {
    return (
      <main className="grid min-h-screen place-items-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>);

  }

  if (phase === "empty") {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-6">
        <BackLink to={back} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> <T>返回今天的冒险</T>
        </BackLink>
        <div className="rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-6 text-center shadow-tile dark:border-amber-700 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-rose-950/30">
          <div className="text-5xl">🎮</div>
          <h1 className="mt-3 text-xl font-extrabold"><T>单词奇旅准备中</T></h1>
          <p className="mt-2 text-sm text-muted-foreground">
            <T>你需要先掌握至少</T> <b>{MIN_WORDS}</b> <T>个单词,才能进入游戏。</T>
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-rose-700 shadow-sm dark:bg-rose-950/30 dark:text-rose-200">
            <T>🌟 当前已掌握:</T>{masteredCount} <T>个</T>
          </div>
          <div className="mt-5">
            <Link
              to={`/primary/sight-words${grade === 2 ? "?grade=2" : ""}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 px-5 py-3 text-sm font-extrabold text-white shadow-tile transition hover:-translate-y-0.5">
              
              <BookOpen className="size-4" /> <T>去学单词 →</T>
            </Link>
          </div>
        </div>
      </main>);

  }

  if (phase === "already") {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-6">
        <BackLink to={back} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> <T>返回今天的冒险</T>
        </BackLink>
        <div className="rounded-3xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 text-center shadow-tile dark:border-emerald-700 dark:from-emerald-950/30 dark:to-teal-950/30">
          <div className="text-5xl">🏁</div>
          <h1 className="mt-3 text-xl font-extrabold"><T>今天的奇旅已完成!</T></h1>
          <p className="mt-2 text-sm text-muted-foreground"><T>明天再来挑战新单词吧 🌙</T></p>
          <Link
            to={back}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-extrabold text-white shadow-tile transition hover:-translate-y-0.5">
            
            <Sparkles className="size-4" /> <T>回去做今天的冒险</T>
          </Link>
        </div>
      </main>);

  }

  // ready
  return (
    <WordQuest
      pool={pool}
      onExit={() => nav(back)}
      variant="primary"
      maxStages={MAX_STAGES}
      wordsPerQuest={WORDS_PER_QUEST}
      onComplete={async (info) => {
        if (!uid) return;
        await supabase.from("primary_word_quest_attempts").upsert(
          {
            user_id: uid,
            grade,
            date: todayDate(),
            levels_completed: info.passed,
            total_levels: info.total,
            perfect: info.perfect,
            duration_seconds: Math.round(info.durationMs / 1000),
            score: info.score,
            words: info.words
          },
          { onConflict: "user_id,grade,date" }
        );
      }} />);


}