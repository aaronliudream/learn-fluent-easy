/**
 * 词块与习语(/vocab/chunks)。
 *
 * 库里 vocab_chunks 共 150 条,**一张表**靠 type 区分(规格里当成两批,与实况不符):
 *   idiom 50 · phrasal_verb 35 · collocation_ext 30 · frame 20 · connector 15
 * 习语那 50 条**全部**带 literal_trap(直译陷阱)—— 那是这批内容的卖点,必须醒目。
 *
 * ⚠️ 两个 tab 各带一个测验,但**出题方式不同**:
 *    · 词块:给中文选英文(常规词汇题)
 *    · 习语:给直译陷阱猜真义 —— 这才用得上 literal_trap,
 *      用同一套出题会把习语的价值浪费掉。
 * ⚠️ ☆ 收藏写 user_vocab_wordbook,source_kind='chunk'。
 *    这个值是 2026-08-09 由 SQLAA/wordbook_source_kind_extend.sql 扩进 CHECK 的 ——
 *    在 Aaron 跑那条 SQL 之前**故意没上这个按钮**,因为无法在本地验证约束
 *    (匿名写会先被 RLS 挡住 42501,约束错误被盖住),会 400 的按钮比没有按钮更糟。
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Star, Volume2 } from "lucide-react";
import BackLink from "@/components/BackLink";
import { cn } from "@/lib/utils";
import { bankColor, FONT_SERIF, readSelectedBank } from "@/lib/vocab/theme";
import { playUrl } from "@/lib/vocab/audio";
import { startTracking } from "@/lib/vocab/timeTracker";
import DormantQuiz, { type QuizItem } from "@/components/vocab/DormantQuiz";
import { listChunks, listFavorites, toggleFavorite, CHUNK_GROUPS, type Chunk } from "@/lib/vocab/dormant";

type Tab = "chunk" | "idiom";

function shuffle<T>(a: T[]): T[] {
  const o = [...a];
  for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; }
  return o;
}

function Row({ c, color, faved, onFav }: {
  c: Chunk; color: string; faved: boolean; onFav: (c: Chunk) => void;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-4">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-[18px] font-semibold text-slate-900" style={{ fontFamily: FONT_SERIF }}>{c.chunk}</span>
        {c.audio_url && (
          <button type="button" onClick={() => playUrl(c.audio_url, `k:${c.id}`)} aria-label="朗读"
            className="text-slate-400"><Volume2 className="h-4 w-4" /></button>
        )}
        <button type="button" onClick={() => onFav(c)} aria-label={faved ? "取消收藏" : "收藏"}
          className="ml-auto shrink-0">
          <Star className={cn("h-[18px] w-[18px]", faved ? "fill-current" : "")}
            style={{ color: faved ? color : "#CBD5E1" }} />
        </button>
      </div>
      {c.translation_zh && <p className="mt-1 text-[14px] leading-relaxed text-slate-700">{c.translation_zh}</p>}

      {/* 直译陷阱 —— 习语专有,给最醒目的处理 */}
      {c.literal_trap && (
        <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-[13px] leading-relaxed text-amber-900">
          <b className="font-semibold">⚠️ 直译陷阱:</b>{c.literal_trap}
        </p>
      )}

      {c.example_en && (
        <div className="mt-2.5 border-t border-black/[0.06] pt-2.5">
          <button type="button" onClick={() => playUrl(c.example_audio_url, `ke:${c.id}`)}
            disabled={!c.example_audio_url} className="flex w-full items-start gap-2 text-left">
            {c.example_audio_url
              ? <Volume2 className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
              : <span className="mt-1 h-4 w-4 shrink-0" />}
            <span className="text-[15px] leading-relaxed text-slate-800">{c.example_en}</span>
          </button>
          {c.example_zh && <p className="mt-1 pl-6 text-[13px] leading-relaxed text-slate-500">{c.example_zh}</p>}
        </div>
      )}
    </div>
  );
}

