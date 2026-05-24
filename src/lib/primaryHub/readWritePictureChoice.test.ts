import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  defaultReadWriteImagePath,
  hasPictureChoiceIllustration,
  isReadWritePictureVisual,
  resolvePictureChoiceDisplay,
  warnPictureChoiceQuestion,
} from "./readWriteTypes";

describe("readWrite picture_choice illustration", () => {
  beforeEach(() => {
    vi.stubEnv("DEV", true);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("defaultReadWriteImagePath builds unit-scoped public path", () => {
    expect(defaultReadWriteImagePath("g4v2_u2", "clock_8am.svg")).toBe(
      "/primary/hub/g4v2_u2/clock_8am.svg",
    );
    expect(defaultReadWriteImagePath("g4v2_u2", "/clock_8am.svg")).toBe(
      "/primary/hub/g4v2_u2/clock_8am.svg",
    );
  });

  it("isReadWritePictureVisual recognizes built-in keys", () => {
    expect(isReadWritePictureVisual("place_books")).toBe(true);
    expect(isReadWritePictureVisual("unknown_visual")).toBe(false);
  });

  it("hasPictureChoiceIllustration requires visual or image", () => {
    expect(hasPictureChoiceIllustration({ visual: "place_books" })).toBe(true);
    expect(hasPictureChoiceIllustration({ image: "/primary/hub/g4v2_u2/a.svg" })).toBe(true);
    expect(hasPictureChoiceIllustration({})).toBe(false);
    expect(hasPictureChoiceIllustration({ image: "   " })).toBe(false);
  });

  it("resolvePictureChoiceDisplay prefers image over visual", () => {
    expect(
      resolvePictureChoiceDisplay({
        visual: "place_books",
        image: "/primary/hub/g4v2_u2/clock.svg",
      }),
    ).toEqual({ mode: "image", src: "/primary/hub/g4v2_u2/clock.svg" });

    expect(resolvePictureChoiceDisplay({ visual: "room_row" })).toEqual({
      mode: "visual",
      visual: "room_row",
    });

    expect(resolvePictureChoiceDisplay({})).toBeNull();
  });

  it("warnPictureChoiceQuestion warns on neither, both, or unknown visual", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    warnPictureChoiceQuestion(
      {
        type: "picture_choice",
        imageAlt: "x",
        options: [],
      },
      "test q1",
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('missing both "image" and "visual"'),
    );

    warn.mockClear();
    warnPictureChoiceQuestion(
      {
        type: "picture_choice",
        visual: "place_books",
        image: "/img.svg",
        imageAlt: "x",
        options: [],
      },
      "test q2",
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("using image (visual ignored)"));

    warn.mockClear();
    warnPictureChoiceQuestion(
      {
        type: "picture_choice",
        visual: "not_a_visual" as "place_books",
        imageAlt: "x",
        options: [],
      },
      "test q3",
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('unknown visual "not_a_visual"'));
  });
});
