/**
 * 场景串记列表(/vocab/scenes)· 纯展示,零写入。
 *
 * 30 个生活场景,每个把 8-15 个说法按事情发生的顺序串成一条链,末尾一篇短文全串回去。
 *
 * 版式照 docs/vocab-bank/VOCAB_DESIGN_SPEC.md:白卡 + 细边 + 大留白,
 * 本页没有主 CTA(进哪个场景由用户挑),所以**一处渐变都没有**。
 *
 * ⚠️ 分类筛选依赖 vocab_scene_packs.category(SQLAA/vocab_scene_meta.sql 才补上)。
 *    那条 SQL 没跑时全库 category 为 null —— 此时**整行筛选钮不渲染**,
 *    而不是渲染出一排点了就清空列表的死钮。
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronRight, Link2 } from "lucide-react";
import BackLink from "@/components/BackLink";
import { cn } from "@/lib/utils";
import { FONT_STAT, SCENE_COLOR } from "@/lib/vocab/theme";
import {
  listScenePacks, readSeenScenes, SCENE_CATEGORIES,
  type SceneCategory, type ScenePackListRow,
} from "@/lib/vocab/scenes";

/** 筛选钮文案:库里存全称,钮上显示短名(一行放得下五个)。 */
const CHIP_LABEL: Record<SceneCategory, string> = {
  日常生活: "日常",
  校园学习: "校园",
  工作职场: "职场",
  出行旅游: "出行",
  社会科技: "社会科技",
};

export default function VocabScenes() {
  const [packs, setPacks] = useState<ScenePackListRow[]>([]);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [cat, setCat] = useState<SceneCategory | null>(null);
  const [seen, setSeen] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let alive = true;
    setState("loading");
    (async () => {
      try {
        const list = await listScenePacks();
        if (!alive) return;
        setPacks(list);
        /* 已学标记读本地 —— 放在数据回来之后一起 set,
           避免"卡片先出、对勾后跳"的二段闪。 */
        setSeen(readSeenScenes());
        setState("ok");
      } catch {
        if (alive) setState("error");
      }
    })();
    return () => { alive = false; };
  }, []);

  /* 库里真实出现过的分类才给钮。SQL 没跑时这里是空数组 → 整行不渲染。 */
  const availableCats = useMemo(() => {
    const present = new Set(packs.map(p => p.category).filter(Boolean) as SceneCategory[]);
    return SCENE_CATEGORIES.filter(c => present.has(c));
  }, [packs]);

  const shown = useMemo(
    () => (cat ? packs.filter(p => p.category === cat) : packs),
    [packs, cat],
  );

  const seenCount = useMemo(
    () => packs.filter(p => seen.has(p.id)).length,
    [packs, seen],
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="h-[3px] w-full" style={{ background: SCENE_COLOR }} />
      <div className="mx-auto w-full max-w-[720px] px-4 pb-16 pt-4">
        <BackLink to="/vocab" className="mb-3 inline-flex items-center gap-1 text-[14px] text-slate-500">
          ← 词汇中心
        </BackLink>

        <h1 className="mb-1 text-[26px] font-bold tracking-tight text-slate-900">场景串记</h1>
        <p className="mb-5 text-[14px] text-slate-500">
          30 个生活场景,把单词串成一篇作文
          {state === "ok" && packs.length > 0 && (
            <>
              {" · 已读 "}
              <b className="font-semibold text-slate-700" style={{ fontVariantNumeric: "tabular-nums" }}>
                {seenCount}/{packs.length}
              </b>
            </>
          )}
        </p>

        {availableCats.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            <Chip active={cat === null} onClick={() => setCat(null)} label="全部" />
            {availableCats.map(c => (
              <Chip key={c} active={cat === c} onClick={() => setCat(c)} label={CHIP_LABEL[c]} />
            ))}
          </div>
        )}

        {state === "loading" ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-[92px] animate-pulse rounded-2xl border border-black/[0.06] bg-white" />
            ))}
          </div>
        ) : state === "error" ? (
          <div className="rounded-2xl border border-black/[0.06] bg-white p-6 text-center">
            <p className="text-[15px] text-slate-600">场景加载失败</p>
            <button onClick={() => window.location.reload()}
              className="mt-3 rounded-full border border-black/[0.08] px-4 py-1.5 text-[14px] text-slate-700">
              重试
            </button>
          </div>
        ) : shown.length === 0 ? (
          <div className="rounded-2xl border border-black/[0.06] bg-white p-6 text-center text-[14px] text-slate-500">
            {packs.length === 0 ? "场景还没上线" : "这个分类下还没有场景"}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {shown.map(p => <SceneCard key={p.id} pack={p} seen={seen.has(p.id)} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-[13px] transition-colors",
        active ? "border-transparent text-white" : "border-black/[0.08] bg-white text-slate-600 active:bg-slate-50",
      )}
      style={active ? { backgroundColor: SCENE_COLOR } : undefined}>
      {label}
    </button>
  );
}

function SceneCard({ pack, seen }: { pack: ScenePackListRow; seen: boolean }) {
  return (
    <Link to={`/vocab/scenes/${pack.id}`}
      className="group flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white px-4 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      {/* 身份色徽章:淡色圆片 + 链条图标。身份色只做标识,不做大面积填充 */}
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${SCENE_COLOR}1F` }}>
        <Link2 className="h-[18px] w-[18px]" style={{ color: SCENE_COLOR }} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[16px] font-semibold text-slate-900">{pack.title_zh}</span>
          {seen && (
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700">
              <Check className="h-3 w-3" />已学
            </span>
          )}
        </div>
        <div className="truncate text-[13px] text-slate-400">{pack.theme_en}</div>
        <div className="mt-1.5 text-[12px] text-slate-400" style={{ fontVariantNumeric: "tabular-nums" }}>
          <b className="font-semibold text-slate-500" style={{ fontFamily: FONT_STAT }}>{pack.nodeCount}</b> 环
          {" · 短文 "}
          <b className="font-semibold text-slate-500" style={{ fontFamily: FONT_STAT }}>{pack.essayWords}</b> 词
        </div>
      </div>
      <ChevronRight className="h-[18px] w-[18px] shrink-0 text-slate-300" />
    </Link>
  );
}
