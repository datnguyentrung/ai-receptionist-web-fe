import { Check, Info, Send } from "lucide-react";
import { memo } from "react";
import styles from "./BottomBar.module.scss";

interface BottomBarProps {
  unmarkedCount: number;
  markedCount: number;
  totalCount: number;
  submitted: boolean;
  onSubmit: () => void;
  evalCount: number;
}

function BottomBarInner({
  unmarkedCount,
  markedCount,
  totalCount,
  submitted,
  onSubmit,
  evalCount,
}: BottomBarProps) {
  return (
    <div className={styles.bottomBar}>
      {unmarkedCount > 0 && (
        <div className={styles.warningBanner}>
          <Info size={14} style={{ color: "#D97706", flexShrink: 0 }} />
          <p className={styles.warningText}>
            Còn <span className={styles.warningCount}>{unmarkedCount}</span> học
            viên chưa được đánh giá
          </p>
        </div>
      )}

      <button
        type="button"
        className={styles.btnSubmit}
        onClick={onSubmit}
        disabled={submitted}
        title={`Đã đánh giá ${markedCount}/${totalCount} học viên`}
      >
        {submitted ? (
          <>
            <Check size={20} /> Đã nộp đánh giá
          </>
        ) : (
          <>
            <Send size={18} /> Tiến trình đánh giá ({unmarkedCount}/{evalCount})
            - đã đánh giá {markedCount}/{totalCount}
          </>
        )}
      </button>
    </div>
  );
}

export const BottomBar = memo(BottomBarInner);
