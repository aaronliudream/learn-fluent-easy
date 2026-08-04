/**
 * 图书馆词库 · 用户分段判定(A/B/C/D)。埋点带上它,才看得出改动救了哪类人。
 *
 * 判据(Aaron 2026-07-25 裁决 · 方案②,不改 RLS、不新建表):
 *   A 新用户      收藏数 = 0 且 无阅读记录
 *   B 沉默读者    收藏数 = 0 且 有阅读记录
 *   C 收藏未复习  收藏数 > 0 且 无复习痕迹
 *   D 已复习      收藏数 > 0 且 有复习痕迹
 *
 * 为什么不是「是否打开过词库页」:那要读 funnel_events,但它的 SELECT 策略是 admin-only
 * (migrations/20260504021815_*.sql),普通用户端查自己的事件返回空。改 RLS 被否,
 * 故改用语义更贴近的「复习痕迹」——「点进去扫一眼就退」本来也该再提醒一次。
 *
 * 复习痕迹 = 下列任一:
 *   ① 收藏表有 correct_streak > 0 的行     ┐ 这两条在已拉取的收藏列表里现算,零额外请求
 *   ② 收藏表有 last_recalled_at 非空的行   ┘
 *   ③ library_review_streak 有该用户的行    ┐ 仅当 ①② 都不成立才查,且只查存在性 limit 1
 *   ④ library_vocab_review_daily 有该用户的行┘
 *
 * 缓存:模块级内存缓存(不落 localStorage —— 服务端才是真值)。收藏成功后调
 * invalidateLibrarySegment() 让下次重算,避免「刚收藏第一个词还被判成 A」。
 */
import { supabase } from "@/integrations/supabase/client";
import {
  listLibraryFavorites,
  vocabIsDueToday,
  type LibraryFavorite,
} from "@/lib/library/favorites";
import { isFunctionWord } from "@/lib/library/wordClass";
import { hasAnyReadingRecord } from "@/lib/library/progress";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export type LibrarySegment = "a" | "b" | "c" | "d";

export type LibrarySegmentInfo = {
  segment: LibrarySegment;
  /** 收藏总数(含虚词;口径=用户看到的"我收藏了几个") */
  favTotal: number;
  /** 今日待复习词数(与复习页同源:滤掉虚词后按 vocabIsDueToday 数) */
  dueToday: number;
  hasReading: boolean;
  hasReviewTrace: boolean;
  /** 最近收藏的至多 3 个词(入口卡满态副标题用)。listLibraryFavorites 已按 created_at 倒序,取前 3,零额外请求。 */
  recentTerms: string[];
};

let cached: LibrarySegmentInfo | null = null;
let inflight: Promise<LibrarySegmentInfo> | null = null;

/** 收藏/复习发生变化后调用:丢弃缓存,下次重算。 */
export function invalidateLibrarySegment(): void {
  cached = null;
  inflight = null;
}

/** 同步读缓存(埋点这类不该为了属性去等一次网络往返的场景用);没算过 → null。 */
export function peekLibrarySegment(): LibrarySegmentInfo | null {
  return cached;
}

/** 仅当 ①② 都不成立时才走:两张表各查一行,存在即算有复习痕迹。表未建/离线 → 按"无"算。 */
async function hasReviewTraceOnServer(userId: string): Promise<boolean> {
  try {
    const [streak, daily] = await Promise.all([
      db.from("library_review_streak").select("user_id").eq("user_id", userId).limit(1),
      db.from("library_vocab_review_daily").select("user_id").eq("user_id", userId).limit(1),
    ]);
    return (streak?.data?.length ?? 0) > 0 || (daily?.data?.length ?? 0) > 0;
  } catch {
    return false;
  }
}

/**
 * 算当前用户的分段。
 * @param favs 已经拉过的收藏列表(如首页);传了就不再打一次请求。
 */
export async function getLibrarySegment(favs?: LibraryFavorite[]): Promise<LibrarySegmentInfo> {
  if (cached) return cached;
  if (inflight) return inflight;
  inflight = (async () => {
    const list = favs ?? (await listLibraryFavorites());
    const favTotal = list.length;
    // 今日待复习与复习页同源:虚词不出题,不该算进"要复习的量"。
    const dueToday = list.filter((f) => !isFunctionWord(f.term, f.pos)).filter(vocabIsDueToday).length;

    let hasReviewTrace = list.some((f) => (f.correct_streak ?? 0) > 0 || !!f.last_recalled_at);
    if (!hasReviewTrace && favTotal > 0) {
      // 只有"有收藏但列表里看不出复习痕迹"(候选 C)才值得多打这两次存在性查询。
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (uid) hasReviewTrace = await hasReviewTraceOnServer(uid);
    }

    const hasReading = await hasAnyReadingRecord();

    const segment: LibrarySegment =
      favTotal === 0 ? (hasReading ? "b" : "a") : hasReviewTrace ? "d" : "c";

    const recentTerms = list.slice(0, 3).map((f) => f.term);
    const info: LibrarySegmentInfo = {
      segment,
      favTotal,
      dueToday,
      hasReading,
      hasReviewTrace,
      recentTerms,
    };
    cached = info;
    return info;
  })();
  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}
