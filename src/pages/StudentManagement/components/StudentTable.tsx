import { MoreHorizontal, Users } from "lucide-react";
import Avatar from "../../../components/Avatar";
import { MiniActionPopover } from "../../../components/ui/mini-action-popover";
import { BELT_COLORS, StatusBadge } from "../../../features/student";
import type { StudentOverview } from "../../../types";
import { formatDateDMY } from "../../../utils/format";
import { useRoleStudent } from "../../../utils/roleUtils";
import styles from "../StudentManagement.module.scss";

type StudentMenuAction = "assign-class" | "view-info" | "view-history";

interface StudentTableProps {
  list: StudentOverview[];
  selected: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  isFetching: boolean;
  onMenuAction?: (student: StudentOverview, action: StudentMenuAction) => void;
}

export function StudentTable({
  list,
  selected,
  onToggleSelect,
  onSelectAll,
  isFetching,
  onMenuAction,
}: StudentTableProps) {
  const { canViewManagerSenior } = useRoleStudent();
  return (
    <>
      <div className={styles.tableWrap}>
        <table
          className={`${styles.table} ${isFetching ? styles["table--fetching"] : ""}`}
        >
          <thead>
            <tr className={styles.theadRow}>
              <th className={styles.th} style={{ width: "32px" }}>
                <input
                  type="checkbox"
                  className="rounded"
                  onChange={(e) => onSelectAll(e.target.checked)}
                  checked={selected.length === list.length && list.length > 0}
                />
              </th>
              {[
                "Học viên",
                "Liên hệ",
                "Lớp học",
                "Ngày sinh",
                "Cấp đai",
                "Chức vụ",
                "Trạng thái",
                "",
              ].map((h) => (
                <th key={h} className={styles.th} style={{ textAlign: "center" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((student: StudentOverview) => {
              const rowActions = [
                canViewManagerSenior &&
                student.classSchedules.length !== 0 &&
                student.studentStatus === "ACTIVE"
                  ? {
                      id: "assign-class",
                      label: "Xếp lớp",
                    }
                  : null,
                {
                  id: "view-info",
                  label: "Thông tin",
                },
                {
                  id: "view-history",
                  label: "Lịch sử học",
                },
              ].filter(
                (action): action is { id: string; label: string } =>
                  action !== null,
              );

              return (
                <tr key={student.studentCode} className={styles.tr}>
                  <td className={styles.td}>
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selected.includes(student.studentCode)}
                      onChange={() => onToggleSelect(student.studentCode)}
                    />
                  </td>
                  <td className={styles.td}>
                    <div className={styles.avatarCell}>
                      <Avatar
                        fullName={student.fullName}
                        fontSize="10px"
                        fontWeight={800}
                        width="36px"
                        height="36px"
                      />
                      <div>
                        <p className={styles.studentName}>
                          {student.fullName}
                        </p>
                        <p className={styles.studentCode}>
                          {student.studentCode}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <p className={styles.cellText}>
                      {student.phoneNumber}
                    </p>
                  </td>
                  <td className={styles.td}>
                    <p
                      className={`${styles.cellText} ${styles["cellText--truncated"]}`}
                    >
                      {student.classSchedules
                        .map((c) => c.scheduleId)
                        .join(", ") || "-"}
                    </p>
                  </td>
                  <td className={styles.td}>
                    <p className={styles.cellText}>
                      {formatDateDMY(student.birthDate)}
                    </p>
                  </td>
                  <td className={styles.td} style={{ textAlign: "center" }}>
                    <span
                      className={styles.beltBadge}
                      style={{
                        background: BELT_COLORS[student.belt]?.bg ?? "#F3F4F6",
                        color: BELT_COLORS[student.belt]?.color ?? "#374151",
                      }}
                    >
                      {student.belt}
                    </span>
                  </td>
                  <td className={styles.td} style={{ textAlign: "center" }}>
                    <p className={styles.cellText}>
                      {student.roleName}
                    </p>
                  </td>
                  <td className={styles.td} style={{ textAlign: "center" }}>
                    <StatusBadge status={student.studentStatus} />
                  </td>
                  <td className={styles.td}>
                    <MiniActionPopover
                      itemLabel={student.fullName}
                      triggerClassName={styles.moreBtn}
                      actions={rowActions}
                      onActionSelect={(action) =>
                        onMenuAction?.(student, action as StudentMenuAction)
                      }
                    >
                      <MoreHorizontal size={15} />
                    </MiniActionPopover>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {list.length === 0 && (
        <div className={styles.emptyState}>
          <Users size={36} className={styles.emptyIcon} />
          <p className={styles.emptyText}>
            Chưa có học viên nào
          </p>
        </div>
      )}
    </>
  );
}
