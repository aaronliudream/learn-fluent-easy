import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRevealScroll } from "@/lib/useRevealScroll";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { bumpMistakeCorrect, bjToday } from "@/lib/mistakeStreak";
import { MISTAKE_HIDDEN_DEFAULT, pgInList } from "@/lib/mistakeHiddenModules";
import { T } from "@/i18n/T";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

/**
 * 登录强制复习门(MistakeReviewGate)
 * Aaron 定:每天首次登录时,若有【到期错题】→ 弹阻断式弹窗,强制【答满 5 道】才解锁"继续做/关闭"。
 *  - 每天首次:localStorage 按 user + 北京日期 门控,当天完成后不再弹。
 *  - 答满 5 道:计"答了几道"(不论对错),做对会推进 SRS(bumpMistakeCorrect);target=min(5,可做数)。
 *  - 没到期错题:不弹。到期但可做<5:做完可做的即解锁(不锁死用户)。
 *  - 技术逃生:取数失败/无可做题 → 允许直接关闭,绝不把用户锁在弹窗里进不去 App。
 * 只收【单题 MCQ】(snapshot.options 有 ≥2 项且正确答案命中某字母)——与 /mistakes 就地重做同口径;
 * 阅读整篇/开放题/薄行不在强制门内(无法就地判对错)。
 */

type Mistake = {
  id: string;
  module: string;
  source_key: string;
  question: string;
  correct_answer: string | null;
  explanation: string | null;
  snapshot: { options?: Record<string, unknown>; correct_answer?: unknown; questions?: unknown[] } | null;
  next_review_at: string;
};

type OptionPair = [string, string];

function optionPairs(m: Mistake): OptionPair[] {
  const opts = m.snapshot?.options;
  if (!opts || typeof opts !== "object") return [];
  return (Object.entries(opts) as [string, unknown][])
    .filter(([, v]) => v != null && String(v).trim() !== "")
    .map(([k, v]) => [k, String(v)] as OptionPair)
    .sort(([a], [b]) => a.localeCompare(b));
}
function frozenCorrect(m: Mistake): string {
  return String(m.correct_answer ?? m.snapshot?.correct_answer ?? "").trim();
}
// 可就地判对错的单题 MCQ:≥2 选项 且 正确答案命中某选项字母。
function isRedoableMcq(m: Mistake): boolean {
  const pairs = optionPairs(m);
  if (pairs.length < 2) return false;
  const c = frozenCorrect(m);
  return pairs.some(([letter]) => letter === c);
}

const TARGET = 5;
const dailyKey = (userId: string) => `mistakeReviewGate:${userId}:${bjToday()}`;

async function fetchDueRedoable(): Promise<Mistake[]> {
  const now = Date.now();
  const { data, error } = await supabase
    .from("user_mistakes")
    .select("id,module,source_key,question,correct_answer,explanation,snapshot,next_review_at")
    .eq("is_resolved", false)
    .not("module", "in", pgInList(MISTAKE_HIDDEN_DEFAULT))
    .lte("next_review_at", new Date(now).toISOString())
    .order("next_review_at", { ascending: true })
    .limit(60);
  if (error) throw error;
  return ((data as Mistake[]) || []).filter(
    (m) => !m.module.startsWith("primary_") && isRedoableMcq(m),
  );
}

