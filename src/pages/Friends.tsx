import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, UserPlus, Check, X as XIcon, Heart, Camera, Gift, Users } from "lucide-react";
import BackLink from "@/components/BackLink";
import { toast } from "sonner";

type Friend = {
  friend_id: string; username: string | null; display_name: string | null;
  pet_emoji: string | null; pet_nickname: string | null;
  pet_level: number | null; pet_stage: number | null; pet_hunger: number | null;
  is_online: boolean | null;
};
type Req = { request_id: string; direction: "incoming" | "outgoing"; other_id: string; username: string | null; display_name: string | null; created_at: string };

export default function Friends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [reqs, setReqs] = useState<Req[]>([]);
  const [adding, setAdding] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const [f, r] = await Promise.all([
      supabase.rpc("list_friends"),
      supabase.rpc("list_friend_requests"),
    ]);
    setFriends((f.data ?? []) as Friend[]);
    setReqs((r.data ?? []) as Req[]);
  };
  useEffect(() => { refresh(); }, []);

  const addFriend = async () => {
    const name = adding.trim();
    if (name.length < 2) { toast.error("用户名至少 2 个字符 / Username too short"); return; }
    setBusy(true);
    const { data, error } = await supabase.rpc("request_friend", { _username: name });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    const r = data as { ok: boolean; reason?: string; auto_accepted?: boolean };
    if (!r.ok) {
      const map: Record<string, string> = {
        invalid_username: "用户名无效", user_not_found: "找不到该用户",
        cannot_befriend_self: "不能加自己", already_friends: "已经是好友啦",
        blocked: "已屏蔽", already_requested: "已发送过请求", rate_limited: "今日请求次数过多",
      };
      toast.error(map[r.reason!] ?? r.reason!);
      return;
    }
    toast.success(r.auto_accepted ? "🎉 互相加好友成功！" : "✉️ 已发送好友请求");
    setAdding("");
    refresh();
  };

  const respond = async (id: string, accept: boolean) => {
    await supabase.rpc("respond_friend", { _request_id: id, _accept: accept });
    toast.success(accept ? "✅ 已接受" : "已拒绝");
    refresh();
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink to="/pets" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回宠物 / Back
      </BackLink>
      <header className="mb-6">
        <h1 className="text-grad-title text-2xl font-extrabold md:text-3xl">
          🐾 学习朋友圈 / Pet Friends
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          互访朋友的伙伴 · 送礼物 · 拍合影
        </p>
      </header>

      {/* Add friend */}
      <section className="mb-6 rounded-2xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold">
          <UserPlus className="size-4" /> 加好友 · Add friend (by username)
        </div>
        <div className="flex gap-2">
          <input
            value={adding}
            onChange={(e) => setAdding(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addFriend()}
            placeholder="输入用户名 / Username"
            maxLength={32}
            className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm"
          />
          <button onClick={addFriend} disabled={busy}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">
            发送 / Send
          </button>
        </div>
      </section>

      {/* Pending requests */}
      {reqs.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            <Users className="mr-1 inline size-3.5" /> 待处理 · Pending ({reqs.length})
          </h2>
          <div className="space-y-2">
            {reqs.map((r) => (
              <div key={r.request_id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                <div className="grid size-10 place-items-center rounded-full bg-muted text-lg">👤</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold">{r.username ?? r.display_name ?? "Friend"}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {r.direction === "incoming" ? "想加你为好友" : "已发送请求 · 等待回复"}
                  </div>
                </div>
                {r.direction === "incoming" ? (
                  <div className="flex gap-1">
                    <button onClick={() => respond(r.request_id, true)} className="grid size-9 place-items-center rounded-full bg-emerald-500 text-white">
                      <Check className="size-4" />
                    </button>
                    <button onClick={() => respond(r.request_id, false)} className="grid size-9 place-items-center rounded-full bg-muted">
                      <XIcon className="size-4" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-muted-foreground">⏳</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Friends list */}
      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <Heart className="mr-1 inline size-3.5" /> 我的朋友 · Friends ({friends.length})
        </h2>
        {friends.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            还没有好友 · 添加一个开始互访吧 ✨
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {friends.map((f) => (
              <Link
                key={f.friend_id}
                to={`/friend/${f.friend_id}`}
                className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition hover:-translate-y-0.5 hover:border-primary"
              >
                <div className="relative grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-100 to-rose-100 text-3xl">
                  {f.pet_emoji ?? "🥚"}
                  {f.is_online && (
                    <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full bg-emerald-500 ring-2 ring-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-extrabold">{f.username ?? f.display_name ?? "Friend"}</div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {f.pet_nickname ? `${f.pet_nickname} · Lv.${f.pet_level}` : "尚未领养"}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5 text-[10px]">
                  <span className="rounded-full bg-rose-100 px-1.5 text-rose-700">🔥{f.pet_hunger ?? 0}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
