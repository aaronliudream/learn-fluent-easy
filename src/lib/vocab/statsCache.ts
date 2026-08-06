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
 */
const KEY = "vocab_center_stats_v1";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type StatsSnapshot = {
  due: number;
  mistakes: number;
  mastered: number;
  learning: number;
};

export function readStatsCache(): StatsSnapshot | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as StatsSnapshot & { at?: number };
    if (!v || typeof v.at !== "number" || Date.now() - v.at > MAX_AGE_MS) return null;
    // 逐字段校验:localStorage 是用户可改的,坏数据不能直接进渲染
    for (const k of ["due", "mistakes", "mastered", "learning"] as const) {
      if (typeof v[k] !== "number" || !Number.isFinite(v[k]) || v[k] < 0) return null;
    }
    return { due: v.due, mistakes: v.mistakes, mastered: v.mastered, learning: v.learning };
  } catch {
    return null;                                   // 隐私模式 / JSON 坏了,当没缓存
  }
}

export function writeStatsCache(v: StatsSnapshot) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...v, at: Date.now() }));
  } catch {
    /* 隐私模式写不了,忽略 —— 缓存是加速手段,失败不该影响功能 */
  }
}
