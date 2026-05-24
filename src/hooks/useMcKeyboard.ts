import { useEffect } from "react";

export interface UseMcKeyboardOptions {
  /** Number of options (typically opts.length, max 4). */
  optionCount: number;
  /** When true, number keys are ignored; Enter may advance. */
  answered: boolean;
  onPick: (index: number) => void;
  /** Called on Enter after the question is answered (e.g. 下一题). */
  onNext?: () => void;
  enabled?: boolean;
}

function isEditableTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false;
  const tag = t.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (t.isContentEditable) return true;
  return false;
}

/** Map main row 1–4 or numpad 1–4 to zero-based option index. */
function keyToOptionIndex(key: string, code: string): number | null {
  if (/^[1-4]$/.test(key)) return Number(key) - 1;
  const numpad = code.match(/^Numpad([1-4])$/);
  if (numpad) return Number(numpad[1]) - 1;
  return null;
}

/**
 * Primary / junior hub multiple-choice shortcuts:
 *   1–4 (and numpad) → pick option A–D while unanswered
 *   Enter → onNext when answered (still works with 下一题 button)
 *
 * Ignored when focus is in input, textarea, select, or contenteditable.
 */
export function useMcKeyboard({
  optionCount,
  answered,
  onPick,
  onNext,
  enabled = true,
}: UseMcKeyboardOptions) {
  useEffect(() => {
    if (!enabled) return;

    function handler(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const inEditable = isEditableTarget(e.target);

      if (e.key === "Enter") {
        if (!answered || !onNext) return;
        if (inEditable && (e.target as HTMLElement).tagName === "TEXTAREA" && e.shiftKey) return;
        e.preventDefault();
        onNext();
        return;
      }

      if (answered || inEditable) return;

      const idx = keyToOptionIndex(e.key, e.code);
      if (idx === null || idx < 0 || idx >= optionCount) return;
      e.preventDefault();
      onPick(idx);
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, optionCount, answered, onPick, onNext]);
}

export default useMcKeyboard;
