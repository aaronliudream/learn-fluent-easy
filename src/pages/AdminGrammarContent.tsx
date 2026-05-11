import { T } from "@/i18n/T";import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Pencil,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Save,
  X } from
"lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * Internal admin page · /admin/grammar-content
 *
 * Lets the admin batch-populate Junior grammar points using the
 * `generate-grammar-content` edge function. Auth model mirrors
 * AdminFeedback.tsx — must have role='admin' in user_roles table.
 *
 * Workflow:
 *   1. List all junior_grammar_points with their current content_depth
 *   2. "✨ AI 生成草稿"  → calls edge function, writes draft to DB
 *   3. "✏️ 编辑内容"   → opens JSON editor with current jsonb fields
 *   4. "👁 预览学习页" → opens /junior/grammar/{id} in new tab
 *   5. Batch mode      → multi-select + sequential generation with progress
 */

type Cat = {id: string;name_cn: string;emoji: string;sort_order: number;};

type Pt = {
  id: string;
  category_id: string;
  code: string;
  title: string;
  cefr: string;
  grade: number;
  summary: string | null;
  explanation_md: string;
  teacher_script: any[] | null;
  immersion_cards: any[] | null;
  mnemonic: string | null;
  content_depth: number | null;
};

type QCounts = Record<string, {total: number;rich: number;}>;

const DEPTH_LABEL: Record<number, {label: string;color: string;}> = {
  0: { label: "未生成", color: "text-muted-foreground bg-muted" },
  1: { label: "只有讲解", color: "text-sky-700 bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300" },
  2: { label: "讲解+沉浸", color: "text-emerald-700 bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300" },
  3: { label: "完整 ✨", color: "text-amber-700 bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300" }
};

