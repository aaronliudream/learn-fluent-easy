import { Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { T } from "@/i18n/T";

/**
 * Low-key "Buy me a coffee" donation button.
 * Update DONATION_URL once you have your real Buy Me a Coffee / Ko-fi link.
 */
const DONATION_URL = "https://www.buymeacoffee.com/fluentpath";

type Props = {
  variant?: "inline" | "footer";
  className?: string;
};

export function SupportButton({ variant = "inline", className = "" }: Props) {
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
          <T>如果喜欢这个 App，请我喝杯咖啡 ☕</T>
        </a>
        <p className="opacity-70">
          <T>感谢你的支持，让 FluentPath 变得更好。</T>
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
        <T>请我喝杯咖啡</T>
      </a>
    </Button>
  );
}

export default SupportButton;