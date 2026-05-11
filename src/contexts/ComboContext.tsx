import { createContext, useCallback, useContext, useRef, type ReactNode } from "react";
import { toast } from "sonner";
import { playSfx } from "@/lib/soundEffects";

type Ctx = {
  /** Bump streak: correct extends, wrong resets. Triggers toast at 3/5/6. */
  bump: (correct: boolean) => void;
  reset: () => void;
};

const ComboCtx = createContext<Ctx | null>(null);

export function ComboProvider({ children }: { children: ReactNode }) {
  const streakRef = useRef(0);

  const bump = useCallback((correct: boolean) => {
    if (!correct) {
      streakRef.current = 0;
      playSfx("wrong");
      return;
    }
    playSfx("correct");
    streakRef.current += 1;
    const n = streakRef.current;
    if (n === 3) toast("🔥 3 连击!", { duration: 1400 });
    else if (n === 5) toast("🔥🔥 完美连击!", { duration: 1500 });
    else if (n === 6) toast("🔥🔥🔥 神级连击!", { duration: 1800 });
    else if (n > 6 && n % 3 === 0) toast(`🔥 ${n} 连击!`, { duration: 1200 });
  }, []);

  const reset = useCallback(() => { streakRef.current = 0; }, []);

  return <ComboCtx.Provider value={{ bump, reset }}>{children}</ComboCtx.Provider>;
}

/** Safe outside provider — no-op. */
export function useCombo(): Ctx {
  return useContext(ComboCtx) ?? { bump: () => {}, reset: () => {} };
}