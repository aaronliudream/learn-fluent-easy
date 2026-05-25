import { describe, expect, it } from "vitest";
import {
  __assertPhonicsRegistryLoadsG4v2U1,
  __getPhonicsByUnitForTest,
  getPhonicsForUnit,
} from "./phonicsRegistry";
import {
  extractStageIdxFromPath,
  extractUnitIdFromPath,
} from "./registryDiscovery";
import {
  __getReadWriteConfigsForTest,
  getReadWriteConfig,
} from "./readWriteRegistry";
import {
  __getSentenceLessonsForTest,
  getSentenceLesson,
} from "./sentenceRegistry";

describe("registryDiscovery filename parsing", () => {
  it("parses unit id from conventional names", () => {
    expect(extractUnitIdFromPath("g4v2_u1_grammar.json")).toBe("g4v2_u1");
    expect(extractUnitIdFromPath("g4v2_u2_read_write.json")).toBe("g4v2_u2");
    expect(extractUnitIdFromPath("g4v2_u1_er.ts")).toBe("g4v2_u1");
  });

  it("parses unit id from conventional readWrite names", () => {
    expect(extractUnitIdFromPath("g4v2_u1_read_write.json")).toBe("g4v2_u1");
  });

  it("returns null for legacy readWrite filename without unit id", () => {
    expect(extractUnitIdFromPath("unit1_read_write_simplified.json")).toBeNull();
  });

  it("parses stage idx from _stageN suffix", () => {
    expect(extractStageIdxFromPath("g4v2_u1_stage6.json")).toBe(6);
    expect(extractStageIdxFromPath("g4v2_u1_grammar.json")).toBeNull();
  });
});

describe("sentenceRegistry auto-discovery", () => {
  it("loads g4v2_u1 grammar lesson at stage 3", () => {
    const lesson = getSentenceLesson("g4v2_u1", 3);
    expect(lesson).not.toBeNull();
    expect(lesson?.lessonId).toBe("g4v2_u1_grammar");
    expect(lesson?.subModules).toHaveLength(2);
    expect(lesson?.subModules[0].id).toBe("A");
    expect(lesson?.subModules[1].lockedUntil).toBe("A");
  });

  it("loads g4v2_u2 grammar lesson at stage 3", () => {
    const lesson = getSentenceLesson("g4v2_u2", 3);
    expect(lesson).not.toBeNull();
    expect(lesson?.lessonId).toBe("g4v2_u2_grammar");
    expect(lesson?.subModules).toHaveLength(2);
  });

  it("loads g4v2_u3 grammar lesson at stage 3", () => {
    const lesson = getSentenceLesson("g4v2_u3", 3);
    expect(lesson).not.toBeNull();
    expect(lesson?.lessonId).toBe("g4v2_u3_grammar");
    expect(lesson?.subModules).toHaveLength(2);
  });

  it("loads g4v2_u4 grammar lesson at stage 3", () => {
    const lesson = getSentenceLesson("g4v2_u4", 3);
    expect(lesson).not.toBeNull();
    expect(lesson?.lessonId).toBe("g4v2_u4_grammar");
    expect(lesson?.subModules).toHaveLength(2);
  });

  it("does not register unrelated units", () => {
    expect(getSentenceLesson("g4v2_u5", 3)).toBeNull();
  });

  it("discovers sentence lessons for u1–u4", () => {
    expect(__getSentenceLessonsForTest()).toHaveLength(4);
  });
});

describe("readWriteRegistry auto-discovery", () => {
  it("loads g4v2_u1 simplified readWrite at stage 6", () => {
    const config = getReadWriteConfig("g4v2_u1", 6);
    expect(config).not.toBeNull();
    expect(config?.title).toBe("读写训练");
    expect(config?.questions).toHaveLength(5);
    expect(config?.questions[0].type).toBe("picture_choice");
  });

  it("loads g4v2_u2 fill_choice readWrite at stage 6", () => {
    const config = getReadWriteConfig("g4v2_u2", 6);
    expect(config).not.toBeNull();
    expect(config?.questions).toHaveLength(6);
    expect(config?.questions[0].type).toBe("fill_choice");
  });

  it("loads g4v2_u3 fill_choice readWrite at stage 6", () => {
    const config = getReadWriteConfig("g4v2_u3", 6);
    expect(config).not.toBeNull();
    expect(config?.questions).toHaveLength(6);
    expect(config?.questions[0].type).toBe("fill_choice");
  });

  it("loads g4v2_u4 fill_choice readWrite at stage 6", () => {
    const config = getReadWriteConfig("g4v2_u4", 6);
    expect(config).not.toBeNull();
    expect(config?.questions).toHaveLength(6);
    expect(config?.questions[0].type).toBe("fill_choice");
  });

  it("ignores legacy multi-stage g4v2_u1_stage6.json", () => {
    const configs = __getReadWriteConfigsForTest();
    expect(configs).toHaveLength(4);
    expect(configs.every((c) => c.questions?.length)).toBe(true);
  });

  it("does not register unrelated units", () => {
    expect(getReadWriteConfig("g4v2_u5", 6)).toBeNull();
  });
});

describe("phonicsRegistry auto-discovery", () => {
  it("loads g4v2_u1 er phonics", () => {
    const config = getPhonicsForUnit("g4v2_u1");
    expect(config).not.toBeNull();
    expect(config?.phonics_rule).toBe("er");
    expect(config?.stage_1_listen).toHaveLength(6);
    expect(config?.stage_3_challenge).toHaveLength(4);
  });

  it("matches legacy exported config", () => {
    expect(__assertPhonicsRegistryLoadsG4v2U1()).toBe(true);
  });

  it("discovers exactly one phonics unit in repo", () => {
    expect(Object.keys(__getPhonicsByUnitForTest())).toEqual(["g4v2_u1"]);
  });
});
