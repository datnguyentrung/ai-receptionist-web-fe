import { Plus } from "lucide-react";
import styles from "../StudentManagement.module.scss";

interface StudentHeaderProps {
  totalStudents: number;
  activeCount: number;
}

export function StudentHeader({
  totalStudents,
  activeCount,
}: StudentHeaderProps) {
  return (
    <div className={styles.pageHead}>
      <div>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>
          Quản lý Học Viên
        </h2>
        <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
          {totalStudents} học viên · {activeCount} đang học
        </p>
      </div>
      <button className={styles.addBtn}>
        <Plus size={16} /> Thêm học viên
      </button>
    </div>
  );
}
