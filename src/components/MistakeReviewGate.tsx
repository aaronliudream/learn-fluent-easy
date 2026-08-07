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
 * Aaron 定:每天首次登录时,若有【到期错题】→ 弹阻断式弹窗,强制【答满 6 道】才解锁"继续做/关闭"。
 *  - 每天首次:localStorage 按 user + 北京日期 门控,当天完成后不再弹。
 *  - 答满 6 道:计"答了几道"(不论对错),做对会推进 SRS(bumpMistakeCorrect);target=min(6,可做数)。
 *  - 没到期错题:不弹。到期但可做<6:做完可做的即解锁(不锁死用户)。
 *  - 同一道题一天只进一次弹窗:展示时即写 last_shown_date(mark_mistakes_shown),
 *    选题时在 DB 层排除今天已展示的。
 *  - 移出错题本:隔天连续做对 2 次(bump_mistake_correct 阈值 _new >= 2)。
 *  - 技术逃生:取数失败/无可做题 → 允许直接关闭,绝不把用户锁在弹窗里进不去 App。
 * 只收【单题 MCQ】(snapshot.options 有 ≥2 项且正确答案命中某字母)——与 /mistakes 就地重做同口径;
 * 阅读整篇/开放题/薄行不在强制门内(无法就地判对错)。
 */

type Mistake = {
  id: string;
  module: string;
  source_key: string;
  question: string;
  /** 学生**当时做错**时选的那个字母(写入器冻结下来的),不是本次复习所选。 */
  user_answer: string | null;
  correct_answer: string | null;
  explanation: string | null;
  snapshot: { options?: Record<string, unknown>; correct_answer?: unknown; questions?: unknown[] } | null;
  next_review_at: string;
};

type OptionPair = [string, string];

/**
 * 完形填空题干拆解:【第 N 空】前缀 + 整段带 ___N___ 占位的原文。
 *
 * ★为什么需要★
 * 美语关7 的错题题干存的是**整段对话原文**(含 4~5 个空),写入器给它加了 `【第 N 空】` 前缀
 * (americanMistake.ts 走 recordZoneMistake,stem 取的是 payload.context)。
 * 卡片若原样输出,学生看到 5 个空却只有一组选项,**根本不知道考的是哪一个空**。
 *
 * 返回 blankNo=null 时表示解析不到(旧记录没有前缀 / 非完形题)→ 调用方原样渲染,不高亮、不报错。
 */
export function parseClozeStem(question: string): { blankNo: number | null; body: string } {
  const m = /^【第\s*(\d+)\s*空】\s*\n?/.exec(question);
  if (!m) return { blankNo: null, body: question };
  return { blankNo: Number(m[1]), body: question.slice(m[0].length) };
}

/** 把原文按 `___N___` 切成片段;isBlank 的片段带上它的空号,供渲染层决定高亮谁。 */
export type StemSeg = { text: string; blankNo: number | null };
export function splitByBlanks(body: string): StemSeg[] {
  const out: StemSeg[] = [];
  const re = /_{2,}(\d+)_{2,}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    if (m.index > last) out.push({ text: body.slice(last, m.index), blankNo: null });
    out.push({ text: m[0], blankNo: Number(m[1]) });
    last = m.index + m[0].length;
  }
  if (last < body.length) out.push({ text: body.slice(last), blankNo: null });
  return out;
}

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

const TARGET = 6;

/**
 * 「今天已经弹过」标记(2026-08-07)。
 *
 * ★为什么换 key、为什么不带 userId★
 * 旧实现是 `mistakeReviewGate:<userId>:<日期>`,而且**只在 close() 里写** ——
 * 可关闭按钮在做满 6 道前是 disabled,于是用户中途刷新一下、切个页,
 * maybeOpen 重跑、标记从没写过 → 同一批题当天反复弹。这是「一天弹很多次」的根因。
 *
 * 现在:① 标记改在**弹窗打开的那一刻**写,做没做完都算数;
 *       ② key 不带 userId,所以能在 auth.getUser() 之前就判掉 ——
 *          今天已弹过就直接 return,连那次跨境的 getUser + 选题查询都不发。
 *
 * 代价:同一台浏览器当天换账号登录,第二个账号今天不会再被拦。这是刻意取舍 ——
 * 这个标记的语义本来就是「别再烦这台设备」,不是账号级的学习进度。
 *
 * 日期用北京时间,与 RPC bump_mistake_correct 里的 `_today` 同口径(见 bjToday)。
 * 跨天自动失效:key 里带日期,昨天的 key 天然不再命中,不需要任何清理逻辑。
 */
