import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { consumeRedirectPath } from "@/lib/authRedirect";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { GraduationCap, ArrowRight, Sparkles, Loader2, Check, X, Mail, KeyRound } from "lucide-react";
import { Link } from "react-router-dom";
import { T, useT } from "@/i18n/T";
import { useI18n } from "@/i18n/I18nProvider";

// Internal placeholder domain for guest accounts (never receives email)
const GUEST_DOMAIN = "guest.bigmoon.local";
// 老师代建学生账号的合成邮箱域名（永不收信；与 edge function teacher-provision-student 保持一致）
const STUDENT_EMAIL_DOMAIN = "students.bigmoonenglish.local";
const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "")
    .slice(0, 16) || `u${Math.random().toString(36).slice(2, 8)}`;
const guestEmail = (username: string) =>
  `${slugify(username)}.${Math.random().toString(36).slice(2, 8)}@${GUEST_DOMAIN}`;
const pinToPassword = (pin: string) => `pin:${pin}:bigmoon-2026`;

/** Supabase rate-limits signUp/sign-in per IP; guest nickname flow still uses signUp so the same cap applies. */
function isSupabaseAuthRateLimited(error: { message?: string; status?: number } | null | undefined): boolean {
  const msg = (error?.message ?? "").toLowerCase();
  const st = error?.status;
  return (
    st === 429 ||
    msg.includes("rate limit") ||
    msg.includes("too many requests") ||
    msg.includes("over_email_send_rate_limit")
  );
}

function supabaseAuthToastMessage(
  error: { message?: string; status?: number } | null | undefined,
  t: (text: string) => string,
  fallback: string,
): string {
  if (isSupabaseAuthRateLimited(error)) {
    return t(
      "当前访问较多，服务器暂时限制了注册，请几分钟后再试。这与是否填写邮箱无关，您也可稍后改用邮箱注册。",
    );
  }
  return (error?.message?.trim()) || fallback;
}

