import ConfirmModal from "@/components/ConfirmModal";
import { RenderProfiler } from "@/components/dev/RenderProfiler";
import type { ScheduleStatus } from "@/config/constants";
import {
  ClassGrid,
  ClassHeader,
  ClassWeekView,
} from "@/features/classSchedule";
import { classScheduleAPI } from "@/features/classSchedule/api/classScheduleAPI";
import { classSessionAPI } from "@/features/classSession/api/classSessionAPI";
import { UpcomingSessionsModal } from "@/features/classSession/components/UpcomingSessionsModal";
import { useGetQuery, usePlainMutation } from "@/hooks/useCrud";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import styles from "./ClassSchedules.module.scss";

export function ClassSchedules() {
  const [view, setView] = useState<"grid" | "week">("week");
  const [currentPage, setCurrentPage] = useState(1);
  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
  const [classSessionModalOpen, setClassSessionModalOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    scheduleId: string;
    currentStatus: ScheduleStatus;
  } | null>(null);

  const user = useAuthStore((state) => state.activeProfile);
  const queryClient = useQueryClient();
  const scheduleIds =
    user?.userInfo?.assignedClasses
      ?.map((c) => c?.classSchedule?.scheduleId)
      ?.filter((id): id is string => Boolean(id)) ?? [];
  const {
    mutateAsync: changeClassScheduleStatus,
    isPending: isChangingStatus,
  } = usePlainMutation<void, { id: string; newStatus: ScheduleStatus }>(
    ({ id, newStatus }) =>
      classScheduleAPI.changeClassScheduleStatus(id, newStatus),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["class-schedules"] });
        queryClient.invalidateQueries({
          queryKey: ["class-schedules", variables.id],
        });
      },
    },
  );

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
  } = useGetQuery(
    ["class-schedules", { scheduleIds }],
    () => classScheduleAPI.getAllClassSchedules({ scheduleIds }),
    { enabled: !!user },
  );

  const {
    data: upcomingSessions,
    isLoading: isLoadingSessions,
    error: sessionsError,
  } = useGetQuery(
    [
      "class-sessions",
      {
        scheduleIds,
        // isAttendanceClosed: false,
        page: currentPage - 1,
        size: 10,
      },
    ],
    () =>
      classSessionAPI.getSessionsByFilter({
        scheduleIds,
        // isAttendanceClosed: false,
        page: currentPage - 1,
        size: 10,
      }),
    { enabled: !!user },
  );

  if (isLoading) {
    return <div>Loading class schedules...</div>;
  }

  if (error) {
    return <div>Error loading class schedules: {error.message}</div>;
  }

  if (sessionsError) {
    toast.error("Lỗi khi tải các buổi học sắp diễn ra");
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
            classSchedules={
              classSchedules?.filter((c) => c.scheduleStatus === "ACTIVE") || []
            }
            view={view}
            onViewChange={setView}
            onOpenSessionsModal={() => setClassSessionModalOpen(true)}
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

      <UpcomingSessionsModal
        open={classSessionModalOpen}
        onClose={() => setClassSessionModalOpen(false)}
        sessions={upcomingSessions}
        isLoading={isLoadingSessions}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </>
  );
}
