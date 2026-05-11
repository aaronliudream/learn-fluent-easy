import { T } from "@/i18n/T";import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BackLink from "@/components/BackLink";
import { ArrowLeft, Camera, Gift, UserMinus, Sparkles, Heart, Flame } from "lucide-react";
import { toast } from "sonner";

type Snap = {
  ok: boolean;reason?: string;
  friend?: {id: string;username: string | null;display_name: string | null;};
  pet?: {nickname: string;level: number;stage: number;hunger: number;mood: number;emoji: string;};
};
type Food = {id: string;name_cn: string;emoji: string;price: number;};
type Photo = {id: string;host_id: string;visitor_id: string;caption: string | null;created_at: string;};

export default function FriendPet() {
  const { id } = useParams<{id: string;}>();
  const [snap, setSnap] = useState<Snap | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [caption, setCaption] = useState("");
  const [isMinor, setIsMinor] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase.from("profiles").
        select("is_minor").eq("user_id", user.id).maybeSingle();
        setIsMinor(!!prof?.is_minor);
      }
      const { data } = await supabase.rpc("visit_friend_pet", { _friend_id: id });
      setSnap(data as Snap);
      const { data: f } = await supabase.from("pet_food_items").
      select("id,name_cn,emoji,price").order("price").limit(8);
      setFoods((f ?? []) as Food[]);
      const { data: ph } = await supabase.rpc("list_pet_photos", { _other: id });
      setPhotos((ph ?? []) as Photo[]);
    })();
  }, [id]);

  if (!snap) return <main className="p-8 text-center text-sm text-muted-foreground">Loading...</main>;
  if (!snap.ok) {
    const map: Record<string, string> = {
      not_friends: "你们还不是好友 · Not friends yet",
      not_authenticated: "请先登录 · Sign in first"
    };
    return (
      <main className="mx-auto max-w-md p-8 text-center">
        <div className="text-4xl">🚧</div>
        <p className="mt-3 text-sm text-muted-foreground">{map[snap.reason ?? ""] ?? snap.reason}</p>
        <BackLink to="/friends" className="mt-4 inline-block text-sm text-primary"><T>返回</T></BackLink>
      </main>);

  }

  const sendGift = async (foodId: string) => {
    if (isMinor) {toast.error("未成年人仅可观看 · Minors can only view");return;}
    setBusy(true);
    const { error } = await supabase.rpc("send_gift", { _to_user: id, _food_id: foodId });
    setBusy(false);
    if (error) {
      const m: Record<string, string> = {
        not_friends: "你们不是好友", "daily gift limit reached": "今日礼物已达上限 (3)",
        minors_view_only: "未成年人不能送礼物", "invalid recipient": "无效"
      };
      toast.error(m[error.message] ?? error.message);
    } else {
      toast.success(`🎁 已送出 ${foods.find((f) => f.id === foodId)?.emoji ?? ""}！`);
    }
  };

  const takePhoto = async () => {
    if (isMinor) {toast.error("未成年人仅可观看 · Minors can only view");return;}
    setBusy(true);
    const { data, error } = await supabase.rpc("take_pet_photo", { _friend_id: id, _caption: caption });
    setBusy(false);
    if (error) {toast.error(error.message);return;}
    const r = data as {ok: boolean;reason?: string;};
    if (!r.ok) {
      const m: Record<string, string> = {
        not_friends: "不是好友", minors_view_only: "未成年人仅可观看",
        rate_limited: "今日合影已达上限", caption_too_long: "文字太长 (≤140)"
      };
      toast.error(m[r.reason!] ?? r.reason);
      return;
    }
    toast.success("📸 合影已保存！");
    setCaption("");
    const { data: ph } = await supabase.rpc("list_pet_photos", { _other: id });
    setPhotos((ph ?? []) as Photo[]);
  };

  const removeFriend = async () => {
    if (!confirm("确定移除该好友？")) return;
    await supabase.rpc("remove_friend", { _other: id });
    toast.success("已移除");
    history.back();
  };

  const f = snap.friend!;
  const p = snap.pet;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
      <BackLink to="/friends" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>朋友列表 / Friends</T>
      </BackLink>

      {/* Friend pet hero */}
      <section className="relative mb-6 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-amber-100 via-rose-100 to-fuchsia-100 p-6 text-center dark:from-amber-950/30 dark:via-rose-950/30 dark:to-fuchsia-950/30">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">VISITING</div>
        <h1 className="mt-1 text-2xl font-extrabold">
          {f.username ?? f.display_name ?? "Friend"}'s Pet
        </h1>
        {p ?
        <>
            <div className="my-4 text-7xl animate-companion-breathe">{p.emoji}</div>
            <div className="text-lg font-extrabold">{p.nickname}</div>
            <div className="mt-1 flex items-center justify-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                <Sparkles className="size-3.5" /> Lv.{p.level}
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-rose-600">
                <Flame className="size-3.5" /> {p.hunger}/100
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-pink-600">
                <Heart className="size-3.5" /> {p.mood}/100
              </span>
            </div>
          </> :

        <p className="mt-4 text-sm text-muted-foreground"><T>这位朋友还没有领养宠物</T></p>
        }
      </section>

      {isMinor &&
      <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          <T>🛡️ 未成年人模式：你可以观看朋友的宠物，但不能送礼物或拍合影。</T>
        </div>
      }

      {/* Send gift */}
      {p &&
      <section className="mb-6">
          <h2 className="mb-2 flex items-center gap-1 text-sm font-bold">
            <Gift className="size-4" /> <T>送礼物 · Send a gift</T>
            <span className="ml-1 text-[10px] font-normal text-muted-foreground"><T>(每天 3 次)</T></span>
          </h2>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {foods.map((food) =>
          <button
            key={food.id}
            onClick={() => sendGift(food.id)}
            disabled={busy || isMinor}
            title={food.name_cn}
            className="grid place-items-center rounded-2xl border border-border bg-card p-3 transition hover:-translate-y-0.5 hover:border-primary disabled:opacity-40">
            
                <span className="text-2xl">{food.emoji}</span>
                <span className="mt-0.5 text-[10px] text-muted-foreground">{food.price}🪙</span>
              </button>
          )}
          </div>
        </section>
      }

      {/* Take photo */}
      {p &&
      <section className="mb-6">
          <h2 className="mb-2 flex items-center gap-1 text-sm font-bold">
            <Camera className="size-4" /> <T>合影 · Photo together</T>
          </h2>
          <div className="flex gap-2">
            <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="说一句话 · Add a caption (optional)"
            maxLength={140}
            disabled={isMinor}
            className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm disabled:opacity-50" />
          
            <button onClick={takePhoto} disabled={busy || isMinor}
          className="rounded-xl bg-foreground px-4 py-2 text-sm font-bold text-background disabled:opacity-50">
              📸
            </button>
          </div>
        </section>
      }

      {/* Photo wall */}
      {photos.length > 0 &&
      <section className="mb-6">
          <h2 className="mb-2 text-sm font-bold"><T>📷 共同回忆 · Shared photos</T></h2>
          <div className="space-y-2">
            {photos.map((ph) =>
          <div key={ph.id} className="rounded-2xl border border-border bg-card p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{p?.emoji ?? "🐾"}</span>
                  <span>{new Date(ph.created_at).toLocaleString()}</span>
                </div>
                {ph.caption && <p className="mt-1 text-sm">{ph.caption}</p>}
              </div>
          )}
          </div>
        </section>
      }

      <button onClick={removeFriend} className="mt-6 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive">
        <UserMinus className="size-3.5" /> <T>移除好友 / Remove friend</T>
      </button>
    </main>);

}