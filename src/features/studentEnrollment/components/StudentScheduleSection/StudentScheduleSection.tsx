// import type { EnrolledClassItem } from "@/types";
import type { StudentEnrollmentResponse } from "@/types";
import React from "react";
import ClassList from "../ClassList/ClassList";
import styles from "./StudentScheduleSection.module.scss";

interface StudentScheduleSectionProps {
  isLoading: boolean;
  hasStudent: boolean;
  activeDisplayClasses: StudentEnrollmentResponse[];
  onDelete: (id: string) => void;
  queuedRemovalIds?: Set<string>;
}

export const StudentScheduleSection: React.FC<StudentScheduleSectionProps> = ({
  isLoading,
  hasStudent,
  activeDisplayClasses,
  onDelete,
  queuedRemovalIds = new Set(),
}) => {
  return (
    <div className={styles.root}>
      <h3 className={styles.sectionTitle}>🥋 Lịch học của học viên</h3>
      <ClassList
        hasBranch={hasStudent}
        isLoading={isLoading}
        classList={
          hasStudent ? activeDisplayClasses.map((cls) => cls.classSchedule) : []
        }
        selectedIds={new Set()}
        onAction={onDelete}
        actionLabel="Xóa"
        disabledIds={queuedRemovalIds}
      />
    </div>
  );
};
