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
 * ⚠️ **速度**:整条的全局倍速用 `<audio>.playbackRate` 在元素层调,不烧进波形 ——
 *    元素层变速是**保音高**的(浏览器做时间拉伸)。
 *    但「慢速跟读」是序列里的**一档**,只慢这一段,必须烧进那条拼接音频。
 *    此处不能用 `AudioBufferSourceNode.playbackRate` —— 那等价于改采样率,
 *    0.7 倍会掉约 6 个半音,变成低沉的"慢放磁带",听感和发音示范都不成立。
 *    所以自带一个保音高的时间拉伸 `timeStretch`(WSOLA),纯本地算、零音频成本。
 *
 * ⚠️ **拆读档已弃用**(Aaron 2026-08-08 裁决)。
 *    `vocab_words.syllable_audio_url` 那 4471 条**留在库里备查,前端不再引用**。
 *    弃用原因:当初烧录送进 TTS 的文本是 `syllables.join(". ") + "."`
 *    (由音频文件名的内容哈希反解证实,20/20 命中),即 `"cel. e. bra. ted."` ——
 *    OpenAI TTS 把每个音节当成独立句子读,各带完整重音和句末降调,
 *    `cel/e/bra/ted` 的 `e` 被读成**字母音 /iː/ 而不是音节音 /ə/**。
 *    实测拆读时长普遍是整词的 2 倍上下,就是句间停顿堆出来的。
 *    替代方案 = 整词音频 + 0.7 倍保音高慢放,一个开关搞定,不重烧。
 *
 * ⚠️ `syllables` 数组**保留**:它的切分是对的(20 词抽样全为标准词典切法),
 *    将来做"视觉拆读"(边读整词边逐音节高亮)还用得上,只是不再配音频。
 *
 * ⚠️ 中文释义那一档**目前没有音频资产**(vocab_words 只有单词与拆读音频,
 *    def_zh 没有配音)。按"缺音频的元素跳过、不中断序列"处理,
 *    UI 上明标"音频待生成",不做成点了没反应的假开关。
 */
import { supabase } from "@/integrations/supabase/client";
import {
  currentUserId, listBankWordIds, listMasteryRows, listMistakes,
  listExamplesFor, type MasteryRow, type VocabWord, type VocabExample,
} from "@/lib/vocab/data";
import { listSceneItems } from "@/lib/vocab/scenes";
import { fallback, logFail } from "@/lib/vocab/report";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

/* ── 序列元素 ─────────────────────────────────────────────────── */

export type ElementKey = "word" | "slow" | "gloss" | "example";

export const ELEMENTS: { key: ElementKey; label: string; hint: string; fixed?: boolean; unavailable?: boolean }[] = [
  { key: "word", label: "单词", hint: "必读", fixed: true },
  { key: "slow", label: "慢速跟读", hint: "整词 0.7 倍" },
  { key: "gloss", label: "中文释义", hint: "只显示不朗读", unavailable: true },
  { key: "example", label: "例句", hint: "第 1 条" },
];

export type ElementToggles = Record<ElementKey, boolean>;
export const DEFAULT_TOGGLES: ElementToggles = { word: true, slow: true, gloss: false, example: true };

/** 慢速档的倍率。0.7 是"能听清每个音"与"还像正常说话"的折中。 */
export const SLOW_RATE = 0.7;

/** 元素之间 0.8s;单词之后额外 1.5s 供跟读(合计 2.3s)。 */
const GAP_BETWEEN = 0.8;
const GAP_AFTER_WORD = 1.5;

/**
 * 磨耳朵要的词形 = 通用 VocabWord + 音节切分。
 * ⚠️ `syllables` **不加进 data.ts 的共享 select** —— 词库页一次要拉 4470 条,
 *    每条多带一个数组是白扔的流量,而那个页面根本用不到。这里自己查自己的列。
 * ⚠️ `syllable_audio_url` 已弃用(见文件头),不再查、不再引用。
 */
