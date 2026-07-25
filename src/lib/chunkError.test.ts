import { describe, expect, it } from "vitest";
import { isChunkLoadError } from "./chunkError";

/** 换版后旧 hash chunk 404,各浏览器给的原文各不相同 —— 少认一条就少一次自动刷新。 */
const CHUNK_ERRORS: [string, unknown][] = [
  ["Chrome/Edge", new TypeError("Failed to fetch dynamically imported module: https://x/assets/LibraryReader-a1b2c3.js")],
  ["Firefox", new TypeError("error loading dynamically imported module")],
  ["Safari 15+", new TypeError("Importing a module script failed.")],
  ["iOS Safari 精简报法", new TypeError("Load failed")],
  ["webpack 时代", { name: "ChunkLoadError", message: "Loading chunk 42 failed." }],
  ["CSS chunk", new Error("Loading CSS chunk 7 failed.")],
];

const NOT_CHUNK: [string, unknown][] = [
  ["普通空引用", new TypeError("Cannot read properties of undefined (reading 'map')")],
  ["业务报错", new Error("supabase: row not found")],
  ["null", null],
  ["undefined", undefined],
];

describe("isChunkLoadError", () => {
  it.each(CHUNK_ERRORS)("认得 %s 的报错", (_label, err) => {
    expect(isChunkLoadError(err)).toBe(true);
  });

  it.each(NOT_CHUNK)("不误伤 %s", (_label, err) => {
    expect(isChunkLoadError(err)).toBe(false);
  });
});
