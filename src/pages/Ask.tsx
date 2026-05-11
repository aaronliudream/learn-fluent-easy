import { T } from "@/i18n/T";import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles, Loader2, ArrowLeft } from "lucide-react";

const SAMPLES = [
"book 的复数形式是什么？",
"a 和 an 怎么区分？",
"would have done 是什么用法？",
"What's the difference between 'affect' and 'effect'?"];


const DRAFT_KEY = "ask:draft";

export default function Ask() {
  const [question, setQuestion] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem(DRAFT_KEY) ?? "";
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Persist draft so returning to this page restores user's input
  useEffect(() => {
    try {sessionStorage.setItem(DRAFT_KEY, question);} catch {}
  }, [question]);

  async function submit() {
    const q = question.trim();
    if (q.length < 3) {toast.error("问题太短了");return;}
    setLoading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) {
        toast.message("请先登录后再创建知识卡");
        navigate("/auth?redirect=/ask");
        return;
      }
      const { data, error } = await supabase.functions.invoke("generate-knowledge-card", {
        body: { question: q, language: "zh" }
      });
      if (error) throw error;
      if (!data || data.error) throw new Error(data?.error || "生成失败");

      const { data: inserted, error: insErr } = await supabase.
      from("knowledge_cards").
      insert({
        author_id: u.user.id,
        slug: data.slug,
        question: data.question,
        short_answer: data.short_answer,
        explanation: data.explanation,
        examples: data.examples,
        common_mistakes: data.common_mistakes,
        quiz: data.quiz,
        tags: data.tags,
        language: data.language
      }).
      select("slug").
      single();
      if (insErr) throw insErr;
      // Successful submit → clear draft
      try {sessionStorage.removeItem(DRAFT_KEY);} catch {}
      navigate(`/q/${inserted.slug}`);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "出错了");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <button
        type="button"
        onClick={() => {
          if (window.history.length > 1) navigate(-1);else
          navigate("/");
        }}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        
        <ArrowLeft className="size-4" /> <T>返回</T>
      </button>
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <Sparkles className="w-7 h-7 text-primary" />
        <T>提问 AI 知识卡</T>
      </h1>
      <p className="text-muted-foreground mb-6">
        <T>输入你的英语问题，AI 会生成讲解 + 例句 + 3 题小测验，一键生成可分享的卡片。</T>
      </p>

      <Card className="p-4 space-y-4">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="例如：book 的复数怎么用？"
          className="min-h-[120px] text-base"
          maxLength={300}
          disabled={loading} />
        
        <Button onClick={submit} disabled={loading} size="lg" className="w-full">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /><T>生成中…（约 10 秒）</T></> : "生成知识卡 →"}
        </Button>
      </Card>

      <div className="mt-6">
        <p className="text-sm text-muted-foreground mb-2"><T>不知道问什么？试试：</T></p>
        <div className="flex flex-wrap gap-2">
          {SAMPLES.map((s) =>
          <button
            key={s}
            onClick={() => setQuestion(s)}
            className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/70 border border-border"
            disabled={loading}>
            
              {s}
            </button>
          )}
        </div>
      </div>
    </main>);

}