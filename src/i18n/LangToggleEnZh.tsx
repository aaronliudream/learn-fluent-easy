import { Button } from "@/components/ui/button";
import { useI18n } from "./I18nProvider";

/**
 * Compact two-language toggle (English / 简体中文) for the homepage header.
 * Sits next to the Sign in button so first-time visitors can immediately
 * switch the whole UI to English. The full 30-language picker lives
 * elsewhere; this one is intentionally minimal.
 */
export function LangToggleEnZh() {
  const { lang, setLang, markPicked } = useI18n();
  const isZh = lang === "zh" || lang === "zh-TW";

  const choose = (code: "en" | "zh") => {
    setLang(code);
    markPicked();
  };

  return (
    <div
      className="mr-2 inline-flex items-center rounded-full border border-primary/25 bg-background p-0.5 shadow-sm"
      role="group"
      aria-label="Language"
    >
      <Button
        type="button"
        size="sm"
        variant={isZh ? "ghost" : "default"}
        className="h-8 rounded-full px-3 text-xs font-bold"
        onClick={() => choose("en")}
        aria-pressed={!isZh}
      >
        EN
      </Button>
      <Button
        type="button"
        size="sm"
        variant={isZh ? "default" : "ghost"}
        className="h-8 rounded-full px-3 text-xs font-bold"
        onClick={() => choose("zh")}
        aria-pressed={isZh}
      >
        中文
      </Button>
    </div>
  );
}
