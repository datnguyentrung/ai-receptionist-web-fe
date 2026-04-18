import type { ScheduleStatus } from "@/config/constants";
import type { ClassScheduleDetail } from "@/types";
import { Users } from "lucide-react";
import { memo, useMemo } from "react";
import { ClassCard } from "../ClassCard";
import styles from "./ClassGrid.module.scss";

interface Props {
  classes: ClassScheduleDetail[];
  onRequestStatusChange: (
    scheduleId: string,
    currentStatus: ScheduleStatus,
  ) => void;
}

interface ClassGroup {
  branchId: number;
  branchName: string;
  classes: ClassScheduleDetail[];
}

function ClassGridInner({ classes, onRequestStatusChange }: Props) {
  const classGroups = useMemo<ClassGroup[]>(() => {
    const grouped = new Map<number, ClassGroup>();

    classes.forEach((cls) => {
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
  }, [classes]);

  if (classGroups.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Users size={40} style={{ color: "#D1D5DB", margin: "0 auto 12px" }} />
        <p style={{ fontSize: "14px", color: "#9CA3AF" }}>
          Không tìm thấy lớp học
        </p>
      </div>
    );
  }

  return (
    <div className={styles.classGroups}>
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
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export const ClassGrid = memo(ClassGridInner);
