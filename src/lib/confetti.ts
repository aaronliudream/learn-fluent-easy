/**
 * Backward-compat shim. New code should import from "@/lib/feedback".
 * This file used to host the confetti implementation directly; it now
 * re-exports the unified, throttled, intensity-aware version so existing
 * `import { fireConfetti } from "@/lib/confetti"` call sites keep working.
 */
export { fireConfetti, fireConfettiIfPassed } from "@/lib/feedback";