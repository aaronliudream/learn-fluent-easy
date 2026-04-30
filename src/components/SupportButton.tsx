import { Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Low-key "Buy me a coffee" donation button.
 * Update DONATION_URL once you have your real Buy Me a Coffee / Ko-fi link.
 */
const DONATION_URL = "https://buymeacoffee.com/aarondream";

type Props = {
  variant?: "inline" | "footer";
  className?: string;
};

export function SupportButton({ variant = "inline", className = "" }: Props) {
  const { t } = useI18n();
  if (variant === "footer") {
    return (
      <footer className={`mt-12 flex flex-col items-center gap-2 border-t border-border/50 pt-6 pb-4 text-center text-xs text-muted-foreground ${className}`}>
        <a
          href={DONATION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors hover:bg-muted hover:text-foreground"
        >
          <Coffee className="size-3.5" />
          {t("support.cta")}
        </a>
        <p className="opacity-70">
          {t("support.thanks")}
        </p>
      </footer>
    );
  }

  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className={className}
    >
      <a href={DONATION_URL} target="_blank" rel="noopener noreferrer">
        <Coffee className="size-4" />
        {t("support.cta")}
      </a>
    </Button>
  );
}

export default SupportButton;