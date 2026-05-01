import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Lock, GraduationCap } from "lucide-react";
import { LEVELS } from "@/data/course";
import { useT } from "@/i18n/T";

const Levels = () => {
  const t = useT();
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 md:px-8 md:py-14">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex size-10 items-center justify-center rounded-full text-foreground/70 transition hover:bg-secondary hover:text-foreground"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        {LEVELS.map((lv) => {
          const allLessons = lv.units.flatMap((u) => u.lessons);
          const done = allLessons.filter((l) => l.status === "done").length;
          const pct = allLessons.length ? Math.round((done / allLessons.length) * 100) : 0;
          const locked = !!lv.locked;
          return (
            <Link
              key={lv.id}
              to={`/level/${lv.id}`}
              className={`group relative overflow-hidden rounded-2xl ${lv.gradient} p-5 text-white shadow-tile transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-15px_hsl(250_50%_30%/0.5)]`}
            >
              <span className="pointer-events-none absolute -right-12 -top-14 size-44 rounded-full bg-white/15 blur-2xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
                    <GraduationCap className="size-3.5" /> {t("级别")} {lv.id}
                    {locked && <Lock className="size-3" />}
                  </div>
                  <div className="mt-1 text-2xl font-extrabold leading-tight">{lv.name}</div>
                  <div className="mt-1 text-xs opacity-90">
                    {locked
                      ? t("内容更新中")
                      : `${lv.units.length} ${t("单元")} · ${allLessons.length} ${t("课程")}`}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  {!locked && (
                    <div className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold backdrop-blur-sm">
                      {pct}%
                    </div>
                  )}
                  <ArrowRight className="size-5 opacity-80 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
};

export default Levels;