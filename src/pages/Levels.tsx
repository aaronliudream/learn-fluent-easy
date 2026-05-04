import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { LEVELS } from "@/data/course";
import { PageHeader } from "@/components/PageHeader";
import { useT } from "@/i18n/T";

const Levels = () => {
  const t = useT();
  const groups = [
    {
      key: "beginner",
      title: t("入门"),
      chip: "BEGINNER",
      tagline: t("打好基础"),
      persona: t("基础使用者"),
      subtitle: "A1 – A2",
      desc: t("适合零基础或刚起步的学习者：掌握 1500+ 高频词、基本语法与日常对话，能听懂、读懂并写出简单句子。"),
      chipBg: "bg-sky-100 text-sky-700",
      cardBg: "bg-sky-50/70",
      ids: [1, 2],
    },
    {
      key: "intermediate",
      title: t("进阶"),
      chip: "INTERMEDIATE",
      tagline: t("自如表达"),
      persona: t("独立使用者"),
      subtitle: "B1 – B2",
      desc: t("适合有一定基础、想流利表达的学习者：扩展到 4000+ 词汇，能就熟悉话题自如交流、读懂文章并写出连贯段落。"),
      chipBg: "bg-emerald-100 text-emerald-700",
      cardBg: "bg-emerald-50/70",
      ids: [3, 4],
    },
    {
      key: "advanced",
      title: t("高阶"),
      chip: "ADVANCED",
      tagline: t("精通流利表达"),
      persona: t("精通使用者"),
      subtitle: "C1 – C2",
      desc: t("适合冲刺学术、职场与考试的学习者：精通 8000+ 词汇与复杂语法，能就专业话题深入讨论、写作和演讲，接近母语水平。"),
      chipBg: "bg-violet-100 text-violet-700",
      cardBg: "bg-violet-50/70",
      ids: [5, 6],
    },
  ];
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader
        title={t("选择级别")}
        subtitle={t("从 A1 到 C2，自由选择你想学的级别")}
        back="/"
      />

      <div className="space-y-5">
        {groups.map((g) => {
          const items = g.ids
            .map((id) => LEVELS.find((l) => l.id === id))
            .filter(Boolean) as typeof LEVELS;
          if (items.length === 0) return null;
          return (
            <section
              key={g.key}
              className={`rounded-2xl ${g.cardBg} p-4 shadow-sm md:p-5`}
            >
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.18em] ${g.chipBg}`}>
                    {g.chip}
                  </span>
                  <h2 className="mt-2 text-lg font-extrabold leading-tight tracking-tight text-foreground md:text-xl">
                    {g.tagline}
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">
                    {g.subtitle} — {g.persona}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {items.map((lv) => {
                    const locked = !!lv.locked;
                    return (
                      <Link
                        key={lv.id}
                        to={`/level/${lv.id}`}
                        aria-label={`${t("级别")} ${lv.id}`}
                        className={`relative grid size-11 place-items-center rounded-full ${lv.gradient} text-base font-extrabold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg md:size-12`}
                      >
                        {lv.id}
                        {locked && (
                          <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-white text-foreground shadow">
                            <Lock className="size-2.5" />
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground md:text-sm">
                {g.desc}
              </p>
            </section>
          );
        })}
      </div>
    </main>
  );
};

export default Levels;