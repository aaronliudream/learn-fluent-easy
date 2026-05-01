import { Home, Clapperboard, Brain, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { countDueReviews } from "@/lib/srs";
import { useT } from "@/i18n/T";

/**
 * Mobile-only bottom tab bar. Hidden on `md` and up where the page header
 * already provides good navigation. Hidden on auth/onboarding routes too.
 */
const TABS = [
  { to: "/", label: "首页", icon: Home, match: (p: string) => p === "/" },
  { to: "/scenes", label: "场景", icon: Clapperboard, match: (p: string) => p.startsWith("/scenes") },
  { to: "/review", label: "复习", icon: Brain, match: (p: string) => p.startsWith("/review"), badge: true },
  { to: "/account", label: "我的", icon: User, match: (p: string) => p.startsWith("/account") || p.startsWith("/stats") || p.startsWith("/saved") },
];

const HIDDEN_ROUTES = ["/auth"];

export const BottomTabBar = () => {
  const { pathname } = useLocation();
  const [due, setDue] = useState(0);
  const t = useT();

  useEffect(() => {
    let cancelled = false;
    countDueReviews().then((c) => !cancelled && setDue(c));
    return () => { cancelled = true; };
  }, [pathname]);

  if (HIDDEN_ROUTES.some((r) => pathname.startsWith(r))) return null;

  return (
    <nav
      aria-label={t("主导航")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
    >
      <ul className="mx-auto grid max-w-3xl grid-cols-4">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = t.match(pathname);
          return (
            <li key={t.to}>
              <NavLink
                to={t.to}
                className={`relative flex h-16 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="relative">
                  <Icon className={`size-5 transition ${active ? "scale-110" : ""}`} />
                  {t.badge && due > 0 && (
                    <span className="num absolute -right-2 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">
                      {due > 99 ? "99+" : due}
                    </span>
                  )}
                </span>
                <span>{t(tab.label)}</span>
                {active && (
                  <span aria-hidden className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
