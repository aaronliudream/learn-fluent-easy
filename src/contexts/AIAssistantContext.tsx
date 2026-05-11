import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Site-wide AI Assistant context.
 *
 * Pages call `useRegisterAssistant(...)` to declare:
 *  - what the AI may discuss (topic / question snapshot)
 *  - whether the assistant is currently UNLOCKED (no answer-leak risk)
 *  - what to tell the user when LOCKED (e.g. "做完本题后再问")
 *
 * If no page registers, the assistant defaults to a generic English-learning
 * helper (always unlocked, generic topic).
 */

export type AssistantMode = "free" | "per-question" | "full-test" | "concierge";

export interface AssistantState {
  /** Logical bucket — used as the persistence "context" key. */
  context: string;
  /** Stable id for the current question / test / page. */
  ref: string;
  /** What the AI may discuss. Free-mode just needs `topic`. */
  topic: string;
  /** Per-question / per-test snapshot (only sent to AI when unlocked). */
  snapshot?: Record<string, unknown>;
  mode: AssistantMode;
  /** True only when the user has finished the relevant question/test. */
  unlocked: boolean;
  /** Friendly Chinese hint shown when locked. */
  lockedHint?: string;
  /** Optional override for the drawer header. */
  pageTitle?: string;
  /** Optional context-specific starter questions (overrides defaults). */
  starters?: string[];
}

const DEFAULT_STATE: AssistantState = {
  context: "general",
  ref: "global",
  topic: "英语学习",
  mode: "free",
  unlocked: true,
  pageTitle: "AI 学习助手",
};

interface Ctx {
  state: AssistantState;
  setState: (next: AssistantState | null) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
}

const AIAssistantContext = createContext<Ctx | null>(null);

export function AIAssistantProvider({ children }: { children: ReactNode }) {
  const [registered, setRegistered] = useState<AssistantState | null>(null);
  const [open, setOpen] = useState(false);

  const setState = useCallback((next: AssistantState | null) => {
    setRegistered(next);
  }, []);

  const value = useMemo<Ctx>(
    () => ({ state: registered ?? DEFAULT_STATE, setState, open, setOpen }),
    [registered, setState, open],
  );

  return <AIAssistantContext.Provider value={value}>{children}</AIAssistantContext.Provider>;
}

export function useAIAssistant(): Ctx {
  const ctx = useContext(AIAssistantContext);
  if (!ctx) throw new Error("useAIAssistant must be used within AIAssistantProvider");
  return ctx;
}

/**
 * Hook for pages to declare their assistant state. Cleans up on unmount,
 * restoring the global default.
 *
 * Example:
 *   useRegisterAssistant({
 *     context: "subjunctive",
 *     ref: "lab",
 *     topic: "虚拟语气 (Subjunctive Mood)",
 *     mode: "free",
 *     unlocked: true,
 *   });
 */
export function useRegisterAssistant(state: AssistantState | null) {
  const ctx = useContext(AIAssistantContext);
  // Stable signature so we don't thrash on every render.
  const sig = state
    ? `${state.context}|${state.ref}|${state.mode}|${state.unlocked}|${state.topic}|${state.lockedHint ?? ""}|${state.pageTitle ?? ""}|${(state.starters ?? []).join("¦")}|${JSON.stringify(state.snapshot ?? {})}`
    : null;

  useEffect(() => {
    if (!ctx) return;
    ctx.setState(state);
    return () => ctx.setState(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);
}
