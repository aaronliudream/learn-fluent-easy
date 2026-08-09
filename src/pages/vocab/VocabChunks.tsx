/**
 * 词块与习语(/vocab/chunks)。
 *
 * 库里 vocab_chunks 共 150 条,**一张表**靠 type 区分(规格里当成两批,与实况不符):
 *   idiom 50 · phrasal_verb 35 · collocation_ext 30 · frame 20 · connector 15
 * 习语那 50 条**全部**带 literal_trap(直译陷阱)—— 那是这批内容的卖点,必须醒目。
 *
 * ⚠️ 两个 tab 各带一个测验,方向**都必须一边中文一边英文**:
 *    · 词块:中文题干 + 英文选项(考"会不会说")
 *    · 习语:英文题干 + 中文选项(考"看不看得懂"),直译义当干扰项
 * ⚠️ **硬判据:题干与选项不得同为中文**(Aaron 2026-08-09 立)。
 *    两边都是中文,说明这道题没在考英语。习语题改造前正是这样,还连带泄题。
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
import { fallback, logFail } from "@/lib/vocab/report";
import { ExampleBlock } from "@/components/vocab/ExampleBlock";
import DormantQuiz, { type QuizItem } from "@/components/vocab/DormantQuiz";
import { dedupeTake } from "@/lib/vocab/quiz";
import { listChunks, listFavorites, toggleFavorite, CHUNK_GROUPS, type Chunk } from "@/lib/vocab/dormant";

/**
 * 从 literal_trap「字面“X”,实为“Y”」里抽出**直译义 X**,给习语题当干扰项。
 *
 * ⚠️ 抽不出来返回 null,**绝不拿整句当干扰项** —— 整句里含着答案(见 buildIdiomQuiz)。
 *    实测 50 条习语 50 条都抽得出;这条守卫是给将来新内容留的
 *    (第九条:判不了的宁可少一个干扰项,也不要塞一个泄题的进去)。
 */
const LITERAL_RE = /^字面[“"]([^”"]+)[”"]/;
function literalMeaning(trap: string | null | undefined): string | null {
  const m = LITERAL_RE.exec(String(trap || ""));
  return m ? m[1] : null;
}

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

      {/* 共用件 ExampleBlock(small 档)—— 与反馈层/词卡同一套版式,中译贴紧英文 */}
      {c.example_en && (
        <ExampleBlock className="mt-2.5 border-t border-black/[0.06]" size="small"
          en={c.example_en} zh={c.example_zh}
          audioUrl={c.example_audio_url} audioKey={`ke:${c.id}`} />
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
    listChunks().then(setRows).catch(e => { logFail("VocabChunks/listChunks", e); setFailed(true); });
  }, []);
  useEffect(() => { load(); }, [load]);

  /* 列表到位后再查收藏状态:未登录读到空集,那是预期不是异常 */
  useEffect(() => {
    if (!rows?.length) return;
    let alive = true;
    listFavorites(rows.map(r => r.chunk))
      .then(s => { if (alive) setFavs(s); })
      /* 查不到收藏不影响浏览(星星显示为未收藏)——正确降级,记一行 */
      .catch(fallback("VocabChunks/listFavorites", undefined));
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
    /* ⚠️ 走共用件 dedupeTake —— 它内含"同族不同框"判据。
       改造前是 `.slice(0,3)` 直接取,抽到过 `as a result` 与 `as a result of` 并排:
       同一个短语的两种形态当四选一,答对答错都说明不了什么。 */
    const distractors = dedupeTake(shuffle(pool).map(x => x.chunk), c.chunk, 3);
    return { stem: `「${c.translation_zh}」用英文怎么说?`, options: shuffle([c.chunk, ...distractors]), answer: c.chunk };
  }).filter(q => q.options.length >= 2);

  /**
   * 习语题:**英文题干 + 中文选项**,直译义当干扰项。
   *
   * ── 改造前两件事一起错(Aaron 2026-08-09 指出)──────────────────
   * ① **方向反了**:题干是 literal_trap(中文),选项是 translation_zh(中文)——
   *    两边都是中文,考的是中文阅读不是英语。
   * ② **题干直接泄题**:literal_trap 不是"直译义",是一整句解释
   *    「字面"打破冰",实为"打破僵局"」—— 答案原文就印在题干上。
   *    实测 **48/50 条** 的 literal_trap 里含 translation_zh 全文。
   *    改造前这道题不用懂英语也不用懂习语,照抄就能满分。
   *
   * ── 现在 ──────────────────────────────────────────────────────
   * 题干 = 英文习语;选项 = 中文含义;**干扰项优先放该习语自己的直译义**
   * (break the ice → 干扰项「打破冰」),直译陷阱仍被考到,方向却对了。
   * 完整的 literal_trap 挪进 hints,**答完才显示** —— 教学价值不丢,又不泄题。
   */
  const buildIdiomQuiz = (): QuizItem[] => shuffle(idioms.filter(c => c.translation_zh)).slice(0, 10).map(c => {
    const answer = c.translation_zh as string;
    const lit = literalMeaning(c.literal_trap);
    /* 直译义排第一位;不够 3 个再从别的习语的真义里补。
       ⚠️ 去重按**文本**:直译义偶尔与答案相同(实测 50 条里有 1 条),
          不去重就会出现两个一模一样的选项 —— 与 #340 修的是同一类错。 */
    /* 直译义排第一位,再用共用件补齐 —— dedupeTake 内含"同族不同框"判据,
       所以「减轻」与「减轻程度」这类不会同框(见 quiz.ts 的 tooSimilar)。 */
    const rest = shuffle(idioms.filter(x => x.id !== c.id && x.translation_zh).map(x => x.translation_zh as string));
    const distractors = dedupeTake(lit ? [lit, ...rest] : rest, answer, 3);
    return {
      tag: "习语 · 选出正确的中文意思",
      stem: c.chunk,
      options: shuffle([answer, ...distractors]),
      answer,
      hints: {
        [answer]: c.literal_trap || "",
        ...(lit && lit !== answer ? { [lit]: "这是字面直译 —— 习语的意思不能按字面拆开理解。" } : {}),
      },
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
                  {tab === "idiom" ? "测一测:看英文习语猜中文意思" : "测一测:给中文选英文"}
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
