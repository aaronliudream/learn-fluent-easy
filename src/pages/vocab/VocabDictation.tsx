/**
 * 默写纸(/vocab/dictation)· 纯前端 + window.print(),零写入、零新表。
 *
 * ⚠️ **打印样式是这个页面的正文**,屏幕上那套只是预览。所以:
 *    · 打印时把导航/按钮/底部 tab 全部 `print:hidden`,只留纸面
 *    · A4 尺寸与页边距写在 `@page` 里,不靠猜
 *    · 每页 25 词,靠 `break-after: page` 硬分页 —— 不能指望浏览器自动断得整齐,
 *      自动断页会把某一行劈成两半、答案行和题目行分家
 *
 * ⚠️ 答案页是**整页附在最后**,不是每页背面 —— 家长/老师印完要能直接撕下来对答案,
 *    夹在中间就没法用。
 *
 * ⚠️ 三种来源共用一套取词逻辑(词库范围 / 错题本 / 场景词链),
 *    与磨耳朵的 buildPlaylist 是两回事:那边要音频,这边只要词形和释义。
 */
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Printer, RefreshCw } from "lucide-react";
import BackLink from "@/components/BackLink";
import { cn } from "@/lib/utils";
import { bankColor, FONT_SERIF, readSelectedBank } from "@/lib/vocab/theme";
import {
  getBankByCode, listBankWords, listMistakes, getWordsByIds,
  type VocabBank, type VocabWord,
} from "@/lib/vocab/data";
import { getScenePack, listSceneItems } from "@/lib/vocab/scenes";

/** 每页 25 词 —— A4 上 25 行还能留出足够的书写行高;再多就挤了。 */
const PER_PAGE = 25;

type SourceKind = "bank" | "mistakes" | "scene";
type Form = "en2blank" | "zh2blank" | "mixed";

const FORMS: { key: Form; label: string; hint: string }[] = [
  { key: "en2blank", label: "英 → 空", hint: "给英文写中文" },
  { key: "zh2blank", label: "中 → 空", hint: "给中文写英文" },
  { key: "mixed", label: "混合", hint: "两种交替" },
];

/** 一行题:左边给什么、右边空什么。 */
type Row = { prompt: string; answer: string; serif: boolean };

