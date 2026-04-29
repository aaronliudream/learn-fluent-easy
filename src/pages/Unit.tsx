import { Link, useParams } from "react-router-dom";
import { useEffect } from "react";
import { CheckCircle2, Lock, PlayCircle, Trophy } from "lucide-react";
import { findUnit } from "@/data/course";
import { PageHeader } from "@/components/PageHeader";
import { useGuestNudge } from "@/hooks/useGuestNudge";
import { loadProgress, touchActive } from "@/lib/guestProgress";
import { isMastered } from "@/lib/mastery";

const Unit = () => {
  const { levelId, unitId } = useParams();
  const unit = findUnit(Number(levelId), Number(unitId));
  const nudge = useGuestNudge();

  useEffect(() => {
    touchActive();
    // Triggered when a guest opens the 2nd or later unit — a sign of real engagement.
    if (Number(unitId) >= 2) {
      const p = loadProgress();
      const done = p.completedLessons.length;
      const desc = done > 0
        ? `你已完成 ${done} 节课${p.studyMinutes > 0 ? `、学习 ${p.studyMinutes} 分钟` : ""}。登录后这些进度永久保留，3 秒同步到手机。`
        : "登录后学习进度永久保留，可以在手机、电脑间无缝同步。";
      nudge("browse-deeper", "看来你很喜欢学习 ✨", desc);
    }
  }, [unitId, nudge]);

  if (!unit) return <div className="p-10">单元不存在</div>;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader title="课程列表" subtitle="完成每个课程来提升你的英语水平" back={`/level/${levelId}`} />

      <section className="space-y-3">
        {unit.lessons.map((l) => {
          const locked = l.status === "locked";
          const done = l.status === "done";
          const mastered = isMastered(Number(levelId), Number(unitId), l.id);
          const Icon = mastered ? Trophy : done ? CheckCircle2 : locked ? Lock : PlayCircle;
          const iconWrap = mastered
            ? "bg-emerald-500/15 text-emerald-500"
            : done
              ? "bg-success/15 text-success"
              : locked
                ? "bg-secondary text-muted-foreground"
                : "bg-primary/15 text-primary";

          const Tag = locked ? "div" : Link;
          return (
            <Tag
              key={l.id}
              to={locked ? "" : `/level/${levelId}/unit/${unitId}/lesson/${l.id}`}
              className={`flex items-center gap-4 rounded-2xl bg-card p-4 shadow-card transition md:p-5 ${
                locked ? "opacity-55" : "hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-8px_hsl(250_40%_50%/0.25)]"
              }`}
            >
              <div className={`grid size-12 shrink-0 place-items-center rounded-full ${iconWrap}`}>
                <Icon className="size-6" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">课程 {l.id}</span>
                  {mastered ? (
                    <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                      🏆 已掌握
                    </span>
                  ) : done ? (
                    <span className="rounded-md bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                      已完成
                    </span>
                  ) : (
                    <span className="rounded-md border border-border px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                      未掌握
                    </span>
                  )}
                </div>
                <h3 className={`mt-0.5 truncate text-base font-bold md:text-lg ${locked ? "text-muted-foreground" : "text-foreground"}`}>
                  {l.title}
                </h3>
                <div className="mt-0.5 text-xs text-muted-foreground">{l.duration}</div>
              </div>
            </Tag>
          );
        })}
      </section>
    </main>
  );
};

export default Unit;