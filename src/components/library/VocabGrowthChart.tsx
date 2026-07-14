/**
 * 词汇成长图表(/library/vocab 成就区)。
 * 「读这本书,我的词汇量涨了多少」——柱状图画【每月新掌握的绝对数】(不画增长率:分母只增不减会让越努力越难看)。
 * 每根柱子按来源书分段上色 → 看得见「读书 → 词汇增长」的因果。数据全部来自 library_vocab_favorites,零查询、零 SQL。
 *
 * 掌握日期取 last_correct_date:毕业(streak≥3)后不再出题,该日期天然停在毕业当天 = 掌握时间。
 */
import { useMemo, useState } from "react";
import { vocabIsMastered, type LibraryFavorite } from "@/lib/library/favorites";
import type { BookCore } from "@/lib/library/data";

/** 按书上色(稳定调色板;null 书归灰"其他")。 */
const BOOK_COLORS = ["#10b981", "#f59e0b", "#6366f1", "#ec4899", "#14b8a6", "#f97316", "#8b5cf6", "#0ea5e9"];
const NULL_COLOR = "#94a3b8";
const NULL_ID = "__none__";

type RangeKey = 1 | 3 | 6 | 0; // 0 = 全部

function ym(d: string): string {
  return d.slice(0, 7); // 'YYYY-MM'(last_correct_date 已是北京日,无需再转时区)
}
function stepMonth(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number);
  const idx = y * 12 + (m - 1) + delta;
  const yy = Math.floor(idx / 12);
  const mm = (idx % 12) + 1;
  return `${yy}-${String(mm).padStart(2, "0")}`;
}
function monthsFromTo(start: string, end: string): string[] {
  const out: string[] = [];
  let cur = start;
  for (let i = 0; i < 240 && cur <= end; i++) {
    out.push(cur);
    cur = stepMonth(cur, 1);
  }
  return out;
}
function monthLabel(key: string, en: boolean): string {
  const [y, m] = key.split("-");
  return en ? `${Number(m)}/${y.slice(2)}` : `${Number(m)}月`;
}

