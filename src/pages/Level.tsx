import { Link, useParams } from "react-router-dom";
import { Award, BookOpen, Briefcase, Check, Cloud, Flame, Lock, Map, ShoppingBag, Star, TrendingUp } from "lucide-react";
import { LEVELS } from "@/data/course";
import { PageHeader } from "@/components/PageHeader";
import { T, useT } from "@/i18n/T";
import { useUnlockLimit } from "@/hooks/useAuthUser";

const ICONS = { star: Star, book: BookOpen, map: Map, shop: ShoppingBag, cloud: Cloud, briefcase: Briefcase } as const;

const Level = () => {
  const t = useT();
  const { levelId } = useParams();
  const level = LEVELS.find((l) => l.id === Number(levelId));
  const unlockLimit = useUnlockLimit();
  if (!level) return <div className="p-10">{t("级别不存在")}</div>;

  if (level.locked) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-14">
        <PageHeader title={level.name} subtitle={t("内容更新中")} back="/" />
        <section className={`relative overflow-hidden rounded-3xl ${level.gradient} p-10 text-center text-white shadow-tile`}>
          <span className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-white/15 blur-2xl" />
          <div className="relative mx-auto grid size-16 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Lock className="size-8" />
          </div>
          <h2 className="relative mt-5 text-2xl font-extrabold">{level.name} · <T>内容更新中</T></h2>
          <p className="relative mx-auto mt-2 max-w-md text-sm opacity-90">
            <T>我们正在精心打磨这个级别的课程内容，敬请期待。先去其他已开放的级别继续学习吧 ✨</T>
          </p>
          <Link
            to="/"
            className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-white/25 px-5 py-2.5 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/35"
          >
            ← <T>返回首页</T>
          </Link>
        </section>
      </main>
    );
  }

  const allLessons = level.units.flatMap((u) => u.lessons);
  const done = allLessons.filter((l) => l.status === "done").length;
  const pct = allLessons.length ? Math.round((done / allLessons.length) * 100) : 0;

  // Build a set of lesson keys that are unlocked under the current trial limit.
  // The first `unlockLimit` lessons (in unit + lesson order) of the level are open;
  // everything beyond is locked until the learner unlocks the full course.
  const unlockedKeys = new Set<string>();
  let count = 0;
  for (const u of level.units) {
    for (const l of u.lessons) {
      if (count < unlockLimit) unlockedKeys.add(`${u.id}-${l.id}`);
      count++;
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader title={level.name} subtitle={t("选择一个单元开始学习")} back="/" />

      {/* Hero stat card */}
      <section className="relative mb-8 overflow-hidden rounded-3xl bg-grad-hero p-7 text-white shadow-tile md:p-9">
        <span className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-start justify-between gap-6">
          <div>
            <div className="text-2xl font-extrabold tracking-wider md:text-3xl">{level.name}</div>
            <p className="mt-2 text-sm opacity-90"><T>继续你的学习之旅</T></p>
          </div>
          {/* progress ring */}
          <div
            className="relative grid size-24 place-items-center rounded-full"
            style={{
              background: `conic-gradient(white ${pct}%, rgba(255,255,255,0.25) ${pct}%)`,
            }}
          >
            <div className="absolute inset-1.5 grid place-items-center rounded-full bg-grad-hero">
              <div className="text-center leading-none">
                <div className="text-xl font-extrabold">{pct}%</div>
                <div className="mt-1 text-[10px] opacity-80"><T>已完成</T></div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-7 grid grid-cols-3 gap-3 md:gap-4">
          {[
            { icon: Flame, value: 7, label: t("连续天数"), color: "text-orange-200" },
            { icon: Award, value: done, label: t("已完成"), color: "text-amber-200" },
            { icon: TrendingUp, value: "8.5", label: t("小时学习"), color: "text-emerald-200" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center rounded-2xl bg-white/15 py-4 backdrop-blur-sm"
            >
              <s.icon className={`size-5 ${s.color}`} />
              <div className="mt-1.5 text-2xl font-extrabold">{s.value}</div>
              <div className="text-xs opacity-85">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Units */}
      <section className="space-y-4">
        {level.units.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            <T>该级别正在准备中…</T>
          </div>
        )}
        {level.units.map((u) => {
          const doneU = u.lessons.filter((l) => l.status === "done").length;
          const pctU = Math.round((doneU / u.lessons.length) * 100);
          const Icon = ICONS[u.icon as keyof typeof ICONS] ?? BookOpen;
          return (
            <div
              key={u.id}
              className="rounded-2xl bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-8px_hsl(250_40%_50%/0.25)] md:p-6"
            >
              <Link
                to={`/level/${level.id}/unit/${u.id}`}
                className="flex items-start justify-between gap-4"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className={`grid size-12 shrink-0 place-items-center rounded-2xl ${u.iconBg} text-white shadow-md`}>
                    <Icon className="size-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-muted-foreground">Unit {u.id}</div>
                    <h3 className="truncate text-lg font-bold text-foreground md:text-xl"><T>{u.title}</T></h3>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-extrabold ${pctU === 100 ? "text-success" : "text-primary"}`}>
                    {pctU}%
                  </div>
                  <div className="text-xs text-muted-foreground"><T>已完成</T></div>
                </div>
              </Link>

              <Link to={`/level/${level.id}/unit/${u.id}`} className="mt-3 block text-sm text-muted-foreground"><T>{u.desc}</T></Link>

              <div className="mt-4 flex items-center gap-0">
                {u.lessons.map((l, idx) => {
                  const lessonUnlocked = unlockedKeys.has(`${u.id}-${l.id}`);
                  const effectiveStatus = lessonUnlocked && l.status === "locked" ? "current" : l.status;
                  const cls =
                    l.status === "done"
                      ? "bg-success text-success-foreground"
                      : effectiveStatus === "current"
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-card scale-110"
                        : "bg-secondary text-muted-foreground";
                  const prev = idx > 0 ? u.lessons[idx - 1] : null;
                  const connectorDone = prev && prev.status === "done";
                  const locked = !lessonUnlocked && l.status === "locked";
                  return (
                    <div key={l.id} className="flex items-center">
                      {idx > 0 && (
                        <span
                          aria-hidden
                          className={`mx-1 block h-0.5 w-4 rounded-full transition-colors ${connectorDone ? "bg-success" : "bg-border"}`}
                        />
                      )}
                      <Link
                        to={locked ? "" : `/level/${level.id}/unit/${u.id}/lesson/${l.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (locked) e.preventDefault();
                        }}
                        className={`grid size-8 place-items-center rounded-lg text-xs font-bold transition ${locked ? "cursor-not-allowed opacity-60" : "hover:scale-110"} ${cls}`}
                        aria-label={t(`课程 ${l.id}${l.status === "done" ? "（已完成）" : l.status === "current" ? "（进行中）" : ""}`)}
                      >
                        {l.status === "done" ? <Check className="size-4" strokeWidth={3} /> : locked ? <Lock className="size-3.5" /> : l.id}
                      </Link>
                    </div>
                  );
                })}
              </div>

              <Link to={`/level/${level.id}/unit/${u.id}`} className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="grid size-4 place-items-center rounded-full border border-current">
                    <span className="block size-1 rounded-full bg-current" />
                  </span>
                  {u.hours}
                </span>
                <span className="font-semibold text-foreground/70">
                  {doneU}/{u.lessons.length} <T>课程</T>
                </span>
              </Link>
            </div>
          );
        })}
      </section>
    </main>
  );
};

export default Level;