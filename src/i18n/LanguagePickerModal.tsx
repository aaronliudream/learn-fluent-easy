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
      <DialogContent className="max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mb-2 inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Globe className="size-6" />
          </div>
          <DialogTitle className="text-2xl font-extrabold">{t("lang.pickerTitle")}</DialogTitle>
          <DialogDescription>{t("lang.pickerSubtitle")}</DialogDescription>
        </DialogHeader>

        <div className="my-2 grid max-h-[50vh] grid-cols-2 gap-2 overflow-y-auto pr-1">
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