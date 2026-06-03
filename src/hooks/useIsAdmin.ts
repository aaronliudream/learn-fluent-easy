import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * 管理员判定 —— 调 RPC is_current_user_admin()(读 profiles.is_admin,security definer)。
 *
 * 行为约定:
 * - 未登录 / 匿名用户:直接 isAdmin=false、loading=false,不卡在 loading。
 * - 已登录:调 RPC 拿真实结果。
 * - 监听 auth 变化(登录/登出/换号),自动重新判定;重新判定不重置 loading,
 *   避免路由守卫在已渲染后又闪一下 loader。
 */
export function useIsAdmin(): { isAdmin: boolean; loading: boolean } {
  const [state, setState] = useState<{ isAdmin: boolean; loading: boolean }>({
    isAdmin: false,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    const evaluate = async (showLoading: boolean) => {
      if (showLoading) setState((s) => ({ ...s, loading: true }));
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        setState({ isAdmin: false, loading: false });
        return;
      }
      try {
        // 新建 RPC,types.ts 未重生成,故 rpc 名做 string 转义。
        const rpc = supabase.rpc.bind(supabase) as (
          fn: string,
        ) => Promise<{ data: unknown; error: unknown }>;
        const { data, error } = await rpc("is_current_user_admin");
        if (cancelled) return;
        setState({ isAdmin: !error && data === true, loading: false });
      } catch {
        if (!cancelled) setState({ isAdmin: false, loading: false });
      }
    };

    void evaluate(true);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        void evaluate(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
