import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Exam-paper themed wrapper. Establishes the ivory/朱红/金 design tokens
 * scoped to its subtree via the `.exam-paper` class declared in index.css.
 * Use for reading-practice pages (Junior / Gaokao reading).
 */
export function ExamPaper({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main className={cn("exam-paper min-h-screen", className)}>
      {children}
    </main>
  );
}

export function ExamContainer({ children, className, max = "7xl" }: { children: ReactNode; className?: string; max?: "3xl" | "5xl" | "7xl" }) {
  const w = max === "3xl" ? "max-w-3xl" : max === "5xl" ? "max-w-5xl" : "max-w-7xl";
  return <div className={cn("mx-auto px-4 sm:px-6 py-6 sm:py-8", w, className)}>{children}</div>;
}

export function ExamCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("exam-card p-5 sm:p-6", className)}>{children}</div>;
}

export function ExamProgress({ states, label }: {
  /** one entry per question: 'todo' | 'current' | 'correct' | 'wrong' | 'answered' */
  states: ("todo" | "current" | "correct" | "wrong" | "answered")[];
  label?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1.5">
        {states.map((s, i) => (
          <span
            key={i}
            className={cn(
              "exam-dot",
              s === "current" && "exam-dot-current",
              s === "correct" && "exam-dot-correct",
              s === "wrong" && "exam-dot-wrong",
              s === "answered" && "exam-dot-current"
            )}
          />
        ))}
      </div>
      {label && <span className="text-[12px] exam-mute font-medium">{label}</span>}
    </div>
  );
}

/** Single A/B/C/D option button styled as exam paper. */
export function ExamOption({
  letter, text, state, onClick, disabled,
}: {
  letter: "A" | "B" | "C" | "D";
  text: string;
  state?: "idle" | "selected" | "correct" | "wrong" | "dim";
  onClick?: () => void;
  disabled?: boolean;
}) {
  const cls = cn(
    "exam-option",
    state === "selected" && "exam-option-selected",
    state === "correct" && "exam-option-correct",
    state === "wrong" && "exam-option-wrong",
    state === "dim" && "exam-option-dim"
  );
  return (
    <button type="button" className={cls} onClick={onClick} disabled={disabled}>
      <span className="exam-option-letter">{letter}</span>
      <span className="flex-1">{text}</span>
    </button>
  );
}