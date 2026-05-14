import { Home, BookOpen, Zap, AlertCircle, User, GraduationCap, Sparkles, X } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useT } from "@/i18n/T";

/**
 * Mobile-only bottom tab bar — 5 tabs with a centered "Start practice"
 * elevated CTA. AI chat lives in the floating Xiaoyue FAB, so it does
 * not compete for a tab slot.
 */
const TABS = [
  { to: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  {
    to: "__courses__",
    label: "Courses",
    icon: BookOpen,
    courses: true as const,
    match: (p: string) =>
      p.startsWith("/level") ||
      p.startsWith("/lesson") ||
      p.startsWith("/unit") ||
      p.startsWith("/placement") ||
      p.startsWith("/kids") ||
      p.startsWith("/primary") ||
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

const HIDDEN_ROUTES = ["/auth"];

export const BottomTabBar = () => {
  const { pathname } = useLocation();
  const t = useT();
  const [coursesOpen, setCoursesOpen] = useState(false);

  // Close on route change
  useEffect(() => { setCoursesOpen(false); }, [pathname]);

  // Esc to close
  useEffect(() => {
    if (!coursesOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setCoursesOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [coursesOpen]);

  if (HIDDEN_ROUTES.some((r) => pathname.startsWith(r))) return null;

  return (
    <>
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
          const isCourses = (tab as { courses?: boolean }).courses;

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

          if (isCourses) {
            return (
              <li key="courses">
                <button
                  type="button"
                  onClick={() => setCoursesOpen((v) => !v)}
                  aria-expanded={coursesOpen}
                  aria-haspopup="dialog"
                  className={`relative flex h-16 w-full flex-col items-center justify-center gap-1 text-center text-[13px] font-semibold transition ${
                    active || coursesOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="relative">
                    <Icon className={`size-6 transition ${active || coursesOpen ? "scale-110" : ""}`} />
                  </span>
                  <span className="w-full text-center leading-tight">{t(tab.label)}</span>
                  {(active || coursesOpen) && (
                    <span aria-hidden className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />
                  )}
                </button>
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
    <CoursesPopover open={coursesOpen} onClose={() => setCoursesOpen(false)} />
    </>
  );
};

/* ---------------- Courses Popover (tech-style stage selector) ---------------- */

const STAGES = [
  {
    to: "/primary",
    label: "小学英语",
    sub: "Primary · 1–6 年级",
    glyph: "P",
    gradient: "from-[#06B6D4] via-[#3B82F6] to-[#8B5CF6]",
    glow: "shadow-[0_0_40px_-8px_rgba(59,130,246,0.7)]",
  },
  {
    to: "/junior",
    label: "初中英语",
    sub: "Junior · 7–9 年级",
    glyph: "J",
    gradient: "from-[#10B981] via-[#06B6D4] to-[#3B82F6]",
    glow: "shadow-[0_0_40px_-8px_rgba(16,185,129,0.7)]",
  },
  {
    to: "/gaokao",
    label: "高中 / 高考",
    sub: "Senior · 高一至高考",
    glyph: "S",
    gradient: "from-[#F59E0B] via-[#EF4444] to-[#EC4899]",
    glow: "shadow-[0_0_40px_-8px_rgba(236,72,153,0.7)]",
  },
  {
    to: "/levels",
    label: "成人英语",
    sub: "Adult · CEFR A1 – C2",
    glyph: "A",
    gradient: "from-[#6366F1] via-[#8B5CF6] to-[#EC4899]",
    glow: "shadow-[0_0_40px_-8px_rgba(139,92,246,0.7)]",
  },
];

function CoursesPopover({ open, onClose }: { open: boolean; onClose: () => void }) {
  const nav = useNavigate();
  const t = useT();

  if (!open) return null;

  return (
    <div className="lg:hidden" role="dialog" aria-label={t("选择学段")}>
      {/* Backdrop */}
      <button
        type="button"
        aria-label={t("关闭")}
        onClick={onClose}
        className="fixed inset-0 z-40 animate-in fade-in duration-200 bg-slate-950/60 backdrop-blur-sm"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
      />
      {/* Sheet anchored above the bottom tab bar */}
      <div
        className="fixed inset-x-0 z-50 px-4 pb-[calc(76px+env(safe-area-inset-bottom,0))] animate-in slide-in-from-bottom-4 fade-in duration-300"
        style={{ bottom: 0 }}
      >
        <div className="relative mx-auto max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 p-5 shadow-2xl backdrop-blur-xl">
          {/* Tech grid background */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          {/* Glow blobs */}
          <div aria-hidden className="pointer-events-none absolute -top-20 -left-10 size-48 rounded-full bg-cyan-500/30 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-16 -right-10 size-48 rounded-full bg-fuchsia-500/30 blur-3xl" />

          {/* Header */}
          <div className="relative mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-white">
                <GraduationCap className="size-4" />
              </span>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-cyan-300/80">
                  {t("Select Stage")}
                </div>
                <div className="text-base font-bold text-white">{t("选择你的学段")}</div>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label={t("关闭")}
              className="grid size-8 place-items-center rounded-full bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Cards */}
          <ul className="relative space-y-2.5">
            {STAGES.map((s, i) => (
              <li key={s.to}>
                <button
                  onClick={() => { onClose(); nav(s.to); }}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className="group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left transition active:scale-[0.98] hover:border-white/20 hover:bg-white/[0.06] animate-in slide-in-from-bottom-2 fade-in duration-300 fill-mode-backwards"
                >
                  {/* Glyph */}
                  <div
                    className={`relative grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${s.gradient} ${s.glow} text-white`}
                  >
                    <span className="font-mono text-xl font-black">{s.glyph}</span>
                    <span aria-hidden className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/30" />
                  </div>
                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-bold text-white">{t(s.label)}</div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-white/50">{s.sub}</div>
                  </div>
                  {/* Arrow */}
                  <div className="grid size-8 shrink-0 place-items-center rounded-full bg-white/5 text-white/60 transition group-hover:bg-white/10 group-hover:text-white">
                    <Sparkles className="size-4" />
                  </div>
                  {/* Scan line */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 -left-full w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-700 group-hover:left-full"
                  />
                </button>
              </li>
            ))}
          </ul>

          {/* Footer hint */}
          <div className="relative mt-4 flex items-center justify-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
            <span className="size-1 rounded-full bg-emerald-400 animate-pulse" />
            {t("Tap any stage to enter")}
          </div>
        </div>
      </div>
    </div>
  );
}
