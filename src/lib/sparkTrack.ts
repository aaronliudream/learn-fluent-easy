// Spark behavior research tracking.
//
// Philosophy: we're studying "why kids form a relationship with AI",
// not building a chat app. Capture EMOTIONAL signals (engagement quality),
// not just clicks. Always fire-and-forget — never block the chat UI.
// Always include rich CONTEXT — raw events are worthless without it.

import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "spark.session.v1";
const SESSION_TTL_MS = 30 * 60 * 1000; // 30min idle = new session

type Sess = { id: string; startedAt: number; lastAt: number; turnCount: number };

function loadSess(): Sess | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Sess;
    if (Date.now() - s.lastAt > SESSION_TTL_MS) return null;
    return s;
  } catch { return null; }
}

function saveSess(s: Sess) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch { /* noop */ }
}

export function getSession(): Sess {
  let s = loadSess();
  if (!s) {
    s = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      startedAt: Date.now(),
      lastAt: Date.now(),
      turnCount: 0,
    };
    saveSess(s);
  }
  return s;
}

export function bumpTurn(): number {
  const s = getSession();
  s.turnCount += 1;
  s.lastAt = Date.now();
  saveSess(s);
  return s.turnCount;
}

export function sessionDurationSec(): number {
  const s = getSession();
  return Math.round((Date.now() - s.startedAt) / 1000);
}

// --- Local topic classifier (zero AI cost) ---
// Narrow on purpose — we want HIGH-CONFIDENCE matches so later analysis is honest.
const TOPICS: Record<string, RegExp> = {
  animal: /\b(dog|cat|bird|fish|rabbit|tiger|lion|panda|horse|cow|pig|sheep|monkey|elephant|bear|duck|chicken|frog|mouse|snake|animal)s?\b|狗|猫|鸟|鱼|兔|老虎|狮|熊猫|马|牛|猪|羊|猴|象|熊|鸭|鸡|青蛙|鼠|蛇|动物/i,
  color:  /\b(red|blue|green|yellow|pink|purple|orange|black|white|brown|colou?r)s?\b|红|蓝|绿|黄|粉|紫|橙|黑|白|棕|颜色/i,
  food:   /\b(apple|banana|pizza|rice|noodle|bread|milk|water|juice|cake|candy|chocolate|ice ?cream|food|eat|hungry|yummy)s?\b|苹果|香蕉|披萨|米饭|面|面包|牛奶|水|果汁|蛋糕|糖|巧克力|冰淇淋|吃|饿|好吃/i,
  joke:   /\b(joke|funny|haha|lol|laugh|silly)\b|笑话|搞笑|哈哈|有趣/i,
  family: /\b(mom|mum|dad|mother|father|brother|sister|grandma|grandpa|family)\b|妈妈|爸爸|哥|姐|弟|妹|奶奶|爷爷|外婆|外公|家人/i,
  school: /\b(school|teacher|classmate|homework|class|student)\b|学校|老师|同学|作业|班|学生/i,
  game:   /\b(game|play|toy|fun|minecraft|roblox)\b|游戏|玩|玩具/i,
  greet:  /\b(hi|hello|hey|bye|goodbye|good ?morning|good ?night)\b|你好|嗨|拜拜|早上好|晚安/i,
};

export function classifyTopic(text: string): string {
  for (const [topic, re] of Object.entries(TOPICS)) {
    if (re.test(text)) return topic;
  }
  return "other";
}

// "en" / "zh" / "mixed" / "empty" — does the kid dare to use English?
export function detectLang(text: string): "en" | "zh" | "mixed" | "empty" {
  const t = text.trim();
  if (!t) return "empty";
  const hasZh = /[\u4e00-\u9fff]/.test(t);
  const hasEn = /[a-zA-Z]/.test(t);
  if (hasZh && hasEn) return "mixed";
  if (hasZh) return "zh";
  if (hasEn) return "en";
  return "empty";
}

// --- Fire-and-forget event sender ---
// CRITICAL: this MUST never throw or block. UX > telemetry.
export function track(event: string, context: Record<string, unknown> = {}): void {
  const sess = getSession();
  void (async () => {
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id ?? null;
      const isReturn = !!localStorage.getItem("spark.has_visited");
      try { localStorage.setItem("spark.has_visited", "1"); } catch { /* noop */ }
      const enriched = {
        ...context,
        session_duration_sec: sessionDurationSec(),
        turn_count: sess.turnCount,
        viewport: typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : null,
        is_return_visit: isReturn,
      };
      await supabase.from("spark_events").insert({
        user_id: uid,
        session_id: sess.id,
        event,
        context: enriched,
      });
    } catch {
      // Telemetry failures must never disrupt the kid's chat
    }
  })();
}