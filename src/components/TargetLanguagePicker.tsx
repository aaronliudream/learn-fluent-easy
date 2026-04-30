import { GraduationCap } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TARGET_LANGUAGES, useTargetLanguage } from "@/hooks/useTargetLanguage";
import { useT } from "@/i18n/T";

/**
 * Lets the learner pick which language they want to study (English vs
 * Chinese). Persists to profile + localStorage, then reloads so the
 * course tree at module-init time reflects the new choice.
 */
export function TargetLanguagePicker() {
  const { language, setLanguage } = useTargetLanguage();
  const t = useT();
  const current = TARGET_LANGUAGES.find((l) => l.value === language) ?? TARGET_LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground/80 shadow-sm transition hover:bg-secondary"
        aria-label={t("我想学")}
        title={t("我想学")}
      >
        <GraduationCap className="size-3.5" />
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:inline">{current.native}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs">{t("我想学")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {TARGET_LANGUAGES.map((l) => (
          <DropdownMenuItem
            key={l.value}
            onClick={() => { if (l.value !== language) void setLanguage(l.value); }}
            className={l.value === language ? "font-semibold" : ""}
          >
            <span className="mr-2 text-base">{l.flag}</span>
            <span className="flex-1">{l.native}</span>
            <span className="text-xs text-muted-foreground">{l.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