export default function AdminGrammarContent() {
  // ─── Auth gate (mirrors AdminFeedback.tsx) ───
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // ─── Data ───
  const [cats, setCats] = useState<Cat[]>([]);
  const [pts, setPts] = useState<Pt[]>([]);
  const [qCounts, setQCounts] = useState<QCounts>({});
  const [loading, setLoading] = useState(true);

  // ─── UI state ───
  const [filter, setFilter] = useState<"all" | "empty" | "drafted">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ done: 0, total: 0, currentTitle: "" });
  const [generating, setGenerating] = useState<Set<string>>(new Set());

  // ─── Editor modal state ───
  const [editTarget, setEditTarget] = useState<Pt | null>(null);
  const [editJSON, setEditJSON] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  // ─── Initial auth + data load ───
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      setAuthed(!!u?.user);
      if (!u?.user) {setLoading(false);return;}
      const { data: roles } = await supabase.
      from("user_roles").
      select("role").
      eq("user_id", u.user.id).
      eq("role", "admin").
      maybeSingle();
      setIsAdmin(!!roles);
      if (!roles) {setLoading(false);return;}
      await loadAll();
      setLoading(false);
    })();
  }, []);

  const loadAll = async () => {
    const [c, p, q] = await Promise.all([
    supabase.from("junior_grammar_categories").select("*").order("sort_order"),
    supabase.
    from("junior_grammar_points").
    select("id,category_id,code,title,cefr,grade,summary,explanation_md,teacher_script,immersion_cards,mnemonic,content_depth").
    order("sort_order"),
    supabase.
    from("junior_grammar_questions").
    select("point_id,distractors,use_ai_grading")]
    );
    setCats((c.data ?? []) as Cat[]);
    setPts((p.data ?? []) as Pt[]);

    // Aggregate question counts per point
    const counts: QCounts = {};
    for (const row of (q.data ?? []) as {point_id: string;distractors: any[];use_ai_grading: boolean;}[]) {
      counts[row.point_id] = counts[row.point_id] || { total: 0, rich: 0 };
      counts[row.point_id].total += 1;
      if (Array.isArray(row.distractors) && row.distractors.length > 0 || row.use_ai_grading) {
        counts[row.point_id].rich += 1;
      }
    }
    setQCounts(counts);
  };

  // ─── Filtered list ───
  const filteredPts = useMemo(() => {
    return pts.filter((p) => {
      const depth = p.content_depth ?? 0;
      if (filter === "empty") return depth === 0;
      if (filter === "drafted") return depth > 0;
      return true;
    });
  }, [pts, filter]);

  const ptsByCat = useMemo(() => {
    const m: Record<string, Pt[]> = {};
    for (const p of filteredPts) {
      if (!m[p.category_id]) m[p.category_id] = [];
      m[p.category_id].push(p);
    }
    return m;
  }, [filteredPts]);

  const stats = useMemo(() => {
    const total = pts.length;
    const empty = pts.filter((p) => (p.content_depth ?? 0) === 0).length;
    const drafted = total - empty;
    const full = pts.filter((p) => (p.content_depth ?? 0) === 3).length;
    return { total, empty, drafted, full };
  }, [pts]);

  // ─── Single-point AI generation ───
  const generateOne = async (pt: Pt): Promise<boolean> => {
    setGenerating((s) => {const next = new Set(s);next.add(pt.id);return next;});
    try {
      const { data, error } = await supabase.functions.invoke("generate-grammar-content", {
        body: {
          pointTitle: pt.title,
          pointSummary: pt.summary || pt.explanation_md?.slice(0, 200) || "",
          cefr: pt.cefr,
          grade: pt.grade,
          parts: ["teacher_script", "immersion_cards", "mnemonic", "questions"],
          numQuestions: { mcq: 3, fill: 1, transform: 1, correction: 1 }
        }
      });
      if (error || !data) {
        toast.error(`生成失败：${pt.title}`, { description: error?.message || "AI 网关无响应" });
        return false;
      }

      // 1. Update grammar_point with rich-content fields
      const updatePayload: Record<string, unknown> = {
        content_depth: data._suggested_content_depth ?? 3
      };
      if (data.teacher_script) updatePayload.teacher_script = data.teacher_script;
      if (data.immersion_cards) updatePayload.immersion_cards = data.immersion_cards;
      if (data.mnemonic) updatePayload.mnemonic = data.mnemonic;

      const { error: upErr } = await supabase.
      from("junior_grammar_points").
      update(updatePayload as any).
      eq("id", pt.id);
      if (upErr) {
        toast.error(`保存失败：${pt.title}`, { description: upErr.message });
        return false;
      }

      // 2. Insert questions (only if AI returned them; preserve existing questions if any)
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        // Decide whether to wipe existing questions or append. For safety we
        // only insert new questions if there are zero existing ones — never
        // wipe human-curated content automatically.
        const existing = qCounts[pt.id]?.total ?? 0;
        if (existing === 0) {
          const rows = data.questions.map((q: any, idx: number) => ({
            point_id: pt.id,
            stem: q.stem,
            option_a: q.option_a || "",
            option_b: q.option_b || "",
            option_c: q.option_c || "",
            option_d: q.option_d || "",
            correct_answer: q.correct_answer || null,
            accepted_answers: q.accepted_answers || null,
            explanation: q.explanation || "",
            question_type: q.question_type || "mcq",
            distractors: q.distractors || [],
            grammar_topic: q.grammar_topic || null,
            use_ai_grading: q.question_type !== "mcq",
            difficulty: q.difficulty || 2,
            sort_order: idx
          }));
          const { error: qErr } = await supabase.from("junior_grammar_questions").insert(rows);
          if (qErr) {
            toast.warning(`题目插入失败（其他内容已保存）`, { description: qErr.message });
          }
        }
      }

      // Optimistically refresh local state so the ✨ badge updates immediately
      setPts((prev) =>
      prev.map((x) =>
      x.id === pt.id ?
      {
        ...x,
        content_depth: updatePayload.content_depth as number ?? x.content_depth,
        teacher_script: updatePayload.teacher_script as any[] ?? x.teacher_script,
        immersion_cards: updatePayload.immersion_cards as any[] ?? x.immersion_cards,
        mnemonic: updatePayload.mnemonic as string ?? x.mnemonic
      } :
      x
      )
      );
      toast.success(`✨ 已生成：${pt.title}`);
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(`生成出错：${pt.title}`, { description: msg });
      return false;
    } finally {
      setGenerating((s) => {const next = new Set(s);next.delete(pt.id);return next;});
    }
  };

  // ─── Batch generation (sequential to avoid rate limits) ───
  const runBatch = async () => {
    if (selected.size === 0) {
      toast.info("请先勾选要生成的语法点");
      return;
    }
    const targets = pts.filter((p) => selected.has(p.id));
    setBatchRunning(true);
    setBatchProgress({ done: 0, total: targets.length, currentTitle: "" });
    let succeeded = 0;
    for (let i = 0; i < targets.length; i++) {
      const pt = targets[i];
      setBatchProgress({ done: i, total: targets.length, currentTitle: pt.title });
      const ok = await generateOne(pt);
      if (ok) succeeded++;
      // Brief pause to avoid hammering the gateway
      await new Promise((r) => setTimeout(r, 300));
    }
    await loadAll();
    setBatchRunning(false);
    setSelected(new Set());
    toast.success(`批量生成完成：${succeeded}/${targets.length}`);
  };

  // ─── Selection helpers ───
  const toggleOne = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);else
      next.add(id);
      return next;
    });
  };
  const selectAllEmpty = () => {
    setSelected(new Set(pts.filter((p) => (p.content_depth ?? 0) === 0).map((p) => p.id)));
  };
  const selectAllVisible = () => {
    setSelected(new Set(filteredPts.map((p) => p.id)));
  };
  const clearSelection = () => setSelected(new Set());

  // ─── Editor modal ───
  const openEditor = (pt: Pt) => {
    setEditTarget(pt);
    setEditJSON(JSON.stringify({
      teacher_script: pt.teacher_script || [],
      immersion_cards: pt.immersion_cards || [],
      mnemonic: pt.mnemonic || ""
    }, null, 2));
    setEditError(null);
  };
  const saveEditor = async () => {
    if (!editTarget) return;
    let parsed: {teacher_script?: any[];immersion_cards?: any[];mnemonic?: string;};
    try {
      parsed = JSON.parse(editJSON);
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "JSON 解析失败");
      return;
    }
    if (!Array.isArray(parsed.teacher_script) && parsed.teacher_script !== undefined) {
      setEditError("teacher_script 必须是数组");
      return;
    }
    if (!Array.isArray(parsed.immersion_cards) && parsed.immersion_cards !== undefined) {
      setEditError("immersion_cards 必须是数组");
      return;
    }
    setEditSaving(true);
    let depth = 0;
    if (parsed.teacher_script && parsed.teacher_script.length > 0) depth = Math.max(depth, 1);
    if (parsed.immersion_cards && parsed.immersion_cards.length > 0) depth = Math.max(depth, 2);
    if (depth === 2) depth = 3; // assume questions exist if both top fields filled
    const { error } = await supabase.
    from("junior_grammar_points").
    update({
      teacher_script: parsed.teacher_script ?? [],
      immersion_cards: parsed.immersion_cards ?? [],
      mnemonic: parsed.mnemonic || null,
      content_depth: depth
    }).
    eq("id", editTarget.id);
    setEditSaving(false);
    if (error) {
      setEditError(error.message);
      return;
    }
    toast.success(`已保存：${editTarget.title}`);
    setEditTarget(null);
    await loadAll();
  };

  // ─────────────── Render ───────────────
  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </main>);

  }

  if (!authed) {
    return (
      <main className="mx-auto min-h-screen max-w-md px-5 py-12 text-center">
        <h1 className="text-xl font-bold mb-2"><T>需要登录</T></h1>
        <p className="text-sm text-muted-foreground mb-6"><T>请先登录管理员账号</T></p>
        <Link to="/auth" className="inline-block rounded-full bg-primary px-6 py-2 text-sm font-bold text-primary-foreground">
          <T>去登录</T>
        </Link>
      </main>);

  }

  if (!isAdmin) {
    return (
      <main className="mx-auto min-h-screen max-w-md px-5 py-12 text-center">
        <AlertCircle className="size-12 mx-auto text-rose-500 mb-3" />
        <h1 className="text-xl font-bold mb-2"><T>没有权限</T></h1>
        <p className="text-sm text-muted-foreground mb-6"><T>这个页面仅管理员可访问</T></p>
        <Link to="/" className="inline-block rounded-full bg-muted px-6 py-2 text-sm font-bold">
          <T>返回首页</T>
        </Link>
      </main>);

  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-8 pb-24">
      {/* Header */}
      <Link to="/" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回首页</T>
      </Link>
      <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">ADMIN · GRAMMAR CONTENT</div>
          <h1 className="text-2xl font-extrabold mt-1"><T>中考语法内容生成</T></h1>
          <p className="text-xs text-muted-foreground mt-1"><T>用 AI 批量生成讲解脚本 + 沉浸卡片 + 题目</T></p>
        </div>
        <div className="text-[11px] flex items-center gap-3 text-muted-foreground">
          <span><T>共</T> <b className="text-foreground tabular-nums">{stats.total}</b> <T>个考点</T></span>
          <span><T>已生成</T> <b className="text-emerald-600 tabular-nums">{stats.drafted}</b></span>
          <span><T>未生成</T> <b className="text-rose-600 tabular-nums">{stats.empty}</b></span>
          <span><T>完整</T> <b className="text-amber-600 tabular-nums">{stats.full}</b></span>
        </div>
      </div>

      {/* Filter + batch toolbar */}
      <section className="rounded-2xl border bg-card p-4 mb-5">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-xs font-bold text-muted-foreground mr-1"><T>筛选：</T></span>
          {(["all", "empty", "drafted"] as const).map((k) =>
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold transition",
              filter === k ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
            )}>
            
              {k === "all" ? "全部" : k === "empty" ? "未生成" : "已生成"}
            </button>
          )}
          <span className="mx-2 h-4 w-px bg-border" />
          <button
            onClick={selectAllEmpty}
            className="rounded-full border-2 border-border px-3 py-1 text-xs font-bold hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition"
            disabled={batchRunning}>
            <T>勾选所有未生成 (</T>
            {stats.empty})
          </button>
          <button
            onClick={selectAllVisible}
            className="rounded-full border-2 border-border px-3 py-1 text-xs font-bold hover:border-sky-400 transition"
            disabled={batchRunning}>
            <T>勾选当前可见</T>
          
          </button>
          {selected.size > 0 &&
          <button
            onClick={clearSelection}
            className="rounded-full border-2 border-border px-3 py-1 text-xs font-bold hover:border-rose-400 transition"
            disabled={batchRunning}>
              <T>清空 (</T>
            {selected.size})
            </button>
          }
        </div>

        {/* Batch button + progress */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={runBatch}
            disabled={selected.size === 0 || batchRunning}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-extrabold transition inline-flex items-center gap-2",
              selected.size > 0 && !batchRunning ?
              "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow" :
              "bg-muted text-muted-foreground cursor-not-allowed"
            )}>
            
            {batchRunning ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {batchRunning ?
            `批量生成中… ${batchProgress.done}/${batchProgress.total}` :
            `批量 AI 生成 (${selected.size})`}
          </button>
          {batchRunning && batchProgress.currentTitle &&
          <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground truncate"><T>正在处理：</T>{batchProgress.currentTitle}</div>
              <div className="h-1.5 mt-1 rounded-full bg-muted overflow-hidden">
                <div
                className="h-full bg-amber-500 transition-all"
                style={{ width: `${batchProgress.done / Math.max(1, batchProgress.total) * 100}%` }} />
              
              </div>
            </div>
          }
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 italic">
          <T>⚠ 批量生成只会给"已有 0 道题"的语法点插入题目。已经有题目的考点只更新讲解/沉浸/助记句字段，不动题库。</T>
        </p>
      </section>

      {/* Points list, grouped by category */}
      <div className="space-y-6">
        {cats.map((cat) => {
          const list = ptsByCat[cat.id];
          if (!list || list.length === 0) return null;
          return (
            <section key={cat.id}>
              <h2 className="text-base font-extrabold mb-2 flex items-center gap-2">
                <span className="text-xl">{cat.emoji}</span>
                {cat.name_cn}
                <span className="text-xs font-normal text-muted-foreground">
                  · {list.filter((p) => (p.content_depth ?? 0) > 0).length} / {list.length}
                </span>
              </h2>
              <div className="space-y-2">
                {list.map((pt) => {
                  const depth = pt.content_depth ?? 0;
                  const meta = DEPTH_LABEL[depth];
                  const isSel = selected.has(pt.id);
                  const isGenerating = generating.has(pt.id);
                  const qc = qCounts[pt.id] || { total: 0, rich: 0 };
                  return (
                    <div
                      key={pt.id}
                      className={cn(
                        "rounded-xl border bg-card p-3 transition",
                        isSel && "ring-2 ring-primary border-primary"
                      )}>
                      
                      <div className="flex items-center gap-3 flex-wrap">
                        <input
                          type="checkbox"
                          checked={isSel}
                          onChange={() => toggleOne(pt.id)}
                          disabled={batchRunning}
                          className="size-4 rounded border-border accent-primary cursor-pointer flex-shrink-0" />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm">{pt.title}</span>
                            <span className={cn("inline-block rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums", meta.color)}>
                              <T>{meta.label}</T>
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              CEFR {pt.cefr} <T>· 初</T>{pt.grade - 6}
                            </span>
                            {qc.total > 0 &&
                            <span className="text-[10px] text-muted-foreground">
                                {qc.total} <T>题</T>{qc.rich > 0 && ` · ${qc.rich} 题已升级`}
                              </span>
                            }
                          </div>
                          {pt.summary &&
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{pt.summary}</p>
                          }
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => generateOne(pt).then(() => loadAll())}
                            disabled={isGenerating || batchRunning}
                            className="rounded-lg bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1 disabled:opacity-40 transition"
                            title={depth > 0 ? "重新生成（覆盖现有的讲解/沉浸/助记，不动题库）" : "AI 生成讲解+沉浸+题目"}>
                            
                            {isGenerating ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
                            {depth > 0 ? "重生成" : "AI 生成"}
                          </button>
                          <button
                            onClick={() => openEditor(pt)}
                            disabled={isGenerating || batchRunning}
                            className="rounded-lg border-2 border-border hover:border-sky-400 px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1 disabled:opacity-40 transition"
                            title="手动编辑 JSON">
                            
                            <Pencil className="size-3" />
                            <T>编辑</T>
                          </button>
                          <a
                            href={`/junior/grammar/${pt.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border-2 border-border hover:border-emerald-400 px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1 transition"
                            title="新标签预览学习页">
                            
                            <ExternalLink className="size-3" />
                            <T>预览</T>
                          </a>
                        </div>
                      </div>
                    </div>);

                })}
              </div>
            </section>);

        })}
      </div>

      {/* Editor modal */}
      {editTarget &&
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => !editSaving && setEditTarget(null)}>
        
          <div
          className="bg-card rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}>
          
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"><T>编辑内容 · JSON</T></div>
                <div className="font-bold text-sm">{editTarget.title}</div>
              </div>
              <button onClick={() => !editSaving && setEditTarget(null)} disabled={editSaving} className="text-muted-foreground hover:text-foreground p-1">
                <X className="size-5" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto">
              <p className="text-[11px] text-muted-foreground mb-2">
                <T>字段说明：</T><code className="bg-muted px-1 rounded">teacher_script</code> <T>= 讲解脚本数组（每段</T>
                <code className="bg-muted px-1 rounded mx-1">{"{ text, show, highlight?, duration }"}</code>），
                <code className="bg-muted px-1 rounded">immersion_cards</code> <T>= 沉浸卡片数组（每张</T>
                <code className="bg-muted px-1 rounded mx-1">{"{ situation, cn, en }"}</code>），
                <code className="bg-muted px-1 rounded">mnemonic</code> <T>= 一句话助记。</T>
              </p>
              <textarea
              value={editJSON}
              onChange={(e) => {setEditJSON(e.target.value);setEditError(null);}}
              className="w-full font-mono text-xs bg-muted/30 border-2 rounded-lg p-3 outline-none focus:border-primary"
              style={{ minHeight: "50vh" }}
              disabled={editSaving} />
            
              {editError &&
            <div className="mt-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-300 p-2 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                  <AlertCircle className="size-4 flex-shrink-0 mt-0.5" />
                  <span>{editError}</span>
                </div>
            }
            </div>
            <div className="flex items-center gap-2 p-4 border-t">
              <button
              onClick={saveEditor}
              disabled={editSaving}
              className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm font-bold inline-flex items-center gap-2 disabled:opacity-40">
              
                {editSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                <T>保存</T>
              </button>
              <button
              onClick={() => !editSaving && setEditTarget(null)}
              disabled={editSaving}
              className="rounded-full border-2 border-border px-5 py-2 text-sm font-bold disabled:opacity-40">
                <T>取消</T>
              
            </button>
              <a
              href={`/junior/grammar/${editTarget.id}`}
              target="_blank"
              rel="noreferrer"
              className="ml-auto text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              
                <ExternalLink className="size-3" /> <T>新标签预览</T>
              </a>
            </div>
          </div>
        </div>
      }
    </main>);

}