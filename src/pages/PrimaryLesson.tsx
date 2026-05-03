import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, X, Volume2, Loader2, Trophy, Sparkles, Mic, BookOpen, Eye, Pencil, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { speak } from "@/lib/speak";
import { cn } from "@/lib/utils";

type StepType = "input" | "understand" | "practice" | "output" | "test";
type Step = { type: StepType; title?: string; intro?: string; kind?: string; passScore?: number;
  items?: any[]; questions?: { q: string; options: string[]; answer: number }[] };
type Lesson = {
  id: string; title_cn: string; title_en: string | null; primary_skill: string;
  estimated_minutes: number; steps: Step[];
  unit?: { grade: number; title_cn: string; emoji: string | null };
};

const STEP_META: Record<StepType, { label: string; icon: any; color: string }> = {
  input:      { label: "输入",  icon: Eye,      color: "from-sky-400 to-cyan-500" },
  understand: { label: "理解",  icon: BookOpen, color: "from-violet-400 to-fuchsia-500" },
  practice:   { label: "练习",  icon: Target,   color: "from-amber-400 to-orange-500" },
  output:     { label: "输出",  icon: Mic,      color: "from-pink-400 to-rose-500" },
  test:       { label: "测试",  icon: Trophy,   color: "from-emerald-400 to-teal-500" },
};

export default function PrimaryLesson() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [stepIdx, setStepIdx] = useState(0);
  const [t0] = useState(Date.now());
  const [testScore, setTestScore] = useState<{ c: number; t: number } | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase.from("primary_lessons").select("*, unit:primary_units(grade,title_cn,emoji)").eq("id", id).maybeSingle()
      .then(({ data }) => { setLesson(data as any); setLoading(false); });
  }, [id]);

  const steps = lesson?.steps ?? [];
  const cur = steps[stepIdx];
  const isLast = stepIdx >= steps.length - 1;
  const finished = stepIdx >= steps.length;

  async function recordCompletion(score: number, accuracy: number) {
    const { data: u } = await supabase.auth.getUser();
    const uid = u?.user?.id;
    if (!uid || !lesson) return;
    const xp = Math.round(score * 0.5) + 20;
    const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.7 ? 2 : 1;
    await supabase.from("primary_lesson_progress").upsert({
      user_id: uid, lesson_id: lesson.id,
      steps_done: steps.length, total_steps: steps.length,
      accuracy, stars, xp_earned: xp,
      completed_at: new Date().toISOString(), last_seen_at: new Date().toISOString(),
    }, { onConflict: "user_id,lesson_id" });
    await supabase.from("learning_events").insert({
      user_id: uid, event_type: "lesson_complete",
      lesson_key: `primary_lesson_${lesson.id}`,
      quiz_correct: testScore?.c ?? 0, quiz_total: testScore?.t ?? 0,
      study_minutes: Math.max(1, Math.round((Date.now() - t0) / 60000)),
    });
  }

  if (loading) return <main className="grid min-h-screen place-items-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></main>;
  if (!lesson) return <main className="mx-auto max-w-3xl p-6"><p className="text-muted-foreground">课程不存在</p><Link to="/primary" className="text-sm text-primary">返回</Link></main>;

  const onStepDone = (info?: { correct: number; total: number }) => {
    if (cur?.type === "test" && info) setTestScore({ c: info.correct, t: info.total });
    if (isLast) {
      const acc = info ? info.correct / Math.max(1, info.total) : (testScore ? testScore.c / Math.max(1, testScore.t) : 1);
      const score = info ? Math.round(acc * 100) : 100;
      recordCompletion(score, acc);
    }
    setStepIdx(i => i + 1);
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6">
      <Link to={`/primary/grade/${lesson.unit?.grade ?? 1}`} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回
      </Link>
      <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        <span>{lesson.unit?.emoji} {lesson.unit?.title_cn}</span>
        <span>·</span>
        <span>G{lesson.unit?.grade}</span>
      </div>
      <h1 className="text-grad-title text-2xl font-extrabold md:text-3xl">{lesson.title_cn}</h1>
      {lesson.title_en && <p className="text-sm text-muted-foreground">{lesson.title_en}</p>}

      {/* Stepper */}
      <div className="my-5 flex items-center gap-1.5">
        {steps.map((s, i) => {
          const meta = STEP_META[s.type];
          const done = i < stepIdx;
          const active = i === stepIdx && !finished;
          return (
            <div key={i} className="flex flex-1 items-center gap-1.5">
              <div className={cn("flex h-8 flex-1 items-center justify-center gap-1 rounded-full text-[11px] font-extrabold transition",
                done && "bg-emerald-500 text-white",
                active && `bg-gradient-to-r ${meta.color} text-white shadow`,
                !done && !active && "bg-muted text-muted-foreground"
              )}>
                <meta.icon className="size-3.5" /> {meta.label}
              </div>
            </div>
          );
        })}
      </div>

      {finished ? (
        <FinishCard lesson={lesson} testScore={testScore} onBack={() => nav(`/primary/grade/${lesson.unit?.grade ?? 1}`)} />
      ) : cur?.type === "input"      ? <InputStep step={cur} onNext={() => onStepDone()} />
        : cur?.type === "understand" ? <UnderstandStep step={cur} onNext={() => onStepDone()} />
        : cur?.type === "practice"   ? <PracticeStep step={cur} onNext={(r) => onStepDone(r)} />
        : cur?.type === "output"     ? <OutputStep step={cur} onNext={() => onStepDone()} />
        : cur?.type === "test"       ? <TestStep step={cur} onNext={(r) => onStepDone(r)} />
        : null}
    </main>
  );
}

