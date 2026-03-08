import { Check, Info, Send } from "lucide-react";
import styles from "./BottomBar.module.scss";

interface BottomBarProps {
  unmarkedCount: number;
  markedCount: number;
  totalCount: number;
  submitted: boolean;
  onSubmit: () => void;
}

export function BottomBar({
  unmarkedCount,
  markedCount,
  totalCount,
  submitted,
  onSubmit,
}: BottomBarProps) {
  return (
    <div className={styles.bottomBar}>
      {unmarkedCount > 0 && (
        <div className={styles.warningBanner}>
          <Info size={14} style={{ color: "#D97706", flexShrink: 0 }} />
          <p className={styles.warningText}>
            Còn <span className={styles.warningCount}>{unmarkedCount}</span>{" "}
            học viên chưa được điểm danh
          </p>
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={submitted}
        className={styles.btnSubmit}
      >
        {submitted ? (
          <>
            <Check size={20} /> Đã nộp điểm danh
          </>
        ) : (
          <>
            <Send size={18} /> Nộp điểm danh ({markedCount}/{totalCount})
          </>
        )}
      </button>
    </div>
  );
}
