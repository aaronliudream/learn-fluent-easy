import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, Lock, Play, RotateCw, Sparkles, Trophy } from "lucide-react";
import BackLink from "@/components/BackLink";
import { GuestBanner } from "@/components/GuestBanner";
import {
  SIGHT_WORD_GROUPS,
  SIGHT_WORD_ITEMS,
  type SightWordItem,
} from "@/data/primarySightWords";
import {
  SIGHT_WORD_GROUPS_G2,
  SIGHT_WORD_ITEMS_G2,
} from "@/data/primarySightWordsG2";
import {
  getSightWordMasteryMap,
  isSightWordDue,
  type SightWordMasteryMap,
} from "@/lib/sightWordMastery";
import { getCurrentGrade, getSightWordsPolicy } from "@/lib/sightWordsGradeGate";

/**
 * Sight Words 主页 — 100 词 / 4 组(Fry's),与 Phonics 主页同构.
 *  • 学新词 / 复习 / 整组挑战
 *  • 4 组路线图 + 解锁机制(前一组所有词 mastery_level >= 2)
 */
export default function PrimarySightWords() {
  const nav = useNavigate();
  const [search] = useSearchParams();
  const gradeParam = search.get("grade");
  // 显式 ?grade=1 强制 G1;?grade=2 强制 G2;否则按当前年级自动选择
  const currentGrade = getCurrentGrade();
  const isG2 =
    gradeParam === "2" || (gradeParam !== "1" && currentGrade >= 2);
  const [mastery, setMastery] = useState<SightWordMasteryMap>(new Map());
  const [loading, setLoading] = useState(true);
  const grade = isG2 ? 2 : 1;
  const gradeQ = isG2 ? "?grade=2" : "";
  const gradeHome = isG2 ? "/primary/adventure/2" : "/primary";
  const modulePath = (path: string) => `${path}${gradeQ}`;
  const policy = getSightWordsPolicy(grade);
  const GROUPS = isG2 ? SIGHT_WORD_GROUPS_G2 : SIGHT_WORD_GROUPS;
  const ITEMS = isG2 ? SIGHT_WORD_ITEMS_G2 : SIGHT_WORD_ITEMS;
  const learnPath = (id: string) => modulePath(`/primary/sight-words/learn/${id}`);
  const quizPath = (id: string) => modulePath(`/primary/sight-words/quiz/${id}`);

  const groupedItems = useMemo(() => {
    const byGroup = new Map<string, SightWordItem[]>();
    ITEMS.forEach((it) => {
      if (!byGroup.has(it.groupId)) byGroup.set(it.groupId, []);
      byGroup.get(it.groupId)!.push(it);
    });
    byGroup.forEach((arr) => arr.sort((a, b) => a.sortOrder - b.sortOrder));
    const visible = isG2 ? GROUPS.length : policy.visibleGroupCount;
    return [...GROUPS]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .slice(0, visible)
      .map((g) => ({ group: g, items: byGroup.get(g.id) ?? [] }));
  }, [policy.visibleGroupCount, isG2]);

  // 年级范围内的全部词(用于进度统计 / 复习池)
  const visibleItems = useMemo(
    () => groupedItems.flatMap((g) => g.items),
    [groupedItems]
  );

  useEffect(() => {
    document.title = isG2
      ? "G2 常见小词冒险 (Fry's 101-200) | FluentPath"
      : "Spark 的常见小词冒险 | FluentPath";
    let cancelled = false;
    const refresh = async () => {
      const m = await getSightWordMasteryMap();
      if (!cancelled) {
        setMastery(m);
        setLoading(false);
      }
    };
    refresh();
    const onVis = () => { if (document.visibilityState === "visible") refresh(); };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [isG2]);

  const isGroupUnlocked = (idx: number) => {
    if (idx === 0) return true;
    const prev = groupedItems[idx - 1]?.items ?? [];
    if (prev.length === 0) return true;
    return prev.every((it) => (mastery.get(it.id)?.mastery_level ?? 0) >= 2);
  };

  const currentGroupIdx = useMemo(() => {
    for (let i = 0; i < groupedItems.length; i++) {
      if (!isGroupUnlocked(i)) return Math.max(0, i - 1);
      const allDone = groupedItems[i].items.every(
        (it) => (mastery.get(it.id)?.mastery_level ?? 0) >= 2
      );
      if (!allDone) return i;
    }
    return groupedItems.length - 1;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupedItems, mastery]);

  const currentGroup = groupedItems[currentGroupIdx];
  const nextNew = currentGroup?.items.find(
    (it) => (mastery.get(it.id)?.mastery_level ?? 0) === 0
  );
  const dueItems = visibleItems.filter((w) => isSightWordDue(mastery.get(w.id))).slice(0, 50);
  const masteredCount = visibleItems.filter(
    (w) => (mastery.get(w.id)?.mastery_level ?? 0) >= 2
  ).length;
  const canChallengeGroup =
    !!currentGroup &&
    currentGroup.items.length > 0 &&
    currentGroup.items.every((it) => (mastery.get(it.id)?.mastery_level ?? 0) >= 1);
  const todayPlanCount =
    (currentGroup?.items.filter(
      (it) => (mastery.get(it.id)?.mastery_level ?? 0) < 3
    ).length ?? 0) + dueItems.length;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-6 pb-24 md:px-6">
      <GuestBanner />
      <BackLink
        to={gradeHome}
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> {isG2 ? "返回二年级冒险" : "返回小学专区"}
      </BackLink>

      {/* Spark 顶卡 */}
      <section className="rounded-3xl bg-gradient-to-br from-sky-200 via-cyan-200 to-emerald-200 p-5 text-center shadow-tile dark:from-sky-950/40 dark:via-cyan-950/40 dark:to-emerald-950/40">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-white/70 text-5xl shadow-md">🦊</div>
        {policy.reviewMode && (
          <div className="mx-auto mb-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
            🔁 复习模块 · {grade} 年级
          </div>
        )}
        <p className="mx-auto mt-3 max-w-md text-base font-extrabold leading-snug text-sky-900 dark:text-sky-100">
          {todayPlanCount === 0
            ? policy.reviewMode
              ? '"这些词你都认识啦,继续保持!"'
              : '"全部常见小词都认识啦!Spark 太骄傲啦~"'
            : policy.reviewMode
            ? `"今天 Spark 想和你复习 ${Math.min(todayPlanCount, 5)} 个常见小词!"`
            : `"今天 Spark 想和你学 ${Math.min(todayPlanCount, 5)} 个常见小词!"`}
        </p>
        <div className="mx-auto mt-3 flex max-w-xs items-center justify-between gap-3 text-xs font-bold text-sky-700 dark:text-sky-200">
          <span>已掌握 {masteredCount} / {visibleItems.length}</span>
          <span>当前 {currentGroup?.group.groupName}</span>
        </div>
        <div className="mx-auto mt-1.5 h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/60">
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 transition-all"
            style={{ width: `${visibleItems.length ? (masteredCount / visibleItems.length) * 100 : 0}%` }}
          />
        </div>
      </section>

      {/* CTA 区 */}
      <section className="mt-4 space-y-3">
        {policy.visibleGroupCount === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            🎓 {grade} 年级的孩子应该已经能流畅阅读这些常见小词啦,
            <br />Spark 建议把时间花在更有挑战的内容上 ✨
          </div>
        )}
        {nextNew && (
          <CtaCard
            color="from-sky-500 via-cyan-500 to-emerald-500"
            icon={<Play className="size-5 fill-white" />}
            label="继续学新词"
            title={`学新词 ${nextNew.word}`}
            sub={`你这组掌握了 ${currentGroup.items.filter((it) => (mastery.get(it.id)?.mastery_level ?? 0) >= 2).length}/${currentGroup.items.length}`}
            onClick={() => nav(learnPath(nextNew.id))}
          />
        )}
        {dueItems.length > 0 && (
          <CtaCard
            color="from-rose-500 via-pink-500 to-amber-500"
            icon={<RotateCw className="size-5" />}
            label="今日复习"
            title={`复习 ${dueItems.length} 个学过的词`}
            sub="上次没答对的,再来一次吧!"
            onClick={() => nav(modulePath("/primary/sight-words/quiz/review"))}
          />
        )}
        {currentGroup && canChallengeGroup && (
          <CtaCard
            color="from-violet-500 via-fuchsia-500 to-pink-500"
            icon={<Sparkles className="size-5" />}
            label="挑战测试"
            title={`挑战 ${currentGroup.group.groupName}`}
            sub="✨ 全部答对,就能玩下一关啦!"
            onClick={() => nav(quizPath(currentGroup.group.id))}
          />
        )}
        {!nextNew && dueItems.length === 0 && !canChallengeGroup && !loading && (
          <div className="rounded-2xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            🎉 你已经掌握了全部 {visibleItems.length} 个常见小词!
          </div>
        )}
        {loading && (
          <div className="rounded-2xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Spark 正在准备今天的常见小词冒险…
          </div>
        )}
      </section>

      {/* 4 组进度地图 */}
      <section className="mt-6 space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          📊 你的常见小词地图
        </div>
        {groupedItems.map((g, idx) => {
          const unlocked = isGroupUnlocked(idx);
          const masteredInGroup = g.items.filter(
            (it) => (mastery.get(it.id)?.mastery_level ?? 0) >= 2
          ).length;
          const allDone = masteredInGroup === g.items.length;
          const isCurrent = idx === currentGroupIdx && !allDone && unlocked;
          return (
            <div
              key={g.group.id}
              className={
                "rounded-2xl border-2 p-3 transition " +
                (allDone
                  ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30"
                  : isCurrent
                  ? "border-sky-300 bg-card shadow-sm"
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
                    <span className="truncate">{g.group.groupName}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {g.group.rangeLabel} · {g.group.groupNameEn}
                  </div>
                </div>
                <div className="text-xs font-mono font-bold text-muted-foreground">
                  {masteredInGroup}/{g.items.length}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {g.items.map((it) => {
                  const lvl = mastery.get(it.id)?.mastery_level ?? 0;
                  return (
                    <button
                      key={it.id}
                      disabled={!unlocked}
                      onClick={() => nav(learnPath(it.id))}
                      title={`${it.word} · 掌握 ${lvl}/3`}
                      className={
                        "inline-flex h-6 items-center rounded-md px-1.5 text-[11px] font-extrabold transition " +
                        (lvl >= 3
                          ? "bg-amber-400 text-white shadow"
                          : lvl === 2
                          ? "bg-emerald-400 text-white"
                          : lvl === 1
                          ? "bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200"
                          : "bg-muted text-muted-foreground") +
                        (unlocked ? " hover:scale-110" : " cursor-not-allowed")
                      }
                    >
                      {it.word}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      <div className="mt-6 flex justify-center">
        <Link
          to={modulePath("/primary/phonics")}
          className="text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          ← 回到拼读冒险
        </Link>
      </div>

      {/* G1 → G2 解锁入口:G1 全部 100 词 mastery_level >= 2 时显示 */}
      {!isG2 && (() => {
        const allG1 = SIGHT_WORD_ITEMS;
        const masteredAll = allG1.length > 0 && allG1.every(
          (w) => (mastery.get(w.id)?.mastery_level ?? 0) >= 2
        );
        if (!masteredAll) return null;
        return (
          <section className="mt-6 rounded-3xl border-2 border-violet-300 bg-gradient-to-br from-violet-100 via-fuchsia-100 to-pink-100 p-5 text-center shadow-tile dark:border-violet-700 dark:from-violet-950/40 dark:via-fuchsia-950/40 dark:to-pink-950/40">
            <div className="text-2xl">🎉</div>
            <p className="mt-1 text-base font-extrabold text-violet-900 dark:text-violet-100">
              G1 高频词全部掌握!
            </p>
            <p className="mt-1 text-xs text-violet-700 dark:text-violet-300">
              Spark 解锁了二年级 100 个新词,继续冒险吧~
            </p>
            <Link
              to="/primary/sight-words?grade=2"
              className="mt-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-5 py-2 text-sm font-extrabold text-white shadow-tile transition hover:-translate-y-0.5"
            >
              去解锁 G2 高频词 →
            </Link>
          </section>
        );
      })()}

      {isG2 && (
        <div className="mt-4 text-center">
          <Link to="/primary/sight-words" className="text-xs text-muted-foreground underline-offset-2 hover:underline">
            ← 回到 G1 高频词
          </Link>
        </div>
      )}
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
