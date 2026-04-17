import type { ClassScheduleDetail } from "@/types";
import { memo } from "react";
import { ClassCard } from "../ClassCard";
import styles from "./ClassGrid.module.scss";

interface Props {
  classes: ClassScheduleDetail[];
}

function ClassGridInner({ classes }: Props) {
  return (
    <div className={styles.cardsGrid}>
      {classes.map((cls) => (
        <ClassCard key={cls.scheduleId} cls={cls} />
      ))}
    </div>
  );
}

export const ClassGrid = memo(ClassGridInner);
