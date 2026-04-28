import { useEffect, useState } from "react";

export type VoiceOption = {
  id: string;
  name: string;
  desc: string;
  accent: string;
};

export const VOICES: VoiceOption[] = [
  { id: "alloy",   name: "Alloy",   desc: "温和清晰女声", accent: "🇺🇸 中性" },
  { id: "shimmer", name: "Shimmer", desc: "明亮柔和女声", accent: "🇺🇸 美音" },
  { id: "nova",    name: "Nova",    desc: "活力年轻女声", accent: "🇺🇸 美音" },
  { id: "echo",    name: "Echo",    desc: "沉稳磁性男声", accent: "🇺🇸 美音" },
  { id: "onyx",    name: "Onyx",    desc: "低沉成熟男声", accent: "🇺🇸 美音" },
  { id: "fable",   name: "Fable",   desc: "优雅叙述男声", accent: "🇬🇧 英音" },
];

export const SPEED_PRESETS = [
  { label: "慢", value: 0.8 },
  { label: "稍慢", value: 0.9 },
  { label: "正常", value: 0.95 },
  { label: "稍快", value: 1.05 },
  { label: "快", value: 1.15 },
];

const KEY = "voiceSettings.v1";

export type VoiceSettings = { voiceId: string; speed: number };

export const DEFAULT_SETTINGS: VoiceSettings = {
  voiceId: VOICES[0].id,
  speed: 1.0,
};

export const loadSettings = (): VoiceSettings => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const v = JSON.parse(raw);
    return {
      voiceId: typeof v.voiceId === "string" ? v.voiceId : DEFAULT_SETTINGS.voiceId,
      speed: typeof v.speed === "number" ? v.speed : DEFAULT_SETTINGS.speed,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (s: VoiceSettings) => {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent("voice-settings-changed", { detail: s }));
};

export const useVoiceSettings = () => {
  const [settings, setSettings] = useState<VoiceSettings>(loadSettings);
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<VoiceSettings>).detail;
      if (detail) setSettings(detail);
    };
    window.addEventListener("voice-settings-changed", handler);
    return () => window.removeEventListener("voice-settings-changed", handler);
  }, []);
  const update = (s: VoiceSettings) => {
    saveSettings(s);
    setSettings(s);
  };
  return [settings, update] as const;
};