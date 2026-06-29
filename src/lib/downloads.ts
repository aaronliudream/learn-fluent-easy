// 资料下载区:数据读取 + 签名URL/下载/预览。纯新增,只读公开表 + 私有桶签名URL。
// 桶约定:完整文件 files/ 前缀(仅登录可签名);有限预览 previews/ 前缀(任何人可签名)。
import { supabase } from "@/integrations/supabase/client";

export interface DownloadCategory {
  id: number;
  name: string;
  sort_order: number;
}
export interface DownloadSubject {
  id: number;
  category_id: number;
  name: string;
  sort_order: number;
}
export interface DownloadItem {
  id: number;
  title: string;
  description: string | null;
  file_type: string;
  file_path: string;
  category_id: number;
  subject_id: number | null;
  material_type: string;
  preview_path: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

export interface DownloadsData {
  categories: DownloadCategory[];
  subjects: DownloadSubject[];
  items: DownloadItem[];
}

const SIGNED_URL_TTL = 300; // 签名URL 5 分钟有效

/** 拉全部分类/细分/已发布资料。表不存在或出错时返回空(板块自动隐藏)。 */
export async function fetchDownloads(): Promise<DownloadsData> {
  try {
    // 新表未进生成类型,沿用仓库既有的 `as any` 取数约定(见 suzhouExamReports.ts)。
    const sb = supabase as any;
    const [cats, subs, items] = await Promise.all([
      sb.from("downloads_categories").select("*").order("sort_order"),
      sb.from("downloads_subjects").select("*").order("sort_order"),
      sb.from("downloads_items").select("*").eq("is_published", true).order("sort_order"),
    ]);
    return {
      categories: (cats.data ?? []) as DownloadCategory[],
      subjects: (subs.data ?? []) as DownloadSubject[],
      items: (items.data ?? []) as DownloadItem[],
    };
  } catch {
    return { categories: [], subjects: [], items: [] };
  }
}

async function signedUrl(path: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from("downloads")
      .createSignedUrl(path, SIGNED_URL_TTL);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

/** 有限预览:任何人(含游客)可看 preview_path。无预览返回 null。 */
export async function getPreviewUrl(item: DownloadItem): Promise<string | null> {
  if (!item.preview_path) return null;
  return signedUrl(item.preview_path);
}

export type DownloadOutcome =
  | { ok: true; url: string }
  | { ok: false; reason: "guest" }
  | { ok: false; reason: "error" };

/** 完整下载:登录用户拿签名URL;游客返回 guest(由 UI 引导注册)。 */
export async function getFullDownloadUrl(item: DownloadItem): Promise<DownloadOutcome> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "guest" };
  const url = await signedUrl(item.file_path);
  if (!url) return { ok: false, reason: "error" };
  return { ok: true, url };
}
