/**
 * 磨耳朵(PR-8a)· 选词 + 音频拼接引擎。
 *
 * ── 为什么要"拼接"而不是一条条按顺序播 ──
 * 需求里最硬的一条是**手机锁屏后不中断**。而"一条条播 + setTimeout 补间隔"
 * 在锁屏后必挂:后台页面的 JS 定时器会被系统节流甚至冻结,
 * 于是当前这条播完、下一条永远等不到那个 timer —— 表现就是"锁屏听两句就停了"。
 *
 * 所以这里把**一个词的整段序列(单词 → 静音 → 拆读 → 静音 → 例句)离线渲染成一条音频**,
 * 间隔以真实静音烧进波形。播的时候 `<audio>` 元素只放一条连续音频,
 * 中间不需要 JS 参与,系统媒体会话自然存活。词与词之间只剩一个 `ended` 事件要接。
 *
 * ⚠️ 前提是音频 CDN 允许跨域取字节(decodeAudioData 需要)。
 *    实测 audio.bigmooneducation.com 返回 `Access-Control-Allow-Origin: *`,可以。
 *    万一将来关掉了,`buildWordClip` 会抛错,调用方回落到"逐条播"(前台可用、后台会停)。
 *
 * ⚠️ **速度**:统一用 `<audio>.playbackRate` 在元素层调,不烧进波形 ——
 *    元素层变速是**保音高**的(浏览器做时间拉伸),烧进波形只能改采样率,
 *    0.7 倍会明显变成低沉的"慢放磁带"。
 *    代价:规格里「拆读固定 1.0」做不到 —— 拆读跟着整条一起变速。
 *    要真做到就得把拆读切成独立一条音频,而那正好把"一条连续音频"这个
 *    后台播放的前提给毁了。两害相权,保后台播放。已在 PR 里向 Aaron 挑明。
 *
 * ⚠️ 中文释义那一档**目前没有音频资产**(vocab_words 只有单词与拆读音频,
 *    def_zh 没有配音)。按"缺音频的元素跳过、不中断序列"处理,
 *    UI 上明标"音频待生成",不做成点了没反应的假开关。
 */
import { supabase } from "@/integrations/supabase/client";
import {
  currentUserId, listBankWordIds, listMasteryRows, listMistakes,
  listExamplesFor, type VocabWord, type VocabExample,
} from "@/lib/vocab/data";
import { listSceneItems } from "@/lib/vocab/scenes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

/* ── 序列元素 ─────────────────────────────────────────────────── */

export type ElementKey = "word" | "syllable" | "gloss" | "example";

export const ELEMENTS: { key: ElementKey; label: string; hint: string; fixed?: boolean; unavailable?: boolean }[] = [
  { key: "word", label: "单词", hint: "必读", fixed: true },
  { key: "syllable", label: "拆读", hint: "re. gion. al." },
  { key: "gloss", label: "中文释义", hint: "只显示不朗读", unavailable: true },
  { key: "example", label: "例句", hint: "第 1 条" },
];

export type ElementToggles = Record<ElementKey, boolean>;
export const DEFAULT_TOGGLES: ElementToggles = { word: true, syllable: true, gloss: false, example: true };

/** 元素之间 0.8s;单词之后额外 1.5s 供跟读(合计 2.3s)。 */
const GAP_BETWEEN = 0.8;
const GAP_AFTER_WORD = 1.5;

/**
 * 磨耳朵要的词形 = 通用 VocabWord + 拆读音频。
 * ⚠️ 拆读那两列**不加进 data.ts 的共享 select** —— 词库页一次要拉 4470 条,
 *    每条多一个 ~90 字符的 URL 就是 ~400KB,而那个页面根本用不到。
 *    这里自己查自己的列。
 */
export type ListenWord = VocabWord & {
  syllable_audio_url: string | null;
  syllables: string[] | null;
};

export type ListenItem = {
  word: ListenWord;
  example: VocabExample | null;
};

/* ── 选词来源 ─────────────────────────────────────────────────── */

export type SourceKind = "bank" | "mistakes" | "scene" | "random";

export const SOURCES: { key: SourceKind; label: string; desc: string }[] = [
  { key: "bank", label: "当前词库", desc: "未学的排前面" },
  { key: "mistakes", label: "只听错题本", desc: "错过的词" },
  { key: "scene", label: "某个场景", desc: "场景词链" },
  { key: "random", label: "随机 50 词", desc: "换换脑子" },
];

const MAX_ITEMS = 50;

/**
 * 按来源取词。一律封顶 50 个 —— 磨耳朵是"听一轮"不是"听完整个库",
 * 而且每个词都要下载 2-3 条音频,数量放开会把流量打爆。
 */
