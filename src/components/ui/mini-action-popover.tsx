import { EllipsisVertical, Info, Layers, NotebookPen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import styles from "./mini-action-popover.module.scss";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface MiniActionPopoverProps {
  itemLabel?: string;
}

const ACTION_ITEMS = [
  { id: "class", label: "Lop hoc", icon: Layers },
  { id: "info", label: "Thong tin", icon: Info },
  { id: "note", label: "Ghi chu", icon: NotebookPen },
] as const;

export function MiniActionPopover({ itemLabel }: MiniActionPopoverProps) {
  const [open, setOpen] = useState(false);

  const handleActionClick = (actionLabel: string) => {
    const suffix = itemLabel ? `: ${itemLabel}` : "";
    toast.info(`Da chon ${actionLabel}${suffix}`);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className={styles.triggerBtn} aria-label="Mo thao tac">
          <EllipsisVertical size={14} />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={6}
        className={styles.popoverContent}
      >
        <div className={styles.actionList}>
          {ACTION_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={styles.actionBtn}
              onClick={() => handleActionClick(label)}
            >
              <Icon size={14} className={styles.actionIcon} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
