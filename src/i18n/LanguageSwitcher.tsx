import { Globe } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LANGUAGES } from "./languages";
import { useI18n } from "./I18nProvider";

export function LanguageSwitcher() {
  const { lang, setLang, markPicked } = useI18n();
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-foreground shadow-sm transition hover:bg-secondary"
        aria-label="Language"
        title={current.nativeName}
      >
        <Globe className="size-4 text-primary" />
        <span className="text-base leading-none">{current.flag}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-[60vh] w-56 overflow-y-auto">
        {LANGUAGES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => { setLang(l.code); markPicked(); }}
            className={l.code === lang ? "font-semibold" : ""}
          >
            <span className="mr-2 text-base">{l.flag}</span>
            <span className="flex-1">{l.nativeName}</span>
            <span className="text-xs text-muted-foreground">{l.englishName}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}