export async function buildPlaylist(
  source: SourceKind,
  opts: { bankId?: string | null; packId?: string | null },
): Promise<ListenItem[]> {
  let ids: string[] = [];

  if (source === "mistakes") {
    ids = (await listMistakes()).map(r => r.word_id);
  } else if (source === "scene" && opts.packId) {
    /* 场景节点里挂了 word_id 的才有音频可放;搭配/词块多数没挂,属正常 */
    ids = (await listSceneItems(opts.packId)).map(i => i.word_id).filter((x): x is string => !!x);
  } else if (source === "random") {
    ids = shuffle(await allWordIds()).slice(0, MAX_ITEMS);
  } else if (opts.bankId) {
    const all = await listBankWordIds(opts.bankId);
    /* 「未学优先」:把用户已经作答过的词排到后面。
       未登录读到空数组 → 顺序即原序,这是预期不是异常。 */
    const touched = new Set((await listMasteryRows().catch(() => [])).filter(r => (r.tested_count ?? 0) > 0).map(r => r.word_id));
    const fresh = all.filter(id => !touched.has(id));
    const rest = all.filter(id => touched.has(id));
    ids = [...fresh, ...rest];
  }

  ids = ids.slice(0, MAX_ITEMS);
  if (!ids.length) return [];

  const [words, exs] = await Promise.all([listenWordsByIds(ids), listExamplesFor(ids)]);
  const byId = new Map(words.map(w => [w.id, w]));

  // 保持来源顺序(未学优先/错题顺序都是有意义的),不要被查询的返回顺序打乱
  return ids
    .map(id => byId.get(id))
    .filter((w): w is ListenWord => !!w)
    .map(w => ({ word: w, example: (exs[w.id] || [])[0] ?? null }));
}

/** 带拆读音频的词。分片查,避免 in.(...) 把 URL 撑爆。 */
async function listenWordsByIds(ids: string[]): Promise<ListenWord[]> {
  const cols = "id,headword,ipa,pos,def_zh,def_en,freq_rank,audio_url,syllable_audio_url,syllables";
  const out: ListenWord[] = [];
  for (let i = 0; i < ids.length; i += 200) {
    const { data, error } = await db.from("vocab_words").select(cols).in("id", ids.slice(i, i + 200));
    if (error) throw error;
    out.push(...((data || []) as ListenWord[]));
  }
  return out;
}

async function allWordIds(): Promise<string[]> {
  const { data, error } = await db.from("vocab_words").select("id").not("audio_url", "is", null).limit(1000);
  if (error) throw error;
  return ((data || []) as { id: string }[]).map(r => r.id);
}

function shuffle<T>(a: T[]): T[] {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** 这个词按当前开关会用到哪些音频(缺的自动跳过)。 */
export function clipUrlsFor(item: ListenItem, toggles: ElementToggles): string[] {
  const urls: string[] = [];
  if (item.word.audio_url) urls.push(item.word.audio_url);                       // 单词必读
  if (toggles.syllable && item.word.syllable_audio_url) urls.push(item.word.syllable_audio_url);
  // gloss:没有音频资产,恒跳过(见文件头)
  if (toggles.example && item.example?.audio_url) urls.push(item.example.audio_url);
  return urls;
}

/* ── 拼接引擎 ─────────────────────────────────────────────────── */

let ac: AudioContext | null = null;
function audioCtx(): AudioContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Ctor: typeof AudioContext = (window.AudioContext || (window as any).webkitAudioContext);
  if (!ac) ac = new Ctor();
  return ac;
}

/**
 * 诊断日志 —— 用户报"没声音"时,让他截个控制台就能定位到底卡在哪一步。
 * 前缀统一 `[磨耳朵]`,方便一眼筛出来。
 */
export function diag(step: string, detail?: unknown) {
  console.log(`[磨耳朵] ${step}`, detail ?? "");
}

const bufCache = new Map<string, AudioBuffer>();

async function fetchBuffer(url: string): Promise<AudioBuffer> {
  const hit = bufCache.get(url);
  if (hit) return hit;
  let res: Response;
  try {
    res = await fetch(url, { mode: "cors" });
  } catch (e) {
    /* 走到这里通常是**跨域被拦**或断网 —— CDN 少了 Access-Control-Allow-Origin 就是这个表现 */
    diag("✗ 取音频字节失败(跨域被拦/断网?)", { url, error: String(e) });
    throw e;
  }
  if (!res.ok) {
    diag("✗ 音频 HTTP 非 200", { url, status: res.status });
    throw new Error(`audio ${res.status}`);
  }
  const raw = await res.arrayBuffer();
  let buf: AudioBuffer;
  try {
    buf = await audioCtx().decodeAudioData(raw);
  } catch (e) {
    diag("✗ 解码失败(文件损坏/格式不支持?)", { url, bytes: raw.byteLength, error: String(e) });
    throw e;
  }
  /* 缓存上限:一轮最多 50 词 × 3 条 = 150 条,几十 MB。
     超了就整个清掉(简单可预测,比 LRU 省事,也不会在一轮里反复抖动)。 */
  if (bufCache.size > 200) bufCache.clear();
  bufCache.set(url, buf);
  return buf;
}