/* ---------- Step components ---------- */

function NextBtn({ onClick, label = "下一步 →" }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick}
      className="mt-5 w-full rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 py-4 text-base font-extrabold text-white shadow-tile transition hover:-translate-y-0.5">
      {label}
    </button>
  );
}

function InputStep({ step, onNext }: { step: Step; onNext: () => void }) {
  useEffect(() => {
    const items = step.items ?? [];
    if (items[0]?.word) speak(items[0].word);
  }, []);
  return (
    <section className="space-y-4">
      {step.intro && <p className="rounded-2xl bg-muted/40 p-3 text-sm">{step.intro}</p>}
      <div className="grid grid-cols-2 gap-3">
        {(step.items ?? []).map((it: any, i: number) => (
          <button key={i} onClick={() => speak(it.word)}
            className="flex flex-col items-center gap-1 rounded-3xl border-2 border-sky-200 bg-gradient-to-br from-white to-sky-50 p-5 shadow-tile transition hover:-translate-y-1">
            <div className="text-5xl">{it.emoji}</div>
            <div className="mt-1 flex items-center gap-1 text-2xl font-black">{it.word}<Volume2 className="size-4 text-sky-500" /></div>
            <div className="text-sm text-muted-foreground">{it.cn}</div>
          </button>
        ))}
      </div>
      <NextBtn onClick={onNext} />
    </section>
  );
}

function UnderstandStep({ step, onNext }: { step: Step; onNext: () => void }) {
  return (
    <section className="space-y-3">
      {(step.items ?? []).map((it: any, i: number) => (
        <button key={i} onClick={() => speak(it.en)}
          className="flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-white to-violet-50 p-4 text-left shadow-tile transition hover:-translate-y-0.5">
          <div>
            <div className="text-base font-extrabold">{it.en}</div>
            <div className="text-xs text-muted-foreground">{it.cn}</div>
          </div>
          <Volume2 className="size-5 text-violet-500" />
        </button>
      ))}
      <NextBtn onClick={onNext} />
    </section>
  );
}

