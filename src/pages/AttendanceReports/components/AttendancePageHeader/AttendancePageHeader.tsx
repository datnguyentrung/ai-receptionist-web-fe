import { showComingSoonActionToast } from "@/components/ui/mini-action-popover.toast";
import { ArchiveX } from "lucide-react";
import styles from "./AttendancePageHeader.module.scss";

interface Props {
  totalRecords: number;
  onExport?: () => void;
}

export function AttendancePageHeader({ totalRecords }: Props) {
  return (
    <div className={styles.pageHead}>
      <div>
        <h2 className={styles.pageTitle}>
          Báo cáo Điểm Danh
        </h2>
        <p className={styles.pageSubtitle}>
          Tuần 10/2026 · {totalRecords} bản ghi
        </p>
      </div>
      <button
        className={styles.exportBtn}
        onClick={() => showComingSoonActionToast("Lưu trữ", "Điểm danh bị xóa")}
      >
        <ArchiveX size={16} /> Lưu trữ
      </button>
    </div>
  );
}
