import { supabase } from "@/integrations/supabase/client";

/**
 * 高中"可用册"判断 —— 逐册存在性探测(与取词同口径:该 publisher+volume 在表里有行即可点)。
 *
 * ★为什么不一次性 select("volume") 去重★:PostgREST 默认上限 1000 行,
 * 当某表某 publisher 行数 > 1000(如 junior_vocab pep 高中 1706 行),排在 1000 之后的册会被截断丢失
 * → 误判"整理中"。改为对每个候选 volume 各发一个 head count(极小、并行),语料再大都不漏。
 *
 * publisher:/gaokao→'pep'(可被 ?publisher= 覆盖);不传(初中)→ 不过滤(本函数只服务高中板块)。
 */
export async function availableVolumes(
  table: string,
  volumes: string[],
  publisher?: string | null,
): Promise<Set<string>> {
  const out = new Set<string>();
  await Promise.all(
    volumes.map(async (v) => {
      let q = (supabase as unknown as { from: (t: string) => any })
        .from(table)
        .select("volume", { count: "exact", head: true })
        .eq("volume", v);
      if (publisher) q = q.eq("publisher", publisher);
      const { count } = await q;
      if ((count ?? 0) > 0) out.add(v);
    }),
  );
  return out;
}
