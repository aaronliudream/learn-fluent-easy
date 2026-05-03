import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StarRating({ stars, size = 12, className }: { stars: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${stars}星`}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} style={{ width: size, height: size }}
          className={cn(i <= stars ? "fill-amber-400 text-amber-400" : "fill-transparent text-muted-foreground/40")}
          strokeWidth={2} />
      ))}
    </span>
  );
}