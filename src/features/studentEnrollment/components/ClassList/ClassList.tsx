// File: src/features/class-assignment/components/ClassList/ClassList.tsx
import { cn } from "@/components/ui/utils";
import { Calendar, Check, Loader2, MapPin } from "lucide-react";
import styles from "./ClassList.module.scss";
import type { ClassScheduleSummary } from '@/types';

interface ClassListProps {
  hasBranch: boolean;
  isLoading: boolean;
  classList: ClassScheduleSummary[];
  selectedIds?: Set<string>;
  onToggle?: (scheduleId: string) => void;
  onAction?: (scheduleId: string) => void;
  actionLabel?: string;
  isCompact?: boolean;
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
  onToggle,
  onAction,
  actionLabel,
  isCompact = false,
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
          <span>Vui lòng chọn Võ sinh để xem lịch học</span>
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
        <div className={styles.listRoot}>
          {classList.map((cls) => {
            const isSelected = selectedIds.has(cls.scheduleId);

            return (
              <div
                key={cls.scheduleId}
                className={cn(
                  styles.classItem,
                  isCompact && styles.classItemCompact,
                  isSelected && styles.classItemSelected,
                  onAction && styles.classItemStaticAction,
                )}
                onClick={() => !onAction && onToggle?.(cls.scheduleId)}
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
                    {cls.scheduleId}
                  </div>
                  {(cls.branchName) && (
                    <div className={styles.meta}>
                      {cls.weekday && (
                        <span className={styles.metaItem}>
                          <Calendar size={11} className={styles.metaIcon} />
                          {cls.weekday}
                        </span>
                      )}
                      {cls.branchName && (
                        <span className={styles.metaItem}>
                          <MapPin size={11} className={styles.metaIcon} />
                          {cls.branchName}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {onAction && (
                  <div className={styles.deleteWrapper}>
                    <button
                      className={styles.btnDelete}
                      onClick={() => onAction(cls.scheduleId)}
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
