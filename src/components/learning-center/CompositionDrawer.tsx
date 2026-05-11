import { T } from "@/i18n/T";import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Row {
  stage: string;
  grade: number;
  module: string;
  master: number;
  fluent: number;
  weak: number;
  none: number;
  total: number;
}

const STAGE_LABEL: Record<string, string> = { primary: "小学", junior: "初中", senior: "高中" };
const MODULE_LABEL: Record<string, string> = {
  vocab: "词汇", grammar: "语法", reading: "阅读", listening: "听力",
  writing: "写作", cloze: "完形", phonics: "拼读"
};

export function CompositionDrawer({ open, onOpenChange }: {open: boolean;onOpenChange: (v: boolean) => void;}) {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    if (!open) return;
    setRows(null);
    (async () => {
      const { data } = await supabase.
      from("mastery_by_module").
      select("stage, grade, module, master, fluent, weak, none, total");
      setRows(data as Row[] || []);
    })();
  }, [open]);

  // Group: stage → grade → modules[]
  const grouped = (rows || []).reduce<Record<string, Record<number, Row[]>>>((acc, r) => {
    acc[r.stage] ??= {};
    acc[r.stage][r.grade] ??= [];
    acc[r.stage][r.grade].push(r);
    return acc;
  }, {});

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto bg-background">
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl font-bold"><T>学习构成</T></SheetTitle>
          <p className="text-xs text-muted-foreground"><T>按学段 · 年级 · 模块拆解</T></p>
        </SheetHeader>

        {!rows &&
        <div className="mt-8 flex items-center justify-center text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
          </div>
        }

        {rows && rows.length === 0 &&
        <p className="mt-8 text-center text-sm text-muted-foreground"><T>还没有数据，开始练习后会在此汇总。</T></p>
        }

        <div className="mt-5 space-y-6">
          {Object.entries(grouped).map(([stage, byGrade]) =>
          <section key={stage}>
              <h3 className="text-sm font-bold text-foreground">{STAGE_LABEL[stage] ?? stage}</h3>
              <div className="mt-2 space-y-3">
                {Object.entries(byGrade).
              sort(([a], [b]) => Number(a) - Number(b)).
              map(([grade, mods]) =>
              <div key={grade} className="rounded-xl border border-border bg-card p-3">
                      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                        <span>{stage === "primary" || stage === "junior" ? `${grade} 年级` : `高 ${Number(grade) - 9}`}</span>
                        <span>{mods.reduce((s, m) => s + m.total, 0)} <T>项</T></span>
                      </div>
                      <ul className="space-y-2">
                        {mods.map((m) =>
                  <ModuleRow key={`${stage}-${grade}-${m.module}`} row={m} />
                  )}
                      </ul>
                    </div>
              )}
              </div>
            </section>
          )}
        </div>
      </SheetContent>
    </Sheet>);

}

function ModuleRow({ row }: {row: Row;}) {
  const t = Math.max(1, row.total);
  const seg = (n: number) => `${n / t * 100}%`;
  return (
    <li>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold">{MODULE_LABEL[row.module] ?? row.module}</span>
        <span className="text-muted-foreground">{row.master}/{row.total}</span>
      </div>
      <div className="mt-1 flex h-2 w-full overflow-hidden rounded-full bg-gps-none">
        <div className="h-full bg-gps-master" style={{ width: seg(row.master) }} />
        <div className="h-full bg-gps-fluent" style={{ width: seg(row.fluent) }} />
        <div className="h-full bg-gps-weak" style={{ width: seg(row.weak) }} />
      </div>
    </li>);

}