import { useEffect, useState } from "react";

export type VoiceOption = {
  id: string;
  name: string;
  desc: string;
  accent: string;
};

export const VOICES: VoiceOption[] = [
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", desc: "温柔自然女声", accent: "🇺🇸 美音" },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura", desc: "明亮活力女声", accent: "🇺🇸 美音" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", desc: "优雅清晰女声", accent: "🇬🇧 英音" },
  { id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda", desc: "亲切温暖女声", accent: "🇺🇸 美音" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", desc: "沉稳磁性男声", accent: "🇬🇧 英音" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam", desc: "年轻清朗男声", accent: "🇺🇸 美音" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", desc: "标准播音男声", accent: "🇬🇧 英音" },
  { id: "iP95p4xoKVk53GoZ742B", name: "Chris", desc: "随和自然男声", accent: "🇺🇸 美音" },
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
  speed: 0.95,
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