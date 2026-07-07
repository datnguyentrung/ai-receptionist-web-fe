import { Skeleton } from "@/components/ui/skeleton";
import { lazy, Suspense } from "react";
import styles from "./ClassSchedules.module.scss";

const ClassSchedulesContent = lazy(() =>
  import("./ClassSchedules").then((module) => ({
    default: module.ClassSchedules,
  })),
);

function ClassSchedulesRouteShell() {
  return (
    <div className={styles.page}>
      <div className={styles.routeShellHead}>
        <div>
          <h2 className={styles.routeShellTitle}>
            Lịch Học <span>sắp diễn ra</span>
          </h2>
          <Skeleton className={styles.routeShellSubtitle} />
        </div>
        <div className={styles.routeShellActions}>
          <Skeleton className={styles.routeShellToggle} />
          <Skeleton className={styles.routeShellButton} />
        </div>
      </div>

      <div className={styles.skeletonWeek}>
        <div className={styles.skeletonDayRow}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className={styles.skeletonDayCard} />
          ))}
        </div>
        <div className={styles.skeletonShiftRow}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className={styles.skeletonShiftChip} />
          ))}
        </div>
        <div className={styles.skeletonClassList}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={styles.skeletonWeekCard}>
              <div>
                <Skeleton className={styles.skeletonCardTitle} />
                <div className={styles.skeletonBadgeRow}>
                  <Skeleton className={styles.skeletonBadge} />
                  <Skeleton className={styles.skeletonBadge} />
                </div>
                <Skeleton className={styles.skeletonMetaLine} />
                <Skeleton className={styles.skeletonMetaShort} />
              </div>
              <Skeleton className={styles.skeletonMenuButton} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ClassSchedulesRoute() {
  return (
    <Suspense fallback={<ClassSchedulesRouteShell />}>
      <ClassSchedulesContent />
    </Suspense>
  );
}
