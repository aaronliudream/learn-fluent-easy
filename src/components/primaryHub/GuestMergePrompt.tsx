import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  busy: boolean;
  onReset: () => void;
  onMerge: () => void;
};

export function GuestMergePrompt({ open, busy, onReset, onMerge }: Props) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent
        className="max-w-md gap-5 sm:rounded-2xl"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <AlertDialogHeader className="text-left">
          <AlertDialogTitle className="text-xl">📚 发现学习记录</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm leading-relaxed text-[#444]">
              <p>我们在这个浏览器里检测到您之前的学习进度。</p>
              <p>是否将它们合并到您的账号？</p>
              <ul className="list-inside list-disc space-y-1 text-[#666]">
                <li>
                  选择「<strong className="font-semibold text-foreground">合并</strong>
                  」：之前的进度会保留
                </li>
                <li>
                  选择「<strong className="font-semibold text-foreground">从头开始</strong>
                  」：之前的进度会清除
                </li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-3 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 flex-1 rounded-xl text-base"
            disabled={busy}
            onClick={onReset}
          >
            从头开始
          </Button>
          <Button
            type="button"
            className="min-h-11 flex-1 rounded-xl bg-[#FF6B35] text-base hover:bg-[#e55a28]"
            disabled={busy}
            onClick={onMerge}
          >
            合并
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
