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
          className={styles.table}
          style={{
            opacity: isFetching ? 0.5 : 1,
            transition: "opacity 0.2s",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#FAFAFA",
                borderBottom: "1px solid #F3F4F6",
              }}
            >
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
                <th key={h} className={styles.th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((student: StudentOverview) => {
              const rowActions = [
                canViewManagerSenior
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
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#111827",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {student.fullName}
                        </p>
                        <p style={{ fontSize: "11px", color: "#9CA3AF" }}>
                          {student.studentCode}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <p style={{ fontSize: "12px", color: "#374151" }}>
                      {student.phoneNumber}
                    </p>
                    <p style={{ fontSize: "11px", color: "#9CA3AF" }}>
                      {student.branchName}
                    </p>
                  </td>
                  <td className={styles.td}>
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: 500,
                        color: "#374151",
                        whiteSpace: "nowrap",
                        maxWidth: "160px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {student.classSchedules
                        .map((c) => c.scheduleId)
                        .join(", ") || "-"}
                    </p>
                  </td>
                  <td className={styles.td}>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#374151",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDateDMY(student.birthDate)}
                    </p>
                  </td>
                  <td className={styles.td}>
                    <span
                      className={styles.beltBadge}
                      style={{
                        background: BELT_COLORS[student.belt]?.bg ?? "#F3F4F6",
                        color: BELT_COLORS[student.belt]?.color ?? "#374151",
                        fontSize: "11px",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {student.belt}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#374151",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {student.roleName}
                    </p>
                  </td>
                  <td className={styles.td}>
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
                      <MoreHorizontal size={15} style={{ color: "#9CA3AF" }} />
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
          <Users size={36} style={{ color: "#D1D5DB", margin: "0 auto 8px" }} />
          <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
            Chưa có học viên nào
          </p>
        </div>
      )}
    </>
  );
}
