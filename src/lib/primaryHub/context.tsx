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
import {
  cancelPrimaryHubCloudPush,
  flushPrimaryHubCloudPush,
  hydratePrimaryHubFromCloud,
  schedulePrimaryHubCloudPush,
} from "./hubCloudSync";
import { getUnitState, loadPersist, registerPrimaryHubCloudSync, savePersist } from "./storage";
import type { Mistake, PrimaryHubGrade, PrimaryHubPersist } from "./types";
import { findUnit } from "./courseData";
import { getTotalCompletedStages } from "./progress";
import { getCompletableStageIndices } from "./stageCompletable";

type Ctx = {
  grade: PrimaryHubGrade;
  state: PrimaryHubPersist;
  setState: React.Dispatch<React.SetStateAction<PrimaryHubPersist>>;
  cloudHydrating: boolean;
  persist: () => void;
  addMistake: (m: Omit<Mistake, "id" | "date">) => void;
  completeStage: (unitId: string, stageIdx: number) => boolean;
  updateStageProgress: (unitId: string, stageIdx: number, percent: number) => void;
  updateVocabViewed: (unitId: string, viewedIndices: number[]) => void;
};

const PrimaryHubContext = createContext<Ctx | null>(null);

export function PrimaryHubProvider({
  grade,
  children,
}: {
  grade: PrimaryHubGrade;
  children: ReactNode;
}) {
  const [state, setState] = useState<PrimaryHubPersist>(() => loadPersist(grade));
  const [cloudHydrating, setCloudHydrating] = useState(false);
  const userIdRef = useRef<string | null>(null);

  const commit = useCallback((next: PrimaryHubPersist) => {
    savePersist(grade, next);
    return next;
  }, [grade]);

  useEffect(() => {
    registerPrimaryHubCloudSync((g, s) => {
      if (userIdRef.current && g === grade) {
        schedulePrimaryHubCloudPush(userIdRef.current, g, s);
      }
    });
    return () => registerPrimaryHubCloudSync(null);
  }, [grade]);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async (userId: string | null) => {
      userIdRef.current = userId;
      if (!userId) {
        cancelPrimaryHubCloudPush();
        setState(loadPersist(grade));
        setCloudHydrating(false);
        return;
      }
      setCloudHydrating(true);
      try {
        const merged = await hydratePrimaryHubFromCloud(userId, grade);
        if (!cancelled) setState(merged);
      } finally {
        if (!cancelled) setCloudHydrating(false);
      }
    };

    void supabase.auth.getSession().then(({ data: { session } }) => {
      void hydrate(session?.user?.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        void flushPrimaryHubCloudPush().finally(() => hydrate(null));
        return;
      }
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        void flushPrimaryHubCloudPush().finally(() => hydrate(session?.user?.id ?? null));
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      void flushPrimaryHubCloudPush();
    };
  }, [grade]);

  const persist = useCallback(() => {
    savePersist(grade, state);
  }, [grade, state]);

  const addMistake = useCallback(
    (m: Omit<Mistake, "id" | "date">) => {
      setState((prev) => {
        const unit = findUnit(m.unitId ?? prev.currentUnit);
        const next: PrimaryHubPersist = {
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
          ].slice(0, 100),
        };
        return commit(next);
      });
    },
    [commit],
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
        if (us.stageProgress && stageIdx in us.stageProgress) {
          const { [stageIdx]: _removed, ...rest } = us.stageProgress;
          us.stageProgress = Object.keys(rest).length > 0 ? rest : undefined;
        }
        if (stageIdx === 0) us.vocabViewed = undefined;
        const completable = getCompletableStageIndices(unitId);
        const allCompletableDone =
          completable.length > 0 && completable.every((i) => completed.includes(i));
        if (allCompletableDone && !us.firstCompleteDate) {
          us.firstCompleteDate = new Date().toISOString().slice(0, 10);
        }
        const next = {
          ...prev,
          units: { ...prev.units, [unitId]: { ...us } },
          currentUnit: unitId,
        };
        const total = getTotalCompletedStages(next);
        const lastTest = next.lastAITest || 0;
        needAi = total - lastTest >= 4 && total > 0 && next.mistakes.length >= 2;
        return commit(next);
      });
      return needAi;
    },
    [commit],
  );

  const updateStageProgress = useCallback(
    (unitId: string, stageIdx: number, percent: number) => {
      const clamped = Math.min(99, Math.max(0, Math.round(percent)));
      setState((prev) => {
        const us = getUnitState(prev, unitId);
        if (us.completedStages.includes(stageIdx)) return prev;
        if ((us.stageProgress?.[stageIdx] ?? 0) === clamped) return prev;
        us.stageProgress = { ...(us.stageProgress ?? {}), [stageIdx]: clamped };
        const next = {
          ...prev,
          units: { ...prev.units, [unitId]: { ...us } },
        };
        return commit(next);
      });
    },
    [commit],
  );

  const updateVocabViewed = useCallback(
    (unitId: string, viewedIndices: number[]) => {
      setState((prev) => {
        const us = getUnitState(prev, unitId);
        const sorted = [...new Set(viewedIndices)].sort((a, b) => a - b);
        const prevKey = (us.vocabViewed ?? []).join(",");
        const nextKey = sorted.join(",");
        if (prevKey === nextKey) return prev;
        us.vocabViewed = sorted.length ? sorted : undefined;
        const vocabLen = findUnit(unitId)?.vocabulary.length ?? 0;
        if (vocabLen > 0) {
          const pct = Math.min(99, Math.round((sorted.length / vocabLen) * 100));
          us.stageProgress = { ...(us.stageProgress ?? {}), 0: pct };
        }
        const next = {
          ...prev,
          units: { ...prev.units, [unitId]: { ...us } },
        };
        return commit(next);
      });
    },
    [commit],
  );

  const value = useMemo(
    () => ({
      grade,
      state,
      setState,
      cloudHydrating,
      persist,
      addMistake,
      completeStage,
      updateStageProgress,
      updateVocabViewed,
    }),
    [
      grade,
      state,
      cloudHydrating,
      persist,
      addMistake,
      completeStage,
      updateStageProgress,
      updateVocabViewed,
    ],
  );

  return <PrimaryHubContext.Provider value={value}>{children}</PrimaryHubContext.Provider>;
}

export function usePrimaryHub() {
  const ctx = useContext(PrimaryHubContext);
  if (!ctx) throw new Error("usePrimaryHub outside provider");
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
