import { useState } from "react";
import { Share2 } from "lucide-react";
import { ShareSheet } from "./ShareSheet";
import type { ShareItem } from "@/lib/share/types";
import { cn } from "@/lib/utils";

export function ShareButton({
  item,
  variant = "icon",
  className,
  label,
}: {
  item: ShareItem;
  variant?: "icon" | "pill" | "cta";
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const onClick = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setOpen(true); };

  let btn;
  if (variant === "icon") {
    btn = (
      <button onClick={onClick} aria-label="Share"
        className={cn("inline-grid size-9 place-items-center rounded-full border-2 border-border bg-card text-muted-foreground transition hover:border-primary hover:text-primary", className)}>
        <Share2 className="size-4" />
      </button>
    );
  } else if (variant === "pill") {
    btn = (
      <button onClick={onClick}
        className={cn("inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-card px-3 py-1.5 text-xs font-bold transition hover:border-primary hover:text-primary", className)}>
        <Share2 className="size-3.5" /> {label ?? "分享"}
      </button>
    );
  } else {
    btn = (
      <button onClick={onClick}
        className={cn("inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-tile transition hover:-translate-y-0.5", className)}>
        <Share2 className="size-4" /> {label ?? "📤 分享炫耀"}
      </button>
    );
  }

  return (<>
    {btn}
    <ShareSheet item={item} open={open} onClose={() => setOpen(false)} />
  </>);
}
