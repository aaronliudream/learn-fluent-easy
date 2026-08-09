/**
 * 词卡增区 —— 高频搭配 / 反义词。
 *
 * ⚠️ **「易混词」那一段已于 2026-08-09 整条下架**(Aaron 决定),连同 /vocab/confusion
 *    页面与路由一并删除。`vocab_confusion_groups`(429 组)/ `vocab_confusion_members`
 *    (978 词)**留在库里不删**,前端不再引用。别再加回这一段。
 *
 * **一处实现,四处生效**:四模式答题反馈层、词库列表点开的词卡,
 * 以及将来的点词查词弹卡、单词本条目。
 * ⚠️ 别在任何调用处再拼一份 —— 这两段的排布顺序、阈值规则、空态判断
 *    一旦各写各的,同一个产品就会出现几种说法(反馈层和词表页的搭配数不一样、
 *    一处折叠一处不折叠)。这正是 SessionParts 抽出来时踩过的那个坑。
 *
 * ⚠️ **有数据才显示**。两段全空则整个组件不渲染 —— 不留空标题、不占高度。
 *    22065 条搭配听着多,摊到 4470 个词上仍有不少词一条都没有。
 * ⚠️ **两段一律默认展开,不折叠**(Aaron 2026-08-09 改)。
 *    原来是"标题常驻 + 内容默认收起",理由写的是"默认展开会把例句挤出首屏" ——
 *    那个理由**不成立**:增区渲染在例句**之后**,展开它只会把它自己下面的东西往下推,
 *    动不到例句的位置(反馈层挂载时还会 scrollIntoView 到顶)。
 *    而收起的代价是实打实的:三段内容默认零曝光,绝大多数人永远点不开。
 * ⚠️ 折叠**只在超过阈值时**才出现,不做默认收起:
 *    · 高频搭配 → 先列 6 条,超过才给「查看全部 N 条」;
 *    · 反义词 → 直接全列,不给折叠。
 *    实测(2026-08-09)库里 **4414 个有搭配的词里 4412 个恰好 5 条,超过 6 条的一个都没有**;
 *    反义词每词最多 3 个(分布 1/2/3 条 = 303/388/1073)。
 *    也就是说「查看全部」那条分支**当前数据下永远不会出现** —— 留着是给将来放量用的,
 *    不是现在就在起作用的东西,别以为它在挡什么。
 */
import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { FONT_SERIF } from "@/lib/vocab/theme";
import { playUrl } from "@/lib/vocab/audio";
import { logFail } from "@/lib/vocab/report";
import {
  getWordExtras, isEmptyExtras, COLLOCATION_PREVIEW,
  EMPTY_EXTRAS, type WordExtras as Extras,
} from "@/lib/vocab/wordExtras";

/**
 * 一节 —— **标题 + 内容,常驻展开**。
 *
 * ⚠️ 这里原来是个可折叠件(`useState(false)` + ChevronDown + grid-rows 过渡),
 *    已整个拆掉。别"顺手"加回折叠:一旦默认收起,这三段就等于不存在。
 *    要控制长度请用**阈值 + 查看全部**(见 collocations 那段),不要用默认收起。
 * ⚠️ 标题不再是 <button>:它现在不可点,做成按钮会让读屏器报一个点了没反应的控件。
 */
function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <div className="border-t border-black/[0.06] pb-3">
      <div className="py-2.5">
        <span className="text-[13px] font-medium text-slate-600">
          {title}
          {typeof count === "number" && <span className="ml-1.5 text-[12px] font-normal text-slate-400">{count}</span>}
        </span>
      </div>
      {children}
    </div>
  );
}

export default function WordExtras({ wordId }: { wordId: string }) {
  /* ⚠️ 原来有个 `onPickWord`(点易混词跳过去),随易混词整段下架已删 ——
     全仓零调用方。要给搭配/反义词加"点词跳转"是另一件事,别复活这个签名。 */
  const [data, setData] = useState<Extras>(EMPTY_EXTRAS);
  const [ready, setReady] = useState(false);
  const [allColl, setAllColl] = useState(false);

  useEffect(() => {
    let alive = true;
    setReady(false); setAllColl(false); setData(EMPTY_EXTRAS);
    getWordExtras(wordId)
      .then(x => { if (alive) { setData(x); setReady(true); } })
      /* 失败就当没有增区,不打扰用户 —— 增区是锦上添花,空和失败都表现为"这块不出现",
         用户不会据此判断学习状态,所以不做失败态 UI;但要留日志。 */
      .catch(e => { logFail("WordExtras/getWordExtras", e); if (alive) setReady(true); });
    return () => { alive = false; };
  }, [wordId]);

  /* ⚠️ 没就绪时**什么都不渲染**(不是骨架屏):这一块是锦上添花,
        先给一块灰占位反而会让卡片在数据到位时跳一下。
     ⚠️ 现在三段默认展开,这块的高度比以前大 —— 但它渲染在**例句之后**,
        不影响"反馈层首屏要看到第一条例句"那条判据(已实测)。 */
  if (!ready || isEmptyExtras(data)) return null;

  const { collocations, antonyms } = data;
  const shownColl = allColl ? collocations : collocations.slice(0, COLLOCATION_PREVIEW);

  return (
    <div className="mt-3">
      {collocations.length > 0 && (
        <Section title="高频搭配" count={collocations.length}>
          <div className="space-y-1.5">
            {shownColl.map(c => (
              <button key={c.id} type="button" onClick={() => playUrl(c.audio_url, `c:${c.id}`)}
                disabled={!c.audio_url}
                className="flex w-full items-start gap-2 rounded-lg px-1 py-1 text-left active:bg-slate-50">
                {c.audio_url
                  ? <Volume2 className="mt-[3px] h-3.5 w-3.5 shrink-0 text-slate-300" />
                  : <span className="mt-[3px] h-3.5 w-3.5 shrink-0" />}
                <span className="min-w-0">
                  <span className="text-[15px] text-slate-800" style={{ fontFamily: FONT_SERIF }}>{c.collocation}</span>
                  {c.translation_zh && <span className="ml-2 text-[13px] text-slate-500">{c.translation_zh}</span>}
                </span>
              </button>
            ))}
          </div>
          {collocations.length > COLLOCATION_PREVIEW && !allColl && (
            <button type="button" onClick={() => setAllColl(true)}
              className="mt-1.5 text-[12px] text-slate-400 underline underline-offset-2">
              查看全部 {collocations.length} 条
            </button>
          )}
        </Section>
      )}

      {antonyms.length > 0 && (
        <Section title="反义词" count={antonyms.length}>
          <div className="flex flex-wrap gap-1.5">
            {antonyms.map(a => (
              <span key={a} className="rounded-lg border border-black/[0.06] px-2.5 py-1 text-[14px] text-slate-700"
                style={{ fontFamily: FONT_SERIF }}>{a}</span>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
