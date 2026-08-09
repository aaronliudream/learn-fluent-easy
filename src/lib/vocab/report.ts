/**
 * 静默失败的统一出口 —— 「catch 不得只 setState 不打日志」这条规矩的落地件。
 *
 * ── 由来 ────────────────────────────────────────────────────────
 * 错题本从 PR-4 上线起一直报「加载失败」,双方几个月没发现。机制是:
 * 查询 400 → `catch` 吞掉 → `setList([])` → 页面渲染「错题本是空的」——
 * **和真的没错题长得一模一样**。对错题为 0 的人(包括每一个测试账号)它永远"正常"。
 *
 * 所以两件事必须同时做,少一件都还会再躺几个月:
 *   ① 失败要留痕(本文件):控制台一定要有一行能搜到的记录;
 *   ② 失败要**在 UI 上和空态可区分**(各组件自己做):
 *      空 = 「还没有记录」,失败 = 「没能加载 · 重试」。别都渲染成"空"。
 *
 * ⚠️ 这里**故意不上报到后端**。板块里没有现成的上报通道,
 *    为了一行日志新拉一条链路是另一件事;真要做时改这一个函数即可,
 *    调用点不用动 —— 这也是把它收成一个函数而不是各处写 console 的原因。
 * ⚠️ 用 `console.warn` 不用 `console.error`:这些路径都有兜底(空数组/0/骨架解除),
 *    页面不会崩。用 error 会把真崩溃淹掉。
 */

/** PostgREST 的错误体(supabase-js 返回的那种)。字段全是可选的,别硬取。 */
type PgLikeError = {
  code?: unknown; message?: unknown; details?: unknown; hint?: unknown; status?: unknown;
};

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

/**
 * 把任意 catch 到的东西压成一个能读的对象。
 *
 * ⚠️ 不要直接 `console.warn(err)` —— PostgREST 的错误是**普通对象不是 Error**,
 *    某些浏览器控制台会折叠成 `{}`,等于没打。所以这里逐字段摊平。
 */
export function describeError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return { kind: "js", message: err.message, stack: err.stack };
  }
  if (isObj(err)) {
    const e = err as PgLikeError;
    /* code/message/details/hint 是 PostgREST 四件套;status 是 supabase-js 偶尔带的 */
    const out: Record<string, unknown> = { kind: "api" };
    for (const k of ["code", "message", "details", "hint", "status"] as const) {
      if (e[k] !== undefined && e[k] !== null) out[k] = e[k];
    }
    /* 四件套一个都没有 → 保底把原对象塞进去,免得只剩一个 kind:"api" */
    if (Object.keys(out).length === 1) out.raw = err;
    return out;
  }
  return { kind: "unknown", raw: err };
}

/**
 * 记一次静默失败。
 *
 * @param scope 出事的地方,写成「文件/函数」这种能直接搜到的串,例如 `VocabCenter/bankStats`。
 *              前缀统一是 `[vocab]`,控制台过滤一个词就能看全板块。
 */
export function logFail(scope: string, err: unknown): void {
  try {
    console.warn(`[vocab] ✗ ${scope}`, describeError(err));
  } catch { /* 控制台被劫持/禁用时不能让日志本身抛出去 */ }
}

/**
 * 给 `.catch()` 用的柯里化版本:失败时记一行,然后返回兜底值。
 *
 *   listX().catch(fallback("VocabCenter/listX", []))
 *
 * ⚠️ 只在**兜底值本身就是正确降级**时用(比如"数不出来就不显示那个数")。
 *    如果兜底值会让用户把"坏"读成"空",那就不能用这个,
 *    必须在组件里另存一个 failed 标志、渲染失败态 —— 见文件头 ②。
 */
export function fallback<T>(scope: string, value: T): (err: unknown) => T {
  return (err: unknown) => { logFail(scope, err); return value; };
}
