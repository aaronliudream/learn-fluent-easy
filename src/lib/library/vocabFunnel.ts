/**
 * 图书馆词库入口 · 三个漏斗埋点(全部走既有 trackFunnel,不新建表、不新建 edge)。
 *
 * 命名沿用站内既有规范(signup / paywall_view / pricing_select_plan …):
 *   event_name = snake_case 名词短语,step = 子状态,metadata = 属性。
 * 这里 step 一律放**分段名 a|b|c|d**(Aaron 定),metadata 带今日待复习数 + 收藏总数。
 *
 * 三个事件:
 *   library_vocab_entry_view    图书馆首页词库入口曝光(每次会话只报一次)
 *   library_vocab_entry_click   点击词库入口
 *   library_vocab_favorite_add  单词收藏成功
 *
 * 铁律:匿名可上报(funnel_events 的 insert 策略 to anon, authenticated —— 匿名标识复用
 * funnel.ts 既有的 funnel_session_id,不新建);不阻塞渲染;失败静默(trackFunnel 内部已 catch)。
 */
import { trackFunnel } from "@/lib/funnel";
import type { LibrarySegmentInfo } from "@/lib/library/segment";

/** 曝光去重:同一浏览器会话只报一次。sessionStorage 只作"报没报过"的抑制,不作数据真值。 */
const VIEW_ONCE_KEY = "library_vocab_entry_view_sent";

function baseProps(info: LibrarySegmentInfo) {
  return {
    segment: info.segment,
    due_today: info.dueToday,
    fav_total: info.favTotal,
    has_reading: info.hasReading,
    has_review_trace: info.hasReviewTrace,
  };
}

/** 入口曝光。每次会话只报一次 —— 滚动/重渲染都不会重复上报。 */
export function trackVocabEntryView(info: LibrarySegmentInfo): void {
  try {
    if (sessionStorage.getItem(VIEW_ONCE_KEY)) return;
    sessionStorage.setItem(VIEW_ONCE_KEY, "1");
  } catch {
    /* 隐私模式下拿不到 sessionStorage:宁可报一次,也不因为埋点抛错 */
  }
  void trackFunnel("library_vocab_entry_view", info.segment, baseProps(info));
}

/** 点击入口卡片。 */
export function trackVocabEntryClick(info: LibrarySegmentInfo): void {
  void trackFunnel("library_vocab_entry_click", info.segment, baseProps(info));
}

/** B 类(有阅读记录但零收藏)阅读页一次性轻提示的曝光。展示本身终身只有一次,故不再另做去重。 */
export function trackVocabBHintView(info: LibrarySegmentInfo, bookKey: string, chapterIdx: number): void {
  void trackFunnel("library_vocab_b_hint_view", info.segment, {
    ...baseProps(info),
    book_key: bookKey,
    chapter_idx: chapterIdx,
  });
}

/** 收藏成功。isFirst = 是否为该用户的第一个收藏词。 */
export function trackVocabFavoriteAdd(args: {
  info: LibrarySegmentInfo | null;
  term: string;
  kind: string;
  isFirst: boolean;
  bookKey?: string;
  chapterIdx?: number;
}): void {
  const { info, term, kind, isFirst, bookKey, chapterIdx } = args;
  void trackFunnel("library_vocab_favorite_add", info?.segment ?? "unknown", {
    ...(info ? baseProps(info) : { segment: "unknown" }),
    is_first_favorite: isFirst,
    term,
    kind,
    book_key: bookKey ?? null,
    chapter_idx: chapterIdx ?? null,
  });
}
