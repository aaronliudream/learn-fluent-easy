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
        <footer className={`mt-12 flex flex-col items-center gap-2 border-t border-border/50 pt-6 pb-4 text-center text-xs text-muted-foreground ${className}`}>
          <a
            href={isChinese ? "#" : DONATION_URL}
            target={isChinese ? undefined : "_blank"}
            rel={isChinese ? undefined : "noopener noreferrer"}
            onClick={handleClick}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors hover:bg-muted hover:text-foreground"
          >
            <Coffee className="size-3.5" />
            {t("support.cta")}
          </a>
          <p className="opacity-70">{t("support.thanks")}</p>
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
        <div className="grid grid-cols-2 gap-4 pt-2">
          <QrCard src="/donate/wechat.png" label={t("support.qrWechat")} accent="bg-emerald-500" />
          <QrCard src="/donate/alipay.png" label={t("support.qrAlipay")} accent="bg-sky-500" />
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