import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Coins, Loader2, Heart, Sparkles, ShoppingBag, MapPin, BookHeart, Star, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { celebratePet } from "@/components/pet/EvolutionCelebration";

type Species = { id:string; name_cn:string; emoji_egg:string; emoji_baby:string; emoji_adult:string; emoji_legend:string; rarity:number; adopt_cost:number; description_cn:string; personality_cn:string };
type Food = { id:string; name_cn:string; emoji:string; price:number; hunger_restore:number; exp_bonus:number; mood_bonus:number; rarity:number; description_cn:string };
type Dest = { id:string; name_cn:string; emoji:string; cost_coins:number; hunger_cost:number; exp_reward:number; unlock_level:number; description_cn:string };
type Pet = { id:string; species_id:string; nickname:string; stage:number; level:number; exp:number; hunger:number; mood:number; is_active:boolean };
type Inv = { food_id:string; qty:number };
type Diary = { id:string; emoji:string|null; message:string; event_type:string; created_at:string };

type Tab = "home" | "shop" | "outing" | "adopt" | "diary";

export default function Pets() {
  const [authed, setAuthed] = useState<boolean|null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("home");
  const [balance, setBalance] = useState(0);
  const [pets, setPets] = useState<Pet[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [dests, setDests] = useState<Dest[]>([]);
  const [inv, setInv] = useState<Inv[]>([]);
  const [diary, setDiary] = useState<Diary[]>([]);
  const [toast, setToast] = useState<string>("");

  const reload = async () => {
    const { data: u } = await supabase.auth.getUser();
    const uid = u?.user?.id;
    setAuthed(!!uid);
    if (!uid) { setLoading(false); return; }
    const [c, p, sp, fd, ds, iv, dy] = await Promise.all([
      supabase.from("user_coins").select("balance").eq("user_id", uid).maybeSingle(),
      supabase.from("user_pets").select("*").eq("user_id", uid).order("created_at"),
      supabase.from("pet_species").select("*").order("sort_order"),
      supabase.from("pet_food_items").select("*").order("sort_order"),
      supabase.from("pet_destinations").select("*").order("sort_order"),
      supabase.from("pet_inventory").select("food_id,qty").eq("user_id", uid),
      supabase.from("pet_diary").select("id,emoji,message,event_type,created_at").eq("user_id", uid).order("created_at",{ascending:false}).limit(30),
    ]);
    setBalance(c.data?.balance ?? 0);
    setPets((p.data ?? []) as Pet[]);
    setSpecies((sp.data ?? []) as Species[]);
    setFoods((fd.data ?? []) as Food[]);
    setDests((ds.data ?? []) as Dest[]);
    setInv((iv.data ?? []) as Inv[]);
    setDiary((dy.data ?? []) as Diary[]);
    setLoading(false);
  };
  useEffect(() => { reload(); }, []);

  const flash = (m: string) => { setToast(m); setTimeout(()=>setToast(""), 2200); };
  const speciesMap = Object.fromEntries(species.map(s => [s.id, s]));
  const active = pets.find(p => p.is_active) ?? pets[0];

  if (authed === false) {
    return (
      <main className="mx-auto min-h-screen max-w-md px-5 py-10 text-center">
        <div className="text-5xl">🐾</div>
        <h1 className="mt-3 text-2xl font-extrabold">登录后开启宠物之旅</h1>
        <p className="mt-1 text-sm text-muted-foreground">学习赚星币 → 领养 → 喂养 → 进化 → 出游</p>
        <Link to="/auth" className="mt-5 inline-block rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2.5 text-sm font-extrabold text-white shadow">立即登录</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-24 pt-6 md:px-6">
      <Link to="/" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回主页
      </Link>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">MY PETS</div>
          <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">🐾 奇幻宠物乐园</h1>
          <p className="mt-1 text-xs text-muted-foreground">学习赚星币，喂养专属伙伴</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 px-3 py-1.5 text-sm font-extrabold text-white shadow-tile">
          <Coins className="size-4" /> {balance}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {/* Tabs */}
          <div className="mb-4 grid grid-cols-5 gap-1 rounded-2xl bg-secondary p-1 text-[11px] font-bold">
            {([
              ["home", "🏠 我家", Heart],
              ["shop", "🛒 商店", ShoppingBag],
              ["outing", "🗺️ 出游", MapPin],
              ["adopt", "🥚 领养", Sparkles],
              ["diary", "📖 日记", BookHeart],
            ] as const).map(([k, lbl]) => (
              <button
                key={k} onClick={()=>setTab(k as Tab)}
                className={cn("rounded-xl px-2 py-2 transition", tab === k ? "bg-card shadow-sm" : "text-muted-foreground hover:bg-card/50")}
              >{lbl}</button>
            ))}
          </div>

          {tab === "home" && <HomeTab pets={pets} active={active} species={speciesMap} inv={inv} foods={foods} onAfter={reload} flash={flash} />}
          {tab === "shop" && <ShopTab foods={foods} balance={balance} inv={inv} onAfter={reload} flash={flash} />}
          {tab === "outing" && <OutingTab pets={pets} active={active} dests={dests} balance={balance} species={speciesMap} onAfter={reload} flash={flash} />}
          {tab === "adopt" && <AdoptTab species={species} balance={balance} onAfter={reload} flash={flash} setTab={setTab} />}
          {tab === "diary" && <DiaryTab diary={diary} />}
        </>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground/90 px-5 py-2.5 text-sm font-bold text-background shadow-2xl animate-fade-in">
          {toast}
        </div>
      )}
    </main>
  );
}

