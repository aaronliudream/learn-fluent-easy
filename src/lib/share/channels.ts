import type { ShareItem, ShareRegion } from "./types";

export type Channel = {
  key: string;
  label: string;
  emoji: string;
  /** Returns true if the channel handled the share (else caller may fallback). */
  share: (text: string, url: string, title: string) => Promise<boolean> | boolean;
  hint?: string;
};

const enc = encodeURIComponent;

export const CHANNELS_CN: Channel[] = [
  {
    key: "wechat",
    label: "微信",
    emoji: "💚",
    hint: "复制内容后，打开微信粘贴；或保存卡片图发送",
    share: async (text) => { await navigator.clipboard.writeText(text); return true; },
  },
  {
    key: "moments",
    label: "朋友圈",
    emoji: "🌟",
    hint: "建议先点【生成卡片图】，朋友圈靠图片传播",
    share: async (text) => { await navigator.clipboard.writeText(text); return true; },
  },
  {
    key: "xhs",
    label: "小红书",
    emoji: "📕",
    hint: "复制后打开小红书 App 发布；附上卡片图效果更好",
    share: async (text) => { await navigator.clipboard.writeText(text); return true; },
  },
  {
    key: "weibo",
    label: "微博",
    emoji: "🐦",
    share: (text, url, title) => {
      window.open(`https://service.weibo.com/share/share.php?url=${enc(url)}&title=${enc(title + "  " + text)}`, "_blank");
      return true;
    },
  },
  {
    key: "qq",
    label: "QQ",
    emoji: "💜",
    share: (text, url, title) => {
      window.open(`https://connect.qq.com/widget/shareqq/index.html?url=${enc(url)}&title=${enc(title)}&desc=${enc(text)}`, "_blank");
      return true;
    },
  },
  {
    key: "douyin",
    label: "抖音",
    emoji: "🎵",
    hint: "复制后打开抖音粘贴；建议附上卡片图",
    share: async (text) => { await navigator.clipboard.writeText(text); return true; },
  },
  {
    key: "zhihu",
    label: "知乎",
    emoji: "🤔",
    hint: "复制后打开知乎粘贴",
    share: async (text) => { await navigator.clipboard.writeText(text); return true; },
  },
];

export const CHANNELS_INTL: Channel[] = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    emoji: "💬",
    share: (text) => { window.open(`https://wa.me/?text=${enc(text)}`, "_blank"); return true; },
  },
  {
    key: "twitter",
    label: "X / Twitter",
    emoji: "🐦",
    share: (text, url) => { window.open(`https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`, "_blank"); return true; },
  },
  {
    key: "facebook",
    label: "Facebook",
    emoji: "👍",
    share: (_t, url) => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, "_blank"); return true; },
  },
  {
    key: "telegram",
    label: "Telegram",
    emoji: "✈️",
    share: (text, url) => { window.open(`https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`, "_blank"); return true; },
  },
  {
    key: "reddit",
    label: "Reddit",
    emoji: "👽",
    share: (_t, url, title) => { window.open(`https://reddit.com/submit?url=${enc(url)}&title=${enc(title)}`, "_blank"); return true; },
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    emoji: "💼",
    share: (_t, url) => { window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`, "_blank"); return true; },
  },
  {
    key: "instagram",
    label: "Instagram",
    emoji: "📷",
    hint: "Save the card image, then post to Instagram",
    share: async (text) => { await navigator.clipboard.writeText(text); return true; },
  },
  {
    key: "email",
    label: "Email",
    emoji: "📨",
    share: (text, _u, title) => { window.location.href = `mailto:?subject=${enc(title)}&body=${enc(text)}`; return true; },
  },
];

export function channelsFor(region: ShareRegion): Channel[] {
  return region === "CN" ? CHANNELS_CN : CHANNELS_INTL;
}

export async function nativeShare(text: string, url: string, title: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !(navigator as any).share) return false;
  try {
    await (navigator as any).share({ title, text, url });
    return true;
  } catch {
    return false;
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

void {} as { item?: ShareItem }; // ensure type imported is referenced
