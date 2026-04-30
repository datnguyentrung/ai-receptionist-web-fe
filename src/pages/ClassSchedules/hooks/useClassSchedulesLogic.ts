import type { ScheduleStatus } from "@/config/constants";
import { classScheduleAPI } from "@/features/classSchedule/api/classScheduleAPI";
import { classSessionAPI } from "@/features/classSession/api/classSessionAPI";
import { useGetQuery, usePlainMutation } from "@/hooks/useCrud";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

export function useClassSchedulesLogic() {
  const [view, setView] = useState<"grid" | "week">("week");
  const [currentPage, setCurrentPage] = useState(1);
  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
  const [classSessionModalOpen, setClassSessionModalOpen] = useState(false);
  const [createSessionPrefillScheduleId, setCreateSessionPrefillScheduleId] =
    useState<string | null>(null);
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
    refetch: refetchSessions,
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

  const handleSessionUpdated = useCallback(() => {
    refetchSessions();
  }, [refetchSessions]);

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

  return {
    // External deps
    queryClient,

    // State
    view,
    setView,
    currentPage,
    setCurrentPage,
    isChangeStatusModalOpen,
    classSessionModalOpen,
    createSessionPrefillScheduleId,
    pendingStatusChange,

    // Data
    classSchedules,
    isLoading,
    error,
    upcomingSessions,
    isLoadingSessions,
    sessionsError,

    // Derived UI copy
    confirmTitle,
    confirmDescription,
    confirmButtonText,

    // Actions / handlers
    openChangeStatusModal,
    closeChangeStatusModal,
    confirmStatusChange,
    isChangingStatus,
    openSessionsModal: (scheduleId?: string) => {
      setCreateSessionPrefillScheduleId(scheduleId?.trim() || null);
      setClassSessionModalOpen(true);
    },
    closeSessionsModal: () => {
      setClassSessionModalOpen(false);
      setCreateSessionPrefillScheduleId(null);
    },
    handleSessionUpdated,
  };
}