function petEmoji(p: Pet, sp?: Species) {
  if (!sp) return "🥚";
  return [sp.emoji_egg, sp.emoji_baby, sp.emoji_adult, sp.emoji_legend][p.stage] ?? sp.emoji_baby;
}
const STAGE_LABEL = ["蛋", "幼年", "成年", "传说"];

function HomeTab({ pets, active, species, inv, foods, onAfter, flash }: any) {
  const [feedingFood, setFeedingFood] = useState<string | null>(null);
  if (!pets.length) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-purple-300 bg-purple-50/50 p-10 text-center dark:bg-purple-950/20">
        <div className="text-6xl">🥚</div>
        <h3 className="mt-3 text-lg font-extrabold">还没有宠物哦</h3>
        <p className="mt-1 text-sm text-muted-foreground">去「领养」标签页带一只回家吧！</p>
      </div>
    );
  }
  const sp: Species | undefined = species[active.species_id];
  const expToNext = active.level * 100;
  const expPct = Math.min(100, Math.round((active.exp / expToNext) * 100));

  const setActive = async (id: string) => {
    await supabase.rpc("set_active_pet", { _pet_id: id });
    onAfter();
  };
  const doFeed = async (foodId: string) => {
    setFeedingFood(foodId);
    const { data, error } = await supabase.rpc("feed_pet", { _pet_id: active.id, _food_id: foodId });
    setFeedingFood(null);
    if (error) { flash("❌ " + error.message); return; }
    const r = Array.isArray(data) ? data[0] : data;
    flash(r?.message || "🍽️ 喂食成功！");
    if (r?.evolved) {
      const newStage = r.new_stage ?? active.stage + 1;
      const newEmoji = [sp?.emoji_egg, sp?.emoji_baby, sp?.emoji_adult, sp?.emoji_legend][newStage] ?? "✨";
      const prevEmoji = [sp?.emoji_egg, sp?.emoji_baby, sp?.emoji_adult, sp?.emoji_legend][active.stage] ?? "🥚";
      celebratePet({
        kind: "evolve",
        emoji: newEmoji,
        prevEmoji,
        title: r.message || "进化啦！",
        subtitle: `${active.nickname} · ${STAGE_LABEL[newStage]}形态`,
      });
    } else if (r?.leveled) {
      const emoji = [sp?.emoji_egg, sp?.emoji_baby, sp?.emoji_adult, sp?.emoji_legend][active.stage] ?? "⭐";
      celebratePet({
        kind: "levelup",
        emoji,
        title: `Lv.${r.new_level} 达成！`,
        subtitle: active.nickname,
      });
    }
    onAfter();
  };

  return (
    <div className="space-y-4">
      {/* Active pet */}
      <div className="rounded-3xl bg-gradient-to-br from-purple-100 via-pink-50 to-amber-50 p-6 shadow-tile dark:from-purple-950/40 dark:via-pink-950/30 dark:to-amber-950/30">
        <div className="flex flex-col items-center text-center">
          <div className="text-7xl drop-shadow-md md:text-8xl animate-bounce-slow">{petEmoji(active, sp)}</div>
          <div className="mt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{sp?.name_cn} · {STAGE_LABEL[active.stage]}</div>
          <h2 className="mt-0.5 text-xl font-extrabold">{active.nickname}</h2>
          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className="rounded-full bg-purple-500/10 px-2 py-0.5 font-bold text-purple-600">Lv.{active.level}</span>
            <span className="text-muted-foreground">{sp?.personality_cn}</span>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Bar label="经验" value={expPct} hint={`${active.exp} / ${expToNext}`} color="from-purple-400 to-pink-500" />
          <Bar label="饱食" value={active.hunger} hint={`${active.hunger}/100`} color="from-amber-400 to-orange-500" />
          <Bar label="心情" value={active.mood} hint={`${active.mood}/100`} color="from-rose-400 to-pink-500" />
        </div>
      </div>

      {/* Quick feed */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-extrabold">🍽️ 喂它吃点东西</h3>
          <span className="text-[11px] text-muted-foreground">点食物即可喂食</span>
        </div>
        {inv.filter((i: Inv) => i.qty > 0).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-4 text-center text-xs text-muted-foreground">
            背包空空，去「商店」买点食物吧 🛒
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {inv.filter((i: Inv) => i.qty > 0).map((i: Inv) => {
              const f = foods.find((x: Food) => x.id === i.food_id);
              if (!f) return null;
              return (
                <button key={i.food_id} disabled={feedingFood===i.food_id} onClick={()=>doFeed(i.food_id)}
                  className="group flex flex-col items-center rounded-2xl border-2 border-border bg-card p-2 transition hover:-translate-y-0.5 hover:border-amber-400 disabled:opacity-50">
                  <span className="text-3xl">{f.emoji}</span>
                  <span className="mt-1 text-[10px] font-bold">{f.name_cn}</span>
                  <span className="text-[10px] text-muted-foreground">×{i.qty}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Other pets */}
      {pets.length > 1 && (
        <div>
          <h3 className="mb-2 text-sm font-extrabold">🏡 我的伙伴们</h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {pets.map((p: Pet) => {
              const s: Species = species[p.species_id];
              return (
                <button key={p.id} onClick={()=>setActive(p.id)}
                  className={cn("rounded-2xl border-2 p-2 text-center transition", p.is_active ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30" : "border-border bg-card hover:border-purple-300")}>
                  <div className="text-3xl">{petEmoji(p, s)}</div>
                  <div className="mt-0.5 text-[11px] font-bold">{p.nickname}</div>
                  <div className="text-[10px] text-muted-foreground">Lv.{p.level} · {STAGE_LABEL[p.stage]}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Bar({ label, value, hint, color }: { label:string; value:number; hint:string; color:string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="font-bold">{label}</span>
        <span className="text-muted-foreground">{hint}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full bg-gradient-to-r transition-all", color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ShopTab({ foods, balance, inv, onAfter, flash }: any) {
  const [busy, setBusy] = useState<string | null>(null);
  const buy = async (id: string) => {
    setBusy(id);
    const { error } = await supabase.rpc("buy_pet_food", { _food_id: id, _qty: 1 });
    setBusy(null);
    if (error) { flash(error.message.includes("not enough") ? "💰 星币不够，继续学习赚星币吧！" : "❌ "+error.message); return; }
    flash("🛒 购买成功！");
    onAfter();
  };
  const invMap = Object.fromEntries(inv.map((i: Inv) => [i.food_id, i.qty]));
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {foods.map((f: Food) => {
        const owned = invMap[f.id] ?? 0;
        const canBuy = balance >= f.price;
        return (
          <div key={f.id} className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card p-3">
            <div className="text-4xl">{f.emoji}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold">{f.name_cn}</span>
                <span className="text-[10px] text-muted-foreground">×{owned}</span>
                {f.rarity >= 3 && <Star className="size-3 fill-amber-500 text-amber-500" />}
              </div>
              <div className="text-[11px] text-muted-foreground">饱+{f.hunger_restore} 经+{f.exp_bonus} 心+{f.mood_bonus}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">{f.description_cn}</div>
            </div>
            <button onClick={()=>buy(f.id)} disabled={busy===f.id || !canBuy}
              className={cn("flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-extrabold text-white shadow",
                canBuy ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-muted-foreground/40")}>
              <Coins className="size-3" /> {f.price}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function OutingTab({ pets, active, dests, balance, species, onAfter, flash }: any) {
  const [busy, setBusy] = useState<string | null>(null);
  const sp = species[active?.species_id];
  if (!active || active.stage < 1) {
    return <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">宠物还在蛋里，先去喂食孵化吧 🥚</div>;
  }
  const go = async (id: string) => {
    setBusy(id);
    const { data, error } = await supabase.rpc("take_pet_outing", { _pet_id: active.id, _dest_id: id });
    setBusy(null);
    if (error) { flash("❌ " + (error.message.includes("hungry") ? "宠物太饿啦，先喂饱再出门" : error.message.includes("coins") ? "💰 星币不够" : error.message)); return; }
    const r = Array.isArray(data) ? data[0] : data;
    flash((r?.surprise || "🎉 玩得很开心！") + ` Lv.${r?.new_level}`);
    if (r?.new_level && r.new_level > active.level) {
      const emoji = [sp?.emoji_egg, sp?.emoji_baby, sp?.emoji_adult, sp?.emoji_legend][active.stage] ?? "⭐";
      celebratePet({
        kind: "levelup",
        emoji,
        title: `Lv.${r.new_level} 达成！`,
        subtitle: `${active.nickname} 在外面玩得超棒`,
      });
    }
    onAfter();
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-purple-100 to-pink-100 p-3 dark:from-purple-950/30 dark:to-pink-950/30">
        <div className="text-3xl">{petEmoji(active, sp)}</div>
        <div className="flex-1 text-sm"><b>{active.nickname}</b> · Lv.{active.level} · 饱 {active.hunger}/100</div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {dests.map((d: Dest) => {
          const locked = active.level < d.unlock_level;
          return (
            <div key={d.id} className={cn("flex items-center gap-3 rounded-2xl border-2 bg-card p-3", locked ? "opacity-50" : "border-border")}>
              <div className="text-4xl">{d.emoji}</div>
              <div className="min-w-0 flex-1">
                <div className="font-extrabold">{d.name_cn}</div>
                <div className="text-[11px] text-muted-foreground line-clamp-1">{d.description_cn}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">花费 {d.cost_coins} ⭐ · 经验 +{d.exp_reward}</div>
              </div>
              <button onClick={()=>go(d.id)} disabled={busy===d.id || locked || balance < d.cost_coins}
                className={cn("shrink-0 rounded-full px-3 py-1.5 text-xs font-extrabold text-white shadow",
                  locked ? "bg-muted-foreground/40" : "bg-gradient-to-r from-emerald-500 to-teal-500")}>
                {locked ? `Lv.${d.unlock_level}` : "出发"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdoptTab({ species, balance, onAfter, flash, setTab }: any) {
  const [picking, setPicking] = useState<Species | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const adopt = async () => {
    if (!picking || !name.trim()) return;
    setBusy(true);
    const { error } = await supabase.rpc("adopt_pet", { _species_id: picking.id, _nickname: name.trim() });
    setBusy(false);
    if (error) { flash(error.message.includes("not enough") ? "💰 星币不够，先去学习赚星币吧！" : "❌ "+error.message); return; }
    flash("🎉 领养成功！欢迎回家");
    setPicking(null); setName("");
    onAfter();
    setTab("home");
  };
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {species.map((s: Species) => {
          const can = balance >= s.adopt_cost;
          return (
            <button key={s.id} onClick={()=>setPicking(s)}
              className="group flex items-center gap-3 rounded-2xl border-2 border-border bg-card p-3 text-left transition hover:-translate-y-0.5 hover:border-purple-400">
              <div className="text-4xl group-hover:scale-110 transition">{s.emoji_baby}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold">{s.name_cn}</span>
                  {Array.from({length: s.rarity}).map((_,i)=><Star key={i} className="size-3 fill-amber-500 text-amber-500" />)}
                </div>
                <div className="text-[11px] text-muted-foreground line-clamp-1">{s.description_cn}</div>
                <div className="text-[11px] text-muted-foreground">{s.personality_cn}</div>
              </div>
              <div className={cn("flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-extrabold text-white shadow", can ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-muted-foreground/40")}>
                <Coins className="size-3" /> {s.adopt_cost}
              </div>
            </button>
          );
        })}
      </div>

      {picking && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={()=>setPicking(null)}>
          <div onClick={e=>e.stopPropagation()} className="w-full max-w-sm rounded-3xl bg-card p-6 text-center shadow-2xl">
            <div className="text-6xl">{picking.emoji_egg}</div>
            <h3 className="mt-2 text-lg font-extrabold">领养 {picking.name_cn}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{picking.description_cn}</p>
            <input value={name} onChange={e=>setName(e.target.value)} maxLength={12} placeholder="给它起个名字…"
              className="mt-4 w-full rounded-xl border-2 border-border bg-background px-3 py-2 text-center text-sm font-bold outline-none focus:border-purple-500" />
            <div className="mt-4 flex gap-2">
              <button onClick={()=>setPicking(null)} className="flex-1 rounded-full bg-secondary px-4 py-2 text-sm font-bold">取消</button>
              <button onClick={adopt} disabled={busy || !name.trim() || balance<picking.adopt_cost} className="flex-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-extrabold text-white shadow disabled:opacity-50">
                {busy ? "领养中…" : `花费 ${picking.adopt_cost} ⭐`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DiaryTab({ diary }: { diary: Diary[] }) {
  if (!diary.length) return <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">还没有日记，去领养一只宠物开始记录吧 📖</div>;
  return (
    <div className="space-y-2">
      {diary.map(d => (
        <div key={d.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
          <div className="text-2xl">{d.emoji || "📝"}</div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold">{d.message}</div>
            <div className="text-[10px] text-muted-foreground">{new Date(d.created_at).toLocaleString("zh-CN")}</div>
          </div>
        </div>
      ))}
    </div>
  );
}