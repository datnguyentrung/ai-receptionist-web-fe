import { studentAPI } from "@/features/student/api/studentAPI";
import { useGetQuery } from "@/hooks/useCrud";
import type {
  QuarterSummary,
  YearlySummaryResponse,
} from "@/types/Report/YearlySummaryTypes";
import { useOutletContext } from "react-router-dom";
import type { OutletContextType } from "../TabViews/TabViews";
import QuarterSummaryDetail from "./QuarterSummaryDetail/QuarterSummaryDetail";
import styles from "./ScoreTab.module.scss";

export default function ScoreTab() {
  const context = useOutletContext<OutletContextType>();
  const profile = context?.user;
  const isStudent = !!profile && "studentCode" in profile;
  const studentCode = isStudent ? profile.studentCode : undefined;

  const { data } = useGetQuery(
    ["student-yearly-summary", studentCode],
    (): Promise<YearlySummaryResponse> =>
      studentAPI.getYearlySummary(studentCode!, new Date().getFullYear()),
    { enabled: !!studentCode, staleTime: 5 * 60 * 1000 },
  );

  return (
    <div className={styles["score-tab"]}>
      <div className={styles["score-tab__header"]}>
        <h3 className={styles["score-tab__title"]}>Chi tiết Điểm rèn luyện</h3>
        <p className={styles["score-tab__subtitle"]}>*Cập nhật theo quý</p>
      </div>

      <div className={styles["score-tab__list"]}>
        {data?.quarters
          .filter((q) => q.attendanceStats.totalRecords > 0)
          .map((q: QuarterSummary, index: number) => {
            return <QuarterSummaryDetail key={index} summary={q} />;
          })}
      </div>
    </div>
  );
}
