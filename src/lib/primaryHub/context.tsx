import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loadPersist, savePersist, getUnitState } from "./storage";
import type { Mistake, PrimaryHubGrade, PrimaryHubPersist } from "./types";
import { findUnit } from "./courseData";
import { getTotalCompletedStages } from "./progress";
import { getCompletableStageIndices } from "./stageCompletable";

type Ctx = {
  grade: PrimaryHubGrade;
  state: PrimaryHubPersist;
  setState: React.Dispatch<React.SetStateAction<PrimaryHubPersist>>;
  persist: () => void;
  addMistake: (m: Omit<Mistake, "id" | "date">) => void;
  completeStage: (unitId: string, stageIdx: number) => boolean;
  updateStageProgress: (unitId: string, stageIdx: number, percent: number) => void;
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
        if (us.stageProgress && stageIdx in us.stageProgress) {
          const { [stageIdx]: _removed, ...rest } = us.stageProgress;
          us.stageProgress = Object.keys(rest).length > 0 ? rest : undefined;
        }
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
        savePersist(grade, next);
        const total = getTotalCompletedStages(next);
        const lastTest = next.lastAITest || 0;
        needAi = total - lastTest >= 4 && total > 0 && next.mistakes.length >= 2;
        return next;
      });
      return needAi;
    },
    [grade],
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
        savePersist(grade, next);
        return next;
      });
    },
    [grade],
  );

  const value = useMemo(
    () => ({ grade, state, setState, persist, addMistake, completeStage, updateStageProgress }),
    [grade, state, persist, addMistake, completeStage, updateStageProgress],
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