const shownKey = () => `mistake_gate_shown_${bjToday()}`;
const markShownToday = () => {
  try { localStorage.setItem(shownKey(), "1"); } catch { /* 隐私模式忽略 */ }
};
const wasShownToday = (): boolean => {
  try { return !!localStorage.getItem(shownKey()); } catch { return false; }
};

async function fetchDueRedoable(): Promise<Mistake[]> {
  const now = Date.now();
  const { data, error } = await supabase
    .from("user_mistakes")
    .select("id,module,source_key,question,user_answer,correct_answer,explanation,snapshot,next_review_at")
    .eq("is_resolved", false)
    .not("module", "in", pgInList(MISTAKE_HIDDEN_DEFAULT))
    .lte("next_review_at", new Date(now).toISOString())
    // ★同一道题一天只进一次弹窗★ 排除「今天已经展示过」的。
    // 必须加在 DB 层,不能挪到下面的前端 filter —— 下面有 limit(60),
    // 若今天已展示的题混在这 60 条里被取回,前端再滤就可能滤成空,弹窗空转。
    // 日期用北京时间,与 mark_mistakes_shown 里写入的 (now() at time zone 'Asia/Shanghai')::date 同口径。
    .or(`last_shown_date.is.null,last_shown_date.lt.${bjToday()}`)
    .order("next_review_at", { ascending: true })
    .limit(60);
  if (error) throw error;
  return ((data as Mistake[]) || []).filter(
    (m) => !m.module.startsWith("primary_") && isRedoableMcq(m),
  );
}

/**
 * 把这批题标记成「今天已展示」(写 user_mistakes.last_shown_date)。
 *
 * RPC `mark_mistakes_shown` 是 2026-08-07 新建的,还没进生成的 types.ts
 * (重生成 types.ts 是独立 backlog,波及面大,不在本 PR 内)—— 这里就地窄化 cast,
 * 不给整个文件开 any。日期由 RPC 内部按 Asia/Shanghai 取,前端不传。
 */
async function markShownOnServer(ids: string[]): Promise<void> {
  if (!ids.length) return;
  try {
    const rpc = supabase.rpc as unknown as (
      fn: string,
      args: Record<string, unknown>,
    ) => Promise<{ error: { message: string } | null }>;
    const { error } = await rpc("mark_mistakes_shown", { _ids: ids });
    if (error) console.warn("[mistake gate] mark_mistakes_shown failed", error.message);
  } catch (e) {
    console.warn("[mistake gate] mark_mistakes_shown threw", e);
  }
}

