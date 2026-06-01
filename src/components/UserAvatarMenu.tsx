import { T } from "@/i18n/T";import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, User as UserIcon, BarChart3, BookMarked, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";

/**
 * Industry-standard signed-in indicator (Duolingo / ChatGPT / Apple style):
 * - Fixed top-right avatar with initials + green online dot when signed in
 * - Click opens dropdown: name, email, account, progress, sign out
 * - When signed out, shows a compact "登录" button so the state is unambiguous
 *
 * Hidden on /auth to keep the form clean.
 */

// Routes whose own header already renders an inline <UserAvatarMenu variant="inline" />,
// so the global floating one would overlap.
const HIDE_ON = [
/^\/$/, // home — LandingPage / BrandHubNav render it inline
/^\/kids/, /^\/senior/, /^\/about/, /^\/slang/, /^\/cet/, // brand-hub pages (junior 移除:它没有内联头,改用全局浮动头显示登录态)
/^\/auth/, /^\/talk/, /^\/placement/];


interface ProfileLite {
  display_name: string | null;
  username: string | null;
  email: string | null;
  is_guest: boolean;
}

function initialsFor(name: string): string {
  const t = name.trim();
  if (!t) return "?";
  // First grapheme handles emoji + CJK gracefully
  const first = Array.from(t)[0] || "?";
  return first.toUpperCase();
}

interface UserAvatarMenuProps {
  /** "fixed" = floating top-right (default). "inline" = sit inside an existing header. */
  variant?: "fixed" | "inline";
}

export default function UserAvatarMenu({ variant = "fixed" }: UserAvatarMenuProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileLite | null>(null);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setUserId(session?.user?.id ?? null);
      setEmail(session?.user?.email ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id ?? null);
      setEmail(session?.user?.email ?? null);
      if (event === "SIGNED_IN") {
        setJustLoggedIn(true);
        setTimeout(() => setJustLoggedIn(false), 4000);
      }
    });
    return () => {active = false;subscription.unsubscribe();};
  }, []);

  // Fetch profile
  useEffect(() => {
    if (!userId) {setProfile(null);return;}
    supabase.
    from("profiles").
    select("display_name, username, email, is_guest").
    eq("user_id", userId).
    maybeSingle().
    then(({ data }) => setProfile(data as ProfileLite | null ?? null));
  }, [userId]);

  // Inline variant always renders; fixed variant is suppressed on routes
  // whose own header already provides an inline avatar.
  if (variant === "fixed" && HIDE_ON.some((r) => r.test(pathname))) return null;

  const containerCls =
  variant === "fixed" ?
  "fixed right-3 top-3 z-50 md:right-4 md:top-4" :
  "relative";

  // Logged out — show a clear "Sign in" pill
  if (!userId) {
    return (
      <div className={containerCls}>
        <Link
          to="/auth"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-3 py-1.5 text-xs font-bold text-foreground shadow-sm backdrop-blur transition hover:bg-card"
          aria-label="登录">
          
          <LogIn className="size-3.5" />
          <span><T>登录</T></span>
        </Link>
      </div>);

  }

  const displayName =
  profile?.display_name?.trim() ||
  profile?.username?.trim() || (
  email ? email.split("@")[0] : "用户");
  const initials = initialsFor(displayName);
  const isGuest = profile?.is_guest === true;
  const shownEmail =
  isGuest || email && email.endsWith("guest.bigmoon.local") ? null : email;

  return (
    <div className={containerCls}>
      {/* Brief welcome toast on fresh sign-in */}
      {justLoggedIn &&
      <div className="pointer-events-none absolute right-12 top-1 hidden whitespace-nowrap rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-bold text-white shadow-md animate-in fade-in slide-in-from-right-2 md:block">
          <T>欢迎回来，</T>{displayName} 👋
        </div>
      }
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`已登录：${displayName}`}
          className="group relative inline-flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-amber-400 p-[2px] shadow-md ring-2 ring-background transition hover:scale-105">
          
          <span className="flex size-full items-center justify-center rounded-full bg-card text-sm font-extrabold text-foreground">
            {initials}
          </span>
          {/* Green online dot — universal "signed in" affordance */}
          <span
            aria-hidden
            className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background bg-emerald-500" />
          
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-foreground">{displayName}</span>
            {shownEmail &&
            <span className="text-[11px] font-normal text-muted-foreground">{shownEmail}</span>
            }
            <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <T>已登录</T>{isGuest ? " · 游客账号" : ""}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/me"><UserIcon className="mr-2 size-4" /><T>我的账户</T></Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/dashboard"><BarChart3 className="mr-2 size-4" /><T>学习进度</T></Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/mistakes"><BookMarked className="mr-2 size-4" /><T>错题本</T></Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              await supabase.auth.signOut();
              toast.success("已退出登录");
              navigate("/", { replace: true });
            }}
            className="text-rose-600 focus:text-rose-600">
            
            <LogOut className="mr-2 size-4" /><T>退出登录</T>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>);

}