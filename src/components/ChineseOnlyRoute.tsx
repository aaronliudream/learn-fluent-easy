import { Navigate } from "react-router-dom";
import { useI18n } from "@/i18n/I18nProvider";
import type { ReactNode } from "react";

/**
 * Guard for China-only exam content (Gaokao / Junior / Primary 中国教材).
 * The source material — passages, vocabulary glosses, exam explanations —
 * is in Chinese. Showing it to users whose UI language is not zh / zh-TW
 * creates a jarring split (UI in Portuguese/Japanese, content in Chinese),
 * so we redirect them back to the universal homepage.
 */
export default function ChineseOnlyRoute({ children }: { children: ReactNode }) {
  const { lang } = useI18n();
  const isChinese = lang === "zh" || lang === "zh-TW";
  if (!isChinese) return <Navigate to="/" replace />;
  return <>{children}</>;
}