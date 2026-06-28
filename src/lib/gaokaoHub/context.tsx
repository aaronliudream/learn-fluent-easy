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
import { DEFAULT_PUBLISHER, type Publisher } from "./publisher";
import type { GaokaoHubGrade, GaokaoHubPersist, Mistake } from "./types";

type Ctx = {
  grade: GaokaoHubGrade;
  publisher: Publisher;
  state: GaokaoHubPersist;
  setState: React.Dispatch<React.SetStateAction<GaokaoHubPersist>>;
  persist: () => void;
  addMistake: (m: Omit<Mistake, "id" | "date">) => void;
  completeStage: (unitId: string, stageIdx: number) => boolean;
};

const GaokaoHubContext = createContext<Ctx | null>(null);

export function GaokaoHubProvider({
  grade,
  publisher = DEFAULT_PUBLISHER,
  children,
}: {
  grade: GaokaoHubGrade;
  publisher?: Publisher;
  children: ReactNode;
}) {
  const [state, setState] = useState<GaokaoHubPersist>(() => loadPersist(grade));

  const persist = useCallback(() => {
    savePersist(grade, state);
  }, [grade, state]);

  const addMistake = useCallback(
    (m: Omit<Mistake, "id" | "date">) => {
      setState((prev) => {
        const unit = findUnit(m.unitId ?? prev.currentUnit, publisher);
        const next: GaokaoHubPersist = {
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
        const unit = findUnit(unitId, publisher);
        if (!unit) return prev;
        const us = getUnitState(prev, unitId);
        const completed = [...us.completedStages];
        if (!completed.includes(stageIdx)) {
          completed.push(stageIdx);
          us.completedStages = completed;
          us.stars += 5;
          const p = getUnitProgress({ ...prev, units: { ...prev.units, [unitId]: us } }, unitId);
          const at = Math.floor(p.percent / 10);
          if (at > (us.lastAiTestAtProgress ?? 0)) {
            us.lastAiTestAtProgress = at;
            needAi = true;
          }
        }
        if (completed.length === unit.stages.length && !us.firstCompleteDate) {
          us.firstCompleteDate = new Date().toISOString().slice(0, 10);
        }
        const next = {
          ...prev,
          units: { ...prev.units, [unitId]: { ...us } },
        };
        if (!needAi) needAi = shouldTriggerUnitAITest(next, unitId);
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

  return <GaokaoHubContext.Provider value={value}>{children}</GaokaoHubContext.Provider>;
}

export function useGaokaoHub() {
  const ctx = useContext(GaokaoHubContext);
  if (!ctx) throw new Error("useGaokaoHub must be used within GaokaoHubProvider");
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
