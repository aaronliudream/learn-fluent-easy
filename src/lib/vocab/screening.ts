/**
 * 托福词表快筛 —— 抽样与估算。
 *
 * ══ 它测什么、不测什么(名字就是规格)══
 * 测的是「**托福核心 4470 词里你认识哪些**」,**不是绝对词汇量**。
 * ⚠️ 为什么不敢叫「词汇量测试」:库里只有 toefl 一个词库真正挂了词
 *    (实测 4470 条,其余 10 个库挂载数全为 0),而且这 4470 词的 freq_rank
 *    最小是 657 —— 英语最常用的那 650 个词库里一个都没有,2000 名以内只有 21 个。
 *    在这样的池子上估"绝对词汇量",2000 词水平和 4000 词水平的人在低频层会
 *    同样全不认识,根本分不开。所以本模块只报**池内**认识数,口径写死在文案里。
 * ⚠️ 同理**不做跨考试对标**(四级/六级/中考/高考):那要算"认识对方词表的百分之多少",
 *    而那几张词表在库里是 0 行。硬编码一张映射表就是编数字,不做。
 *    真正的跨考试对标是另一个立项,前置是导入通用词频表 + 各考试词表。
 *
 * ══ 分层 ══
 * 5 层 × 8 题 = 40 题。层是按 freq_rank 在**托福池内部**五等分切的,
 * 分层点由实测分布定(不是拍脑袋的整数):各层 894 词,合计 4470。
 * freq_rank 为空的 123 个词并入第 5 层 —— 抽样核对过全是生僻词
 * (avant-garde / ultrasonics / oversecretion / jocose / contemn / warrantable …)。
 * ⚠️ 这套边界与 SQLAA/vocab_pre_known_ddl.sql 里的 CASE **必须一致**,改一处要改两处。
 */
import { supabase } from "@/integrations/supabase/client";
import { currentUserId, type VocabWord } from "@/lib/vocab/data";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

/** 每层出几题;其中前 VERIFY_PER_STRATUM 题是带干扰项的验真题。 */
export const PER_STRATUM = 8;
export const VERIFY_PER_STRATUM = 2;
export const TOTAL_ITEMS = 5 * PER_STRATUM;

/**
 * 实测分层点(2026-08-09 全量跑出,五层各 894,合计 4470)。
 * maxRank 为 null 表示"到最后",第 5 层同时收 freq_rank IS NULL 的词。
 */
export const STRATA = [
  { id: 1, minRank: 657, maxRank: 6968, size: 894, label: "最常见" },
  { id: 2, minRank: 6977, maxRank: 10234, size: 894, label: "较常见" },
  { id: 3, minRank: 10236, maxRank: 14458, size: 894, label: "中等" },
  { id: 4, minRank: 14459, maxRank: 20528, size: 894, label: "较少见" },
  { id: 5, minRank: 20532, maxRank: null, size: 894, label: "生僻" },
] as const;

/** 池子总词数 = 各层之和。**不写死 4470** —— 词库增删时这里自动跟着走。 */
export const POOL_SIZE = STRATA.reduce((s, x) => s + x.size, 0);

export type StratumId = 1 | 2 | 3 | 4 | 5;

/** 一道题。verify=true 的题要选中文释义,用来校准"自称认识"的水分。 */
export type ScreenItem = {
  word: VocabWord;
  stratum: StratumId;
  verify: boolean;
  /** verify 题的四个选项(含正确释义),已打乱 */
  options?: string[];
  answer?: string;
};

/** 用户对一道题的作答。 */
export type ScreenAnswer = {
  known: boolean;
  /** 验真题结果:undefined=非验真题或没答;true/false=选对/选错 */
  verifiedCorrect?: boolean;
};

/** 落到哪一层。与 DDL 的 CASE 同一套判据。 */
export function stratumOf(freqRank: number | null | undefined): StratumId {
  if (freqRank == null) return 5;
  if (freqRank <= 6968) return 1;
  if (freqRank <= 10234) return 2;
  if (freqRank <= 14458) return 3;
  if (freqRank <= 20528) return 4;
  return 5;
}

