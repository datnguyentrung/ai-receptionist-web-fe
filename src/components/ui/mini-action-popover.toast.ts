import { toast } from "sonner";

export function showComingSoonActionToast(
  actionLabel: string,
  itemLabel?: string,
) {
  const suffix = itemLabel ? ` (${itemLabel})` : "";
  toast.warning("Chức năng đang được phát triển", {
    description: `Bạn đã chọn ${actionLabel}${suffix} nhưng chức năng này đang được phát triển. Vui lòng chờ trong giây lát!`,
  });
}
