import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, RotateCw, Volume2, Check, X } from "lucide-react";
import { T } from "@/i18n/T";
import { supabase } from "@/integrations/supabase/client";
import { speak } from "@/lib/speak";
import { loadUnitVocabProgress, type UnitOverall } from "@/lib/juniorHub/unitOverallProgress";
import { recordJuniorWordMastery } from "@/lib/juniorWordMastery";
import { MasteryRing } from "@/components/grammar/MasteryRing";
import GaokaoBookPicker, { GAOKAO_BOOKS } from "@/components/gaokaoHub/GaokaoBookPicker";

const SENIOR_VOLUMES = GAOKAO_BOOKS.map((b) => b.volume);
const VOL_GRADE: Record<string, number> = {
  required1: 10, required2: 10, required3: 10, elective1: 11, elective2: 11, elective3: 12, elective4: 12,
};
const UNIT_ORDER = ["WU", "U1", "U2", "U3", "U4", "U5", "U6", "U7", "U8"];

type Word = {
  id: string; word: string; phonetic: string | null; pos: string | null;
  meaning_cn: string; example_en: string | null; example_cn: string | null; unit: string;
};

/**
 * 高考·词汇专项板块(7册分册)。
 * - 无 ?book → 选册骨架(只有 junior_vocab 有该 volume 的册可点)。
 * - ?book=required1 → 该册各单元(WU/U1/U2/U3…)真实词汇(junior_vocab WHERE volume),每单元掌握度环
 *   = loadUnitVocabProgress(与课本同步单元页词汇环**同一口径**:mastery_level≥3)。
 * - ?book&unit → 该单元词表浏览 + 「测一测」MCQ(写 recordJuniorWordMastery → junior_word_mastery)。
 * ★互通★:词都是 junior_vocab 同一批 id,掌握写 junior_word_mastery(按 word_id),与课本同步词汇关**同表**,
 *   绝不碰 gaokao_user_mastery → 进度天然互通。见 docs/高中专区架构方案.md §②③。
 */
