import {
  ClassGrid,
  ClassHeader,
  ClassWeekView,
  useGetAllClassSchedules,
} from "@/features/classSchedule";
import { RenderProfiler } from "@/components/dev/RenderProfiler";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import styles from "./ClassSchedules.module.scss";

export function ClassSchedules() {
  const [view, setView] = useState<"grid" | "week">("week");

  const user = useAuthStore((state) => state.user);
  const scheduleIds = user?.userInfo.assignedClasses ?? [];

  const {
    data: classSchedules,
    isLoading,
    error,
  } = useGetAllClassSchedules(
    { scheduleIds },
    {
      enabled: !!user,
    },
  );

  if (isLoading) {
    return <div>Loading class schedules...</div>;
  }

  if (error) {
    return <div>Error loading class schedules: {error.message}</div>;
  }

  return (
    <div className={styles.page}>
      <RenderProfiler id="ClassSchedules:Header" thresholdMs={4}>
        <ClassHeader
          totalClasses={classSchedules?.length || 0}
          activeClasses={
            classSchedules?.filter((c) => c.scheduleStatus === "ACTIVE").length ||
            0
          }
          view={view}
          onViewChange={setView}
        />
      </RenderProfiler>
      <RenderProfiler id="ClassSchedules:Content" thresholdMs={8}>
        {view === "grid" ? (
          <ClassGrid classes={classSchedules || []} />
        ) : (
          <ClassWeekView classes={classSchedules || []} />
        )}
      </RenderProfiler>
    </div>
  );
}
