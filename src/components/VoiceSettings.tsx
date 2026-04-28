import { useEffect, useState } from "react";
import { Settings2, Volume2, X, Check, Play, Sparkles } from "lucide-react";
import { VOICES, SPEED_PRESETS, loadSettings, saveSettings, type VoiceSettings as VS } from "@/lib/voice";
import { speak, clearAudioCache, getLastSpoken } from "@/lib/speak";

export const VoiceSettingsButton = () => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<VS>(loadSettings);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    if (open) setDraft(loadSettings());
  }, [open]);

  const apply = (next: VS) => {
    setDraft(next);
    saveSettings(next);
    clearAudioCache();
  };

  const preview = async () => {
    setPreviewing(true);
    try {
      await speak("Hello, this is how I sound. Let's start learning English together.");
    } finally {
      setPreviewing(false);
    }
  };

  const replayLast = async () => {
    const last = getLastSpoken();
    if (last) await speak(last);
    else await preview();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="grid size-10 place-items-center rounded-full text-foreground/60 transition hover:bg-secondary hover:text-foreground"
        aria-label="Voice settings"
      >
        <Settings2 className="size-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm md:items-center md:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-t-3xl bg-card p-6 shadow-2xl md:rounded-3xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                  <Volume2 className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">语音设置</h2>
                  <p className="text-xs text-muted-foreground">选择你喜欢的发音角色和语速</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid size-9 place-items-center rounded-full text-foreground/60 hover:bg-secondary"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mb-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                角色 Voice
              </p>
              <div className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {VOICES.map((v) => {
                  const active = draft.voiceId === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => apply({ ...draft, voiceId: v.id })}
                      className={`flex items-center justify-between rounded-2xl border p-3 text-left transition ${
                        active
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border/60 bg-secondary/40 hover:border-primary/40"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          {v.name}
                          <span className="text-[10px] font-normal text-muted-foreground">
                            {v.accent}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">{v.desc}</div>
                      </div>
                      {active && (
                        <div className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                语速 Speed · {draft.speed.toFixed(2)}x
              </p>
              <div className="flex flex-wrap gap-2">
                {SPEED_PRESETS.map((s) => {
                  const active = Math.abs(draft.speed - s.value) < 0.001;
                  return (
                    <button
                      key={s.value}
                      onClick={() => apply({ ...draft, speed: s.value })}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                        active
                          ? "bg-primary text-primary-foreground shadow"
                          : "bg-secondary text-foreground/70 hover:bg-secondary/70"
                      }`}
                    >
                      {s.label} <span className="ml-1 text-xs opacity-70">{s.value}x</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={preview}
                disabled={previewing}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary/70 disabled:opacity-60"
              >
                <Play className="size-4" />
                试听示例
              </button>
              <button
                onClick={replayLast}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary/80 px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:opacity-95"
              >
                <Volume2 className="size-4" />
                重播当前
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed text-foreground/80">
              <div className="mb-1 flex items-center gap-1.5 font-semibold text-primary">
                <Sparkles className="size-3.5" />
                让发音更自然（强烈推荐）
              </div>
              <p className="mb-1">
                <span className="font-medium">iPhone：</span>设置 → 辅助功能 → 朗读内容 → 声音 → 英语 →
                选 <span className="font-semibold">Allison / Samantha / Ava / Susan</span> 等标有
                <span className="font-semibold">「增强」</span>的版本，点云朵图标下载（约 100MB）。不要选 Voice 1 / Voice 2，它们是 Siri 专用声音。
              </p>
              <p>
                <span className="font-medium">Android：</span>设置 → 系统 → 语言和输入法 → 文字转语音 →
                选 Google 引擎并下载高质量英语语音包。
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};