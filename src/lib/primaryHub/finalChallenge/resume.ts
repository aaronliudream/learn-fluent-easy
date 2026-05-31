/**
 * 《英语闯关》「继续闯关」轻记录 — 记住上次进入但未做完的闯关关卡
 *
 * 只存一条最近记录,供全局悬浮球 (ResumeFab) 跳回那一关用。点回去后正常
 * 重新抽题、从头做 —— 本记录**不**精确到第几题,只记到"哪一关"。
 *
 * 与既有进度系统 (progress.ts 的 fc_progress_*) 完全独立:那套记星数/解锁,
 * 这套只是一条"上次没做完"的便签,写/清互不影响。强化训练 (strengthen)
 * 不纳入本记录(它是另一套且本来就短)。
 *
 * 存储:优先 Capacitor Preferences(原生 app 上更耐久),取不到 / web 回退
 * localStorage。Preferences 接口是异步的,故本模块统一暴露 async 接口。
 * 运行时通过 window.Capacitor.Plugins.Preferences 探测,不静态依赖该插件
 * (未安装/未 sync 时自动走 localStorage,两者都不报错)。
 */

const RESUME_KEY = "fc:resume";

export interface ResumePoint {
  /** 年级 (路由年级)。 */
  grade: number;
  /** 册别。 */
  volume: "v1" | "v2";
  /** 第几关。 */
  levelId: number;
  /** 关名(悬浮球角标显示用,如"连词成句")。 */
  levelName: string;
  /** 写入时间戳(用于"最近一条"语义,可扩展过期清理)。 */
  ts: number;
}

/** 取 Capacitor Preferences 插件代理 (原生壳里有则返回,否则 null)。 */
function getPreferences(): {
  get(o: { key: string }): Promise<{ value: string | null }>;
  set(o: { key: string; value: string }): Promise<void>;
  remove(o: { key: string }): Promise<void>;
} | null {
  try {
    const cap = (globalThis as { Capacitor?: { Plugins?: Record<string, unknown> } }).Capacitor;
    const prefs = cap?.Plugins?.Preferences;
    return (prefs as ReturnType<typeof getPreferences>) ?? null;
  } catch {
    return null;
  }
}

function isResumePoint(v: unknown): v is ResumePoint {
  if (!v || typeof v !== "object") return false;
  const p = v as Record<string, unknown>;
  return (
    typeof p.grade === "number" &&
    (p.volume === "v1" || p.volume === "v2") &&
    typeof p.levelId === "number" &&
    typeof p.levelName === "string" &&
    typeof p.ts === "number"
  );
}

/** 写入"最后进入但未完成"的闯关关卡(进任一闯关关卡时调用)。 */
export async function setResume(point: ResumePoint): Promise<void> {
  const raw = JSON.stringify(point);
  const prefs = getPreferences();
  if (prefs) {
    try {
      await prefs.set({ key: RESUME_KEY, value: raw });
      return;
    } catch {
      // 落到 localStorage 兜底
    }
  }
  try {
    localStorage.setItem(RESUME_KEY, raw);
  } catch {
    // ignore storage errors
  }
}

/** 读取最近一条未完成记录;没有 / 解析失败返回 null。 */
export async function getResume(): Promise<ResumePoint | null> {
  const prefs = getPreferences();
  if (prefs) {
    try {
      const { value } = await prefs.get({ key: RESUME_KEY });
      if (value) {
        const parsed = JSON.parse(value) as unknown;
        return isResumePoint(parsed) ? parsed : null;
      }
      // Preferences 里没有 → 再看 localStorage(可能是 web 期写的旧记录)
    } catch {
      // 落到 localStorage 兜底
    }
  }
  try {
    const raw = localStorage.getItem(RESUME_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return isResumePoint(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** 清除未完成记录(关卡做到完成页时调用)。两处存储都清,避免残留。 */
export async function clearResume(): Promise<void> {
  const prefs = getPreferences();
  if (prefs) {
    try {
      await prefs.remove({ key: RESUME_KEY });
    } catch {
      // ignore
    }
  }
  try {
    localStorage.removeItem(RESUME_KEY);
  } catch {
    // ignore storage errors
  }
}
