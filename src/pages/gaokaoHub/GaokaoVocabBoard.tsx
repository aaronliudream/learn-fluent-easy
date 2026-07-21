import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, RotateCw, BookOpen, Brain, Keyboard, Music, Headphones, Sparkles, Volume2, Clock, ChevronRight } from "lucide-react";
import { T } from "@/i18n/T";
import { supabase } from "@/integrations/supabase/client";
import { speak, prefetchTTSBatch } from "@/lib/speak";
import GaokaoBookPicker, { GAOKAO_BOOKS } from "@/components/gaokaoHub/GaokaoBookPicker";
import { readPublisherParam } from "@/lib/gaokaoHub/publisher";
import { availableVolumes } from "@/lib/gaokaoHub/availability";
import VocabGameLauncher from "@/components/vocab/VocabGameLauncher";
import VocabMasteryOverview from "@/components/vocab/VocabMasteryOverview";
import GuidedSession from "@/components/vocab/GuidedSession";
import WordBento from "@/components/WordBento";
import { ClassicQuiz, ContextQuiz, MemoryMatchWrapper, DictationSession, type Vocab } from "@/pages/JuniorVocab";

/**
 * 高考·词汇专项板块(7册分册)——方案B:复用初中那套完整 vocab 体验(以"册"为词池)。
 * - 无 ?book → 选册。
 * - ?book=required1 → 该册全部单元词(junior_vocab WHERE volume)作一个池 → 仪表盘 + 5步通关 + 5游戏 + 单词清单 + 艾宾浩斯复习。
 * ★铁律★:所有练习只写 junior_word_mastery(suppressGaokao=true 已门控 GuidedSession/ClassicQuiz/DictationSession 的
 *   recordCohortAttempt/recordAttempt/recordUnifiedAttempt)→ 高中词汇路径 0 条 gaokao_user_mastery 写入,与课本同步互通。
 *   见 docs/高中专区架构方案.md §④。
 */
const VOL_GRADE: Record<string, number> = {
  required1: 10, required2: 10, required3: 10, elective1: 11, elective2: 11, elective3: 12, elective4: 12,
};
const SENIOR_VOLUMES = GAOKAO_BOOKS.map((b) => b.volume);
const GROUP_SIZE = 20;
const COLS = "id,word,phonetic,pos,meaning_cn,meaning_en,example_en,example_cn,star_level,theme,freq_rank";
type Mode = "guided" | "classic" | "bento" | "match" | "dict" | "context" | "srs";

