import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { findUnit } from "./courseData";
import { getUnitProgress, shouldTriggerUnitAITest } from "./progress";
import {
  getUnitState,
  loadPersist,
  registerJuniorHubCloudSync,
  savePersist,
} from "./storage";
import {
  cancelJuniorHubCloudPush,
  flushJuniorHubCloudPush,
  hydrateJuniorHubFromCloud,
  scheduleJuniorHubCloudPush,
} from "./hubCloudSync";
import type { JuniorHubGrade, JuniorHubPersist, Mistake } from "./types";

type Ctx = {
  grade: JuniorHubGrade;
  state: JuniorHubPersist;
  setState: React.Dispatch<React.SetStateAction<JuniorHubPersist>>;
  persist: () => void;
  addMistake: (m: Omit<Mistake, "id" | "date">) => void;
  completeStage: (unitId: string, stageIdx: number) => boolean;
};

const JuniorHubContext = createContext<Ctx | null>(null);

export function JuniorHubProvider({ grade, children }: { grade: JuniorHubGrade; children: ReactNode }) {
  const [state, setState] = useState<JuniorHubPersist>(() => loadPersist(grade));
  const userIdRef = useRef<string | null>(null);

  // Bridge: any savePersist (from any call site) schedules a debounced cloud
  // push when signed in. Registered for this grade's provider lifetime.
  useEffect(() => {
    registerJuniorHubCloudSync((g, s) => {
      if (userIdRef.current && g === grade) {
        scheduleJuniorHubCloudPush(userIdRef.current, g, s);
      }
    });
    return () => registerJuniorHubCloudSync(null);
  }, [grade]);

  // Cloud hydrate: on sign-in pull cloud + union-merge with local (auto-merge,
  // no prompt); on sign-out flush pending push and fall back to local only.
  useEffect(() => {
    let cancelled = false;

    const hydrate = async (userId: string | null) => {
      const prevUserId = userIdRef.current;
      userIdRef.current = userId;

      if (!userId) {
        cancelJuniorHubCloudPush();
        setState(loadPersist(grade));
        return;
      }

      if (prevUserId !== userId) setState(loadPersist(grade));

      try {
        const merged = await hydrateJuniorHubFromCloud(userId, grade);
        if (!cancelled) setState(merged);
      } catch (err) {
        console.warn("[juniorHub cloud] hydrate failed", err);
      }
    };

    void supabase.auth.getSession().then(({ data: { session } }) => {
      void hydrate(session?.user?.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        void flushJuniorHubCloudPush().finally(() => hydrate(null));
        return;
      }
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        void flushJuniorHubCloudPush().finally(() => hydrate(session?.user?.id ?? null));
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      void flushJuniorHubCloudPush();
    };
  }, [grade]);

  const persist = useCallback(() => {
    savePersist(grade, state);
  }, [grade, state]);

  const addMistake = useCallback(
    (m: Omit<Mistake, "id" | "date">) => {
      setState((prev) => {
        const unit = findUnit(m.unitId ?? prev.currentUnit);
        const next: JuniorHubPersist = {
          ...prev,
          mistakes: [
            {
              ...m,
              unitId: m.unitId ?? prev.currentUnit,
              unitTitle: m.unitTitle ?? unit?.title ?? "",
              date: new Date().toISOString().slice(0, 10),
              id: Date.now() + Math.random(),
            },
            ...prev.mistakes,
          ].slice(0, 150),
        };
        savePersist(grade, next);
        return next;
      });
    },
    [grade],
  );

  const completeStage = useCallback(
    (unitId: string, stageIdx: number) => {
      let needAi = false;
      setState((prev) => {
        const unit = findUnit(unitId);
        if (!unit) return prev;
        const us = getUnitState(prev, unitId);
        const completed = [...us.completedStages];
        if (!completed.includes(stageIdx)) {
          completed.push(stageIdx);
          us.completedStages = completed;
          us.stars += 5;
        }
        if (completed.length === unit.stages.length && !us.firstCompleteDate) {
          us.firstCompleteDate = new Date().toISOString().slice(0, 10);
        }
        const next = {
          ...prev,
          units: { ...prev.units, [unitId]: { ...us } },
        };
        needAi = shouldTriggerUnitAITest(next, unitId);
        savePersist(grade, next);
        return next;
      });
      return needAi;
    },
    [grade],
  );

  const value = useMemo(
    () => ({ grade, state, setState, persist, addMistake, completeStage }),
    [grade, state, persist, addMistake, completeStage],
  );

  return <JuniorHubContext.Provider value={value}>{children}</JuniorHubContext.Provider>;
}

export function useJuniorHub() {
  const ctx = useContext(JuniorHubContext);
  if (!ctx) throw new Error("useJuniorHub must be used within JuniorHubProvider");
  return ctx;
}

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
