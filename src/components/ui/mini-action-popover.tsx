import { EllipsisVertical } from "lucide-react";
import { useState, type MouseEvent } from "react";
import { toast } from "sonner";
import styles from "./mini-action-popover.module.scss";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "./utils";

type ActionItem = { id: string; label: string };
type SeparatorItem = { id: "__separator__" };
type PopoverActionItem = ActionItem | SeparatorItem;

interface MiniActionPopoverProps {
  itemLabel?: string;
  actions?: ReadonlyArray<ActionItem | SeparatorItem | null | undefined>;
  onActionSelect?: (actionId: string) => void;
  triggerClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
  title?: string;
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
  contentClassName,
  disabled,
  title,
  children,
}: MiniActionPopoverProps) {
  const [open, setOpen] = useState(false);

  const resolvedActions =
    actions
      ?.filter((action): action is PopoverActionItem => !!action)
      .map((action) =>
        "label" in action
          ? { id: action.id, label: action.label }
          : { id: "__separator__" as const },
      ) ?? ACTION_ITEMS.map(({ id, label }) => ({ id, label }));

  const handleActionClick = (
    event: MouseEvent<HTMLButtonElement>,
    actionId: string,
    actionLabel: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (onActionSelect) {
      onActionSelect(actionId);
      setOpen(false);
      return;
    }

    const suffix = itemLabel ? ` (${itemLabel})` : "";
    toast.message("Chức năng đang được phát triển", {
      description: `Bạn đã chọn ${actionLabel}${suffix} nhưng chức năng này đang được phát triển. Vui lòng chờ trong giây lát!`,
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          title={title}
          className={cn(
            styles.triggerBtn,
            children ? styles.triggerInline : "",
            triggerClassName,
          )}
          aria-label="Mo thao tac"
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.stopPropagation();

            if (disabled) {
              event.preventDefault();
            }
          }}
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
        className={cn(styles.popoverContent, contentClassName)}
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div className={styles.actionList}>
          {resolvedActions.map((item, index) =>
            !("label" in item) ? (
              <div key={`separator-${index}`} className={styles.separator} />
            ) : (
              (() => {
                const actionItem = item as ActionItem;
                return (
                  <button
                    key={actionItem.id}
                    type="button"
                    className={styles.actionBtn}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                    }}
                    onClick={(event) =>
                      handleActionClick(event, actionItem.id, actionItem.label)
                    }
                  >
                    <span>{actionItem.label}</span>
                  </button>
                );
              })()
            ),
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
