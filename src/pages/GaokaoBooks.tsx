import { T } from "@/i18n/T";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import BackLink from "@/components/BackLink";
import { GaokaoModuleCard, type GaokaoModuleIcon } from "@/components/gaokao/GaokaoModuleCard";
import { booksOfGroup, GROUP_META, SHORT_NAME, YEAR_HINT, type BookGroupKey, type BookMeta } from "@/lib/gaokaoHub/books";
import { readPublisherParam, withPublisher, PUBLISHER_META, DEFAULT_PUBLISHER } from "@/lib/gaokaoHub/publisher";
import { availableVolumes } from "@/lib/gaokaoHub/availability";

const NAVY = "#0E2746";

/** semId(gk_required1)→ volume(required1)。 */
const volumeOf = (semId: string) => semId.replace(/^gk_/, "");

function BookCard({ b, pub, available }: { b: BookMeta; pub: ReturnType<typeof readPublisherParam>; available: boolean }) {
  return (
    <GaokaoModuleCard
      icon={b.semId as GaokaoModuleIcon}
      title={SHORT_NAME[b.semId] ?? b.name}
      subtitle={b.name}
      description={available ? `${b.units} 个单元 · ${YEAR_HINT[b.semId] ?? ""}` : "整理中"}
      progress={0}
      to={withPublisher(`/gaokao/hub/${b.hubGrade}/semester/${b.semId}`, pub)}
      badge={b.semId === "gk_required1" && pub === DEFAULT_PUBLISHER ? "从这里开始" : undefined}
      disabled={!available}
    />
  );
}

export default function GaokaoBooks() {
  const { group } = useParams<{ group: string }>();
  const [sp] = useSearchParams();
  const pub = readPublisherParam(sp);
  const g: BookGroupKey = group === "elective" ? "elective" : "required";
  const meta = GROUP_META[g];
  const books = useMemo(() => booksOfGroup(g), [g]);
  const gridClass = g === "required" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 lg:grid-cols-4";

  // 可用性:人教沿用 year-JSON 学期 available;上外/外研社按"该 publisher 在 junior_vocab 是否有词"算
  // (与取词同口径,内容没灌 → 整理中)。
  const [dbAvail, setDbAvail] = useState<Set<string> | null>(null);
  useEffect(() => {
    if (pub === DEFAULT_PUBLISHER) { setDbAvail(null); return; }
    let cancelled = false;
    (async () => {
      const vols = books.map((b) => volumeOf(b.semId));
      const set = await availableVolumes("junior_vocab", vols, pub);
      if (!cancelled) setDbAvail(set);
    })();
    return () => { cancelled = true; };
  }, [pub, books]);

  const isAvailable = (b: BookMeta) =>
    pub === DEFAULT_PUBLISHER ? b.available : !!dbAvail?.has(volumeOf(b.semId));

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <BackLink to={`/gaokao?publisher=${pub}`} className="mb-4 inline-block text-sm text-muted-foreground">
          ← 返回高中专区
        </BackLink>
        <div className="mb-5">
          <h1 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "'Noto Serif SC', serif" }}>
            <T>{PUBLISHER_META[pub].name}</T> · <T>{meta.title}</T>
          </h1>
          <p className="mt-1 text-xs" style={{ color: NAVY, opacity: 0.55 }}>
            <T>{meta.hint}</T><T> · 选册进入 → 单元 → 9 关闯关</T>
          </p>
        </div>
        <div className={`grid gap-3 ${gridClass}`}>
          {books.map((b) => <BookCard key={b.semId} b={b} pub={pub} available={isAvailable(b)} />)}
        </div>
      </div>
    </main>
  );
}
