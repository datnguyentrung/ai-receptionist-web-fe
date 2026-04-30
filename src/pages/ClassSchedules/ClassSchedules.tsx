import ConfirmModal from "@/components/ConfirmModal";
import { RenderProfiler } from "@/components/dev/RenderProfiler";
import {
  ClassGrid,
  ClassHeader,
  ClassWeekView,
} from "@/features/classSchedule";
import { UpcomingSessionsModal } from "@/features/classSession/components/UpcomingSessionsModal";
import { toast } from "sonner";
import styles from "./ClassSchedules.module.scss";
import { useClassSchedulesLogic } from "./hooks/useClassSchedulesLogic";
import { useClassSessionWebSocket } from "./hooks/useClassSessionWebSocket";

export function ClassSchedules() {
  const logic = useClassSchedulesLogic();
  useClassSessionWebSocket(logic.queryClient);

  if (logic.isLoading) {
    return <div>Loading class schedules...</div>;
  }

  if (logic.error) {
    return <div>Error loading class schedules: {logic.error.message}</div>;
  }

  if (logic.sessionsError) {
    toast.error("Lỗi khi tải các buổi học sắp diễn ra");
  }
  const totalClasses = logic.classSchedules?.length || 0;
  const activeClasses =
    logic.classSchedules?.filter((c) => c.scheduleStatus === "ACTIVE").length ||
    0;
  const activeClassSchedules =
    logic.classSchedules?.filter((c) => c.scheduleStatus === "ACTIVE") || [];

  return (
    <>
      <div className={styles.page}>
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
          {logic.view === "grid" ? (
            <ClassGrid
              classes={logic.classSchedules || []}
              onRequestStatusChange={logic.openChangeStatusModal}
            />
          ) : (
            <ClassWeekView
              classes={logic.classSchedules || []}
              onRequestStatusChange={logic.openChangeStatusModal}
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
        isLoading={logic.isLoadingSessions}
        currentPage={logic.currentPage}
        onPageChange={logic.setCurrentPage}
        onSessionUpdated={logic.handleSessionUpdated}
      />
    </>
  );
}
