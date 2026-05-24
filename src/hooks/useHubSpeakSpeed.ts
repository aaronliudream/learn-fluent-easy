import { useCallback, useState } from "react";
import {
  loadHubSpeakSpeed,
  saveHubSpeakSpeed,
  type HubSpeakSpeed,
} from "@/lib/primaryHub/hubSpeakSpeed";

export function useHubSpeakSpeed() {
  const [speed, setSpeedState] = useState<HubSpeakSpeed>(() => loadHubSpeakSpeed());

  const setSpeed = useCallback((next: HubSpeakSpeed) => {
    setSpeedState(next);
    saveHubSpeakSpeed(next);
  }, []);

  return { speed, setSpeed };
}
