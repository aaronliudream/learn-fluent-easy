// =====================================================================
// Independent CEFR-aligned placement test bank.
// Six difficulty tiers (A1, A2, B1, B2, C1, C2) × four sections.
// Each question is unique (no duplicates across tiers/sections).
// Used by src/lib/placement.ts to drive an adaptive 24-question test.
// =====================================================================

export type BankSection = "vocab" | "grammar" | "reading" | "listening";
export type CEFRTier = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type BankQuestion = {
  id: string;
  section: BankSection;
  tier: CEFRTier;
  prompt: string;
  context?: string; // reading passage or listening script
  options: string[];
  answer: number; // index in options
  explain?: string;
};

// Internal helper to build a question with a stable id
const Q = (
  id: string,
  section: BankSection,
  tier: CEFRTier,
  prompt: string,
  options: string[],
  answer: number,
  extras: { context?: string; explain?: string } = {},
): BankQuestion => ({ id, section, tier, prompt, options, answer, ...extras });

// ---------------------------------------------------------------------
// VOCAB — word/phrase meaning, synonyms, collocations
// ---------------------------------------------------------------------
const VOCAB: BankQuestion[] = [
  // A1
  Q("v-a1-1", "vocab", "A1", "“apple” 的中文意思是？", ["香蕉", "苹果", "橙子", "葡萄"], 1),
  Q("v-a1-2", "vocab", "A1", "Choose the correct word: I drink ___ every morning.", ["water", "chair", "book", "shoe"], 0),
  Q("v-a1-3", "vocab", "A1", "“brother” 指的是？", ["姐妹", "兄弟", "父亲", "叔叔"], 1),
  Q("v-a1-4", "vocab", "A1", "Which word means “红色”?", ["blue", "green", "red", "yellow"], 2),
  Q("v-a1-5", "vocab", "A1", "“Monday” 的意思是？", ["星期一", "星期二", "星期天", "星期五"], 0),
  // A2
  Q("v-a2-1", "vocab", "A2", "“cheap” 的反义词是？", ["expensive", "fast", "small", "easy"], 0),
  Q("v-a2-2", "vocab", "A2", "Choose the best word: She is very ___ at math.", ["good", "well", "much", "many"], 0),
  Q("v-a2-3", "vocab", "A2", "“borrow” 的意思是？", ["借出", "借入", "购买", "归还"], 1),
  Q("v-a2-4", "vocab", "A2", "Which is closest in meaning to “begin”?", ["finish", "stop", "start", "wait"], 2),
  Q("v-a2-5", "vocab", "A2", "“weekend” 指的是？", ["工作日", "周末", "假期", "节日"], 1),
  // B1
  Q("v-b1-1", "vocab", "B1", "Choose the closest meaning of “to postpone”.", ["to cancel", "to delay", "to repeat", "to hurry"], 1),
  Q("v-b1-2", "vocab", "B1", "“She’s a reliable colleague.” 中 reliable 最接近？", ["懒惰的", "可靠的", "勇敢的", "幽默的"], 1),
  Q("v-b1-3", "vocab", "B1", "Which word fits: We need to ___ a decision quickly.", ["do", "make", "take", "have"], 1),
  Q("v-b1-4", "vocab", "B1", "“He apologized for his mistake.” apologize 意为？", ["责备", "道歉", "解释", "感谢"], 1),
  Q("v-b1-5", "vocab", "B1", "Best synonym of “enormous”?", ["tiny", "huge", "narrow", "round"], 1),
  // B2
  Q("v-b2-1", "vocab", "B2", "Closest meaning of “to alleviate (pain)”?", ["to increase", "to relieve", "to ignore", "to hide"], 1),
  Q("v-b2-2", "vocab", "B2", "Which collocation is correct?", ["take into account", "take in account", "take on account", "take account in"], 0),
  Q("v-b2-3", "vocab", "B2", "“The evidence is compelling.” compelling 最接近？", ["可疑的", "令人信服的", "无聊的", "复杂的"], 1),
  Q("v-b2-4", "vocab", "B2", "Choose the best word: He gave a ___ argument against the proposal.", ["heavy", "compelling", "noisy", "expensive"], 1),
  Q("v-b2-5", "vocab", "B2", "“to be on the verge of”意为？", ["远离", "即将", "反对", "支持"], 1),
  // C1
  Q("v-c1-1", "vocab", "C1", "Closest meaning of “meticulous”?", ["careless", "extremely careful", "lazy", "generous"], 1),
  Q("v-c1-2", "vocab", "C1", "“The findings are inconclusive.” inconclusive 意为？", ["决定性的", "未定论的", "公开的", "私人的"], 1),
  Q("v-c1-3", "vocab", "C1", "Which word best fits: His remarks were ___ and offended many.", ["tactful", "tactless", "tactical", "tactile"], 1),
  Q("v-c1-4", "vocab", "C1", "Best synonym of “to mitigate (risk)”?", ["amplify", "reduce", "ignore", "evaluate"], 1),
  Q("v-c1-5", "vocab", "C1", "“a pragmatic approach”中 pragmatic 最接近？", ["理想化的", "务实的", "悲观的", "情绪化的"], 1),
  // C2
  Q("v-c2-1", "vocab", "C2", "Closest meaning of “ubiquitous”?", ["rare", "found everywhere", "ancient", "fragile"], 1),
  Q("v-c2-2", "vocab", "C2", "“His argument is specious.” specious 意为？", ["seemingly true but false", "well-founded", "highly technical", "deeply emotional"], 0),
  Q("v-c2-3", "vocab", "C2", "Best synonym of “to obfuscate”?", ["to clarify", "to confuse deliberately", "to summarize", "to translate"], 1),
  Q("v-c2-4", "vocab", "C2", "Which word best fits: A ___ silence fell over the courtroom.", ["palpable", "palatable", "potable", "portable"], 0),
  Q("v-c2-5", "vocab", "C2", "“an indelible impression”中 indelible 最接近？", ["短暂的", "无法磨灭的", "模糊的", "可疑的"], 1),
];

