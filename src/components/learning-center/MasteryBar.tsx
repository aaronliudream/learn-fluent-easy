import { T } from "@/i18n/T";import { cn } from "@/lib/utils";

/**
 * 4-color mastery distribution bar — strict GPS palette
 * #1D9E75 master · #97C459 fluent · #EF9F27 weak · #D3D1C7 none
 */
export function MasteryBar({
  master, fluent, weak, none,
  className,
  height = 8




}: {master: number;fluent: number;weak: number;none: number;className?: string;height?: number;}) {
  const total = Math.max(0, master + fluent + weak + none);
  if (total === 0) {
    return (
      <div
        className={cn("w-full overflow-hidden rounded-full bg-gps-none", className)}
        style={{ height }}
        aria-label="empty mastery bar" />);


  }
  const pct = (n: number) => `${n / total * 100}%`;
  return (
    <div
      className={cn("flex w-full overflow-hidden rounded-full bg-gps-none", className)}
      style={{ height }}
      role="img"
      aria-label={`已掌握 ${master} · 熟练 ${fluent} · 薄弱 ${weak} · 未学 ${none}`}>
      
      {master > 0 && <div className="h-full bg-gps-master" style={{ width: pct(master) }} />}
      {fluent > 0 && <div className="h-full bg-gps-fluent" style={{ width: pct(fluent) }} />}
      {weak > 0 && <div className="h-full bg-gps-weak" style={{ width: pct(weak) }} />}
    </div>);

}

export function MasteryCounts({
  master, fluent, weak, none,
  className
}: {master: number;fluent: number;weak: number;none: number;className?: string;}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-muted-foreground", className)}>
      <Dot color="bg-gps-master" /> <span><T>掌握</T> <strong className="text-foreground tabular-nums font-medium">{master}</strong></span>
      <Dot color="bg-gps-fluent" /> <span><T>熟练</T> <strong className="text-foreground tabular-nums font-medium">{fluent}</strong></span>
      <Dot color="bg-gps-weak" />   <span><T>薄弱</T> <strong className="text-foreground tabular-nums font-medium">{weak}</strong></span>
      <Dot color="bg-gps-none" />   <span><T>未学</T> <strong className="text-foreground tabular-nums font-medium">{none}</strong></span>
    </div>);

}

function Dot({ color }: {color: string;}) {
  return <span className={cn("inline-block size-2 rounded-full", color)} />;
}