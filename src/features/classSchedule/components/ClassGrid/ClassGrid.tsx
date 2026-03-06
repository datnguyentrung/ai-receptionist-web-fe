import type { ClassScheduleDTO } from "@/data/mockData";
import { ClassCard } from "@/features/classSchedule/components/ClassCard";
import styles from "./ClassGrid.module.scss";

interface Props {
  classes: ClassScheduleDTO[];
}

export function ClassGrid({ classes }: Props) {
  return (
    <div className={styles.cardsGrid}>
      {classes.map((cls) => (
        <ClassCard key={cls.classId} cls={cls} />
      ))}
    </div>
  );
}
