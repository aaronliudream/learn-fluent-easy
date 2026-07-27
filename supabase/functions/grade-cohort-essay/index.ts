/**
 * grade-cohort-essay — P2.1 graduation ceremony LLM grader.
 *
 * Grades a single learner-written sentence that uses words from the user's
 * active cohort. Refuses generic "rubber-stamp" feedback by hard-rejecting
 * banned phrases and re-prompting once. On schema-valid output, calls the
 * `submit_cohort_essay` RPC which atomically writes the essay row and flips
 * the cohort to `graduated`. The function runs as the calling user (anon key
 * + forwarded JWT) so RLS + RPC ownership checks stay enforced end-to-end.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const InputSchema = z.object({
  cohort_id: z.string().uuid(),
  sentence: z.string().min(1).max(1000),
  words_used: z.array(z.string().min(1)).min(1).max(20),
});

const ResponseSchema = z.object({
  strength: z.string().min(20),
  refinement: z.string().min(20),
  score: z.number().int().min(1).max(5),
});

const BANNED = [
  "很好", "不错", "加油", "继续努力", "再接再厉", "棒",
  "写得好", "通顺", "流畅",
  "词汇使用恰当", "句子流畅", "可以再练习一下",
];

function hasBanned(text: string): boolean {
  return BANNED.some((b) => text.includes(b));
}

// Defensive post-filter: LLM may still suggest swapping target words.
// If refinement matches any of these patterns, we treat it as invalid and retry once.
const REPLACE_RE = /换成|替代|改成.*更好|建议使用/;
function suggestsReplacement(text: string): boolean {
  return REPLACE_RE.test(text);
}

function buildPrompt(sentence: string, wordsWithGlosses: { word: string; gloss: string }[]) {
  const list = wordsWithGlosses.map((w) => `- ${w.word}: ${w.gloss || "(无释义)"}`).join("\n");
  return `你是一位严格但鼓励学生的高中英语老师。学生学完一批高考词汇后,用其中 ${wordsWithGlosses.length} 个词写了 1 个句子。给出 1 句具体的肯定 + 1 句具体的改进建议 + 1-5 分评分。

学生的句子:${sentence}

学生声称使用的词及其常用释义:
${list}

评分标准:
- 5 分:语法正确,词汇用法地道,句意清晰,有一定表达深度
- 4 分:语法正确,词汇用法基本得当,句意清晰
- 3 分:基本正确但有小问题(搭配/时态/介词等)
- 2 分:有明显错误但能看出在尝试运用词汇
- 1 分:大量错误或完全没用上声称的词

严格禁止使用以下橡皮图章式表达:
很好 / 不错 / 加油 / 继续努力 / 再接再厉 / 棒 / 写得好 / 通顺 / 流畅 / "词汇使用恰当" / "句子流畅" / "可以再练习一下"

关键约束:绝不要建议用户把 words_used 中的任何一个词换成别的词。这些词是学生刚学完的目标词,毕业仪式的目的就是让他们运用这些词。如果发现某个目标词在句中用得别扭(如搭配不自然、语境不合),refinement 应该建议:
- 调整该词周围的搭配(介词、形容词、补语)
- 调整句式结构让该词更自然地嵌入
- 调整语境让该词的语义更贴合
而绝不是"换成另一个词"。

反例(本约束下禁止):
- "建议把 advance 换成 improve" ← 错,advance 是目标词
- "用 great 替代 nice 会更好" ← 错,nice 是目标词

正例(在本约束下正确):
- "advance 搭配 system 时,可以改成 advance the development of our reading system,让 advance 的'推进'语义更顺畅"
- "advance 用于抽象推进时更自然,这里可以改成 advance the reform of our reading system,把宾语从具体的 system 改成更抽象的 reform"

strength 和 refinement 必须各包含一个具体的、可指认的细节(哪个词、哪个搭配、哪个语境),并且各自至少 20 个汉字。

反例(绝对不要输出):
- strength: "词汇使用恰当" ← 不具体
- refinement: "可以再练习一下" ← 不具体

正例(必须像这样具体):
- strength: "address 作为动词搭配 urgent issue,准确表达了'紧急处理'的语义,比用 solve 更贴近正式语境"
- refinement: "句子结构稍单一,可以尝试用 having addressed... 的分词结构开头,让 nevertheless 的转折感更突出"

按以下 JSON schema 输出,不要任何额外文字或 markdown 围栏:
{"strength": string, "refinement": string, "score": 1|2|3|4|5}`;
}

async function callLLM(apiKey: string, prompt: string, retryHint?: string): Promise<unknown> {
  const messages = [{ role: "user", content: retryHint ? `${prompt}\n\n上一次输出不合格,原因:${retryHint}。请严格重新输出。` : prompt }];
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" },
    }),
  });
  if (!resp.ok) {
    throw new Error(`llm_http_${resp.status}: ${await resp.text()}`);
  }
  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(content);
}

function validateGrading(raw: unknown): { ok: true; data: z.infer<typeof ResponseSchema> } | { ok: false; reason: string } {
  const parsed = ResponseSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, reason: `schema 不匹配:${parsed.error.issues.map((i) => i.path.join(".") + " " + i.message).join("; ")}` };
  }
  if (hasBanned(parsed.data.strength)) {
    return { ok: false, reason: "strength 包含禁用的橡皮图章式表达" };
  }
  if (hasBanned(parsed.data.refinement)) {
    return { ok: false, reason: "refinement 包含禁用的橡皮图章式表达" };
  }
  if (suggestsReplacement(parsed.data.refinement)) {
    return { ok: false, reason: "refinement 建议替换目标词,违反 cohort 约束" };
  }
  return { ok: true, data: parsed.data };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "unauthenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => null);
    const inputParsed = InputSchema.safeParse(body);
    if (!inputParsed.success) {
      return new Response(JSON.stringify({ error: "invalid_input", details: inputParsed.error.flatten() }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { cohort_id, sentence, words_used } = inputParsed.data;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    // 1. Verify cohort + ownership via RLS
    const { data: cohort, error: cohortErr } = await supabase
      .from("gaokao_user_active_cohort")
      .select("id, cohort_word_ids, status")
      .eq("id", cohort_id)
      .maybeSingle();

    if (cohortErr) {
      return new Response(JSON.stringify({ error: "db_error", details: cohortErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!cohort || cohort.status !== "active") {
      return new Response(JSON.stringify({ error: "cohort_not_active_or_not_owned" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate words_used ⊆ cohort_word_ids (RPC will re-check, but fail fast)
    const cohortIdSet = new Set<string>(cohort.cohort_word_ids ?? []);
    if (!words_used.every((w) => cohortIdSet.has(w))) {
      return new Response(JSON.stringify({ error: "words_not_in_cohort" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Fetch glosses for words_used
    const { data: vocabRows, error: vocabErr } = await supabase
      .from("gaokao_vocab")
      .select("id, word, primary_gloss")
      .in("id", words_used);

    if (vocabErr) {
      return new Response(JSON.stringify({ error: "vocab_lookup_failed", details: vocabErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const wordsWithGlosses = (vocabRows ?? []).map((r) => ({
      word: r.word as string,
      gloss: (r.primary_gloss as string) ?? "",
    }));

    // 3. Call LLM with retry-once on schema/banned-phrase failure
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "ai_not_configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = buildPrompt(sentence, wordsWithGlosses);
    let validated: ReturnType<typeof validateGrading> | null = null;
    let lastReason = "";
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const raw = await callLLM(apiKey, prompt, attempt === 0 ? undefined : lastReason);
        validated = validateGrading(raw);
        if (validated.ok) break;
        lastReason = validated.reason;
      } catch (e) {
        lastReason = String(e);
      }
    }

    if (!validated || !validated.ok) {
      return new Response(
        JSON.stringify({ error: "llm_grading_failed", reason: lastReason }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 4. Submit via RPC (atomic: insert essay + graduate cohort)
    const { data: essayId, error: rpcErr } = await supabase.rpc("submit_cohort_essay", {
      p_cohort_id: cohort_id,
      p_sentence: sentence,
      p_words_used: words_used,
      p_strength: validated.data.strength,
      p_refinement: validated.data.refinement,
      p_score: validated.data.score,
    });

    if (rpcErr) {
      return new Response(
        JSON.stringify({ error: "rpc_failed", details: rpcErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        strength: validated.data.strength,
        refinement: validated.data.refinement,
        score: validated.data.score,
        essay_id: essayId,
        graduated: true,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: "internal", details: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});