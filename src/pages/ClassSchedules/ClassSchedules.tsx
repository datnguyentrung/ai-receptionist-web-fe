import { useState } from "react";
import { CLASSES } from "../../data/mockData";
import { ClassHeader } from "@/features/classSchedule/components/ClassHeader";
import { ClassGrid } from "@/features/classSchedule/components/ClassGrid";
import { ClassWeekView } from "@/features/classSchedule/components/ClassWeekView";
import styles from "./ClassSchedules.module.scss";

export function ClassSchedules() {
  const [view, setView] = useState<"grid" | "week">("grid");

  return (
    <div className={styles.page}>
      <ClassHeader
        totalClasses={CLASSES.length}
        activeClasses={CLASSES.filter((c) => c.status === "ongoing").length}
        view={view}
        onViewChange={setView}
      />
      {view === "grid" ? (
        <ClassGrid classes={CLASSES} />
      ) : (
        <ClassWeekView classes={CLASSES} />
      )}
    </div>
  );
}
