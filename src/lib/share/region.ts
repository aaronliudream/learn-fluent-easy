import type { ShareRegion } from "./types";

const KEY = "share_region_pref";

export function getRegion(): ShareRegion {
  if (typeof window === "undefined") return "CN";
  const saved = localStorage.getItem(KEY) as ShareRegion | null;
  if (saved === "CN" || saved === "INTL") return saved;
  // language signal
  const lang = (localStorage.getItem("lang") || navigator.language || "").toLowerCase();
  if (lang.startsWith("zh")) return "CN";
  // timezone signal
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (/Shanghai|Hong_Kong|Taipei|Macau|Chongqing|Urumqi/i.test(tz)) return "CN";
  } catch {}
  return "INTL";
}

export function setRegion(r: ShareRegion) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, r);
}

export function localeOf(r: ShareRegion) {
  return r === "CN" ? "zh" : "en";
}
