import type { ScheduleStatus } from "@/config/constants";
import type { ClassScheduleDetail } from "@/types";
import { Users } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { ClassCard } from "../ClassCard";
import styles from "./ClassGrid.module.scss";

interface Props {
  classes: ClassScheduleDetail[];
  onRequestStatusChange: (
    scheduleId: string,
    currentStatus: ScheduleStatus,
  ) => void;
  onRequestUpdate: (classSchedule: ClassScheduleDetail) => void;
  onOpenSessionsModal: (scheduleId?: string) => void;
}

interface ClassGroup {
  branchId: number;
  branchName: string;
  classes: ClassScheduleDetail[];
}

const BRANCH_FILTERS = [1, 2, 3, 4, 5, 6] as const;

function ClassGridInner({
  classes,
  onRequestStatusChange,
  onRequestUpdate,
  onOpenSessionsModal,
}: Props) {
  const [selectedBranchNumber, setSelectedBranchNumber] = useState<
    number | "ALL"
  >("ALL");

  const filteredClasses = useMemo(() => {
    if (selectedBranchNumber === "ALL") {
      return classes;
    }

    return classes.filter((cls) => {
      const branchNameNumber = cls.branchName.match(/\d+/)?.[0];
      return (
        cls.branchId === selectedBranchNumber ||
        branchNameNumber === String(selectedBranchNumber)
      );
    });
  }, [classes, selectedBranchNumber]);

  const classGroups = useMemo<ClassGroup[]>(() => {
    const grouped = new Map<number, ClassGroup>();

    filteredClasses.forEach((cls) => {
      const existingGroup = grouped.get(cls.branchId);

      if (existingGroup) {
        existingGroup.classes.push(cls);
        return;
      }

      grouped.set(cls.branchId, {
        branchId: cls.branchId,
        branchName: cls.branchName,
        classes: [cls],
      });
    });

    return Array.from(grouped.values()).sort((left, right) =>
      left.branchName.localeCompare(right.branchName, "vi"),
    );
  }, [filteredClasses]);

  const renderBranchFilter = () => (
    <div className={styles.classSchedulesFilterBar} aria-label="Lọc cơ sở">
      <button
        type="button"
        className={`${styles.classSchedulesFilterBtn} ${
          selectedBranchNumber === "ALL"
            ? styles.classSchedulesFilterBtnActive
            : ""
        }`}
        onClick={() => setSelectedBranchNumber("ALL")}
      >
        Tất cả
      </button>
      {BRANCH_FILTERS.map((branchNumber) => (
        <button
          type="button"
          key={branchNumber}
          className={`${styles.classSchedulesFilterBtn} ${
            selectedBranchNumber === branchNumber
              ? styles.classSchedulesFilterBtnActive
              : ""
          }`}
          onClick={() => setSelectedBranchNumber(branchNumber)}
        >
          {branchNumber}
        </button>
      ))}
    </div>
  );

  if (classGroups.length === 0) {
    return (
      <div className={styles.classGroups}>
        {renderBranchFilter()}
        <div className={styles.emptyState}>
          <Users size={40} />
          <p>Không tìm thấy lớp học</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.classGroups}>
      {renderBranchFilter()}
      {classGroups.map((group) => (
        <section key={group.branchId} className={styles.branchGroup}>
          <div className={styles.branchGroupHeader}>
            <div>
              <h3 className={styles.branchGroupTitle}>{group.branchName}</h3>
              <p className={styles.branchGroupMeta}>
                {group.classes.length} lớp học
              </p>
            </div>
          </div>

          <div className={styles.cardsGrid}>
            {group.classes.map((cls) => (
              <ClassCard
                key={cls.scheduleId}
                cls={cls}
                onRequestStatusChange={onRequestStatusChange}
                onRequestUpdate={onRequestUpdate}
                onOpenSessionsModal={onOpenSessionsModal}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export const ClassGrid = memo(ClassGridInner);