export default function VocabDictation() {
  const [params] = useSearchParams();
  const source = (params.get("from") as SourceKind) || "bank";
  const packId = params.get("pack");
  const bankCode = params.get("bank") || readSelectedBank() || "toefl";

  const [bank, setBank] = useState<VocabBank | null>(null);
  const [title, setTitle] = useState<string>("");
  const [words, setWords] = useState<VocabWord[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [form, setForm] = useState<Form>("en2blank");
  const [withAnswers, setWithAnswers] = useState(true);
  /** 打乱种子:换一批就重新洗,让同一来源能印出不同顺序的卷子 */
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    let alive = true;
    setWords(null); setFailed(false);
    (async () => {
      try {
        let list: VocabWord[] = [];
        let name = "";

        if (source === "mistakes") {
          const rows = await listMistakes();
          list = await getWordsByIds(rows.map(r => r.word_id));
          name = "错题本";
        } else if (source === "scene" && packId) {
          const [pack, items] = await Promise.all([getScenePack(packId), listSceneItems(packId)]);
          /* 场景节点里只有挂了 word_id 的才有正规释义可默写;
             搭配/词块没挂 word_id,直接用节点自身的中英文(它们本来就是成对的) */
          const ids = items.map(i => i.word_id).filter((x): x is string => !!x);
          const byId = new Map((await getWordsByIds(ids)).map(w => [w.id, w]));
          list = items.map(i => byId.get(i.word_id ?? "") ?? ({
            id: i.id, headword: i.text_en, ipa: null, pos: null,
            def_zh: i.text_zh, def_en: null, freq_rank: null, audio_url: null,
          } as VocabWord));
          name = pack?.title_zh ?? "场景";
        } else {
          const b = await getBankByCode(bankCode);
          if (!alive) return;
          setBank(b);
          list = b ? await listBankWords(b.id) : [];
          name = b?.name_zh ?? "词库";
        }
        if (!alive) return;
        setWords(list);
        setTitle(name);
      } catch {
        if (alive) setFailed(true);
      }
    })();
    return () => { alive = false; };
  }, [source, packId, bankCode]);

  const color = bankColor(bank?.code ?? bankCode);

  /* 取前 PER_PAGE*4 = 100 词封顶:默写纸是拿去写的,不是拿去存档的,
     一次印 4 页已经够一次课用了,再多纯属浪费纸。 */
  const picked = useMemo(() => {
    if (!words?.length) return [];
    const arr = [...words];
    /* 词库来源按 seed 洗牌(同一个库能印出不同卷);错题本/场景保持原序 ——
       错题本的顺序是"最该先清的在前",打乱就把这个信息丢了 */
    if (source === "bank") {
      let s = seed * 9301 + 49297;
      for (let i = arr.length - 1; i > 0; i--) {
        s = (s * 9301 + 49297) % 233280;
        const j = Math.floor((s / 233280) * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    return arr.slice(0, PER_PAGE * 4);
  }, [words, seed, source]);

  const rows: Row[] = useMemo(() => picked.map((w, i) => {
    const zhFirst = form === "zh2blank" || (form === "mixed" && i % 2 === 1);
    return zhFirst
      ? { prompt: w.def_zh ?? "—", answer: w.headword, serif: false }
      : { prompt: w.headword, answer: w.def_zh ?? "—", serif: true };
  }), [picked, form]);

  const pages = useMemo(() => {
    const out: Row[][] = [];
    for (let i = 0; i < rows.length; i += PER_PAGE) out.push(rows.slice(i, i + PER_PAGE));
    return out;
  }, [rows]);

  const today = new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10);

  return (
    <div className="min-h-screen bg-[#FAF7F2] print:bg-white">
      {/* 打印样式:A4 + 页边距 + 硬分页。写在这里而不是全局 css,
          免得影响别的页面的打印。 */}
      <style>{`
        @page { size: A4; margin: 14mm 12mm; }
        @media print {
          html, body { background: #fff !important; }
          .dict-page { break-after: page; }
          .dict-page:last-of-type { break-after: auto; }
        }
      `}</style>

      <div className="mx-auto w-full max-w-[820px] px-4 pb-16 pt-3 print:max-w-none print:px-0 print:pt-0">
        {/* ── 控制区:打印时整块消失 ── */}
        <div className="print:hidden">
          <BackLink to="/vocab" className="mb-2 inline-flex items-center gap-1 text-[13px] text-slate-500">
            ← 词汇中心
          </BackLink>
          <h1 className="text-[24px] font-bold tracking-tight text-slate-900">默写纸</h1>
          <p className="mb-3 text-[13px] text-slate-400">
            选好形式直接打印;A4、每页 {PER_PAGE} 词
          </p>

          <div className="rounded-2xl border border-black/[0.06] bg-white p-4">
            <div className="mb-1.5 text-[13px] font-semibold text-slate-700">形式</div>
            <div className="flex flex-wrap gap-2">
              {FORMS.map(f => (
                <button key={f.key} type="button" onClick={() => setForm(f.key)}
                  className={cn("rounded-full border px-3 py-1.5 text-[13px]",
                    form === f.key ? "border-transparent text-white" : "border-black/[0.08] bg-white text-slate-600")}
                  style={form === f.key ? { backgroundColor: color } : undefined}>
                  {f.label}<span className="ml-1 text-[11px] opacity-70">{f.hint}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-[14px] text-slate-700">
                <input type="checkbox" checked={withAnswers} onChange={e => setWithAnswers(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300" />
                附答案页(整页附在最后)
              </label>
              {source === "bank" && (
                <button type="button" onClick={() => setSeed(s => s + 1)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] px-3 py-1.5 text-[13px] text-slate-600">
                  <RefreshCw className="h-3.5 w-3.5" />换一批
                </button>
              )}
              <button type="button" onClick={() => window.print()} disabled={!rows.length}
                className={cn("ml-auto inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[15px] font-medium text-white",
                  !rows.length && "opacity-40")}
                style={{ backgroundColor: color }}>
                <Printer className="h-[17px] w-[17px]" />打印
              </button>
            </div>

            <p className="mt-3 text-[12px] text-slate-400">
              {words === null ? "取词中…"
                : failed ? "取词失败,换个来源试试"
                  : `${title} · 共 ${rows.length} 词 · ${pages.length} 页${withAnswers ? " + 答案页" : ""}`}
            </p>
          </div>
        </div>

        {/* ── 纸面 ── */}
        {rows.length > 0 && (
          <div className="mt-4 print:mt-0">
            {pages.map((page, pi) => (
              <section key={pi} className="dict-page mb-4 rounded-2xl border border-black/[0.06] bg-white p-6 print:mb-0 print:rounded-none print:border-0 print:p-0">
                <header className="mb-4 flex items-baseline justify-between border-b border-slate-200 pb-2">
                  <div className="text-[15px] font-semibold text-slate-900">
                    默写纸 · {title}
                    <span className="ml-2 text-[12px] font-normal text-slate-400">
                      {FORMS.find(f => f.key === form)?.label}
                    </span>
                  </div>
                  <div className="text-[12px] text-slate-400">
                    第 {pi + 1} / {pages.length} 页 · {today}
                  </div>
                </header>
                {/* 姓名/得分栏:打印出来是要人手写的 */}
                <div className="mb-4 flex gap-8 text-[13px] text-slate-500">
                  <span>姓名 ______________</span>
                  <span>日期 ____________</span>
                  <span>得分 ______ / {page.length}</span>
                </div>

                <ol className="space-y-0">
                  {page.map((r, i) => (
                    <li key={i} className="flex items-baseline gap-3 border-b border-dashed border-slate-200 py-[7px]">
                      <span className="w-6 shrink-0 text-right text-[12px] text-slate-400"
                        style={{ fontVariantNumeric: "tabular-nums" }}>{pi * PER_PAGE + i + 1}</span>
                      <span className={cn("w-[42%] shrink-0 text-[15px] text-slate-900")}
                        style={r.serif ? { fontFamily: FONT_SERIF } : undefined}>
                        {r.prompt}
                      </span>
                      {/* 空白书写区:一条实线,别用下划线字符(长度不可控) */}
                      <span className="min-w-0 flex-1 border-b border-slate-300" aria-hidden />
                    </li>
                  ))}
                </ol>
              </section>
            ))}

            {withAnswers && (
              <section className="dict-page rounded-2xl border border-black/[0.06] bg-white p-6 print:rounded-none print:border-0 print:p-0">
                <header className="mb-4 border-b border-slate-200 pb-2 text-[15px] font-semibold text-slate-900">
                  答案页 · {title}
                  <span className="ml-2 text-[12px] font-normal text-slate-400">共 {rows.length} 题</span>
                </header>
                {/* 答案排三列,一页放得下 100 题 */}
                <ol className="columns-2 gap-6 sm:columns-3">
                  {rows.map((r, i) => (
                    <li key={i} className="mb-1 break-inside-avoid text-[12px] leading-snug text-slate-700">
                      <span className="mr-1.5 text-slate-400" style={{ fontVariantNumeric: "tabular-nums" }}>{i + 1}.</span>
                      {r.answer}
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>
        )}

        {words !== null && rows.length === 0 && !failed && (
          <div className="mt-4 rounded-2xl border border-black/[0.06] bg-white p-8 text-center text-[14px] text-slate-500 print:hidden">
            {source === "mistakes" ? "错题本是空的,先去做几题" : "这个来源下没有可默写的词"}
          </div>
        )}
      </div>
    </div>
  );
}
