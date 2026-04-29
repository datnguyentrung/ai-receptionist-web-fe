import { CreateClassScheduleModal } from "@/features/classSchedule/components/CreateClassScheduleModal";
import type { ClassScheduleDetail } from "@/types";
import { useRoleStudent } from "@/utils/roleUtils";
import { Plus } from "lucide-react";
import { useState } from "react";
import styles from "./ClassHeader.module.scss";

interface Props {
  totalClasses: number;
  activeClasses: number;
  classSchedules: ClassScheduleDetail[];
  view: "grid" | "week";
  onViewChange: (view: "grid" | "week") => void;
  onOpenSessionsModal?: () => void;
}

export function ClassHeader({
  totalClasses,
  activeClasses,
  classSchedules,
  view,
  onViewChange,
  onOpenSessionsModal,
}: Props) {
  const { canViewManagerSenior } = useRoleStudent();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>
            Lịch Học{" "}
            <span
              onClick={onOpenSessionsModal}
              style={{ cursor: "pointer", color: "#e02020" }}
              title="Xem các buổi học sắp diễn ra"
            >
              Sắp diễn ra
            </span>
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
          {canViewManagerSenior && (
            <button
              className={styles.addBtn}
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={16} /> Tạo lớp mới
            </button>
          )}
        </div>
      </div>
      <CreateClassScheduleModal
        classScheduleIds={classSchedules.map((c) => c.scheduleId)}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
