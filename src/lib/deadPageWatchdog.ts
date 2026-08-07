/**
 * 「看得见但点不动」死页看门狗(2026-08-05)
 *
 * 现象:偶发全页点击无响应,等待无效,只有整页刷新才恢复。两类根因必须分开定罪:
 *   A. 事件被吃 —— 残留透明全屏遮罩 / body 被打上 pointer-events:none(Radix 模态层泄漏的经典症状)
 *   B. JS 死亡 —— 主线程被卡死或 React 根崩溃,DOM 还在(所以 CSS :hover 手型照常),但没人处理事件
 *
 * 本模块做三件事:
 *   ① 每 5s 打一次心跳时间戳,同时记录最后一次 pointerdown。下次启动时若发现
 *      "最后点击 >> 最后心跳" ⇒ 上个会话里用户在拼命点、心跳却停了 ⇒ 判 B(JS 死亡),自动上报。
 *   ② 每次 pointerdown 现场体检:body 是否被打上 pointer-events:none、命中的是不是一层
 *      全屏透明容器。命中即上报,并对"已知安全"的那一种(body 上的残留)当场自愈。
 *   ③ 暴露 window.__unstick() —— 复现时在控制台敲一下:
 *        · 页面立刻能点了 ⇒ 判 A(遮罩类),上报里带着元凶的 outerHTML
 *        · 敲下去毫无反应(甚至命令本身卡住) ⇒ 判 B
 *      这一条是现场定罪最快的探针,比截图更准。
 *
 * 红线:除了清 body 上的 pointer-events(纯恢复性、无副作用),不自动删除任何 DOM 节点 ——
 * 误删真弹层比卡住更糟。透明遮罩只上报,由人看了再改代码。
 */

import { reportClientError } from "@/lib/clientErrorLog";

const HB_KEY = "watchdog:hb";
const CLICK_KEY = "watchdog:click";
const HB_MS = 5_000;
/** 心跳落后点击超过这个数,才判"上个会话 JS 死了"(留足移动端后台节流的余量)。 */
const DEATH_GAP_MS = 20_000;

let installed = false;

function num(key: string): number {
  try {
    return Number(sessionStorage.getItem(key) || "0");
  } catch {
    return 0;
  }
}
function stamp(key: string): void {
  try {
    sessionStorage.setItem(key, String(Date.now()));
  } catch {
    /* 隐私模式下 sessionStorage 可能抛错 —— 看门狗自己绝不能把页面搞崩 */
  }
}

/** 当前是否真有模态层开着(Radix / vaul / 自研全屏弹层都算)。 */
function hasOpenModal(): boolean {
  return !!document.querySelector(
    '[data-state="open"][role="dialog"],[data-radix-popper-content-wrapper],[vaul-drawer][data-state="open"],[data-radix-focus-guard]',
  );
}

/** 元素是否"占满整屏" —— 全屏拦截层的判据。 */
function isFullScreenish(el: Element): boolean {
  const r = el.getBoundingClientRect();
  return r.width >= window.innerWidth * 0.9 && r.height >= window.innerHeight * 0.9;
}

/** 元素是否完全看不见(背景全透明 + 无边框/阴影/滤镜)—— 即「看不见却吃点击」。 */
function isInvisible(el: Element): boolean {
  const cs = getComputedStyle(el);
  const bg = cs.backgroundColor;
  const transparentBg =
    bg === "transparent" || bg === "rgba(0, 0, 0, 0)" || /rgba\([^)]*,\s*0\)$/.test(bg);
  return (
    transparentBg &&
    cs.backgroundImage === "none" &&
    cs.backdropFilter === "none" &&
    cs.boxShadow === "none" &&
    (el.textContent ?? "").trim() === ""
  );
}

function describe(el: Element): string {
  return el.outerHTML.slice(0, 300);
}

/**
 * 解卡:清掉 body 上残留的 pointer-events:none,并把全屏透明拦截层标记出来。
 * 返回这次动了什么 —— 复现时控制台里能直接读到。
 */
function unstick(): string[] {
  const fixed: string[] = [];

  if (document.body.style.pointerEvents === "none" || getComputedStyle(document.body).pointerEvents === "none") {
    document.body.style.pointerEvents = "";
    fixed.push("cleared body.pointer-events");
  }

  for (const el of Array.from(document.body.querySelectorAll("*"))) {
    const cs = getComputedStyle(el);
    if (cs.position !== "fixed" || cs.display === "none" || cs.pointerEvents === "none") continue;
    if (!isFullScreenish(el) || !isInvisible(el)) continue;
    (el as HTMLElement).style.pointerEvents = "none";
    (el as HTMLElement).dataset.unstuck = "1";
    fixed.push(`neutralized invisible overlay: ${describe(el)}`);
  }

  if (fixed.length) {
    reportClientError("dead-click", "__unstick() 手动解卡", undefined, { fixed });
  }
  return fixed.length ? fixed : ["nothing to fix — 页面并没有被遮罩挡住,嫌疑指向 JS 已死"];
}

/** pointerdown 现场体检:能自愈的当场愈,其余只留证据。 */
function inspect(e: PointerEvent): void {
  stamp(CLICK_KEY);

  const target = e.target as Element | null;

  // ① body 被打上 pointer-events:none 且没有任何模态层开着 = 残留泄漏。
  //    此时点击命中的是 <html>,所以 target 会是 documentElement。
  if (getComputedStyle(document.body).pointerEvents === "none" && !hasOpenModal()) {
    reportClientError(
      "dead-click",
      "body 残留 pointer-events:none(无模态层开启)—— 已自动恢复",
      undefined,
      { bodyStyle: document.body.getAttribute("style") ?? "" },
    );
    document.body.style.pointerEvents = "";
    return;
  }

  // ② 点击命中一层全屏透明容器 = 「看不见但吃点击」,直接抓现行。
  // 只认 fixed/absolute 定位层:普通页面外壳(min-h-screen 的 div)也满屏,但它是正常内容,
  // 不加这条会把"点空白处"误报成遮罩。
  const pos = target ? getComputedStyle(target).position : "";
  if (
    target &&
    target !== document.documentElement &&
    (pos === "fixed" || pos === "absolute") &&
    isFullScreenish(target) &&
    isInvisible(target)
  ) {
    reportClientError("dead-click", "点击被全屏透明容器吃掉", undefined, {
      overlay: describe(target),
      hasOpenModal: hasOpenModal(),
    });
  }
}

/** 在 main.tsx render 之前调用一次。重复调用无副作用。 */
export function installDeadPageWatchdog(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;

  // 开机验尸:上个会话是不是"用户还在点、心跳已经停了"。
  const prevHb = num(HB_KEY);
  const prevClick = num(CLICK_KEY);
  if (prevHb && prevClick && prevClick - prevHb > DEATH_GAP_MS) {
    reportClientError(
      "session-death",
      "上个会话心跳已停但用户仍在点击 —— JS 运行时死亡(非遮罩)",
      undefined,
      { lastHeartbeat: new Date(prevHb).toISOString(), lastClick: new Date(prevClick).toISOString(), gapMs: prevClick - prevHb },
    );
  }

  stamp(HB_KEY);
  setInterval(() => stamp(HB_KEY), HB_MS);

  // capture + passive:只观察,绝不改变任何事件行为。
  window.addEventListener("pointerdown", inspect, { capture: true, passive: true });

  (window as unknown as { __unstick: () => string[] }).__unstick = unstick;
}
