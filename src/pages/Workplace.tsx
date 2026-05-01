import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { WORK_GROUPS, WORK_DIALOGUES } from "@/data/workplace";
import { T, useT } from "@/i18n/T";

const Workplace = () => {
  const t = useT();
  const counts = WORK_DIALOGUES.reduce<Record<string, number>>((acc, d) => {
    acc[d.cat] = (acc[d.cat] || 0) + 1;
    return acc;
  }, {});

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader
        title={t("💼 职场英语")}
        subtitle={t("真实对话 · 高频表达 · 情景对话")}
        back="/"
      />
      <div className="space-y-8">
        {WORK_GROUPS.map((g) => (
          <section key={g.key}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
              <span className="text-base">{g.emoji}</span> <T>{g.name}</T>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.cats.map((c) => {
                const n = counts[c.key] || 0;
                return (
                  <Link
                    key={c.key}
                    to={`/workplace/${c.key}`}
                    className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-tile"
                  >
                    <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary text-2xl">
                      {c.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-base font-bold"><T>{c.name}</T></div>
                      <div className="truncate text-xs text-muted-foreground">{c.nameEn}</div>
                      <div className="mt-1 truncate text-[11px] text-muted-foreground">
                        <T>{c.desc}</T> {n > 0 ? <>· {n} <T>组对话</T></> : <>· <T>即将上线</T></>}
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
};

export default Workplace;
