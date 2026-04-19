import type {
  AttendanceStatus,
  EvaluationStatus,
} from "@/config/constants/OperationEnums";
import type { AttendanceStats } from "@/types";
import { AttendancePieChart } from "../AttendancePieChart/AttendancePieChart";
import { SummaryStatCards } from "../SummaryStatCards/SummaryStatCards";
import { TrendCard } from "../TrendCard/TrendCard";
import styles from "./AttendanceSummarySection.module.scss";

interface SummaryStatProps {
  stats: AttendanceStats;
  activeAttendanceStatuses?: AttendanceStatus[];
  activeEvaluationStatuses?: EvaluationStatus[];
  onAttendanceFilterChange?: (value: AttendanceStatus[] | null) => void;
  onEvaluationFilterChange?: (value: EvaluationStatus[] | null) => void;
}

export function AttendanceSummarySection({
  stats,
  activeAttendanceStatuses,
  activeEvaluationStatuses,
  onAttendanceFilterChange,
  onEvaluationFilterChange,
}: SummaryStatProps) {
  return (
    <div className={styles.summaryOuter}>
      <div className={styles.summaryLeft}>
        <SummaryStatCards
          stats={stats}
          activeAttendanceStatuses={activeAttendanceStatuses}
          onAttendanceFilterChange={onAttendanceFilterChange}
        />
        <TrendCard
          stats={stats}
          activeEvaluationStatuses={activeEvaluationStatuses}
          onEvaluationFilterChange={onEvaluationFilterChange}
        />
      </div>
      <AttendancePieChart
        stats={stats}
        activeAttendanceStatuses={activeAttendanceStatuses}
        onAttendanceFilterChange={onAttendanceFilterChange}
      />
    </div>
  );
}
