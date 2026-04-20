import type { EvaluationStatus } from "@/config/constants/OperationEnums";
import type { AttendanceStats } from "@/types";
import { TrendingUp } from "lucide-react";
import styles from "./TrendCard.module.scss";

interface TrendCardProps {
  stats: AttendanceStats;
  activeEvaluationStatuses?: EvaluationStatus[];
  onEvaluationFilterChange?: (value: EvaluationStatus[] | null) => void;
}

export function TrendCard({
  stats,
  activeEvaluationStatuses,
  onEvaluationFilterChange,
}: TrendCardProps) {
  const total = Math.max(stats.totalRecords, 0);
  const presentWithMakeup = stats.presentCount + stats.makeupCount;
  const attendedCount = presentWithMakeup + stats.lateCount;
  const attendanceRate =
    total > 0 ? Math.round((attendedCount / total) * 100) : 0;
  const attendedRate =
    total > 0 ? Math.round((attendedCount / total) * 100) : 0;
  const evaluationBaseTotal = presentWithMakeup + stats.lateCount;
  const evaluationSegments = [
    {
      key: "GOOD",
      label: "Tốt",
      count: stats.evalGoodCount,
      color: "#10B981",
    },
    {
      key: "AVERAGE",
      label: "Trung bình",
      count: stats.evalAverageCount,
      color: "#F59E0B",
    },
    {
      key: "WEAK",
      label: "Yếu",
      count: stats.evalWeakCount,
      color: "#EF4444",
    },
    {
      key: "PENDING",
      label: "Chưa đánh giá",
      count: stats.evalPendingCount,
      color: "#9CA3AF",
    },
  ];

  return (
    <div className={styles.trendCard}>
      <div className={styles.trendIconWrap} style={{ background: "#FEF2F2" }}>
        <TrendingUp size={18} style={{ color: "#E02020" }} />
      </div>
      <div className={styles.trendContent}>
        <p style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>
          Tỷ lệ có mặt tuần này: {attendanceRate}%
        </p>
        <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
          {attendedCount}/{total} có mặt hoặc đi muộn ({attendedRate}%) · Trong
          đó có {presentWithMakeup}
          lượt có mặt (bao gồm học bù)
        </p>

        <div className={styles.evalSection}>
          <p className={styles.evalTitle}>
            Đánh giá chất lượng trên {evaluationBaseTotal} lượt có mặt/đi muộn
          </p>
          <div className={styles.evalBar}>
            {evaluationSegments.map((segment) => {
              const widthPercent =
                evaluationBaseTotal > 0
                  ? (segment.count / evaluationBaseTotal) * 100
                  : 0;
              if (widthPercent <= 0) return null;

              const evaluationStatus = segment.key as EvaluationStatus;
              const isActive =
                activeEvaluationStatuses?.length === 1 &&
                activeEvaluationStatuses[0] === evaluationStatus;

              return (
                <button
                  key={segment.key}
                  type="button"
                  className={`${styles.evalSegment} ${isActive ? styles.evalSegmentActive : ""}`}
                  style={{
                    width: `${widthPercent}%`,
                    background: segment.color,
                  }}
                  title={`${segment.label}: ${segment.count}`}
                  onClick={() => {
                    if (!onEvaluationFilterChange) return;
                    onEvaluationFilterChange(
                      isActive ? null : [evaluationStatus],
                    );
                  }}
                />
              );
            })}
          </div>
          <div className={styles.evalLegend}>
            {evaluationSegments.map((segment) => {
              const evaluationStatus = segment.key as EvaluationStatus;
              const isActive =
                activeEvaluationStatuses?.length === 1 &&
                activeEvaluationStatuses[0] === evaluationStatus;
              const percent =
                evaluationBaseTotal > 0
                  ? Math.round((segment.count / evaluationBaseTotal) * 100)
                  : 0;

              const suffix = segment.key === "PENDING" ? null : `(${percent}%)`;

              return (
                <button
                  key={segment.key}
                  type="button"
                  className={`${styles.evalLegendItem} ${isActive ? styles.evalLegendItemActive : ""}`}
                  onClick={() => {
                    if (!onEvaluationFilterChange) return;
                    onEvaluationFilterChange(
                      isActive ? null : [evaluationStatus],
                    );
                  }}
                >
                  <span
                    className={styles.evalDot}
                    style={{ background: segment.color }}
                  />
                  {segment.label}: {segment.count} {suffix}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
