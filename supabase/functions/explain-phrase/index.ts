// Edge function: explain a single English word/phrase in context for Chinese learners.
// Returns cached result from `phrase_explanations` if present; otherwise calls the
// Lovable AI Gateway, stores it, and returns it.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

function normalize(s: string): string {
  // 先把弯撇号 U+2019 折成 ASCII '(否则 ain't/warn't 会被下面的 strip 断成 "ain t",永远查不中缓存)。
  return s.toLowerCase().replace(/’/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
}

// ── 图书馆点读词干回退(preferLight 专用)· 见下方 findStemReadV1 铁律 ──
// 排除集:词汇化/抽象名词复数、古今义复数、词性变体——回退到原形会显错义,宁"暂无"不误。
// 由通用「回读 ctx」闸门(拿单数卡释义配复数书中出处回读)+ 人工审共同产出,来源 scripts/library/books/fallback-gate/EXCLUDE.json。
const STEM_EXCLUDE = new Set(["goods","rights","works","waters","senses","thanks","arms","means","pains","stores","provisions","woods","hands","manners","spirits","irons","quarters","relations","airs","parts","effects","colours","sands","pieces","wits","grounds","forces","terms","papers","necessaries","remains","letters","customs","contents","heavens","spectacles","odds","looks","bounds","glasses","sweets","measures","expressions","counsels","sails","conditions","wells","stuffs","interests","seconds","attends","compasses","flags","rounds","staves","sweats","virtues","fevers","shoots","dainties","trades","tiles","wonders","contraries","springs","wills","judges","troops","mischiefs","spies","casts","wedges","impressions","stages","wrongs","returns","penitents","rushes","paces","wounds","shots","furies","husbands","legitimates","characters","ramblings","squares","crosses","fronts","sociables","states","bouts","drippings","wailings","watches","sayings","hurts"]);
// 不规则屈折映射(源形→原形)。仅在源形自身无卡(surface-first)且不在排除集时才可能触发。
const IRREG: Record<string, string> = {men:"man",women:"woman",children:"child",feet:"foot",teeth:"tooth",mice:"mouse",geese:"goose",oxen:"ox",lice:"louse",went:"go",gone:"go",took:"take",taken:"take",saw:"see",seen:"see",ate:"eat",eaten:"eat",spoke:"speak",spoken:"speak",gave:"give",given:"give",came:"come",ran:"run",knew:"know",known:"know",grew:"grow",grown:"grow",threw:"throw",thrown:"throw",drew:"draw",drawn:"draw",flew:"fly",flown:"fly",blew:"blow",blown:"blow",wrote:"write",written:"write",rose:"rise",risen:"rise",chose:"choose",chosen:"choose",broke:"break",broken:"break",stole:"steal",stolen:"steal",wore:"wear",worn:"wear",tore:"tear",torn:"tear",bore:"bear",borne:"bear",swore:"swear",sworn:"swear",drove:"drive",driven:"drive",dove:"dive",rode:"ride",ridden:"ride",hid:"hide",hidden:"hide",bit:"bite",bitten:"bite",fought:"fight",bought:"buy",brought:"bring",taught:"teach",caught:"catch",thought:"think",sought:"seek",sold:"sell",told:"tell",held:"hold",felt:"feel",kept:"keep",slept:"sleep",wept:"weep",crept:"creep",swept:"sweep",left:"leave",meant:"mean",dealt:"deal",built:"build",sent:"send",spent:"spend",bent:"bend",lent:"lend",lost:"lose",made:"make",said:"say",laid:"lay",paid:"pay",had:"have",did:"do",done:"do",got:"get",gotten:"get",sat:"sit",stood:"stand",understood:"understand",won:"win",began:"begin",begun:"begin",drank:"drink",drunk:"drink",sang:"sing",sung:"sing",rang:"ring",rung:"ring",swam:"swim",swum:"swim",sank:"sink",sunk:"sink",sprang:"spring",shrank:"shrink",struck:"strike",hung:"hang",dug:"dig",spun:"spin",stung:"sting",swung:"swing",clung:"cling",flung:"fling",wrung:"wring",stuck:"stick",shot:"shoot",lit:"light",fed:"feed",led:"lead",bled:"bleed",bred:"breed",sped:"speed",fled:"flee",met:"meet",read:"read",lay:"lie",lain:"lie",fell:"fall",fallen:"fall",froze:"freeze",frozen:"freeze",wound:"wind",bound:"bind",found:"find",ground:"grind",arose:"arise",arisen:"arise",bade:"bid",forbade:"forbid",forgave:"forgive",forgot:"forget",forgotten:"forget",mistook:"mistake",overcame:"overcome",undertook:"undertake",withdrew:"withdraw",wove:"weave",trod:"tread",dwelt:"dwell",knelt:"kneel",leapt:"leap",dreamt:"dream",burnt:"burn",learnt:"learn",spilt:"spill",spelt:"spell",smelt:"smell",leaves:"leaf",lives:"life",halves:"half",shelves:"shelf",thieves:"thief",loaves:"loaf",wives:"wife",knives:"knife",calves:"calf",wolves:"wolf",elves:"elf",selves:"self",hooves:"hoof",scarves:"scarf",dwarves:"dwarf",staves:"staff"};
// 规则剥离候选(最小剥离优先,长度护栏):不规则映射未命中时才用。
function stemCands(w: string): string[] {
  const o: string[] = [];
  if (w.length > 4 && w.endsWith("ies")) o.push(w.slice(0, -3) + "y", w.slice(0, -1), w.slice(0, -2));
  if (w.length > 4 && w.endsWith("es")) o.push(w.slice(0, -1), w.slice(0, -2));
  if (w.length > 5 && w.endsWith("ing")) o.push(w.slice(0, -3) + "e", w.slice(0, -3));
  if (w.length > 4 && w.endsWith("ed")) o.push(w.slice(0, -1), w.slice(0, -2) + "e", w.slice(0, -2));
  if (w.length >= 5 && w.endsWith("s") && !w.endsWith("ss")) o.push(w.slice(0, -1));
  return [...new Set(o)];
}

// Bump this when you change the AI prompt/schema so we re-generate explanations
// instead of returning stale cached versions.
const SCHEMA_VERSION = "zh-v2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { phrase, context, prefer } = await req.json();
    // prefer="light":图书馆精读点读用 → 先查 read-v1 轻卡、再查 zh-v2 重卡(修抢跑竞态:测试期先点生成的 zh-v2 会永久遮蔽后种的轻卡)。
    // 不传(美语课等)→ 仍 zh-v2 优先,行为 100% 不变。
    const preferLight = prefer === "light";
    if (!phrase || typeof phrase !== "string") {
      return new Response(JSON.stringify({ error: "phrase required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalized = normalize(phrase);
    if (!normalized) {
      return new Response(JSON.stringify({ error: "empty phrase" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 重卡(zh-v2)查找器:命中 → 返回重卡结构。
    const findZhV2 = async () => {
      const { data: cached } = await admin
        .from("phrase_explanations")
        .select("explanation")
        .eq("normalized", normalized)
        .eq("target_lang", SCHEMA_VERSION)
        .maybeSingle();
      return cached?.explanation ? { explanation: cached.explanation, cached: true } : null;
    };

    // 轻卡(read-v1)查找器:把轻 schema {word,pos,ipa,gloss_cn,example} 映射成前端 Explanation 兼容结构:
    //   gloss_cn→one_line_cn(🧠 一句话)、pos+ipa→pos(卡头)、example→📝 例句。
    //   重卡专属字段(literal/scene/replies/similar/tip)缺省 → LessonBody 各段有长度守卫,优雅降级。
    const findReadV1 = async () => {
      const { data: light } = await admin
        .from("phrase_explanations")
        .select("explanation")
        .eq("normalized", normalized)
        .eq("target_lang", "read-v1")
        .maybeSingle();
      // deno-lint-ignore no-explicit-any
      const lg = light?.explanation as any;
      if (lg && lg.gloss_cn) {
        const card = {
          phrase: lg.word || phrase,
          pos: [lg.pos, lg.ipa].filter(Boolean).join("  "),
          one_line_cn: lg.gloss_cn,
          // 语块卡「🔍 逐词」节(方案甲):存了 literal[] 就透传,LessonBody 有守卫,单词卡无此字段自然不渲染。
          literal: Array.isArray(lg.literal) && lg.literal.length ? lg.literal : undefined,
          // 多义卡:存了 senses[] 就透传,前端主义在上、其余折叠;单义卡无此字段按平铺 one_line_cn 渲染。
          senses: Array.isArray(lg.senses) && lg.senses.length ? lg.senses : undefined,
          example: lg.example && lg.example.en ? lg.example : undefined,
        };
        // proper:true(专名事实卡)→ 透传给前端隐藏收藏按钮(专名不该进收藏/复习)。
        return { explanation: card, cached: true, light: true, proper: !!lg.proper };
      }
      return null;
    };

    // 词干回退查找器(仅 preferLight):表面形查不到轻卡时,试还原到词典里已有的原形卡。
    // 铁律:①surface-first——只在 findReadV1(表面形)已 miss 后才进本函数,leaves/ground 等有卡的词前面就命中,永不被剥;
    //      ②排除集优先——词汇化/抽象复数(means/arms/staves…)直接放弃回退,宁"暂无"不显错卡;
    //      ③不规则映射先于规则剥离;④原形必须在库里(covLemma 命中),最坏=无卡,绝不凭空显错卡。
    const findStemReadV1 = async () => {
      if (STEM_EXCLUDE.has(normalized)) return null;
      const cands: string[] = [];
      const ir = IRREG[normalized];
      if (ir) cands.push(ir);
      for (const c of stemCands(normalized)) if (!cands.includes(c)) cands.push(c);
      for (const lemma of cands) {
        const { data: light } = await admin
          .from("phrase_explanations").select("explanation")
          .eq("normalized", lemma).eq("target_lang", "read-v1").maybeSingle();
        // deno-lint-ignore no-explicit-any
        const lg = light?.explanation as any;
        if (lg && lg.gloss_cn) {
          return {
            explanation: {
              phrase: lg.word || lemma,
              pos: [lg.pos, lg.ipa].filter(Boolean).join("  "),
              one_line_cn: lg.gloss_cn,
              literal: Array.isArray(lg.literal) && lg.literal.length ? lg.literal : undefined,
              senses: Array.isArray(lg.senses) && lg.senses.length ? lg.senses : undefined,
              example: lg.example && lg.example.en ? lg.example : undefined,
            },
            cached: true, light: true, stem: lemma,
          };
        }
      }
      return null;
    };

    // 命中顺序:preferLight(图书馆)→ 轻卡→重卡→词干回退;默认(美语课)→ 先重后轻(行为 100% 不变)。
    // 两者都是「已缓存命中即返回,都未命中才走下方」。
    const order = preferLight ? [findReadV1, findZhV2, findStemReadV1] : [findZhV2, findReadV1];
    for (const find of order) {
      const hit = await find();
      if (hit) {
        return new Response(JSON.stringify(hit), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 图书馆点读红线:preferLight 到这里 = 轻卡/重卡/词干回退全 miss。
    // 绝不实时 AI 生成(大陆 5-15s / 限流失败,会弹重卡格式),直接返回 not_found → 前端显"暂无解释"。补齐由逐书造卡完成。
    if (preferLight) {
      return new Response(JSON.stringify({ error: "not_found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) Ask Lovable AI Gateway
    const systemPrompt = `你是一位资深的、最受中国英语学习者欢迎的英文老师。你要把一个英文单词或短语讲成一节精炼的"小课",像下面这样的风格:

- 一句话总结这个短语在地道英语里到底是什么意思 (one_line_cn)
- 逐词拆解,告诉学生每个组成词的字面意思,以及在这个短语里的真正含义 (literal[]). 提醒易错点,例如 party 不是"派对"
- 描述这个短语最典型的使用场景,让学生看到画面 (scene_cn)
- 给出 2-4 个母语人士真正会说的英文回答 / 搭配回应,带中文 (replies[])
- 列出 1-3 个母语人士也常用的同义说法,带中文 (similar[])
- 给一个"小细节 / 高分点",学生看完能用上 (tip_cn)
- 配 1 个英文例句 + 中文翻译 (example)

严格按下面的 JSON 结构返回,不要 markdown 代码块,不要多余文字:
{
  "phrase": string,                              // 原短语
  "pos": string,                                 // 词性,例如 "phrase" / "verb" / "noun";没有就空字符串
  "one_line_cn": string,                         // 一句话翻译/解释
  "literal": [                                   // 逐词拆解
    { "word": string, "meaning_cn": string, "note_cn": string }   // note_cn 可以空字符串
  ],
  "scene_cn": string,                            // 典型使用场景,1-2 句,生动一点
  "replies": [                                   // 学生可以这样回答 / 这样接话
    { "en": string, "cn": string }
  ],
  "similar": [                                   // 同义/相近说法
    { "en": string, "cn": string }
  ],
  "tip_cn": string,                              // 1 句高分小细节,可空
  "example": { "en": string, "cn": string }      // 1 个完整例句
}

要求:
- 全部解释用中文,例句保持英文 + 中文翻译
- 内容要"地道、口语、面向中国学生",避免学术腔
- 如果是普通常见单词 (例如 "the" / "is"),literal 可以只有 1 个元素,replies 可以为空数组
- one_line_cn 必填,绝不能空`;

    const userPrompt = `请讲解这个英文短语/单词: "${phrase}"。${
      context ? `它出现在这句对话里: "${context}"。请结合这个上下文讲解。` : ""
    }`;

    const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("[explain-phrase] AI error", aiResp.status, errText);
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "rate_limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "credits_exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "ai_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // try to salvage
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    }
    if (!parsed || typeof parsed !== "object") {
      return new Response(JSON.stringify({ error: "bad_ai_response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3) Store in cache (best-effort)
    await admin
      .from("phrase_explanations")
      .upsert(
        {
          phrase,
          normalized,
          source_lang: "en",
          target_lang: SCHEMA_VERSION,
          explanation: parsed,
        },
        { onConflict: "normalized,target_lang" },
      );

    return new Response(JSON.stringify({ explanation: parsed, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[explain-phrase] error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});