import { useState } from "react";
import { Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Donation entry point.
 *
 * - Chinese-language users (`lang === "zh"`) see a friendly dialog with
 *   WeChat Pay + Alipay QR codes (replace the PNGs in `public/donate/` with
 *   your real QR codes — file names: wechat.png, alipay.png).
 * - All other users see the existing Buy Me a Coffee link in a new tab.
 */
const DONATION_URL = "https://buymeacoffee.com/aarondream";

type Props = {
  variant?: "inline" | "footer";
  className?: string;
};

export function SupportButton({ variant = "inline", className = "" }: Props) {
  const { t, lang } = useI18n();
  const [qrOpen, setQrOpen] = useState(false);
  const isChinese = lang === "zh";

  const handleClick = (e: React.MouseEvent) => {
    if (isChinese) {
      e.preventDefault();
      setQrOpen(true);
    }
  };

  if (variant === "footer") {
    return (
      <>
        <footer className={`mt-12 pb-6 ${className}`}>
          <a
            href={isChinese ? "#" : DONATION_URL}
            target={isChinese ? undefined : "_blank"}
            rel={isChinese ? undefined : "noopener noreferrer"}
            onClick={handleClick}
            className="group relative mx-auto flex max-w-md items-center gap-4 overflow-hidden rounded-2xl border-2 border-amber-300/60 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 px-5 py-4 shadow-md transition-all hover:scale-[1.02] hover:shadow-lg dark:border-amber-500/30 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-900/30"
          >
            <div className="absolute -right-6 -top-6 size-24 rounded-full bg-amber-300/30 blur-2xl transition-all group-hover:bg-amber-400/40" />
            <div className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-md ring-2 ring-white/60 transition-transform group-hover:rotate-12 dark:ring-amber-200/20">
              <Coffee className="size-6 text-white" strokeWidth={2.5} />
            </div>
            <div className="relative flex-1 text-left">
              <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
                {t("support.cta")}
              </p>
              <p className="mt-0.5 text-xs text-amber-800/80 dark:text-amber-200/70">
                {t("support.thanks")}
              </p>
            </div>
            <span className="relative text-xl transition-transform group-hover:translate-x-1">→</span>
          </a>
        </footer>
        <DonateQrDialog open={qrOpen} onOpenChange={setQrOpen} />
      </>
    );
  }

  return (
    <>
      {isChinese ? (
        <Button variant="outline" size="sm" className={className} onClick={() => setQrOpen(true)}>
          <Coffee className="size-4" />
          {t("support.cta")}
        </Button>
      ) : (
        <Button asChild variant="outline" size="sm" className={className}>
          <a href={DONATION_URL} target="_blank" rel="noopener noreferrer">
            <Coffee className="size-4" />
            {t("support.cta")}
          </a>
        </Button>
      )}
      <DonateQrDialog open={qrOpen} onOpenChange={setQrOpen} />
    </>
  );
}

function DonateQrDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useI18n();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coffee className="size-5 text-primary" />
            {t("support.qrTitle")}
          </DialogTitle>
          <DialogDescription>{t("support.qrSubtitle")}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-2">
          <div className="w-1/2">
            <QrCard src="/donate/wechat.png" label={t("support.qrWechat")} accent="bg-emerald-500" />
          </div>
        </div>
        <p className="pt-1 text-center text-xs text-muted-foreground">{t("support.qrHowTo")}</p>
        <p className="text-center text-xs italic text-muted-foreground/80">{t("support.thanks")}</p>
      </DialogContent>
    </Dialog>
  );
}

function QrCard({ src, label, accent }: { src: string; label: string; accent: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="aspect-square w-full bg-white p-2">
        <img src={src} alt={label} className="h-full w-full object-contain" loading="lazy" />
      </div>
      <div className={`flex items-center justify-center gap-1.5 ${accent} px-2 py-1.5 text-xs font-semibold text-white`}>
        {label}
      </div>
    </div>
  );
}

export default SupportButton;