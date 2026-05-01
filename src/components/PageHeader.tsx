import { ArrowLeft, Home, Star, Brain } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { VoiceSettingsButton } from "@/components/VoiceSettings";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { T } from "@/i18n/T";
import { countDueReviews } from "@/lib/srs";

type Props = {
  title: string;
  subtitle?: string;
  back?: string | true;
};

export const PageHeader = ({ title, subtitle, back }: Props) => {
  const nav = useNavigate();
  const [due, setDue] = useState(0);

  // Light poll: fetch the due count once when the header mounts. We avoid
  // setting up a heavy realtime channel — the badge is just a nudge.
  useEffect(() => {
    let cancelled = false;
    countDueReviews().then((c) => {
      if (!cancelled) setDue(c);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {back && (
            <button
              onClick={() => (back === true ? nav(-1) : nav(back))}
              className="grid size-10 place-items-center rounded-full text-foreground/70 transition hover:bg-secondary hover:text-foreground"
              aria-label="Back"
            >
              <ArrowLeft className="size-5" />
            </button>
          )}
          <h1 className="text-grad-title text-3xl font-extrabold tracking-tight md:text-4xl">
            <T>{title}</T>
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <VoiceSettingsButton />
          <Link
            to="/review"
            className="relative grid size-10 place-items-center rounded-full text-primary transition hover:bg-primary/10"
            aria-label="Daily review"
          >
            <Brain className="size-5" />
            {due > 0 && (
              <span className="absolute right-0.5 top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">
                {due > 99 ? "99+" : due}
              </span>
            )}
          </Link>
          <Link
            to="/saved"
            className="grid size-10 place-items-center rounded-full text-amber-500 transition hover:bg-amber-100 hover:text-amber-600 dark:hover:bg-amber-500/10"
            aria-label="My saved phrases"
          >
            <Star className="size-5" />
          </Link>
          <Link
            to="/"
            className="grid size-10 place-items-center rounded-full text-foreground/60 transition hover:bg-secondary hover:text-foreground"
            aria-label="Home"
          >
            <Home className="size-5" />
          </Link>
        </div>
      </div>
      {subtitle && (
        <p className="ml-1 mt-2 text-sm text-muted-foreground md:ml-[52px]"><T>{subtitle}</T></p>
      )}
    </header>
  );
};