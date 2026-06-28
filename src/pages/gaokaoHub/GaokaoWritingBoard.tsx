import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, RotateCw, PenLine } from "lucide-react";
import { T } from "@/i18n/T";
import { supabase } from "@/integrations/supabase/client";
import GaokaoBookPicker, { GAOKAO_BOOKS } from "@/components/gaokaoHub/GaokaoBookPicker";
import { readPublisherParam } from "@/lib/gaokaoHub/publisher";
import { availableVolumes } from "@/lib/gaokaoHub/availability";

const SENIOR_VOLUMES = GAOKAO_BOOKS.map((b) => b.volume);
const UNIT_ORDER = ["WU", "U1", "U2", "U3", "U4", "U5", "U6", "U7", "U8"];

type Prompt = {
  id: string; topic: string | null; title_en: string | null; unit: string;
  prompt_cn: string | null; prompt_en: string | null; requirements: string[] | null;
  min_words: number | null; max_words: number | null; sample_answer: string | null;
  high_sentences: string[] | null; paragraph_template: string | null;
};

/**
 * 高考·写作专项板块(7册分册)。提交制(无掌握度表互通顾虑)。
 * - 无 ?book → 选册(只有 junior_writing_prompts 有该 volume 的册可点)。
 * - ?book=required1 → 各单元真实写作题(junior_writing_prompts WHERE volume)。
 * - ?book&id → 题目详情(题干/要点/范文/高分句/模板)——真实单元内容。
 */
export default function GaokaoWritingBoard() {
  const [sp] = useSearchParams();
  const book = sp.get("book");
  const id = sp.get("id");
  const pub = readPublisherParam(sp);
  const [available, setAvailable] = useState<Set<string>>(new Set());
  const [rows, setRows] = useState<Prompt[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const avail = await availableVolumes("junior_writing_prompts", SENIOR_VOLUMES, pub);
      if (cancelled) return;
      setAvailable(avail);
    })();
    return () => { cancelled = true; };
  }, [pub]);

  useEffect(() => {
    if (!book) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("junior_writing_prompts")
        .select("id,topic,title_en,unit,prompt_cn,prompt_en,requirements,min_words,max_words,sample_answer,high_sentences,paragraph_template")
        .eq("volume", book).eq("publisher", pub);
      if (cancelled) return;
      setRows((data ?? []) as Prompt[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [book, pub]);

  const byUnit = useMemo(() => {
    const m = new Map<string, Prompt[]>();
    for (const r of rows ?? []) {
      const arr = m.get(r.unit) ?? [];
      arr.push(r);
      m.set(r.unit, arr);
    }
    return [...m.entries()].sort((a, b) => UNIT_ORDER.indexOf(a[0]) - UNIT_ORDER.indexOf(b[0]));
  }, [rows]);
  const bookCn = GAOKAO_BOOKS.find((b) => b.volume === book)?.cn ?? book;

  if (!book) {
    return (
      <GaokaoBookPicker
        boardTitle="写作专项" boardEmoji="✍️" basePath="/gaokao/writing"
        available={available} subtitle="按课本分册 · 真实单元写作题 · 题干/要点/范文"
      />
    );
  }
  if (loading || !rows) return <CenterSpin />;

  // 题目详情
  if (id) {
    const p = rows.find((x) => x.id === id);
    if (!p) return <p className="p-8 text-center text-sm text-muted-foreground">未找到该写作题。</p>;
    return <PromptDetail book={book!} bookCn={bookCn!} p={p} />;
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6 space-y-5">
      <Link to="/gaokao/writing" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回选册</T>
      </Link>
      <header className="rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 p-5 dark:from-rose-950/30 dark:to-orange-950/20">
        <h1 className="text-2xl font-extrabold tracking-tight">✍️ {bookCn} · 写作</h1>
        <p className="mt-1 text-sm text-muted-foreground">{rows.length} 篇真实单元写作题。</p>
      </header>
      {byUnit.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">本册写作内容整理中。</p>
      ) : (
        <div className="space-y-2">
          {byUnit.map(([unit, items]) =>
            items.map((p) => (
              <Link key={p.id} to={`/gaokao/writing?book=${book}&id=${p.id}`}
                className="flex items-center gap-3 rounded-2xl border border-border bg-white p-3 shadow-sm transition hover:border-rose-300 hover:shadow-md dark:bg-card">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-950/40"><PenLine className="size-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-foreground">{unit} · {p.topic || p.title_en || "写作"}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.prompt_cn || p.prompt_en || ""}</p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            )),
          )}
        </div>
      )}
    </main>
  );
}

function PromptDetail({ book, bookCn, p }: { book: string; bookCn: string; p: Prompt }) {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6 space-y-4">
      <Link to={`/gaokao/writing?book=${book}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回 {bookCn} 写作题</T>
      </Link>
      <header className="rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 p-5 dark:from-rose-950/30 dark:to-orange-950/20">
        <h1 className="text-xl font-extrabold tracking-tight">{p.unit} · {p.topic || p.title_en}</h1>
        {(p.min_words || p.max_words) && (
          <p className="mt-1 text-sm text-muted-foreground">建议 {p.min_words ?? "—"}–{p.max_words ?? "—"} 词</p>
        )}
      </header>

      {p.prompt_cn && <Section title="题目要求">{p.prompt_cn}</Section>}
      {p.requirements && p.requirements.length > 0 && (
        <Section title="写作要点">
          <ul className="list-disc space-y-1 pl-5">{p.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </Section>
      )}
      {p.paragraph_template && <Section title="结构模板"><pre className="whitespace-pre-wrap font-sans">{p.paragraph_template}</pre></Section>}
      {p.high_sentences && p.high_sentences.length > 0 && (
        <Section title="高分句型">
          <ul className="list-disc space-y-1 pl-5">{p.high_sentences.map((s, i) => <li key={i} className="italic">{s}</li>)}</ul>
        </Section>
      )}
      {p.sample_answer && <Section title="参考范文"><p className="whitespace-pre-wrap leading-relaxed">{p.sample_answer}</p></Section>}
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-white p-4 dark:bg-card">
      <h2 className="mb-2 text-sm font-extrabold text-foreground">{title}</h2>
      <div className="text-sm text-[#5C5751] dark:text-muted-foreground">{children}</div>
    </section>
  );
}

function CenterSpin() {
  return <div className="grid min-h-[60vh] place-items-center"><RotateCw className="size-8 animate-spin text-rose-400" /></div>;
}
