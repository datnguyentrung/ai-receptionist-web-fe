import { TrendingUp } from "lucide-react";
import styles from "./TrendCard.module.scss";

export function TrendCard() {
  return (
    <div className={styles.trendCard}>
      <div className={styles.trendIconWrap} style={{ background: "#FEF2F2" }}>
        <TrendingUp size={18} style={{ color: "#E02020" }} />
      </div>
      <div>
        <p style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>
          Tỷ lệ có mặt tuần này: 82%
        </p>
        <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
          Tăng 3% so với tuần trước · Tổng 5 lớp học
        </p>
      </div>
      <div className={styles.sparkBarsOuter}>
        <div className={styles.sparkBars}>
          {[88, 82, 90, 78, 92, 85].map((v, i) => (
            <div
              key={i}
              className={styles.sparkBar}
              style={{
                height: `${v * 0.4}px`,
                background: i === 5 ? "#E02020" : "#FECACA",
                alignSelf: "flex-end",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
