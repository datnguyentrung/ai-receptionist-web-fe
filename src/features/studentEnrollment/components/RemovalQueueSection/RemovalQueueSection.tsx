import { cn } from "@/components/ui/utils";
// import type { EnrolledClassItem } from "@/types";
import type { StudentEnrollmentResponse } from "@/types";
import { Calendar, MapPin, X } from "lucide-react";
import React from "react";
import styles from "./RemovalQueueSection.module.scss";

interface RemovalQueueSectionProps {
  removalQueue: Set<string>;
  toDeleteObjects: StudentEnrollmentResponse[];
  onRemoveFromQueue: (id: string) => void;
  onConfirmRemoval: () => void;
  isProcessing?: boolean;
}

export const RemovalQueueSection: React.FC<RemovalQueueSectionProps> = ({
  removalQueue,
  toDeleteObjects,
  onRemoveFromQueue,
  onConfirmRemoval,
  isProcessing = false,
}) => {
  if (removalQueue.size === 0) return null;

  return (
    <div className={styles.removalSection}>
      <h3 className={cn(styles.sectionTitle, styles.titleSpacing)}>
        🗑️ Danh sách lớp học muốn xóa
      </h3>
      <div className={styles.removalList}>
        {toDeleteObjects.map((cls) => (
          <div key={cls.classSchedule.scheduleId} className={styles.classItem}>
            <div className={styles.classContent}>
              <div className={styles.classLabel}>{cls.classSchedule.scheduleId}</div>

              {/* Thông tin phụ: ngày nhập học & chi nhánh (Đồng bộ với ClassList) */}
              {(cls.joinDate || cls.classSchedule.branchName) && (
                <div className={styles.meta}>
                  {cls.joinDate && (
                    <span className={styles.metaItem}>
                      <Calendar size={11} className={styles.metaIcon} />
                      {cls.joinDate}
                    </span>
                  )}
                  {cls.classSchedule.branchName && (
                    <span className={styles.metaItem}>
                      <MapPin size={11} className={styles.metaIcon} />
                      {cls.classSchedule.branchName}
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => onRemoveFromQueue(cls.classSchedule.scheduleId)}
              className={styles.btnSmallSquare}
              title="Bỏ khỏi danh sách chờ xóa"
              disabled={isProcessing}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <button
        className={styles.btnConfirmRemoval}
        onClick={onConfirmRemoval}
        disabled={isProcessing}
      >
        {isProcessing ? "Đang xử lý..." : `Xác nhận xóa (${removalQueue.size})`}
      </button>
    </div>
  );
};
