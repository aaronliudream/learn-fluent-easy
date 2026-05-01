import { useState } from "react";
import { Coffee, Heart, Sparkles } from "lucide-react";
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
        <footer className={`mt-12 flex flex-col items-center gap-3 pt-8 pb-6 text-center ${className}`}>
          <a
            href={isChinese ? "#" : DONATION_URL}
            target={isChinese ? undefined : "_blank"}
            rel={isChinese ? undefined : "noopener noreferrer"}
            onClick={handleClick}
            className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-amber-400 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-400/30 transition-all hover:scale-[1.04] hover:shadow-xl hover:shadow-pink-400/40 active:scale-95"
          >
            <span className="absolute -left-1 -top-1 grid size-5 place-items-center rounded-full bg-white/95 text-amber-500 shadow-sm transition-transform group-hover:rotate-12">
              <Sparkles className="size-3" />
            </span>
            <Coffee className="size-4 transition-transform group-hover:-rotate-12" />
            <span>{t("support.cta")}</span>
            <Heart className="size-3.5 fill-white text-white animate-pulse" />
          </a>
          <p className="text-xs font-medium text-muted-foreground/90">
            <span className="text-rose-400">♡</span> {t("support.thanks")} <span className="text-rose-400">♡</span>
          </p>
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