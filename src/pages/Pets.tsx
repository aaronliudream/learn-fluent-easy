import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link } from "react-router-dom";
import { ArrowLeft, Coins, Loader2, Heart, Sparkles, ShoppingBag, MapPin, BookHeart, Star, Shirt, Smile, Sprout, Hourglass, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { celebratePet } from "@/components/pet/EvolutionCelebration";
import CompanionOnboarding from "@/components/pet/CompanionOnboarding";
import ReportAIButton from "@/components/pet/ReportAIButton";
import PlanetMap from "@/components/pet/PlanetMap";
import PetChat from "@/components/pet/PetChat";
import MonthlyPostcard from "@/components/pet/MonthlyPostcard";
import PetAbilities from "@/components/pet/PetAbilities";
import EvolutionTree from "@/components/pet/EvolutionTree";
import { useCurrencies, wishlistAdd, fetchWishlist, wishlistRemove, type WishlistRow } from "@/lib/currencies";
import { T, useT } from "@/i18n/T";

type Species = { id:string; name_cn:string; emoji_egg:string; emoji_baby:string; emoji_adult:string; emoji_legend:string; rarity:number; adopt_cost:number; description_cn:string; personality_cn:string };
type Food = { id:string; name_cn:string; emoji:string; price:number; hunger_restore:number; exp_bonus:number; mood_bonus:number; rarity:number; description_cn:string };
type Dest = { id:string; name_cn:string; emoji:string; cost_coins:number; hunger_cost:number; exp_reward:number; unlock_level:number; description_cn:string };
type Pet = { id:string; species_id:string; nickname:string; stage:number; level:number; exp:number; hunger:number; mood:number; is_active:boolean; equipped_skin_id?:string|null };
type Skin = { id:string; code:string; name_cn:string; description_cn:string; css_filter:string; rarity:number; price:number; unlock_level:number };
type OwnedSkin = { skin_id:string };
type Sticker = { id:string; code:string; emoji:string; caption_cn:string; unlock_level:number };
type Inv = { food_id:string; qty:number };
type Diary = { id:string; emoji:string|null; message:string; event_type:string; created_at:string };

type Tab = "home" | "shop" | "outing" | "adopt" | "skin" | "diary";

export default function Pets() {
  const t = useT();
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
  const [skins, setSkins] = useState<Skin[]>([]);
  const [owned, setOwned] = useState<OwnedSkin[]>([]);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [toast, setToast] = useState<string>("");
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const currencies = useCurrencies(0);

  const reload = async () => {
    const { data: u } = await supabase.auth.getUser();
    const uid = u?.user?.id;
    setAuthed(!!uid);
    if (!uid) { setLoading(false); return; }
    const [c, p, sp, fd, ds, iv, dy, sk, os, st] = await Promise.all([
      supabase.from("user_coins").select("balance").eq("user_id", uid).maybeSingle(),
      supabase.from("user_pets").select("*").eq("user_id", uid).order("created_at"),
      supabase.from("pet_species").select("*").order("sort_order"),
      supabase.from("pet_food_items").select("*").order("sort_order"),
      supabase.from("pet_destinations").select("*").order("sort_order"),
      supabase.from("pet_inventory").select("food_id,qty").eq("user_id", uid),
      supabase.from("pet_diary").select("id,emoji,message,event_type,created_at").eq("user_id", uid).order("created_at",{ascending:false}).limit(30),
      (supabase as any).from("pet_skins").select("*").order("sort_order"),
      (supabase as any).from("user_pet_skins").select("skin_id").eq("user_id", uid),
      (supabase as any).from("pet_stickers").select("*").order("sort_order"),
    ]);
    setBalance(c.data?.balance ?? 0);
    setPets((p.data ?? []) as Pet[]);
    setSpecies((sp.data ?? []) as Species[]);
    setFoods((fd.data ?? []) as Food[]);
    setDests((ds.data ?? []) as Dest[]);
    setInv((iv.data ?? []) as Inv[]);
    setDiary((dy.data ?? []) as Diary[]);
    setSkins((sk.data ?? []) as Skin[]);
    setOwned((os.data ?? []) as OwnedSkin[]);
    setStickers((st.data ?? []) as Sticker[]);
    setLoading(false);
    // 首次进入：未做选择 + 未持有任何宠物 → 弹出守护灵入职
    try {
      const { data: choice } = await (supabase as any)
        .from("pet_companion_choice").select("user_id").eq("user_id", uid).maybeSingle();
      if (!choice && (p.data ?? []).length === 0) setNeedsOnboarding(true);
    } catch {}
  };
  useEffect(() => { reload(); }, []);

  const flash = (m: string) => { setToast(m); setTimeout(()=>setToast(""), 2200); };
  const speciesMap = Object.fromEntries(species.map(s => [s.id, s]));
  const active = pets.find(p => p.is_active) ?? pets[0];

  if (authed === false) {
    return (
      <main className="mx-auto min-h-screen max-w-md px-5 py-10 text-center">
        <div className="text-5xl">🐾</div>
        <h1 className="mt-3 text-2xl font-extrabold"><T>登录后开启宠物之旅</T></h1>
        <p className="mt-1 text-sm text-muted-foreground"><T>学习赚星币 → 领养 → 喂养 → 进化 → 出游</T></p>
        <Link to="/auth" className="mt-5 inline-block rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2.5 text-sm font-extrabold text-white shadow"><T>立即登录</T></Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-24 pt-6 md:px-6">
      <BackLink to="/" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> <T>返回主页</T>
      </BackLink>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">MY PETS</div>
          <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">🐾 <T>奇幻宠物乐园</T></h1>
          <p className="mt-1 text-xs text-muted-foreground"><T>学习赚星币，喂养专属伙伴</T></p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 px-3 py-1.5 text-sm font-extrabold text-white shadow-tile">
          <Coins className="size-4" /> {balance}
        </div>
      </div>
      {/* 三种货币 + 消化中（延迟满足设计） */}
      <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-bold">
        <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-700 dark:text-emerald-300" title={t("种子：学习产出，可在商店心愿单兑换")}>
          <Sprout className="size-3" /> {currencies.seeds} <T>种子</T>
        </div>
        {currencies.pending > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-amber-700 dark:text-amber-300" title={t("刚学到的种子正在宠物体内消化，明天到账")}>
            <Hourglass className="size-3 animate-pulse" /> <T>消化中</T> +{currencies.pending}
          </div>
        )}
        <div className="flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-1 text-violet-700 dark:text-violet-300" title={t("星光：连续学习奖励，未来可解锁场景")}>
          ⭐ {currencies.starlight}
        </div>
        <div className="flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-1 text-sky-700 dark:text-sky-300" title={t("结晶：完成长期里程碑获得，购买稀有道具")}>
          💎 {currencies.crystals}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {/* Tabs */}
          <div className="mb-4 grid grid-cols-6 gap-1 rounded-2xl bg-secondary p-1 text-[11px] font-bold">
            {([
              ["home", "🏠 我家", Heart],
              ["shop", "🛒 商店", ShoppingBag],
              ["outing", "🗺️ 出游", MapPin],
              ["adopt", "🥚 领养", Sparkles],
              ["skin", "👕 皮肤", Shirt],
              ["diary", "📖 日记", BookHeart],
            ] as const).map(([k, lbl]) => (
              <button
                key={k} onClick={()=>setTab(k as Tab)}
                className={cn("rounded-xl px-2 py-2 transition", tab === k ? "bg-card shadow-sm" : "text-muted-foreground hover:bg-card/50")}
              ><T>{lbl}</T></button>
            ))}
          </div>

          {tab === "home" && <HomeTab pets={pets} active={active} species={speciesMap} inv={inv} foods={foods} skins={skins} stickers={stickers} onAfter={reload} flash={flash} />}
          {tab === "shop" && <ShopTab foods={foods} balance={balance} inv={inv} onAfter={reload} flash={flash} refreshCurrencies={currencies.refresh} />}
          {tab === "outing" && <OutingTab pets={pets} active={active} dests={dests} balance={balance} species={speciesMap} onAfter={reload} flash={flash} />}
          {tab === "adopt" && <AdoptTab species={species} balance={balance} onAfter={reload} flash={flash} setTab={setTab} />}
          {tab === "skin" && <SkinTab active={active} species={speciesMap} skins={skins} owned={owned} balance={balance} onAfter={reload} flash={flash} />}
          {tab === "diary" && <DiaryTab diary={diary} />}
        </>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground/90 px-5 py-2.5 text-sm font-bold text-background shadow-2xl animate-fade-in">
          {toast}
        </div>
      )}
      {needsOnboarding && (
        <CompanionOnboarding onDone={() => { setNeedsOnboarding(false); reload(); }} />
      )}
    </main>
  );
}

