import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { GraduationCap, ArrowRight, Sparkles, Loader2, Check, X, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { T, useT } from "@/i18n/T";
import { useI18n } from "@/i18n/I18nProvider";

// Internal placeholder domain for guest accounts (never receives email)
const GUEST_DOMAIN = "guest.bigmoon.local";
const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "")
    .slice(0, 16) || `u${Math.random().toString(36).slice(2, 8)}`;
const guestEmail = (username: string) =>
  `${slugify(username)}.${Math.random().toString(36).slice(2, 8)}@${GUEST_DOMAIN}`;
const pinToPassword = (pin: string) => `pin:${pin}:bigmoon-2026`;

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
      // 已登录用户进 /auth → 跳到学习面板（而不是首页，避免「点免费开始学习没反应」的死循环）
      if (session) navigate("/dashboard", { replace: true });
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
    if (!/^\d{4,6}$/.test(pin)) { toast.error(t("PIN 必须是 4–6 位数字")); return; }
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
      toast.error(error?.message ?? t("注册失败"));
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
    navigate("/", { replace: true });
  };

  const handleNickSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = nickname.trim();
    if (!n || !pin) { toast.error(t("请输入昵称和 PIN")); return; }
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
    if (error) { toast.error(t("PIN 不正确")); return; }
    toast.success(t("欢迎回来，") + n + " 👋");
    navigate("/", { replace: true });
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { display_name: name || email.split("@")[0] },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      // Persist age band + minor flag to profile (best-effort, after auth state lands)
      const { data: u } = await supabase.auth.getUser();
      if (u?.user?.id) {
        await supabase.from("profiles").upsert({
          user_id: u.user.id,
          preferred_language: lang,
          age_band: emailAgeBand,
          is_minor: emailAgeBand === "child" || emailAgeBand === "teen",
          data_minimization: emailAgeBand !== "adult",
        }, { onConflict: "user_id" });
      }
      toast.success(t("注册成功！正在登录…"));
      import("@/lib/funnel").then(m =>
        m.trackFunnel("signup", "completed", { method: "email", age_band: emailAgeBand })
      );
      navigate("/", { replace: true });
    }
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
      toast.error(error.message);
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
    navigate("/", { replace: true });
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setLoading(false);
      toast.error(t("Google 登录失败"));
      return;
    }
    if (result.redirected) return;
    navigate("/", { replace: true });
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nick"><Sparkles className="mr-1 size-3.5" /><T>昵称</T></TabsTrigger>
            <TabsTrigger value="email"><Mail className="mr-1 size-3.5" /><T>邮箱</T></TabsTrigger>
          </TabsList>

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
                    <Label htmlFor="pin"><T>设个 4 位数字 PIN（用于以后登录）</T></Label>
                    <Input id="pin" inputMode="numeric" pattern="\d*" maxLength={6} required value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                      placeholder={t("例如 1234")} autoComplete="new-password" />
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
                    <Label htmlFor="pin2"><T>PIN</T></Label>
                    <Input id="pin2" inputMode="numeric" pattern="\d*" maxLength={6} value={pin} required
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} autoComplete="current-password" />
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