// ---------------------------------------------------------------------
// GRAMMAR — fill in the correct form / structure
// ---------------------------------------------------------------------
const GRAMMAR: BankQuestion[] = [
  // A1
  Q("g-a1-1", "grammar", "A1", "She ___ a teacher.", ["am", "is", "are", "be"], 1),
  Q("g-a1-2", "grammar", "A1", "I ___ from China.", ["am", "is", "are", "be"], 0),
  Q("g-a1-3", "grammar", "A1", "There ___ two cats on the bed.", ["is", "am", "are", "be"], 2),
  Q("g-a1-4", "grammar", "A1", "He ___ coffee every morning.", ["drink", "drinks", "drinking", "drank"], 1),
  Q("g-a1-5", "grammar", "A1", "This is ___ apple.", ["a", "an", "the", "no article"], 1),
  // A2
  Q("g-a2-1", "grammar", "A2", "Yesterday I ___ to the cinema.", ["go", "went", "gone", "going"], 1),
  Q("g-a2-2", "grammar", "A2", "She is ___ than her brother.", ["tall", "taller", "tallest", "more tall"], 1),
  Q("g-a2-3", "grammar", "A2", "If it rains tomorrow, I ___ at home.", ["stay", "will stay", "stayed", "staying"], 1),
  Q("g-a2-4", "grammar", "A2", "I ___ live in Beijing, but now I live here.", ["use to", "used to", "using to", "uses to"], 1),
  Q("g-a2-5", "grammar", "A2", "There isn’t ___ milk in the fridge.", ["some", "any", "many", "few"], 1),
  // B1
  Q("g-b1-1", "grammar", "B1", "I ___ in this company since 2020.", ["work", "worked", "have worked", "am working"], 2),
  Q("g-b1-2", "grammar", "B1", "If I ___ you, I would take the job.", ["am", "was", "were", "be"], 2),
  Q("g-b1-3", "grammar", "B1", "The book ___ by millions of people.", ["reads", "is read", "is reading", "has read"], 1),
  Q("g-b1-4", "grammar", "B1", "She told me she ___ tired.", ["is", "was", "be", "being"], 1),
  Q("g-b1-5", "grammar", "B1", "It’s the best film I ___ ever ___.", ["have / saw", "have / seen", "had / seen", "did / see"], 1),
  // B2
  Q("g-b2-1", "grammar", "B2", "By next year, she ___ here for ten years.", ["works", "will work", "will have worked", "would work"], 2),
  Q("g-b2-2", "grammar", "B2", "I wish I ___ more time to study.", ["have", "had", "have had", "would had"], 1),
  Q("g-b2-3", "grammar", "B2", "He suggested that she ___ a doctor.", ["sees", "see", "saw", "to see"], 1),
  Q("g-b2-4", "grammar", "B2", "Hardly ___ when the phone rang.", ["I had sat down", "had I sat down", "I sat down", "did I sit down"], 1),
  Q("g-b2-5", "grammar", "B2", "The report needs ___ before Friday.", ["finish", "to finish", "finishing", "be finished"], 2),
  // C1
  Q("g-c1-1", "grammar", "C1", "Were it not for your help, we ___ failed.", ["will have", "would have", "had", "have"], 1),
  Q("g-c1-2", "grammar", "C1", "Not only ___ late, but he also forgot the keys.", ["he was", "was he", "he is", "is he"], 1),
  Q("g-c1-3", "grammar", "C1", "She insisted that the meeting ___ postponed.", ["is", "was", "be", "to be"], 2),
  Q("g-c1-4", "grammar", "C1", "Such ___ his anger that he refused to speak.", ["was", "is", "had", "did"], 0),
  Q("g-c1-5", "grammar", "C1", "Should you require assistance, please ___ contact us.", ["do not hesitate to", "hesitate not to", "not hesitate to", "hesitate to not"], 0),
  // C2
  Q("g-c2-1", "grammar", "C2", "Little ___ that the project would change his life.", ["he knew", "did he know", "he did know", "knew he"], 1),
  Q("g-c2-2", "grammar", "C2", "Had the proposal ___ earlier, we would have approved it.", ["arrived", "arrive", "been arriving", "arrives"], 0),
  Q("g-c2-3", "grammar", "C2", "It is imperative that the document ___ signed today.", ["is", "be", "was", "to be"], 1),
  Q("g-c2-4", "grammar", "C2", "No sooner ___ the door than the alarm went off.", ["he opened", "did he open", "had he opened", "he had opened"], 2),
  Q("g-c2-5", "grammar", "C2", "Only after the storm ___ did we leave.", ["passed", "had passed", "has passed", "passes"], 1),
];

