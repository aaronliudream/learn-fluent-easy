import { Home, BookOpen, Zap, AlertCircle, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useT } from "@/i18n/T";

/**
 * Mobile-only bottom tab bar — 5 tabs with a centered "Start practice"
 * elevated CTA. AI chat lives in the floating Xiaoyue FAB, so it does
 * not compete for a tab slot.
 */
const TABS = [
  { to: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  {
    to: "/levels",
    label: "Courses",
    icon: BookOpen,
    match: (p: string) =>
      p.startsWith("/level") ||
      p.startsWith("/lesson") ||
      p.startsWith("/unit") ||
      p.startsWith("/placement") ||
      p.startsWith("/kids") ||
      p.startsWith("/junior") ||
      p.startsWith("/gaokao") ||
      p.startsWith("/slang"),
  },
  {
    to: "/dashboard",
    label: "Practice",
    icon: Zap,
    cta: true,
    match: (p: string) => p.startsWith("/dashboard") || p.startsWith("/today"),
  },
  {
    to: "/mistakes",
    label: "Mistakes",
    icon: AlertCircle,
    match: (p: string) => p.startsWith("/mistakes") || p.startsWith("/review"),
  },
  {
    to: "/me",
    label: "Me",
    icon: User,
    match: (p: string) =>
      p.startsWith("/me") ||
      p.startsWith("/account") ||
      p.startsWith("/stats") ||
      p.startsWith("/saved") ||
      p.startsWith("/pets") ||
      p.startsWith("/leaderboard"),
  },
];

const HIDDEN_ROUTES = ["/auth", "/ielts-speaking/session"];

export const BottomTabBar = () => {
  const { pathname } = useLocation();
  const t = useT();

  if (HIDDEN_ROUTES.some((r) => pathname.startsWith(r))) return null;

  return (
    <nav
      aria-label={t("Main navigation")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
    >
      <ul className="mx-auto grid max-w-3xl grid-cols-5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = tab.match(pathname);
          const isCta = (tab as { cta?: boolean }).cta;

          if (isCta) {
            return (
              <li key={tab.to} className="relative">
                <NavLink
                  to={tab.to}
                  aria-label={t(tab.label)}
                  className="flex h-16 flex-col items-center justify-end pb-1.5 text-center text-[11px] font-bold text-primary"
                >
                  <span
                    className="absolute -top-5 grid size-14 place-items-center rounded-full bg-gradient-to-br from-[#7B3FF1] to-[#ED3F8C] text-white shadow-[0_10px_24px_-6px_rgba(123,63,241,0.6)] ring-4 ring-background transition-transform active:scale-95"
                    aria-hidden
                  >
                    <Icon className="size-6" />
                  </span>
                  <span className="mt-9 leading-tight">{t(tab.label)}</span>
                </NavLink>
              </li>
            );
          }

          return (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                className={`relative flex h-16 flex-col items-center justify-center gap-1 text-center text-[13px] font-semibold transition ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="relative">
                  <Icon className={`size-6 transition ${active ? "scale-110" : ""}`} />
                </span>
                <span className="w-full text-center leading-tight">{t(tab.label)}</span>
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
