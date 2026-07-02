import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Check, ArrowRight, Globe2, Briefcase, Plane, GraduationCap, Sparkles,
  Clock, BookOpen, Coffee, Mic, Music, Film, Plane as PlaneIcon, Flame,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { toast } from "sonner";

/**
 * Duolingo-style 3-step onboarding shown the first time a logged-in user
 * lands on the home page (when `profiles.onboarded_at` is null).
 *
 *   1. Goal + interest scenes (combined)        -> learning_goal
 *   2. Self-assessed level + 1 placement check  -> self_level
 *   3. Daily commitment (3 / 5 / 10 / 15 min)   -> daily_goal_minutes
 *
 * Pet/buddy is auto-assigned (default: Sprout) so users land in the product
 * faster. They can rename / swap later in /pets.
 */

type Goal = "travel" | "career" | "exam" | "general";
type Level = "beginner" | "intermediate" | "advanced";

const GOALS: { id: Goal; icon: typeof Globe2; titleEn: string; descEn: string; route: string }[] = [
  { id: "travel",  icon: Plane,        titleEn: "Travel & life",      descEn: "Talk to people, order food, get around.", route: "/american" },
  { id: "career",  icon: Briefcase,    titleEn: "Work & career",      descEn: "Meetings, emails, interviews.",            route: "/american" },
  { id: "exam",    icon: GraduationCap, titleEn: "Exam prep",         descEn: "Gaokao, IELTS, school tests.",             route: "/china" },
  { id: "general", icon: Sparkles,     titleEn: "Just get fluent",    descEn: "Build a strong, balanced foundation.",      route: "/american" },
];

const LEVELS: { id: Level; titleEn: string; descEn: string }[] = [
  { id: "beginner",     titleEn: "Beginner",     descEn: "I know a few words and basic sentences." },
  { id: "intermediate", titleEn: "Intermediate", descEn: "I can hold a simple conversation." },
  { id: "advanced",     titleEn: "Advanced",     descEn: "I'm fluent and want to refine." },
];

const MINUTES = [5, 10, 15, 30];
const COMMIT_MINUTES = [3, 5, 10, 15];

const SCENES = [
  { id: "smalltalk", icon: Coffee,   labelEn: "Small talk" },
  { id: "travel",    icon: PlaneIcon, labelEn: "Travel" },
  { id: "work",      icon: Briefcase, labelEn: "Work & meetings" },
  { id: "movies",    icon: Film,     labelEn: "Movies & TV" },
  { id: "music",     icon: Music,    labelEn: "Music & lyrics" },
  { id: "exams",     icon: GraduationCap, labelEn: "Exams" },
];

// Tiny placement check (one quick question per level option).
const PLACEMENT_QUIZ: Record<Level, { q: string; options: string[]; correctIdx: number }> = {
  beginner: {
    q: "Pick the correct sentence:",
    options: ["She go to school.", "She goes to school.", "She going school."],
    correctIdx: 1,
  },
  intermediate: {
    q: "If I _____ more time, I would travel.",
    options: ["have", "had", "will have"],
    correctIdx: 1,
  },
  advanced: {
    q: "Choose the most natural reply: \"Sorry I'm late!\"",
    options: ["No worries.", "It does not be a problem.", "Don't think anything."],
    correctIdx: 0,
  },
};

