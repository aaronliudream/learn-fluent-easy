// Paste in browser console or via CDP Runtime.evaluate (IIFE)
function rwAcceptMeta() {
  const labelEl = [...document.querySelectorAll("span")].find((el) =>
    /第\s*\d+\s*\/\s*\d+\s*题/.test(el.textContent ?? ""),
  );
  const hintEl = document.querySelector("p.mb-3");
  const sentenceEl = [...document.querySelectorAll("p")].find((p) =>
    p.querySelector("span.whitespace-nowrap"),
  );
  return {
    label: labelEl?.textContent?.trim() ?? null,
    hint: hintEl?.textContent?.trim() ?? null,
    sentenceHtml: sentenceEl?.outerHTML ?? null,
    sentenceText: sentenceEl?.textContent?.trim() ?? null,
  };
}

function rwShowViewportBadge() {
  let el = document.getElementById("rw-accept-viewport");
  if (!el) {
    el = document.createElement("div");
    el.id = "rw-accept-viewport";
    el.style.cssText =
      "position:fixed;top:0;left:0;right:0;z-index:99999;background:#1a1a1a;color:#fff;font:600 12px/1.4 ui-monospace,monospace;padding:6px 8px;text-align:center;pointer-events:none";
    document.body.appendChild(el);
  }
  el.textContent =
    "Acceptance · viewport 390×844 (iPhone 12 Pro) · Chrome DevTools device emulation";
  return el.textContent;
}

function rwClickOption(text) {
  const btn = [...document.querySelectorAll("button")].find(
    (b) => b.textContent?.trim() === text,
  );
  if (!btn) return { ok: false, error: `button not found: ${text}` };
  btn.click();
  return { ok: true };
}
