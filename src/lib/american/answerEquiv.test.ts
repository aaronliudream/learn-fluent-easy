import { describe, it, expect } from "vitest";
import { normalizeAnswer, answersEquivalent } from "./answerEquiv";

describe("normalizeAnswer", () => {
  it("小写 + 去句末标点 + 压缩空白", () => {
    expect(normalizeAnswer("Is this your bag?")).toBe("is this your bag");
    expect(normalizeAnswer("  Here are   your bags.  ")).toBe("here are your bags");
  });
  it("折叠全写为缩写(规范形)", () => {
    expect(normalizeAnswer("do not")).toBe("don't");
    expect(normalizeAnswer("It is red.")).toBe("it's red");
    expect(normalizeAnswer("cannot")).toBe("can't");
    expect(normalizeAnswer("can not")).toBe("can't");
  });
});

describe("answersEquivalent · 缩写≡全写", () => {
  it.each([
    ["No, it isn't.", "No, it is not."],
    ["I'm sorry, sir.", "I am sorry, sir."],
    ["Here's my ticket.", "Here is my ticket."],
    ["They don't like it.", "They do not like it."],
    ["We'll go now.", "We will go now."],
    ["It's a medium.", "It is a medium"],
    ["I can't help you.", "I cannot help you."],
  ])("%s ≡ %s", (a, b) => {
    expect(answersEquivalent(a, b)).toBe(true);
  });
});

describe("answersEquivalent · that 可省", () => {
  it("said (that) X", () => {
    expect(answersEquivalent("He said that he was tired.", "He said he was tired.")).toBe(true);
  });
  it("the book (that) I bought", () => {
    expect(answersEquivalent("This is the book that I bought.", "This is the book I bought.")).toBe(true);
  });
});

describe("answersEquivalent · 大小写/标点/空白无关", () => {
  it("忽略大小写与末尾标点", () => {
    expect(answersEquivalent("Is this your chair?", "is this your chair")).toBe(true);
  });
});

describe("answersEquivalent · 不同答案仍判错", () => {
  it.each([
    ["Is this your bag?", "Is this your box?"],
    ["Here are your bags.", "Here is your bag."],
    ["No, it isn't.", "Yes, it is."],
    ["I walked to school.", "I walk to school."],
  ])("%s ≠ %s", (a, b) => {
    expect(answersEquivalent(a, b)).toBe(false);
  });
});
