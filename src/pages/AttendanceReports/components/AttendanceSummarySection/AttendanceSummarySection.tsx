import { AttendancePieChart } from "../AttendancePieChart/AttendancePieChart";
import { SummaryStatCards } from "../SummaryStatCards/SummaryStatCards";
import { TrendCard } from "../TrendCard/TrendCard";
import styles from "./AttendanceSummarySection.module.scss";

export function AttendanceSummarySection() {
  return (
    <div className={styles.summaryOuter}>
      <div className={styles.summaryLeft}>
        <SummaryStatCards />
        <TrendCard />
      </div>
      <AttendancePieChart />
    </div>
  );
}
