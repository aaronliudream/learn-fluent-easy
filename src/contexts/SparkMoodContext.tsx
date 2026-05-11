import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import type { SparkMood } from "@/data/sparkMoods";

type Ctx = {
  mood: SparkMood;
  /** Set mood for `ms` then return to `default` (or stay if ms=0). */
  setMood: (mood: SparkMood, ms?: number) => void;
};

const SparkMoodCtx = createContext<Ctx | null>(null);

export function SparkMoodProvider({ children, initial = "default" }: { children: ReactNode; initial?: SparkMood }) {
  const [mood, setMoodState] = useState<SparkMood>(initial);
  const timerRef = useRef<number | null>(null);
  const setMood = useCallback((m: SparkMood, ms = 0) => {
    if (timerRef.current) { window.clearTimeout(timerRef.current); timerRef.current = null; }
    setMoodState(m);
    if (ms > 0) {
      timerRef.current = window.setTimeout(() => setMoodState("default"), ms);
    }
  }, []);
  return <SparkMoodCtx.Provider value={{ mood, setMood }}>{children}</SparkMoodCtx.Provider>;
}

/** Safe to call outside a provider — returns no-op. */
export function useSparkMood(): Ctx {
  return useContext(SparkMoodCtx) ?? { mood: "default", setMood: () => {} };
}