import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, RotateCw, Star } from "lucide-react";
import { T } from "@/i18n/T";
import { supabase } from "@/integrations/supabase/client";
import { loadMastery, type MasteryRow } from "@/lib/masteryProgress";
import { MasteryRing } from "@/components/grammar/MasteryRing";
import GaokaoBookPicker, { GAOKAO_BOOKS } from "@/components/gaokaoHub/GaokaoBookPicker";
import { readPublisherParam } from "@/lib/gaokaoHub/publisher";
import { availableVolumes } from "@/lib/gaokaoHub/availability";

const SENIOR_VOLUMES = GAOKAO_BOOKS.map((b) => b.volume);
const UNIT_ORDER = ["WU", "U1", "U2", "U3", "U4", "U5", "U6", "U7", "U8"];

type Row = { id: string; title: string | null; unit: string };

/**
 * 阅读/完形/听力专项板块通用骨架(7册分册)。
 * - 无 ?book → 选册(只有 table 有该 volume 的册可点)。
 * - ?book=required1 → 该册各单元真实篇目(table WHERE volume),每篇掌握度环(mastery_progress 该 module 的 best_pct/stars)。
 * - 点篇目 → /gaokao/lesson/{lessonSeg}/:id?returnTo(① 已建的镜像路由 → junior play 页,写 mastery_progress 同 item_id)。
 * ★互通★:篇目都是 junior_* 同一批 id,play 页写 mastery_progress(module 同名)→ 与课本同步对应关同表同 item_id,
 *   绝不碰 gaokao_user_mastery。见 docs/高中专区架构方案.md §②③。
 */
export default function GaokaoExerciseBoard({
  boardTitle, boardEmoji, basePath, table, module, lessonSeg,
}: {
  boardTitle: string;
  boardEmoji: string;
  basePath: string; // e.g. /gaokao/reading
  table: "junior_reading" | "junior_cloze" | "junior_listening_exercises";
  module: string;   // mastery_progress module, e.g. junior_reading
  lessonSeg: "reading" | "cloze" | "listening";
}) {
  const [sp] = useSearchParams();
  const book = sp.get("book");
  const pub = readPublisherParam(sp);
  const [available, setAvailable] = useState<Set<string>>(new Set());
  const [rows, setRows] = useState<Row[] | null>(null);
  const [mastery, setMastery] = useState<Record<string, MasteryRow>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const avail = await availableVolumes(table, SENIOR_VOLUMES, pub);
      if (cancelled) return;
      setAvailable(avail);
    })();
    return () => { cancelled = true; };
  }, [table, pub]);

  useEffect(() => {
    if (!book) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase.from(table).select("id,title,unit").eq("volume", book).eq("publisher", pub);
      if (cancelled) return;
      setRows((data ?? []) as Row[]);
      setMastery(await loadMastery(module));
      if (cancelled) return;
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [book, table, module, pub]);

  const byUnit = useMemo(() => {
    const m = new Map<string, Row[]>();
    for (const r of rows ?? []) {
      const arr = m.get(r.unit) ?? [];
      arr.push(r);
      m.set(r.unit, arr);
    }
    return [...m.entries()].sort((a, b) => UNIT_ORDER.indexOf(a[0]) - UNIT_ORDER.indexOf(b[0]));
  }, [rows]);
  const bookCn = GAOKAO_BOOKS.find((b) => b.volume === book)?.cn ?? book;
  const returnTo = encodeURIComponent(`${basePath}?book=${book}`);

  if (!book) {
    return (
      <GaokaoBookPicker
        boardTitle={boardTitle} boardEmoji={boardEmoji} basePath={basePath}
        available={available} publisher={pub} subtitle="按课本分册 · 真实单元篇目 · 与课本同步进度互通"
      />
    );
  }
  if (loading || !rows) return <CenterSpin />;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6 space-y-5">
      <Link to={basePath} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回选册</T>
      </Link>
      <header className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 p-5 dark:from-indigo-950/30 dark:to-violet-950/20">
        <h1 className="text-2xl font-extrabold tracking-tight">{boardEmoji} {bookCn} · {boardTitle.replace("专项", "")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{rows.length} 篇真实单元内容,进度与课本同步互通。</p>
      </header>

      {byUnit.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">本册内容整理中。</p>
      ) : (
        <div className="space-y-5">
          {byUnit.map(([unit, items]) => (
            <section key={unit} className="space-y-2">
              <h2 className="px-1 text-sm font-bold text-muted-foreground">{unit}</h2>
              <div className="space-y-2">
                {items.map((r) => {
                  const m = mastery[r.id];
                  const pct = m?.best_pct ?? 0;
                  const stars = m?.stars ?? 0;
                  return (
                    <Link key={r.id} to={`/gaokao/lesson/${lessonSeg}/${r.id}?returnTo=${returnTo}`}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-white p-3 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:bg-card">
                      <MasteryRing value={pct} size={42} colorClass="stroke-amber-400">
                        <span className="text-[10px] font-bold tabular-nums">{pct}%</span>
                      </MasteryRing>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-foreground">{r.title || "（未命名）"}</p>
                        <p className="flex items-center gap-0.5 text-xs text-amber-500">
                          {Array.from({ length: 5 }).map((_, k) => (
                            <Star key={k} className={`size-3 ${k < stars ? "fill-amber-400" : "fill-none text-muted-foreground/40"}`} />
                          ))}
                        </p>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

function CenterSpin() {
  return <div className="grid min-h-[60vh] place-items-center"><RotateCw className="size-8 animate-spin text-indigo-400" /></div>;
}
