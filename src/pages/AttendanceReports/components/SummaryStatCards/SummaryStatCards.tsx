import { SUMMARY_CARDS } from "@/pages/AttendanceReports/constants";
import styles from "./SummaryStatCards.module.scss";

export function SummaryStatCards() {
  return (
    <>
      {SUMMARY_CARDS.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} className={styles.summaryCard}>
            <div
              className={styles.summaryIconWrap}
              style={{ background: c.bg }}
            >
              <Icon size={16} style={{ color: c.color }} />
            </div>
            <p style={{ fontSize: "22px", fontWeight: 800, color: c.color }}>
              {c.value}
            </p>
            <p style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 500 }}>
              {c.label}
            </p>
          </div>
        );
      })}
    </>
  );
}
