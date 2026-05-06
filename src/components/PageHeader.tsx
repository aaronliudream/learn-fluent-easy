import { ArrowLeft, Home, Star, Brain, MoreVertical, Globe, Settings2, UserCog, LogOut, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VoiceSettingsModal } from "@/components/VoiceSettings";
import { T } from "@/i18n/T";
import { countDueReviews } from "@/lib/srs";
import { useI18n } from "@/i18n/I18nProvider";
import { LANGUAGES } from "@/i18n/languages";

type Props = {
  title: string;
  subtitle?: string;
  back?: string | true;
  /** Hide the "X 个表达待复习" banner (e.g. on subject-specific pages like 高考英语). */
  hideReviewBanner?: boolean;
};

export const PageHeader = ({ title, subtitle, back, hideReviewBanner }: Props) => {
  const nav = useNavigate();
  const [due, setDue] = useState(0);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const { lang, setLang, markPicked } = useI18n();
  const [loggedIn, setLoggedIn] = useState(false);

  // Light poll: fetch the due review count once when header mounts.
  useEffect(() => {
    let cancelled = false;
    countDueReviews().then((c) => {
      if (!cancelled) setDue(c);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_e, session) => setLoggedIn(!!session),
    );
    return () => subscription.unsubscribe();
  }, []);

  const handleSwitchAccount = async () => {
    await supabase.auth.signOut();
    toast.success("已退出，请用其他账号登录");
    nav("/auth");
  };
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("已退出登录");
    nav("/");
  };

  return (
    <header className="mb-6">
      {/* Slim review banner — replaces the old brain icon. Only shows when there is something due. */}
      {due > 0 && !hideReviewBanner && (
        <Link
          to="/review"
          className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs transition hover:bg-primary/10"
        >
          <div className="flex items-center gap-2 text-primary">
            <Brain className="size-4" />
            <span className="font-semibold">
              今天有 {due > 99 ? "99+" : due} 个表达待复习
            </span>
            <span className="hidden text-muted-foreground sm:inline">
              · 按记忆曲线挑出来的
            </span>
          </div>
          <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground">
            去复习
          </span>
        </Link>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {back ? (
            <button
              onClick={() => (back === true ? nav(-1) : nav(back))}
              className="grid size-10 shrink-0 place-items-center rounded-full text-foreground/70 transition hover:bg-secondary hover:text-foreground"
              aria-label="Back"
            >
              <ArrowLeft className="size-5" />
            </button>
          ) : (
            <Link
              to="/"
              className="grid size-10 shrink-0 place-items-center rounded-full text-foreground/70 transition hover:bg-secondary hover:text-foreground"
              aria-label="Home"
            >
              <Home className="size-5" />
            </Link>
          )}
          <h1 className="text-grad-title truncate text-2xl font-extrabold tracking-tight md:text-4xl">
            <T>{title}</T>
          </h1>
        </div>

        {/* Single overflow menu collects everything else. */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="grid size-10 shrink-0 place-items-center rounded-full text-foreground/70 transition hover:bg-secondary hover:text-foreground"
            aria-label="More"
          >
            <MoreVertical className="size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link to="/" className="flex items-center gap-2">
                <Home className="size-4" /> 首页
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/review" className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Brain className="size-4" /> 智能复习
                </span>
                {due > 0 && (
                  <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {due > 99 ? "99+" : due}
                  </span>
                )}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/saved" className="flex items-center gap-2">
                <Star className="size-4 text-amber-500" /> 我的收藏
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {loggedIn ? (
              <>
                <DropdownMenuItem
                  onSelect={(e) => { e.preventDefault(); handleSwitchAccount(); }}
                  className="flex items-center gap-2"
                >
                  <UserCog className="size-4" /> 切换账号
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => { e.preventDefault(); handleSignOut(); }}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="size-4" /> 退出登录
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem asChild>
                <Link to="/auth" className="flex items-center gap-2">
                  <LogIn className="size-4" /> 登录
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setVoiceOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Settings2 className="size-4" /> 语音设置
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="flex items-center gap-2 text-xs">
              <Globe className="size-3.5" /> 显示语言
            </DropdownMenuLabel>
            <div className="max-h-56 overflow-y-auto">
              <DropdownMenuRadioGroup
                value={lang}
                onValueChange={(v) => {
                  setLang(v as typeof lang);
                  markPicked();
                }}
              >
                {LANGUAGES.map((l) => (
                  <DropdownMenuRadioItem key={l.code} value={l.code} className="text-sm">
                    <span className="mr-2 text-base">{l.flag}</span>
                    <span className="flex-1">{l.nativeName}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {subtitle && (
        <p className="ml-1 mt-2 text-sm text-muted-foreground md:ml-[52px]">
          <T>{subtitle}</T>
        </p>
      )}

      <VoiceSettingsModal open={voiceOpen} onOpenChange={setVoiceOpen} />
    </header>
  );
};
