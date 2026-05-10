import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Eye, Lock, Play, RotateCw, Trophy, Volume2, X } from "lucide-react";
import BackLink from "@/components/BackLink";
import { GuestBanner } from "@/components/GuestBanner";
import { speakKid } from "@/lib/speak";
import {
  SIGHT_WORDS,
  SIGHT_WORD_LEVELS,
  type SightWord,
} from "@/data/sightWords";
import {
  bumpSightWordLevel,
  bumpSightWordMastery,
  getSightWordMasteryMap,
  isSightWordDue,
  type SightWordMasteryMap,
} from "@/lib/sightWordMastery";
import { celebratePet } from "@/components/pet/EvolutionCelebration";

/**
 * Sight Words 主页 — 仪表盘 + 学新词 / 复习 / 整级挑战.
 * 学习与挑战逻辑与 PrimaryPhonicsQuiz 同构,但更简单(只有 2 种题型: 听音选词 / 看词读音).
 */
export default function PrimarySightWords() {
  const nav = useNavigate();
  const [mastery, setMastery] = useState<SightWordMasteryMap>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Sight Words 高频词 | FluentPath";
    (async () => {
      setMastery(await getSightWordMasteryMap());
      setLoading(false);
    })();
  }, []);

  const grouped = useMemo(() => {
    return SIGHT_WORD_LEVELS.map((lv) => ({
      lv,
      items: SIGHT_WORDS.filter((w) => w.level === lv.id),
    }));
  }, []);

  // 当前级 = 第一个未全掌握 (level<2) 的级
  const currentLvIdx = useMemo(() => {
    for (let i = 0; i < grouped.length; i++) {
      const allDone = grouped[i].items.every(
        (it) => (mastery.get(it.id)?.mastery_level ?? 0) >= 2
      );
      if (!allDone) return i;
    }
    return grouped.length - 1;
  }, [grouped, mastery]);

  const currentLv = grouped[currentLvIdx];
  const nextNew = currentLv?.items.find(
    (it) => (mastery.get(it.id)?.mastery_level ?? 0) === 0
  );
  const dueItems = SIGHT_WORDS.filter((w) => isSightWordDue(mastery.get(w.id)));
  const masteredCount = SIGHT_WORDS.filter(
    (w) => (mastery.get(w.id)?.mastery_level ?? 0) >= 2
  ).length;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-6 pb-24 md:px-6">
      <GuestBanner />
      <BackLink
        to="/primary"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> 返回小学专区
      </BackLink>

      <section className="rounded-3xl bg-gradient-to-br from-sky-200 via-cyan-200 to-emerald-200 p-5 text-center shadow-tile dark:from-sky-950/40 dark:via-cyan-950/40 dark:to-emerald-950/40">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-white/70 text-5xl shadow-md">📖</div>
        <p className="mx-auto mt-3 max-w-md text-base font-extrabold leading-snug text-sky-900 dark:text-sky-100">
          {masteredCount === SIGHT_WORDS.length
            ? "全部高频词都认得啦!"
            : `已认得 ${masteredCount} / ${SIGHT_WORDS.length} 个高频词`}
        </p>
        <div className="mx-auto mt-3 h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/60">
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 transition-all"
            style={{ width: `${(masteredCount / SIGHT_WORDS.length) * 100}%` }}
          />
        </div>
      </section>

      <section className="mt-5 space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          📊 你的高频词地图
        </div>
        {grouped.map((g, idx) => {
          const masteredInLv = g.items.filter(
            (it) => (mastery.get(it.id)?.mastery_level ?? 0) >= 2
          ).length;
          const allDone = masteredInLv === g.items.length;
          const unlocked = idx === 0 || (grouped[idx - 1]?.items.every(
            (it) => (mastery.get(it.id)?.mastery_level ?? 0) >= 2
          ) ?? false);
          return (
            <div
              key={g.lv.id}
              className={
                "rounded-2xl border-2 p-3 transition " +
                (allDone
                  ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30"
                  : unlocked
                  ? "border-border bg-card"
                  : "border-dashed border-border bg-muted/30 opacity-60")
              }
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-sm font-extrabold">
                    {!unlocked && <Lock className="size-3.5 text-muted-foreground" />}
                    {allDone && <Trophy className="size-3.5 text-emerald-600" />}
                    <span className="truncate">{g.lv.name}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">{g.lv.sub}</div>
                </div>
                <div className="text-xs font-mono font-bold text-muted-foreground">
                  {masteredInLv}/{g.items.length}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {g.items.map((it) => {
                  const lvl = mastery.get(it.id)?.mastery_level ?? 0;
                  return (
                    <span
                      key={it.id}
                      title={`${it.word} · 掌握 ${lvl}/3`}
                      className={
                        "inline-flex h-6 items-center rounded-md px-1.5 text-[11px] font-extrabold " +
                        (lvl >= 3
                          ? "bg-amber-400 text-white shadow"
                          : lvl === 2
                          ? "bg-emerald-400 text-white"
                          : lvl === 1
                          ? "bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200"
                          : "bg-muted text-muted-foreground")
                      }
                    >
                      {it.word}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      <section className="mt-6 space-y-3">
        {nextNew && (
          <CtaCard
            color="from-sky-500 via-cyan-500 to-emerald-500"
            icon={<Play className="size-5 fill-white" />}
            label="学新词"
            title={`学 "${nextNew.word}"`}
            sub={nextNew.cn}
            onClick={() => nav(`/primary/sightwords/learn/${nextNew.id}`)}
          />
        )}
        {dueItems.length > 0 && (
          <CtaCard
            color="from-rose-500 via-pink-500 to-amber-500"
            icon={<RotateCw className="size-5" />}
            label="今日复习"
            title={`复习 ${dueItems.length} 个学过的词`}
            sub="这些词上次没答对 / 该再考一次啦"
            onClick={() => nav("/primary/sightwords/quiz/review")}
          />
        )}
        {currentLv && nextNew == null && (
          <CtaCard
            color="from-violet-500 via-fuchsia-500 to-pink-500"
            icon={<Eye className="size-5" />}
            label="挑战测试"
            title={`挑战 ${currentLv.lv.name}`}
            sub="✨ 全部通过解锁下一级"
            onClick={() => nav(`/primary/sightwords/quiz/${currentLv.lv.id}`)}
          />
        )}
        {loading && (
          <div className="rounded-2xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            正在加载…
          </div>
        )}
      </section>
    </main>
  );
}

function CtaCard(props: {
  color: string;
  icon: React.ReactNode;
  label: string;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={props.onClick}
      className={`w-full rounded-3xl bg-gradient-to-r ${props.color} p-4 text-left text-white shadow-tile transition hover:-translate-y-0.5`}
    >
      <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">
        {props.label}
      </div>
      <div className="mt-1 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-lg font-extrabold">{props.title}</div>
          <div className="text-xs opacity-90">{props.sub}</div>
        </div>
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm">
          {props.icon}
        </div>
      </div>
    </button>
  );
}