export function MistakeReviewGate() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"loading" | "quiz" | "error">("loading");
  const [items, setItems] = useState<Mistake[]>([]);
  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  const busyRef = useRef(false); // 防重入(load 事件 + SIGNED_IN 同时触发)

  const maybeOpen = useCallback(async () => {
    if (busyRef.current || open) return;
    busyRef.current = true;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      userIdRef.current = user.id;
      if (localStorage.getItem(dailyKey(user.id))) return; // 今天已完成/已弹过
      setOpen(true);
      setPhase("loading");
      let rows: Mistake[] = [];
      try {
        rows = await fetchDueRedoable();
      } catch {
        // 取数失败 → 别弹(没必要为报错弹一个空门);关掉。
        setOpen(false);
        return;
      }
      if (!rows.length) { setOpen(false); return; } // 没到期可做题 → 不弹
      setItems(rows);
      setIdx(0); setAnswered(0); setPicked(null);
      setPhase("quiz");
    } finally {
      busyRef.current = false;
    }
  }, [open]);

  useEffect(() => {
    void maybeOpen(); // 首次加载(已登录会话恢复)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((e, session) => {
      if (e === "SIGNED_IN" && session) void maybeOpen(); // 新登录
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const target = useMemo(() => Math.min(TARGET, items.length), [items.length]);
  const done = answered >= target;
  const cur = items[idx];
  const pairs = useMemo(() => (cur ? optionPairs(cur) : []), [cur]);
  const correctLetter = cur ? frozenCorrect(cur) : "";
  const revealed = picked != null;
  const hasNext = idx + 1 < items.length;
  // 选完答案后把操作区滚进视口(手机上它常在选项下方屏外)。
  // ⚠️ 必须放在 `revealed` 声明**之后** —— 之前放在 useState 组后面,读到的是 TDZ 里的 `revealed`,
  // 每次渲染直接抛 ReferenceError;本组件挂在 App 全局,于是全站白屏(#242 事故)。
  const actionRef = useRevealScroll<HTMLDivElement>(revealed);

  const close = useCallback(() => {
    if (userIdRef.current) localStorage.setItem(dailyKey(userIdRef.current), "1");
    setOpen(false);
  }, []);

  const submit = useCallback(async (letter: string) => {
    if (revealed || !cur) return;
    setPicked(letter);
    setAnswered((a) => a + 1);
    if (letter === correctLetter) {
      try { await bumpMistakeCorrect(cur.module, cur.source_key); } catch { /* SRS 推进失败不阻塞 */ }
    }
  }, [revealed, cur, correctLetter]);

  const next = useCallback(() => {
    setPicked(null);
    setIdx((i) => (i + 1 < items.length ? i + 1 : i));
  }, [items.length]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-card shadow-2xl border border-border max-h-[90vh] overflow-y-auto">
        {/* 头 */}
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <h2 className="text-base font-bold"><T>该复习错题了</T></h2>
          </div>
          <div className="text-xs font-bold text-muted-foreground tabular-nums">
            {`${Math.min(answered, target)} / ${target}`}
          </div>
        </div>

        {/* 进度条 */}
        <div className="h-1.5 w-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${target ? (Math.min(answered, target) / target) * 100 : 0}%` }}
          />
        </div>

        {phase === "loading" && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <span className="text-sm"><T>正在准备你的错题…</T></span>
          </div>
        )}

        {phase === "quiz" && cur && (
          <div className="px-5 py-4">
            {!done && (
              <p className="mb-3 text-xs text-muted-foreground">
                <T>做满 5 道错题就能继续或关闭。做对会帮你推进复习进度。</T>
              </p>
            )}
            {/* 题干 */}
            <div className="mb-4 whitespace-pre-wrap text-sm font-medium leading-relaxed">
              {cur.question || <span className="text-muted-foreground"><T>(此题无题干文本)</T></span>}
            </div>
            {/* 选项 */}
            <div className="space-y-2">
              {pairs.map(([letter, text]) => {
                const isCorrect = letter === correctLetter;
                const isPicked = letter === picked;
                return (
                  <button
                    key={letter}
                    type="button"
                    disabled={revealed}
                    onClick={() => void submit(letter)}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-xl border-2 px-3 py-2.5 text-left text-sm transition",
                      !revealed && "border-border hover:border-primary/50 hover:bg-accent",
                      revealed && isCorrect && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
                      revealed && isPicked && !isCorrect && "border-rose-500 bg-rose-50 dark:bg-rose-950/30",
                      revealed && !isCorrect && !isPicked && "border-border opacity-60",
                    )}
                  >
                    <span className="mt-0.5 font-bold text-muted-foreground">{letter}</span>
                    <span className="flex-1">{text}</span>
                    {revealed && isCorrect && <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />}
                    {revealed && isPicked && !isCorrect && <XCircle className="mt-0.5 size-4 shrink-0 text-rose-600" />}
                  </button>
                );
              })}
            </div>
            {/* 解析 */}
            {revealed && cur.explanation && (
              <div className="mt-3 rounded-xl bg-muted/60 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                <span className="font-bold text-foreground"><T>解析：</T></span>
                {cur.explanation}
              </div>
            )}
            {/* 下一题 */}
            {revealed && (
              <div ref={actionRef} className="mt-4">
                {hasNext ? (
                  <Button className="w-full" onClick={next}>
                    {done ? <T>再做一道</T> : <T>下一题</T>}
                  </Button>
                ) : (
                  <p className="text-center text-xs text-muted-foreground">
                    <T>到期错题都做完了 👏</T>
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* 底部:关闭/继续。做满 target 前"关闭"禁用(强制门);错误时逃生可关。 */}
        <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
          {done ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <CheckCircle2 className="size-4" /><T>今天的错题复习已完成</T>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <AlertTriangle className="size-3.5" />{`还差 ${Math.max(0, target - answered)} 道`}
            </span>
          )}
          <Button
            variant={done ? "default" : "ghost"}
            disabled={!done}
            onClick={close}
            className={cn(!done && "opacity-40")}
          >
            {done ? <T>关闭</T> : <T>做满 5 道后可关闭</T>}
          </Button>
        </div>
      </div>
    </div>
  );
}
