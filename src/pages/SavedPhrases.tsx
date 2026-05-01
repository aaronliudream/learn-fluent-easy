import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Volume2, Trash2, Loader2, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { listSavedPhrases, removeSavedPhrase, type SavedPhrase } from "@/lib/savedPhrases";
import { supabase } from "@/integrations/supabase/client";
import { speak } from "@/lib/speak";
import { T } from "@/i18n/T";
import { toast } from "@/hooks/use-toast";

const SavedPhrasesPage = () => {
  const [items, setItems] = useState<SavedPhrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  const refresh = async () => {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    const isIn = !!u?.user;
    setSignedIn(isIn);
    if (!isIn) {
      setItems([]);
      setLoading(false);
      return;
    }
    const list = await listSavedPhrases();
    setItems(list);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleRemove = async (item: SavedPhrase) => {
    try {
      await removeSavedPhrase(item.normalized);
      setItems((prev) => prev.filter((p) => p.id !== item.id));
      toast({ title: "已移除" });
    } catch (e) {
      toast({ title: "操作失败", variant: "destructive" });
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader
        title="⭐ 我的收藏"
        subtitle="点过的短语和单词都在这里,随时复习"
        back="/"
      />

      {loading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      )}

      {!loading && signedIn === false && (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
          <div className="mb-3 text-4xl">🔐</div>
          <div className="mb-1 text-base font-bold text-foreground">
            <T>请先登录</T>
          </div>
          <div className="mb-4 text-sm text-muted-foreground">
            <T>登录后可以收藏短语并随时复习</T>
          </div>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:opacity-90"
          >
            <T>去登录</T>
          </Link>
        </div>
      )}

      {!loading && signedIn && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
          <div className="mb-3 text-4xl">⭐</div>
          <div className="mb-1 text-base font-bold text-foreground">
            <T>还没有收藏</T>
          </div>
          <div className="mb-4 text-sm text-muted-foreground">
            <T>在场景对话或职场对话里点击短语,然后点星号即可保存</T>
          </div>
          <Link
            to="/scenes"
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/20"
          >
            <BookOpen className="size-4" /> <T>去逛场景对话</T>
          </Link>
        </div>
      )}

      {!loading && signedIn && items.length > 0 && (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    <div className="text-base font-bold text-foreground">
                      {item.phrase}
                    </div>
                  </div>
                  {item.context_text ? (
                    <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      <T>原文</T>: {item.context_text}
                    </div>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => speak(item.phrase)}
                    aria-label="play"
                    className="grid size-8 place-items-center rounded-full bg-secondary text-foreground/70 transition hover:bg-primary/15 hover:text-primary"
                  >
                    <Volume2 className="size-4" />
                  </button>
                  <button
                    onClick={() => handleRemove(item)}
                    aria-label="remove"
                    className="grid size-8 place-items-center rounded-full bg-secondary text-foreground/70 transition hover:bg-destructive/15 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default SavedPhrasesPage;