export default function VocabChunks() {
  const color = bankColor(readSelectedBank() || "toefl");
  const [rows, setRows] = useState<Chunk[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState<Tab>("chunk");
  const [quiz, setQuiz] = useState<QuizItem[] | null>(null);
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [needLogin, setNeedLogin] = useState(false);

  useEffect(() => startTracking(), []);

  const load = useCallback(() => {
    setFailed(false); setRows(null);
    listChunks().then(setRows).catch(() => setFailed(true));
  }, []);
  useEffect(() => { load(); }, [load]);

  /* 列表到位后再查收藏状态:未登录读到空集,那是预期不是异常 */
  useEffect(() => {
    if (!rows?.length) return;
    let alive = true;
    listFavorites(rows.map(r => r.chunk))
      .then(s => { if (alive) setFavs(s); })
      .catch(() => { /* 查不到收藏不影响浏览 */ });
    return () => { alive = false; };
  }, [rows]);

  const onFav = async (c: Chunk) => {
    const was = favs.has(c.chunk);
    /* 乐观更新:收藏是高频轻动作,等一个往返再变色会显得迟钝。失败再回滚。 */
    setFavs(p => { const n = new Set(p); if (was) n.delete(c.chunk); else n.add(c.chunk); return n; });
    try {
      await toggleFavorite("chunk", c.chunk, c.translation_zh, c.id, was);
    } catch (e) {
      setFavs(p => { const n = new Set(p); if (was) n.add(c.chunk); else n.delete(c.chunk); return n; });
      if ((e as Error).message === "NOT_SIGNED_IN") setNeedLogin(true);
    }
  };

  const idioms = useMemo(() => (rows ?? []).filter(r => r.type === "idiom"), [rows]);
  const chunks = useMemo(() => (rows ?? []).filter(r => r.type !== "idiom"), [rows]);

  /** 词块题:给中文选英文。干扰项从**同型**里取,不跨型 —— 跨型一眼能排除。 */
  const buildChunkQuiz = (): QuizItem[] => shuffle(chunks.filter(c => c.translation_zh)).slice(0, 10).map(c => {
    const pool = chunks.filter(x => x.id !== c.id && x.type === c.type);
    const distractors = shuffle(pool).slice(0, 3).map(x => x.chunk);
    return { stem: `「${c.translation_zh}」用英文怎么说?`, options: shuffle([c.chunk, ...distractors]), answer: c.chunk };
  }).filter(q => q.options.length >= 2);

  /** 习语题:给直译陷阱猜真义 —— 用得上 literal_trap 才叫上架了这批内容。 */
  const buildIdiomQuiz = (): QuizItem[] => shuffle(idioms.filter(c => c.literal_trap && c.translation_zh)).slice(0, 10).map(c => {
    const pool = idioms.filter(x => x.id !== c.id && x.translation_zh);
    const distractors = shuffle(pool).slice(0, 3).map(x => x.translation_zh as string);
    return {
      tag: c.chunk,
      stem: `直译陷阱:${c.literal_trap}\n它真正的意思是?`,
      options: shuffle([c.translation_zh as string, ...distractors]),
      answer: c.translation_zh as string,
    };
  }).filter(q => q.options.length >= 2);

  const list = tab === "idiom" ? idioms : chunks;

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="h-[3px] w-full" style={{ background: color }} />
      <div className="mx-auto w-full max-w-[640px] px-4 pb-24 pt-2">
        <BackLink to="/vocab" className="mb-2 inline-flex items-center gap-1 text-[13px] text-slate-500">← 词汇</BackLink>
        <h1 className="text-[24px] font-bold tracking-tight text-slate-900">词块与习语</h1>
        <p className="mt-0.5 text-[13px] text-slate-400">整块记比单个词记更接近真实语言</p>

        <div className="mb-3 mt-3 inline-flex rounded-full border border-black/[0.08] bg-white p-0.5">
          {([["chunk", `词块 ${chunks.length}`], ["idiom", `习语 ${idioms.length}`]] as const).map(([k, label]) => (
            <button key={k} type="button" onClick={() => { setTab(k); setQuiz(null); }}
              className={cn("rounded-full px-4 py-1.5 text-[13px] font-medium", tab === k ? "text-white" : "text-slate-500")}
              style={tab === k ? { backgroundColor: color } : undefined}>{label}</button>
          ))}
        </div>

        {quiz ? (
          <DormantQuiz items={quiz} color={color} onExit={() => setQuiz(null)}
            title={tab === "idiom" ? "习语 · 猜真义" : "词块 · 中译英"} />
        ) : (
          <>
            {rows === null && !failed && (
              <div className="rounded-2xl border border-black/[0.06] bg-white p-10 text-center text-[14px] text-slate-400">加载中…</div>
            )}
            {failed && (
              <div className="rounded-2xl border border-black/[0.06] bg-white p-8 text-center">
                <p className="text-[15px] text-slate-600">加载失败</p>
                <button onClick={load} className="mt-3 rounded-full border border-black/[0.08] px-4 py-1.5 text-[14px] text-slate-700">重试</button>
              </div>
            )}

            {rows !== null && list.length > 0 && (
              <>
                <button type="button"
                  onClick={() => setQuiz(tab === "idiom" ? buildIdiomQuiz() : buildChunkQuiz())}
                  className="mb-3 w-full rounded-xl py-3 text-[15px] font-medium text-white" style={{ backgroundColor: color }}>
                  {tab === "idiom" ? "测一测:看直译陷阱猜真义" : "测一测:给中文选英文"}
                </button>

                {tab === "idiom" ? (
                  <div className="space-y-2.5">
                    {idioms.map(c => <Row key={c.id} c={c} color={color} faved={favs.has(c.chunk)} onFav={onFav} />)}
                  </div>
                ) : (
                  /* 词块按 type 分四组;每组标题带一句话说明它是什么 */
                  CHUNK_GROUPS.map(g => {
                    const items = chunks.filter(c => c.type === g.type);
                    if (!items.length) return null;
                    return (
                      <div key={g.type} className="mb-5">
                        <h2 className="mb-0.5 text-[15px] font-semibold text-slate-900">
                          {g.label} <span className="text-[12px] font-normal text-slate-400">{items.length}</span>
                        </h2>
                        <p className="mb-2 text-[12px] text-slate-400">{g.hint}</p>
                        <div className="space-y-2.5">
                          {items.map(c => <Row key={c.id} c={c} color={color} faved={favs.has(c.chunk)} onFav={onFav} />)}
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}
          </>
        )}
        {needLogin && (
          <p className="mt-3 text-center text-[12px] text-slate-400">
            收藏需要先登录。<a href="/auth" className="underline">去登录</a>
          </p>
        )}
      </div>
    </div>
  );
}
