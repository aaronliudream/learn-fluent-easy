import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * 4 步阅读流程胶囊导航：①准备 ②测试 ③诊断 ④对话
 * sticky 在视口底部居中。已完成的步骤可点击回跳。
 */

export type ExamStep = "prepare" | "test" | "diagnosis" | "dialogue";

const STEPS: { id: ExamStep; label: string; idx: string }[] = [
  { id: "prepare", label: "准备", idx: "①" },
  { id: "test", label: "测试", idx: "②" },
  { id: "diagnosis", label: "诊断", idx: "③" },
  { id: "dialogue", label: "对话", idx: "④" },
];

export function ExamStepper({
  current,
  reachable,
  onJump,
  trailing,
}: {
  current: ExamStep;
  /** Steps that are reachable (clickable). */
  reachable: ExamStep[];
  onJump?: (step: ExamStep) => void;
  trailing?: ReactNode;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="pointer-events-auto exam-paper">
        <div
          className="flex items-center gap-1 rounded-full border px-1.5 py-1 shadow-lg"
          style={{
            background: "hsl(var(--exam-ink))",
            borderColor: "hsl(var(--exam-ink))",
          }}
        >
          {STEPS.map((s) => {
            const active = s.id === current;
            const can = reachable.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                disabled={!can}
                onClick={() => can && onJump?.(s.id)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium transition exam-ui",
                  active
                    ? "bg-[hsl(var(--exam-paper))] text-[hsl(var(--exam-ink))] shadow"
                    : can
                      ? "text-white/85 hover:text-white"
                      : "text-white/40 cursor-not-allowed"
                )}
              >
                <span className="opacity-80">{s.idx}</span>
                <span>{s.label}</span>
              </button>
            );
          })}
          {trailing}
        </div>
      </div>
    </div>
  );
}

export default ExamStepper;