import { useEffect, useState } from "react";

export type CompanionMode = "quiet" | "standard" | "focus";
const KEY = "bme_companion_mode";

export function getCompanionMode(): CompanionMode {
  if (typeof window === "undefined") return "standard";
  const v = localStorage.getItem(KEY);
  if (v === "quiet" || v === "focus") return v;
  return "standard";
}

export function setCompanionMode(m: CompanionMode) {
  localStorage.setItem(KEY, m);
  window.dispatchEvent(new CustomEvent("bme:companion-mode", { detail: m }));
}

/** React hook that reflects the current mode and prefers-reduced-motion. */
export function useCompanionMode() {
  const [mode, setMode] = useState<CompanionMode>(() => getCompanionMode());
  const [reduceMotion, setReduce] = useState(false);
  useEffect(() => {
    const onChange = (e: Event) => {
      const m = (e as CustomEvent).detail as CompanionMode;
      if (m) setMode(m);
    };
    window.addEventListener("bme:companion-mode", onChange);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const on = () => setReduce(mq.matches);
    mq.addEventListener?.("change", on);
    return () => {
      window.removeEventListener("bme:companion-mode", onChange);
      mq.removeEventListener?.("change", on);
    };
  }, []);

  // quiet = no animations, no proactive bubbles, hidden hunger pulse
  // standard = balanced
  // focus = more frequent encouragement bubbles
  const animate = !reduceMotion && mode !== "quiet";
  const proactive = mode === "focus" || mode === "standard";
  const showHungerAlert = mode !== "quiet";
  return { mode, setMode: setCompanionMode, animate, proactive, showHungerAlert, reduceMotion };
}
