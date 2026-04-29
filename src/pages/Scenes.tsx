import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SCENE_CATEGORIES, SCENE_DIALOGUES } from "@/data/scenes";

const Scenes = () => {
  const counts = SCENE_DIALOGUES.reduce<Record<string, number>>((acc, d) => {
    acc[d.cat] = (acc[d.cat] || 0) + 1;
    return acc;
  }, {});

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader
        title="🎬 场景对话"
        subtitle="14 个生活场景 · 95 组实战对话 · 1900 句地道表达"
        back="/"
      />
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SCENE_CATEGORIES.map((c) => {
          const n = counts[c.key] || 0;
          return (
            <Link
              key={c.key}
              to={`/scenes/${c.key}`}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-tile"
            >
              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary text-2xl">
                {c.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-base font-bold">{c.name}</div>
                <div className="truncate text-xs text-muted-foreground">{c.nameEn}</div>
                <div className="mt-1 truncate text-[11px] text-muted-foreground">
                  {c.desc} · {n} 组对话
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          );
        })}
      </section>
    </main>
  );
};

export default Scenes;