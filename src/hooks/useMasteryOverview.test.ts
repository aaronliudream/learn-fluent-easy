// D1-c 回归守卫:useMasteryOverview 的初中环必须把当前出版社 (_publisher) 传给
// junior_mastery_overview RPC。若将来任何合并/漂移把这层 publisher 隔离弄丢(如 feat 曾发生),
// 本测试变红。见 memory: junior-fltrp-publisher-consistency-audit。
import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const rpcMock = vi.fn(async () => ({
  // 返回非空行 → hook 走 RPC 路径并提前返回(不落到内联回退)。
  data: [{ module: "vocab", mastered: 1, learned: 0, due: 0, total: 10 }],
  error: null,
}));

// 通用可 await 的查询链(万一走到内联回退也不会崩,便于聚焦在 rpc 断言上)。
const makeChain = (): any => {
  const chain: any = {};
  for (const m of ["select", "eq", "in", "not", "order", "maybeSingle", "single"]) chain[m] = () => chain;
  chain.then = (resolve: (v: unknown) => unknown) => resolve({ data: [], error: null, count: 0 });
  return chain;
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: vi.fn(async () => ({ data: { user: { id: "u1" } } })) },
    rpc: (...args: unknown[]) => rpcMock(...args),
    from: () => makeChain(),
  },
}));

import { useMasteryOverview } from "@/hooks/useMasteryOverview";

describe("useMasteryOverview — 出版社隔离守卫 (D1-c)", () => {
  beforeEach(() => rpcMock.mockClear());

  it("外研社:调 junior_mastery_overview 带 {_publisher:'junior_fltrp'}", async () => {
    renderHook(() => useMasteryOverview("junior", "junior_fltrp"));
    await waitFor(() => expect(rpcMock).toHaveBeenCalled());
    expect(rpcMock).toHaveBeenCalledWith("junior_mastery_overview", { _publisher: "junior_fltrp" });
  });

  it("人教(默认='junior'):不传 _publisher(兼容旧 0 参 RPC)", async () => {
    renderHook(() => useMasteryOverview("junior", "junior"));
    await waitFor(() => expect(rpcMock).toHaveBeenCalled());
    expect(rpcMock).toHaveBeenCalledWith("junior_mastery_overview", {});
  });
});
