import { EllipsisVertical } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import styles from "./mini-action-popover.module.scss";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "./utils";

interface MiniActionPopoverProps {
  itemLabel?: string;
  actions?: ReadonlyArray<{ id: string; label: string } | null | undefined>;
  onActionSelect?: (actionId: string) => void;
  triggerClassName?: string;
  children?: React.ReactNode;
}

const ACTION_ITEMS = [
  { id: "class", label: "Lớp học" },
  { id: "info", label: "Thông tin" },
  { id: "note", label: "Ghi chú" },
] as const;

export function MiniActionPopover({
  itemLabel,
  actions,
  onActionSelect,
  triggerClassName,
  children,
}: MiniActionPopoverProps) {
  const [open, setOpen] = useState(false);

  const resolvedActions =
    actions
      ?.filter(
        (action): action is { id: string; label: string } =>
          !!action &&
          typeof action.id === "string" &&
          typeof action.label === "string",
      )
      .map(({ id, label }) => ({ id, label })) ??
    ACTION_ITEMS.map(({ id, label }) => ({ id, label }));

  const handleActionClick = (actionId: string, actionLabel: string) => {
    if (onActionSelect) {
      onActionSelect(actionId);
      setOpen(false);
      return;
    }

    const suffix = itemLabel ? `: ${itemLabel}` : "";
    toast.info(`Da chon ${actionLabel}${suffix}`);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(styles.triggerBtn, triggerClassName)}
          aria-label="Mo thao tac"
        >
          {children ?? <EllipsisVertical size={14} />}
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={6}
        collisionPadding={8}
        avoidCollisions
        className={styles.popoverContent}
      >
        <div className={styles.actionList}>
          {resolvedActions.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={styles.actionBtn}
              onClick={() => handleActionClick(id, label)}
            >
              <span>{label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