export function MistakeReviewGate() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"loading" | "quiz" | "error">("loading");
  const [items, setItems] = useState<Mistake[]>([]);
  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  // userIdRef 已随「标记改在打开时写」一并去掉:它此前只服务于 close() 里那次
  // localStorage 写入,现在没有任何读取方,留着就是只写不读的死状态。
  const busyRef = useRef(false); // 防重入(load 事件 + SIGNED_IN 同时触发)

  const maybeOpen = useCallback(async () => {
    if (busyRef.current || open) return;
    // ★最先判★ 今天已弹过就到此为止 —— 连 getUser 和选题查询都不发。
    // (key 不带 userId 正是为了能在这里判,见 shownKey 注释)
    if (wasShownToday()) return;
    busyRef.current = true;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // ★打开的同一时刻就记账★ 不等做满 6 道、不等 close()。
      // 用户中途刷新/切页 → 上面那个 wasShownToday() 直接拦下,不会再弹第二次。
      setOpen(true);
      markShownToday();
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
      // ★展示即回写★ 把本次**实际要展示的那批**(target 条,不是取回的 60 条)
      // 标记成「今天已展示」。必须在这里调、不能等答完 —— 用户中途退出的题
      // 今天也不该再进队(那正是"天天见同一道"的体感来源)。
      // 失败只 warn:标记写不进去最坏是今天可能再见到,绝不能阻断弹窗。
      void markShownOnServer(rows.slice(0, Math.min(TARGET, rows.length)).map((m) => m.id));
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
  // 题干拆解:完形题取出【第 N 空】与带占位的原文;非完形/旧记录 blankNo=null,原样渲染。
  const stem = useMemo(() => parseClozeStem(cur?.question ?? ""), [cur]);
  const stemSegs = useMemo(
    () => (stem.blankNo == null ? null : splitByBlanks(stem.body)),
    [stem],
  );
  /** 学生当时选的字母(冻结值);为空说明写入器没记(老记录)。 */
  const pastLetter = (cur?.user_answer ?? "").trim() || null;
  // 选完答案后把操作区滚进视口(手机上它常在选项下方屏外)。
  // ⚠️ 必须放在 `revealed` 声明**之后** —— 之前放在 useState 组后面,读到的是 TDZ 里的 `revealed`,
  // 每次渲染直接抛 ReferenceError;本组件挂在 App 全局,于是全站白屏(#242 事故)。
  const actionRef = useRevealScroll<HTMLDivElement>(revealed);

  const close = useCallback(() => {
    // 「今天已弹过」标记已在 maybeOpen 打开弹窗时写入,这里不再重复写。
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
                <T>做满 6 道错题就能继续或关闭。隔天连续做对 2 次,这道题就移出错题本。</T>
              </p>
            )}
            {/* 空号标题:完形题才有。**始终显示**,不随"藏答案"规则隐藏 ——
                知道自己考的是第几空不构成答案泄露,那正是本次要解决的问题。 */}
            {stem.blankNo != null && (
              <div className="mb-2 inline-flex items-center rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                {`第 ${stem.blankNo} 空`}
              </div>
            )}
            {/* 题干。完形题:整段原文完整保留(不截断),目标空高亮、其余空保持灰色可读的 ___N___。 */}
            <div className="mb-4 whitespace-pre-wrap text-sm font-medium leading-relaxed">
              {!cur.question ? (
                <span className="text-muted-foreground"><T>(此题无题干文本)</T></span>
              ) : stemSegs ? (
                stemSegs.map((seg, i) =>
                  seg.blankNo == null ? (
                    <span key={i}>{seg.text}</span>
                  ) : seg.blankNo === stem.blankNo ? (
                    <span
                      key={i}
                      className="rounded bg-amber-200 px-1 font-extrabold text-amber-900 dark:bg-amber-500/40 dark:text-amber-100"
                    >
                      {seg.text}
                    </span>
                  ) : (
                    <span key={i} className="text-muted-foreground/60">{seg.text}</span>
                  ),
                )
              ) : (
                cur.question
              )}
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
                    {/* 「当时选了」只在揭晓后出现 —— 提前显示等于告诉学生"别选这个",四选一变三选一。 */}
                    {revealed && pastLetter === letter && (
                      <span className="mt-0.5 shrink-0 rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                        <T>你当时选了</T>
                      </span>
                    )}
                    {revealed && isCorrect && <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />}
                    {revealed && isPicked && !isCorrect && <XCircle className="mt-0.5 size-4 shrink-0 text-rose-600" />}
                  </button>
                );
              })}
            </div>
            {/* 答后汇总:本次所选 / 当时所选 / 正确答案 三者并列,避免"本次"与"当时"看混。 */}
            {revealed && (
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-muted/40 px-3 py-2 text-xs">
                <span>
                  <T>本次你选</T>{" "}
                  <b className={cn(picked === correctLetter ? "text-emerald-600" : "text-rose-600")}>{picked}</b>
                </span>
                {pastLetter && (
                  <span className="text-muted-foreground">
                    <T>当时你选</T> <b className="text-rose-600">{pastLetter}</b>
                  </span>
                )}
                <span>
                  <T>正确答案</T> <b className="text-emerald-600">{correctLetter}</b>
                </span>
              </div>
            )}
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
            {done ? <T>关闭</T> : <T>做满 6 道后可关闭</T>}
          </Button>
        </div>
      </div>
    </div>
  );
}
