import ConfirmModal from "@/components/ConfirmModal";
import { RenderProfiler } from "@/components/dev/RenderProfiler";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ClassGrid,
  ClassHeader,
  ClassWeekView,
} from "@/features/classSchedule";
import { UpcomingSessionsModal } from "@/features/classSession/components/UpcomingSessionsModal";
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import styles from "./ClassSchedules.module.scss";
import { useClassSchedulesLogic } from "./hooks/useClassSchedulesLogic";
import { useClassSessionWebSocket } from "./hooks/useClassSessionWebSocket";

function ClassSchedulesSkeleton({ view }: { view: "grid" | "week" }) {
  if (view === "grid") {
    return (
      <div className={styles.skeletonGroups}>
        <div className={styles.skeletonFilterRow}>
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className={styles.skeletonFilterChip} />
          ))}
        </div>
        {Array.from({ length: 2 }).map((_, groupIndex) => (
          <section key={groupIndex} className={styles.skeletonGroup}>
            <Skeleton className={styles.skeletonGroupTitle} />
            <div className={styles.skeletonGrid}>
              {Array.from({ length: 4 }).map((_, cardIndex) => (
                <Skeleton key={cardIndex} className={styles.skeletonGridCard} />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
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
  );
}

function ClassSchedulesError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={styles.errorState}>
      <p>Không thể tải lịch học.</p>
      <button type="button" onClick={onRetry} className={styles.retryButton}>
        <RefreshCcw size={14} />
        Thử lại
      </button>
    </div>
  );
}

export function ClassSchedules() {
  const logic = useClassSchedulesLogic();
  useClassSessionWebSocket(logic.queryClient);

  if (logic.sessionsError) {
    toast.error("Lỗi khi tải các buổi học sắp diễn ra");
  }
  const totalClasses = logic.classSchedules?.length || 0;
  const activeClasses =
    logic.classSchedules?.filter((c) => c.scheduleStatus === "ACTIVE").length ||
    0;
  const activeClassSchedules =
    logic.classSchedules?.filter((c) => c.scheduleStatus === "ACTIVE") || [];

  const hasSchedules = Boolean(logic.classSchedules);
  const isInitialLoading = logic.isLoading && !hasSchedules;
  const isInitialError = Boolean(logic.error) && !hasSchedules;
  const isRefreshing = logic.isFetching && hasSchedules;

  return (
    <>
      <div className={styles.page}>
        {isRefreshing && (
          <div className={styles.refreshNotice} role="status">
            Đang cập nhật lịch học mới...
          </div>
        )}
        <RenderProfiler id="ClassSchedules:Header" thresholdMs={4}>
          <ClassHeader
            totalClasses={totalClasses}
            activeClasses={activeClasses}
            classSchedules={activeClassSchedules}
            view={logic.view}
            onViewChange={logic.setView}
            onOpenSessionsModal={logic.openSessionsModal}
          />
        </RenderProfiler>
        <RenderProfiler id="ClassSchedules:Content" thresholdMs={8}>
          {isInitialLoading ? (
            <ClassSchedulesSkeleton view={logic.view} />
          ) : isInitialError ? (
            <ClassSchedulesError
              onRetry={() => {
                void logic.refetchClassSchedules();
              }}
            />
          ) : logic.view === "grid" ? (
            <ClassGrid
              classes={logic.classSchedules || []}
              onRequestStatusChange={logic.openChangeStatusModal}
              onOpenSessionsModal={logic.openSessionsModal}
            />
          ) : (
            <ClassWeekView
              classes={logic.classSchedules || []}
              onRequestStatusChange={logic.openChangeStatusModal}
              onOpenSessionsModal={logic.openSessionsModal}
            />
          )}
        </RenderProfiler>
      </div>

      <ConfirmModal
        open={logic.isChangeStatusModalOpen}
        title={logic.confirmTitle}
        description={logic.confirmDescription}
        cancelText="Hủy"
        confirmText={logic.confirmButtonText}
        loadingText="Đang cập nhật..."
        isLoading={logic.isChangingStatus}
        onCancel={logic.closeChangeStatusModal}
        onConfirm={logic.confirmStatusChange}
        successToastMessage="Cập nhật trạng thái lớp học thành công"
        errorToastMessage="Không thể cập nhật trạng thái lớp học"
      />

      <UpcomingSessionsModal
        open={logic.classSessionModalOpen}
        onClose={logic.closeSessionsModal}
        sessions={logic.upcomingSessions}
        classSchedules={logic.classSchedules || []}
        prefillScheduleId={logic.createSessionPrefillScheduleId || undefined}
        isLoading={logic.isLoadingSessions}
        currentPage={logic.currentPage}
        onPageChange={logic.setCurrentPage}
        onSessionUpdated={logic.handleSessionUpdated}
      />
    </>
  );
}
