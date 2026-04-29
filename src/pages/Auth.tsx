import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { GraduationCap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { T, useT } from "@/i18n/T";

const Auth = () => {
  const navigate = useNavigate();
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/", { replace: true });
    });
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      toast.error(t("请先阅读并同意隐私政策与服务条款"));
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
      toast.success(t("注册成功！请查收邮箱验证链接。"));
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("登录成功"));
      navigate("/", { replace: true });
    }
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
      <div className="w-full rounded-2xl border bg-card p-8 shadow-tile">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <GraduationCap className="size-7" />
          </div>
          <h1 className="text-2xl font-bold"><T>欢迎使用</T></h1>
          <p className="text-sm text-muted-foreground"><T>登录以同步你的学习进度</T></p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="mb-4 w-full"
          onClick={handleGoogle}
          disabled={loading}
        >
          <T>使用 Google 登录</T>
        </Button>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          <span><T>或使用邮箱</T></span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
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