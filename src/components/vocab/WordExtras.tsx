/**
 * 词卡增区 —— 高频搭配 / 易混词 / 反义词。
 *
 * **一处实现,四处生效**:四模式答题反馈层、词库列表点开的词卡,
 * 以及将来的点词查词弹卡、单词本条目。
 * ⚠️ 别在任何调用处再拼一份 —— 这三段的排布顺序、折叠规则、空态判断
 *    一旦各写各的,同一个产品就会出现几种说法(反馈层和词表页的搭配数不一样、
 *    一处折叠一处不折叠)。这正是 SessionParts 抽出来时踩过的那个坑。
 *
 * ⚠️ **有数据才显示**。三段全空则整个组件不渲染 —— 不留空标题、不占高度。
 *    22065 条搭配听着多,摊到 4470 个词上仍有不少词一条都没有。
 * ⚠️ 折叠区默认全收起:词卡的主体是释义和例句,增区是"想深挖时才展开"的,
 *    默认展开会把例句挤出首屏。
 */
import { useEffect, useState } from "react";
import { ChevronDown, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FONT_SERIF } from "@/lib/vocab/theme";
import { playUrl } from "@/lib/vocab/audio";
import { logFail } from "@/lib/vocab/report";
import {
  getWordExtras, isEmptyExtras, COLLOCATION_PREVIEW,
  EMPTY_EXTRAS, type WordExtras as Extras,
} from "@/lib/vocab/wordExtras";

/** 可折叠的一节。标题行常驻,内容默认收起。 */
function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-black/[0.06]">
      <button type="button" onClick={() => setOpen(v => !v)} aria-expanded={open}
        className="flex w-full items-center justify-between py-2.5 text-left">
        <span className="text-[13px] font-medium text-slate-600">
          {title}
          {typeof count === "number" && <span className="ml-1.5 text-[12px] font-normal text-slate-400">{count}</span>}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>
      {/* grid-rows 0fr→1fr:纯 CSS 的高度过渡,不用测量元素高度。
          ⚠️ 别改成 max-height 那套 —— 内容高度未知时要么截断要么过渡时长不对。 */}
      <div className={cn("grid transition-[grid-template-rows] duration-200", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className="pb-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function WordExtras({ wordId, onPickWord }: {
  wordId: string;
  /** 点易混词跳过去。不传则易混词只展示不可点(反馈层里跳走会打断答题)。 */
  onPickWord?: (wordId: string, headword: string) => void;
}) {
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
        先给一块灰占位反而会让卡片在数据到位时跳一下。 */
  if (!ready || isEmptyExtras(data)) return null;

  const { collocations, confusion, antonyms } = data;
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

      {confusion && (
        <Section title="易混词" count={confusion.peers.length}>
          <p className="mb-2 text-[12px] text-slate-400">同组:{confusion.groupTitle}</p>
          <div className="space-y-2">
            {confusion.peers.map(p => {
              const body = (
                <>
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-[15px] font-medium text-slate-900" style={{ fontFamily: FONT_SERIF }}>{p.headword}</span>
                    {p.def_zh && <span className="text-[13px] text-slate-500">{p.def_zh}</span>}
                  </div>
                  {/* 区分要点才是这一节的价值 —— 只列同组的词等于让用户自己去悟 */}
                  {(p.contrast_hint || p.feel_zh) && (
                    <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500">{p.contrast_hint || p.feel_zh}</p>
                  )}
                </>
              );
              return onPickWord ? (
                <button key={p.word_id} type="button" onClick={() => onPickWord(p.word_id, p.headword)}
                  className="block w-full rounded-lg px-1 py-1 text-left active:bg-slate-50">{body}</button>
              ) : (
                <div key={p.word_id} className="px-1 py-1">{body}</div>
              );
            })}
          </div>
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