function QuizRunner({ questions, accent, onDone, label }: {
  questions: { q: string; options: string[]; answer: number }[];
  accent: string; onDone: (r: { correct: number; total: number }) => void; label: string;
}) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState({ c: 0, t: 0 });
  const cur = questions[i];
  if (!cur) return null;

  const pick = (k: number) => {
    if (picked !== null) return;
    setPicked(k);
    const ok = k === cur.answer;
    const next = { c: score.c + (ok ? 1 : 0), t: score.t + 1 };
    setScore(next);
    if (/^[a-zA-Z ,.'!?-]+$/.test(cur.q)) speak(cur.q);
    setTimeout(() => {
      if (i + 1 >= questions.length) onDone({ correct: next.c, total: next.t });
      else { setI(i + 1); setPicked(null); }
    }, 700);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label} · {i + 1} / {questions.length}</span>
        <span>✅ {score.c}</span>
      </div>
      <div className={`rounded-3xl border-2 bg-gradient-to-br ${accent} p-6 text-center text-white shadow-tile`}>
        <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">看题作答</div>
        <div className="mt-2 text-3xl font-black">{cur.q}</div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {cur.options.map((o, k) => {
          const right = k === cur.answer;
          const showR = picked !== null && right;
          const showW = picked === k && !right;
          return (
            <button key={k} onClick={() => pick(k)} disabled={picked !== null}
              className={cn(
                "flex items-center justify-between rounded-2xl border-2 p-4 text-left text-sm font-bold transition",
                showR && "border-emerald-500 bg-emerald-50",
                showW && "border-rose-500 bg-rose-50",
                picked === null && "border-border bg-card hover:border-amber-300",
                picked !== null && !showR && !showW && "opacity-50"
              )}>
              <span>{o}</span>
              {showR && <Check className="size-5 text-emerald-600" />}
              {showW && <X className="size-5 text-rose-600" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function PracticeStep({ step, onNext }: { step: Step; onNext: (r: { correct: number; total: number }) => void }) {
  return <QuizRunner questions={step.questions ?? []} accent="from-amber-400 to-orange-500"
    onDone={(r) => onNext(r)} label="练习" />;
}

function TestStep({ step, onNext }: { step: Step; onNext: (r: { correct: number; total: number }) => void }) {
  return <QuizRunner questions={step.questions ?? []} accent="from-emerald-400 to-teal-500"
    onDone={(r) => onNext(r)} label="🏁 小测验" />;
}

function OutputStep({ step, onNext }: { step: Step; onNext: () => void }) {
  const items = step.items ?? [];
  const [i, setI] = useState(0);
  const [done, setDone] = useState<number[]>([]);
  const cur = items[i];
  if (!cur) { onNext(); return null; }
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>🎤 跟我说 · {i + 1} / {items.length}</span>
        <span>{done.length} ✓</span>
      </div>
      <div className="rounded-3xl border-2 border-pink-200 bg-gradient-to-br from-white to-pink-50 p-6 text-center shadow-tile">
        <div className="text-xs font-bold text-pink-600">{cur.prompt}</div>
        <div className="mt-3 text-2xl font-black">"{cur.say}"</div>
        <button onClick={() => speak(cur.say)}
          className="mx-auto mt-4 grid size-14 place-items-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg transition hover:scale-105">
          <Volume2 className="size-6" />
        </button>
        <p className="mt-3 text-[11px] text-muted-foreground">先听一听，然后大声跟读 ✨</p>
      </div>
      <button onClick={() => {
        const nd = [...done, i];
        setDone(nd);
        if (i + 1 >= items.length) onNext();
        else setI(i + 1);
      }} className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 py-4 text-base font-extrabold text-white shadow-tile">
        我说完啦 ✓
      </button>
    </section>
  );
}

function FinishCard({ lesson, testScore, onBack }: { lesson: Lesson; testScore: { c: number; t: number } | null; onBack: () => void }) {
  const acc = testScore ? testScore.c / Math.max(1, testScore.t) : 1;
  const stars = acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1;
  const pass = acc >= ((lesson.steps.find(s => s.type === "test")?.passScore ?? 70) / 100);
  return (
    <section className="rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-rose-50 to-violet-50 p-8 text-center shadow-tile">
      <Sparkles className="mx-auto size-12 text-amber-500" />
      <h2 className="mt-2 text-2xl font-extrabold">{pass ? "🎉 通关啦！" : "💪 继续加油！"}</h2>
      <div className="mt-3 text-3xl">
        {Array.from({ length: 3 }).map((_, i) => <span key={i}>{i < stars ? "⭐" : "☆"}</span>)}
      </div>
      {testScore && (
        <p className="mt-2 text-sm text-muted-foreground">
          测试答对 {testScore.c} / {testScore.t} · 准确率 {Math.round(acc * 100)}%
        </p>
      )}
      <div className="mt-4 inline-block rounded-full bg-gradient-to-r from-amber-400 to-rose-400 px-4 py-1.5 text-sm font-extrabold text-white">
        +{Math.round(acc * 100 * 0.5) + 20} XP · Spark 亲密度 +5
      </div>
      <button onClick={onBack}
        className="mx-auto mt-5 block rounded-2xl bg-gradient-to-r from-pink-500 to-amber-500 px-6 py-3 text-sm font-extrabold text-white shadow-tile">
        返回年级
      </button>
    </section>
  );
}