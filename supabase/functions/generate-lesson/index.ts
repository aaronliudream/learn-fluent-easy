import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReqBody {
  title: string;
  levelName?: string;
  unitTitle?: string;
  /** Lower-case English words that already appeared in earlier lessons.
   *  The AI must avoid reusing these as new vocab entries. */
  priorWords?: string[];
  /** When the lesson has hand-authored reading/vocab from the curriculum,
   *  the frontend passes them here so quiz / fillBlanks / listening /
   *  expressions / output are all generated AGAINST that exact text — not
   *  AI-invented reading that the learner never sees. */
  authoredReading?: { en: string; cn: string }[];
  authoredVocab?: { word: string; pron?: string; meaning: string; example?: string; example_cn?: string }[];
}

const lessonSchema = {
  type: "object",
  properties: {
    vocab: {
      type: "array",
      minItems: 6,
      maxItems: 8,
      items: {
        type: "object",
        properties: {
          word: { type: "string" },
          pron: { type: "string", description: "IPA in /…/" },
          meaning: { type: "string", description: "中文释义, 含词性" },
          example: { type: "string" },
          example_cn: { type: "string" },
        },
        required: ["word", "pron", "meaning", "example", "example_cn"],
        additionalProperties: false,
      },
    },
    reading: {
      type: "array",
      minItems: 4,
      maxItems: 5,
      items: {
        type: "object",
        properties: {
          en: { type: "string" },
          cn: { type: "string" },
        },
        required: ["en", "cn"],
        additionalProperties: false,
      },
    },
    grammar: {
      type: "array",
      minItems: 2,
      maxItems: 3,
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          explain: { type: "string", description: "中文讲解" },
          examples: {
            type: "array",
            minItems: 2,
            maxItems: 3,
            items: {
              type: "object",
              properties: {
                en: { type: "string" },
                cn: { type: "string" },
              },
              required: ["en", "cn"],
              additionalProperties: false,
            },
          },
        },
        required: ["title", "explain", "examples"],
        additionalProperties: false,
      },
    },
    expressions: {
      type: "array",
      minItems: 5,
      maxItems: 6,
      items: {
        type: "object",
        properties: {
          en: { type: "string" },
          cn: { type: "string" },
          scene: { type: "string", description: "中文场景标签, 4-6 字" },
        },
        required: ["en", "cn", "scene"],
        additionalProperties: false,
      },
    },
    fillBlanks: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: {
        type: "object",
        properties: {
          sentence: { type: "string", description: "Use ___ for the blank" },
          cn: { type: "string" },
          options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
          answer: { type: "string", description: "Must be one of options" },
        },
        required: ["sentence", "cn", "options", "answer"],
        additionalProperties: false,
      },
    },
    quiz: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: {
        type: "object",
        properties: {
          q: { type: "string", description: "English question about the reading" },
          options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
          answer: { type: "number", description: "0-based index of correct option" },
        },
        required: ["q", "options", "answer"],
        additionalProperties: false,
      },
    },
    listening: {
      type: "object",
      properties: {
        audio: { type: "string", description: "Short paragraph (2-4 sentences) to read aloud" },
        blanks: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          items: {
            type: "object",
            properties: {
              before: { type: "string" },
              answer: { type: "string", description: "Single word from the audio" },
              after: { type: "string" },
            },
            required: ["before", "answer", "after"],
            additionalProperties: false,
          },
        },
      },
      required: ["audio", "blanks"],
      additionalProperties: false,
    },
    output: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "English writing task" },
        cn: { type: "string", description: "中文说明" },
        sample: { type: "string", description: "范文 3-5 句, 自然口语" },
      },
      required: ["prompt", "cn", "sample"],
      additionalProperties: false,
    },
  },
  required: ["vocab", "reading", "grammar", "expressions", "fillBlanks", "quiz", "listening", "output"],
  additionalProperties: false,
};

