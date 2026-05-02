import { Skeleton } from "@/components/ui/skeleton";
import { leaderboardAPI } from "@/features/report/apis/LeaderboardAPI";
import { useGetQuery } from "@/hooks/useCrud";
import type { LeaderboardResponse } from "@/types/Report/LeaderboardTypes";
import { FileX } from "lucide-react";
import { useState } from "react";
import { ParticipantList } from "../ParticipantList/ParticipantList";
import { PodiumSection } from "../PodiumSection/PodiumSection";
import styles from "./QuarterLeaderboard.module.scss";

/* ------------------------------------------------------------------ */
/*  Skeleton / Empty / Error                                          */
/* ------------------------------------------------------------------ */
function LeaderboardSkeleton() {
  return (
    <div className={styles.skeleton}>
      {/* podium skeletons */}
      <div className={styles.skeleton__podium}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={styles.skeleton__podiumCard}>
            <Skeleton className="h-5 w-5 rounded-full mx-auto mb-2" />
            <Skeleton className="h-12 w-12 rounded-full mx-auto mb-2" />
            <Skeleton className="h-4 w-20 mx-auto mb-1" />
            <Skeleton className="h-6 w-10 mx-auto" />
          </div>
        ))}
      </div>
      {/* table skeletons */}
      <div className={styles.skeleton__table}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={styles.skeleton__row}>
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-8 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className={styles.empty}>
      <div className={styles.empty__icon}>
        <FileX size={32} strokeWidth={1.5} />
      </div>
      <p className={styles.empty__title}>Chưa có dữ liệu xếp hạng</p>
      <p className={styles.empty__desc}>
        Quý này chưa có học viên nào có điểm. Vui lòng chọn quý khác.
      </p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className={styles.empty}>
      <div className={`${styles.empty__icon} ${styles["empty__icon--error"]}`}>
        <FileX size={32} strokeWidth={1.5} />
      </div>
      <p className={styles.empty__title}>Đã xảy ra lỗi</p>
      <p className={styles.empty__desc}>
        Không thể tải dữ liệu xếp hạng. Vui lòng thử lại sau.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */
export default function QuarterLeaderboard({
  year,
  quarter,
}: {
  year: number;
  quarter: number;
}) {
  const [expandedRank, setExpandedRank] = useState<number | null>(null);

  const { data, isLoading, isError } = useGetQuery<LeaderboardResponse>(
    ["quarter-leaderboard", { year, quarter }],
    () => leaderboardAPI.getQuarterLeaderboard(year, quarter, 0, 30),
  );

  const rankings = data?.rankings ?? [];

  return (
    <div className={styles.ql}>
      {/* States */}
      {isLoading && <LeaderboardSkeleton />}
      {isError && <ErrorState />}
      {!isLoading && !isError && rankings.length === 0 && <EmptyState />}

      {/* Content */}
      {!isLoading && !isError && rankings.length > 0 && (
        <div className={styles.content}>
          <PodiumSection items={rankings.slice(0, 3)} metric="luot" />
          <ParticipantList
            items={rankings}
            expandedRank={expandedRank}
            onToggle={(r) => setExpandedRank((p) => (p === r ? null : r))}
            metric="điểm"
          />
        </div>
      )}
    </div>
  );
}
