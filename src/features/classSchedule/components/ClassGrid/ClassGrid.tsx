import type { ScheduleStatus } from "@/config/constants";
import type { ClassScheduleDetail } from "@/types";
import { memo } from "react";
import { ClassCard } from "../ClassCard";
import styles from "./ClassGrid.module.scss";

interface Props {
  classes: ClassScheduleDetail[];
  onRequestStatusChange: (
    scheduleId: string,
    currentStatus: ScheduleStatus,
  ) => void;
}

function ClassGridInner({ classes, onRequestStatusChange }: Props) {
  return (
    <div className={styles.cardsGrid}>
      {classes.map((cls) => (
        <ClassCard
          key={cls.scheduleId}
          cls={cls}
          onRequestStatusChange={onRequestStatusChange}
        />
      ))}
    </div>
  );
}

export const ClassGrid = memo(ClassGridInner);
