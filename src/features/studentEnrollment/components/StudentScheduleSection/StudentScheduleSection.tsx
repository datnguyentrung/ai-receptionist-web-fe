import React from "react";
import ClassList from "../ClassList/ClassList";
import styles from "./StudentScheduleSection.module.scss";
import type { ClassScheduleSummary } from '@/types';

interface StudentScheduleSectionProps {
  isLoading: boolean;
  hasStudent: boolean;
  activeDisplayClasses: ClassScheduleSummary[];
  onDelete: (id: string) => void;
}

export const StudentScheduleSection: React.FC<StudentScheduleSectionProps> = ({
  isLoading,
  hasStudent,
  activeDisplayClasses,
  onDelete,
}) => {
  return (
    <div className={styles.root}>
      <h3 className={styles.sectionTitle}>🥋 Lịch học của học viên</h3>
      <ClassList
        hasBranch={hasStudent}
        isLoading={isLoading}
        classList={hasStudent ? activeDisplayClasses : []}
        selectedIds={new Set()}
        onAction={onDelete}
        actionLabel="Xóa"
      />
    </div>
  );
};
