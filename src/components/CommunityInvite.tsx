import { useState } from "react";
import { Users, Gift, Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Homepage WeChat community invite block.
 *
 * Offer: pay ¥10 to unlock 3 trial lessons + join the WeChat learning group
 * once we hit 100 members. Replace `public/community/wechat-group.png` with
 * your real personal WeChat QR code so people can scan and add you.
 */
const GOAL = 100;
// Bump this manually as you confirm new paid members, or wire it to a
// `community_members` table later.
const CURRENT = 12;
const PRICE_RMB = 10;
const TRIAL_LESSONS = 3;
const QR_SRC = "/community/wechat-group.png";

export function CommunityInvite() {
  const { lang } = useI18n();
  const zh = lang === "zh";
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const pct = Math.min(100, Math.round((CURRENT / GOAL) * 100));

  const tr = (zhText: string, enText: string) => (zh ? zhText : enText);

  const copyNote = async () => {
    const note = zh
      ? `你好！我想加入 Big Moon English 学习群，¥${PRICE_RMB} 解锁 ${TRIAL_LESSONS} 节体验课。`
      : `Hi! I'd like to join the Big Moon English group — ¥${PRICE_RMB} for ${TRIAL_LESSONS} trial lessons.`;
    try {
      await navigator.clipboard.writeText(note);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <section className="mt-6 overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-5 shadow-tile dark:from-emerald-950/40 dark:via-background dark:to-amber-950/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
            <Users className="size-7" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                <Sparkles className="size-3" /> {tr("限时招募", "Founding Members")}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                <Gift className="size-3" /> ¥{PRICE_RMB} · {TRIAL_LESSONS} {tr("节体验课", "trial lessons")}
              </span>
            </div>
            <h2 className="mt-1 text-lg font-extrabold leading-tight md:text-xl">
              {tr(
                "加入 Big Moon English 微信学习群",
                "Join the Big Moon English WeChat group",
              )}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground md:text-sm">
              {tr(
                `集满 ${GOAL} 人即开群。¥${PRICE_RMB} 解锁 ${TRIAL_LESSONS} 节体验课，我们会亲自拉你进群，一起学英语。`,
                `We open the group when we reach ${GOAL} members. Pay ¥${PRICE_RMB} to unlock ${TRIAL_LESSONS} trial lessons and get personally added by me.`,
              )}
            </p>

            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">
                  {tr("招募进度", "Progress")}
                </span>
                <span className="tabular-nums text-emerald-700 dark:text-emerald-300">
                  {CURRENT} / {GOAL}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-500/15">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {tr(
                  `还差 ${Math.max(0, GOAL - CURRENT)} 人开群 🎉`,
                  `${Math.max(0, GOAL - CURRENT)} more members to launch 🎉`,
                )}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 md:w-44">
            <Button
              onClick={() => setOpen(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
            >
              <Users className="size-4" />
              {tr("扫码加入", "Scan to join")}
            </Button>
            <p className="text-center text-[10px] text-muted-foreground">
              {tr("微信扫一扫", "Scan with WeChat")}
            </p>
          </div>
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="size-5 text-emerald-600" />
              {tr("加我微信加入学习群", "Add me on WeChat to join")}
            </DialogTitle>
            <DialogDescription>
              {tr(
                `扫码后备注 “Big Moon”，付款 ¥${PRICE_RMB} 即可解锁 ${TRIAL_LESSONS} 节体验课。集满 ${GOAL} 人正式开群。`,
                `Scan, message me “Big Moon”, and pay ¥${PRICE_RMB} to unlock ${TRIAL_LESSONS} trial lessons. The group launches at ${GOAL} members.`,
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="mx-auto w-2/3">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="aspect-square w-full bg-white p-2">
                <img
                  src={QR_SRC}
                  alt={tr("Big Moon English 微信二维码", "Big Moon English WeChat QR code")}
                  className="h-full w-full object-contain"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.opacity = "0.2";
                  }}
                />
              </div>
              <div className="bg-emerald-600 px-2 py-1.5 text-center text-xs font-semibold text-white">
                {tr("微信扫码加我", "Scan with WeChat")}
              </div>
            </div>
          </div>

          <ol className="space-y-1.5 text-xs text-muted-foreground">
            <li>1. {tr("打开微信 → 扫一扫", "Open WeChat → Scan")}</li>
            <li>2. {tr("添加好友，备注 “Big Moon”", "Add friend, note “Big Moon”")}</li>
            <li>
              3.{" "}
              {tr(
                `转账 ¥${PRICE_RMB}，我会发送 ${TRIAL_LESSONS} 节体验课`,
                `Send ¥${PRICE_RMB}, I'll deliver ${TRIAL_LESSONS} trial lessons`,
              )}
            </li>
            <li>
              4.{" "}
              {tr(
                `集满 ${GOAL} 人后，我会拉你进学习群 🎉`,
                `Once we hit ${GOAL} members, you'll be added to the group 🎉`,
              )}
            </li>
          </ol>

          <Button variant="outline" size="sm" onClick={copyNote} className="mx-auto">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied
              ? tr("已复制", "Copied")
              : tr("复制添加备注", "Copy intro note")}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CommunityInvite;