export default function GaokaoVocabBoard() {
  const [params, setParams] = useSearchParams();
  const book = params.get("book");
  const mode = params.get("mode") as Mode | null;
  const groupParam = Number(params.get("group") ?? "0");
  const grade = book ? VOL_GRADE[book] ?? 10 : 10;
  const pub = readPublisherParam(params); // 高中出版社:默认 pep,可被 ?publisher= 覆盖(Phase 3)

  const [available, setAvailable] = useState<Set<string>>(new Set());
  const [words, setWords] = useState<Vocab[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, studied: 0, mastered: 0, dueCount: 0, avgStability: 0 });
  const [srsPool, setSrsPool] = useState<Vocab[] | null>(null);

  // 选册可用性
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const avail = await availableVolumes("junior_vocab", SENIOR_VOLUMES, pub); // 逐册存在性,避开 1000 行截断
      if (!cancelled) setAvailable(avail);
    })();
    return () => { cancelled = true; };
  }, [pub]);

  // 选册后:读该册全部词
  useEffect(() => {
    if (!book) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const all: Vocab[] = [];
      for (let from = 0; from < 5000; from += 1000) {
        const { data, error } = await supabase.from("junior_vocab").select(COLS)
          .eq("volume", book).eq("publisher", pub).order("freq_rank", { ascending: true, nullsFirst: false }).range(from, from + 999);
        if (error || !data || data.length === 0) break;
        all.push(...(data as Vocab[]));
        if (data.length < 1000) break;
      }
      if (cancelled) return;
      setWords(all);
      // 掌握度汇总(读 junior_word_mastery,与单元页同口径)
      const ids = all.map((w) => w.id);
      const { data: { user } } = await supabase.auth.getUser();
      let studied = 0, mastered = 0, dueCount = 0, intervalSum = 0;
      if (user && ids.length) {
        const nowIso = new Date().toISOString();
        for (let i = 0; i < ids.length; i += 200) {
          const { data: m } = await supabase.from("junior_word_mastery")
            .select("word_id,quiz_consec,match_consec,spell_consec,bento_consec,context_consec,listen_correct,cloze_correct,interval_days,due_at")
            .eq("user_id", user.id).in("word_id", ids.slice(i, i + 200));
          for (const r of (m ?? []) as Record<string, number | string>[]) {
            studied++;
            const maxC = Math.max(Number(r.quiz_consec ?? 0), Number(r.match_consec ?? 0), Number(r.spell_consec ?? 0), Number(r.bento_consec ?? 0), Number(r.context_consec ?? 0));
            if (maxC >= 2 || Number(r.listen_correct ?? 0) >= 2 || Number(r.cloze_correct ?? 0) >= 2) mastered++;
            intervalSum += Number(r.interval_days ?? 0);
            if (r.due_at && String(r.due_at) <= nowIso) dueCount++;
          }
        }
      }
      if (cancelled) return;
      setSummary({ total: all.length, studied, mastered, dueCount, avgStability: studied ? Math.round((intervalSum / studied) * 10) / 10 : 0 });
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [book, pub]);

  // 复习池(到期词)
  useEffect(() => {
    if (mode !== "srs" || !words.length) { setSrsPool(null); return; }
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setSrsPool([]); return; }
      const { data } = await supabase.from("junior_word_mastery").select("word_id,due_at")
        .eq("user_id", user.id).lte("due_at", new Date().toISOString()).limit(300);
      if (cancelled) return;
      const due = new Set((data ?? []).map((r: { word_id: string }) => r.word_id));
      setSrsPool(words.filter((w) => due.has(w.id)));
    })();
    return () => { cancelled = true; };
  }, [mode, words]);

  const groups = useMemo(() => {
    const out: Vocab[][] = [];
    for (let i = 0; i < words.length; i += GROUP_SIZE) out.push(words.slice(i, i + GROUP_SIZE));
    return out;
  }, [words]);
  const groupIdx = Number.isFinite(groupParam) ? groupParam - 1 : -1;
  const activePool = groupIdx >= 0 && groupIdx < groups.length ? groups[groupIdx] : words;
  const bookCn = GAOKAO_BOOKS.find((b) => b.volume === book)?.cn ?? book;

  const setMode = (m: Mode | null) => {
    const np = new URLSearchParams(params);
    if (m) np.set("mode", m); else { np.delete("mode"); np.delete("group"); }
    setParams(np, { replace: !m });
  };
  const exit = () => setMode(null);

  // ── 选册 ──
  if (!book) {
    return <GaokaoBookPicker boardTitle="词汇专项" boardEmoji="📒" basePath="/gaokao/vocab"
      available={available} publisher={pub} subtitle="按课本分册 · 5步通关 · 5个游戏 · 艾宾浩斯复习 · 与课本同步互通" />;
  }
  if (loading) return <CenterSpin />;

  // ── 模式分发(复用初中游戏,suppressGaokao=true 守铁律)──
  const gradeNum = grade;
  if (mode === "srs") {
    if (srsPool === null) return <CenterSpin />;
    if (srsPool.length === 0) return <DueEmpty onBack={exit} />;
    return <ClassicQuiz pool={srsPool} onExit={exit} gradeNum={gradeNum} suppressGaokao />;
  }
  if (mode === "guided") return <GuidedSession pool={activePool.slice(0, 100)} onExit={exit} title={`${bookCn} · 本关通关`} grade={gradeNum} trackJuniorMastery suppressGaokao />;
  if (mode === "bento") return <WordBento pool={activePool} onExit={exit} gradeNum={gradeNum} />;
  if (mode === "match") return <MemoryMatchWrapper pool={activePool} onExit={exit} gradeNum={gradeNum} />;
  if (mode === "dict") return <DictationSession pool={activePool} onExit={exit} gradeNum={gradeNum} suppressGaokao />;
  if (mode === "context") return <ContextQuiz pool={activePool} onExit={exit} gradeNum={gradeNum} volume={book!} publisher={pub} />;
  if (mode === "classic") return <ClassicQuiz pool={activePool} onExit={exit} gradeNum={gradeNum} suppressGaokao />;

  // 单词清单 → 某组浏览
  if (groupIdx >= 0 && groupIdx < groups.length) {
    return <GroupView book={book!} bookCn={bookCn!} group={groups[groupIdx]} groupNumber={groupIdx + 1} onBack={() => setParams({ book: book! }, { replace: true })} />;
  }

  // ── 首页:仪表盘 + 复习 + 5步 + 5游戏 + 单词清单 ──
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6 space-y-5">
      <Link to="/gaokao/vocab" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回选册</T>
      </Link>
      <header className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-5 dark:from-emerald-950/30 dark:to-teal-950/20">
        <h1 className="text-2xl font-extrabold tracking-tight">📒 {bookCn} · 词汇</h1>
        <p className="mt-1 text-sm text-muted-foreground">{summary.total} 个真实单元词汇,进度与课本同步互通。</p>
      </header>

      <VocabMasteryOverview total={summary.total} mastered={summary.mastered} studied={summary.studied} dueCount={summary.dueCount} avgStability={summary.avgStability} />

      {summary.dueCount > 0 && (
        <button onClick={() => setMode("srs")} className="flex w-full items-center gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-left dark:border-amber-900/50 dark:bg-amber-950/20">
          <Clock className="size-6 shrink-0 text-amber-500" />
          <div className="flex-1"><p className="font-extrabold text-amber-800 dark:text-amber-300">今天有 {summary.dueCount} 个词到复习时间</p><p className="text-xs text-amber-600">按艾宾浩斯曲线复习,巩固掌握</p></div>
          <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">立即复习</span>
        </button>
      )}

      <button onClick={() => setMode("guided")} className="flex w-full items-center justify-between gap-3 rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-500 to-teal-600 px-5 py-4 text-left text-white shadow-lg transition hover:from-emerald-600 hover:to-teal-700">
        <div className="flex items-center gap-3">
          <BookOpen className="size-6 shrink-0" />
          <div><p className="font-extrabold">5步通关 · 看→认→想→拼→用</p><p className="text-xs text-white/80">按级解锁,系统化学一组新词</p></div>
        </div>
        <span className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold">推荐 ★</span>
      </button>

      {/* 5 游戏启动卡(与初中 1:1 同色同序),复用共享 VocabGameLauncher */}
      <VocabGameLauncher onPick={(m) => setMode(m)} />

      <section className="space-y-2">
        <h2 className="px-1 text-sm font-bold text-muted-foreground">单词清单(分组逐组学,共 {groups.length} 组)</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {groups.map((_, i) => (
            <button key={i} onClick={() => setParams({ book: book!, group: String(i + 1) })} className="rounded-xl border border-border bg-white py-2 text-sm font-bold text-foreground transition hover:border-emerald-300 dark:bg-card">
              第 {i + 1} 组
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

/** 某组词浏览(senior 版,显示真实单元词 + 🔊)。 */
function GroupView({ book, bookCn, group, groupNumber, onBack }: { book: string; bookCn: string; group: Vocab[]; groupNumber: number; onBack: () => void }) {
  // P2 预热:进组即按网络预热本组(≤20)词音频,键与 speak(w.word) 一致(默认音色)。
  // 首点喇叭秒响,消除冷合成 1-3s;prefetchTTSBatch 纯网络,不碰 <audio>。
  useEffect(() => { prefetchTTSBatch(group.map((w) => w.word)); }, [group]);
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6 space-y-4">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回 {bookCn} 词汇</T>
      </button>
      <header className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-5 dark:from-emerald-950/30 dark:to-teal-950/20">
        <h1 className="text-xl font-extrabold tracking-tight">第 {groupNumber} 组 · {group.length} 词</h1>
      </header>
      <div className="space-y-2">
        {group.map((w) => (
          <div key={w.id} className="rounded-2xl border border-border bg-white p-3 dark:bg-card">
            <div className="flex items-center gap-2">
              <button onClick={() => speak(w.word)} className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"><Volume2 className="size-4" /></button>
              <span className="font-extrabold text-foreground">{w.word}</span>
              {w.phonetic && <span className="text-xs text-muted-foreground">{w.phonetic}</span>}
              {w.pos && <span className="text-[11px] text-muted-foreground">{w.pos}</span>}
            </div>
            <p className="mt-1 text-sm text-foreground">{w.meaning_cn}</p>
            {w.example_en && <p className="mt-1 text-xs text-muted-foreground"><span className="italic">{w.example_en}</span>{w.example_cn ? ` ${w.example_cn}` : ""}</p>}
          </div>
        ))}
      </div>
    </main>
  );
}

function DueEmpty({ onBack }: { onBack: () => void }) {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> 返回</button>
      <div className="rounded-3xl border border-border/60 bg-card p-8 text-center">
        <p className="text-xl font-extrabold">今日没有到期单词 🎉</p>
        <p className="mt-1 text-sm text-muted-foreground">先去清单里学一组新词,系统会按艾宾浩斯曲线自动安排复习。</p>
      </div>
    </main>
  );
}

function CenterSpin() {
  return <div className="grid min-h-[60vh] place-items-center"><RotateCw className="size-8 animate-spin text-emerald-400" /></div>;
}
