import { T } from "@/i18n/T";import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, Clock, AlertTriangle, Sprout, Trophy, Sparkles } from "lucide-react";
import BackLink from "@/components/BackLink";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

/** Unified list page for the 5 cohorts on the GPS Learning Center. */

type State = "master" | "fluent" | "weak" | "none";
type Stage = "all" | "primary" | "junior" | "senior";
type Cohort = "weak" | "due" | "none" | "master" | "recent";

interface Row {
  id: string;
  stage: string;
  grade: number;
  module: string;
  item_id: string;
  item_label: string | null;
  state: State;
  attempt_count: number;
  correct_count: number;
  wrong_count: number;
  due_at: string | null;
  last_review_at: string | null;
  updated_at: string;
}

const COHORTS: Record<Cohort, {title: string;subtitle: string;icon: any;tone: string;}> = {
  weak: { title: "高频薄弱", subtitle: "错得最多 · 优先攻克", icon: AlertTriangle, tone: "text-gps-weak" },
  due: { title: "今日到期", subtitle: "按记忆曲线推送", icon: Clock, tone: "text-gps-weak" },
  none: { title: "全部未学", subtitle: "还没碰过的知识点", icon: Sprout, tone: "text-muted-foreground" },
  master: { title: "已掌握成就", subtitle: "稳定通过的知识点", icon: Trophy, tone: "text-gps-master" },
  recent: { title: "最近练习", subtitle: "近 7 天活跃", icon: Sparkles, tone: "text-gps-fluent" }
};

const STAGE_LABEL: Record<Stage, string> = { all: "全部", primary: "小学", junior: "初中", senior: "高中" };
const MODULE_LABEL: Record<string, string> = {
  vocab: "词汇", grammar: "语法", reading: "阅读", listening: "听力",
  writing: "写作", cloze: "完形", phonics: "拼读"
};
const STATE_DOT: Record<State, string> = {
  master: "bg-gps-master", fluent: "bg-gps-fluent", weak: "bg-gps-weak", none: "bg-gps-none"
};

const PAGE_SIZE = 50;

