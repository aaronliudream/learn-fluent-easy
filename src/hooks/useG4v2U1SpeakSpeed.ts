import { useCallback, useState } from "react";
import {
  loadG4v2U1SpeakSpeed,
  saveG4v2U1SpeakSpeed,
  type G4v2U1SpeakSpeed,
} from "@/lib/primaryHub/g4v2U1SpeakSpeed";

export function useG4v2U1SpeakSpeed() {
  const [speed, setSpeedState] = useState<G4v2U1SpeakSpeed>(() => loadG4v2U1SpeakSpeed());

  const setSpeed = useCallback((next: G4v2U1SpeakSpeed) => {
    setSpeedState(next);
    saveG4v2U1SpeakSpeed(next);
  }, []);

  return { speed, setSpeed };
}
