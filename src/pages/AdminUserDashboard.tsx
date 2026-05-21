import { T } from "@/i18n/T";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Clock,
  Loader2,
  Search,
  Shield,
  User,
  XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminGate } from "@/hooks/useAdminGate";

type UserRow = {
  user_id: string;
  email: string | null;
  display_name: string;
  is_guest: boolean;
  created_at: string;
  recommended_grade: string | null;
  current_year_band: string | null;
  open_mistakes: number;
  total_mistakes: number;
  last_active_at: string | null;
  primary_score: number;
  junior_score: number;
  gaokao_score: number;
};

type MasteryRow = {
  stage: string;
  grade: number | null;
  module: string;
  master_count: number;
  fluent_count: number;
  weak_count: number;
  none_count: number;
  score_pct: number;
  user_total: number;
};

type MistakeRow = {
  id: string;
  module: string;
  source_key: string;
  source_label: string | null;
  question: string;
  user_answer: string | null;
  correct_answer: string | null;
  explanation: string | null;
  wrong_count: number;
  is_resolved: boolean;
  is_starred: boolean;
  last_wrong_at: string;
  created_at: string;
};

type RecentItem = {
  stage: string;
  grade: number | null;
  module: string;
  item_type: string;
  item_label: string | null;
  state: string;
  attempt_count: number;
  correct_count: number;
  wrong_count: number;
  accuracy_pct: number;
  last_review_at: string | null;
};

type UserLearning = {
  profile: {
    user_id: string;
    email: string | null;
    display_name: string;
    is_guest: boolean;
    created_at: string;
    recommended_grade: string | null;
    current_year_band: string | null;
    learning_goal: string | null;
    target_language: string | null;
  };
  days_window: number;
  mastery: MasteryRow[];
  mistakes: MistakeRow[];
  activity: {
    minutes_total: number;
    by_segment: { segment: string; minutes: number; days: number }[];
  };
  recent_items: RecentItem[];
};

const STAGE_LABEL: Record<string, string> = {
  primary: "小学",
  junior: "初中",
  gaokao: "高考",
};

const MODULE_LABEL: Record<string, string> = {
  vocab: "词汇",
  reading: "阅读",
  listening: "听力",
  writing: "写作",
  grammar: "语法",
  speaking: "口语",
  lesson: "课程",
  slang: "俚语",
  exam: "考试",
};

const STATE_LABEL: Record<string, string> = {
  master: "掌握",
  fluent: "熟练",
  weak: "薄弱",
  none: "未学",
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("zh-CN", { dateStyle: "short", timeStyle: "short" });
}

function scoreBadge(score: number) {
  if (score >= 80) return "bg-emerald-100 text-emerald-800";
  if (score >= 50) return "bg-amber-100 text-amber-800";
  if (score > 0) return "bg-rose-100 text-rose-800";
  return "bg-secondary text-muted-foreground";
}