export default function VocabGrowthChart({
  favs,
  bookTitles,
  bookCore,
  bjMonth,
  en,
}: {
  favs: LibraryFavorite[]; // 已剔除虚词的可复习集
  bookTitles: Map<string, string>;
  bookCore?: Map<string, BookCore>; // 每书核心词/块数(掌握率固定分母);缺则不显示覆盖条
  bjMonth: string; // 当前北京月 'YYYY-MM'
  en: boolean;
}) {
  const [range, setRange] = useState<RangeKey>(3);

  const mastered = useMemo(
    () => favs.filter((f) => vocabIsMastered(f) && !!f.last_correct_date),
    [favs],
  );

  // 累计(全时,只增不减)
  const cumWord = mastered.filter((f) => f.kind === "word").length;
  const cumChunk = mastered.filter((f) => f.kind === "chunk").length;

  // 出现过的书桶(按掌握总数降序;稳定配色)
  const books = useMemo(() => {
    const tally = new Map<string, number>();
    for (const f of mastered) {
      const id = f.book_id || NULL_ID;
      tally.set(id, (tally.get(id) ?? 0) + 1);
    }
    const ids = [...tally.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
    const color = new Map<string, string>();
    let ci = 0;
    for (const id of ids) color.set(id, id === NULL_ID ? NULL_COLOR : BOOK_COLORS[ci++ % BOOK_COLORS.length]);
    return { ids, color };
  }, [mastered]);

  // 每本书的词/语块小结(最有说服力的一句话)
  const perBook = useMemo(() => {
    return books.ids
      .map((id) => {
        const rows = mastered.filter((f) => (f.book_id || NULL_ID) === id);
        return {
          id,
          title: id === NULL_ID ? (en ? "Other" : "其他") : bookTitles.get(id) || id,
          word: rows.filter((f) => f.kind === "word").length,
          chunk: rows.filter((f) => f.kind === "chunk").length,
          color: books.color.get(id)!,
        };
      })
      .filter((b) => b.word + b.chunk > 0);
  }, [books, mastered, bookTitles, en]);

  // 图表月份轴 + 每月每书堆叠计数
  const chart = useMemo(() => {
    if (mastered.length === 0) return { months: [] as string[], byMonth: new Map<string, Map<string, number>>(), max: 0 };
    const earliest = mastered.reduce((min, f) => (ym(f.last_correct_date!) < min ? ym(f.last_correct_date!) : min), bjMonth);
    const start = range === 0 ? earliest : stepMonth(bjMonth, -(range - 1));
    const months = monthsFromTo(start < bjMonth ? start : bjMonth, bjMonth);
    const byMonth = new Map<string, Map<string, number>>();
    for (const m of months) byMonth.set(m, new Map());
    for (const f of mastered) {
      const m = ym(f.last_correct_date!);
      if (!byMonth.has(m)) continue; // 落在所选范围外
      const bucket = byMonth.get(m)!;
      const id = f.book_id || NULL_ID;
      bucket.set(id, (bucket.get(id) ?? 0) + 1);
    }
    let max = 0;
    for (const m of months) {
      let t = 0;
      for (const n of byMonth.get(m)!.values()) t += n;
      if (t > max) max = t;
    }
    return { months, byMonth, max };
  }, [mastered, range, bjMonth]);

  // 空状态:一个词都还没毕业时,不留空白——告诉用户「这里将来会有成长曲线」本身就是动力。
  if (mastered.length === 0) {
    return (
      <div className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3.5 text-center">
        <div className="text-sm font-bold text-slate-600">📊 {en ? "Vocabulary growth" : "词汇成长"}</div>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
          {en
            ? "Get a word right 3 times — on 3 different days — to graduate your first one. Then your growth curve shows up here, month by month."
            : "连对 3 次(且要跨 3 天)就能毕业第一个词。到时候这里会出现你的成长曲线,看得见每个月学会了多少。"}
        </p>
      </div>
    );
  }

  const RANGES: { key: RangeKey; label: string }[] = [
    { key: 1, label: en ? "1M" : "近1月" },
    { key: 3, label: en ? "3M" : "近3月" },
    { key: 6, label: en ? "6M" : "近6月" },
    { key: 0, label: en ? "All" : "全部" },
  ];
  const TRACK = 96; // 柱区像素高

  return (
    <div className="mt-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm">
      {/* 标题 + 累计 */}
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm">
          <div className="font-bold text-slate-700">{en ? "Vocabulary growth" : "词汇成长"}</div>
          <div className="mt-0.5 text-xs text-slate-500">
            {en ? "Mastered so far: " : "累计已掌握 "}
            <span className="font-bold text-slate-700">{cumWord}</span> {en ? "words" : "个单词"}
            {cumChunk > 0 && (
              <>
                {" · "}
                <span className="font-bold text-slate-700">{cumChunk}</span> {en ? "chunks" : "个语块"}
              </>
            )}
          </div>
        </div>
        <div className="flex shrink-0 rounded-full bg-slate-100 p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold transition ${
                range === r.key ? "bg-white text-sky-700 shadow-sm" : "text-slate-500"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* 柱状图:每月新掌握(绝对数),按书堆叠上色 */}
      <div className="mt-3 overflow-x-auto pb-1">
        <div className="flex items-end gap-1.5" style={{ minWidth: `${chart.months.length * 34}px` }}>
          {chart.months.map((m) => {
            const bucket = chart.byMonth.get(m)!;
            const segs = books.ids
              .map((id) => ({ id, n: bucket.get(id) ?? 0 }))
              .filter((s) => s.n > 0);
            const total = segs.reduce((a, s) => a + s.n, 0);
            const pct = chart.max > 0 && total > 0 ? Math.max(6, (total / chart.max) * 100) : 0;
            return (
              <div key={m} className="flex min-w-[28px] flex-1 flex-col items-center">
                <span className="mb-1 h-3 text-[10px] tabular-nums text-slate-400">{total || ""}</span>
                <div className="flex w-7 items-end" style={{ height: TRACK }}>
                  <div
                    className="flex w-full flex-col-reverse overflow-hidden rounded-t"
                    style={{ height: `${pct}%` }}
                    title={`${monthLabel(m, en)} · ${total}`}
                  >
                    {segs.map((s) => (
                      <div key={s.id} style={{ flexGrow: s.n, backgroundColor: books.color.get(s.id) }} />
                    ))}
                  </div>
                </div>
                <span className="mt-1 whitespace-nowrap text-[10px] text-slate-400">{monthLabel(m, en)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 图例(按书上色) */}
      {perBook.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
          {perBook.map((b) => (
            <span key={b.id} className="inline-flex items-center gap-1">
              <span className="size-2.5 rounded-sm" style={{ backgroundColor: b.color }} />
              {b.id === NULL_ID ? b.title : `《${b.title}》`}
            </span>
          ))}
        </div>
      )}

      {/* 按书小结:最有说服力的一句话(绝对数为主)+ 全书核心词覆盖条(固定分母·只增不减)*/}
      <div className="mt-3 space-y-2.5 border-t border-slate-100 pt-3">
        {perBook.map((b) => {
          const core = b.id === NULL_ID ? undefined : bookCore?.get(b.id);
          const pct = core && core.word > 0 ? Math.min(100, (b.word / core.word) * 100) : 0;
          return (
            <div key={b.id}>
              <div className="text-[13px] text-slate-600">
                📖 {b.id === NULL_ID ? b.title : `《${b.title}》`}
                {en ? " · you mastered " : " · 你掌握了 "}
                <span className="font-bold text-slate-800">{b.word}</span> {en ? "words" : "个词"}
                {b.chunk > 0 && (
                  <>
                    {" · "}
                    <span className="font-bold text-slate-800">{b.chunk}</span> {en ? "chunks" : "个语块"}
                  </>
                )}
              </div>
              {core && core.word > 0 && (
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.max(pct, b.word > 0 ? 2 : 0)}%`, backgroundColor: b.color }}
                    />
                  </div>
                  <span className="shrink-0 text-[10px] tabular-nums text-slate-400">
                    {b.word}/{core.word} {en ? "words" : "核心词"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
