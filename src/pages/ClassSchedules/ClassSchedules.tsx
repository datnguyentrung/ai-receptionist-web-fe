import ConfirmModal from "@/components/ConfirmModal";
import { RenderProfiler } from "@/components/dev/RenderProfiler";
import type { ScheduleStatus } from "@/config/constants";
import {
  ClassGrid,
  ClassHeader,
  ClassWeekView,
  useGetAllClassSchedules,
} from "@/features/classSchedule";
import { useChangeClassScheduleStatus } from "@/features/classSchedule/api/useClassSchedule";
import { useAuthStore } from "@/store/authStore";
import { useCallback, useState } from "react";
import styles from "./ClassSchedules.module.scss";

export function ClassSchedules() {
  const [view, setView] = useState<"grid" | "week">("week");
  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    scheduleId: string;
    currentStatus: ScheduleStatus;
  } | null>(null);

  const user = useAuthStore((state) => state.user);
  const scheduleIds =
    user?.userInfo.assignedClasses?.map((c) => c.classSchedule.scheduleId) ??
    [];
  const {
    mutateAsync: changeClassScheduleStatus,
    isPending: isChangingStatus,
  } = useChangeClassScheduleStatus();

  const openChangeStatusModal = useCallback(
    (scheduleId: string, currentStatus: ScheduleStatus) => {
      setPendingStatusChange({ scheduleId, currentStatus });
      setIsChangeStatusModalOpen(true);
    },
    [],
  );

  const closeChangeStatusModal = useCallback(() => {
    if (isChangingStatus) {
      return;
    }

    setIsChangeStatusModalOpen(false);
    setPendingStatusChange(null);
  }, [isChangingStatus]);

  const confirmStatusChange = useCallback(async () => {
    if (!pendingStatusChange) {
      return;
    }

    const nextStatus: ScheduleStatus =
      pendingStatusChange.currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    await changeClassScheduleStatus({
      id: pendingStatusChange.scheduleId,
      newStatus: nextStatus,
    });

    setIsChangeStatusModalOpen(false);
    setPendingStatusChange(null);
  }, [changeClassScheduleStatus, pendingStatusChange]);

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

  const isCurrentStatusActive = pendingStatusChange?.currentStatus === "ACTIVE";
  const confirmTitle = isCurrentStatusActive
    ? "Dừng hoạt động lớp?"
    : "Mở hoạt động lớp?";
  const confirmDescription = pendingStatusChange
    ? isCurrentStatusActive
      ? `Bạn có chắc muốn chuyển lớp ${pendingStatusChange.scheduleId} sang trạng thái không hoạt động?`
      : `Bạn có chắc muốn chuyển lớp ${pendingStatusChange.scheduleId} sang trạng thái hoạt động?`
    : "";
  const confirmButtonText = isCurrentStatusActive
    ? "Dừng hoạt động"
    : "Mở hoạt động";

  return (
    <>
      <div className={styles.page}>
        <RenderProfiler id="ClassSchedules:Header" thresholdMs={4}>
          <ClassHeader
            totalClasses={classSchedules?.length || 0}
            activeClasses={
              classSchedules?.filter((c) => c.scheduleStatus === "ACTIVE")
                .length || 0
            }
            view={view}
            onViewChange={setView}
          />
        </RenderProfiler>
        <RenderProfiler id="ClassSchedules:Content" thresholdMs={8}>
          {view === "grid" ? (
            <ClassGrid
              classes={classSchedules || []}
              onRequestStatusChange={openChangeStatusModal}
            />
          ) : (
            <ClassWeekView
              classes={classSchedules || []}
              onRequestStatusChange={openChangeStatusModal}
            />
          )}
        </RenderProfiler>
      </div>

      <ConfirmModal
        open={isChangeStatusModalOpen}
        title={confirmTitle}
        description={confirmDescription}
        cancelText="Hủy"
        confirmText={confirmButtonText}
        loadingText="Đang cập nhật..."
        isLoading={isChangingStatus}
        onCancel={closeChangeStatusModal}
        onConfirm={confirmStatusChange}
        successToastMessage="Cập nhật trạng thái lớp học thành công"
        errorToastMessage="Không thể cập nhật trạng thái lớp học"
      />
    </>
  );
}