export type ListenWord = VocabWord & {
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
    /* 取不到 → 顺序退回原序,用户完全无感 ——正因为无感,更要留一行日志 */
    const touched = new Set((await listMasteryRows().catch(fallback("earTraining/listMasteryRows", [] as MasteryRow[])))
      .filter(r => (r.tested_count ?? 0) > 0).map(r => r.word_id));
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
  const cols = "id,headword,ipa,pos,def_zh,def_en,freq_rank,audio_url,syllables";
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

/** 序列里的一段:一条音频 + 播放倍率(1 = 原速)。 */
export type ClipSpec = { url: string; rate: number };

/**
 * 这个词按当前开关会用到哪些片段(缺的自动跳过)。
 *
 * ⚠️ 慢速档**复用整词那条音频**,不是另一个资产 —— 它和「单词」档指向同一个
 *    URL,只有 rate 不同。fetchBuffer 按 URL 缓存,所以这一档不产生额外网络请求。
 *
 * ⚠️ **慢速档不吃全局倍速**(Aaron 2026-08-08 定):
 *    实际听到的倍率 = 烧进波形的拉伸率 × 元素层 playbackRate(= globalSpeed)。
 *    要让这一档恒为 0.7,烧进去的就得是 `0.7 / globalSpeed` —— 做预补偿。
 *    不补偿的话两者叠乘:全局 0.7 时慢速档变成 0.49 倍,拖沓到没法听。
 *    · globalSpeed=0.7  → 烧 1.0(压根不拉伸,元素层那 0.7 正好就是要的)
 *    · globalSpeed=1.0  → 烧 0.7
 *    · globalSpeed=1.25 → 烧 0.56(先多拉长,再被元素层提速抵回来)
 */
export function clipSpecsFor(item: ListenItem, toggles: ElementToggles, globalSpeed = 1): ClipSpec[] {
  const specs: ClipSpec[] = [];
  if (item.word.audio_url) {
    specs.push({ url: item.word.audio_url, rate: 1 });                           // 单词必读
    if (toggles.slow) {
      const g = Number(globalSpeed) > 0 ? Number(globalSpeed) : 1;
      /* 四舍五入到千分位:浮点除法会让 0.7/0.7 算出 0.9999999999999999,
         那样 `rate === 1` 的快路径就白判了,平白多跑一次 WSOLA。 */
      specs.push({ url: item.word.audio_url, rate: Math.round((SLOW_RATE / g) * 1000) / 1000 });
    }
  }
  // gloss:没有音频资产,恒跳过(见文件头)
  if (toggles.example && item.example?.audio_url) specs.push({ url: item.example.audio_url, rate: 1 });
  return specs;
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
export async function prefetchClip(specs: ClipSpec[]): Promise<void> {
  /* 去重:慢速档和单词档是同一个 URL,不去重会白下一次(fetchBuffer 有缓存,
     但两次 await 会并发发出两个请求,缓存来不及命中)。 */
  const urls = [...new Set(specs.map(s => s.url))];
  try { await Promise.all(urls.map(fetchBuffer)); } catch { /* 预热失败不影响主流程 */ }
}

/**
 * 把一个词的整段序列渲染成**一条**音频(间隔是真静音)。
 * 返回可直接喂给 `<audio>.src` 的 object URL,以及总时长(秒)。
 * ⚠️ 调用方负责在换词时 revokeObjectURL,否则一轮 50 词会漏 50 个 blob。
 */
/**
 * 保音高的时间拉伸(WSOLA:带相似度对齐的重叠相加)。
 *
 * 为什么不用 `AudioBufferSourceNode.playbackRate`:那等价于改采样率,
 * 0.7 倍会把音高压低约 6 个半音(12·log2(1/0.7)),alloy 会变成低音怪。
 * 发音示范必须保音高,所以自己做时间轴拉伸。
 *
 * 做法:按合成跳距 Hs 往输出里铺加窗帧,输入侧按 Ha = Hs·rate 前进,
 * 于是输出比输入长 1/rate 倍。每帧起点在理想位置 ±R 内搜一次,
 * 挑与"上一帧自然延续段"互相关最高的那个 —— 这一步是 WSOLA 与朴素 OLA
 * 的唯一区别,没有它波形接缝处相位打架,人声会有明显的金属回声感。
 *
 * ⚠️ 纯函数(Float32Array 进出),不碰 Web Audio,好测。
 */
export function timeStretch(input: Float32Array, sampleRate: number, rate: number): Float32Array {
  if (rate === 1 || input.length === 0) return input;
  const N = Math.max(4, Math.round(0.04 * sampleRate));    // 窗长 40ms
  const Hs = Math.max(1, Math.round(N / 2));               // 合成跳距 = 半窗,Hann 窗下正好常数叠加
  const Ha = Math.max(1, Math.round(Hs * rate));           // 分析跳距
  /* 搜索半径要 ≥ 最低基频的一个周期,否则搜不到相位对齐点、接缝处相位打架。
     男声基频低到 ~85Hz(周期 11.8ms),所以取 12ms。 */
  const R = Math.max(1, Math.round(0.012 * sampleRate));

  const win = new Float32Array(N);
  for (let i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1));

  const outLen = Math.ceil(input.length / rate) + N;
  const out = new Float32Array(outLen);
  const norm = new Float32Array(outLen);

  let anaPrev = 0;      // 上一帧实际取用的输入起点
  let outPos = 0;
  let written = 0;      // 实际被写到的最远位置(尾部截断要用,见下)
  for (let k = 0; ; k++) {
    const ideal = k * Ha;
    if (ideal + N > input.length) break;

    let best = ideal;
    if (k > 0) {
      /* 上一帧若原速继续播,应当接到 anaPrev + Hs;在 ideal 附近找最像它的那段 */
      const ref = anaPrev + Hs;
      const lo = Math.max(0, ideal - R);
      const hi = Math.min(input.length - N, ideal + R);
      let bestScore = -Infinity;
      for (let c = lo; c <= hi; c++) {
        let s = 0;
        // 每 4 点抽样即可:这是找对齐点,不是求精确相关值,省 4 倍时间
        for (let i = 0; i + ref < input.length && i < N; i += 4) s += input[ref + i] * input[c + i];
        if (s > bestScore) { bestScore = s; best = c; }
      }
    }

    for (let i = 0; i < N; i++) {
      const o = outPos + i;
      if (o >= outLen) break;
      out[o] += input[best + i] * win[i];
      norm[o] += win[i];
    }
    anaPrev = best;
    written = Math.min(outLen, outPos + N);
    outPos += Hs;
  }

  // 归一化:窗叠加权重不恒等于 1(首尾帧、搜索导致的跳距抖动都会破坏它)
  for (let i = 0; i < outLen; i++) if (norm[i] > 1e-6) out[i] /= norm[i];

  /* ⚠️ 必须按**实际写到哪**截,不能按理论长度 input.length/rate 截。
     循环在 `ideal + N > input.length` 就停,最后一帧只铺到 K·Hs+N,
     比理论长度短约 N·(1/rate − 1)。按理论长度切会在尾巴补一段静音
     (0.7 倍下约 17ms)。踩过:那段静音没有过零,把测音高用的过零率
     压低 2.4%,一度被误判成"音高漂了"。 */
  return out.slice(0, Math.max(1, Math.min(written, Math.round(input.length / rate))));
}

/** 把 AudioBuffer 按 rate 拉伸成新的 AudioBuffer(单声道,取第 0 声道)。 */
function stretchBuffer(buf: AudioBuffer, rate: number): AudioBuffer {
  const stretched = timeStretch(buf.getChannelData(0), buf.sampleRate, rate);
  const out = audioCtx().createBuffer(1, stretched.length, buf.sampleRate);
  out.getChannelData(0).set(stretched);
  return out;
}

export async function buildWordClip(specs: ClipSpec[]): Promise<{ url: string; seconds: number }> {
  if (!specs.length) {
    diag("✗ 这个词没有任何可播音频(单词/例句都缺),将跳过", { specs });
    throw new Error("EMPTY_CLIP");
  }
  diag("拼接开始", { 片段数: specs.length });
  const raw = await Promise.all(specs.map(s => fetchBuffer(s.url)));

  const sr = raw[0].sampleRate;
  // 慢速档在这里就地拉伸成新波形;原速档原样用
  const bufs = raw.map((b, i) => specs[i].rate === 1 ? b : stretchBuffer(b, specs[i].rate));

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
  } catch (e) { logFail("earTraining/bumpReviewDaily", e); /* 统计写失败不该打断听力 */ }
}
