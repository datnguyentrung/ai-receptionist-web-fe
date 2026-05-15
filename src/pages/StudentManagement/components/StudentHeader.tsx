import { Plus } from "lucide-react";
import { useRoleStudent } from "../../../utils/roleUtils";
import styles from "../StudentManagement.module.scss";

interface StudentHeaderProps {
  totalStudents: number;
  activeCount: number;
  onAddStudent?: () => void;
}

export function StudentHeader({
  totalStudents,
  activeCount,
  onAddStudent,
}: StudentHeaderProps) {
  const { canViewManagerSenior } = useRoleStudent();
  return (
    <div className={styles.pageHead}>
      <div>
        <h2 className={styles.pageTitle}>
          Quản lý Học Viên
        </h2>
        <p className={styles.pageSubtitle}>
          {totalStudents} học viên · {activeCount} đang học
        </p>
      </div>
      {canViewManagerSenior && (
        <button type="button" className={styles.addBtn} onClick={onAddStudent}>
          <Plus size={16} /> Thêm học viên
        </button>
      )}
    </div>
  );
}
