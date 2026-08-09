/**
 * 中文这样说(/vocab/expressions)。
 *
 * 51 条中文表达 × 133 种英文说法,按语域分档(casual 48 / neutral 50 / formal 35)。
 * 这批内容的价值在于**同一句中文在不同场合有不同说法** —— 所以三档必须并排给,
 * 只给一个"标准答案"就把它降级成了普通词表。
 *
 * ⚠️ 按 category 分两组:daily(日常口语)/ proverb(汉语谚语)。
 * ⚠️ ☆ 收藏落在**每个说法**上(不是每个中文条目):用户想收的是
 *    "这句英文",不是"这个中文意图"。source_kind='expression'。
 *
 * ⚠️ 记档(三份评审的共识,本轮不改):强行给每个中文配 casual/neutral/formal
 *    三档,导致部分 formal 是"同一句换大词"而非"另一种场合的说法"。
 *    将来做第二批中文表达时,改为「一个中文意图 → 若干真实说法 +
 *    语用标签(everyday/casual/business/written)」,不强行三档。
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Star, Volume2 } from "lucide-react";
import BackLink from "@/components/BackLink";
import { cn } from "@/lib/utils";
import { bankColor, FONT_SERIF, readSelectedBank } from "@/lib/vocab/theme";
import { playUrl } from "@/lib/vocab/audio";
import { startTracking } from "@/lib/vocab/timeTracker";
import { fallback, logFail } from "@/lib/vocab/report";
import DormantQuiz, { type QuizItem } from "@/components/vocab/DormantQuiz";
import {
  listExpressions, listFavorites, toggleFavorite, EXPR_GROUPS, REGISTER_LABEL,
  type CnExpression, type Register,
} from "@/lib/vocab/dormant";

function shuffle<T>(a: T[]): T[] {
  const o = [...a];
  for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; }
  return o;
}

/** 语域徽标配色:随意=暖、中性=灰、正式=冷。三档一眼可分。 */
const REG_STYLE: Record<Register, string> = {
  casual: "bg-amber-50 text-amber-700",
  neutral: "bg-slate-100 text-slate-600",
  formal: "bg-sky-50 text-sky-700",
};

