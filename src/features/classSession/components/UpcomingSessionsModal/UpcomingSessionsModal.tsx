import { ModalLayout } from "@/components/ui/modal-layout";
import { CreateSessionModal } from "@/features/classSession/components/CreateSessionModal";
import { SessionLayout } from "@/features/classSession/components/SessionLayout";
import baseModalStyles from "@/layouts/BaseModalLayout/BaseModalLayout.module.scss";
import type {
  ClassScheduleDetail,
  PageResponse,
  SessionResponse,
} from "@/types";
import { X } from "lucide-react";
import { useCallback, useState } from "react";
import styles from "./UpcomingSessionsModal.module.scss";

interface UpcomingSessionsModalProps {
  open: boolean;
  onClose: () => void;
  sessions?: PageResponse<SessionResponse>;
  classSchedules?: ClassScheduleDetail[];
  prefillScheduleId?: string;
  isLoading?: boolean;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onSessionUpdated?: () => void;
}

export function UpcomingSessionsModal({
  open,
  onClose,
  sessions,
  classSchedules = [],
  prefillScheduleId,
  isLoading = false,
  currentPage = 1,
  onPageChange,
  onSessionUpdated,
}: UpcomingSessionsModalProps) {
  const [highlightSessionId, setHighlightSessionId] = useState<string | null>(
    null,
  );

  const closeAll = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSessionCreated = useCallback(
    (created: SessionResponse) => {
      setHighlightSessionId(created.sessionId);

      // đảm bảo user đang ở trang đầu để dễ thấy buổi vừa tạo
      if (currentPage !== 1) {
        onPageChange?.(1);
      }

      onSessionUpdated?.();
    },
    [currentPage, onPageChange, onSessionUpdated],
  );

  return (
    <>
      <ModalLayout
        open={open}
        onClose={closeAll}
        withSurface={false}
        showCloseButton={false}
        closeOnBackdrop={true}
        closeOnEscape={true}
        maxWidth={1160}
      >
        <div className={styles.splitWrapper}>
          <div
            className={`${baseModalStyles.surface} ${styles.leftPanel}`}
            aria-label="Danh sách buổi học"
          >
            <div className={baseModalStyles.header}>
              <div className={baseModalStyles.titleSection}>
                <h2 className={baseModalStyles.title}>Buổi Học Sắp Diễn Ra</h2>
                <p className={baseModalStyles.subtitle}>
                  {(sessions?.totalElements ?? 0).toString()} buổi học sắp diễn
                  ra
                </p>
              </div>
              <button
                className={baseModalStyles.closeBtn}
                onClick={closeAll}
                aria-label="Đóng modal"
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <div className={baseModalStyles.content}>
              <SessionLayout
                sessions={sessions}
                isLoading={isLoading}
                currentPage={currentPage}
                onPageChange={onPageChange}
                onSessionUpdated={onSessionUpdated}
                highlightSessionId={highlightSessionId}
                onHighlightHandled={() => setHighlightSessionId(null)}
              />
            </div>
          </div>

          <CreateSessionModal
            open={open}
            className={styles.rightPanel}
            classSchedules={classSchedules}
            initialScheduleId={prefillScheduleId}
            onRequestClose={closeAll}
            onSessionCreated={handleSessionCreated}
          />
        </div>
      </ModalLayout>
    </>
  );
}
