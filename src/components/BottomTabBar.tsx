import { Home, GraduationCap, MessagesSquare, Trophy, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useT } from "@/i18n/T";

/**
 * Mobile-only bottom tab bar. Hidden on `md` and up where the page header
 * already provides good navigation. Hidden on auth/onboarding routes too.
 */
const TABS = [
  { to: "/", label: "首页", icon: Home, match: (p: string) => p === "/" },
  {
    to: "/levels",
    label: "学",
    icon: GraduationCap,
    match: (p: string) =>
      p.startsWith("/level") ||
      p.startsWith("/lesson") ||
      p.startsWith("/unit") ||
      p.startsWith("/placement") ||
      p.startsWith("/gaokao") ||
      p.startsWith("/slang"),
  },
  {
    to: "/scenes",
    label: "练",
    icon: MessagesSquare,
    match: (p: string) =>
      p.startsWith("/scenes") ||
      p.startsWith("/workplace") ||
      p.startsWith("/talk"),
  },
  { to: "/leaderboard", label: "Global Ranking", icon: Trophy, match: (p: string) => p.startsWith("/leaderboard") || p.startsWith("/review") },
  { to: "/account", label: "我的", icon: User, match: (p: string) => p.startsWith("/account") || p.startsWith("/stats") || p.startsWith("/saved") },
];

const HIDDEN_ROUTES = ["/auth"];

export const BottomTabBar = () => {
  const { pathname } = useLocation();
  const t = useT();

  if (HIDDEN_ROUTES.some((r) => pathname.startsWith(r))) return null;

  return (
    <nav
      aria-label={t("主导航")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
    >
      <ul className="mx-auto grid max-w-3xl grid-cols-5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = tab.match(pathname);
          return (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                className={`relative flex h-16 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="relative">
                  <Icon className={`size-5 transition ${active ? "scale-110" : ""}`} />
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