function petEmoji(p: Pet, sp?: Species) {
  if (!sp) return "🥚";
  return [sp.emoji_egg, sp.emoji_baby, sp.emoji_adult, sp.emoji_legend][p.stage] ?? sp.emoji_baby;
}
const STAGE_LABEL = ["蛋", "幼年", "成年", "传说"];

function HomeTab({ pets, active, species, inv, foods, skins, stickers, onAfter, flash }: any) {
  const t = useT();
  const [feedingFood, setFeedingFood] = useState<string | null>(null);
  const [pickedSticker, setPickedSticker] = useState<string | null>(null);
  if (!pets.length) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-purple-300 bg-purple-50/50 p-10 text-center dark:bg-purple-950/20">
        <div className="text-6xl">🥚</div>
        <h3 className="mt-3 text-lg font-extrabold"><T>还没有宠物哦</T></h3>
        <p className="mt-1 text-sm text-muted-foreground"><T>去「领养」标签页带一只回家吧！</T></p>
      </div>
    );
  }
  const sp: Species | undefined = species[active.species_id];
  const expToNext = active.level * 100;
  const expPct = Math.min(100, Math.round((active.exp / expToNext) * 100));
  const equippedSkin: Skin | undefined = (skins as Skin[]).find(s => s.id === active.equipped_skin_id);
  const skinFilter = equippedSkin?.css_filter || "";
  const unlockedStickers = (stickers as Sticker[]).filter(s => s.unlock_level <= active.level);
  const lockedStickers = (stickers as Sticker[]).filter(s => s.unlock_level > active.level).slice(0, 4);

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
    flash(r?.message || t("🍽️ 喂食成功！"));
    if (r?.evolved) {
      const newStage = r.new_stage ?? active.stage + 1;
      const newEmoji = [sp?.emoji_egg, sp?.emoji_baby, sp?.emoji_adult, sp?.emoji_legend][newStage] ?? "✨";
      const prevEmoji = [sp?.emoji_egg, sp?.emoji_baby, sp?.emoji_adult, sp?.emoji_legend][active.stage] ?? "🥚";
      celebratePet({
        kind: "evolve",
        emoji: newEmoji,
        prevEmoji,
        title: r.message || t("进化啦！"),
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
      <MonthlyPostcard />
      {/* Active pet */}
      <div className="rounded-3xl bg-gradient-to-br from-purple-100 via-pink-50 to-amber-50 p-6 shadow-tile dark:from-purple-950/40 dark:via-pink-950/30 dark:to-amber-950/30">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="text-7xl drop-shadow-md md:text-8xl animate-bounce-slow" style={{ filter: skinFilter }}>{petEmoji(active, sp)}</div>
            {pickedSticker && (
              <div className="absolute -right-3 -top-2 text-3xl animate-bounce">{pickedSticker}</div>
            )}
          </div>
          <div className="mt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <T>{sp?.name_cn}</T> · <T>{STAGE_LABEL[active.stage]}</T>
            {equippedSkin && equippedSkin.code !== "classic" && <span className="ml-1.5 text-purple-500">· <T>{equippedSkin.name_cn}</T></span>}
          </div>
          <h2 className="mt-0.5 text-xl font-extrabold">{active.nickname}</h2>
          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className="rounded-full bg-purple-500/10 px-2 py-0.5 font-bold text-purple-600">Lv.{active.level}</span>
            <span className="text-muted-foreground"><T>{sp?.personality_cn}</T></span>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Bar label="经验" value={expPct} hint={`${active.exp} / ${expToNext}`} color="from-purple-400 to-pink-500" />
          <Bar label="饱食" value={active.hunger} hint={`${active.hunger}/100`} color="from-amber-400 to-orange-500" />
          <Bar label="心情" value={active.mood} hint={`${active.mood}/100`} color="from-rose-400 to-pink-500" />
        </div>
      </div>
      <EvolutionTree stage={active.stage} level={active.level} nickname={active.nickname} />
      <PetAbilities />

      {/* Sticker board */}
      <div className="rounded-2xl border-2 border-border bg-card p-3">
        <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-extrabold">😊 <T>表情贴纸</T></h3>
          <span className="text-[10px] text-muted-foreground"><T>已解锁</T> {unlockedStickers.length}/{(stickers as Sticker[]).length}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {unlockedStickers.map((s: Sticker) => (
            <button key={s.id} onClick={()=>{ setPickedSticker(s.emoji); setTimeout(()=>setPickedSticker(null), 1800); }}
              title={s.caption_cn}
              className="rounded-xl border border-border bg-background p-1.5 text-xl transition hover:-translate-y-0.5 hover:border-purple-400">
              {s.emoji}
            </button>
          ))}
          {lockedStickers.map((s: Sticker) => (
            <div key={s.id} title={`Lv.${s.unlock_level} ${t("解锁")}`}
              className="rounded-xl border border-dashed border-border bg-muted/40 p-1.5 text-xl opacity-40 grayscale">
              {s.emoji}
            </div>
          ))}
        </div>
      </div>

      {/* Quick feed */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-extrabold">🍽️ <T>喂它吃点东西</T></h3>
          <span className="text-[11px] text-muted-foreground"><T>点食物即可喂食</T></span>
        </div>
        {inv.filter((i: Inv) => i.qty > 0).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-4 text-center text-xs text-muted-foreground">
            <T>背包空空，去「商店」买点食物吧 🛒</T>
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
                  <span className="mt-1 text-[10px] font-bold"><T>{f.name_cn}</T></span>
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
          <h3 className="mb-2 text-sm font-extrabold">🏡 <T>我的伙伴们</T></h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {pets.map((p: Pet) => {
              const s: Species = species[p.species_id];
              return (
                <button key={p.id} onClick={()=>setActive(p.id)}
                  className={cn("rounded-2xl border-2 p-2 text-center transition", p.is_active ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30" : "border-border bg-card hover:border-purple-300")}>
                  <div className="text-3xl">{petEmoji(p, s)}</div>
                  <div className="mt-0.5 text-[11px] font-bold">{p.nickname}</div>
                  <div className="text-[10px] text-muted-foreground">Lv.{p.level} · <T>{STAGE_LABEL[p.stage]}</T></div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Friends entry */}
      <Link to="/friends" className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-gradient-to-r from-fuchsia-500/10 to-amber-400/10 p-4 transition hover:-translate-y-0.5 hover:border-primary">
        <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-amber-500 text-white text-xl">🐾</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-extrabold"><T>学习朋友圈</T> · Pet Friends</div>
          <div className="text-[11px] text-muted-foreground"><T>互访朋友的伙伴 · 送礼物 · 拍合影</T></div>
        </div>
        <span className="text-muted-foreground">→</span>
      </Link>
      {active?.stage >= 1 && (
      <PetChat petName={active?.nickname || t("小伙伴")} />
      )}
    </div>
  );
}

function Bar({ label, value, hint, color }: { label:string; value:number; hint:string; color:string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="font-bold"><T>{label}</T></span>
        <span className="text-muted-foreground">{hint}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full bg-gradient-to-r transition-all", color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

/**
 * 商店 — 心愿单 + 48h 冷静期（延迟满足设计）。
 * 流程：浏览 → 加入心愿单 → 48 小时后才能"确认购买"。
 * 教育意图：弱化即时消费冲动，培养计划与耐心；与宠物对话潜在引导"我们要不要再等等"。
 */
function ShopTab({ foods, balance, inv, onAfter, flash, refreshCurrencies }: any) {
  const t = useT();
  const [busy, setBusy] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<WishlistRow[]>([]);
  const [now, setNow] = useState(Date.now());

  const reloadWishlist = async () => setWishlist(await fetchWishlist());
  useEffect(() => { reloadWishlist(); }, []);
  // 1 分钟刷新一次倒计时
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const wishMap = new Map(wishlist.map((w) => [`food:${w.item_id}`, w]));

  const addToWishlist = async (id: string) => {
    setBusy(id);
    const ok = await wishlistAdd("food", id);
    setBusy(null);
    if (!ok) { flash(t("❌ 加入心愿单失败")); return; }
    flash(t("💭 已加入心愿单 · 48 小时后可确认购买"));
    await reloadWishlist();
  };

  const confirmBuy = async (foodId: string, wishId: string) => {
    setBusy(foodId);
    const { error } = await supabase.rpc("buy_pet_food", { _food_id: foodId, _qty: 1 });
    let patienceMsg = "";
    if (!error) {
      // 走 RPC 关单，顺带累计耐心分（搁置 ≥7 天 +1）
      const { data: cw } = await supabase.rpc("confirm_wishlist_purchase", { _wishlist_id: wishId });
      const row: any = Array.isArray(cw) ? cw[0] : cw;
      if (row?.days_held >= 7) {
        patienceMsg = `💛 ${t("等待")} ${row.days_held} ${t("天 · 宠物耐心 +1（共")} ${row.patience_after}）`;
      }
    }
    setBusy(null);
    if (error) { flash(error.message.includes("not enough") ? t("💰 星币不够，继续学习吧！") : "❌ "+error.message); return; }
    flash(patienceMsg || t("🛒 等待是值得的！购买成功"));
    await reloadWishlist();
    await refreshCurrencies?.();
    onAfter();
  };

  const removeWish = async (wishId: string) => {
    await wishlistRemove(wishId);
    flash(t("已移出心愿单"));
    reloadWishlist();
  };

  const fmtRemain = (until: string) => {
    const ms = new Date(until).getTime() - now;
    if (ms <= 0) return null;
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    return `${h}h ${m}m`;
  };

  const invMap = Object.fromEntries(inv.map((i: Inv) => [i.food_id, i.qty]));

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border-2 border-dashed border-emerald-300/50 bg-emerald-50/40 p-3 text-[11px] leading-relaxed text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300">
        <div className="font-extrabold">🌱 <T>慢一点，更稳一点</T></div>
        <T>喜欢的物品先加入心愿单，48 小时后再决定买不买 —— 宠物相信会等待的孩子。</T>
        <div className="mt-1.5 text-[10px] opacity-80">
          {(() => {
            const d = new Date().getDay();
            const open = d === 3 || d === 6;
            return open ? t("🛍️ 今天是商店开放日（每周三/六）—— 也是慢慢挑选的好日子。") : t("🛍️ 商店每周三、周六最热闹 —— 把心愿留到那天再来看看。");
          })()}
        </div>
      </div>

      {wishlist.length > 0 && (
        <section>
          <div className="mb-2 flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
            <Clock className="size-3" /> <T>心愿单</T> ({wishlist.length})
          </div>
          <div className="space-y-2">
            {wishlist.map((w) => {
              const food = foods.find((x: Food) => x.id === w.item_id);
              if (!food) return null;
              const remain = fmtRemain(w.cooldown_until);
              const ready = !remain;
              const canBuy = ready && balance >= food.price;
              return (
                <div key={w.id} className="flex items-center gap-3 rounded-2xl border-2 border-violet-300/40 bg-violet-50/30 p-3 dark:bg-violet-950/20">
                  <div className="text-3xl">{food.emoji}</div>
                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold"><T>{food.name_cn}</T></div>
                    {ready ? (
                      <div className="text-[11px] font-bold text-emerald-600">✓ <T>冷静期已过，可以购买</T></div>
                    ) : (
                      <div className="text-[11px] text-muted-foreground">⏳ <T>还需</T> {remain} <T>才可购买</T></div>
                    )}
                  </div>
                  <button onClick={()=>removeWish(w.id)} className="text-[10px] text-muted-foreground underline"><T>移除</T></button>
                  <button
                    onClick={()=>confirmBuy(food.id, w.id)}
                    disabled={!canBuy || busy === food.id}
                    className={cn("flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-extrabold text-white shadow",
                      canBuy ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-muted-foreground/40")}
                  >
                    <Coins className="size-3" /> {food.price}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <div className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground"><T>商店</T></div>
        <div className="grid gap-3 sm:grid-cols-2">
          {foods.map((f: Food) => {
            const owned = invMap[f.id] ?? 0;
            const inWish = wishMap.get(`food:${f.id}`);
            return (
              <div key={f.id} className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card p-3">
                <div className="text-4xl">{f.emoji}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold"><T>{f.name_cn}</T></span>
                    <span className="text-[10px] text-muted-foreground">×{owned}</span>
                    {f.rarity >= 3 && <Star className="size-3 fill-amber-500 text-amber-500" />}
                  </div>
                  <div className="text-[11px] text-muted-foreground"><T>饱</T>+{f.hunger_restore} <T>经</T>+{f.exp_bonus} <T>心</T>+{f.mood_bonus}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground"><Coins className="size-3" /> {f.price}</div>
                </div>
                {inWish ? (
                  <span className="rounded-full bg-violet-500/15 px-2.5 py-1 text-[10px] font-extrabold text-violet-700 dark:text-violet-300">
                    <T>心愿单中</T>
                  </span>
                ) : (
                  <button onClick={()=>addToWishlist(f.id)} disabled={busy===f.id}
                    className="flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-1.5 text-[11px] font-extrabold text-white shadow">
                    💭 <T>加入心愿单</T>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function OutingTab({ pets, active, dests, balance, species, onAfter, flash }: any) {
  const t = useT();
  const [busy, setBusy] = useState<string | null>(null);
  const sp = species[active?.species_id];
  if (!active || active.stage < 1) {
    return <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground"><T>宠物还在蛋里，先去喂食孵化吧 🥚</T></div>;
  }
  const go = async (id: string) => {
    setBusy(id);
    const { data, error } = await supabase.rpc("take_pet_outing", { _pet_id: active.id, _dest_id: id });
    setBusy(null);
    if (error) { flash("❌ " + (error.message.includes("hungry") ? t("宠物太饿啦，先喂饱再出门") : error.message.includes("coins") ? t("💰 星币不够") : error.message)); return; }
    const r = Array.isArray(data) ? data[0] : data;
    flash((r?.surprise || t("🎉 玩得很开心！")) + ` Lv.${r?.new_level}`);
    if (r?.new_level && r.new_level > active.level) {
      const emoji = [sp?.emoji_egg, sp?.emoji_baby, sp?.emoji_adult, sp?.emoji_legend][active.stage] ?? "⭐";
      celebratePet({
        kind: "levelup",
        emoji,
        title: `Lv.${r.new_level} ${t("达成！")}`,
        subtitle: `${active.nickname} ${t("在外面玩得超棒")}`,
      });
    }
    onAfter();
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-purple-100 to-pink-100 p-3 dark:from-purple-950/30 dark:to-pink-950/30">
        <div className="text-3xl">{petEmoji(active, sp)}</div>
        <div className="flex-1 text-sm"><b>{active.nickname}</b> · Lv.{active.level} · <T>饱</T> {active.hunger}/100</div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {dests.map((d: Dest) => {
          const locked = active.level < d.unlock_level;
          return (
            <div key={d.id} className={cn("flex items-center gap-3 rounded-2xl border-2 bg-card p-3", locked ? "opacity-50" : "border-border")}>
              <div className="text-4xl">{d.emoji}</div>
              <div className="min-w-0 flex-1">
                <div className="font-extrabold"><T>{d.name_cn}</T></div>
                <div className="text-[11px] text-muted-foreground line-clamp-1"><T>{d.description_cn}</T></div>
                <div className="mt-0.5 text-[11px] text-muted-foreground"><T>花费</T> {d.cost_coins} ⭐ · <T>经验</T> +{d.exp_reward}</div>
              </div>
              <button onClick={()=>go(d.id)} disabled={busy===d.id || locked || balance < d.cost_coins}
                className={cn("shrink-0 rounded-full px-3 py-1.5 text-xs font-extrabold text-white shadow",
                  locked ? "bg-muted-foreground/40" : "bg-gradient-to-r from-emerald-500 to-teal-500")}>
                {locked ? `Lv.${d.unlock_level}` : <T>出发</T>}
              </button>
            </div>
          );
        })}
      </div>
      <div className="pt-2">
        <PlanetMap />
      </div>
    </div>
  );
}

function AdoptTab({ species, balance, onAfter, flash, setTab }: any) {
  const t = useT();
  const [picking, setPicking] = useState<Species | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const adopt = async () => {
    if (!picking || !name.trim()) return;
    setBusy(true);
    const { error } = await supabase.rpc("adopt_pet", { _species_id: picking.id, _nickname: name.trim() });
    setBusy(false);
    if (error) { flash(error.message.includes("not enough") ? t("💰 星币不够，先去学习赚星币吧！") : "❌ "+error.message); return; }
    flash(t("🎉 领养成功！欢迎回家"));
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
                  <span className="font-extrabold"><T>{s.name_cn}</T></span>
                  {Array.from({length: s.rarity}).map((_,i)=><Star key={i} className="size-3 fill-amber-500 text-amber-500" />)}
                </div>
                <div className="text-[11px] text-muted-foreground line-clamp-1"><T>{s.description_cn}</T></div>
                <div className="text-[11px] text-muted-foreground"><T>{s.personality_cn}</T></div>
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
            <h3 className="mt-2 text-lg font-extrabold"><T>领养</T> <T>{picking.name_cn}</T></h3>
            <p className="mt-1 text-xs text-muted-foreground"><T>{picking.description_cn}</T></p>
            <input value={name} onChange={e=>setName(e.target.value)} maxLength={12} placeholder={t("给它起个名字…")}
              className="mt-4 w-full rounded-xl border-2 border-border bg-background px-3 py-2 text-center text-sm font-bold outline-none focus:border-purple-500" />
            <div className="mt-4 flex gap-2">
              <button onClick={()=>setPicking(null)} className="flex-1 rounded-full bg-secondary px-4 py-2 text-sm font-bold"><T>取消</T></button>
              <button onClick={adopt} disabled={busy || !name.trim() || balance<picking.adopt_cost} className="flex-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-extrabold text-white shadow disabled:opacity-50">
                {busy ? t("领养中…") : <><T>花费</T> {picking.adopt_cost} ⭐</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DiaryTab({ diary }: { diary: Diary[] }) {
  const t = useT();
  const [ai, setAi] = useState<{ body_cn: string; highlights: string[]; pet_nickname?: string } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const { data } = await (supabase as any).from("pet_diaries")
          .select("body_cn,highlights,pet_nickname,diary_date")
          .order("diary_date", { ascending: false }).limit(1).maybeSingle();
        if (data) setAi(data);
      } catch {}
    })();
  }, []);
  const generate = async () => {
    setLoadingAi(true);
    try {
      const { data, error } = await supabase.functions.invoke("pet-diary", { body: {} });
      if (error) throw error;
      setAi((data as any).diary);
    } catch (e) { console.warn(e); }
    finally { setLoadingAi(false); }
  };
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500 p-5 text-white shadow-tile">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider opacity-90">🐾 AI <T>宠物日记 · 今日</T></div>
          <button onClick={generate} disabled={loadingAi} className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold backdrop-blur disabled:opacity-60">
            {loadingAi ? t("生成中…") : ai ? t("重新生成") : t("生成今日日记")}
          </button>
        </div>
        {ai ? (
          <>
            <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap"><T>{ai.body_cn}</T></p>
            {ai.highlights?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {ai.highlights.map((h, i) => <span key={i} className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold backdrop-blur"><T>{h}</T></span>)}
              </div>
            )}
            <div className="mt-2 flex justify-end">
              <ReportAIButton
                feature="pet_diary"
                contentSnippet={ai.body_cn}
                className="opacity-80"
              />
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm opacity-90"><T>点击生成今日日记，让宠物把今天的学习记下来 📝</T></p>
        )}
      </div>
      {diary.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-xs text-muted-foreground"><T>动态日记会显示在这里</T></div>
      ) : (
        <div className="space-y-2">
          {diary.map(d => (
            <div key={d.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
              <div className="text-2xl">{d.emoji || "📝"}</div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold"><T>{d.message}</T></div>
                <div className="text-[10px] text-muted-foreground">{new Date(d.created_at).toLocaleString("zh-CN")}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SkinTab({ active, species, skins, owned, balance, onAfter, flash }: any) {
  const [busy, setBusy] = useState<string | null>(null);
  if (!active) {
    return <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">先去领养一只宠物吧 🥚</div>;
  }
  const sp: Species | undefined = species[active.species_id];
  const ownedIds = new Set((owned as OwnedSkin[]).map(o => o.skin_id));
  const baseEmoji = petEmoji(active, sp);

  const buy = async (skin: Skin) => {
    setBusy(skin.id);
    const { data, error } = await (supabase as any).rpc("buy_pet_skin", { _skin_id: skin.id });
    setBusy(null);
    if (error) { flash("❌ " + error.message); return; }
    const r = data as any;
    if (!r?.ok) {
      flash(r?.reason === "not_enough" ? "💰 星币不够，再去学习赚一些吧！" : r?.reason === "already_owned" ? "已经拥有啦" : "❌ 购买失败");
      return;
    }
    flash(`🎉 解锁「${skin.name_cn}」皮肤！`);
    onAfter();
  };
  const equip = async (skin: Skin | null) => {
    setBusy(skin?.id || "off");
    const { data, error } = await (supabase as any).rpc("equip_pet_skin", { _pet_id: active.id, _skin_id: skin?.id ?? null });
    setBusy(null);
    if (error) { flash("❌ " + error.message); return; }
    const r = data as any;
    if (!r?.ok) {
      flash(r?.reason === "level_low" ? `⛔ 需要 Lv.${r.need_level} 才能装备` : r?.reason === "not_owned" ? "还未拥有该皮肤" : "❌ 装备失败");
      return;
    }
    flash(skin ? `✨ 已换上「${skin.name_cn}」` : "已恢复原色");
    onAfter();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-purple-100 to-pink-100 p-3 dark:from-purple-950/30 dark:to-pink-950/30">
        <div className="text-4xl" style={{ filter: (skins as Skin[]).find(s => s.id === active.equipped_skin_id)?.css_filter || "" }}>
          {baseEmoji}
        </div>
        <div className="flex-1 text-sm"><b>{active.nickname}</b> · Lv.{active.level}</div>
        <button onClick={()=>equip(null)} disabled={busy==="off" || !active.equipped_skin_id}
          className="rounded-full bg-secondary px-3 py-1 text-xs font-bold disabled:opacity-40">恢复原色</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {(skins as Skin[]).map(skin => {
          const isOwned = ownedIds.has(skin.id) || skin.price === 0;
          const isEquipped = active.equipped_skin_id === skin.id || (skin.code === "classic" && !active.equipped_skin_id);
          const levelOk = active.level >= skin.unlock_level;
          const canBuy = balance >= skin.price;
          return (
            <div key={skin.id} className={cn(
              "relative flex items-center gap-3 rounded-2xl border-2 bg-card p-3 transition",
              isEquipped ? "border-purple-500 shadow-md" : "border-border",
            )}>
              <div className="text-5xl" style={{ filter: skin.css_filter }}>{baseEmoji}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold">{skin.name_cn}</span>
                  {Array.from({length: skin.rarity}).map((_,i)=><Star key={i} className="size-3 fill-amber-500 text-amber-500" />)}
                </div>
                <div className="text-[11px] text-muted-foreground line-clamp-1">{skin.description_cn}</div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">需要 Lv.{skin.unlock_level}</div>
              </div>
              {isEquipped ? (
                <div className="shrink-0 rounded-full bg-purple-500 px-3 py-1 text-[10px] font-extrabold text-white shadow">已装备</div>
              ) : isOwned ? (
                <button onClick={()=>equip(skin)} disabled={busy===skin.id || !levelOk}
                  className={cn("shrink-0 rounded-full px-3 py-1.5 text-[11px] font-extrabold text-white shadow",
                    levelOk ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-muted-foreground/40")}>
                  {levelOk ? "装备" : `Lv.${skin.unlock_level}`}
                </button>
              ) : (
                <button onClick={()=>buy(skin)} disabled={busy===skin.id || !canBuy}
                  className={cn("flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-extrabold text-white shadow",
                    canBuy ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-muted-foreground/40")}>
                  <Coins className="size-3" /> {skin.price}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}