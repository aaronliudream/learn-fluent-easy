import { useEffect, useMemo, useRef, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, X, Volume2, Loader2, Trophy, Sparkles, Mic, MicOff, BookOpen, Eye, Pencil, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { speak } from "@/lib/speak";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
    // 课程完成宠物挂钩：星级 → 星币 (1★=5, 2★=10, 3★=20)
    try {
      const c = await import("@/lib/coins");
      const reward = stars === 3 ? 20 : stars === 2 ? 10 : 5;
      await c.awardCoins(reward, "primary_lesson_complete");
      c.petReact("happy", { coins: reward });
    } catch { /* noop */ }
  }

  if (loading) return <main className="grid min-h-screen place-items-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></main>;
  if (!lesson) return <main className="mx-auto max-w-3xl p-6"><p className="text-muted-foreground">课程不存在</p><BackLink to="/primary" className="text-sm text-primary">返回</BackLink></main>;

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
      <BackLink to={`/primary/grade/${lesson.unit?.grade ?? 1}`} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回
      </BackLink>
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
        : cur?.type === "output"     ? <OutputStep step={cur} grade={lesson.unit?.grade ?? 3} onNext={() => onStepDone()} />
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

function OutputStep({ step, grade, onNext }: { step: Step; grade?: number; onNext: () => void }) {
  const items = step.items ?? [];
  const [i, setI] = useState(0);
  const [done, setDone] = useState<number[]>([]);
  const g = grade ?? 3;
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
        <p className="mt-3 text-[11px] text-muted-foreground">先听一听，然后点下方麦克风跟读，AI 会打分 ✨</p>
      </div>

      <SpeakRecorder
        key={i}
        target={cur.say}
        grade={g}
        scenario={cur.prompt ?? ""}
        onPass={() => {
          const nd = [...done, i];
          setDone(nd);
          if (i + 1 >= items.length) onNext();
          else setI(i + 1);
        }}
        onSkip={() => {
          if (i + 1 >= items.length) onNext();
          else setI(i + 1);
        }}
      />
    </section>
  );
}

/**
 * SpeakRecorder — kid-friendly mic recorder.
 * Records up to 6s, calls primary-speaking-grade, shows score + encouragement.
 * Auto-passes (calls onPass) if score >= 60 after a short delay.
 */
function SpeakRecorder({ target, grade, scenario, onPass, onSkip }:
  { target: string; grade: number; scenario: string; onPass: () => void; onSkip: () => void }) {
  const [phase, setPhase] = useState<"idle" | "recording" | "scoring" | "done">("idle");
  const [result, setResult] = useState<{ overall_score: number; encouragement: string; transcript: string; corrections?: { word: string; tip_cn: string }[] } | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const stopTimerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);

  function cleanup() {
    try { recRef.current?.state !== "inactive" && recRef.current?.stop(); } catch { /* noop */ }
    try { streamRef.current?.getTracks().forEach(t => t.stop()); } catch { /* noop */ }
    if (stopTimerRef.current) { window.clearTimeout(stopTimerRef.current); stopTimerRef.current = null; }
  }
  useEffect(() => () => cleanup(), []);

  async function startRec() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      streamRef.current = stream;
      const rec = new MediaRecorder(stream, { mimeType: "audio/webm" });
      recRef.current = rec;
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        const dur = Date.now() - startedAtRef.current;
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        cleanup();
        if (blob.size < 800 || dur < 400) {
          toast.error("没听清楚，再说一次哦 🎤");
          setPhase("idle");
          return;
        }
        setPhase("scoring");
        try {
          const buf = await blob.arrayBuffer();
          let bin = "";
          const bytes = new Uint8Array(buf);
          for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
          const audio_base64 = btoa(bin);
          const { data, error } = await supabase.functions.invoke("primary-speaking-grade", {
            body: { target, audio_base64, mime: "audio/webm", grade, scenario, audio_duration_ms: dur },
          });
          if (error) throw error;
          setResult(data as any);
          setPhase("done");
          // Auto-advance on good score
          if ((data as any)?.overall_score >= 60) {
            window.setTimeout(() => onPass(), 1800);
          }
        } catch (e: any) {
          console.error("speak grade failed", e);
          toast.error("打分失败，可以跳过哦");
          setPhase("idle");
        }
      };
      startedAtRef.current = Date.now();
      rec.start();
      setPhase("recording");
      // Auto-stop at 6s
      stopTimerRef.current = window.setTimeout(() => {
        if (recRef.current?.state === "recording") recRef.current.stop();
      }, 6000);
    } catch (e) {
      console.error("mic err", e);
      toast.error("麦克风权限被拒绝了，请允许一下 🎙️");
      setPhase("idle");
    }
  }

  function stopNow() {
    if (recRef.current?.state === "recording") recRef.current.stop();
  }

  if (phase === "done" && result) {
    const s = result.overall_score | 0;
    const tone = s >= 85 ? "from-emerald-500 to-teal-500" : s >= 60 ? "from-amber-500 to-orange-500" : "from-rose-500 to-pink-500";
    const stars = s >= 85 ? 3 : s >= 60 ? 2 : 1;
    return (
      <div className="space-y-3">
        <div className={`rounded-2xl bg-gradient-to-br ${tone} p-4 text-white shadow-tile`}>
          <div className="flex items-center justify-between">
            <div className="text-lg font-black">{s} 分</div>
            <div className="text-lg">{Array.from({ length: 3 }).map((_, k) => (<span key={k}>{k < stars ? "⭐" : "☆"}</span>))}</div>
          </div>
          <div className="mt-1 text-sm font-bold">{result.encouragement}</div>
          {result.transcript && <div className="mt-1 text-[11px] opacity-90">你说的：{result.transcript}</div>}
          {result.corrections && result.corrections.length > 0 && (
            <div className="mt-2 space-y-1">
              {result.corrections.map((c, k) => (
                <div key={k} className="text-[11px] opacity-90">💡 <b>{c.word}</b> · {c.tip_cn}</div>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => { setResult(null); setPhase("idle"); }} className="rounded-2xl border-2 border-pink-200 bg-white py-3 text-sm font-extrabold text-pink-600">再录一次</button>
          <button onClick={onPass} className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 py-3 text-sm font-extrabold text-white shadow-tile">下一句 →</button>
        </div>
      </div>
    );
  }

  if (phase === "scoring") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border-2 border-pink-200 bg-pink-50 py-4 text-sm font-bold text-pink-600">
        <Loader2 className="size-4 animate-spin" /> Spark 正在听你说…
      </div>
    );
  }

  if (phase === "recording") {
    return (
      <div className="space-y-2">
        <button onClick={stopNow}
          className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 py-4 text-base font-extrabold text-white shadow-tile animate-pulse">
          <span className="inline-flex items-center gap-2"><MicOff className="size-5" /> 录音中…点击结束（自动 6 秒）</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <button onClick={onSkip} className="col-span-1 rounded-2xl border-2 border-muted bg-card py-3 text-xs font-bold text-muted-foreground">跳过</button>
      <button onClick={startRec}
        className="col-span-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 py-4 text-base font-extrabold text-white shadow-tile">
        <span className="inline-flex items-center gap-2"><Mic className="size-5" /> 点我说一遍</span>
      </button>
    </div>
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