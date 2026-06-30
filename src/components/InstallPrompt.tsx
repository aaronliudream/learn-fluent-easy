import { useEffect, useState } from "react";
import { X, Smartphone, Share, Plus, MoreVertical } from "lucide-react";
import { T } from "@/i18n/T";

/**
 * "Add to Home Screen" prompt.
 *
 * - On Android/Chrome: listens for `beforeinstallprompt`, shows a one-tap
 *   install button.
 * - On iOS Safari: shows manual instructions (Share → Add to Home Screen),
 *   since iOS doesn't expose an install API.
 *
 * Dismissal is remembered for 14 days. Hidden if already installed
 * (display-mode: standalone).
 */
const STORAGE_KEY = "bm.install.dismissedAt";
const DISMISS_DAYS = 14;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS legacy
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

function isAndroid() {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

function recentlyDismissed() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const t = Number(raw);
    return Date.now() - t < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export default function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const ios = isIOS();
  const android = isAndroid();

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    const onBefore = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
      // Defer 4s so we don't compete with first-paint
      setTimeout(() => setShow(true), 4000);
    };
    window.addEventListener("beforeinstallprompt", onBefore);

    // iOS path: no event, show after a delay
    if (ios) {
      const id = setTimeout(() => setShow(true), 6000);
      return () => {
        clearTimeout(id);
        window.removeEventListener("beforeinstallprompt", onBefore);
      };
    }
    return () => window.removeEventListener("beforeinstallprompt", onBefore);
  }, [ios]);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch { /* noop */ }
    setShow(false);
  };

  const install = async () => {
    if (event) {
      try {
        await event.prompt();
        await event.userChoice;
        dismiss();
        return;
      } catch {
        // fall through to manual instructions
      }
    }
    // No native prompt available — show step-by-step instructions.
    setShowHowTo(true);
  };

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--tabbar-h,64px)+12px)] z-[60] flex justify-center px-4 md:bottom-6">
      <div className="pointer-events-auto relative flex w-full max-w-md items-start gap-3 rounded-2xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur-md">
        <button
          aria-label="Dismiss"
          onClick={dismiss}
          className="absolute right-2 top-2 grid size-7 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 text-white">
          <Smartphone className="size-5" />
        </div>
        <div className="min-w-0 flex-1 pr-6">
          <div className="text-sm font-extrabold">
            <T>把 Big Moon 装到主屏幕</T>
          </div>
          {ios ? (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              <T>点击 Safari 底部的</T>{" "}
              <Share className="inline size-3.5 align-text-bottom text-sky-500" />{" "}
              <T>分享按钮</T>，<T>选择</T>{" "}
              <span className="inline-flex items-center gap-0.5 font-semibold text-foreground">
                <Plus className="size-3.5" /> <T>添加到主屏幕</T>
              </span>
            </p>
          ) : showHowTo ? (
            <div className="mt-1 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
              {android ? (
                <>
                  <p>
                    <T>点击浏览器右上角的</T>{" "}
                    <MoreVertical className="inline size-3.5 align-text-bottom text-foreground" />{" "}
                    <T>菜单按钮</T>
                  </p>
                  <p>
                    <T>选择</T>{" "}
                    <span className="font-semibold text-foreground"><T>添加到主屏幕</T></span>{" "}
                    <T>或</T>{" "}
                    <span className="font-semibold text-foreground"><T>安装应用</T></span>
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <T>在 Chrome / Edge 地址栏右侧点击</T>{" "}
                    <span className="font-semibold text-foreground">⊕ <T>安装</T></span>{" "}
                    <T>图标</T>
                  </p>
                  <p>
                    <T>或打开浏览器菜单，选择</T>{" "}
                    <span className="font-semibold text-foreground"><T>安装 Big Moon</T></span>
                  </p>
                </>
              )}
            </div>
          ) : (
            <>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                <T>像 App 一样打开，离线也能学，连胜不会断。</T>
              </p>
              <button
                onClick={install}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-1.5 text-xs font-bold text-background hover:opacity-90"
              >
                <T>一键安装</T>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
