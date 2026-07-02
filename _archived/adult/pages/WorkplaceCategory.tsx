import { Link, useParams, Navigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { WORK_CATEGORIES, WORK_DIALOGUES } from "@/data/workplace";
import { T, useT } from "@/i18n/T";

const WorkplaceCategory = () => {
  const t = useT();
  const { catKey } = useParams<{ catKey: string }>();
  const cat = WORK_CATEGORIES.find((c) => c.key === catKey);
  if (!cat) return <Navigate to="/workplace" replace />;
  const list = WORK_DIALOGUES.filter((d) => d.cat === catKey);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader
        title={`${cat.emoji} ${cat.name}`}
        subtitle={`${cat.nameEn} · ${list.length} ${t("组对话")}`}
        back="/workplace"
      />
      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          <T>内容更新中，敬请期待 ✨</T>
        </div>
      ) : (
        <section className="grid gap-3 sm:grid-cols-2">
          {list.map((d) => (
            <Link
              key={d.id}
              to={`/workplace/${cat.key}/${d.id}`}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-xl">
                {d.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-bold">{d.title}</div>
                <div className="truncate text-xs text-muted-foreground">
                  <T>{d.titleCn}</T> · {d.lines.length} {t("句")}
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </section>
      )}
    </main>
  );
};

export default WorkplaceCategory;
