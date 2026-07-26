/** Shared TTS speed for Primary Hub sentence / sentence-listening stages (localStorage). */
export const HUB_SPEAK_SPEED_KEY = "primary_hub_speak_speed";

/** Legacy localStorage key; migrated once then removed. */
export const LEGACY_G4V2_U1_SPEAK_SPEED_KEY = "primary_hub_g4v2_u1_tts_speed";

/**
 * 「固定档」模块的唯一语速来源：单词卡、句型对话关、6 个词汇游戏、语块按钮、
 * 情景关、自然拼读三个 stage —— 这些模块不给用户调速，恒用此速度。
 *
 * ⚠️ 预热与播放**必须都从这里取**。任何一侧写字面量（哪怕写的就是 0.85）都会让两侧
 * 有机会再次分叉：音频审计里的 C2-1 / C2-2 就是"播放写死 0.85、预热漏传 speed 落到
 * getKidSpeed(grade) → 四~六年级变 1.0"，结果整个模块的预热全部灌到没人播的 key 上。
 * 反过来在预热处补写 0.85 也不对——那只是把"漏传"换成"传了但可能传错"，
 * 将来改档位时照样漏一处。共用同一个符号，两侧就不可能分叉。
 */
export const HUB_FIXED_SPEAK_SPEED = 0.85;

export const HUB_SPEAK_SPEED_LEVELS = [
  { value: 0.7, label: "慢速" },
  { value: 0.85, label: "正常" },
  { value: 1.0, label: "快速" },
] as const;

export type HubSpeakSpeed = (typeof HUB_SPEAK_SPEED_LEVELS)[number]["value"];

const DEFAULT_SPEED: HubSpeakSpeed = 0.85;

function isValidSpeed(raw: string): boolean {
  const n = Number(raw);
  return HUB_SPEAK_SPEED_LEVELS.some((l) => l.value === n);
}

function parseSpeed(raw: string): HubSpeakSpeed | null {
  const n = Number(raw);
  if (HUB_SPEAK_SPEED_LEVELS.some((l) => l.value === n)) return n as HubSpeakSpeed;
  return null;
}

export function loadHubSpeakSpeed(): HubSpeakSpeed {
  if (typeof window === "undefined") return DEFAULT_SPEED;
  try {
    const newRaw = localStorage.getItem(HUB_SPEAK_SPEED_KEY);
    if (newRaw) {
      const parsed = parseSpeed(newRaw);
      if (parsed !== null) return parsed;
    }

    const oldRaw = localStorage.getItem(LEGACY_G4V2_U1_SPEAK_SPEED_KEY);
    if (oldRaw && isValidSpeed(oldRaw)) {
      localStorage.setItem(HUB_SPEAK_SPEED_KEY, oldRaw);
      localStorage.removeItem(LEGACY_G4V2_U1_SPEAK_SPEED_KEY);
      return parseSpeed(oldRaw)!;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_SPEED;
}

export function saveHubSpeakSpeed(speed: HubSpeakSpeed): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HUB_SPEAK_SPEED_KEY, String(speed));
  } catch {
    /* quota */
  }
}
