import { ModalLayout } from "@/components/ui/modal-layout";
import { isPWA as isPwa } from "@/config/appMode";
import { CreateSessionModal } from "@/features/classSession/components/CreateSessionModal";
import { SessionLayout } from "@/features/classSession/components/SessionLayout";
import baseModalStyles from "@/layouts/BaseModalLayout/BaseModalLayout.module.scss";
import type {
  ClassScheduleDetail,
  PageResponse,
  SessionResponse,
} from "@/types";
import { Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import styles from "./UpcomingSessionsModal.module.scss";

const COMPACT_MODAL_QUERY = "(max-width: 991px)";

type MobileView = "list" | "create";

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

function useCompactSessionModal() {
  const [matchesCompactViewport, setMatchesCompactViewport] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return false;
    }

    return window.matchMedia(COMPACT_MODAL_QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia(COMPACT_MODAL_QUERY);
    const handleChange = () => setMatchesCompactViewport(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return isPwa || matchesCompactViewport;
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
  const isCompact = useCompactSessionModal();

  const closeAll = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSessionCreated = useCallback(
    (created: SessionResponse) => {
      setHighlightSessionId(created.sessionId);

      if (currentPage !== 1) {
        onPageChange?.(1);
      }

      onSessionUpdated?.();
    },
    [currentPage, onPageChange, onSessionUpdated],
  );

  const renderSessionList = () => (
    <SessionLayout
      sessions={sessions}
      isLoading={isLoading}
      currentPage={currentPage}
      onPageChange={onPageChange}
      onSessionUpdated={onSessionUpdated}
      highlightSessionId={highlightSessionId}
      onHighlightHandled={() => setHighlightSessionId(null)}
    />
  );

  const renderDesktopContent = () => (
    <div className={styles.splitWrapper}>
      <div
        className={`${baseModalStyles.surface} ${styles.leftPanel}`}
        aria-label="Danh sách buổi học"
      >
        <div className={baseModalStyles.header}>
          <div className={baseModalStyles.titleSection}>
            <h2 className={baseModalStyles.title}>Buổi Học Sắp Diễn Ra</h2>
            <p className={baseModalStyles.subtitle}>
              {(sessions?.totalElements ?? 0).toString()} buổi học sắp diễn ra
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

        <div className={baseModalStyles.content}>{renderSessionList()}</div>
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
  );

  if (isCompact) {
    return open ? (
      <CompactUpcomingSessionsModal
        open={open}
        sessions={sessions}
        classSchedules={classSchedules}
        prefillScheduleId={prefillScheduleId}
        isLoading={isLoading}
        currentPage={currentPage}
        onPageChange={onPageChange}
        onSessionUpdated={onSessionUpdated}
        highlightSessionId={highlightSessionId}
        onHighlightHandled={() => setHighlightSessionId(null)}
        onRequestClose={closeAll}
        onSessionCreated={handleSessionCreated}
      />
    ) : null;
  }

  return (
    <ModalLayout
      open={open}
      onClose={closeAll}
      withSurface={false}
      showCloseButton={false}
      closeOnBackdrop={true}
      closeOnEscape={true}
      closeOnDragDown={true}
      maxWidth={1160}
    >
      {renderDesktopContent()}
    </ModalLayout>
  );
}

interface CompactUpcomingSessionsModalProps {
  open: boolean;
  sessions?: PageResponse<SessionResponse>;
  classSchedules: ClassScheduleDetail[];
  prefillScheduleId?: string;
  isLoading: boolean;
  currentPage: number;
  onPageChange?: (page: number) => void;
  onSessionUpdated?: () => void;
  highlightSessionId: string | null;
  onHighlightHandled: () => void;
  onRequestClose: () => void;
  onSessionCreated: (session: SessionResponse) => void;
}

function CompactUpcomingSessionsModal({
  open,
  sessions,
  classSchedules,
  prefillScheduleId,
  isLoading,
  currentPage,
  onPageChange,
  onSessionUpdated,
  highlightSessionId,
  onHighlightHandled,
  onRequestClose,
  onSessionCreated,
}: CompactUpcomingSessionsModalProps) {
  const [mobileView, setMobileView] = useState<MobileView>("list");
  const [isCreateBusy, setIsCreateBusy] = useState(false);

  const closeAll = useCallback(() => {
    if (isCreateBusy) return;
    onRequestClose();
  }, [isCreateBusy, onRequestClose]);

  const handleModalRequestClose = useCallback(() => {
    if (isCreateBusy) return;

    if (mobileView === "create") {
      setMobileView("list");
      return;
    }

    onRequestClose();
  }, [isCreateBusy, mobileView, onRequestClose]);

  const handleCompactSessionCreated = useCallback(
    (created: SessionResponse) => {
      onSessionCreated(created);
      setIsCreateBusy(false);
      setMobileView("list");
    },
    [onSessionCreated],
  );

  const renderSessionList = () => (
    <SessionLayout
      sessions={sessions}
      isLoading={isLoading}
      currentPage={currentPage}
      onPageChange={onPageChange}
      onSessionUpdated={onSessionUpdated}
      highlightSessionId={highlightSessionId}
      onHighlightHandled={onHighlightHandled}
    />
  );

  return (
    <ModalLayout
      open={open}
      onClose={handleModalRequestClose}
      withSurface={false}
      showCloseButton={false}
      closeOnBackdrop={!isCreateBusy}
      closeOnEscape={!isCreateBusy}
      closeOnDragDown={!isCreateBusy}
      dialogClassName={styles.mobileDialog}
      maxWidth="100%"
    >
      <div className={styles.mobileFlow}>
        {mobileView === "list" ? (
          <div className={styles.mobileView} aria-label="Danh sách buổi học">
            <header className={styles.mobileHeader}>
              <div className={styles.mobileTitleSection}>
                <h2 className={styles.mobileTitle}>Buổi Học Sắp Diễn Ra</h2>
                <p className={styles.mobileSubtitle}>
                  {(sessions?.totalElements ?? 0).toString()} buổi học sắp diễn
                  ra
                </p>
              </div>
              <button
                className={styles.mobileIconBtn}
                onClick={closeAll}
                aria-label="Đóng modal"
                type="button"
              >
                <X size={18} />
              </button>
            </header>

            <div className={styles.mobileActionBar}>
              <button
                type="button"
                className={styles.createSessionBtn}
                onClick={() => setMobileView("create")}
              >
                <Plus size={18} />
                Tạo buổi học
              </button>
            </div>

            <div className={styles.mobileContent}>{renderSessionList()}</div>
          </div>
        ) : (
          <div className={styles.mobileView} aria-label="Tạo buổi học">
            <CreateSessionModal
              open={open}
              variant="embedded"
              showBackButton
              confirmationMode="inline"
              className={styles.mobileCreatePanel}
              classSchedules={classSchedules}
              initialScheduleId={prefillScheduleId}
              onBack={() => {
                if (!isCreateBusy) setMobileView("list");
              }}
              onRequestClose={closeAll}
              onSessionCreated={handleCompactSessionCreated}
              onBusyChange={setIsCreateBusy}
            />
          </div>
        )}
      </div>
    </ModalLayout>
  );
}
