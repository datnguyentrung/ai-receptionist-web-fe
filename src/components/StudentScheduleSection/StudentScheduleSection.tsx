import { cn } from "@/components/ui/utils";
import ClassList from "@/features/studentEnrollment/components/ClassList/ClassList";
import type { ClassScheduleSummary, StudentEnrollmentResponse } from "@/types";
import React from "react";
import styles from "./StudentScheduleSection.module.scss";

interface StudentScheduleSectionProps {
  isLoading: boolean;
  hasStudent?: boolean;
  hasOwner?: boolean;
  activeDisplayClasses?: StudentEnrollmentResponse[];
  classList?: ClassScheduleSummary[];
  onDelete?: (id: string) => void;
  queuedRemovalIds?: Set<string>;
  title?: string;
  actionLabel?: string;
}

export const StudentScheduleSection: React.FC<StudentScheduleSectionProps> = ({
  isLoading,
  hasStudent,
  hasOwner,
  activeDisplayClasses = [],
  classList,
  onDelete,
  queuedRemovalIds = new Set(),
  title = "🥋 Lịch học của học viên",
  actionLabel = "Xóa",
}) => {
  const resolvedHasOwner = hasOwner ?? hasStudent ?? false;
  const resolvedClassList =
    classList ?? activeDisplayClasses.map((cls) => cls.classSchedule);

  return (
    <div className={styles.root}>
      <h3 className={cn(styles.sectionTitle)}>{title}</h3>
      <ClassList
        hasBranch={resolvedHasOwner}
        isLoading={isLoading}
        classList={resolvedHasOwner ? resolvedClassList : []}
        selectedIds={new Set()}
        onAction={onDelete}
        actionLabel={actionLabel}
        disabledIds={queuedRemovalIds}
      />
    </div>
  );
};
