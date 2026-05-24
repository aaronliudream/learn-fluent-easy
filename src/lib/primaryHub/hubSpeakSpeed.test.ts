import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  HUB_SPEAK_SPEED_KEY,
  LEGACY_G4V2_U1_SPEAK_SPEED_KEY,
  loadHubSpeakSpeed,
  saveHubSpeakSpeed,
} from "./hubSpeakSpeed";

describe("hubSpeakSpeed", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("returns default 0.85 when storage is empty", () => {
    expect(loadHubSpeakSpeed()).toBe(0.85);
  });

  it("loads valid speed from new key", () => {
    localStorage.setItem(HUB_SPEAK_SPEED_KEY, "1");
    expect(loadHubSpeakSpeed()).toBe(1);
  });

  it("falls back to default for invalid new key value", () => {
    localStorage.setItem(HUB_SPEAK_SPEED_KEY, "2.5");
    expect(loadHubSpeakSpeed()).toBe(0.85);
  });

  it("migrates legacy key to new key and removes legacy key", () => {
    localStorage.setItem(LEGACY_G4V2_U1_SPEAK_SPEED_KEY, "0.7");
    expect(loadHubSpeakSpeed()).toBe(0.7);
    expect(localStorage.getItem(LEGACY_G4V2_U1_SPEAK_SPEED_KEY)).toBeNull();
    expect(localStorage.getItem(HUB_SPEAK_SPEED_KEY)).toBe("0.7");
  });

  it("prefers new key over legacy key without reading legacy", () => {
    localStorage.setItem(HUB_SPEAK_SPEED_KEY, "1");
    localStorage.setItem(LEGACY_G4V2_U1_SPEAK_SPEED_KEY, "0.7");
    expect(loadHubSpeakSpeed()).toBe(1);
    expect(localStorage.getItem(LEGACY_G4V2_U1_SPEAK_SPEED_KEY)).toBe("0.7");
  });

  it("saveHubSpeakSpeed writes new key only", () => {
    saveHubSpeakSpeed(0.7);
    expect(localStorage.getItem(HUB_SPEAK_SPEED_KEY)).toBe("0.7");
    expect(localStorage.getItem(LEGACY_G4V2_U1_SPEAK_SPEED_KEY)).toBeNull();
  });
});
