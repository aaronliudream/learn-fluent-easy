import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * 教师身份判定 —— 调 RPC is_teacher()(读 user_roles 是否有 'teacher' 角色,
 * security definer)。教师身份自助开通(enable_teacher_role),老师同时仍是
 * 普通用户,学习功能不变;此判定只用于教师后台入口/路由守卫。
 *
 * 行为约定(照抄 useIsAdmin):
 * - 未登录 / 匿名用户:直接 isTeacher=false、loading=false。
 * - 已登录:调 RPC 拿真实结果。
 * - 监听 auth 变化(登录/登出/换号),自动重判;重判不重置 loading,避免闪 loader。
 */
export function useIsTeacher(): { isTeacher: boolean; loading: boolean } {
  const [state, setState] = useState<{ isTeacher: boolean; loading: boolean }>({
    isTeacher: false,
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
        setState({ isTeacher: false, loading: false });
        return;
      }
      try {
        // 新建 RPC,types.ts 未重生成,故 rpc 名做 string 转义。
        const rpc = supabase.rpc.bind(supabase) as (
          fn: string,
        ) => Promise<{ data: unknown; error: unknown }>;
        const { data, error } = await rpc("is_teacher");
        if (cancelled) return;
        setState({ isTeacher: !error && data === true, loading: false });
      } catch {
        if (!cancelled) setState({ isTeacher: false, loading: false });
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
