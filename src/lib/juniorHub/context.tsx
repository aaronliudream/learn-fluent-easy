import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { findUnit } from "./courseData";
import { getUnitProgress, shouldTriggerUnitAITest } from "./progress";
import { getUnitState, loadPersist, savePersist } from "./storage";
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
