// 资料下载区(landing 四学段卡之下)。纯新增,自成一体,不碰任何现有模块。
// 两级分类:category Tab → (有 subject 的大类)subject 二级分组 / (无 subject)平铺。
// 下载控制:登录→签名URL下完整文件;游客→引导注册;预览人人可看(有限预览)。
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Download, Eye, FileText, Loader2 } from "lucide-react";
import { T } from "@/i18n/T";
import { saveRedirectPath } from "@/lib/authRedirect";
import { useExamWhitelisted } from "@/lib/gaokaoHub/examGate";
import {
  fetchDownloads,
  getFullDownloadUrl,
  getPreviewUrl,
  type DownloadCategory,
  type DownloadItem,
  type DownloadSubject,
} from "@/lib/downloads";

function fileTypeChip(ft: string): { label: string; cls: string } {
  const t = (ft || "").toLowerCase();
  if (t.includes("pdf")) return { label: "PDF", cls: "bg-red-100 text-red-700" };
  if (t.includes("doc")) return { label: "WORD", cls: "bg-blue-100 text-blue-700" };
  if (t.includes("ppt")) return { label: "PPT", cls: "bg-orange-100 text-orange-700" };
  if (t.includes("xls")) return { label: "EXCEL", cls: "bg-emerald-100 text-emerald-700" };
  return { label: (ft || "FILE").toUpperCase(), cls: "bg-slate-100 text-slate-600" };
}

function MaterialCard({ item }: { item: DownloadItem }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState<null | "preview" | "download">(null);
  const ft = fileTypeChip(item.file_type);

  const onPreview = async () => {
    if (busy) return;
    setBusy("preview");
    try {
      const url = await getPreviewUrl(item);
      if (url) window.open(url, "_blank", "noopener");
      else toast("该资料暂无预览");
    } finally {
      setBusy(null);
    }
  };

  const onDownload = async () => {
    if (busy) return;
    setBusy("download");
    try {
      const res = await getFullDownloadUrl(item);
      if (res.ok) {
        window.open(res.url, "_blank", "noopener");
      } else if (res.reason === "guest") {
        toast("注册后即可下载完整资料 ✨", {
          description: "游客可预览,登录/注册后免费下载全部资料。",
          duration: 7000,
          action: {
            label: "去注册 / 登录",
            onClick: () => { saveRedirectPath(); navigate("/auth"); },
          },
        });
      } else {
        toast("下载链接生成失败,请稍后重试");
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
          <FileText className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-bold text-slate-900">{item.title}</h4>
          {item.description && (
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
              {item.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
          {item.material_type}
        </span>
        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${ft.cls}`}>{ft.label}</span>
      </div>

      <div className="mt-3 flex gap-2">
        {item.preview_path && (
          <button
            onClick={onPreview}
            disabled={busy !== null}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {busy === "preview" ? <Loader2 className="size-3.5 animate-spin" /> : <Eye className="size-3.5" />}
            <T>预览</T>
          </button>
        )}
        <button
          onClick={onDownload}
          disabled={busy !== null}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-indigo-600 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {busy === "download" ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
          <T>下载</T>
        </button>
      </div>
    </div>
  );
}

function EmptyHint() {
  return (
    <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white/60 py-10 text-center text-sm text-slate-400">
      <T>资料陆续上传中…</T>
    </div>
  );
}

export default function DownloadsSection() {
  // 纯前端藏入口:只有白名单 email(aaron)登录才渲染整块(复用高考真题那套 email gate)。
  const whitelisted = useExamWhitelisted();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<DownloadCategory[]>([]);
  const [subjects, setSubjects] = useState<DownloadSubject[]>([]);
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [activeCat, setActiveCat] = useState<number | null>(null);

  useEffect(() => {
    if (!whitelisted) return; // 非白名单不取数,整块不渲染
    let alive = true;
    fetchDownloads().then((d) => {
      if (!alive) return;
      setCategories(d.categories);
      setSubjects(d.subjects);
      setItems(d.items);
      setActiveCat(d.categories[0]?.id ?? null);
      setLoading(false);
    });
    return () => { alive = false; };
  }, [whitelisted]);

  const catSubjects = useMemo(
    () => subjects.filter((s) => s.category_id === activeCat),
    [subjects, activeCat],
  );
  const catItems = useMemo(
    () => items.filter((i) => i.category_id === activeCat),
    [items, activeCat],
  );

  // 非白名单 email → 整块不渲染(连标题带 Tab 全不出现)。
  if (!whitelisted) return null;
  // 数据没回来 / 表还没建 → 整块隐藏,landing 不受任何影响。
  if (loading || categories.length === 0) return null;

  return (
    <section id="downloads" className="bg-white py-10 md:py-12">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <h2 className="text-lg font-bold text-slate-900 md:text-xl">
          <T>资料下载区</T>
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          <T>各学段真题/讲义/词汇/范文等资料,注册后免费下载。</T>
        </p>

        {/* 学段大类 Tab */}
        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={
                "rounded-full px-4 py-1.5 text-sm font-semibold transition " +
                (c.id === activeCat
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200")
              }
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* 内容:有 subject 的大类(成人·考试)按二级分组;否则平铺 */}
        <div className="mt-5">
          {catItems.length === 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <EmptyHint />
            </div>
          ) : catSubjects.length > 0 ? (
            <div className="space-y-7">
              {catSubjects.map((sub) => {
                const subItems = catItems.filter((i) => i.subject_id === sub.id);
                if (subItems.length === 0) return null;
                return (
                  <div key={sub.id}>
                    <h3 className="mb-2.5 text-sm font-bold text-slate-700">{sub.name}</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {subItems.map((i) => <MaterialCard key={i.id} item={i} />)}
                    </div>
                  </div>
                );
              })}
              {/* 未归入任何 subject 的资料 */}
              {catItems.some((i) => i.subject_id == null) && (
                <div>
                  <h3 className="mb-2.5 text-sm font-bold text-slate-700"><T>其它</T></h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {catItems.filter((i) => i.subject_id == null).map((i) => (
                      <MaterialCard key={i.id} item={i} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {catItems.map((i) => <MaterialCard key={i.id} item={i} />)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
