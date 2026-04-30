import { SessionLayout } from "@/features/classSession/components/SessionLayout";
import { BaseModalLayout } from "@/layouts/BaseModalLayout";
import type { PageResponse, SessionResponse } from "@/types";

interface UpcomingSessionsModalProps {
  open: boolean;
  onClose: () => void;
  sessions?: PageResponse<SessionResponse>;
  isLoading?: boolean;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onSessionUpdated?: () => void;
}

export function UpcomingSessionsModal({
  open,
  onClose,
  sessions,
  isLoading = false,
  currentPage = 1,
  onPageChange,
  onSessionUpdated,
}: UpcomingSessionsModalProps) {
  return (
    <BaseModalLayout
      open={open}
      onClose={onClose}
      title="Buổi Học Sắp Diễn Ra"
      subtitle={`${sessions?.totalElements || 0} buổi học sắp diễn ra`}
      showCloseButton={true}
      closeOnBackdrop={true}
      closeOnEscape={true}
      isLoading={isLoading}
      size="sm"
    >
      <SessionLayout
        sessions={sessions}
        isLoading={isLoading}
        currentPage={currentPage}
        onPageChange={onPageChange}
        onSessionUpdated={onSessionUpdated}
      />
    </BaseModalLayout>
  );
}