const Auth = () => {
  const navigate = useNavigate();
  const t = useT();
  const { lang } = useI18n();
  const [loading, setLoading] = useState(false);
  // ----- nickname (guest) state -----
  const [nickname, setNickname] = useState("");
  const [pin, setPin] = useState("");
  const [nickAvailable, setNickAvailable] = useState<boolean | null>(null);
  const [nickChecking, setNickChecking] = useState(false);
  // ----- email state -----
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  // 学生登录（老师代建账号）：login_id + 6 位密码 → 合成邮箱
  const [studentId, setStudentId] = useState("");
  const [studentPw, setStudentPw] = useState("");
  const [agreed, setAgreed] = useState(false);
  // Age band — required for COPPA / GDPR-K compliance.
  // child = <13, teen = 13–17, adult = 18+. Persisted to profiles.age_band + is_minor.
  const [ageBand, setAgeBand] = useState<"child" | "teen" | "adult" | "">("");
  // Parent consent — required when ageBand === "child" (under 13).
  const [parentConsent, setParentConsent] = useState(false);
  // Email signup also collects age band for COPPA / GDPR-K compliance.
  const [emailAgeBand, setEmailAgeBand] = useState<"child" | "teen" | "adult" | "">("");
  const [emailParentConsent, setEmailParentConsent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      // 已登录用户进 /auth → 优先回到之前的页面，否则跳到学习面板
      if (session) {
        const redirect = consumeRedirectPath();
        navigate(redirect || "/dashboard", { replace: true });
      }
    });
  }, [navigate]);

  // Live check nickname availability (debounced)
  useEffect(() => {
    const n = nickname.trim();
    if (n.length < 2) { setNickAvailable(null); return; }
    setNickChecking(true);
    const id = setTimeout(async () => {
      const { data } = await supabase.rpc("username_available", { _name: n });
      setNickAvailable(!!data);
      setNickChecking(false);
    }, 350);
    return () => clearTimeout(id);
  }, [nickname]);

  const suggestions = useMemo(() => {
    const base = nickname.trim();
    if (!base || nickAvailable !== false) return [];
    return [`${base}${Math.floor(Math.random()*90+10)}`, `${base}🌟`, `${base}_${new Date().getFullYear()}`];
  }, [nickname, nickAvailable]);

  const handleNickSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = nickname.trim();
    if (n.length < 2 || n.length > 24) { toast.error(t("昵称需 2–24 个字符")); return; }
    if (pin.length < 4) { toast.error(t("密码至少 4 位")); return; }
    if (nickAvailable === false) { toast.error(t("昵称已被占用，换一个吧")); return; }
    if (!ageBand) { toast.error(t("请选择你的年龄段")); return; }
    if (ageBand === "child" && !parentConsent) {
      toast.error(t("13 岁以下需家长或监护人同意才能注册"));
      return;
    }
    setLoading(true);
    // Server-side validation
    const { data: vCode } = await supabase.rpc("validate_username", { _name: n });
    if (vCode && vCode !== "ok") {
      setLoading(false);
      const map: Record<string, string> = {
        too_short: "昵称太短", too_long: "昵称太长",
        invalid_chars: "昵称只能用字母/数字/中文/下划线", forbidden_word: "昵称包含敏感词",
      };
      toast.error(t(map[vCode as string] ?? "昵称无效"));
      return;
    }
    const placeholderEmail = guestEmail(n);
    const { data, error } = await supabase.auth.signUp({
      email: placeholderEmail,
      password: pinToPassword(pin),
      options: { emailRedirectTo: `${window.location.origin}/`, data: { display_name: n } },
    });
    if (error || !data.user) {
      setLoading(false);
      toast.error(supabaseAuthToastMessage(error, t, t("注册失败")));
      return;
    }
    // Update profile with username + is_guest
    await supabase.from("profiles").upsert({
      user_id: data.user.id,
      username: n,
      display_name: n,
      is_guest: true,
      email: placeholderEmail,
      preferred_language: lang,
      age_band: ageBand,
      is_minor: ageBand === "child" || ageBand === "teen",
      data_minimization: ageBand !== "adult",
    }, { onConflict: "user_id" });
    setLoading(false);
    toast.success(t("欢迎，") + n + " 🎉");
    const redirect1 = consumeRedirectPath();
    navigate(redirect1 || "/", { replace: true });
  };

  const handleNickSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = nickname.trim();
    if (!n || !pin) { toast.error(t("请输入昵称和密码")); return; }
    setLoading(true);
    const { data: emailLookup } = await supabase.rpc("guest_email_for_username", { _name: n });
    if (!emailLookup) {
      setLoading(false);
      toast.error(t("找不到这个昵称，先去注册一下吧"));
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: emailLookup as string,
      password: pinToPassword(pin),
    });
    setLoading(false);
    if (error) {
      toast.error(
        isSupabaseAuthRateLimited(error)
          ? supabaseAuthToastMessage(error, t, t("登录失败"))
          : t("密码不正确"),
      );
      return;
    }
    toast.success(t("欢迎回来，") + n + " 👋");
    const redirect2 = consumeRedirectPath();
    navigate(redirect2 || "/", { replace: true });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      toast.error(t("请先阅读并同意隐私政策与服务条款"));
      return;
    }
    if (!emailAgeBand) {
      toast.error(t("请选择你的年龄段"));
      return;
    }
    if (emailAgeBand === "child" && !emailParentConsent) {
      toast.error(t("13 岁以下需家长或监护人同意才能注册"));
      return;
    }
    setLoading(true);
    // Capture pre-existing guest session so we can migrate its data after sign-in.
    const { data: pre } = await supabase.auth.getSession();
    const guestUserId = pre?.session?.user?.id ?? null;

    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { display_name: name || email.split("@")[0] },
      },
    });
    if (error) {
      setLoading(false);
      toast.error(supabaseAuthToastMessage(error, t, error.message));
      return;
    }

    // If the project requires email confirmation, signUp returns no session.
    // Try a direct password sign-in so the user lands authenticated immediately.
    let hasSession = !!signUpData?.session;
    if (!hasSession) {
      const { error: siErr } = await supabase.auth.signInWithPassword({ email, password });
      if (siErr) {
        setLoading(false);
        if (isSupabaseAuthRateLimited(siErr)) {
          toast.error(supabaseAuthToastMessage(siErr, t, siErr.message));
        } else {
          toast.success(t("注册成功！请前往邮箱完成验证后再登录"), { duration: 8000 });
        }
        return;
      }
      hasSession = true;
    }
    // Force a fresh session so subsequent requests use the real user's JWT.
    await supabase.auth.refreshSession();

    // Migrate any prior guest progress
    const { data: post } = await supabase.auth.getUser();
    const realUserId = post?.user?.id ?? null;
    if (guestUserId && realUserId && guestUserId !== realUserId) {
      try {
        const { data: migrated } = await supabase.rpc("merge_guest_to_real_user", {
          p_guest_user_id: guestUserId,
          p_real_user_id: realUserId,
        });
        if ((migrated ?? 0) > 0) {
          toast.success(t("已迁移 ") + migrated + t(" 条学习进度到你的账号"));
        }
      } catch (e) {
        console.warn("[Auth] merge exception", e);
      }
    }

    // Persist age band + minor flag to profile
    if (realUserId) {
      await supabase.from("profiles").upsert({
        user_id: realUserId,
        preferred_language: lang,
        age_band: emailAgeBand,
        is_minor: emailAgeBand === "child" || emailAgeBand === "teen",
        data_minimization: emailAgeBand !== "adult",
      }, { onConflict: "user_id" });
    }
    setLoading(false);
    toast.success(t("注册成功，已自动登录 🎉"));
    import("@/lib/funnel").then(m =>
      m.trackFunnel("signup", "completed", { method: "email", age_band: emailAgeBand })
    );
    const redirect3 = consumeRedirectPath();
    navigate(redirect3 || "/", { replace: true });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Capture any pre-existing guest session so we can migrate its data after sign-in.
    const { data: pre } = await supabase.auth.getSession();
    const guestUserId = pre?.session?.user?.id ?? null;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      toast.error(supabaseAuthToastMessage(error, t, error.message));
      return;
    }
    // Force a fresh session so subsequent requests use the real user's JWT.
    await supabase.auth.refreshSession();
    const { data: post } = await supabase.auth.getUser();
    const realUserId = post?.user?.id ?? null;

    if (guestUserId && realUserId && guestUserId !== realUserId) {
      try {
        const { data: migrated, error: mErr } = await supabase.rpc("merge_guest_to_real_user", {
          p_guest_user_id: guestUserId,
          p_real_user_id: realUserId,
        });
        if (mErr) {
          console.warn("[Auth] merge_guest_to_real_user failed", mErr);
        } else if ((migrated ?? 0) > 0) {
          toast.success(t("已迁移 ") + migrated + t(" 条学习进度到你的账号"));
        }
      } catch (e) {
        console.warn("[Auth] merge exception", e);
      }
    }
    setLoading(false);
    toast.success(t("登录成功"));
    const redirect4 = consumeRedirectPath();
    navigate(redirect4 || "/", { replace: true });
  };

  const handleStudentSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = studentId.trim().toLowerCase().replace(/\s+/g, "");
    if (!id) { toast.error(t("请输入登录ID")); return; }
    if (!studentPw.trim()) { toast.error(t("请输入密码")); return; }
    setLoading(true);
    // login_id 确定式拼成合成邮箱，直接走 signInWithPassword（密码即老师给的 6 位数字，非派生）
    const email2 = `${id}@${STUDENT_EMAIL_DOMAIN}`;
    const { error } = await supabase.auth.signInWithPassword({ email: email2, password: studentPw.trim() });
    setLoading(false);
    if (error) {
      toast.error(
        isSupabaseAuthRateLimited(error)
          ? supabaseAuthToastMessage(error, t, t("登录失败"))
          : t("登录ID或密码不正确"),
      );
      return;
    }
    toast.success(t("欢迎回来 👋"));
    const rStudent = consumeRedirectPath();
    navigate(rStudent || "/", { replace: true });
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      setLoading(false);
      toast.error(t("Google 登录失败"));
      return;
    }
    // Supabase 会自动跳转到 Google 授权页，授权后回到 redirectTo 地址
  };
    
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-5 py-10">
      <div className="relative w-full rounded-2xl border bg-card p-8 shadow-tile">
        {/* Close — return to home */}
        <button
          type="button"
          onClick={() => navigate("/", { replace: true })}
          aria-label={t("nav.home")}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X className="size-5" />
        </button>
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 text-white shadow-lg">
            <GraduationCap className="size-7" />
          </div>
          <h1 className="text-2xl font-extrabold"><T>欢迎来到大月亮英语</T></h1>
          <p className="text-center text-sm text-muted-foreground"><T>取个昵称就能保存进度，无需邮箱 ✨</T></p>
        </div>

        <Tabs defaultValue="nick">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nick"><Sparkles className="mr-1 size-3.5" /><T>昵称</T></TabsTrigger>
            <TabsTrigger value="student"><KeyRound className="mr-1 size-3.5" /><T>学生</T></TabsTrigger>
            <TabsTrigger value="email"><Mail className="mr-1 size-3.5" /><T>邮箱</T></TabsTrigger>
          </TabsList>

          {/* ===== 学生登录（老师代建账号：登录ID + 密码）===== */}
          <TabsContent value="student">
            <form onSubmit={handleStudentSignIn} className="space-y-3 pt-3">
              <p className="text-xs text-muted-foreground">
                <T>用老师给你的「登录ID」和密码登录（例如 moon100237）。没有就找老师要。</T>
              </p>
              <div>
                <Label htmlFor="stu-id"><T>登录ID</T></Label>
                <Input id="stu-id" value={studentId} onChange={(e) => setStudentId(e.target.value)}
                  placeholder="moon100237" autoComplete="username" autoCapitalize="none"
                  className="font-mono lowercase" />
              </div>
              <div>
                <Label htmlFor="stu-pw"><T>密码</T></Label>
                <Input id="stu-pw" type="password" inputMode="numeric" value={studentPw}
                  onChange={(e) => setStudentPw(e.target.value)} autoComplete="current-password" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <T>登录</T>}
              </Button>
            </form>
          </TabsContent>

          {/* ===== 昵称 + PIN（推荐） ===== */}
          <TabsContent value="nick">
            <Tabs defaultValue="signup-nick" className="pt-2">
              <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
                <TabsTrigger value="signup-nick"><T>新用户</T></TabsTrigger>
                <TabsTrigger value="signin-nick"><T>已有昵称</T></TabsTrigger>
              </TabsList>

              <TabsContent value="signup-nick">
                <form onSubmit={handleNickSignUp} className="space-y-3 pt-3">
                  <div>
                    <Label htmlFor="nick"><T>给自己取个昵称</T></Label>
                    <div className="relative">
                      <Input id="nick" value={nickname} maxLength={24} onChange={(e) => setNickname(e.target.value)}
                        placeholder={t("如：小明🐱、Dragon123")} autoComplete="off" />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2">
                        {nickChecking && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
                        {!nickChecking && nickAvailable === true && <Check className="size-4 text-emerald-500" />}
                        {!nickChecking && nickAvailable === false && <X className="size-4 text-rose-500" />}
                      </span>
                    </div>
                    {suggestions.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
                        <span className="text-muted-foreground"><T>试试：</T></span>
                        {suggestions.map(s => (
                          <button key={s} type="button" onClick={() => setNickname(s)}
                            className="rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-800 hover:bg-amber-200">{s}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="pin"><T>设个密码（至少 4 位，用于以后登录）</T></Label>
                    <Input id="pin" minLength={4} maxLength={64} required value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder={t("字母、数字、符号皆可")} autoComplete="new-password" />
                  </div>
                  <div>
                    <Label><T>你的年龄段</T></Label>
                    <div className="mt-1 grid grid-cols-3 gap-2">
                      {([
                        { v: "child", label: t("12 岁以下") },
                        { v: "teen",  label: t("13–17 岁") },
                        { v: "adult", label: t("18+") },
                      ] as const).map(opt => (
                        <button
                          key={opt.v}
                          type="button"
                          onClick={() => setAgeBand(opt.v)}
                          className={`rounded-xl border-2 px-2 py-2 text-xs font-bold transition ${
                            ageBand === opt.v
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card text-muted-foreground hover:border-primary/40"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      <T>用于符合 COPPA / GDPR-K 的儿童数据保护，不会存储任何敏感信息。</T>
                    </p>
                    {ageBand === "child" && (
                      <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-2.5">
                        <Checkbox
                          id="parent-consent"
                          checked={parentConsent}
                          onCheckedChange={(v) => setParentConsent(v === true)}
                          className="mt-0.5"
                        />
                        <Label htmlFor="parent-consent" className="text-[11px] font-normal leading-relaxed text-amber-900">
                          <T>我是家长或法定监护人，同意 13 岁以下儿童使用本应用，并已阅读</T>{" "}
                          <Link to="/privacy" className="underline">
                            <T>《隐私政策》儿童条款</T>
                          </Link>
                          。
                        </Label>
                      </div>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={loading || nickAvailable === false}>
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <T>开始学习 🚀</T>}
                  </Button>
                  <p className="text-center text-[11px] text-muted-foreground">
                    <T>无需邮箱，进度永久保存。可以随时在「账号」绑定邮箱以同步设备。</T>
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="signin-nick">
                <form onSubmit={handleNickSignIn} className="space-y-3 pt-3">
                  <div>
                    <Label htmlFor="nick2"><T>你的昵称</T></Label>
                    <Input id="nick2" value={nickname} onChange={(e) => setNickname(e.target.value)} autoComplete="username" required />
                  </div>
                  <div>
                    <Label htmlFor="pin2"><T>密码</T></Label>
                    <Input id="pin2" maxLength={64} value={pin} required
                      onChange={(e) => setPin(e.target.value)} autoComplete="current-password" />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <T>登录</T>}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* ===== 邮箱（高级 / 家长） ===== */}
          <TabsContent value="email">
            <Button type="button" variant="outline" className="my-3 w-full" onClick={handleGoogle} disabled={loading}>
              <T>使用 Google 登录</T>
            </Button>
            <div className="my-3 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              <span><T>或使用邮箱</T></span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
                <TabsTrigger value="signin"><T>登录</T></TabsTrigger>
                <TabsTrigger value="signup"><T>注册</T></TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-3 pt-3">
              <div>
                <Label htmlFor="si-email"><T>邮箱</T></Label>
                <Input id="si-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="si-pw"><T>密码</T></Label>
                <Input id="si-pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}><T>登录</T></Button>
            </form>
          </TabsContent>
              <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-3 pt-3">
              <div>
                <Label htmlFor="su-name"><T>昵称（可选）</T></Label>
                <Input id="su-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="su-email"><T>邮箱</T></Label>
                <Input id="su-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="su-pw"><T>密码（至少 6 位）</T></Label>
                <Input id="su-pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div>
                <Label><T>你的年龄段</T></Label>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {([
                    { v: "child", label: t("12 岁以下") },
                    { v: "teen",  label: t("13–17 岁") },
                    { v: "adult", label: t("18+") },
                  ] as const).map(opt => (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => setEmailAgeBand(opt.v)}
                      className={`rounded-xl border-2 px-2 py-2 text-xs font-bold transition ${
                        emailAgeBand === opt.v
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {emailAgeBand === "child" && (
                  <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-2.5">
                    <Checkbox
                      id="email-parent-consent"
                      checked={emailParentConsent}
                      onCheckedChange={(v) => setEmailParentConsent(v === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="email-parent-consent" className="text-[11px] font-normal leading-relaxed text-amber-900">
                      <T>我是家长或法定监护人，同意 13 岁以下儿童使用本应用，并已阅读</T>{" "}
                      <Link to="/privacy" className="underline">
                        <T>《隐私政策》儿童条款</T>
                      </Link>
                      。
                    </Label>
                  </div>
                )}
              </div>
              <div className="flex items-start gap-2 pt-1">
                <Checkbox
                  id="agree"
                  checked={agreed}
                  onCheckedChange={(v) => setAgreed(v === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="agree" className="text-xs font-normal leading-relaxed text-muted-foreground">
                  <T>我已阅读并同意</T>{" "}
                  <Link to="/privacy" className="text-primary underline-offset-4 hover:underline">
                    <T>《隐私政策》</T>
                  </Link>{" "}
                  <T>与</T>{" "}
                  <Link to="/terms" className="text-primary underline-offset-4 hover:underline">
                    <T>《服务条款》</T>
                  </Link>
                </Label>
              </div>
              <Button type="submit" className="w-full" disabled={loading || !agreed}><T>注册</T></Button>
            </form>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        <div className="mt-6 border-t pt-4 text-center">
          <p className="mb-3 text-xs text-muted-foreground">
            <T>登录或注册即视为同意</T>{" "}
            <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground"><T>隐私政策</T></Link>{" "}
            <T>和</T>{" "}
            <Link to="/terms" className="underline underline-offset-2 hover:text-foreground"><T>服务条款</T></Link>
          </p>
          <button
            type="button"
            onClick={() => navigate("/", { replace: true })}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            <T>以访客身份继续浏览</T> <ArrowRight className="size-3.5" />
          </button>
          <p className="mt-1 text-xs text-muted-foreground"><T>无需注册即可试用所有课程</T></p>
        </div>
      </div>
    </main>
  );
};

export default Auth;