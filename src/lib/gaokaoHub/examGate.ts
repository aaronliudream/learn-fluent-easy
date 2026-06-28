import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** 高考真题 email 白名单(纯前端藏入口,非锁 URL/RLS)。只有这个 email 登录才渲染真题卡。 */
export const EXAM_WHITELIST_EMAILS = ["aaron.liudream@outlook.com"];

/** 读当前登录 email,判断是否在高考真题白名单内。未登录/不匹配 → false。 */
export function useExamWhitelisted(): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email ?? null;
      if (!cancelled) setOk(!!email && EXAM_WHITELIST_EMAILS.includes(email));
    });
    return () => { cancelled = true; };
  }, []);
  return ok;
}