export default function AdminUserDashboard() {
  const { loading: gateLoading, authed, isAdmin, email } = useAdminGate();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<UserLearning | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<"overview" | "mistakes" | "recent">("overview");
  const [mistakeFilter, setMistakeFilter] = useState<"open" | "all">("open");

  const loadUsers = useCallback(async (q: string) => {
    setListLoading(true);
    const { data, error } = await supabase.rpc("admin_list_users", {
      p_search: q.trim(),
      p_limit: 100,
    });
    if (error) console.error(error);
    setUsers((data as UserRow[]) ?? []);
    setListLoading(false);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    loadUsers("");
  }, [isAdmin, loadUsers]);

  useEffect(() => {
    if (!isAdmin) return;
    const t = setTimeout(() => loadUsers(search), 300);
    return () => clearTimeout(t);
  }, [search, isAdmin, loadUsers]);

  async function openUser(userId: string) {
    setSelectedId(userId);
    setDetail(null);
    setDetailLoading(true);
    setDetailTab("overview");
    setMistakeFilter("open");
    const { data, error } = await supabase.rpc("admin_get_user_learning", {
      p_user_id: userId,
      p_days: 30,
    });
    if (error) console.error(error);
    setDetail(data as UserLearning);
    setDetailLoading(false);
  }

  if (gateLoading) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <Loader2 className="size-5 animate-spin" /> <T>加载中…</T>
      </main>
    );
  }
  if (!authed) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <p><T>请先登录。</T></p>
        <Link to="/auth" className="mt-2 inline-block text-sm text-primary underline"><T>去登录</T></Link>
      </main>
    );
  }
  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <p><T>仅管理员可访问此页面。</T></p>
      </main>
    );
  }

  const filteredMistakes = (detail?.mistakes ?? []).filter((m) =>
    mistakeFilter === "open" ? !m.is_resolved : true,
  );

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 md:py-10">
      <Link to="/account" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回账户</T>
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="size-6 text-purple-600" />
            <h1 className="text-2xl font-extrabold"><T>用户学习后台</T></h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            <T>查看每位用户的学习进度与错题（仅管理员可见）</T>
            {email ? ` · ${email}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/feedback"
            className="rounded-xl border bg-card px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            <T>反馈管理</T>
          </Link>
          <Link
            to="/admin/grammar-content"
            className="rounded-xl border bg-card px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            <T>语法内容</T>
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* User list */}
        <section className="lg:col-span-2">
          <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50/80 to-indigo-50/50 p-4 shadow-card">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索邮箱、昵称…"
                className="w-full rounded-xl border bg-white py-2.5 pl-9 pr-3 text-sm outline-none ring-purple-300 focus:ring-2"
              />
            </div>

            <div className="mt-3 max-h-[70vh] space-y-2 overflow-y-auto">
              {listLoading && (
                <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> <T>加载用户…</T>
                </div>
              )}
              {!listLoading && users.length === 0 && (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  <T>未找到用户</T>
                </div>
              )}
              {users.map((u) => (
                <button
                  key={u.user_id}
                  type="button"
                  onClick={() => openUser(u.user_id)}
                  className={`w-full rounded-xl border-2 p-3 text-left transition hover:border-purple-400 ${
                    selectedId === u.user_id
                      ? "border-purple-500 bg-white shadow-md"
                      : "border-transparent bg-white/70"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="size-4 shrink-0 text-purple-600" />
                    <span className="truncate font-bold text-sm">{u.display_name}</span>
                    {u.is_guest && (
                      <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                        <T>访客</T>
                      </span>
                    )}
                    <ChevronRight className="ml-auto size-4 text-muted-foreground" />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{u.email ?? "无邮箱"}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${scoreBadge(u.primary_score)}`}>
                      小学 {u.primary_score}%
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${scoreBadge(u.junior_score)}`}>
                      初中 {u.junior_score}%
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${scoreBadge(u.gaokao_score)}`}>
                      高考 {u.gaokao_score}%
                    </span>
                    {u.open_mistakes > 0 && (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                        {u.open_mistakes} <T>错题</T>
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[10px] text-muted-foreground">
                    <Clock className="mr-0.5 inline size-3" />
                    <T>最近活跃</T> {fmtDate(u.last_active_at)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Detail panel */}
        <section className="lg:col-span-3">
          {!selectedId && (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center text-muted-foreground">
              <BookOpen className="mb-3 size-10 opacity-40" />
              <p className="font-bold"><T>点击左侧用户查看学习详情</T></p>
            </div>
          )}

          {selectedId && detailLoading && (
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border bg-card p-8">
              <Loader2 className="size-6 animate-spin text-purple-600" />
            </div>
          )}

          {selectedId && !detailLoading && detail && (
            <div className="rounded-2xl border-2 border-border bg-card shadow-card">
              <div className="border-b p-4 md:p-5">
                <h2 className="text-xl font-extrabold">{detail.profile.display_name}</h2>
                <p className="text-sm text-muted-foreground">{detail.profile.email ?? "无邮箱"}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span><T>注册</T> {fmtDate(detail.profile.created_at)}</span>
                  {detail.profile.recommended_grade && (
                    <span>· <T>推荐年级</T> {detail.profile.recommended_grade}</span>
                  )}
                  {detail.profile.current_year_band && (
                    <span>· {detail.profile.current_year_band}</span>
                  )}
                  {detail.profile.is_guest && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-800"><T>访客账户</T></span>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  <div className="rounded-xl bg-secondary px-3 py-2 text-center">
                    <div className="text-lg font-extrabold">{detail.activity?.minutes_total ?? 0}</div>
                    <div className="text-[10px] text-muted-foreground"><T>近30天分钟</T></div>
                  </div>
                  <div className="rounded-xl bg-secondary px-3 py-2 text-center">
                    <div className="text-lg font-extrabold text-rose-600">
                      {detail.mistakes.filter((m) => !m.is_resolved).length}
                    </div>
                    <div className="text-[10px] text-muted-foreground"><T>未解决错题</T></div>
                  </div>
                  <div className="rounded-xl bg-secondary px-3 py-2 text-center">
                    <div className="text-lg font-extrabold">{detail.recent_items.length}</div>
                    <div className="text-[10px] text-muted-foreground"><T>最近学习项</T></div>
                  </div>
                </div>
              </div>

              <div className="border-b px-4 pt-3">
                <div className="inline-flex rounded-xl border bg-secondary/50 p-1">
                  {([
                    ["overview", "学习概况"],
                    ["mistakes", "错题"],
                    ["recent", "最近学习"],
                  ] as const).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDetailTab(key)}
                      className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                        detailTab === key
                          ? "bg-white text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <T>{label}</T>
                      {key === "mistakes" && (
                        <span className="ml-1 text-rose-600">
                          ({detail.mistakes.filter((m) => !m.is_resolved).length})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-4 md:p-5">
                {detailTab === "overview" && (
                  <div className="space-y-4">
                    {detail.mastery.length === 0 ? (
                      <p className="text-sm text-muted-foreground"><T>暂无学习数据</T></p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b text-muted-foreground">
                              <th className="pb-2 pr-2 font-bold"><T>学段</T></th>
                              <th className="pb-2 pr-2 font-bold"><T>模块</T></th>
                              <th className="pb-2 pr-2 font-bold"><T>掌握度</T></th>
                              <th className="pb-2 pr-2 font-bold"><T>掌握/熟练/薄弱</T></th>
                              <th className="pb-2 font-bold"><T>条目</T></th>
                            </tr>
                          </thead>
                          <tbody>
                            {detail.mastery.map((m, i) => (
                              <tr key={i} className="border-b border-border/50">
                                <td className="py-2 pr-2">
                                  {STAGE_LABEL[m.stage] ?? m.stage}
                                  {m.grade != null ? ` G${m.grade}` : ""}
                                </td>
                                <td className="py-2 pr-2">{MODULE_LABEL[m.module] ?? m.module}</td>
                                <td className="py-2 pr-2">
                                  <span className={`rounded-full px-2 py-0.5 font-bold ${scoreBadge(Number(m.score_pct))}`}>
                                    {Math.round(Number(m.score_pct))}%
                                  </span>
                                </td>
                                <td className="py-2 pr-2 text-muted-foreground">
                                  {m.master_count}/{m.fluent_count}/{m.weak_count}
                                </td>
                                <td className="py-2">{m.user_total}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {(detail.activity?.by_segment?.length ?? 0) > 0 && (
                      <div>
                        <h3 className="mb-2 text-sm font-bold"><T>近30天学习时长（按板块）</T></h3>
                        <div className="flex flex-wrap gap-2">
                          {detail.activity.by_segment.map((s) => (
                            <span
                              key={s.segment}
                              className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-800"
                            >
                              {s.segment}: {s.minutes}<T>分钟</T> · {s.days}<T>天</T>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {detailTab === "mistakes" && (
                  <div>
                    <div className="mb-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setMistakeFilter("open")}
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          mistakeFilter === "open" ? "bg-rose-500 text-white" : "bg-secondary"
                        }`}
                      >
                        <T>未解决</T> ({detail.mistakes.filter((m) => !m.is_resolved).length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setMistakeFilter("all")}
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          mistakeFilter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary"
                        }`}
                      >
                        <T>全部</T> ({detail.mistakes.length})
                      </button>
                    </div>

                    {filteredMistakes.length === 0 ? (
                      <p className="text-sm text-muted-foreground"><T>暂无错题记录</T></p>
                    ) : (
                      <div className="space-y-3">
                        {filteredMistakes.map((m) => (
                          <div
                            key={m.id}
                            className={`rounded-xl border-2 p-3 ${
                              m.is_resolved ? "border-border bg-secondary/30" : "border-rose-200 bg-rose-50/40"
                            }`}
                          >
                            <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px]">
                              <span className="font-bold">{MODULE_LABEL[m.module] ?? m.module}</span>
                              {m.source_label && (
                                <span className="text-muted-foreground">{m.source_label}</span>
                              )}
                              {!m.is_resolved && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-200 px-2 py-0.5 font-bold text-rose-800">
                                  <XCircle className="size-3" /> <T>未解决</T>
                                </span>
                              )}
                              <span className="ml-auto text-muted-foreground">
                                ×{m.wrong_count} · {fmtDate(m.last_wrong_at)}
                              </span>
                            </div>
                            <p className="text-sm font-medium">{m.question}</p>
                            <div className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
                              <p>
                                <span className="text-muted-foreground"><T>学生答案：</T></span>{" "}
                                <span className="font-bold text-rose-700">{m.user_answer ?? "—"}</span>
                              </p>
                              <p>
                                <span className="text-muted-foreground"><T>正确答案：</T></span>{" "}
                                <span className="font-bold text-emerald-700">{m.correct_answer ?? "—"}</span>
                              </p>
                            </div>
                            {m.explanation && (
                              <p className="mt-2 rounded-lg bg-white/80 p-2 text-xs text-muted-foreground">
                                {m.explanation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {detailTab === "recent" && (
                  <div>
                    {detail.recent_items.length === 0 ? (
                      <p className="text-sm text-muted-foreground"><T>暂无最近学习记录</T></p>
                    ) : (
                      <div className="space-y-2">
                        {detail.recent_items.map((item, i) => (
                          <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl border bg-secondary/20 px-3 py-2 text-xs">
                            <span className="font-bold">
                              {STAGE_LABEL[item.stage] ?? item.stage}
                              {item.grade != null ? ` G${item.grade}` : ""}
                            </span>
                            <span>{MODULE_LABEL[item.module] ?? item.module}</span>
                            <span className="text-muted-foreground">{item.item_type}</span>
                            <span className="max-w-[200px] truncate font-medium">
                              {item.item_label ?? item.item_type}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 font-bold ${
                              item.state === "master" ? "bg-emerald-100 text-emerald-800"
                              : item.state === "fluent" ? "bg-blue-100 text-blue-800"
                              : item.state === "weak" ? "bg-amber-100 text-amber-800"
                              : "bg-secondary text-muted-foreground"
                            }`}>
                              {STATE_LABEL[item.state] ?? item.state}
                            </span>
                            <span className="text-muted-foreground">
                              {item.accuracy_pct}% · {item.attempt_count}<T>次</T>
                            </span>
                            <span className="ml-auto text-muted-foreground">{fmtDate(item.last_review_at)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
