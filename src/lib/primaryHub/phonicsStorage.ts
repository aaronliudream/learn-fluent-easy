export type PhonicsUnitProgress = {
  completedStages: number[];
  sessionStars: number;
  finished: boolean;
};

type PhonicsPersist = Record<string, PhonicsUnitProgress>;

const STORAGE_KEY = "primary_hub_phonics_v1";

function emptyProgress(): PhonicsUnitProgress {
  return { completedStages: [], sessionStars: 0, finished: false };
}

export function loadPhonicsProgress(unitId: string): PhonicsUnitProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const data = JSON.parse(raw) as PhonicsPersist;
    return data[unitId] ?? emptyProgress();
  } catch {
    return emptyProgress();
  }
}

export function savePhonicsProgress(unitId: string, progress: PhonicsUnitProgress): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data: PhonicsPersist = raw ? (JSON.parse(raw) as PhonicsPersist) : {};
    data[unitId] = progress;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota */
  }
}

export function completePhonicsStage(
  unitId: string,
  stageIdx: number,
  starsEarned: number,
): PhonicsUnitProgress {
  const prev = loadPhonicsProgress(unitId);
  const completed = [...prev.completedStages];
  if (!completed.includes(stageIdx)) completed.push(stageIdx);
  const next: PhonicsUnitProgress = {
    completedStages: completed,
    sessionStars: prev.sessionStars + starsEarned,
    finished: completed.length >= 3,
  };
  savePhonicsProgress(unitId, next);
  return next;
}