// ---------------------------------------------------------------------
// READING — short passage + comprehension question
// ---------------------------------------------------------------------
const READING: BankQuestion[] = [
  // A1
  Q("r-a1-1", "reading", "A1", "What does Mei do every morning?",
    ["She drinks coffee.", "She drinks tea.", "She drinks milk.", "She drinks juice."],
    0,
    { context: "Mei lives in California. Every morning she drinks coffee and reads the news. She works in a small office near her home." }),
  Q("r-a1-2", "reading", "A1", "Where does Tom live?",
    ["In Tokyo.", "In London.", "In Paris.", "In Beijing."],
    1,
    { context: "Tom is from Canada but he lives in London now. He has two cats and one dog." }),
  Q("r-a1-3", "reading", "A1", "How old is Anna?",
    ["18", "21", "25", "30"],
    1,
    { context: "Anna is a student. She is twenty-one years old. She studies music at a university in Berlin." }),
  // A2
  Q("r-a2-1", "reading", "A2", "Why didn't Sara go to the party?",
    ["She was tired.", "She was sick.", "She was busy with work.", "She didn't like the host."],
    2,
    { context: "Sara wanted to go to her friend's party last Saturday, but she had a big project to finish at work. She stayed home and worked until midnight." }),
  Q("r-a2-2", "reading", "A2", "What will the weather be like tomorrow?",
    ["Sunny.", "Rainy.", "Snowy.", "Windy."],
    1,
    { context: "The forecast says it will rain heavily tomorrow afternoon. People are advised to take an umbrella and avoid driving if possible." }),
  Q("r-a2-3", "reading", "A2", "What does Leo want to do this summer?",
    ["Visit Japan.", "Learn cooking.", "Find a new job.", "Move to a new city."],
    0,
    { context: "Leo has been saving money for a trip. This summer he plans to visit Japan for two weeks. He is excited about Tokyo and Kyoto." }),
  // B1
  Q("r-b1-1", "reading", "B1", "What is the main reason remote work is becoming popular?",
    ["It is cheaper for employees.", "It offers more flexibility.", "It pays better.", "It avoids meetings."],
    1,
    { context: "Remote work has grown rapidly in the last decade. While cost savings matter, most employees say the main benefit is flexibility — being able to balance work, family, and personal time more easily." }),
  Q("r-b1-2", "reading", "B1", "What does the author suggest about reading habits?",
    ["Everyone should read novels.", "Reading short articles is enough.", "Daily reading improves vocabulary.", "Reading is less useful than video."],
    2,
    { context: "Many studies show that people who read for at least 20 minutes a day tend to have a wider vocabulary and better focus than those who do not. The type of text matters less than the consistency." }),
  Q("r-b1-3", "reading", "B1", "Why did the company change its policy?",
    ["To save money.", "Because of customer complaints.", "To follow new laws.", "To compete with rivals."],
    1,
    { context: "After receiving hundreds of complaints about long waiting times, the company decided to hire more support staff and extend its phone hours into the evening." }),
  // B2
  Q("r-b2-1", "reading", "B2", "What is the writer's attitude toward social media?",
    ["Strongly positive.", "Cautiously critical.", "Completely negative.", "Indifferent."],
    1,
    { context: "Social media platforms have undeniably reshaped how we communicate. However, the writer argues that their algorithms often amplify extreme content and erode users' attention spans, even if connection across distances has improved." }),
  Q("r-b2-2", "reading", "B2", "Which best summarizes the passage?",
    ["Climate change is exaggerated.", "Renewable energy is too expensive.", "A shift to renewables is both possible and necessary.", "Governments should not intervene."],
    2,
    { context: "Although fossil fuels still dominate the global energy mix, falling costs of solar and wind, combined with growing public pressure, suggest that a transition to renewables is not only environmentally necessary but also increasingly economically rational." }),
  Q("r-b2-3", "reading", "B2", "What does the term “gig economy” imply in the text?",
    ["Stable, long-term jobs.", "Short-term, flexible work.", "Government-paid jobs.", "Volunteer work."],
    1,
    { context: "The rise of the gig economy — characterized by short-term contracts and freelance arrangements — has given workers freedom but stripped many of the protections traditionally associated with full-time employment." }),
  // C1
  Q("r-c1-1", "reading", "C1", "What is the author's main argument?",
    ["AI is a passing fad.", "AI productivity gains are evenly distributed.", "AI risks deepening inequality without policy intervention.", "AI will replace all knowledge workers."],
    2,
    { context: "While the productivity gains from artificial intelligence are real, they are unlikely to be evenly distributed. Without deliberate policy — retraining programs, taxation reform, and competition regulation — the benefits may accrue largely to capital owners, exacerbating existing inequalities rather than alleviating them." }),
  Q("r-c1-2", "reading", "C1", "The phrase “a double-edged sword” in the passage refers to?",
    ["A historical weapon.", "Globalization's mixed effects.", "The author's personal view.", "An economic indicator."],
    1,
    { context: "Globalization has proved to be a double-edged sword: it has lifted hundreds of millions out of poverty, yet has also hollowed out manufacturing in many developed regions, fueling political backlash that policymakers have struggled to contain." }),
  Q("r-c1-3", "reading", "C1", "Which best captures the author's tone?",
    ["Enthusiastic.", "Resigned.", "Measured and analytical.", "Sarcastic."],
    2,
    { context: "Reform of higher education will not come easily. Entrenched interests, funding constraints, and demographic shifts each impose their own limits. Yet incremental progress — modest, evidence-based, and politically pragmatic — remains both possible and worthwhile." }),
  // C2
  Q("r-c2-1", "reading", "C2", "The author's central claim is that?",
    ["Markets always self-correct.", "Regulation invariably fails.", "Market failures justify selective regulation.", "Economists disagree on everything."],
    2,
    { context: "Contrary to the dogma that unfettered markets are inherently self-correcting, history furnishes ample evidence of persistent failures — from monopolistic capture to systemic externalities — that warrant calibrated, evidence-driven regulatory intervention rather than blanket deregulation or wholesale state control." }),
  Q("r-c2-2", "reading", "C2", "What does “a Pyrrhic victory” imply in the passage?",
    ["A decisive triumph.", "A win whose costs outweigh the gains.", "A symbolic gesture.", "A negotiated settlement."],
    1,
    { context: "The corporation's legal triumph over its smaller rival proved a Pyrrhic victory: the prolonged litigation drained its reserves, alienated key partners, and ultimately ceded the broader market to a third competitor that had quietly consolidated its position." }),
  Q("r-c2-3", "reading", "C2", "The passage primarily seeks to?",
    ["Refute a common misconception.", "Provide a historical chronology.", "Advocate for a specific policy.", "Compare two unrelated theories."],
    0,
    { context: "It is widely assumed that linguistic complexity correlates with cognitive sophistication, yet rigorous cross-linguistic analysis reveals no such hierarchy: every natural language, however structurally idiosyncratic, displays the full expressive range required by its speakers' communicative needs." }),
];

