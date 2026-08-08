/**
 * 词汇中心统计数字的本地缓存(stale-while-revalidate)。
 *
 * 用途只有一个:**二次进入秒显**。回访时先铺上次的数字,后台照常刷新。
 *
 * ⚠️ 缓存永远不跳过后台刷新 —— 只用于"先显示什么",不用于"要不要请求"。
 *    跳过请求的话数据会停在旧值,而这几个数字(到期/错题/掌握)每天都变。
 * ⚠️ 带 24 小时上限:隔了很久再回来,宁可显示骨架也不要显示一个明显过期的数字 ——
 *    "昨天的到期数"比"正在加载"更误导。
 * ⚠️ 不缓存词库列表:那是内容不是进度,由 HTTP 层与 React 缓存管,
 *    塞进 localStorage 只会多一份要同步的副本。
 * ⚠️ **按词库分开存**(key 带 bankCode)。中心页改成下拉切库后,
 *    统计数字的口径变成"当前词库",一个全局快照会让切库时先闪出
 *    另一个库的数字 —— 那比骨架屏还糟。老的 v1 全局键不再读写。
 */
const KEY_PREFIX = "vocab_center_stats_v2_";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type StatsSnapshot = {
  due: number;
  mistakes: number;
  mastered: number;
  learning: number;
  /** 该库实际可学词数(进度条分母)。 */
  total: number;
};

const FIELDS = ["due", "mistakes", "mastered", "learning", "total"] as const;

export function readStatsCache(bankCode: string): StatsSnapshot | null {
  if (!bankCode) return null;
  try {
    const raw = localStorage.getItem(KEY_PREFIX + bankCode);
    if (!raw) return null;
    const v = JSON.parse(raw) as StatsSnapshot & { at?: number };
    if (!v || typeof v.at !== "number" || Date.now() - v.at > MAX_AGE_MS) return null;
    // 逐字段校验:localStorage 是用户可改的,坏数据不能直接进渲染
    for (const k of FIELDS) {
      if (typeof v[k] !== "number" || !Number.isFinite(v[k]) || v[k] < 0) return null;
    }
    return { due: v.due, mistakes: v.mistakes, mastered: v.mastered, learning: v.learning, total: v.total };
  } catch {
    return null;                                   // 隐私模式 / JSON 坏了,当没缓存
  }
}

export function writeStatsCache(bankCode: string, v: StatsSnapshot) {
  if (!bankCode) return;
  try {
    localStorage.setItem(KEY_PREFIX + bankCode, JSON.stringify({ ...v, at: Date.now() }));
  } catch {
    /* 隐私模式写不了,忽略 —— 缓存是加速手段,失败不该影响功能 */
  }
}
