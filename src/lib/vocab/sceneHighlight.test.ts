/**
 * 场景短文高亮的匹配规则测试。
 *
 * 用例全部取自**库里真实的**「网络购物」场景(vocab_scene_packs / vocab_scene_items),
 * 不是编的 —— 高亮这种事编个 "the cat sat" 全过,一碰真短文就漏。
 */
import { describe, expect, it } from "vitest";
import { buildSceneHighlighter, splitContrast, type SceneTerm } from "./sceneHighlight";

/** 「网络购物」的 8 个节点(text_en 原样)。 */
const ITEMS: { id: string; kind: string; text_en: string }[] = [
  { id: "n1", kind: "word", text_en: "browse" },
  { id: "n2", kind: "collocation", text_en: "add to cart" },
  { id: "n3", kind: "chunk", text_en: "place an order" },
  { id: "n4", kind: "contrast", text_en: "free shipping vs. expedited shipping" },
  { id: "n5", kind: "collocation", text_en: "track the package" },
  { id: "n6", kind: "word", text_en: "return" },
  { id: "n7", kind: "collocation", text_en: "customer service" },
  { id: "n8", kind: "collocation", text_en: "product review" },
];

/** 库里 essay_full_en 的第一段(原文,含换行前的完整句子)。 */
const ESSAY = `Online shopping has transformed the way we purchase goods. It begins with browsing through a wide selection of products, where one can easily add to cart the desired items. Once satisfied, the next step is to place an order. Many platforms offer free shipping, though expedited shipping is available for those in a hurry. Customers can track the package using real-time updates, ensuring they know exactly when it will arrive. If the product doesn't meet expectations, a return can be initiated, though it may involve dealing with customer service. Product reviews often guide the decision-making process, providing insight into the quality and reliability of items.`;

function terms(): SceneTerm[] {
  const out: SceneTerm[] = [];
  for (const it of ITEMS) {
    const surfaces = it.kind === "contrast" ? splitContrast(it.text_en) : [it.text_en];
    for (const s of surfaces) out.push({ itemId: it.id, surface: s });
  }
  return out;
}

const segment = buildSceneHighlighter(terms());

/** 某个节点在这段文字里命中的所有片段。 */
function hitsFor(text: string, itemId: string): string[] {
  return segment(text).filter(s => s.itemId === itemId).map(s => s.text);
}

describe("splitContrast", () => {
  it("把「A vs. B」拆成两条 —— 整串在短文里永远不会原样出现", () => {
    expect(splitContrast("free shipping vs. expedited shipping"))
      .toEqual(["free shipping", "expedited shipping"]);
  });

  it("没有 vs. 的原样返回", () => {
    expect(splitContrast("add to cart")).toEqual(["add to cart"]);
  });
});

describe("片段拼回去必须与原文逐字相同", () => {
  it("不吞字、不多字", () => {
    expect(segment(ESSAY).map(s => s.text).join("")).toBe(ESSAY);
  });
});

describe("真实短文里 8 个节点全都要命中", () => {
  it.each([
    ["n1 browse → browsing(屈折)", "n1", "browsing"],
    ["n2 add to cart(原形词组)", "n2", "add to cart"],
    ["n3 place an order(原形词组)", "n3", "place an order"],
    ["n5 track the package(原形词组)", "n5", "track the package"],
    ["n6 return(单词)", "n6", "return"],
    ["n7 customer service(名词词组)", "n7", "customer service"],
    ["n8 product review → Product reviews(尾词复数 + 首字母大写)", "n8", "Product reviews"],
  ])("%s", (_label, itemId, expected) => {
    expect(hitsFor(ESSAY, itemId)).toContain(expected);
  });

  it("n4 contrast 拆开后两侧都命中,且共用同一个节点 id", () => {
    const hits = hitsFor(ESSAY, "n4");
    expect(hits).toContain("free shipping");
    expect(hits).toContain("expedited shipping");
  });
});

describe("长的说法优先,不被短的抢走", () => {
  it("「free shipping」整体命中,不会被切成 free + shipping", () => {
    const segs = segment("Many platforms offer free shipping today.");
    const hit = segs.find(s => s.itemId);
    expect(hit?.text).toBe("free shipping");
  });

  it("「expedited shipping」同理", () => {
    const segs = segment("But expedited shipping costs more.");
    expect(segs.find(s => s.itemId)?.text).toBe("expedited shipping");
  });
});

describe("屈折规则:首尾放宽,中间不放宽", () => {
  it("动词短语变在头上:placing an order", () => {
    expect(hitsFor("She is placing an order now.", "n3")).toContain("placing an order");
  });

  it("名词短语变在尾上:product reviews", () => {
    expect(hitsFor("The product reviews helped.", "n8")).toContain("product reviews");
  });

  it("中间的介词/冠词不放宽:「add to carts」里的 to 不会被换成别的", () => {
    // 尾词 cart 允许复数,所以这句该命中 —— 验证的是"中间的 to 必须原样"
    expect(hitsFor("You can add to carts quickly.", "n2")).toContain("add to carts");
    expect(hitsFor("You can add into cart quickly.", "n2")).toHaveLength(0);
  });
});

describe("分隔符放宽:空格 / 连字符 / 连写 三种写法都算命中", () => {
  /* 这三条来自全库 292 条说法的实测漏网清单 ——
     链上存词典形、短文里写行文形,同一个说法真的会换写法。 */
  const seg = buildSceneHighlighter([
    { itemId: "f1", surface: "follow up" },
    { itemId: "f2", surface: "burn out" },
    { itemId: "f3", surface: "check-out" },
  ]);
  const hit = (text: string, id: string) =>
    seg(text).filter(s => s.itemId === id).map(s => s.text);

  it("follow up → follow-up(连字符)", () => {
    expect(hit("We sent a follow-up email.", "f1")).toContain("follow-up");
  });

  it("burn out → burnout(连写)", () => {
    expect(hit("Avoid burnout during exams.", "f2")).toContain("burnout");
  });

  it("check-out → check out / checkout(去连字符)", () => {
    expect(hit("The check out time is noon.", "f3")).toContain("check out");
    expect(hit("Fast checkout is nice.", "f3")).toContain("checkout");
  });

  it("放宽的是分隔符,不是词本身:follow through 不该命中 follow up", () => {
    expect(hit("We follow through on promises.", "f1")).toHaveLength(0);
  });
});

describe("边界", () => {
  it("词边界生效:returned 命中,但 returning-machine 里的 return 不该切碎原文", () => {
    expect(hitsFor("The item was returned.", "n6")).toContain("returned");
  });

  it("不命中任何节点时整段作为一条普通片段返回", () => {
    const segs = segment("Nothing here matches at all.");
    expect(segs).toHaveLength(1);
    expect(segs[0].itemId).toBeNull();
  });

  it("空文本不炸", () => {
    expect(segment("")).toEqual([{ text: "", itemId: null }]);
  });

  it("没有任何词条时原样返回", () => {
    expect(buildSceneHighlighter([])("hello world")).toEqual([{ text: "hello world", itemId: null }]);
  });
});
