import { T } from "@/i18n/T";import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export type ItemState = "master" | "fluent" | "weak" | "none";
export type StageKey = "primary" | "junior" | "senior";

export interface ItemListDrawerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  stage: StageKey;
  module: string;
  state: ItemState;
  grade?: number;
  title: string;
}

interface Row {
  id: string;
  item_id: string;
  item_label: string | null;
  item_type: string | null;
  state: string;
  attempt_count: number | null;
  correct_count: number | null;
  wrong_count: number | null;
  due_at: string | null;
  last_review_at: string | null;
  updated_at: string | null;
}

const STATE_META: Record<ItemState, {dot: string;icon: string;label: string;}> = {
  master: { dot: "bg-gps-master", icon: "✅", label: "已掌握" },
  fluent: { dot: "bg-gps-fluent", icon: "✓", label: "熟练" },
  weak: { dot: "bg-gps-weak", icon: "⚠️", label: "薄弱" },
  none: { dot: "bg-gps-none", icon: "○", label: "未学" }
};

function fmtRel(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "—";
  const diff = Date.now() - d;
  const day = 86400000;
  if (diff < 0) {
    const dd = Math.ceil(-diff / day);
    return dd <= 1 ? "明天" : `${dd} 天后`;
  }
  if (diff < day) return "今天";
  const dd = Math.floor(diff / day);
  if (dd < 30) return `${dd} 天前`;
  if (dd < 365) return `${Math.floor(dd / 30)} 个月前`;
  return `${Math.floor(dd / 365)} 年前`;
}

function trainRoute(stage: StageKey, module: string, grade?: number): string {
  if (stage === "primary") return grade ? `/primary/hub/${grade}` : `/primary`;
  if (stage === "junior") return `/junior`;
  if (module === "vocab") return `/gaokao/vocab${grade ? `?grade=${grade - 9}` : ""}`;
  if (module === "grammar") return `/gaokao/grammar`;
  if (module === "reading") return `/gaokao/reading`;
  if (module === "cloze") return `/gaokao/cloze`;
  return `/gaokao`;
}

export function ItemListDrawer(props: ItemListDrawerProps) {
  const { open, onOpenChange, stage, module, state, grade, title } = props;
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setRows(null);
    setError(null);
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {setError("请先登录");setRows([]);return;}
      let q = supabase.
      from("unified_mastery").
      select("id,item_id,item_label,item_type,state,attempt_count,correct_count,wrong_count,due_at,last_review_at,updated_at").
      eq("user_id", user.id).
      eq("stage", stage).
      eq("module", module).
      eq("state", state).
      order("updated_at", { ascending: false }).
      limit(500);
      if (typeof grade === "number") q = q.eq("grade", grade);
      const { data, error: e } = await q;
      if (e) {setError(e.message);setRows([]);return;}
      setRows((data ?? []) as Row[]);
    })();
  }, [open, stage, module, state, grade]);

  const meta = STATE_META[state];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto bg-background sm:max-w-md">
        <SheetHeader className="text-left">
          <div className="flex items-center gap-2">
            <span className={`size-2.5 rounded-full ${meta.dot}`} />
            <SheetTitle className="text-lg font-bold">{title}</SheetTitle>
          </div>
          <p className="text-[11px] text-muted-foreground">
            <T>点击「再练一次」直接跳到对应练习</T>
          </p>
        </SheetHeader>

        {!rows &&
        <div className="mt-10 flex items-center justify-center text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
          </div>
        }

        {error &&
        <p className="mt-8 text-center text-xs text-destructive">{error}</p>
        }

        {rows && rows.length === 0 && !error &&
        <p className="mt-10 text-center text-sm text-muted-foreground"><T>这个分类还没有内容。</T></p>
        }

        {rows && rows.length > 0 &&
        <>
            <div className="mt-3 text-[11px] text-muted-foreground"><T>共</T> {rows.length} <T>项</T></div>
            <ul className="mt-2 space-y-2">
              {rows.map((r) => {
              const att = r.attempt_count ?? 0;
              const cor = r.correct_count ?? 0;
              const acc = att > 0 ? Math.round(cor / att * 100) : null;
              return (
                <li key={r.id} className="rounded-xl border border-border bg-card p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span aria-hidden className="text-sm">{meta.icon}</span>
                          <span className="truncate text-sm font-bold">
                            {r.item_label || r.item_id}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground tabular-nums">
                          {acc !== null && <span><T>答对率</T> {acc}% ({cor}/{att})</span>}
                          {r.last_review_at && <span><T>上次</T> {fmtRel(r.last_review_at)}</span>}
                          {r.due_at && <span><T>下次</T> {fmtRel(r.due_at)}</span>}
                        </div>
                      </div>
                      <Link
                      to={trainRoute(stage, module, grade)}
                      onClick={() => onOpenChange(false)}
                      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium hover:bg-muted">
                      
                        <Zap className="size-3" /> <T>再练</T>
                      </Link>
                    </div>
                  </li>);

            })}
            </ul>
          </>
        }
      </SheetContent>
    </Sheet>);

}