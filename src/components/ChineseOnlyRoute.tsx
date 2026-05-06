import type { ReactNode } from "react";

/**
 * Guard for China-only exam content (Gaokao / Junior / Primary 中国教材).
 * The source material — passages, vocabulary glosses, exam explanations —
 * is in Chinese. Showing it to users whose UI language is not zh / zh-TW
 * creates a jarring split (UI in Portuguese/Japanese, content in Chinese),
 * so we redirect them back to the universal homepage.
 */
export default function ChineseOnlyRoute({ children }: { children: ReactNode }) {
  // App is now China-only (小学/初中/高中). The legacy non-Chinese guard
  // would redirect users back to "/" and made the brand entry cards appear
  // broken. Always render the content.
  return <>{children}</>;
}