function Card({ e, color, favs, onFav }: {
  e: CnExpression; color: string; favs: Set<string>; onFav: (text: string, zh: string | null, ref: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white">
      <button type="button" onClick={() => setOpen(v => !v)} aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-3 text-left">
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-semibold leading-tight text-slate-900">{e.cn_phrase}</span>
          {e.cn_note && <span className="mt-0.5 block text-[12px] leading-tight text-slate-400">{e.cn_note}</span>}
        </span>
        <span className="shrink-0 text-[12px] text-slate-400">{e.renditions.length} 种说法</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>

      <div className={cn("grid transition-[grid-template-rows] duration-200", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className="space-y-3 px-4 pb-4">
            {e.renditions.map(r => (
              <div key={r.id} className="border-t border-black/[0.06] pt-3">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  {r.register && (
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", REG_STYLE[r.register])}>
                      {REGISTER_LABEL[r.register]}
                    </span>
                  )}
                  <span className="text-[16px] text-slate-900" style={{ fontFamily: FONT_SERIF }}>{r.rendition}</span>
                  {r.audio_url && (
                    <button type="button" onClick={() => playUrl(r.audio_url, `r:${r.id}`)} aria-label="朗读"
                      className="text-slate-400"><Volume2 className="h-4 w-4" /></button>
                  )}
                  <button type="button" onClick={() => onFav(r.rendition, e.cn_phrase, r.id)}
                    aria-label={favs.has(r.rendition) ? "取消收藏" : "收藏"} className="ml-auto shrink-0">
                    <Star className={cn("h-4 w-4", favs.has(r.rendition) ? "fill-current" : "")}
                      style={{ color: favs.has(r.rendition) ? color : "#CBD5E1" }} />
                  </button>
                </div>
                {r.scene_hint && <p className="mt-1 text-[12px] leading-relaxed text-slate-500">{r.scene_hint}</p>}
                {r.example_en && (
                  <div className="mt-1.5">
                    <button type="button" onClick={() => playUrl(r.example_audio_url, `re:${r.id}`)}
                      disabled={!r.example_audio_url} className="flex w-full items-start gap-2 text-left">
                      {r.example_audio_url
                        ? <Volume2 className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-300" />
                        : <span className="mt-1 h-3.5 w-3.5 shrink-0" />}
                      <span className="text-[14px] leading-relaxed text-slate-700">{r.example_en}</span>
                    </button>
                    {r.example_zh && <p className="mt-0.5 pl-5.5 text-[12px] leading-relaxed text-slate-400">{r.example_zh}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VocabExpressions() {
  const color = bankColor(readSelectedBank() || "toefl");
  const [rows, setRows] = useState<CnExpression[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [quiz, setQuiz] = useState<QuizItem[] | null>(null);
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [needLogin, setNeedLogin] = useState(false);

  useEffect(() => startTracking(), []);
  const load = useCallback(() => {
    setFailed(false); setRows(null);
    listExpressions().then(setRows).catch(e => { logFail("VocabExpressions/listExpressions", e); setFailed(true); });
  }, []);
  useEffect(() => { load(); }, [load]);

  const all = rows ?? [];

  /* 列表到位后查收藏状态。未登录读到空集,那是预期不是异常。 */
  useEffect(() => {
    if (!rows?.length) return;
    let alive = true;
    listFavorites(rows.flatMap(e => e.renditions.map(r => r.rendition)))
      .then(s => { if (alive) setFavs(s); })
      /* 查不到收藏不影响浏览 —— 正确降级,记一行 */
      .catch(fallback("VocabExpressions/listFavorites", undefined));
    return () => { alive = false; };
  }, [rows]);

  const onFav = async (text: string, zh: string | null, ref: string) => {
    const was = favs.has(text);
    /* 乐观更新:收藏是高频轻动作,等往返再变色显得迟钝。失败回滚。 */
    setFavs(p => { const n = new Set(p); if (was) n.delete(text); else n.add(text); return n; });
    try {
      await toggleFavorite("expression", text, zh, ref, was);
    } catch (err) {
      setFavs(p => { const n = new Set(p); if (was) n.add(text); else n.delete(text); return n; });
      if ((err as Error).message === "NOT_SIGNED_IN") setNeedLogin(true);
    }
  };

  /**
   * 出题:给中文 + **指定语域**,四选一。
   * ⚠️ 干扰项从**同一语域**的别条里取 —— 跨语域取的话,
   *    "随意"档的答案混进三个"正式"说法,靠语体就能猜中,题目就废了。
   */
  const build = (): QuizItem[] => {
    const flat = all.flatMap(e => e.renditions.filter(r => r.register).map(r => ({ e, r })));
    return shuffle(flat).slice(0, 10).map(({ e, r }) => {
      const pool = flat.filter(x => x.r.id !== r.id && x.r.register === r.register);
      const distractors = shuffle(pool).slice(0, 3).map(x => x.r.rendition);
      return {
        tag: `${REGISTER_LABEL[r.register as Register]}场合`,
        stem: `「${e.cn_phrase}」这时候英文怎么说?`,
        options: shuffle([r.rendition, ...distractors]),
        answer: r.rendition,
        hints: r.scene_hint ? { [r.rendition]: r.scene_hint } : undefined,
      };
    }).filter(q => q.options.length >= 2);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="h-[3px] w-full" style={{ background: color }} />
      <div className="mx-auto w-full max-w-[640px] px-4 pb-24 pt-2">
        <BackLink to="/vocab" className="mb-2 inline-flex items-center gap-1 text-[13px] text-slate-500">← 词汇</BackLink>
        <h1 className="text-[24px] font-bold tracking-tight text-slate-900">中文这样说</h1>
        <p className="mt-0.5 text-[13px] text-slate-400">同一句中文,在不同场合英文说法不一样</p>

        {quiz ? (
          <div className="mt-3"><DormantQuiz items={quiz} color={color} onExit={() => setQuiz(null)} title="中文这样说 · 选说法" /></div>
        ) : (
          <>
            {rows === null && !failed && (
              <div className="mt-3 rounded-2xl border border-black/[0.06] bg-white p-10 text-center text-[14px] text-slate-400">加载中…</div>
            )}
            {failed && (
              <div className="mt-3 rounded-2xl border border-black/[0.06] bg-white p-8 text-center">
                <p className="text-[15px] text-slate-600">加载失败</p>
                <button onClick={load} className="mt-3 rounded-full border border-black/[0.08] px-4 py-1.5 text-[14px] text-slate-700">重试</button>
              </div>
            )}

            {rows !== null && all.length > 0 && (
              <>
                <button type="button" onClick={() => setQuiz(build())}
                  className="mb-4 mt-3 w-full rounded-xl py-3 text-[15px] font-medium text-white" style={{ backgroundColor: color }}>
                  测一测:给中文选说法
                </button>

                {EXPR_GROUPS.map(g => {
                  const items = all.filter(e => (e.category ?? "daily") === g.key);
                  if (!items.length) return null;
                  return (
                    <div key={g.key} className="mb-5">
                      <h2 className="mb-2 text-[15px] font-semibold text-slate-900">
                        {g.label} <span className="text-[12px] font-normal text-slate-400">{items.length}</span>
                      </h2>
                      <div className="space-y-2">
                        {items.map(e => <Card key={e.id} e={e} color={color} favs={favs} onFav={onFav} />)}
                      </div>
                    </div>
                  );
                })}
                {needLogin && (
                  <p className="mt-3 text-center text-[12px] text-slate-400">
                    收藏需要先登录。<a href="/auth" className="underline">去登录</a>
                  </p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