export default function LearningCenterList() {
  const [sp, setSp] = useSearchParams();
  const cohort = sp.get("cohort") as Cohort || "weak";
  const stage = sp.get("stage") as Stage || "all";

  const [rows, setRows] = useState<Row[] | null>(null);
  const meta = COHORTS[cohort] ?? COHORTS.weak;
  const Icon = meta.icon;

  useEffect(() => {
    setRows(null);
    (async () => {
      let q = supabase.from("unified_mastery").select(
        "id, stage, grade, module, item_id, item_label, state, attempt_count, correct_count, wrong_count, due_at, last_review_at, updated_at"
      ).limit(PAGE_SIZE);

      if (stage !== "all") q = q.eq("stage", stage);

      switch (cohort) {
        case "weak":
          q = q.eq("state", "weak").order("wrong_count", { ascending: false });
          break;
        case "due":
          q = q.in("state", ["weak", "fluent"]).lte("due_at", new Date().toISOString()).order("due_at", { ascending: true });
          break;
        case "none":
          q = q.eq("state", "none").order("updated_at", { ascending: false });
          break;
        case "master":
          q = q.eq("state", "master").order("last_review_at", { ascending: false });
          break;
        case "recent":{
            const since = new Date(Date.now() - 7 * 86400_000).toISOString();
            q = q.gte("updated_at", since).order("updated_at", { ascending: false });
            break;
          }
      }
      const { data } = await q;
      setRows(data as Row[] || []);
    })();
  }, [cohort, stage]);

  const grouped = useMemo(() => {
    const out: Record<string, Row[]> = {};
    (rows || []).forEach((r) => {
      const k = `${r.stage}-${r.module}`;
      (out[k] ??= []).push(r);
    });
    return out;
  }, [rows]);

  const setQuery = (next: Partial<{cohort: Cohort;stage: Stage;}>) => {
    const merged = new URLSearchParams(sp);
    if (next.cohort) merged.set("cohort", next.cohort);
    if (next.stage) merged.set("stage", next.stage);
    setSp(merged, { replace: true });
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6">
      <BackLink to="/learning-center" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> <T>返回学习地图</T>
      </BackLink>

      <header className="mb-4 flex items-center gap-3">
        <Icon className={cn("size-6", meta.tone)} />
        <div>
          <h1 className="text-xl font-extrabold"><T>{meta.title}</T></h1>
          <p className="text-xs text-muted-foreground"><T>{meta.subtitle}</T></p>
        </div>
      </header>

      {/* Cohort tabs */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {(Object.keys(COHORTS) as Cohort[]).map((c) =>
        <button
          key={c}
          onClick={() => setQuery({ cohort: c })}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-bold transition",
            cohort === c ?
            "border-foreground bg-foreground text-background" :
            "border-border bg-card text-muted-foreground hover:bg-muted"
          )}>
          
            <T>{COHORTS[c].title}</T>
          </button>
        )}
      </div>

      {/* Stage tabs */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(["all", "primary", "junior", "senior"] as Stage[]).map((s) =>
        <button
          key={s}
          onClick={() => setQuery({ stage: s })}
          className={cn(
            "rounded-full border px-3 py-1 text-[11px] font-bold",
            stage === s ?
            "border-gps-master bg-gps-master/10 text-gps-master" :
            "border-border bg-background text-muted-foreground hover:bg-muted"
          )}>
          
            {STAGE_LABEL[s]}
          </button>
        )}
      </div>

      {/* Empty / loading */}
      {rows === null &&
      <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      }
      {rows && rows.length === 0 &&
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground"><T>这一类暂时没有内容 🌿</T></p>
        </div>
      }

      {/* Grouped list */}
      {rows && rows.length > 0 &&
      <div className="space-y-5">
          {Object.entries(grouped).map(([key, items]) => {
          const [st, mod] = key.split("-");
          return (
            <section key={key}>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {STAGE_LABEL[st as Stage] ?? st} · {MODULE_LABEL[mod] ?? mod}
                  </h2>
                  <span className="text-[11px] text-muted-foreground">{items.length}</span>
                </div>
                <ul className="overflow-hidden rounded-xl border border-border bg-card divide-y divide-border">
                  {items.map((r) =>
                <li key={r.id} className="flex items-center gap-3 px-3 py-2.5">
                      <span className={cn("size-2 shrink-0 rounded-full", STATE_DOT[r.state])} />
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-sm font-semibold">{r.item_label || r.item_id}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                          {r.attempt_count} <T>次 · 错</T> {r.wrong_count}
                          {r.due_at && cohort === "due" &&
                      <> <T>· 到期</T> {new Date(r.due_at).toLocaleDateString("zh-CN")}</>
                      }
                          {r.last_review_at && cohort === "master" &&
                      <> <T>· 上次</T> {new Date(r.last_review_at).toLocaleDateString("zh-CN")}</>
                      }
                        </div>
                      </div>
                      <Link
                    to={moduleLink(r)}
                    className="rounded-full border border-border px-2.5 py-1 text-[11px] font-bold text-foreground hover:bg-muted">
                        <T>练</T>
                      
                  </Link>
                    </li>
                )}
                </ul>
              </section>);

        })}
          {rows.length === PAGE_SIZE &&
        <p className="text-center text-xs text-muted-foreground"><T>仅显示前</T> {PAGE_SIZE} <T>条 · 完成一些后再回来</T></p>
        }
        </div>
      }
    </main>);

}

function moduleLink(r: Row): string {
  const stagePrefix =
  r.stage === "primary" ? "/primary" : r.stage === "junior" ? "/junior" : "/gaokao";
  switch (r.module) {
    case "vocab":return `${stagePrefix}/vocab`;
    case "grammar":return `${stagePrefix}/grammar`;
    case "reading":return `${stagePrefix}/reading`;
    case "listening":return `${stagePrefix}/listening`;
    case "writing":return `${stagePrefix}/writing`;
    case "cloze":return `${stagePrefix}/cloze`;
    case "phonics":return `${stagePrefix}/letters`;
    default:return "/learning-center";
  }
}