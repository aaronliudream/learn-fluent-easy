import { useEffect } from "react";

/**
 * 全站统一键盘快捷键：
 *   1/2/3/4 → 选中 options[i]（仅选中，不自动提交）
 *   Enter   → 触发 onSubmit（前提：已选中 / 不在 input/textarea 中）
 *
 * 当焦点在 input/textarea/contenteditable/select 内时：
 *   - 数字键不拦截（避免影响输入）
 *   - Enter 也会触发 onSubmit（用户输入完毕直接回车确认 / 下一题）
 *
 * 使用：
 *   useQuizKeyboard({
 *     options: q.opts,
 *     onPick: (opt, idx) => setPicked(opt),
 *     onSubmit: handleSubmit,
 *     enabled: stage === "quiz",
 *   });
 */
export interface UseQuizKeyboardOptions<T = unknown> {
  options?: readonly T[] | T[];
  onPick?: (option: T, index: number) => void;
  onSubmit?: () => void;
  enabled?: boolean;
  /** 默认 4。最多支持的数字键个数（1..max） */
  maxKeys?: number;
  /** Enter 是否在 textarea/input 中也触发。默认 true。textarea 中 Shift+Enter 仍换行 */
  submitOnEnterInInput?: boolean;
}

function isEditableTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false;
  const tag = t.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (t.isContentEditable) return true;
  return false;
}

export function useQuizKeyboard<T>({
  options,
  onPick,
  onSubmit,
  enabled = true,
  maxKeys = 4,
  submitOnEnterInInput = true,
}: UseQuizKeyboardOptions<T>) {
  useEffect(() => {
    if (!enabled) return;
    function handler(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const inEditable = isEditableTarget(e.target);

      // Enter → submit
      if (e.key === "Enter") {
        if (inEditable && !submitOnEnterInInput) return;
        // textarea 中 Shift+Enter 让其换行
        if (inEditable && (e.target as HTMLElement).tagName === "TEXTAREA" && e.shiftKey) return;
        if (onSubmit) {
          e.preventDefault();
          onSubmit();
        }
        return;
      }

      // 数字键 1..maxKeys → 选项
      if (inEditable) return;
      if (!onPick || !options || options.length === 0) return;
      const n = Number(e.key);
      if (!Number.isFinite(n) || n < 1 || n > maxKeys) return;
      const idx = n - 1;
      if (idx >= options.length) return;
      e.preventDefault();
      onPick(options[idx], idx);
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, options, onPick, onSubmit, maxKeys, submitOnEnterInInput]);
}

export default useQuizKeyboard;