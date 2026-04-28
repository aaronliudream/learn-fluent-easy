import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Book,
  BookOpen,
  FileText,
  Headphones,
  HelpCircle,
  MessageCircle,
  Mic,
  Pencil,
  Star,
  Target,
  Volume2,
} from "lucide-react";
import { LESSON_STEPS, SAMPLE_VOCAB, findLesson } from "@/data/course";
import { PageHeader } from "@/components/PageHeader";

const STEP_ICONS = {
  BookOpen,
  Target,
  Book,
  FileText,
  MessageCircle,
  Pencil,
  HelpCircle,
  Headphones,
  Mic,
} as const;

const speak = (text: string) => {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
};

const Lesson = () => {
  const { levelId, unitId, lessonId } = useParams();
  const lesson = findLesson(Number(levelId), Number(unitId), Number(lessonId));
  const [activeStep, setActiveStep] = useState(1);

  if (!lesson) return <div className="p-10">课程不存在</div>;

  const vocab = SAMPLE_VOCAB[lesson.title] ?? SAMPLE_VOCAB["自我介绍"];

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader
        title={`Lesson ${lesson.id} · ${lesson.title}`}
        subtitle="跟随步骤完成本课学习"
        back={`/level/${levelId}/unit/${unitId}`}
      />

      {/* Steps card */}
      <section className="mb-8 rounded-3xl bg-card p-5 shadow-card md:p-7">
        <div className="mb-5 flex items-baseline gap-2">
          <h2 className="text-lg font-bold">学习步骤</h2>
          <span className="text-sm text-muted-foreground">· STEPS</span>
          <div className="ml-2 h-0.5 w-10 rounded bg-grad-title" />
        </div>

        <ul className="space-y-2">
          {LESSON_STEPS.map((s) => {
            const Icon = STEP_ICONS[s.icon as keyof typeof STEP_ICONS];
            const active = activeStep === s.id;
            return (
              <li key={s.id}>
                <button
                  onClick={() => setActiveStep(s.id)}
                  className={`flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left transition ${
                    active
                      ? "bg-grad-title text-white shadow-tile"
                      : "bg-secondary/40 text-foreground hover:bg-secondary"
                  }`}
                >
                  <div
                    className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold ${
                      active ? "bg-white/25 text-white" : "bg-card text-muted-foreground"
                    }`}
                  >
                    {s.id}
                  </div>
                  <div className="flex-1">
                    <div className={`font-bold ${active ? "text-white" : ""}`}>{s.cn}</div>
                    <div className={`text-xs ${active ? "text-white/85" : "text-muted-foreground"}`}>
                      {s.en}
                    </div>
                  </div>
                  <Icon className={`size-5 ${active ? "text-white/90" : "text-muted-foreground"}`} />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Active step content */}
      {activeStep === 1 && (
        <section className="rounded-3xl bg-card p-6 shadow-card md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-pink-500/15 text-pink-500">
              <Star className="size-6" fill="currentColor" />
            </div>
            <div>
              <h3 className="text-xl font-bold">词汇学习 Vocabulary</h3>
              <p className="text-sm text-muted-foreground">学习本课的核心词汇</p>
            </div>
          </div>

          <div className="space-y-4">
            {vocab.map((v, i) => (
              <article
                key={v.word}
                className="relative rounded-2xl border border-border bg-secondary/30 p-5 md:p-6"
              >
                <span className="absolute right-4 top-3 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  #{i + 1}
                </span>
                <div className="flex items-center gap-3">
                  <h4 className="text-2xl font-extrabold tracking-tight">{v.word}</h4>
                  <button
                    onClick={() => speak(v.word)}
                    className="grid size-8 place-items-center rounded-full text-primary transition hover:bg-primary/10"
                    aria-label="Play pronunciation"
                  >
                    <Volume2 className="size-5" />
                  </button>
                </div>
                <div className="mt-1 font-mono text-sm text-muted-foreground">{v.pron}</div>

                <div className="mt-4 rounded-xl bg-card p-4">
                  <div className="font-semibold">{v.meaning}</div>
                  <p className="mt-2 italic text-foreground/80">"{v.example}"</p>
                  <p className="mt-1 text-sm text-muted-foreground">{v.example_cn}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeStep !== 1 && (
        <section className="rounded-3xl bg-card p-10 text-center shadow-card">
          <div className="text-5xl">🚧</div>
          <h3 className="mt-4 text-lg font-bold">
            {LESSON_STEPS[activeStep - 1].cn} · {LESSON_STEPS[activeStep - 1].en}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">该步骤即将上线，敬请期待</p>
        </section>
      )}
    </main>
  );
};

export default Lesson;