import { T } from "@/i18n/T";import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Lock, Play, RotateCw, Sparkles, Trophy } from "lucide-react";
import BackLink from "@/components/BackLink";
import { GuestBanner } from "@/components/GuestBanner";
import {
  PHONICS_GROUPS,
  PHONICS_ITEMS,
  type PhonicsItem } from
"@/data/primaryPhonics";
import { PHONICS_GROUPS_G2, PHONICS_ITEMS_G2 } from "@/data/primaryPhonicsG2";
import {
  getPhonicsMasteryMap,
  isDue,
  isGroupUnlocked,
  type PhonicsMasteryMap } from
"@/lib/phonicsMastery";
import { getCurrentGrade, getSightWordsPolicy, shouldShowSightWordsEntry } from "@/lib/sightWordsGradeGate";

/**
 * 拼读冒险仪表盘 — 替代直接进 /primary/letters。
 * 三个职责:
 *  1) 让孩子知道自己在 7 组里的哪一组(进度可视化)
 *  2) 今天该做什么(学新音 / 复习 / 整组挑战)
 *  3) 每个音的掌握状态可视化
 */
export default function PrimaryPhonics() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const gradeParam = Number(sp.get("grade") || "1");
  const isG2 = gradeParam === 2;
  const gradeQ = isG2 ? "?grade=2" : "";
  const gradeHome = isG2 ? "/primary/adventure/2" : "/primary";
  const modulePath = (path: string) => `${path}${gradeQ}`;
  const GROUPS = isG2 ? PHONICS_GROUPS_G2 : PHONICS_GROUPS;
  const ITEMS = isG2 ? PHONICS_ITEMS_G2 : PHONICS_ITEMS;
  const [mastery, setMastery] = useState<PhonicsMasteryMap>(new Map());
  const [loading, setLoading] = useState(true);
  const grade = getCurrentGrade();
  const swPolicy = getSightWordsPolicy(grade);
  const showSwEntry = shouldShowSightWordsEntry(grade);

  // 按组分桶,顺序按 PHONICS_GROUPS.sortOrder
  const groupedItems = useMemo(() => {
    const byGroup = new Map<string, PhonicsItem[]>();
    ITEMS.forEach((it) => {
      if (!byGroup.has(it.groupId)) byGroup.set(it.groupId, []);
      byGroup.get(it.groupId)!.push(it);
    });
    // 同组内按 sortOrder 排序,保证"下一个新音"稳定
    byGroup.forEach((arr) => arr.sort((a, b) => a.sortOrder - b.sortOrder));
    return [...GROUPS].sort((a, b) => a.sortOrder - b.sortOrder).map((g) => ({
      group: g,
      items: byGroup.get(g.id) ?? []
    }));
  }, [ITEMS, GROUPS]);

  useEffect(() => {
    document.title = "Spark 的拼读冒险 | FluentPath";
    let cancelled = false;
    const refresh = async () => {
      const m = await getPhonicsMasteryMap();
      if (!cancelled) {
        setMastery(m);
        setLoading(false);
      }
    };
    refresh();
    // 答完题回到本页时(tab 重新可见 / 窗口聚焦)重拉一次,保证进度实时
    const onVis = () => {if (document.visibilityState === "visible") refresh();};
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // 当前应该聚焦的组 = 第一个还没全部掌握的已解锁组
  const itemsByIndex = groupedItems.map((g) => g.items);
  const currentGroupIdx = useMemo(() => {
    for (let i = 0; i < groupedItems.length; i++) {
      if (!isGroupUnlocked(i, itemsByIndex, mastery)) return Math.max(0, i - 1);
      const allDone = groupedItems[i].items.every(
        (it) => (mastery.get(it.id)?.mastery_level ?? 0) >= 2
      );
      if (!allDone) return i;
    }
    return groupedItems.length - 1;
  }, [groupedItems, itemsByIndex, mastery]);

  const currentGroup = groupedItems[currentGroupIdx];

  // 下一个要学的新音(level=0)
  const nextNewItem = useMemo(
    () => currentGroup?.items.find((it) => (mastery.get(it.id)?.mastery_level ?? 0) === 0),
    [currentGroup, mastery]
  );

  // 到期复习的音
  const dueItems = useMemo(
    () =>
    ITEMS.filter((it) => isDue(mastery.get(it.id))).slice(0, 50),
    [mastery, ITEMS]
  );

  // 整组挑战是否可用(本组每个音至少 level=1)
  const canChallengeGroup = useMemo(
    () =>
    currentGroup &&
    currentGroup.items.length > 0 &&
    currentGroup.items.every((it) => (mastery.get(it.id)?.mastery_level ?? 0) >= 1),
    [currentGroup, mastery]
  );

  // 总掌握数(level≥2)
  const masteredCount = ITEMS.filter(
    (it) => (mastery.get(it.id)?.mastery_level ?? 0) >= 2
  ).length;

  // G1 全部通关 → 显示 G2 入口(仅在 G1 主页上)
  const allG1Mastered = !isG2 && PHONICS_ITEMS.every(
    (it) => (mastery.get(it.id)?.mastery_level ?? 0) >= 2
  );
  const learnPath = (id: string) => modulePath(`/primary/phonics/learn/${id}`);
  const todayPlanCount =
  (currentGroup?.items.filter(
    (it) => (mastery.get(it.id)?.mastery_level ?? 0) < 3
  ).length ?? 0) + dueItems.length;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-6 pb-24 md:px-6">
      <GuestBanner />
      <BackLink
        to={gradeHome}
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        
        <ArrowLeft className="size-4" /> <T>{isG2 ? "返回二年级冒险" : "返回小学专区"}</T>
      </BackLink>

      {/* Spark 顶卡 */}
      <section className="rounded-3xl bg-gradient-to-br from-rose-200 via-amber-200 to-orange-200 p-5 text-center shadow-tile dark:from-rose-950/40 dark:via-amber-950/40 dark:to-orange-950/40">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-white/70 text-5xl shadow-md">🦊</div>
        <p className="mx-auto mt-3 max-w-md text-base font-extrabold leading-snug text-rose-900 dark:text-rose-100">
          <T>{todayPlanCount === 0
            ? '"全部都会啦!Spark 太骄傲了~"'
            : `"今天 Spark 想和你练 ${todayPlanCount} 个音!"`}</T>
        </p>
        <div className="mx-auto mt-3 flex max-w-xs items-center justify-between gap-3 text-xs font-bold text-rose-700 dark:text-rose-200">
          <span><T>已掌握</T> {masteredCount} / {ITEMS.length}{isG2 ? " · 二年级" : ""}</span>
          <span><T>当前</T> {currentGroup?.group.groupName}</span>
        </div>
        <div className="mx-auto mt-1.5 h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/60">
          <div
            className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 transition-all"
            style={{ width: `${masteredCount / Math.max(1, ITEMS.length) * 100}%` }} />
          
        </div>
      </section>

      {/* CTA 区(放在 Spark 下面,优先引导动作) */}
      <section className="mt-4 space-y-3">
        {/* 1) 学新音 */}
        {nextNewItem &&
        <CtaCard
          color="from-rose-500 via-pink-500 to-amber-500"
          icon={<Play className="size-5 fill-white" />}
          label="继续学新音"
          title={`学新音 ${nextNewItem.letter}`}
          sub={`你这组掌握了 ${currentGroup.items.filter((it) => (mastery.get(it.id)?.mastery_level ?? 0) >= 2).length}/${currentGroup.items.length}`}
          onClick={() => nav(learnPath(nextNewItem.id))} />

        }

        {/* 2) 复习 */}
        {dueItems.length > 0 &&
        <CtaCard
          color="from-sky-500 via-cyan-500 to-emerald-500"
          icon={<RotateCw className="size-5" />}
          label="今日复习"
          title={`复习 ${dueItems.length} 个学过的音`}
          sub="上次没答对的,再来一次吧!"
          onClick={() => nav(modulePath("/primary/phonics/quiz/review"))} />

        }

        {/* 3) 整组挑战 */}
        {currentGroup && canChallengeGroup &&
        <CtaCard
          color="from-violet-500 via-fuchsia-500 to-pink-500"
          icon={<Sparkles className="size-5" />}
          label="挑战测试"
          title={`挑战 ${currentGroup.group.groupName}`}
          sub="✨ 全部答对,就能玩下一关啦!"
          onClick={() => nav(modulePath(`/primary/phonics/quiz/${currentGroup.group.id}`))} />

        }

        {/* fallback */}
        {!nextNewItem && dueItems.length === 0 && !canChallengeGroup && !loading &&
        <div className="rounded-2xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            <T>🎉 你已经会了全部</T> {ITEMS.length} <T>个字母音!</T>
          </div>
        }

        {loading &&
        <div className="rounded-2xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            <T>Spark 正在准备今天的拼读冒险…</T>
          </div>
        }
      </section>

      {/* 7 组进度 */}
      <section className="mt-6 space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <T>📊 你的拼读地图</T>
        </div>
        {groupedItems.map((g, idx) => {
          const unlocked = isGroupUnlocked(idx, itemsByIndex, mastery);
          const masteredInGroup = g.items.filter(
            (it) => (mastery.get(it.id)?.mastery_level ?? 0) >= 2
          ).length;
          const allDone = masteredInGroup === g.items.length;
          const isCurrent = idx === currentGroupIdx && !allDone && unlocked;
          return (
            <div
              key={g.group.id}
              className={
              "rounded-2xl border-2 p-3 transition " + (
              allDone ?
              "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30" :
              isCurrent ?
              "border-rose-300 bg-card shadow-sm" :
              unlocked ?
              "border-border bg-card" :
              "border-dashed border-border bg-muted/30 opacity-60")
              }>
              
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-sm font-extrabold">
                    {!unlocked && <Lock className="size-3.5 text-muted-foreground" />}
                    {allDone && <Trophy className="size-3.5 text-emerald-600" />}
                    <span className="truncate">{g.group.groupName}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {g.group.groupNameEn}
                  </div>
                </div>
                <div className="text-xs font-mono font-bold text-muted-foreground">
                  {masteredInGroup}/{g.items.length}
                </div>
              </div>
              {/* 星星行 */}
              <div className="mt-2 flex flex-wrap gap-1">
                {g.items.map((it) => {
                  const lvl = mastery.get(it.id)?.mastery_level ?? 0;
                  return (
                    <button
                      key={it.id}
                      disabled={!unlocked}
                      onClick={() => nav(learnPath(it.id))}
                      title={`${it.letter} · ${it.sound} · 掌握 ${lvl}/3`}
                      className={
                      "grid size-7 place-items-center rounded-md text-[11px] font-extrabold transition " + (
                      lvl >= 3 ?
                      "bg-amber-400 text-white shadow" :
                      lvl === 2 ?
                      "bg-emerald-400 text-white" :
                      lvl === 1 ?
                      "bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200" :
                      "bg-muted text-muted-foreground") + (
                      unlocked ? " hover:scale-110" : " cursor-not-allowed")
                      }>
                      
                      {it.letter.length <= 2 ? it.letter : it.letter.replace("_", "·")}
                    </button>);

                })}
              </div>
            </div>);

        })}
      </section>

      {/* G1 → G2 解锁入口 */}
      {allG1Mastered &&
      <section className="mt-6 rounded-3xl bg-gradient-to-br from-violet-200 via-fuchsia-200 to-rose-200 p-5 text-center shadow-tile dark:from-violet-950/40 dark:via-fuchsia-950/40 dark:to-rose-950/40">
          <div className="text-sm font-extrabold text-fuchsia-900 dark:text-fuchsia-100">
            <T>🎉 G1 Phonics 全部通关!</T>
          </div>
          <Link
          to="/primary/phonics?grade=2"
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 px-6 py-3 text-sm font-extrabold text-white shadow-tile transition hover:-translate-y-0.5">
          
            <Sparkles className="size-4" /> <T>去解锁 G2 Phonics →</T>
          </Link>
        </section>
      }

      {/* 退路:A-Z 索引 */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/primary/letters"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:underline">
          
          <BookOpen className="size-3.5" /> <T>想按 A-Z 浏览所有字母?去字母索引 →</T>
        </Link>
        {showSwEntry && swPolicy.showInMain &&
        <Link
          to={modulePath("/primary/sight-words")}
          className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 underline-offset-2 hover:underline dark:text-sky-300">
            <T>📖 常见小词 Sight Words →</T>
          
        </Link>
        }
        {showSwEntry && !swPolicy.showInMain &&
        <Link
          to={modulePath("/primary/sight-words")}
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground underline-offset-2 hover:underline">
            <T>🔁 常见小词复习(查漏)→</T>
          
        </Link>
        }
        <Link
          to={modulePath("/primary/roleplays")}
          className="inline-flex items-center gap-1 text-xs font-bold text-fuchsia-600 underline-offset-2 hover:underline dark:text-fuchsia-300">
          <T>🎭 角色扮演 Roleplay →</T>
        
        </Link>
        <Link
          to={modulePath("/primary/listening")}
          className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 underline-offset-2 hover:underline dark:text-cyan-300">
          <T>🎧 听力对话 Listening →</T>
        
        </Link>
        <Link
          to={modulePath("/primary/reading")}
          className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 underline-offset-2 hover:underline dark:text-amber-300">
          <T>📚 小绘本 Reading →</T>
        
        </Link>
      </div>
    </main>);

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
      className={`w-full rounded-3xl bg-gradient-to-r ${props.color} p-4 text-left text-white shadow-tile transition hover:-translate-y-0.5`}>
      
      <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">
        <T>{props.label}</T>
      </div>
      <div className="mt-1 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-lg font-extrabold"><T>{props.title}</T></div>
          <div className="text-xs opacity-90"><T>{props.sub}</T></div>
        </div>
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm">
          {props.icon}
        </div>
      </div>
    </button>);

}