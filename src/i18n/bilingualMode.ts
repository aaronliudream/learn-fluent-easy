import { useLocation } from "react-router-dom";

/** Routes that show bilingual UI (English主 + 用户语言副).
 *  These are the "Chinese student English-learning" zones where students
 *  benefit from seeing the English original alongside their mother tongue.
 */
const BILINGUAL_PREFIXES = ["/primary", "/junior", "/gaokao", "/china"];

export function isBilingualPath(pathname: string): boolean {
  return BILINGUAL_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/** React hook: returns true when the current route should render bilingual UI. */
export function useBilingualMode(): boolean {
  const loc = useLocation();
  return isBilingualPath(loc.pathname);
}
