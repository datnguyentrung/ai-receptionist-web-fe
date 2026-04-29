import { Skeleton } from "@/components/ui/skeleton";
import type { PageResponse, SessionResponse } from "@/types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Clock, MapPin } from "lucide-react";
import { formatTimeStringHM } from "../../../../utils/format";
import { getLabelClassScheduleNoBranch } from "../../../../utils/getInitials";
import styles from "./SessionLayout.module.scss";

interface SessionLayoutProps {
  sessions?: PageResponse<SessionResponse>;
  isLoading?: boolean;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export function SessionLayout({
  sessions,
  isLoading = false,
  currentPage = 1,
  onPageChange,
}: SessionLayoutProps) {
  if (isLoading) {
    return (
      <div className={styles.container}>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className={styles.sessionItemSkeleton}>
            <Skeleton className={styles.skeletonDate} />
            <Skeleton className={styles.skeletonTime} />
            <Skeleton className={styles.skeletonClass} />
          </div>
        ))}
      </div>
    );
  }

  if (!sessions || sessions.empty || !sessions.content?.length) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📚</div>
        <h3 className={styles.emptyTitle}>Không có buổi học sắp diễn ra</h3>
        <p className={styles.emptyDescription}>
          Tất cả các buổi học đã được kiểm tra hoặc không có buổi nào sắp diễn
          ra
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.sessionList}>
        {sessions.content.map((session) => (
          <div key={session.sessionId} className={styles.sessionItem}>
            <div className={styles.sessionHeader}>
              <div className={styles.dateTimeInfo}>
                <div className={styles.date}>
                  {session.sessionDate
                    ? format(new Date(session.sessionDate), "dd MMM yyyy", {
                        locale: vi,
                      })
                    : "N/A"}
                </div>
                {session.startTime && (
                  <div className={styles.time}>
                    <Clock size={14} />
                    {formatTimeStringHM(session.startTime)}
                    {session.endTime &&
                      ` - ${formatTimeStringHM(session.endTime)}`}
                  </div>
                )}
              </div>
              <div className={styles.statusBadge}>
                {session.isAttendanceClosed ? (
                  <span className={styles.closed}>Đã kết thúc</span>
                ) : (
                  <span className={styles.active}>Sắp diễn ra</span>
                )}
              </div>
            </div>

            <div className={styles.sessionBody}>
              <div className={styles.classInfo}>
                <MapPin size={14} />
                <div>
                  <div className={styles.className}>
                    {getLabelClassScheduleNoBranch(
                      session.classSchedule?.scheduleId,
                    ) || "N/A"}
                  </div>
                  {session.classSchedule?.branchName && (
                    <div className={styles.instructorName}>
                      Chi nhánh: {session.classSchedule.branchName}
                    </div>
                  )}
                </div>
              </div>

              {session.note && (
                <div className={styles.note}>
                  <strong>Ghi chú:</strong> {session.note}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {sessions.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationBtn}
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={sessions.first}
            type="button"
          >
            ← Trước
          </button>

          <div className={styles.pageInfo}>
            Trang {sessions.number + 1} / {sessions.totalPages}
          </div>

          <button
            className={styles.paginationBtn}
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={sessions.last}
            type="button"
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
}
