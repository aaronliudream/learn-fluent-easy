import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, Trophy, Store, Gift, Hand, Sparkles, Loader2, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ensureSocialDefaults, getOnlineCount, pingPresence } from "@/lib/social";
import { cn } from "@/lib/utils";

type Tab = "feed" | "rank" | "market" | "gift" | "wave" | "coop";

type FeedItem = { id: string; user_id: string; kind: string; emoji: string | null; message: string; created_at: string };
type Online = { user_id: string; grade_band: string | null; current_page: string | null; last_seen: string };
type Profile = { user_id: string; username: string | null };
type RankRow = { user_id: string; username: string; display_emoji: string; earned?: number; level?: number; pet_emoji?: string; pet_name?: string };
type Listing = { id: string; seller_id: string; food_id: string; qty: number; price_per_unit: number; created_at: string };
type Food = { id: string; name_cn: string; emoji: string; price: number };

export default function Social() {
  const [tab, setTab] = useState<Tab>("feed");
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [uid, setUid] = useState<string>("");
  const [grade, setGrade] = useState<string>("primary");
  const [online, setOnline] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [balance, setBalance] = useState(0);

  // datasets
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [feedNames, setFeedNames] = useState<Record<string, string>>({});
  const [onlineList, setOnlineList] = useState<(Online & { username: string; emoji: string })[]>([]);
  const [coinRank, setCoinRank] = useState<RankRow[]>([]);
  const [petRank, setPetRank] = useState<RankRow[]>([]);
  const [listings, setListings] = useState<(Listing & { username: string })[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [inv, setInv] = useState<{ food_id: string; qty: number }[]>([]);
  const [giftQuota, setGiftQuota] = useState(3);
  const [waveQuota, setWaveQuota] = useState(5);
  const [coopId, setCoopId] = useState<string | null>(null);
  const [coopState, setCoopState] = useState<{ goal_correct: number; current_correct: number; status: string } | null>(null);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2200); };

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const id = u?.user?.id ?? "";
      setUid(id);
      setAuthed(!!id);
      if (!id) { setLoading(false); return; }
      // detect grade band heuristically
      const path = sessionStorage.getItem("last_grade_band") || "primary";
      setGrade(path);
      await ensureSocialDefaults(path);
      await pingPresence(path, "/social");
      const [b, fd] = await Promise.all([
        supabase.from("user_coins").select("balance").eq("user_id", id).maybeSingle(),
        supabase.from("pet_food_items").select("id,name_cn,emoji,price").order("sort_order"),
      ]);
      setBalance(b.data?.balance ?? 0);
      setFoods((fd.data ?? []) as Food[]);
      setLoading(false);
    })();
    const t = setInterval(() => pingPresence(), 60_000);
    return () => clearInterval(t);
  }, []);

  // load tab data
  useEffect(() => {
    if (!authed) return;
    void loadTab(tab);
  }, [tab, authed, grade]);

  async function loadTab(t: Tab) {
    if (t === "feed") {
      const [n, f] = await Promise.all([
        getOnlineCount(),
        supabase.from("activity_feed").select("id,user_id,kind,emoji,message,created_at").order("created_at", { ascending: false }).limit(40),
      ]);
      setOnline(n);
      const items = (f.data ?? []) as FeedItem[];
      setFeed(items);
      const ids = Array.from(new Set(items.map(i => i.user_id)));
      if (ids.length) {
        const { data: ps } = await supabase.from("profiles").select("user_id,username").in("user_id", ids);
        const map: Record<string, string> = {};
        (ps ?? []).forEach((p: any) => { map[p.user_id] = p.username || "同学"; });
        setFeedNames(map);
      }
      // online users
      const { data: pres } = await supabase.from("user_presence")
        .select("user_id,grade_band,current_page,last_seen")
        .gte("last_seen", new Date(Date.now() - 2 * 60_000).toISOString())
        .order("last_seen", { ascending: false }).limit(30);
      const presIds = (pres ?? []).map((x: any) => x.user_id);
      let nameMap: Record<string, string> = {};
      let emojiMap: Record<string, string> = {};
      if (presIds.length) {
        const [{ data: profs }, { data: setts }] = await Promise.all([
          supabase.from("profiles").select("user_id,username").in("user_id", presIds),
          supabase.from("user_social_settings").select("user_id,display_emoji,social_visible").in("user_id", presIds),
        ]);
        (profs ?? []).forEach((p: any) => { nameMap[p.user_id] = p.username || "同学"; });
        const visMap: Record<string, boolean> = {};
        (setts ?? []).forEach((s: any) => { emojiMap[s.user_id] = s.display_emoji || "🌟"; visMap[s.user_id] = s.social_visible !== false; });
        const visible = (pres ?? []).filter((p: any) => visMap[p.user_id] !== false).map((p: any) => ({ ...p, username: nameMap[p.user_id] || "同学", emoji: emojiMap[p.user_id] || "🌟" }));
        setOnlineList(visible);
      } else { setOnlineList([]); }
    } else if (t === "rank") {
      const [a, b] = await Promise.all([
        supabase.rpc("leaderboard_today", { _grade: null, _limit: 20 }),
        supabase.rpc("leaderboard_pets_week", { _grade: null, _limit: 20 }),
      ]);
      setCoinRank((a.data as RankRow[]) ?? []);
      setPetRank((b.data as RankRow[]) ?? []);
    } else if (t === "market") {
      const { data: ls } = await supabase.from("pet_food_listings").select("id,seller_id,food_id,qty,price_per_unit,created_at").eq("status", "active").order("created_at", { ascending: false }).limit(40);
      const items = (ls ?? []) as Listing[];
      const sids = Array.from(new Set(items.map(i => i.seller_id)));
      let nm: Record<string, string> = {};
      if (sids.length) {
        const { data: ps } = await supabase.from("profiles").select("user_id,username").in("user_id", sids);
        (ps ?? []).forEach((p: any) => { nm[p.user_id] = p.username || "同学"; });
      }
      setListings(items.map(i => ({ ...i, username: nm[i.seller_id] || "同学" })));
      const { data: iv } = await supabase.from("pet_inventory").select("food_id,qty").eq("user_id", uid);
      setInv((iv ?? []) as any);
    } else if (t === "gift" || t === "wave") {
      // load online list to gift/wave to
      const { data: pres } = await supabase.from("user_presence")
        .select("user_id,grade_band,current_page,last_seen")
        .gte("last_seen", new Date(Date.now() - 5 * 60_000).toISOString())
        .order("last_seen", { ascending: false }).limit(30);
      const presIds = (pres ?? []).map((x: any) => x.user_id).filter((id: string) => id !== uid);
      let nameMap: Record<string, string> = {};
      let emojiMap: Record<string, string> = {};
      if (presIds.length) {
        const [{ data: profs }, { data: setts }] = await Promise.all([
          supabase.from("profiles").select("user_id,username").in("user_id", presIds),
          supabase.from("user_social_settings").select("user_id,display_emoji,social_visible").in("user_id", presIds),
        ]);
        (profs ?? []).forEach((p: any) => { nameMap[p.user_id] = p.username || "同学"; });
        const visMap: Record<string, boolean> = {};
        (setts ?? []).forEach((s: any) => { emojiMap[s.user_id] = s.display_emoji || "🌟"; visMap[s.user_id] = s.social_visible !== false; });
        setOnlineList((pres ?? []).filter((p: any) => p.user_id !== uid && visMap[p.user_id] !== false).map((p: any) => ({ ...p, username: nameMap[p.user_id] || "同学", emoji: emojiMap[p.user_id] || "🌟" })));
      } else { setOnlineList([]); }
      // quota
      const today = new Date().toISOString().slice(0, 10);
      const [{ count: gc }, { count: wc }] = await Promise.all([
        supabase.from("pet_food_gifts").select("*", { count: "exact", head: true }).eq("from_user", uid).gte("created_at", today + "T00:00:00Z"),
        supabase.from("user_waves").select("*", { count: "exact", head: true }).eq("from_user", uid).gte("created_at", today + "T00:00:00Z"),
      ]);
      setGiftQuota(Math.max(0, 3 - (gc ?? 0)));
      setWaveQuota(Math.max(0, 5 - (wc ?? 0)));
    } else if (t === "coop") {
      // get current session
      const { data: m } = await supabase.from("coop_session_members").select("session_id").eq("user_id", uid).limit(5);
      const ids = (m ?? []).map((x: any) => x.session_id);
      if (ids.length) {
        const { data: s } = await supabase.from("coop_sessions").select("*").in("id", ids).in("status", ["open", "active"]).gte("expires_at", new Date().toISOString()).maybeSingle();
        if (s) { setCoopId(s.id); setCoopState({ goal_correct: s.goal_correct, current_correct: s.current_correct, status: s.status }); return; }
      }
      setCoopId(null); setCoopState(null);
    }
  }

  async function buy(l: Listing) {
    const { error } = await supabase.rpc("buy_listing", { _listing_id: l.id });
    if (error) { showToast("购买失败：" + error.message); return; }
    showToast("✨ 购买成功！");
    const { data: b } = await supabase.from("user_coins").select("balance").eq("user_id", uid).maybeSingle();
    setBalance(b?.balance ?? 0);
    loadTab("market");
  }

  async function sendGiftTo(toUser: string, foodId: string) {
    const { error } = await supabase.rpc("send_gift", { _to_user: toUser, _food_id: foodId });
    if (error) { showToast("送礼失败：" + error.message); return; }
    showToast("🎁 送出 1 份粮食！");
    loadTab("gift");
  }

  async function waveTo(toUser: string) {
    const { error } = await supabase.rpc("send_wave", { _to_user: toUser });
    if (error) { showToast("打招呼失败：" + error.message); return; }
    showToast("✨ 已送对方 1 星币加油！");
    loadTab("wave");
  }

  async function joinCoop() {
    const { data, error } = await supabase.rpc("coop_join", { _grade: grade });
    if (error) { showToast("加入失败：" + error.message); return; }
    showToast("🤝 已进入合作房间，去答题为团队加油！");
    setCoopId(data as string);
    loadTab("coop");
  }

  if (authed === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div>
          <Sparkles className="mx-auto mb-3 h-10 w-10 text-amber-500" />
          <p className="mb-3 text-slate-700">登录后即可看到同学、参与互动～</p>
          <Link to="/auth" className="inline-block rounded-xl bg-amber-500 px-6 py-2 font-medium text-white">去登录</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-sky-50 pb-24">
      {/* header */}
      <div className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <BackLink to="/" className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"><ArrowLeft className="h-4 w-4" />返回</BackLink>
          <h1 className="text-base font-bold text-slate-800">🌟 同学社区</h1>
          <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700"><Coins className="h-3.5 w-3.5" />{balance}</div>
        </div>
        {/* tabs */}
        <div className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-2 pb-2 text-xs">
          {([
            ["feed", "动态", Sparkles],
            ["rank", "排行榜", Trophy],
            ["market", "星光市集", Store],
            ["gift", "送礼物", Gift],
            ["wave", "打招呼", Hand],
            ["coop", "合作答题", Users],
          ] as [Tab, string, any][]).map(([k, label, Icon]) => (
            <button key={k} onClick={() => setTab(k)} className={cn("inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 font-medium transition", tab === k ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200")}>
              <Icon className="h-3.5 w-3.5" />{label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pt-4">
        {loading && <div className="flex items-center justify-center py-10 text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" />加载中…</div>}

        {!loading && tab === "feed" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-bold text-slate-700">🟢 现在 {online} 位同学正在学习</div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {onlineList.slice(0, 24).map(o => (
                  <span key={o.user_id} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 ring-1 ring-emerald-100">
                    <span>{o.emoji}</span>{o.username}
                  </span>
                ))}
                {onlineList.length === 0 && <span className="text-xs text-slate-400">暂无其他同学在线，做第一个吧～</span>}
              </div>
            </div>
            <div className="space-y-2">
              {feed.length === 0 && <div className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 ring-1 ring-slate-200">还没有动态，先去答题或喂宠物吧！</div>}
              {feed.map(f => (
                <div key={f.id} className="flex items-start gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                  <div className="text-2xl">{f.emoji || "✨"}</div>
                  <div className="flex-1">
                    <div className="text-sm text-slate-800"><b>{feedNames[f.user_id] || "同学"}</b> {f.message}</div>
                    <div className="text-xs text-slate-400">{timeAgo(f.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && tab === "rank" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <div className="mb-3 flex items-center gap-2 font-bold text-slate-800"><Coins className="h-4 w-4 text-amber-500" />今日星币榜</div>
              <ol className="space-y-2">
                {coinRank.map((r, i) => (
                  <li key={r.user_id} className="flex items-center gap-2 text-sm">
                    <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold", i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-300 text-white" : i === 2 ? "bg-orange-300 text-white" : "bg-slate-100 text-slate-600")}>{i + 1}</span>
                    <span>{r.display_emoji}</span>
                    <span className="flex-1 truncate">{r.username}</span>
                    <span className="font-bold text-amber-600">{r.earned} ⭐</span>
                  </li>
                ))}
                {coinRank.length === 0 && <li className="text-xs text-slate-400">暂无数据</li>}
              </ol>
            </div>
            <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <div className="mb-3 flex items-center gap-2 font-bold text-slate-800"><Trophy className="h-4 w-4 text-rose-500" />本周宠物等级榜</div>
              <ol className="space-y-2">
                {petRank.map((r, i) => (
                  <li key={r.user_id} className="flex items-center gap-2 text-sm">
                    <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold", i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-300 text-white" : i === 2 ? "bg-orange-300 text-white" : "bg-slate-100 text-slate-600")}>{i + 1}</span>
                    <span className="text-lg">{r.pet_emoji}</span>
                    <span className="flex-1 truncate">{r.username} 的 {r.pet_name}</span>
                    <span className="font-bold text-rose-600">Lv.{r.level}</span>
                  </li>
                ))}
                {petRank.length === 0 && <li className="text-xs text-slate-400">暂无数据</li>}
              </ol>
            </div>
          </div>
        )}

        {!loading && tab === "market" && (
          <div className="space-y-4">
            <ListFoodForm foods={foods} inv={inv} onDone={() => loadTab("market")} showToast={showToast} />
            <div className="grid gap-2 sm:grid-cols-2">
              {listings.map(l => {
                const f = foods.find(x => x.id === l.food_id);
                const total = l.qty * l.price_per_unit;
                const isMine = l.seller_id === uid;
                return (
                  <div key={l.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                    <div className="text-2xl">{f?.emoji || "🍖"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800">{f?.name_cn} × {l.qty}</div>
                      <div className="text-xs text-slate-500">{l.username} · 单价 {l.price_per_unit}⭐</div>
                    </div>
                    {isMine ? (
                      <button onClick={async () => { await supabase.rpc("cancel_listing", { _listing_id: l.id }); loadTab("market"); }} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">下架</button>
                    ) : (
                      <button onClick={() => buy(l)} className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow">{total}⭐ 买下</button>
                    )}
                  </div>
                );
              })}
              {listings.length === 0 && <div className="col-span-full rounded-2xl bg-white p-6 text-center text-sm text-slate-500 ring-1 ring-slate-200">市集暂时空空，挂一份你的多余粮食吧～</div>}
            </div>
          </div>
        )}

        {!loading && tab === "gift" && (
          <GiftPanel quota={giftQuota} foods={foods} inv={inv} online={onlineList} onSend={sendGiftTo} />
        )}

        {!loading && tab === "wave" && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <div className="text-sm text-slate-700">👋 今日还可给 <b className="text-emerald-600">{waveQuota}</b> 位同学打招呼（送对方 1 星币加油）</div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {onlineList.map(o => (
                <div key={o.user_id} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                  <div className="text-xl">{o.emoji}</div>
                  <div className="flex-1 truncate text-sm">{o.username}</div>
                  <button disabled={waveQuota <= 0} onClick={() => waveTo(o.user_id)} className={cn("rounded-full px-3 py-1 text-xs font-bold text-white shadow", waveQuota > 0 ? "bg-emerald-500" : "bg-slate-300")}>✨ 加油</button>
                </div>
              ))}
              {onlineList.length === 0 && <div className="col-span-full rounded-2xl bg-white p-6 text-center text-sm text-slate-500 ring-1 ring-slate-200">还没有同学在线～</div>}
            </div>
          </div>
        )}

        {!loading && tab === "coop" && (
          <div className="space-y-4">
            {!coopState ? (
              <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 p-6 text-center text-white shadow-lg">
                <Users className="mx-auto mb-2 h-10 w-10" />
                <h3 className="mb-1 text-lg font-bold">🤝 合作答题</h3>
                <p className="mb-4 text-sm opacity-90">和 1-2 位同学组队，30 分钟内共同答对 20 题，每人 +50 星币 + 1 份稀有粮食！</p>
                <button onClick={joinCoop} className="rounded-full bg-white px-6 py-2 text-sm font-bold text-fuchsia-700 shadow">立即匹配</button>
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                <div className="mb-2 text-sm text-slate-600">本队进度</div>
                <div className="mb-1 flex items-end justify-between">
                  <div className="text-2xl font-bold text-slate-800">{coopState.current_correct} / {coopState.goal_correct}</div>
                  <div className="text-xs text-slate-500">状态：{coopState.status === "open" ? "等待队友…" : "进行中"}</div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: `${Math.min(100, coopState.current_correct / coopState.goal_correct * 100)}%` }} />
                </div>
                <p className="mt-3 text-xs text-slate-500">💡 现在去任意答题游戏，每答对一题都会自动为本队 +1。</p>
                <div className="mt-3 flex gap-2">
                  <Link to="/primary" className="rounded-full bg-amber-500 px-4 py-1.5 text-xs font-bold text-white">小学游戏</Link>
                  <Link to="/junior" className="rounded-full bg-sky-500 px-4 py-1.5 text-xs font-bold text-white">初中练习</Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">{toast}</div>
      )}
    </div>
  );
}

function ListFoodForm({ foods, inv, onDone, showToast }: { foods: Food[]; inv: { food_id: string; qty: number }[]; onDone: () => void; showToast: (m: string) => void }) {
  const [foodId, setFoodId] = useState("");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(10);
  const owned = inv.filter(i => i.qty > 0);
  const submit = async () => {
    if (!foodId) return showToast("请选择粮食");
    const { error } = await supabase.rpc("list_food", { _food_id: foodId, _qty: qty, _price: price });
    if (error) { showToast("挂单失败：" + error.message); return; }
    showToast("✅ 挂单成功！");
    setFoodId(""); setQty(1); setPrice(10);
    onDone();
  };
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
      <div className="mb-2 text-sm font-bold text-slate-800">📦 上架我的粮食</div>
      {owned.length === 0 ? (
        <p className="text-xs text-slate-500">你还没有可上架的粮食 —— 先去宠物商店买一些，或答题获得！</p>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <select value={foodId} onChange={e => setFoodId(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-sm">
            <option value="">选粮食…</option>
            {owned.map(i => { const f = foods.find(x => x.id === i.food_id); return <option key={i.food_id} value={i.food_id}>{f?.emoji} {f?.name_cn} (持有 {i.qty})</option>; })}
          </select>
          <label className="text-xs text-slate-500">数量<input type="number" min={1} max={99} value={qty} onChange={e => setQty(+e.target.value)} className="ml-1 w-16 rounded-xl border border-slate-200 px-2 py-1" /></label>
          <label className="text-xs text-slate-500">单价<input type="number" min={1} max={999} value={price} onChange={e => setPrice(+e.target.value)} className="ml-1 w-20 rounded-xl border border-slate-200 px-2 py-1" />⭐</label>
          <button onClick={submit} className="ml-auto rounded-full bg-slate-900 px-4 py-1.5 text-xs font-bold text-white">挂单</button>
        </div>
      )}
    </div>
  );
}

function GiftPanel({ quota, foods, inv, online, onSend }: { quota: number; foods: Food[]; inv: { food_id: string; qty: number }[]; online: any[]; onSend: (toUser: string, foodId: string) => void }) {
  const [foodId, setFoodId] = useState<string>(foods[0]?.id || "");
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <div className="mb-2 text-sm text-slate-700">🎁 今日还可免费送出 <b className="text-rose-600">{quota}</b> 份粮食</div>
        <div className="flex flex-wrap gap-1.5">
          {foods.slice(0, 6).map(f => (
            <button key={f.id} onClick={() => setFoodId(f.id)} className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ring-1 transition", foodId === f.id ? "bg-rose-50 text-rose-700 ring-rose-300" : "bg-white text-slate-600 ring-slate-200")}>{f.emoji} {f.name_cn}</button>
          ))}
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {online.map(o => (
          <div key={o.user_id} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
            <div className="text-xl">{o.emoji}</div>
            <div className="flex-1 truncate text-sm">{o.username}</div>
            <button disabled={quota <= 0 || !foodId} onClick={() => onSend(o.user_id, foodId)} className={cn("rounded-full px-3 py-1 text-xs font-bold text-white shadow", quota > 0 && foodId ? "bg-rose-500" : "bg-slate-300")}>送出</button>
          </div>
        ))}
        {online.length === 0 && <div className="col-span-full rounded-2xl bg-white p-6 text-center text-sm text-slate-500 ring-1 ring-slate-200">暂无在线同学，过会儿再来～</div>}
      </div>
    </div>
  );
}

function timeAgo(iso: string): string {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "刚刚";
  if (d < 3600) return `${Math.floor(d / 60)} 分钟前`;
  if (d < 86400) return `${Math.floor(d / 3600)} 小时前`;
  return `${Math.floor(d / 86400)} 天前`;
}