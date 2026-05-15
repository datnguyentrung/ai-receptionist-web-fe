import { Card, CardContent } from "@/components/ui/card";
import {
  ExamEligibilityLabel,
  type ExamEligibility,
} from "@/config/constants/OperationEnums";
import type { QuarterSummary } from "@/types/Report/YearlySummaryTypes";
import { clsx } from "clsx";
import { Clock, Gift, Star } from "lucide-react";
import styles from "./QuarterSummaryDetail.module.scss";

const statusClassMap: Record<ExamEligibility, string> = {
  NOT_ELIGIBLE: "score-tab__status-badge--not-eligible",
  ELIGIBLE: "score-tab__status-badge--eligible",
  EXEMPT: "score-tab__status-badge--exempt",
  NONE: "score-tab__status-badge--none",
  PENDING: "score-tab__status-badge--pending",
};

export default function QuarterSummaryDetail({
  summary,
}: {
  summary: QuarterSummary;
}) {
  const stats = summary.attendanceStats;
  return (
    <Card className={styles["score-tab__card"]}>
      <div className={styles["score-tab__card-header"]}>
        <h4 className={styles["score-tab__card-title"]}>
          Quý: {summary.quarterNumber}
        </h4>
        <span
          className={clsx(
            styles["score-tab__status-badge"],
            styles[statusClassMap[summary.eligibility]],
          )}
        >
          {ExamEligibilityLabel[summary.eligibility]}
        </span>
      </div>

      <CardContent className={styles["score-tab__card-body"]}>
        <div className={styles["score-tab__columns"]}>
          {/* Điểm Chuyên cần */}
          <div className={styles["score-tab__col"]}>
            <div className={styles["score-tab__col-head"]}>
              <h5 className={styles["score-tab__col-title"]}>
                <Clock size={16} className={styles["score-tab__icon--blue"]} />{" "}
                Điểm Chuyên cần
              </h5>
              {/* SỬA Ở ĐÂY: Gộp class base và modifier bằng clsx */}
              <span
                className={clsx(
                  styles["score-tab__col-value"],
                  styles["score-tab__col-value--blue"],
                )}
              >
                {summary.attendanceScore}
              </span>
            </div>

            <ul className={styles["score-tab__details"]}>
              <li className={styles["score-tab__detail-row"]}>
                <span>
                  Khởi điểm
                  {/* Chuyển phần chú thích sang bên trái, có thể làm mờ/nhỏ đi một chút */}
                  {stats.lateCount ||
                  stats.excusedCount ||
                  stats.absentCount ? (
                    <small
                      className={styles["score-tab__detail-note"]}
                    >
                      (5 - 1đ Vi phạm)
                    </small>
                  ) : null}
                </span>

                <span className={styles["score-tab__detail-value--muted"]}>
                  {/* Cột bên phải giờ chỉ còn con số thuần túy */}
                  {stats.lateCount || stats.excusedCount || stats.absentCount
                    ? "4.0"
                    : "5.0"}
                </span>
              </li>
              <li className={styles["score-tab__detail-row"]}>
                <span>Đi học muộn ({stats.lateCount})</span>
                <span className={styles["score-tab__detail-value--negative"]}>
                  -{(stats.lateCount * 0.5).toFixed(1)}
                </span>
              </li>
              <li className={styles["score-tab__detail-row"]}>
                <span>Nghỉ có phép ({stats.excusedCount})</span>
                <span className={styles["score-tab__detail-value--negative"]}>
                  -{(stats.excusedCount * 0.5).toFixed(1)}
                </span>
              </li>
              <li className={styles["score-tab__detail-row"]}>
                <span>Nghỉ KHÔNG phép ({stats.absentCount})</span>
                <span
                  className={styles["score-tab__detail-value--negative-bold"]}
                >
                  -{(stats.absentCount * 1.0).toFixed(1)}
                </span>
              </li>
              <li className={styles["score-tab__detail-row"]}>
                <span>Tập bù ({stats.makeupCount})</span>
                <span className={styles["score-tab__detail-value--positive"]}>
                  +{(stats.makeupCount * 0.5).toFixed(1)}
                </span>
              </li>
            </ul>
          </div>

          {/* Điểm Chuyên môn */}
          <div className={styles["score-tab__col"]}>
            <div className={styles["score-tab__col-head"]}>
              <h5 className={styles["score-tab__col-title"]}>
                <Star size={16} className={styles["score-tab__icon--amber"]} />{" "}
                Điểm Chuyên môn
              </h5>
              {/* SỬA Ở ĐÂY: Gộp class base và modifier bằng clsx */}
              <span
                className={clsx(
                  styles["score-tab__col-value"],
                  styles["score-tab__col-value--amber"],
                )}
              >
                {summary.performanceScore}
              </span>
            </div>

            <ul className={styles["score-tab__details"]}>
              <li className={styles["score-tab__detail-row"]}>
                <span>Tốt ({stats.evalGoodCount} buổi x 5đ)</span>
                <span className={styles["score-tab__detail-value--muted"]}>
                  {stats.evalGoodCount * 5}
                </span>
              </li>
              <li className={styles["score-tab__detail-row"]}>
                <span>Trung bình ({stats.evalAverageCount} buổi x 3đ)</span>
                <span className={styles["score-tab__detail-value--muted"]}>
                  {stats.evalAverageCount * 3}
                </span>
              </li>
              <li className={styles["score-tab__detail-row"]}>
                <span>Yếu ({stats.evalWeakCount} buổi x 0đ)</span>
                <span className={styles["score-tab__detail-value--muted"]}>
                  0
                </span>
              </li>
            </ul>
          </div>

          {/* Điểm Thưởng */}
          <div className={styles["score-tab__col"]}>
            <div className={styles["score-tab__col-head"]}>
              <h5 className={styles["score-tab__col-title"]}>
                <Gift size={16} className={styles["score-tab__icon--purple"]} />{" "}
                Điểm Thưởng
              </h5>
              {/* SỬA Ở ĐÂY: Gộp class base và modifier bằng clsx */}
              <span
                className={clsx(
                  styles["score-tab__col-value"],
                  styles["score-tab__col-value--purple"],
                )}
              >
                {summary.bonusScore}
              </span>
            </div>

            <ul className={styles["score-tab__details"]}>
              <li className={styles["score-tab__no-bonus"]}>
                Rất tiếc, tính năng này chưa được triển khai.
              </li>
            </ul>
          </div>
        </div>

        {/* Tổng điểm Footer */}
        <div className={styles["score-tab__footer"]}>
          <div className={styles["score-tab__footer-inner"]}>
            <span className={styles["score-tab__footer-title"]}>
              Tổng Điểm Quý
            </span>
            <div className={styles["score-tab__footer-score"]}>
              <span className={styles["score-tab__total"]}>
                {summary.totalQuarterScore}
              </span>
              <span className={styles["score-tab__unit"]}>điểm</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
