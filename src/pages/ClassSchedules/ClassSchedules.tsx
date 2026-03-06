import { useState } from "react";
import { ClassHeader } from "@/features/classSchedule/components/ClassHeader";
import { ClassGrid } from "@/features/classSchedule/components/ClassGrid";
import { ClassWeekView } from "@/features/classSchedule/components/ClassWeekView";
import styles from "./ClassSchedules.module.scss";
import {useGetAllClassSchedules} from "@/features/classSchedule/api/useClassSchedule";

export function ClassSchedules() {
  const [view, setView] = useState<"grid" | "week">("grid");
  const { data: classSchedules, isLoading, error } = useGetAllClassSchedules();

  if (isLoading) {
    return <div>Loading class schedules...</div>;
  }

  if (error) {
    return <div>Error loading class schedules: {error.message}</div>;
  }

  return (
    <div className={styles.page}>
      <ClassHeader
        totalClasses={classSchedules?.length || 0}
        activeClasses={classSchedules?.filter((c) => c.scheduleStatus === "ACTIVE").length || 0}
        view={view}
        onViewChange={setView}
      />
      {view === "grid" ? (
        <ClassGrid classes={classSchedules || []} />
      ) : (
        <ClassWeekView classes={classSchedules || []} />
      )}
    </div>
  );
}
