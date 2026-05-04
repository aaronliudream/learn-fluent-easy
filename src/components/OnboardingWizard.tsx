import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Check, ArrowRight, Globe2, Briefcase, Plane, GraduationCap, Sparkles, Clock, BookOpen } from "lucide-react";
import { LANGUAGES, type LangCode } from "@/i18n/languages";
import { useI18n } from "@/i18n/I18nProvider";
import { toast } from "sonner";

/**
 * 4-step onboarding wizard shown the first time a logged-in user lands on
 * the home page (when `profiles.onboarded_at` is null).
 *
 *   1. Native language     -> profiles.preferred_language
 *   2. Why English?         -> profiles.learning_goal
 *   3. Self-assessed level  -> profiles.self_level
 *   4. Daily goal minutes   -> profiles.daily_goal_minutes
 *
 * On finish, we navigate the user straight to the path that matches their
 * goal so they immediately see the right content (no second click).
 */

type Goal = "travel" | "career" | "exam" | "general";
type Level = "beginner" | "intermediate" | "advanced";

const GOALS: { id: Goal; icon: typeof Globe2; titleEn: string; descEn: string; route: string }[] = [
  { id: "travel",  icon: Plane,        titleEn: "Travel & life",      descEn: "Talk to people, order food, get around.", route: "/scenes" },
  { id: "career",  icon: Briefcase,    titleEn: "Work & career",      descEn: "Meetings, emails, interviews.",            route: "/workplace" },
  { id: "exam",    icon: GraduationCap, titleEn: "Exam prep",         descEn: "Gaokao, IELTS, school tests.",             route: "/china" },
  { id: "general", icon: Sparkles,     titleEn: "Just get fluent",    descEn: "Build a strong, balanced foundation.",      route: "/levels" },
];

const LEVELS: { id: Level; titleEn: string; descEn: string }[] = [
  { id: "beginner",     titleEn: "Beginner",     descEn: "I know a few words and basic sentences." },
  { id: "intermediate", titleEn: "Intermediate", descEn: "I can hold a simple conversation." },
  { id: "advanced",     titleEn: "Advanced",     descEn: "I'm fluent and want to refine." },
];

const MINUTES = [5, 10, 15, 30];

export default function OnboardingWizard({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const { lang, setLang } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [native, setNative] = useState<LangCode>(lang);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [minutes, setMinutes] = useState<number>(15);
  const [saving, setSaving] = useState(false);

  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;

  // Pre-sort languages: keep current selection first then English then alpha
  const sortedLangs = useMemo(() => {
    return [...LANGUAGES].sort((a, b) => {
      if (a.code === native) return -1;
      if (b.code === native) return 1;
      if (a.code === "en") return -1;
      if (b.code === "en") return 1;
      return a.nativeName.localeCompare(b.nativeName);
    });
  }, [native]);

  const canNext =
    (step === 0 && !!native) ||
    (step === 1 && !!goal) ||
    (step === 2 && !!level) ||
    (step === 3 && minutes > 0);

  async function finish() {
    if (!goal || !level) return;
    setSaving(true);
    try {
      // Persist UI language pref locally + server side
      setLang(native);
      const { error } = await supabase
        .from("profiles")
        .update({
          preferred_language: native,
          learning_goal: goal,
          self_level: level,
          daily_goal_minutes: minutes,
          onboarded_at: new Date().toISOString(),
        } as never)
        .eq("user_id", userId);
      if (error) throw error;
      toast.success("All set! Let's start.");
      onClose();
      const target = GOALS.find((g) => g.id === goal)?.route ?? "/levels";
      navigate(target);
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

        {step === 0 && (
          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <Globe2 className="size-3.5" /> Welcome
            </div>
            <h2 className="text-2xl font-extrabold leading-tight">What's your native language?</h2>
            <p className="mb-5 mt-1 text-sm text-muted-foreground">
              We'll translate hints and instructions to make learning easier.
            </p>
            <div className="grid max-h-[40vh] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
              {sortedLangs.map((l) => {
                const sel = l.code === native;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setNative(l.code)}
                    className={
                      "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition " +
                      (sel
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                        : "border-border hover:bg-secondary")
                    }
                  >
                    <span className="text-xl leading-none">{l.flag}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block truncate text-sm font-semibold">{l.nativeName}</span>
                    </span>
                    {sel && <Check className="size-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <Sparkles className="size-3.5" /> Goal
            </div>
            <h2 className="text-2xl font-extrabold leading-tight">Why are you learning English?</h2>
            <p className="mb-5 mt-1 text-sm text-muted-foreground">
              We'll personalize your daily plan around this.
            </p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {GOALS.map((g) => {
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
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <BookOpen className="size-3.5" /> Level
            </div>
            <h2 className="text-2xl font-extrabold leading-tight">How would you rate your English?</h2>
            <p className="mb-5 mt-1 text-sm text-muted-foreground">
              No pressure — you can take a free 3-min placement test later.
            </p>
            <div className="flex flex-col gap-2.5">
              {LEVELS.map((lv) => {
                const sel = level === lv.id;
                return (
                  <button
                    key={lv.id}
                    type="button"
                    onClick={() => setLevel(lv.id)}
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
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <Clock className="size-3.5" /> Daily goal
            </div>
            <h2 className="text-2xl font-extrabold leading-tight">How many minutes a day?</h2>
            <p className="mb-5 mt-1 text-sm text-muted-foreground">
              We'll size your daily tasks to fit. Start small — you can change this anytime.
            </p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {MINUTES.map((m) => {
                const sel = minutes === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMinutes(m)}
                    className={
                      "rounded-2xl border-2 p-4 text-center transition " +
                      (sel ? "border-primary bg-primary/5" : "border-border hover:bg-secondary")
                    }
                  >
                    <div className="text-2xl font-extrabold">{m}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      min / day
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

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
              {saving ? "Saving…" : "Start learning"} <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}