import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Globe, Check } from "lucide-react";
import { LANGUAGES, type LangCode } from "./languages";
import { useI18n } from "./I18nProvider";

export function LanguagePickerModal() {
  const { lang, setLang, hasPicked, markPicked, t } = useI18n();
  const [selected, setSelected] = useState<LangCode>(lang);

  if (hasPicked) return null;

  const onConfirm = () => {
    setLang(selected);
    markPicked();
  };

  // Sort: native names alphabetically, but English & user's detected lang to the top.
  const sorted = [...LANGUAGES].sort((a, b) => {
    if (a.code === selected) return -1;
    if (b.code === selected) return 1;
    if (a.code === "en") return -1;
    if (b.code === "en") return 1;
    return a.nativeName.localeCompare(b.nativeName);
  });

  return (
    <Dialog open onOpenChange={() => { /* lock */ }}>
      <DialogContent
        className="max-w-lg w-[calc(100vw-1rem)] max-h-[92vh] p-3 sm:p-6 flex flex-col gap-2"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Compact header: icon + title inline so the language list is visible above the fold on mobile */}
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Globe className="size-4" />
            </div>
            <DialogTitle className="text-base sm:text-2xl font-extrabold leading-tight">
              {t("lang.pickerTitle")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm">
            <span className="font-semibold text-primary">Choose your mother language</span>
            <span className="mx-1 opacity-40">·</span>
            <span>请选择你的母语</span>
            <span className="mx-1 opacity-40">·</span>
            <span>母国語</span>
            <span className="mx-1 opacity-40">·</span>
            <span>모국어</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid flex-1 min-h-0 grid-cols-2 gap-2 overflow-y-auto pr-1">
          {sorted.map((l) => {
            const isSel = l.code === selected;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => setSelected(l.code)}
                className={
                  "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition " +
                  (isSel
                    ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                    : "border-border hover:bg-secondary")
                }
              >
                <span className="text-2xl leading-none">{l.flag}</span>
                <span className="flex-1 min-w-0">
                  <span className="block truncate text-sm font-semibold">{l.nativeName}</span>
                  <span className="block truncate text-xs text-muted-foreground">{l.englishName}</span>
                </span>
                {isSel && <Check className="size-4 text-primary" />}
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex flex-col gap-2">
          <Button onClick={onConfirm} size="lg" className="w-full">
            {t("lang.confirm")}
          </Button>
          <p className="text-center text-xs text-muted-foreground">{t("lang.changeLater")}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}