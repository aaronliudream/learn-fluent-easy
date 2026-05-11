import { T } from "@/i18n/T";import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  BookOpen, Headphones, FileText, PenLine, Mic, ChevronRight,
  Loader2, Volume2, Target, ListChecks } from
"lucide-react";
import { cn } from "@/lib/utils";
import { speak } from "@/lib/speak";

type Vocab = {
  id: string;word: string;meaning_cn: string;theme: string | null;
};
type Mastery = {
  word_id: string;mastery_level: number | null;
  quiz_correct: number | null;quiz_wrong: number | null;
  listen_correct: number | null;listen_wrong: number | null;
  spell_correct: number | null;spell_wrong: number | null;
  match_correct: number | null;match_wrong: number | null;
  last_seen_at: string | null;
};
type WordRow = Vocab & {
  state: "mastered" | "learning" | "unmastered" | "untouched";
  attempts: number;correct: number;wrong: number;
  last_seen: string | null;
};

type SkillStat = {
  total: number;
  mastered: number;
  learning: number;
  unmastered: number;
  untouched: number;
};

const GRADES = [1, 2, 3, 4, 5, 6] as const;

export default function SkillMasteryPanel() {
  const [grade, setGrade] = useState<number>(() => {
    const v = Number(localStorage.getItem("primary:lastGrade") ?? "1");
    return GRADES.includes(v as any) ? v : 1;
  });
  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState<WordRow[]>([]);
  const [readingStat, setReadingStat] = useState<{done: number;total: number;avg: number;}>({ done: 0, total: 0, avg: 0 });
  const [listeningStat, setListeningStat] = useState<{done: number;total: number;acc: number;}>({ done: 0, total: 0, acc: 0 });
  const [writingStat, setWritingStat] = useState<{done: number;total: number;acc: number;}>({ done: 0, total: 0, acc: 0 });
  const [speakingStat, setSpeakingStat] = useState<{attempts: number;avg: number;}>({ attempts: 0, avg: 0 });

  const [openSkill, setOpenSkill] = useState<null | "vocab" | "reading" | "listening" | "writing" | "speaking">(null);
  const [vocabFilter, setVocabFilter] = useState<"all" | "mastered" | "learning" | "unmastered" | "untouched">("unmastered");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (!uid) {setLoading(false);return;}

      // Vocab: 全量 + mastery
      const [vocabRes, masteryRes, articlesRes, readingProgRes, lessonsRes, lessonProgRes, speakRes] = await Promise.all([
      supabase.from("primary_vocab").select("id,word,meaning_cn,theme").eq("grade", grade),
      supabase.from("primary_word_mastery").select("word_id,mastery_level,quiz_correct,quiz_wrong,listen_correct,listen_wrong,spell_correct,spell_wrong,match_correct,match_wrong,last_seen_at").eq("user_id", uid).eq("grade", grade),
      supabase.from("primary_reading_articles").select("id").eq("grade", grade),
      supabase.from("primary_reading_progress").select("article_id,score,completed_at").eq("user_id", uid),
      supabase.from("primary_lessons").select("id,primary_skill,unit_id,primary_units!inner(grade)").eq("primary_units.grade", grade),
      supabase.from("primary_lesson_progress").select("lesson_id,accuracy,completed_at").eq("user_id", uid),
      supabase.from("primary_speaking_attempts").select("overall_score").eq("user_id", uid).eq("grade", grade)]
      );
      if (cancelled) return;

      const vocabList = (vocabRes.data ?? []) as Vocab[];
      const mMap = new Map<string, Mastery>();
      ((masteryRes.data ?? []) as Mastery[]).forEach((m) => mMap.set(m.word_id, m));
      const rows: WordRow[] = vocabList.map((v) => {
        const m = mMap.get(v.id);
        const correct = (m?.quiz_correct ?? 0) + (m?.listen_correct ?? 0) + (m?.spell_correct ?? 0) + (m?.match_correct ?? 0);
        const wrong = (m?.quiz_wrong ?? 0) + (m?.listen_wrong ?? 0) + (m?.spell_wrong ?? 0) + (m?.match_wrong ?? 0);
        const lvl = m?.mastery_level ?? 0;
        let state: WordRow["state"] = "untouched";
        if (!m) state = "untouched";else
        if (lvl >= 3) state = "mastered";else
        if (lvl >= 1) state = "learning";else
        if (correct + wrong > 0) state = wrong > correct ? "unmastered" : "learning";else
        state = "untouched";
        return { ...v, state, attempts: correct + wrong, correct, wrong, last_seen: m?.last_seen_at ?? null };
      });
      setWords(rows);

      // Reading
      const articleIds = new Set(((articlesRes.data ?? []) as any[]).map((a) => a.id));
      const readDone = ((readingProgRes.data ?? []) as any[]).filter((p) => articleIds.has(p.article_id) && p.completed_at);
      const readAvg = readDone.length ? Math.round(readDone.reduce((a, p) => a + (p.score ?? 0), 0) / readDone.length) : 0;
      setReadingStat({ done: readDone.length, total: articleIds.size, avg: readAvg });

      // Lessons by skill
      const lessons = (lessonsRes.data ?? []) as any[];
      const progMap = new Map<string, any>();
      ((lessonProgRes.data ?? []) as any[]).forEach((p) => progMap.set(p.lesson_id, p));
      const aggByskill = (skill: string) => {
        const ls = lessons.filter((l) => l.primary_skill === skill);
        const total = ls.length;
        let done = 0,accSum = 0,accN = 0;
        ls.forEach((l) => {
          const p = progMap.get(l.id);
          if (p?.completed_at) done++;
          if (p?.accuracy != null) {accSum += Number(p.accuracy);accN++;}
        });
        return { done, total, acc: accN ? Math.round(accSum / accN * 100) : 0 };
      };
      setListeningStat(aggByskill("listening"));
      setWritingStat(aggByskill("writing"));

      // Speaking
      const sp = (speakRes.data ?? []) as any[];
      const spAvg = sp.length ? Math.round(sp.reduce((a, x) => a + (x.overall_score ?? 0), 0) / sp.length) : 0;
      setSpeakingStat({ attempts: sp.length, avg: spAvg });

      setLoading(false);
    })();
    return () => {cancelled = true;};
  }, [grade]);

  const vocabStat: SkillStat = useMemo(() => {
    const s = { total: words.length, mastered: 0, learning: 0, unmastered: 0, untouched: 0 };
    words.forEach((w) => {s[w.state]++;});
    return s;
  }, [words]);

  const filteredWords = useMemo(() => {
    if (vocabFilter === "all") return words;
    return words.filter((w) => w.state === vocabFilter);
  }, [words, vocabFilter]);

  return (
    <section className="mb-4 rounded-3xl border-2 border-border bg-card p-4 shadow-tile md:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Target className="size-5 text-violet-500" />
          <div>
            <div className="text-sm font-extrabold"><T>📊 小学 · 各项技能掌握度</T></div>
            <div className="text-[11px] text-muted-foreground"><T>看清孩子哪里掌握了 · 哪里还没掌握 · 一键继续学</T></div>
          </div>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-secondary p-1 text-[11px] font-bold">
          {GRADES.map((g) =>
          <button
            key={g}
            onClick={() => {setGrade(g);localStorage.setItem("primary:lastGrade", String(g));setOpenSkill(null);}}
            className={cn("rounded-full px-2.5 py-1", g === grade ? "bg-amber-400 text-white shadow" : "text-muted-foreground")}>
            G{g}</button>
          )}
        </div>
      </div>

      {loading ?
      <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          <Loader2 className="mr-2 size-4 animate-spin" /> <T>加载中…</T>
        </div> :

      <div className="grid gap-3 md:grid-cols-2">
          <SkillCard
          icon={BookOpen}
          color="from-sky-500 to-cyan-500"
          title="词汇 Vocabulary"
          stat={vocabStat}
          ctaLabel={vocabStat.unmastered + vocabStat.untouched > 0 ? `🎯 只练没掌握的 ${vocabStat.unmastered + vocabStat.untouched} 个 →` : "🌟 全部掌握"}
          ctaTo={`/primary/vocab/${grade}`}
          onDetail={() => {setVocabFilter("unmastered");setOpenSkill(openSkill === "vocab" ? null : "vocab");}}
          extraNote={vocabStat.total === 0 ? "本年级暂无词汇数据" : `共 ${vocabStat.total} 词`} />
        

          <SkillCard
          icon={FileText}
          color="from-emerald-500 to-teal-500"
          title="阅读 Reading"
          customStats={[
          { label: "完成", value: `${readingStat.done}/${readingStat.total}`, color: "text-emerald-600" },
          { label: "平均分", value: `${readingStat.avg}`, color: "text-sky-600" },
          { label: "未读", value: `${Math.max(0, readingStat.total - readingStat.done)}`, color: "text-rose-600" }]
          }
          ctaLabel={readingStat.done < readingStat.total ? "📖 继续阅读 →" : "🌟 全部读完"}
          ctaTo={`/primary/reading/grade/${grade}`}
          extraNote={readingStat.total === 0 ? "本年级暂无阅读篇目" : "按完成度排序"} />
        

          <SkillCard
          icon={Headphones}
          color="from-violet-500 to-indigo-500"
          title="听力 Listening"
          customStats={[
          { label: "完成", value: `${listeningStat.done}/${listeningStat.total}`, color: "text-violet-600" },
          { label: "正确率", value: `${listeningStat.acc}%`, color: "text-sky-600" },
          { label: "未练", value: `${Math.max(0, listeningStat.total - listeningStat.done)}`, color: "text-rose-600" }]
          }
          ctaLabel={listeningStat.total === 0 ? "进入小学专区 →" : "🎧 继续听力 →"}
          ctaTo={`/primary/grade/${grade}`}
          extraNote={listeningStat.total === 0 ? "本年级暂无听力课程" : ""} />
        

          <SkillCard
          icon={PenLine}
          color="from-rose-500 to-orange-500"
          title="写作 Writing"
          customStats={[
          { label: "完成", value: `${writingStat.done}/${writingStat.total}`, color: "text-rose-600" },
          { label: "正确率", value: `${writingStat.acc}%`, color: "text-sky-600" },
          { label: "未练", value: `${Math.max(0, writingStat.total - writingStat.done)}`, color: "text-amber-600" }]
          }
          ctaLabel={writingStat.total === 0 ? "进入小学专区 →" : "✍️ 继续写作 →"}
          ctaTo={`/primary/grade/${grade}`}
          extraNote={writingStat.total === 0 ? "本年级暂无写作任务" : ""} />
        

          <SkillCard
          icon={Mic}
          color="from-pink-500 to-rose-500"
          title="口语 Speaking"
          customStats={[
          { label: "练习次数", value: `${speakingStat.attempts}`, color: "text-pink-600" },
          { label: "平均分", value: `${speakingStat.avg}`, color: "text-sky-600" },
          { label: "建议", value: speakingStat.attempts < 5 ? "多练" : "保持", color: "text-emerald-600" }]
          }
          ctaLabel="🎤 开口练 →"
          ctaTo={`/primary/grade/${grade}`}
          extraNote="基于跟读评分" />
        
        </div>
      }

      {/* 词汇详情抽屉 */}
      {openSkill === "vocab" && !loading &&
      <div className="mt-4 rounded-2xl border-2 border-sky-200 bg-sky-50/50 p-3 dark:bg-sky-950/20">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-sm font-extrabold">
              <ListChecks className="size-4 text-sky-600" /> <T>词汇详情 · G</T>{grade}
            </div>
            <div className="flex flex-wrap gap-1 text-[11px] font-bold">
              {([
            ["all", "全部", vocabStat.total, "bg-secondary"],
            ["mastered", "🟢 掌握", vocabStat.mastered, "bg-emerald-100 text-emerald-700"],
            ["learning", "🟡 学习中", vocabStat.learning, "bg-amber-100 text-amber-700"],
            ["unmastered", "🔴 未掌握", vocabStat.unmastered, "bg-rose-100 text-rose-700"],
            ["untouched", "⚪ 未学", vocabStat.untouched, "bg-slate-100 text-slate-700"]] as
            const).map(([k, label, n, cls]) =>
            <button
              key={k}
              onClick={() => setVocabFilter(k as any)}
              className={cn(
                "rounded-full px-2.5 py-1 transition",
                vocabFilter === k ? "ring-2 ring-sky-500 " + cls : cls + " opacity-70 hover:opacity-100"
              )}>
              {label} · {n}</button>
            )}
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto rounded-xl border border-border bg-card">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-secondary text-[10px] uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left"><T>单词</T></th>
                  <th className="px-2 py-2 text-left"><T>中文</T></th>
                  <th className="px-2 py-2 text-center"><T>状态</T></th>
                  <th className="px-2 py-2 text-center"><T>对/错</T></th>
                  <th className="px-2 py-2 text-right"><T>最近</T></th>
                </tr>
              </thead>
              <tbody>
                {filteredWords.length === 0 ?
              <tr><td colSpan={5} className="py-8 text-center text-muted-foreground"><T>该状态下没有单词 🎉</T></td></tr> :
              filteredWords.slice(0, 100).map((w) =>
              <tr key={w.id} className="border-t border-border/60">
                    <td className="px-3 py-2">
                      <button onClick={() => speak(w.word)} className="inline-flex items-center gap-1.5 font-bold hover:text-primary">
                        <Volume2 className="size-3 text-muted-foreground" /> {w.word}
                      </button>
                    </td>
                    <td className="px-2 py-2 text-muted-foreground">{w.meaning_cn}</td>
                    <td className="px-2 py-2 text-center">
                      <StateBadge s={w.state} />
                    </td>
                    <td className="px-2 py-2 text-center font-mono text-[11px]">
                      <span className="text-emerald-600">{w.correct}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-rose-600">{w.wrong}</span>
                    </td>
                    <td className="px-2 py-2 text-right text-[10px] text-muted-foreground">
                      {w.last_seen ? timeAgo(w.last_seen) : "—"}
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
            {filteredWords.length > 100 &&
          <div className="border-t border-border/60 py-2 text-center text-[10px] text-muted-foreground">
                <T>仅显示前 100 个 · 共</T> {filteredWords.length} <T>个</T>
              </div>
          }
          </div>

          <div className="mt-3 flex justify-end">
            <Link
            to={`/primary/vocab/${grade}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-2 text-xs font-extrabold text-white shadow">
              <T>一键开始测验</T> 
            <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
      }
    </section>);

}

function SkillCard({
  icon: Icon, color, title, stat, customStats, ctaLabel, ctaTo, onDetail, extraNote







}: {icon: any;color: string;title: string;stat?: SkillStat;customStats?: {label: string;value: string;color: string;}[];ctaLabel: string;ctaTo: string;onDetail?: () => void;extraNote?: string;}) {
  const masteredPct = stat ? Math.round(stat.mastered / Math.max(1, stat.total) * 100) : 0;
  return (
    <div className="rounded-2xl border-2 border-border bg-card p-3.5 transition hover:border-primary/40">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={cn("inline-grid size-7 place-items-center rounded-lg bg-gradient-to-br text-white", color)}>
            <Icon className="size-4" />
          </span>
          <div className="text-sm font-extrabold">{title}</div>
        </div>
        {stat && stat.total > 0 &&
        <div className="text-lg font-black text-emerald-600">{masteredPct}%</div>
        }
      </div>

      {stat ?
      <>
          <div className="mb-2 flex h-2 overflow-hidden rounded-full bg-secondary">
            <div className="bg-emerald-500" style={{ width: `${stat.mastered / Math.max(1, stat.total) * 100}%` }} />
            <div className="bg-amber-400" style={{ width: `${stat.learning / Math.max(1, stat.total) * 100}%` }} />
            <div className="bg-rose-500" style={{ width: `${stat.unmastered / Math.max(1, stat.total) * 100}%` }} />
          </div>
          <div className="grid grid-cols-4 gap-1 text-center text-[11px] font-bold">
            <div><div className="text-emerald-600">🟢 {stat.mastered}</div><div className="text-[9px] font-normal text-muted-foreground"><T>掌握</T></div></div>
            <div><div className="text-amber-600">🟡 {stat.learning}</div><div className="text-[9px] font-normal text-muted-foreground"><T>学习中</T></div></div>
            <div><div className="text-rose-600">🔴 {stat.unmastered}</div><div className="text-[9px] font-normal text-muted-foreground"><T>未掌握</T></div></div>
            <div><div className="text-slate-600">⚪ {stat.untouched}</div><div className="text-[9px] font-normal text-muted-foreground"><T>未学</T></div></div>
          </div>
        </> :

      <div className="grid grid-cols-3 gap-1 text-center text-[11px] font-bold">
          {customStats?.map((s) =>
        <div key={s.label}>
              <div className={s.color}>{s.value}</div>
              <div className="text-[9px] font-normal text-muted-foreground"><T>{s.label}</T></div>
            </div>
        )}
        </div>
      }

      <div className="mt-3 flex items-center justify-between gap-2">
        {extraNote && <div className="text-[10px] text-muted-foreground">{extraNote}</div>}
        <div className="ml-auto flex gap-1.5">
          {onDetail &&
          <button
            onClick={onDetail}
            className="rounded-full border border-border px-3 py-1.5 text-[11px] font-bold hover:bg-secondary">
              <T>👀 详情</T>
            
          </button>
          }
          <Link
            to={ctaTo}
            className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500 to-sky-500 px-3 py-1.5 text-[11px] font-extrabold text-white shadow">
            
            {ctaLabel}
          </Link>
        </div>
      </div>
    </div>);

}

function StateBadge({ s }: {s: WordRow["state"];}) {
  const map = {
    mastered: ["🟢 掌握", "bg-emerald-100 text-emerald-700"],
    learning: ["🟡 学习中", "bg-amber-100 text-amber-700"],
    unmastered: ["🔴 未掌握", "bg-rose-100 text-rose-700"],
    untouched: ["⚪ 未学", "bg-slate-100 text-slate-700"]
  } as const;
  const [label, cls] = map[s];
  return <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", cls)}>{label}</span>;
}

function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins}分钟前`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}小时前`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}天前`;
  return new Date(iso).toLocaleDateString();
}