import { ArrowLeft, Home, BookMarked, MoreVertical, Globe, Settings2, UserCog, LogOut, LogIn } from "lucide-react";
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
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import { VoiceSettingsModal } from "@/components/VoiceSettings";
import { T } from "@/i18n/T";
import { useI18n } from "@/i18n/I18nProvider";
import { LANGUAGES } from "@/i18n/languages";

type Props = {
  title: string;
  subtitle?: string;
  back?: string | true;
  /** 左上角显示「首页」胶囊按钮(带房子图标、紫色主调),点了回首页 `/`。优先级高于 back。 */
  homeButton?: boolean;
  /** @deprecated 复习横幅已下线(全站只保留「我的错题本」入口);保留此 prop 仅为兼容旧调用,已无效果。 */
  hideReviewBanner?: boolean;
};

export const PageHeader = ({ title, subtitle, back, homeButton }: Props) => {
  const nav = useNavigate();
  const [voiceOpen, setVoiceOpen] = useState(false);
  const { lang, setLang, markPicked } = useI18n();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_e, session) => setLoggedIn(!!session)
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
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {homeButton ?
          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-2 text-sm font-semibold text-primary shadow-sm ring-1 ring-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/15 hover:ring-primary/30 active:translate-y-0"
            aria-label="回首页">

              <Home className="size-4" /> <T>首页</T>
            </Link> :

          back ?
          <button
            onClick={() => back === true ? nav(-1) : nav(back)}
            className="grid size-10 shrink-0 place-items-center rounded-full text-foreground/70 transition hover:bg-secondary hover:text-foreground"
            aria-label="Back">

              <ArrowLeft className="size-5" />
            </button> :

          <Link
            to="/"
            className="grid size-10 shrink-0 place-items-center rounded-full text-foreground/70 transition hover:bg-secondary hover:text-foreground"
            aria-label="Home">

              <Home className="size-5" />
            </Link>
          }
          <h1 className="text-grad-title truncate text-2xl font-extrabold tracking-tight md:text-4xl">
            <T>{title}</T>
          </h1>
        </div>

        {/* Single overflow menu collects everything else. */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="grid size-10 shrink-0 place-items-center rounded-full text-foreground/70 transition hover:bg-secondary hover:text-foreground"
            aria-label="More">
            
            <MoreVertical className="size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link to="/" className="flex items-center gap-2">
                <Home className="size-4" /> <T>首页</T>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/mistakes" className="flex items-center gap-2">
                <BookMarked className="size-4" /> <T>我的错题本</T>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            {loggedIn ?
            <>
                <DropdownMenuItem
                onSelect={(e) => {e.preventDefault();handleSwitchAccount();}}
                className="flex items-center gap-2">
                
                  <UserCog className="size-4" /> <T>切换账号</T>
                </DropdownMenuItem>
                <DropdownMenuItem
                onSelect={(e) => {e.preventDefault();handleSignOut();}}
                className="flex items-center gap-2 text-destructive focus:text-destructive">
                
                  <LogOut className="size-4" /> <T>退出登录</T>
                </DropdownMenuItem>
              </> :

            <DropdownMenuItem asChild>
                <Link to="/auth" className="flex items-center gap-2">
                  <LogIn className="size-4" /> <T>登录</T>
                </Link>
              </DropdownMenuItem>
            }

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setVoiceOpen(true);
              }}
              className="flex items-center gap-2">
              
              <Settings2 className="size-4" /> <T>语音设置</T>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="flex items-center gap-2 text-xs">
              <Globe className="size-3.5" /> <T>显示语言</T>
            </DropdownMenuLabel>
            <div className="max-h-56 overflow-y-auto">
              <DropdownMenuRadioGroup
                value={lang}
                onValueChange={(v) => {
                  setLang(v as typeof lang);
                  markPicked();
                }}>
                
                {LANGUAGES.map((l) =>
                <DropdownMenuRadioItem key={l.code} value={l.code} className="text-sm">
                    <span className="mr-2 text-base">{l.flag}</span>
                    <span className="flex-1">{l.nativeName}</span>
                  </DropdownMenuRadioItem>
                )}
              </DropdownMenuRadioGroup>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {subtitle &&
      <p className="ml-1 mt-2 text-sm text-muted-foreground md:ml-[52px]">
          <T>{subtitle}</T>
        </p>
      }

      <VoiceSettingsModal open={voiceOpen} onOpenChange={setVoiceOpen} />
    </header>);

};