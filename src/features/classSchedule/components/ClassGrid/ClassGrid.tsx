import type { ClassScheduleDetail } from "@/types";
import { ClassCard } from "../ClassCard";
import styles from "./ClassGrid.module.scss";

interface Props {
  classes: ClassScheduleDetail[];
}

export function ClassGrid({ classes }: Props) {
  return (
    <div className={styles.cardsGrid}>
      {classes.map((cls) => (
        <ClassCard key={cls.scheduleId} cls={cls} />
      ))}
    </div>
  );
}