const sanitizeUnsupportedNarratorNames = (content: unknown) => {
  const lesson = content as { reading?: { en?: string }[] };
  const readingText = Array.isArray(lesson.reading)
    ? lesson.reading.map((r) => r?.en ?? "").join(" ")
    : "";
  if (/\bAnna\b/.test(readingText)) return content;

  const replacement = /\b(I|me|my|mine|we|us|our|ours)\b/i.test(readingText) ? "the author" : "the text";
  const walk = (value: unknown): unknown => {
    if (typeof value === "string") return value.replace(/\bAnna\b/g, replacement);
    if (Array.isArray(value)) return value.map(walk);
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, walk(item)]),
      );
    }
    return value;
  };

  return walk(content);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, levelName, unitTitle, priorWords, authoredReading, authoredVocab }: ReqBody = await req.json();
    if (!title) {
      return new Response(JSON.stringify({ error: "Missing title" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const system = `你是一位资深英语教材作者, 专为中文母语成人学习者设计课程。
根据课程标题, 生成完整的一节英语课内容: 词汇、阅读、语法、实用表达、选词填空、阅读测验、听力填空、写作任务。

【极其重要 — 主题一致性】
- 课程标题通常包含一个英文主句 (例如 "I'd like a coffee.") 和一个中文场景说明 (例如 "梅在寄宿家庭的第一个早晨")。
- 你必须先识别出这节课的【核心场景】 (咖啡店点单 / 机场求助 / 看医生 / 打电话 等) 和【核心句型】 (即标题里的那句英文)。
- 全部 8 个板块 (vocab / reading / grammar / expressions / fillBlanks / quiz / listening / output) 都必须紧紧围绕这个场景和句型展开:
  * vocab: 选取这个场景下最常用的 6-8 个词
  * reading: 写一段发生在这个场景里的小故事或对话, 主人公就是中文说明里出现的人物 (如"梅")
  * grammar: 必须包含标题里那个核心句型 (如 "I'd like ..."), 给出讲解和例句
  * expressions: 全部是这个场景里会用到的实用句, 不要出现"Can I ask a question?"这种泛课堂用语 (除非课程本身就是关于课堂)
  * fillBlanks / quiz / listening / output: 全部围绕本课词汇与场景, 例句、问题、听力短文都要发生在这个场景里
- 严禁生成与场景无关的通用学英语内容。如果标题是"我想要一杯咖啡", 那 8 个板块全都应该发生在咖啡店 / 早餐 / 点单的语境里。

【★ 顶层硬性规则 — 严禁编造人名 ★】
这是最高优先级规则, 优先于一切其他要求。生成任何一个板块前都必须先做"人名核对":
1. 先把 reading 写完, 然后把 reading 里出现的所有【真实人名】列一遍 (例如 reading 里只写了 "I went to..." 没有任何具体姓名, 那名单就是【空】; 如果 reading 写了 "Mei said to Tom", 那名单就是 {Mei, Tom})。
2. 在 vocab.example / grammar.examples / expressions / fillBlanks.sentence / quiz.q / quiz.options / listening.audio / output.sample 任何位置, 出现的人名只能来自上一步的名单, 一个字都不能多。
3. 如果 reading 是第一人称 ("I" / "my" / "we") 且没出现任何具体姓名, 那么后面所有板块在指代叙述者时, 必须使用 the author / the writer / the narrator / the speaker / the person 之一, 绝对不允许编造 "Anna / Sarah / John / Lisa / Emma / Mike" 等任何名字, 哪怕只用一次。
4. 违反此规则视为本次生成完全失败。生成 quiz 第一题前, 请先在心里复述一遍 reading 里的人名名单, 确认本题没有引入名单外的名字。

其他要求:
- 所有英文必须真实自然 (美式英语)
- 难度匹配 LEVEL (Level 1=A1, Level 2=A2, Level 3=B1, 以此类推)
- 难度匹配 LEVEL: Level 1=CEFR A1, Level 2=A2, Level 3=B1, Level 4=B2, Level 5=C1, Level 6=C2
- 【Level 5 = C1 高级】生成 Level 5 课程时, 必须遵守:
  * reading 长度 5 句, 每句更长更复杂 (平均 18-28 词), 大量使用从句、分词结构、名词化、衔接副词 (nevertheless / consequently / albeit / whereas / insofar as ...)
  * 话题为成人 C1 级别: 职场策略、谈判、跨文化沟通、学术阅读、新闻评论、社会议题、伦理思辨、科技与社会, 不要再用"梅在咖啡店"这种 A1 生活场景
  * 主人公可以是新设定的成年人物 (职场人士、记者、学者、咨询师等), 不必延续 Level 1-4 的"梅"故事线
  * vocab 选取 C1 级别的低频实词 / 学术词 / 地道搭配 (例如 ramifications, inadvertent, nuanced, scrutinize, untenable, in tandem with), 避免再收 B2 以下词
  * grammar 必须聚焦 C1 高阶结构: 倒装、分裂句 (cleft / it-cleft / wh-cleft)、虚拟语气进阶 (had it not been for / were it not for)、名词化、缩减关系从句、独立分词结构、混合条件、模糊与让步副词、报告动词的细分
  * expressions 必须是 C1 级别的地道句式 (hedging / 委婉断言 / 学术表达 / 商业谈判常用句), 而非寒暄
  * quiz 4 题中至少 1 题考"作者态度 / 推断 / 言外之意", 不只考事实
  * output.sample 范文应是连贯的小议论 / 评述 / 邮件 / 摘要, 不是简单叙述
- 中文翻译/释义准确口语化
- fillBlanks 中 answer 必须是 options 之一; quiz 的 answer 必须是 0-3 的索引
- listening.audio 应能直接朗读 (2-4 句, 围绕本课场景)
- 【阅读测验 quiz — 极其重要】quiz 的 4 道题必须严格基于本课 reading 数组的内容来出, 每道题都要满足:
  * 问题 (q) 问的事实、人物、动作、原因、细节, 必须能在 reading 的某一句里直接找到答案, 不得引入 reading 中没有的人名、地点或情节 (例如 reading 里没有 Sarah, 就不能问 "What did Sarah ...")
  * 4 个 options 中只有 answer 索引对应的那一个是 reading 真正支持的, 其余 3 个干扰项必须是合理但与 reading 不符的内容
  * 严禁出现 reading 中从未提到的专有名词、数字、地点
  * 出题前先在心里逐句回看 reading, 确保每题都能指向 reading 里具体的一句
  * 【严禁编造人名 — 极其重要】不得在 quiz 的 q 或 options 里凭空给出 reading 中不存在的人名 (例如 reading 是第一人称 "I" 叙述, 没出现任何具体姓名, 那就绝对不能写 "What does Anna say...", "According to Sarah..." 之类)。在引用叙述者时, 一律使用 the author / the writer / the narrator / the speaker; 只有当 reading 里明确出现了某个人名 (如 Tom, Mei) 时, quiz 才可以使用那个名字
  * 同理, fillBlanks.sentence、listening.audio、output.sample、expressions 中也严禁引入 reading 中没有出现过的人名
- 【语法重点 grammar — 极其重要】grammar 数组里每一个语法点的 examples 句子必须满足:
  * 每一句 en 都必须【一字不差地、原样出现】在本课 reading 数组的某一句中 (允许是 reading 段落里的一个完整句子, 不允许改写或拼接)
  * 严禁自己另外造句作为 examples; 若某个语法点在 reading 里找不到至少 2 个对应例句, 请换一个能在 reading 中找到例句的语法点 (如核心句型 / 时态 / 从句结构)
  * cn 翻译要与 reading 同一句的中文意思一致
  * 在生成 grammar 之前, 请先把 reading 全文在心里过一遍, 挑出最具有教学价值的句子, 然后围绕这些句子归纳语法点
- 【听力填空 — 极其重要】blanks 的 3 个 answer 必须是【本课 vocab 列表里的核心新词】, 每个 answer 都要满足:
  * 是 vocab 数组里出现过的单词 (大小写不敏感, 可以是其单复数 / 时态变化)
  * 必须真实出现在 listening.audio 文本中
  * 严禁挖空人名 (Tom, Mei, Sarah ...)、代词 (I, you, my ...)、be 动词 / 冠词 / 介词等功能词
  * 必须是学习者本课要掌握的实词 (名词 / 动词 / 形容词)
- fillBlanks 同理: answer 也必须来自本课 vocab, 不要挖空人名或功能词

【全局硬性约束 — 词汇封闭性, 极其重要】
本课所有英文内容 (vocab.example / reading / grammar.examples / expressions / fillBlanks.sentence / quiz.q+options / listening.audio / output.sample) 中出现的每一个英文【实词】 (名词 / 动词 / 形容词 / 副词 / 实义短语), 都必须满足以下二选一:
  (a) 出自本课 vocab 数组里收录的新词 (含其单复数 / 时态 / 派生形式), 或
  (b) 出自上面"已经学过的单词列表" priorWords (含其变形)。
严禁引入任何既不在本课 vocab、也不在 priorWords 里的英文新词。功能词 (the, a, is, of, to, and, I, you 等最基础的虚词) 与人名 / 地名 / 数字不在此限制内, 但人名地名应尽量复用 reading 里已经出现的。

各板块附加要求:
  * vocab.example: 必须是 reading 数组里出现过的【原句】或其中一个完整句, 用来展示这个词在课文里的真实用法; cn 与 reading 同句中文一致。严禁为了造例句而引入新词。
  * expressions: 5-6 条实用表达, 每一条 en 都必须是 reading 里出现的【原句】(可以是对话里某一句完整句子)。如果 reading 里完整可用句子不足 5 句, 就把 expressions 减少到与 reading 句数匹配, 但宁缺毋滥, 绝不自己造句。
  * fillBlanks.sentence: 必须是 reading 里的某句【原句】, 把其中一个本课 vocab 词换成 ___; cn 是这句的中文; options 4 个里 3 个干扰项也必须是本课 vocab 或 priorWords 中的真实单词, 不得自创新词。
  * quiz.q 与 options: 问题与选项中出现的英文实词都必须来自 reading + vocab + priorWords 范围, 不得引入新词或新人名。
  * listening.audio: 直接从 reading 数组里挑选 2-4 个连续句子拼接而成, 不得改写、不得新增句子。这样能保证学生听到的就是刚学过的内容。blanks 的 answer 仍必须是本课 vocab 中的实词。
  * output.sample: 写作范文 3-5 句, 句子里所有英文实词必须来自本课 vocab + priorWords, 严禁引入新词; 鼓励直接复用 reading / expressions 里出现的句型。

生成顺序建议: 先确定 reading → 再据此挑 vocab (reading 里的新实词) → grammar / expressions / fillBlanks 全部从 reading 中"挑句子" → quiz 围绕 reading 出题 → listening 直接从 reading 抽连续句子 → output.sample 仅使用已学词重组。
严格按照 tool 的 JSON schema 输出, 不要输出额外文字。`;

    const priorList = Array.isArray(priorWords) && priorWords.length > 0
      ? priorWords.slice(0, 600).join(", ")
      : "(无)";

    const hasAuthored =
      Array.isArray(authoredReading) && authoredReading.length > 0 &&
      Array.isArray(authoredVocab) && authoredVocab.length > 0;

    const authoredBlock = hasAuthored
      ? `\n\n【★ 本课已有【固定的】课文与词汇 — 必须严格使用 ★】\n这节课的【课文 reading】和【词汇 vocab】是教材已经写好的, 学生在 App 里看到的就是下面这两段内容。你生成的 quiz / fillBlanks / listening / expressions / output / grammar.examples 必须 100% 基于下面这段课文和词汇来出, 严禁使用其他课文或编造新课文。\n\n— 固定课文 reading (按顺序的句子) —\n${authoredReading!.map((r, i) => `${i + 1}. ${r.en}\n   中文: ${r.cn}`).join("\n")}\n\n— 固定词汇 vocab (本课要考察的词) —\n${authoredVocab!.map((v, i) => `${i + 1}. ${v.word} — ${v.meaning}`).join("\n")}\n\n你必须照原样把上面的 reading 和 vocab 放回 reading / vocab 字段 (en/cn 或 word/meaning 一字不差), 然后基于它们生成其他板块。重申:\n  * quiz 4 题的答案必须能在上面这段 reading 中直接找到, 问题与选项中的英文实词只能来自 reading + vocab + priorWords; 严禁引入 reading 中没有的人名 / 地点 / 情节。\n  * fillBlanks.sentence 必须是上面 reading 里的【原句】, 把其中一个 vocab 词换成 ___。\n  * expressions 5-6 条全部从上面 reading 里挑【原句】, 不准自己造。\n  * listening.audio 必须直接拼接上面 reading 数组里 2-4 个连续句子, 不得改写。blanks 的 answer 必须是 vocab 里的词且真实出现在 audio 中。\n  * grammar.examples 中每一句 en 都必须一字不差出现在上面 reading 中。\n  * output.sample 范文里的英文实词必须来自上面 vocab + priorWords。\n如有任何一处偏离上面这段固定课文, 视为本次生成失败。`
      : "";

    const user = `课程标题: ${title}
级别: ${levelName ?? "(未提供)"}
单元: ${unitTitle ?? "(未提供)"}

【已经学过的单词列表 — 请勿再放进 vocab】
${priorList}${authoredBlock}

请先在心里确认本课的核心场景与核心句型, 然后让 8 个板块全部围绕它展开, 生成完整教学内容。

【vocab 选词规则 — 极其重要】
- vocab 数组里 6-8 个词, 必须全部是上面"已经学过的单词列表"中【没有出现过】的新词 (大小写、单复数、时态变化都视作同一个词)。
- 优先选取 reading 段落里出现的、对学习者来说是【真正陌生】的核心实词 (名词 / 动词 / 形容词 / 短语)。
- 如果某个本来很想收的词已经在 priorWords 中, 请换成 reading 里另一个新词, 而不是再收一遍。
- 严禁把 I, you, the, is, can, go 等基础功能词或已学过的词当作"新词"再收一次。`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "emit_lesson",
              description: "Emit the full structured lesson content",
              parameters: lessonSchema,
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "emit_lesson" } },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "请求过于频繁，请稍后再试" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "AI 额度已用完，请补充后再试" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    let parsed: unknown = null;
    if (args) {
      try {
        parsed = typeof args === "string" ? JSON.parse(args) : args;
      } catch (_e) {
        parsed = null;
      }
    }
    if (!parsed) {
      return new Response(JSON.stringify({ error: "AI 返回格式异常" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sanitized = sanitizeUnsupportedNarratorNames(parsed);

    return new Response(JSON.stringify(sanitized), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-lesson error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});