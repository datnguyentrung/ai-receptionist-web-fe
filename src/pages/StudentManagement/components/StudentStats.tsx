import styles from "../StudentManagement.module.scss";

interface StudentStatsProps {
  total: number;
  active: number;
  reserved: number;
  dropped: number;
}

export function StudentStats({
  total,
  active,
  reserved,
  dropped,
}: StudentStatsProps) {
  const cards = [
    { label: "Tổng học viên", value: total, color: "#E02020" },
    { label: "Đang học", value: active, color: "#10B981" },
    { label: "Tạm nghỉ", value: reserved, color: "#F59E0B" },
    { label: "Nghỉ học", value: dropped, color: "#EF4444" },
  ];

  return (
    <div className={styles.summaryGrid}>
      {cards.map((c) => (
        <div key={c.label} className={styles.summaryCard}>
          <p
            className={styles.statValue}
            style={
              { "--stat-color": c.color } as React.CSSProperties
            }
          >
            {c.value}
          </p>
          <p className={styles.statLabel}>
            {c.label}
          </p>
        </div>
      ))}
    </div>
  );
}