/**
 * 预热下一个词的音频字节(只下载+解码进缓存,不做拼接)。
 * ⚠️ 拼接本身很快,慢的是**网络下载 + decodeAudioData**。当前这条还在播的时候
 *    把下一条的字节先烤进 bufCache,换词时就几乎是瞬时的 ——
 *    否则每换一个词都要等一次网络,听感上就是"卡一下"甚至像停了。
 * ⚠️ 失败静默吞掉:预热只是加速,失败了到时候正常路径再取一次就是。
 */
export async function prefetchClip(urls: string[]): Promise<void> {
  try { await Promise.all(urls.map(fetchBuffer)); } catch { /* 预热失败不影响主流程 */ }
}

/**
 * 把一个词的整段序列渲染成**一条**音频(间隔是真静音)。
 * 返回可直接喂给 `<audio>.src` 的 object URL,以及总时长(秒)。
 * ⚠️ 调用方负责在换词时 revokeObjectURL,否则一轮 50 词会漏 50 个 blob。
 */
export async function buildWordClip(urls: string[]): Promise<{ url: string; seconds: number }> {
  if (!urls.length) {
    diag("✗ 这个词没有任何可播音频(单词/拆读/例句都缺),将跳过", { urls });
    throw new Error("EMPTY_CLIP");
  }
  diag("拼接开始", { 片段数: urls.length });
  const bufs = await Promise.all(urls.map(fetchBuffer));

  const sr = bufs[0].sampleRate;
  const gaps = bufs.map((_, i) =>
    i === bufs.length - 1 ? 0 : (i === 0 ? GAP_AFTER_WORD + GAP_BETWEEN : GAP_BETWEEN));
  const total = bufs.reduce((s, b, i) => s + b.duration + gaps[i], 0);

  const OfflineCtor: typeof OfflineAudioContext =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext);
  const off = new OfflineCtor(1, Math.ceil(total * sr), sr);

  let at = 0;
  bufs.forEach((b, i) => {
    const src = off.createBufferSource();
    src.buffer = b;
    src.connect(off.destination);
    src.start(at);
    at += b.duration + gaps[i];
  });

  const rendered = await off.startRendering();
  const blob = encodeWav(rendered);
  const url = URL.createObjectURL(blob);
  if (!url.startsWith("blob:")) {
    // 理论上不会发生;真发生了说明环境不支持 createObjectURL,必须让它可见
    diag("✗ blob URL 生成异常", { url });
  }
  diag("✓ 拼接完成", { 时长秒: Math.round(total * 10) / 10, KB: Math.round(blob.size / 1024) });
  return { url, seconds: total };
}

/** AudioBuffer → 16-bit PCM WAV Blob(单声道)。浏览器原生没有编码器,只能自己写头。 */
function encodeWav(buf: AudioBuffer): Blob {
  const data = buf.getChannelData(0);
  const out = new DataView(new ArrayBuffer(44 + data.length * 2));
  const str = (off: number, s: string) => { for (let i = 0; i < s.length; i++) out.setUint8(off + i, s.charCodeAt(i)); };

  str(0, "RIFF");
  out.setUint32(4, 36 + data.length * 2, true);
  str(8, "WAVEfmt ");
  out.setUint32(16, 16, true);          // fmt chunk 长度
  out.setUint16(20, 1, true);           // PCM
  out.setUint16(22, 1, true);           // 单声道
  out.setUint32(24, buf.sampleRate, true);
  out.setUint32(28, buf.sampleRate * 2, true);
  out.setUint16(32, 2, true);
  out.setUint16(34, 16, true);
  str(36, "data");
  out.setUint32(40, data.length * 2, true);

  for (let i = 0; i < data.length; i++) {
    const s = Math.max(-1, Math.min(1, data[i]));
    out.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([out.buffer], { type: "audio/wav" });
}

/* ── 学习记录 ─────────────────────────────────────────────────── */

/**
 * 听完计入 vocab_review_daily 的当日计数,**不计掌握度** ——
 * 听过不等于会,掌握度只认作答。
 *
 * ⚠️ 学习**时长**不在这里写:那条链路是 timeTracker.startTracking(),
 *    页面挂载时起、卸载时停,与其它学习页同一套。这里只加"复习了几个词"。
 * ⚠️ 表只有 (user_id, day, reviewed) 三列,没有 seconds/listened,
 *    也没有对应 RPC —— 沿用 vocabMastery.bumpReviewDaily 的先读后 upsert,
 *    不另造一套写法(两处写同一张表的口径必须一致)。
 * ⚠️ 未登录直接跳过(RLS 会拒),不当异常。
 */
export async function recordListening(words: number): Promise<void> {
  if (words <= 0) return;
  try {
    const uid = await currentUserId();
    if (!uid) return;
    const day = new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10);   // 北京日历日
    const { data } = await db
      .from("vocab_review_daily").select("reviewed")
      .eq("user_id", uid).eq("day", day).maybeSingle();
    const reviewed = ((data as { reviewed: number } | null)?.reviewed ?? 0) + words;
    await db.from("vocab_review_daily")
      .upsert({ user_id: uid, day, reviewed, updated_at: new Date().toISOString() }, { onConflict: "user_id,day" });
  } catch { /* 统计写失败不该打断听力 */ }
}