function shuffle<T>(a: T[]): T[] {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * 估算结果。
 * @param known    估算认识词数(四舍五入)
 * @param lo / hi  95% 置信区间,已裁到 [0, POOL_SIZE]
 * @param perStratum 各层认识率(校准后),结果页用它给"从第几档开始学"的建议
 * @param inflation 自评水分系数:验真题里"自称认识"的正确率。null=一道验真题都没答"认识"
 */
export type ScreenResult = {
  known: number;
  lo: number;
  hi: number;
  perStratum: { id: StratumId; rate: number; known: number; label: string }[];
  inflation: number | null;
  startAt: StratumId;
};

/**
 * 由 40 道题的作答估算池内认识词数。
 *
 * 口径(**纯函数,可单测,别把它藏进组件里**):
 *   ① 每层自评认识率 claim_s = 认识题数 / 该层题数
 *   ② 水分系数 inflation = 验真题中「自称认识且选对」/「自称认识且做了验真」
 *      —— 只用自称认识的那些题算,自称不认识的题不参与(它们本来就没在声称什么)
 *   ③ 校准后认识率 p_s = claim_s × inflation
 *   ④ 估算认识数 = Σ p_s × 该层词数
 *   ⑤ 区间:每层按二项分布取标准误 √(p(1-p)/n) × 层词数,平方和开根再 ×1.96
 * ⚠️ 一道验真题都没"自称认识"时 inflation 记 null 并**按 1 处理**(不打折)——
 *    此时没有任何证据说明用户在虚报,凭空打折同样是编数字。
 */
export function estimate(items: ScreenItem[], answers: Map<number, ScreenAnswer>): ScreenResult {
  let verifyClaimed = 0, verifyRight = 0;
  items.forEach((it, i) => {
    const a = answers.get(i);
    if (!it.verify || !a?.known || a.verifiedCorrect === undefined) return;
    verifyClaimed++;
    if (a.verifiedCorrect) verifyRight++;
  });
  const inflation = verifyClaimed > 0 ? verifyRight / verifyClaimed : null;
  const factor = inflation ?? 1;

  let total = 0, varSum = 0;
  const perStratum: ScreenResult["perStratum"] = [];
  for (const s of STRATA) {
    const idx = items.map((it, i) => (it.stratum === s.id ? i : -1)).filter(i => i >= 0);
    const n = idx.length;
    if (!n) { perStratum.push({ id: s.id, rate: 0, known: 0, label: s.label }); continue; }
    const claimed = idx.filter(i => answers.get(i)?.known).length;
    const p = Math.min(1, (claimed / n) * factor);
    const k = p * s.size;
    total += k;
    // 二项标准误 → 放大到该层词数尺度
    varSum += (p * (1 - p) / n) * s.size * s.size;
    perStratum.push({ id: s.id, rate: p, known: Math.round(k), label: s.label });
  }
  const se = Math.sqrt(varSum);
  const clamp = (v: number) => Math.max(0, Math.min(POOL_SIZE, Math.round(v)));

  /* 建议起点 = 第一个认识率低于 60% 的层。
     ⚠️ 60% 不是随便定的:低于它意味着这一层里近一半是新词,正好是"该从这里开始学"
        的直观含义;全都 ≥60% 就直接推最生僻那层。 */
  const startAt = (perStratum.find(s => s.rate < 0.6)?.id ?? 5) as StratumId;

  return {
    known: clamp(total),
    lo: clamp(total - 1.96 * se),
    hi: clamp(total + 1.96 * se),
    perStratum,
    inflation,
    startAt,
  };
}

/** 某一层的候选词(只取有中文释义的;数量远超 8,够随机)。 */
async function poolForStratum(s: typeof STRATA[number]): Promise<VocabWord[]> {
  const cols = "id,headword,ipa,pos,def_zh,def_en,freq_rank,audio_url";
  let q = db.from("vocab_words").select(cols).not("def_zh", "is", null);
  if (s.id === 5) {
    /* 第 5 层 = 高频段之外 **加上** freq_rank 为空的词。
       ⚠️ PostgREST 的 or() 里不能直接写 is.null 与 gte 的组合而不加括号,
          写错会静默退化成只取一边 —— 这里显式用 or 字符串形式。 */
    q = q.or(`freq_rank.gte.${s.minRank},freq_rank.is.null`);
  } else {
    q = q.gte("freq_rank", s.minRank).lte("freq_rank", s.maxRank as number);
  }
  const { data, error } = await q.limit(1000);
  if (error) throw error;
  return (data || []) as VocabWord[];
}

/**
 * 组一套 40 题。
 * ⚠️ 验真题的干扰项从**同一层**里取 —— 跨层取会让干扰项明显比正确答案生僻/常见,
 *    学生靠词感就能排除,验真就失去意义了。
 */
export async function buildScreening(): Promise<ScreenItem[]> {
  const pools = await Promise.all(STRATA.map(poolForStratum));
  const items: ScreenItem[] = [];

  STRATA.forEach((s, si) => {
    const pool = pools[si].filter(w => (w.def_zh ?? "").trim());
    const picked = shuffle(pool).slice(0, PER_STRATUM);
    picked.forEach((w, i) => {
      const verify = i < VERIFY_PER_STRATUM;
      let options: string[] | undefined;
      const answer = (w.def_zh ?? "").trim();
      if (verify) {
        const others = shuffle(pool.filter(x => x.id !== w.id && (x.def_zh ?? "").trim() && x.def_zh !== w.def_zh))
          .slice(0, 3).map(x => (x.def_zh ?? "").trim());
        // 凑不满 3 个干扰项就降级成自评题,不硬凑重复选项
        if (others.length === 3) options = shuffle([answer, ...others]);
      }
      items.push({
        word: w,
        stratum: s.id as StratumId,
        verify: verify && !!options,
        options,
        answer: options ? answer : undefined,
      });
    });
  });

  return items;
}

/** 落库为什么没成 —— 结果页要据此说人话,而不是笼统一句"保存失败"。 */
export type SaveOutcome =
  | { ok: true; rows: number }
  | { ok: false; reason: "anon" | "no-bank" | "db"; detail?: string };

/** 诊断日志。用户报"没写库"时让他截控制台就能定位,前缀统一 `[快筛]`。 */
function diag(step: string, detail?: unknown) {
  console.log(`[快筛] ${step}`, detail ?? "");
}

/**
 * 落库:一次快筛 40 行,**结果页出来时一次性写**(不是每题写)。
 *
 * ⚠️ **不写 user_vocab_mastery** —— 快筛是自评不是作答,不占掌握度、
 *    也不占 user_vocab_mastery 那 200 条 RLS 配额。
 * ⚠️ 失败**不拦结果显示**,但必须把原因喊出来。
 *    踩过:这里原先是 `if (!uid) return false;` 一句静默返回,调用方又是
 *    `bank ? save(...) : false` —— 两条路径都不打日志,库里 0 行而控制台一片安静,
 *    根本无从判断是没登录、没取到词库、还是被 RLS 挡了。
 * ⚠️ bankId 允许传 null:调用方的 bank 是个异步 state,拿它当写库前提会让
 *    "词库还没加载完"变成"永远不写"。这里自己按 code 兜底查一次。
 */
export async function saveScreening(
  bankId: string | null,
  bankCode: string,
  items: ScreenItem[],
  answers: Map<number, ScreenAnswer>,
): Promise<SaveOutcome> {
  const uid = await currentUserId();
  diag("准备落库", { uid: uid ? `${uid.slice(0, 8)}…` : null, bankId, bankCode, 题数: items.length });
  if (!uid) {
    diag("✗ 未登录,跳过落库(结果照常显示)");
    return { ok: false, reason: "anon" };
  }

  let bid = bankId;
  if (!bid) {
    /* 兜底:调用方没拿到 bank 也要能写 —— 别让一个 UI state 决定数据写不写 */
    const { data, error } = await db.from("vocab_banks").select("id").eq("code", bankCode).maybeSingle();
    if (error || !data?.id) {
      diag("✗ 取不到词库 id,无法落库", { bankCode, error });
      return { ok: false, reason: "no-bank", detail: error?.message };
    }
    bid = data.id as string;
    diag("兜底查到词库 id", bid);
  }

  const sessionId = crypto.randomUUID();
  const rows = items.map((it, i) => {
    const a = answers.get(i);
    return {
      user_id: uid,
      bank_id: bid,
      word_id: it.word.id,
      known: !!a?.known,
      verified_correct: a?.verifiedCorrect ?? null,
      stratum: it.stratum,
      session_id: sessionId,
    };
  });

  const { error } = await db
    .from("vocab_pre_known")
    .upsert(rows, { onConflict: "user_id,bank_id,word_id" });
  if (error) {
    /* PostgREST 的四个字段都要打全:code 分得清 RLS(42501)、缺列(42703)、
       约束不匹配(42P10);只打 message 经常是一句没头没尾的话 */
    diag("✗ 落库失败", {
      code: error.code, message: error.message, details: error.details, hint: error.hint,
      行数: rows.length, 样例: rows[0],
    });
    return { ok: false, reason: "db", detail: `${error.code ?? ""} ${error.message ?? ""}`.trim() };
  }
  diag("✓ 落库成功", { 行数: rows.length, session: sessionId.slice(0, 8) });
  return { ok: true, rows: rows.length };
}