// ---------------------------------------------------------------------
// LISTENING — context = the script that will be spoken via TTS;
// the user hears it and answers a comprehension question.
// ---------------------------------------------------------------------
const LISTENING: BankQuestion[] = [
  // A1
  Q("l-a1-1", "listening", "A1", "What time does the speaker get up?",
    ["6 AM", "7 AM", "8 AM", "9 AM"],
    1,
    { context: "I get up at seven o'clock every day. I have breakfast and then I go to work." }),
  Q("l-a1-2", "listening", "A1", "What does the speaker like?",
    ["Cats", "Dogs", "Birds", "Fish"],
    1,
    { context: "I have two dogs at home. I love dogs very much. They are my best friends." }),
  Q("l-a1-3", "listening", "A1", "Where is the speaker going?",
    ["To school.", "To the park.", "To the store.", "To the bank."],
    2,
    { context: "I need some milk and bread, so I'm going to the store now. I'll be back soon." }),
  // A2
  Q("l-a2-1", "listening", "A2", "When is the meeting?",
    ["Monday morning.", "Tuesday afternoon.", "Wednesday morning.", "Friday afternoon."],
    2,
    { context: "Hi, just a quick reminder: our team meeting is on Wednesday morning at ten. Please bring the latest report." }),
  Q("l-a2-2", "listening", "A2", "Why is the speaker calling?",
    ["To book a table.", "To cancel a booking.", "To complain about food.", "To ask for directions."],
    0,
    { context: "Hello, I'd like to book a table for four people this Saturday at seven in the evening, please." }),
  Q("l-a2-3", "listening", "A2", "What did the speaker do last weekend?",
    ["Watched a movie.", "Visited family.", "Went hiking.", "Stayed home and read."],
    2,
    { context: "Last weekend was great. We went hiking in the mountains on Saturday and had a picnic at the top." }),
  // B1
  Q("l-b1-1", "listening", "B1", "What problem does the speaker mention?",
    ["The flight is delayed.", "The flight is cancelled.", "The gate has changed.", "The luggage is lost."],
    2,
    { context: "Attention passengers of flight BA204 to London. Please note that the boarding gate has been changed from gate 12 to gate 27. We apologize for any inconvenience." }),
  Q("l-b1-2", "listening", "B1", "What is the main topic?",
    ["Healthy eating tips.", "A new restaurant opening.", "How to save money on food.", "Cooking classes for kids."],
    0,
    { context: "Today we'll talk about simple ways to eat more healthily without spending a lot of time. Just a few small changes to your daily routine can make a big difference." }),
  Q("l-b1-3", "listening", "B1", "What does the speaker recommend?",
    ["Booking online.", "Calling the hotel directly.", "Walking in without a reservation.", "Using a travel agent."],
    1,
    { context: "Online prices are usually fine, but for the best room, I'd suggest calling the hotel directly. Sometimes they offer upgrades that don't appear on the website." }),
  // B2
  Q("l-b2-1", "listening", "B2", "What is the speaker's main concern?",
    ["The cost of the project.", "The timeline of the project.", "The quality of the work.", "The team's motivation."],
    1,
    { context: "Honestly, my main worry is not the budget — we have enough for that — but whether we can deliver on time. The current schedule leaves almost no room for unexpected issues." }),
  Q("l-b2-2", "listening", "B2", "What does the speaker imply about working from home?",
    ["It is universally beneficial.", "It works well only for some roles.", "It harms productivity.", "It should be banned."],
    1,
    { context: "Look, I'm not against remote work at all — it's been great for many of our engineers. But for client-facing roles, where spontaneous conversations matter, being in the office really does make a difference." }),
  Q("l-b2-3", "listening", "B2", "What is the speaker’s attitude?",
    ["Enthusiastic.", "Skeptical but open.", "Strongly opposed.", "Completely neutral."],
    1,
    { context: "I have my doubts about whether this new approach will really pay off, but I'm willing to try it for a few months and see what the data tells us." }),
  // C1
  Q("l-c1-1", "listening", "C1", "What does the speaker primarily argue?",
    ["Universities should focus on employability.", "Liberal arts education has lasting value.", "Online learning will replace universities.", "Tuition fees should be abolished."],
    1,
    { context: "Although there is mounting pressure to reduce universities to vocational training pipelines, I'd argue the broader liberal arts tradition retains a value that cannot be measured by starting salaries alone — namely, the cultivation of critical, adaptable minds." }),
  Q("l-c1-2", "listening", "C1", "What is the speaker's tone?",
    ["Sarcastic.", "Cautiously optimistic.", "Despairing.", "Indifferent."],
    1,
    { context: "The challenges are undeniably formidable, and progress will not be linear. Yet, when I look at what's been achieved over the past decade, I can't help but feel — guardedly — that we are moving in the right direction." }),
  Q("l-c1-3", "listening", "C1", "What does the speaker recommend?",
    ["Immediate, sweeping reform.", "Doing nothing for now.", "Gradual, evidence-based change.", "Reverting to past policies."],
    2,
    { context: "Rather than rushing into wholesale reform, which historically has often backfired, I'd advocate a more incremental approach — pilot programs, careful evaluation, and only then broader rollout where the data supports it." }),
  // C2
  Q("l-c2-1", "listening", "C2", "What logical fallacy does the speaker identify?",
    ["Straw man.", "False dichotomy.", "Ad hominem.", "Slippery slope."],
    1,
    { context: "The framing of this debate as a binary choice between unfettered free markets on one hand and full-blown state control on the other is, frankly, a false dichotomy that obscures the rich middle ground where most workable policy actually resides." }),
  Q("l-c2-2", "listening", "C2", "What is the speaker’s rhetorical strategy?",
    ["Appeal to authority.", "Concession followed by rebuttal.", "Pure emotional appeal.", "Anecdotal evidence only."],
    1,
    { context: "I'll grant that my opponent's data on short-term gains is broadly accurate; what their argument fails to account for, however, is the long-term institutional damage that such a policy would almost certainly inflict." }),
  Q("l-c2-3", "listening", "C2", "What does the speaker conclude?",
    ["The hypothesis is confirmed.", "The hypothesis is decisively refuted.", "The evidence is suggestive but inconclusive.", "Further data is unnecessary."],
    2,
    { context: "Taken together, the findings are intriguing, perhaps even tantalizing, but they fall well short of the threshold required to confirm the original hypothesis. We need replication across diverse populations before drawing firm conclusions." }),
];

export const PLACEMENT_BANK: BankQuestion[] = [
  ...VOCAB,
  ...GRAMMAR,
  ...READING,
  ...LISTENING,
];

// Map a CEFR tier → integer level for adaptive math (1..6)
export const TIER_TO_LEVEL: Record<CEFRTier, number> = {
  A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6,
};
export const LEVEL_TO_TIER: Record<number, CEFRTier> = {
  1: "A1", 2: "A2", 3: "B1", 4: "B2", 5: "C1", 6: "C2",
};
