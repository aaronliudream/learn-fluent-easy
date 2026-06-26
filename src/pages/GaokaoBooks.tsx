import { T } from "@/i18n/T";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import BackLink from "@/components/BackLink";
import { GaokaoModuleCard, type GaokaoModuleIcon } from "@/components/gaokao/GaokaoModuleCard";
import { booksOfGroup, GROUP_META, SHORT_NAME, YEAR_HINT, type BookGroupKey, type BookMeta } from "@/lib/gaokaoHub/books";

const NAVY = "#0E2746";

function BookCard({ b }: { b: BookMeta }) {
  return (
    <GaokaoModuleCard
      icon={b.semId as GaokaoModuleIcon}
      title={SHORT_NAME[b.semId] ?? b.name}
      subtitle={b.name}
      description={b.available ? `${b.units} 个单元 · ${YEAR_HINT[b.semId] ?? ""}` : "整理中"}
      progress={0}
      to={`/gaokao/hub/${b.hubGrade}/semester/${b.semId}`}
      badge={b.semId === "gk_required1" ? "从这里开始" : undefined}
    />
  );
}

export default function GaokaoBooks() {
  const { group } = useParams<{ group: string }>();
  const g: BookGroupKey = group === "elective" ? "elective" : "required";
  const meta = GROUP_META[g];
  const books = useMemo(() => booksOfGroup(g), [g]);
  const gridClass = g === "required" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 lg:grid-cols-4";

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <BackLink to="/gaokao" className="mb-4 inline-block text-sm text-muted-foreground">
          ← 返回高中专区
        </BackLink>
        <div className="mb-5">
          <h1 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "'Noto Serif SC', serif" }}>
            <T>{meta.title}</T>
          </h1>
          <p className="mt-1 text-xs" style={{ color: NAVY, opacity: 0.55 }}>
            <T>{meta.hint}</T><T> · 选册进入 → 单元 → 9 关闯关</T>
          </p>
        </div>
        <div className={`grid gap-3 ${gridClass}`}>
          {books.map((b) => <BookCard key={b.semId} b={b} />)}
        </div>
      </div>
    </main>
  );
}