export default function OnboardingWizard({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [scenes, setScenes] = useState<string[]>([]);
  const [level, setLevel] = useState<Level | null>(null);
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);
  const [minutes, setMinutes] = useState<number>(5);
  const [saving, setSaving] = useState(false);

  const totalSteps = 3;
  const progress = ((step + 1) / totalSteps) * 100;

  const canNext =
    (step === 0 && !!goal && scenes.length > 0) ||
    (step === 1 && !!level && quizAnswered !== null) ||
    (step === 2 && minutes > 0);

  function toggleScene(id: string) {
    setScenes((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function finish() {
    if (!goal || !level) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          preferred_language: lang,
          learning_goal: goal,
          self_level: level,
          daily_goal_minutes: minutes,
          onboarded_at: new Date().toISOString(),
        } as never)
        .eq("user_id", userId);
      if (error) throw error;
      toast.success("You're all set — let's start learning!");
      onClose();
      // Stay on home so users land directly on their personalized plan.
      navigate("/");
    } catch (e) {
      console.error(e);
      toast.error("Could not save your preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={() => { /* locked until finished */ }}>
      <DialogContent
        className="max-w-xl w-[calc(100vw-1rem)] max-h-[92vh] overflow-y-auto p-5 sm:p-7"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Step {step + 1} of {totalSteps}
          </span>
          <span className="text-xs font-bold text-primary">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="mb-6 h-1.5" />

        {/* STEP 1 — Goal + interest scenes (combined) */}
        {step === 0 && (
          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <Sparkles className="size-3.5" /> Goal
            </div>
            <h2 className="text-2xl font-extrabold leading-tight">Why are you learning English?</h2>
            <p className="mb-5 mt-1 text-sm text-muted-foreground">
              We'll personalize your daily plan around this.
            </p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {GOALS
                .filter((g) => g.id !== "exam" || lang === "zh" || lang === "zh-TW")
                .map((g) => {
                const Icon = g.icon;
                const sel = goal === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id)}
                    className={
                      "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition " +
                      (sel
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-secondary")
                    }
                  >
                    <div className={"grid size-10 shrink-0 place-items-center rounded-xl " + (sel ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground")}>
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-extrabold">{g.titleEn}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{g.descEn}</div>
                    </div>
                    {sel && <Check className="size-4 text-primary" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-7">
              <h3 className="text-base font-extrabold">What do you want to talk about?</h3>
              <p className="mb-3 mt-1 text-xs text-muted-foreground">
                Pick at least one — we'll fill your lessons with these topics.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {SCENES.map((s) => {
                  const sel = scenes.includes(s.id);
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleScene(s.id)}
                      className={
                        "flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left text-sm transition " +
                        (sel ? "border-primary bg-primary/5" : "border-border hover:bg-secondary")
                      }
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="flex-1 text-xs font-semibold">{s.labelEn}</span>
                      {sel && <Check className="size-3.5 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — Self-rated level + 1 placement check */}
        {step === 1 && (
          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <BookOpen className="size-3.5" /> Level
            </div>
            <h2 className="text-2xl font-extrabold leading-tight">How would you rate your English?</h2>
            <p className="mb-5 mt-1 text-sm text-muted-foreground">
              Pick a level, then answer one quick question to confirm.
            </p>
            <div className="flex flex-col gap-2.5">
              {LEVELS.map((lv) => {
                const sel = level === lv.id;
                return (
                  <button
                    key={lv.id}
                    type="button"
                    onClick={() => { setLevel(lv.id); setQuizAnswered(null); }}
                    className={
                      "flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition " +
                      (sel
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-secondary")
                    }
                  >
                    <div className="flex-1">
                      <div className="text-base font-extrabold">{lv.titleEn}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{lv.descEn}</div>
                    </div>
                    {sel && <Check className="size-5 text-primary" />}
                  </button>
                );
              })}
            </div>

            {level && (
              <div className="mt-6 rounded-2xl border-2 border-primary/30 bg-primary/5 p-4">
                <div className="mb-3 text-sm font-extrabold">{PLACEMENT_QUIZ[level].q}</div>
                <div className="flex flex-col gap-2">
                  {PLACEMENT_QUIZ[level].options.map((opt, i) => {
                    const sel = quizAnswered === i;
                    const correct = i === PLACEMENT_QUIZ[level].correctIdx;
                    const showResult = quizAnswered !== null;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setQuizAnswered(i)}
                        disabled={quizAnswered !== null}
                        className={
                          "rounded-xl border-2 px-3 py-2.5 text-left text-sm transition " +
                          (showResult
                            ? correct
                              ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                              : sel
                                ? "border-rose-400 bg-rose-50 text-rose-900"
                                : "border-border opacity-60"
                            : "border-border hover:bg-white")
                        }
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {quizAnswered !== null && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    {quizAnswered === PLACEMENT_QUIZ[level].correctIdx
                      ? "Nice! Looks like a good match."
                      : "No worries — we'll start a touch easier and ramp up."}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 3 — Daily commitment */}
        {step === 2 && (
          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <Clock className="size-3.5" /> Daily commitment
            </div>
            <h2 className="text-2xl font-extrabold leading-tight">How many minutes a day?</h2>
            <p className="mb-5 mt-1 text-sm text-muted-foreground">
              Tiny is fine. Streaks form fastest at 3–5 minutes.
            </p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {COMMIT_MINUTES.map((m) => {
                const sel = minutes === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMinutes(m)}
                    className={
                      "flex flex-col items-center gap-1 rounded-2xl border-2 p-4 text-center transition " +
                      (sel ? "border-primary bg-primary/5" : "border-border hover:bg-secondary")
                    }
                  >
                    <div className="text-2xl font-extrabold">{m}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      min / day
                    </div>
                    {m === 5 && (
                      <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                        <Flame className="size-3" /> Most popular
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4 — Pick pet + first micro-lesson teaser */}
        <div className="mt-7 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || saving}
          >
            Back
          </Button>
          {step < totalSteps - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext}
              size="lg"
              className="min-w-[140px]"
            >
              Continue <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={finish}
              disabled={!canNext || saving}
              size="lg"
              className="min-w-[160px]"
            >
              {saving ? "Saving…" : "Start my first lesson"} <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}