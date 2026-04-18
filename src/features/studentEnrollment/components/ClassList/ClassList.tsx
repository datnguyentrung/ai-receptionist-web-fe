import { cn } from "@/components/ui/utils";
import type { ClassScheduleSummary } from "@/types";
import { Calendar, Check, Loader2, MapPin } from "lucide-react";
import {
  ScheduleLevelLabel,
  ScheduleLocationLabel,
} from "../../../../config/constants";
import { formatTimeStringHM } from "../../../../utils/format";
import { getLabelClassSchedule } from "../../../../utils/getInitials";
import styles from "./ClassList.module.scss";

interface ClassListProps {
  hasBranch: boolean;
  isLoading: boolean;
  classList: ClassScheduleSummary[];
  selectedIds?: Set<string>;
  disabledIds?: Set<string>;
  onToggle?: (scheduleId: string) => void;
  onAction?: (scheduleId: string) => void;
  actionLabel?: string;
  isCompact?: boolean;
  variant?: "stack" | "grid";
}

/**
 * Component hiển thị danh sách Lớp học - Custom UI.
 * Hỗ trợ 2 chế độ: Chọn (Checkbox) hoặc Hành động (Nút bấm như Xóa).
 */
export default function ClassList({
  hasBranch,
  isLoading,
  classList,
  selectedIds = new Set(),
  disabledIds = new Set(),
  onToggle,
  onAction,
  actionLabel,
  isCompact = false,
  variant = "stack",
}: ClassListProps) {
  return (
    <div
      className={cn(
        styles.field,
        styles.fieldTransition,
        !hasBranch && styles.fieldDisabled,
      )}
    >
      {!hasBranch && (
        <div className={styles.stateBox}>
          <div className={styles.stateEmoji}>🏫</div>
          <span>Chưa có dữ liệu lớp học để hiển thị</span>
        </div>
      )}

      {hasBranch && isLoading && (
        <div className={styles.stateBox}>
          <Loader2 className={cn(styles.stateLoader, "animate-spin")} />
          <span>Đang tải danh sách lớp học...</span>
        </div>
      )}

      {hasBranch && !isLoading && classList.length === 0 && (
        <div className={styles.stateBox}>
          <div className={styles.stateEmoji}>📭</div>
          <span>Hiện chưa có lớp học nào phù hợp.</span>
        </div>
      )}

      {hasBranch && !isLoading && classList.length > 0 && (
        <div
          className={cn(
            styles.listRoot,
            variant === "grid" && styles.listRootGrid,
          )}
        >
          {classList.map((cls) => {
            const isSelected = selectedIds.has(cls.scheduleId);
            const isDisabled = disabledIds.has(cls.scheduleId);

            return (
              <div
                key={cls.scheduleId}
                className={cn(
                  styles.classItem,
                  variant === "grid" && styles.classItemGrid,
                  isCompact && styles.classItemCompact,
                  isSelected && styles.classItemSelected,
                  isDisabled && styles.classItemDisabled,
                  onAction && styles.classItemStaticAction,
                )}
                onClick={() => {
                  if (onAction || isDisabled) {
                    return;
                  }

                  onToggle?.(cls.scheduleId);
                }}
              >
                {!onAction && (
                  <div className={styles.classCheck}>
                    {isSelected && (
                      <Check className={styles.checkIcon} strokeWidth={3} />
                    )}
                  </div>
                )}

                <div className={styles.content}>
                  <div
                    className={cn(
                      styles.title,
                      isCompact && styles.titleCompact,
                    )}
                  >
                    {getLabelClassSchedule(cls.scheduleId)}
                  </div>
                  {cls.branchName && (
                    <div className={styles.meta}>
                      {cls.weekday && (
                        <span className={styles.metaItem}>
                          <Calendar size={11} className={styles.metaIcon} />
                          {ScheduleLocationLabel[cls.scheduleLocation]}{" "}
                          {formatTimeStringHM(cls.startTime)}
                        </span>
                      )}
                      <span className={styles.metaItem}>
                        <MapPin size={11} className={styles.metaIcon} />
                        {ScheduleLevelLabel[cls.scheduleLevel] ||
                          cls.branchName}
                      </span>
                    </div>
                  )}
                </div>

                {onAction && (
                  <div className={styles.deleteWrapper}>
                    <button
                      type="button"
                      className={styles.btnDelete}
                      onClick={(event) => {
                        event.stopPropagation();
                        onAction(cls.scheduleId);
                      }}
                    >
                      {actionLabel || "Hành động"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
