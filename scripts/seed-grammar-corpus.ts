/**
 * Seed AI corpus for grammar points.
 * Usage:
 *   bun scripts/seed-grammar-corpus.ts --table gaokao --limit 5 --dry
 *   bun scripts/seed-grammar-corpus.ts --table gaokao --limit 5
 *   bun scripts/seed-grammar-corpus.ts --table gaokao        (full)
 *   bun scripts/seed-grammar-corpus.ts --table junior
 *
 * Reads PG* env vars + LOVABLE_API_KEY from environment.
 */
import { Client } from "pg";

const args = process.argv.slice(2);
const arg = (k: string, def?: string) => {
  const i = args.indexOf(`--${k}`);
  if (i === -1) return def;
  const v = args[i + 1];
  return v && !v.startsWith("--") ? v : "true";
};
const TABLE = arg("table", "gaokao")!; // gaokao | junior
const LIMIT = parseInt(arg("limit", "0")!, 10);
const DRY = arg("dry") === "true";
const MODEL = arg("model", "google/gemini-2.5-flash-lite")!;
const ONLY_MISSING = arg("only-missing", "true") === "true";

const KEY = process.env.LOVABLE_API_KEY!;
if (!KEY) throw new Error("LOVABLE_API_KEY missing");

const SYSTEM = `You are an expert English-as-a-Foreign-Language curriculum designer for Chinese students (CEFR A2-B2). 
You produce JSON learning content for ONE grammar point following Cambridge English Empower's Notice-Pattern-Use methodology, LingQ-style real corpus, and Monoxer-style adaptive drills.
Output MUST be valid JSON matching the schema. All English must be NATURAL, MODERN, and used by real native speakers (no textbook stiffness). Chinese explanations must be concise and clear.`;

const TOOL = {
  type: "function",
  function: {
    name: "emit_corpus",
    description: "Emit the AI learning corpus for one grammar point.",
    parameters: {
      type: "object",
      properties: {
        notice_pairs: {
          type: "array",
          description: "5 minimal-pair contrasts. Each shows ONE correct vs ONE wrong sentence in a real-life micro-scene. The grammar point being tested is the only difference.",
          items: {
            type: "object",
            properties: {
              scene: { type: "string", description: "Real-life scene in Chinese, e.g. '朋友圈晒咖啡' or '面试开场'" },
              correct: { type: "string" },
              wrong: { type: "string" },
              why_zh: { type: "string", description: "1-sentence Chinese explanation of why correct is right" },
            },
            required: ["scene", "correct", "wrong", "why_zh"],
            additionalProperties: false,
          },
        },
        pattern: {
          type: "object",
          description: "Pattern recognition step.",
          properties: {
            examples: {
              type: "array",
              description: "3 example sentences using the same structure",
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  highlight: { type: "string", description: "the exact substring to highlight inside text" },
                },
                required: ["text", "highlight"],
                additionalProperties: false,
              },
            },
            rule_oneliner_zh: { type: "string", description: "ONE Chinese sentence that captures the rule, plain language" },
            mnemonic_zh: { type: "string", description: "A memorable 口诀 in Chinese, MUST be <= 8 Chinese characters, punchy and rhythmic. NOT a full sentence." },
          },
          required: ["examples", "rule_oneliner_zh", "mnemonic_zh"],
          additionalProperties: false,
        },
        corpus_snippets: {
          type: "array",
          description: "5 SHORT real-style snippets (1-2 sentences each), each in a different register/style. The target structure must appear at least once in each.",
          items: {
            type: "object",
            properties: {
              style: { type: "string", enum: ["lyric", "tweet", "dialogue", "news", "novel"] },
              text: { type: "string" },
              target: { type: "string", description: "the exact substring containing the target structure" },
            },
            required: ["style", "text", "target"],
            additionalProperties: false,
          },
        },
        drill_pool: {
          type: "array",
          description: "12 practice items mixing 4 types and 3 difficulties (easy/medium/hard).",
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["mcq", "fill", "spot_error", "reorder"] },
              difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
              prompt: { type: "string", description: "Question stem. fill: use ___ for blank. spot_error: a sentence containing exactly ONE wrong word. reorder: tokens joined by ' / ' that MUST be RANDOMLY SHUFFLED (NOT in correct order — the user has to rearrange them)." },
              answer: { type: "string", description: "the correct answer (word, full sentence for reorder, or the wrong word for spot_error)" },
              options: {
                type: "array",
                description: "MCQ only: 4 options including the correct answer",
                items: { type: "string" },
              },
              explain_zh: { type: "string", description: "1-sentence Chinese explanation" },
            },
            required: ["type", "difficulty", "prompt", "answer", "explain_zh"],
            additionalProperties: false,
          },
        },
        chinglish_trap: {
          type: "object",
          description: "ONE typical Chinglish error Chinese students make on this point.",
          properties: {
            wrong: { type: "string" },
            right: { type: "string" },
            why_zh: { type: "string" },
          },
          required: ["wrong", "right", "why_zh"],
          additionalProperties: false,
        },
      },
      required: ["notice_pairs", "pattern", "corpus_snippets", "drill_pool", "chinglish_trap"],
      additionalProperties: false,
    },
  },
};

async function generate(point: { title: string; explanation?: string | null; typical_example?: string | null; common_mistake?: string | null }) {
  const userPrompt = `Grammar point: **${point.title}**
${point.explanation ? `Reference notes:\n${point.explanation}\n` : ""}
${point.typical_example ? `Typical example: ${point.typical_example}\n` : ""}
${point.common_mistake ? `Common mistake: ${point.common_mistake}\n` : ""}
Generate the full learning corpus JSON now.`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userPrompt },
      ],
      tools: [TOOL],
      tool_choice: { type: "function", function: { name: "emit_corpus" } },
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI ${res.status}: ${t.slice(0, 300)}`);
  }
  const j = await res.json();
  const call = j.choices?.[0]?.message?.tool_calls?.[0];
  if (!call) throw new Error("no tool call: " + JSON.stringify(j).slice(0, 300));
  return JSON.parse(call.function.arguments);
}

async function main() {
  const client = new Client({ ssl: { rejectUnauthorized: false } });
  await client.connect();

  const tableName = TABLE === "junior" ? "junior_grammar_points" : "gaokao_grammar_points";
  const cols =
    TABLE === "junior"
      ? "id, title, summary as explanation, NULL::text as typical_example, NULL::text as common_mistake"
      : "id, title, explanation, typical_example, common_mistake";
  const where = ONLY_MISSING ? "WHERE ai_corpus IS NULL" : "";
  const limitSql = LIMIT > 0 ? `LIMIT ${LIMIT}` : "";
  const sql = `SELECT ${cols} FROM ${tableName} ${where} ORDER BY sort_order ${limitSql}`;
  const { rows } = await client.query(sql);
  console.log(`📚 ${rows.length} points to process from ${tableName} (model=${MODEL}, dry=${DRY})`);

  let ok = 0, fail = 0;
  for (const row of rows) {
    process.stdout.write(`  ${row.title.slice(0, 30).padEnd(32)} `);
    try {
      const corpus = await generate(row);
      if (DRY) {
        console.log("✓ (dry)");
        console.log(JSON.stringify(corpus, null, 2));
      } else {
        await client.query(`UPDATE ${tableName} SET ai_corpus = $1 WHERE id = $2`, [corpus, row.id]);
        console.log("✓ saved");
      }
      ok++;
    } catch (e: any) {
      console.log("✗ " + (e?.message ?? e));
      fail++;
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  console.log(`\nDone. ok=${ok} fail=${fail}`);
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});