export default function GaokaoVocabBoard() {
  const [sp] = useSearchParams();
  const book = sp.get("book");
  const unit = sp.get("unit");

  const [available, setAvailable] = useState<Set<string>>(new Set());
  const [words, setWords] = useState<Word[] | null>(null);
  const [prog, setProg] = useState<Record<string, UnitOverall>>({});
  const [loading, setLoading] = useState(true);

  // 选册可用性
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("junior_vocab").select("volume").in("volume", SENIOR_VOLUMES);
      if (cancelled) return;
      setAvailable(new Set(((data ?? []) as { volume: string }[]).map((r) => r.volume)));
    })();
    return () => { cancelled = true; };
  }, []);

  // 选册后:读该册全部词 + 逐单元掌握度
  useEffect(() => {
    if (!book) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("junior_vocab")
        .select("id,word,phonetic,pos,meaning_cn,example_en,example_cn,unit")
        .eq("volume", book)
        .order("freq_rank", { ascending: true, nullsFirst: false });
      if (cancelled) return;
      const rows = ((data ?? []) as Word[]).filter((r) => r.word && r.meaning_cn);
      setWords(rows);
      // 逐单元掌握度
      const byUnit = new Map<string, string[]>();
      for (const r of rows) {
        const arr = byUnit.get(r.unit) ?? [];
        arr.push(r.id);
        byUnit.set(r.unit, arr);
      }
      const map: Record<string, UnitOverall> = {};
      for (const [u, ids] of byUnit) map[u] = await loadUnitVocabProgress(ids);
      if (cancelled) return;
      setProg(map);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [book]);

  const unitsInBook = useMemo(() => {
    const set = new Set((words ?? []).map((w) => w.unit));
    return [...set].sort((a, b) => UNIT_ORDER.indexOf(a) - UNIT_ORDER.indexOf(b));
  }, [words]);
  const bookCn = GAOKAO_BOOKS.find((b) => b.volume === book)?.cn ?? book;
  const grade = book ? VOL_GRADE[book] ?? 10 : 10;

  if (!book) {
    return (
      <GaokaoBookPicker
        boardTitle="词汇专项" boardEmoji="📒" basePath="/gaokao/vocab"
        available={available} subtitle="按课本分册 · 真实单元词汇 · 与课本同步进度互通"
      />
    );
  }

  if (loading || !words) return <CenterSpin />;

  // 单元词表 + 测一测
  if (unit) {
    const unitWords = words.filter((w) => w.unit === unit);
    return <UnitVocabView book={book} bookCn={bookCn!} unit={unit} grade={grade} words={unitWords} />;
  }

  // 册 → 单元列表
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6 space-y-5">
      <Link to="/gaokao/vocab" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回选册</T>
      </Link>
      <header className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-5 dark:from-emerald-950/30 dark:to-teal-950/20">
        <h1 className="text-2xl font-extrabold tracking-tight">📒 {bookCn} · 词汇</h1>
        <p className="mt-1 text-sm text-muted-foreground">{words.length} 个真实单元词汇,进度与课本同步互通。</p>
      </header>
      {unitsInBook.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">本册词汇整理中。</p>
      ) : (
        <div className="space-y-3">
          {unitsInBook.map((u) => {
            const p = prog[u] ?? { done: 0, mastered: 0, total: 0 };
            const pct = p.total ? Math.round((p.mastered / p.total) * 100) : 0;
            return (
              <Link key={u} to={`/gaokao/vocab?book=${book}&unit=${u}`}
                className="flex items-center gap-3 rounded-2xl border border-border bg-white p-3 shadow-sm transition hover:border-emerald-300 hover:shadow-md dark:bg-card">
                <MasteryRing value={pct} size={44} colorClass="stroke-emerald-400">
                  <span className="text-[10px] font-bold tabular-nums">{pct}%</span>
                </MasteryRing>
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-foreground">{u} · 词汇</p>
                  <p className="text-xs text-muted-foreground">已掌握 {p.mastered}/{p.total} 词</p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}

/** 单元词表浏览 + 测一测(MCQ:中文释义→选英文词,写 junior_word_mastery 互通)。 */
function UnitVocabView({ book, bookCn, unit, grade, words }:
  { book: string; bookCn: string; unit: string; grade: number; words: Word[] }) {
  const [quiz, setQuiz] = useState(false);
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6 space-y-5">
      <Link to={`/gaokao/vocab?book=${book}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回 {bookCn} 单元</T>
      </Link>
      <header className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-5 dark:from-emerald-950/30 dark:to-teal-950/20">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{unit} · 词汇</h1>
          <p className="mt-1 text-sm text-muted-foreground">{words.length} 词 · {bookCn}</p>
        </div>
        <button onClick={() => setQuiz((q) => !q)}
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-2 text-sm font-semibold text-white">
          {quiz ? "看词表" : "测一测"}
        </button>
      </header>
      {quiz ? (
        <VocabQuiz words={words} grade={grade} />
      ) : (
        <div className="space-y-2">
          {words.map((w) => (
            <div key={w.id} className="rounded-2xl border border-border bg-white p-3 dark:bg-card">
              <div className="flex items-center gap-2">
                <button onClick={() => speak(w.word)} className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                  <Volume2 className="size-4" />
                </button>
                <span className="font-extrabold text-foreground">{w.word}</span>
                {w.phonetic && <span className="text-xs text-muted-foreground">{w.phonetic}</span>}
                {w.pos && <span className="text-[11px] text-muted-foreground">{w.pos}</span>}
              </div>
              <p className="mt-1 text-sm text-foreground">{w.meaning_cn}</p>
              {w.example_en && (
                <p className="mt-1 text-xs text-muted-foreground"><span className="italic">{w.example_en}</span>{w.example_cn ? ` ${w.example_cn}` : ""}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

/** 中文释义 → 选英文词 MCQ;答完写 recordJuniorWordMastery(kind:'quiz') → 与课本同步词汇 quiz 同表。 */
function VocabQuiz({ words, grade }: { words: Word[]; grade: number }) {
  const pool = useMemo(() => words.filter((w) => w.id), [words]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ ok: 0, n: 0 });

  const q = pool[i];
  const options = useMemo(() => {
    if (!q) return [];
    const distract = pool.filter((w) => w.id !== q.id).map((w) => w.word);
    // 简易打散:按 id 派生顺序取 3 个干扰
    const picks: string[] = [];
    for (let k = 0; k < distract.length && picks.length < 3; k++) {
      const idx = (q.id.charCodeAt(0) + k * 7) % distract.length;
      if (!picks.includes(distract[idx])) picks.push(distract[idx]);
    }
    const arr = [q.word, ...picks];
    // 稳定打散(按 id 派生)
    return arr.sort((a, b) => ((q.id.charCodeAt(1) + a.length) % 5) - ((q.id.charCodeAt(1) + b.length) % 5));
  }, [q, pool]);

  if (!pool.length) return <p className="p-6 text-center text-sm text-muted-foreground">本单元暂无可测词汇。</p>;
  if (i >= pool.length) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 text-center dark:bg-card">
        <p className="text-lg font-extrabold">本轮完成 🎉</p>
        <p className="mt-1 text-sm text-muted-foreground">答对 {score.ok}/{score.n} · 掌握度已计入(与课本同步互通)</p>
        <button onClick={() => { setI(0); setPicked(null); setScore({ ok: 0, n: 0 }); }}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-5 py-2.5 text-sm text-white">
          <RotateCw className="size-4" /> 再测一轮
        </button>
      </div>
    );
  }

  const onPick = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    const isCorrect = opt === q.word;
    setScore((s) => ({ ok: s.ok + (isCorrect ? 1 : 0), n: s.n + 1 }));
    void recordJuniorWordMastery({ wordId: q.id, grade, kind: "quiz", isCorrect });
  };

  return (
    <div className="space-y-4">
      <div className="text-center text-xs text-muted-foreground">第 {i + 1} / {pool.length} 题 · 选出释义对应的单词</div>
      <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-6 text-center dark:border-emerald-900/50 dark:bg-emerald-950/20">
        <p className="text-lg font-extrabold text-foreground">{q.meaning_cn}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => {
          const isAns = opt === q.word;
          const show = picked != null;
          return (
            <button key={opt} onClick={() => onPick(opt)} disabled={show}
              className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                show && isAns ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40"
                : show && opt === picked ? "border-rose-300 bg-rose-50 text-rose-600 dark:bg-rose-950/30"
                : "border-border bg-white hover:border-emerald-300 dark:bg-card"}`}>
              {opt}
              {show && isAns && <Check className="size-4" />}
              {show && !isAns && opt === picked && <X className="size-4" />}
            </button>
          );
        })}
      </div>
      {picked && (
        <button onClick={() => { setPicked(null); setI((x) => x + 1); }}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-3 text-sm font-semibold text-white">
          {i >= pool.length - 1 ? "查看结果 →" : "下一题 →"}
        </button>
      )}
    </div>
  );
}

function CenterSpin() {
  return <div className="grid min-h-[60vh] place-items-center"><RotateCw className="size-8 animate-spin text-emerald-400" /></div>;
}
