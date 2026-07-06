// =====================================================================
// teacher-provision-student —— 老师代建学生账号（Phase 1.5）
//
// 唯一能碰 auth（建用户/改密码）的地方，用 service role key 执行。
// 骨架照搬 delete-account：CORS + Authorization 头验调用者 + service role admin client。
//
// 安全命门（service role 下 RLS 被绕过、auth.uid() 为 null）：
//   所有授权一律用从 JWT 验出的 callerId 做【显式 .eq() 归属过滤】，不依赖 RLS。
//   - 教师身份：直查 user_roles(user_id=callerId, role='teacher')，不是 is_teacher() RPC。
//   - create_student：classes.teacher_id = callerId（且未归档）。
//   - reset/update/remove：provisioned_students.created_by = callerId。
//   明文密码只在 create/reset 的响应里返回一次，绝不落库、绝不打日志。
// =====================================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STUDENT_EMAIL_DOMAIN = "students.bigmoonenglish.local";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// 6 位纯数字（10 万–99 万，无前导 0 困扰）
const gen6 = () => String(100000 + Math.floor(Math.random() * 900000));
// moon + 6~7 位数字
const genLoginId = () => "moon" + String(100000 + Math.floor(Math.random() * 9000000));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "missing authorization" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // 1) 验调用者（anon client + 调用者的 JWT）
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: ud, error: ue } = await userClient.auth.getUser();
    if (ue || !ud.user) return json({ error: "unauthorized" }, 401);
    const callerId = ud.user.id;

    // service role admin client（RLS 被绕过 → 下面所有查询必须自带归属过滤）
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

    // 2) 教师身份（直查表，不用 is_teacher() RPC —— 那个读 auth.uid()，service role 下为 null）
    const { data: roleRow } = await admin
      .from("user_roles").select("user_id")
      .eq("user_id", callerId).eq("role", "teacher").maybeSingle();
    if (!roleRow) return json({ error: "无教师权限" }, 403);

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const action = body?.action as string | undefined;

    // ── create_student ────────────────────────────────────────────────
    if (action === "create_student") {
      const classId = body.class_id as string | undefined;
      const realName = (body.real_name ?? null) as string | null;
      if (!classId) return json({ error: "缺少 class_id" }, 400);

      // 归属：班级属于调用者且未归档
      const { data: cls } = await admin
        .from("classes").select("id")
        .eq("id", classId).eq("teacher_id", callerId).is("archived_at", null)
        .maybeSingle();
      if (!cls) return json({ error: "不是你的班级或班级已归档" }, 403);

      // 生成唯一 login_id
      let loginId = "";
      for (let i = 0; i < 20; i++) {
        const cand = genLoginId();
        const { data: exist } = await admin
          .from("provisioned_students").select("login_id").eq("login_id", cand).maybeSingle();
        if (!exist) { loginId = cand; break; }
      }
      if (!loginId) return json({ error: "生成登录ID失败，请重试" }, 500);

      const password = gen6();
      const email = `${loginId}@${STUDENT_EMAIL_DOMAIN}`;

      // 建 auth 用户（合成邮箱 + email_confirm 免验证；display_name 只放 login_id，绝不放真名）
      const { data: created, error: cErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: loginId, provisioned: true },
      });
      if (cErr || !created?.user) return json({ error: cErr?.message ?? "创建账号失败" }, 500);
      const newId = created.user.id;

      // 登记 provisioned_students；失败回滚删孤儿 auth 用户
      const { error: pErr } = await admin.from("provisioned_students").insert({
        student_user_id: newId,
        created_by: callerId,
        login_id: loginId,
        real_name: realName,
        class_id: classId,
      });
      if (pErr) {
        await admin.auth.admin.deleteUser(newId);
        return json({ error: "登记失败：" + pErr.message }, 500);
      }

      // 挂进班级；失败回滚（删登记 + 删孤儿 auth 用户）
      const { error: mErr } = await admin
        .from("class_members").insert({ class_id: classId, member_id: newId, role: "student" });
      if (mErr) {
        await admin.from("provisioned_students").delete().eq("student_user_id", newId);
        await admin.auth.admin.deleteUser(newId);
        return json({ error: "挂班失败：" + mErr.message }, 500);
      }

      // 明文密码一次性返回（不落库、不打日志）
      return json({ login_id: loginId, initial_password: password });
    }

    // ── reset_password ────────────────────────────────────────────────
    if (action === "reset_password") {
      const sid = body.student_user_id as string | undefined;
      if (!sid) return json({ error: "缺少 student_user_id" }, 400);

      // 归属：只能重置自己代建的学生
      const { data: ps } = await admin
        .from("provisioned_students").select("login_id")
        .eq("student_user_id", sid).eq("created_by", callerId).maybeSingle();
      if (!ps) return json({ error: "不是你代建的学生" }, 403);

      const password = gen6();
      const { error: uErr } = await admin.auth.admin.updateUserById(sid, { password });
      if (uErr) return json({ error: uErr.message }, 500);

      // 新密码一次性返回（不回显旧密码，也无从获取）
      return json({ login_id: ps.login_id, new_password: password });
    }

    // ── update_real_name ──────────────────────────────────────────────
    if (action === "update_real_name") {
      const sid = body.student_user_id as string | undefined;
      const realName = (body.real_name ?? null) as string | null;
      if (!sid) return json({ error: "缺少 student_user_id" }, 400);

      const { data: ps } = await admin
        .from("provisioned_students").select("student_user_id")
        .eq("student_user_id", sid).eq("created_by", callerId).maybeSingle();
      if (!ps) return json({ error: "不是你代建的学生" }, 403);

      const { error } = await admin
        .from("provisioned_students").update({ real_name: realName })
        .eq("student_user_id", sid).eq("created_by", callerId); // 显式归属守卫（RLS 不生效）
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    // ── remove_student（移出班级，软删；不删账号）──────────────────────
    if (action === "remove_student") {
      const sid = body.student_user_id as string | undefined;
      if (!sid) return json({ error: "缺少 student_user_id" }, 400);

      const { data: ps } = await admin
        .from("provisioned_students").select("class_id")
        .eq("student_user_id", sid).eq("created_by", callerId).maybeSingle();
      if (!ps) return json({ error: "不是你代建的学生" }, 403);

      if (ps.class_id) {
        const { error } = await admin
          .from("class_members").update({ removed_at: new Date().toISOString() })
          .eq("member_id", sid).eq("class_id", ps.class_id);
        if (error) return json({ error: error.message }, 500);
      }
      return json({ ok: true });
    }

    return json({ error: "未知 action" }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
