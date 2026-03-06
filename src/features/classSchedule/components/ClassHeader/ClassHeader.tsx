import { Plus } from "lucide-react";
import styles from "./ClassHeader.module.scss";

interface Props {
  totalClasses: number;
  activeClasses: number;
  view: "grid" | "week";
  onViewChange: (view: "grid" | "week") => void;
}

export function ClassHeader({
  totalClasses,
  activeClasses,
  view,
  onViewChange,
}: Props) {
  return (
    <div className={styles.pageHead}>
      <div>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>
          Lịch Học
        </h2>
        <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
          {totalClasses} lớp · {activeClasses} đang hoạt động
        </p>
      </div>
      <div className={styles.headerActions}>
        <div className={styles.viewToggle}>
          {(["grid", "week"] as const).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={styles.viewToggleBtn}
              style={{
                fontSize: "12px",
                fontWeight: 600,
                background: view === v ? "#E02020" : "transparent",
                color: view === v ? "white" : "#6B7280",
              }}
            >
              {v === "grid" ? "Thẻ lớp" : "Theo ngày"}
            </button>
          ))}
        </div>
        <button className={styles.addBtn}>
          <Plus size={16} /> Tạo lớp mới
        </button>
      </div>
    </div>
  );
}
