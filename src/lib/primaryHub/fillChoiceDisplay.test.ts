import { describe, expect, it } from "vitest";
import { buildFillChoiceGlueParts } from "./fillChoiceDisplay";
import { splitFillChoiceSentence } from "./fillChoiceSentence";

describe("buildFillChoiceGlueParts", () => {
  it("glues U1 stage/6 Q3: It's ___ the window", () => {
    const sentence = "John can't find his book. It's ___ the window.";
    const { before, after, token } = splitFillChoiceSentence(sentence);
    const g = buildFillChoiceGlueParts(before, after, token);
    expect(g.outerBefore).toBe("John can't find his book. ");
    expect(g.glueBefore).toBe("It's ");
    expect(g.glueAfter).toBe(" the window.");
    expect(g.outerAfter).toBe("");
    expect(g.blankToken).toBe("___");
  });

  it("glues g4v1_u2 stage/6 Q6: ___ it is!", () => {
    const sentence = "The staff finds the bag. She says: ___ it is!";
    const { before, after, token } = splitFillChoiceSentence(sentence);
    const g = buildFillChoiceGlueParts(before, after, token);
    expect(g.glueBefore).toBe("She says: ");
    expect(g.glueAfter).toBe(" it is!");
    expect(g.outerAfter).toBe("");
    expect(g.outerBefore).toContain("finds the bag.");
  });

  it("glues g4v2_u2 time sentence with four underscores", () => {
    const sentence = "🌅 It's 7 o'clock. It's time to ____.";
    const { before, after, token } = splitFillChoiceSentence(sentence);
    const g = buildFillChoiceGlueParts(before, after, token);
    expect(g.glueBefore).toBe("to ");
    expect(g.glueAfter).toBe(" .");
    expect(g.blankToken).toBe("____");
  });

  it("glues long g4v2_u5 sentence tail without orphaning trailing phrase", () => {
    const sentence =
      "Mike's pants are green. Amy sees green pants with a Dad label. Whose pants are these? They're your father's, not ___.";
    const { before, after, token } = splitFillChoiceSentence(sentence);
    const g = buildFillChoiceGlueParts(before, after, token);
    expect(g.glueBefore).toBe("not ");
    expect(g.glueAfter).toBe(" .");
    expect(g.outerAfter).toBe("");
  });

  it("handles blank after sentence-ending punctuation", () => {
    const sentence = "Before school Mum says you still need a white top. ___ your shirt.";
    const { before, after, token } = splitFillChoiceSentence(sentence);
    const g = buildFillChoiceGlueParts(before, after, token);
    expect(g.outerBefore).toBe(
      "Before school Mum says you still need a white top. ",
    );
    expect(g.glueBefore).toBe("");
    expect(g.glueAfter).toBe(" your shirt.");
    expect(g.outerAfter).toBe("");
  });
});
