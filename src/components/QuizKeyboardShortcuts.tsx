import { useEffect } from "react";

/**
 * 全站统一键盘快捷键（DOM 委托，无需各组件改造）。
 *
 *   1 / 2 / 3 / 4   → 点击第 i 个选项按钮（仅"选中"，不自动提交）
 *   Enter           → 点击主 CTA（"下一题 / 提交 / 确认 / 看建议 / 完成"）
 *
 * 选项识别规则：可见、未禁用、文本以 A./B./C./D. 或 1./2./3./4.
 * 开头的 <button>，或带 `data-quiz-opt` 属性。
 *
 * Enter 行为：
 *   - 如果焦点在 input：触发其所在表单的 submit；若无 form，则点击同区域主 CTA。
 *   - 如果焦点在 textarea：Shift+Enter 让其换行；纯 Enter 触发主 CTA。
 *   - 其他场景：必须先满足"页面上存在选项按钮"或"焦点在按钮上"，才点击主 CTA，
 *     避免在普通页面误点。
 */

const SUBMIT_RE =
  /(下一题|下一步|继续|提交|确认|看建议|看解析|完成|开始测试|开始学习|开始诊断|进入|Next|Submit|Continue|Confirm|Done|Start)/i;

function isVisible(el: HTMLElement | null): boolean {
  if (!el) return false;
  if ((el as HTMLButtonElement).disabled) return false;
  if (el.getAttribute("aria-disabled") === "true") return false;
  if (el.offsetParent === null && getComputedStyle(el).position !== "fixed") return false;
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return false;
  return true;
}

function getOptionButtons(): HTMLButtonElement[] {
  const all = Array.from(document.querySelectorAll<HTMLButtonElement>("button"));
  const opts = all.filter((b) => {
    if (!isVisible(b)) return false;
    if (b.hasAttribute("data-quiz-opt")) return true;
    const txt = (b.innerText || b.textContent || "").trim();
    if (!txt) return false;
    // "A. xxx" / "B) xxx" / "1. xxx" / "1) xxx" / 单独 "A" "1"
    return /^([A-Da-d1-4])([\.\)\s\:、]|$)/.test(txt);
  });
  // 按 DOM 中视觉顺序排序（自上而下、从左到右）
  opts.sort((a, b) => {
    const ra = a.getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    if (Math.abs(ra.top - rb.top) > 8) return ra.top - rb.top;
    return ra.left - rb.left;
  });
  return opts;
}

function getSubmitButton(scope?: HTMLElement | null): HTMLButtonElement | null {
  const root: ParentNode = scope ?? document;
  const all = Array.from(root.querySelectorAll<HTMLButtonElement>("button"));
  const candidates = all.filter((b) => {
    if (!isVisible(b)) return false;
    if (b.hasAttribute("data-quiz-submit")) return true;
    if (b.type === "submit") return true;
    const txt = (b.innerText || b.textContent || "").trim();
    return SUBMIT_RE.test(txt);
  });
  if (candidates.length === 0) return null;
  // 选择视口内、最靠下的一个（通常是当前卡片的主 CTA）
  const inView = candidates.filter((b) => {
    const r = b.getBoundingClientRect();
    return r.top >= 0 && r.bottom <= window.innerHeight + 100;
  });
  const pool = inView.length ? inView : candidates;
  pool.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
  return pool[pool.length - 1];
}

function findScopeOf(el: HTMLElement | null): HTMLElement | null {
  if (!el) return null;
  // 寻找最近的 form / dialog / [role=dialog] / 卡片容器
  let cur: HTMLElement | null = el;
  while (cur && cur !== document.body) {
    if (cur.tagName === "FORM" || cur.tagName === "DIALOG") return cur;
    if (cur.getAttribute("role") === "dialog") return cur;
    cur = cur.parentElement;
  }
  return null;
}

export default function QuizKeyboardShortcuts() {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const inInput = tag === "INPUT" && (target as HTMLInputElement).type !== "checkbox" && (target as HTMLInputElement).type !== "radio";
      const inTextarea = tag === "TEXTAREA";
      const inEditable = inInput || inTextarea || target?.isContentEditable === true;
      const inSelect = tag === "SELECT";

      // ───── Enter ─────
      if (e.key === "Enter") {
        if (inSelect) return;
        if (inTextarea && e.shiftKey) return; // 让 textarea 自然换行
        // 如果焦点本身就是按钮：让它默认行为执行（按钮按 Enter 会触发 click）
        if (tag === "BUTTON") return;

        const scope = findScopeOf(target);
        const btn = getSubmitButton(scope) || getSubmitButton();
        if (!btn) return;

        // 只在以下情境触发，避免误点：
        //   1) 焦点在输入框 / textarea（用户按回车 = 完成输入）
        //   2) 当前页面存在选项按钮（用户在做题）
        //   3) 焦点在 body 上但页面有明确的主 CTA（保守：必须有选项按钮）
        const hasOpts = getOptionButtons().length > 0;
        if (!inEditable && !hasOpts) return;

        e.preventDefault();
        btn.click();
        return;
      }

      // ───── 1 / 2 / 3 / 4 ─────
      if (inEditable || inSelect) return;
      const n = Number(e.key);
      if (!Number.isFinite(n) || n < 1 || n > 4) return;
      const opts = getOptionButtons();
      if (opts.length < n) return;
      e.preventDefault();
      opts[n - 1].click();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}