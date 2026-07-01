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
  isFetching: boolean;
  onMenuAction?: (student: StudentOverview, action: StudentMenuAction) => void;
}

export function StudentTable({
  list,
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
              const beltColor = BELT_COLORS[student.belt];

              return (
                <tr
                  key={student.studentCode}
                  className={`${styles.tr} ${
                    student.studentStatus === "ACTIVE"
                      ? styles["tr--active"]
                      : ""
                  } ${
                    student.studentStatus === "RESERVED"
                      ? styles["tr--reserved"]
                      : ""
                  }`}
                >
                  <td
                    className={`${styles.td} ${styles.studentCell}`}
                    data-label="Học viên"
                  >
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
                          <span
                            className={styles.studentCodeBelt}
                            style={{
                              background: beltColor?.bg ?? "#F3F4F6",
                              color: beltColor?.color ?? "#374151",
                            }}
                          >
                            {student.belt}
                          </span>
                          <span>{student.studentCode}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={styles.td} data-label="Liên hệ">
                    <p className={styles.cellText}>
                      {student.phoneNumber}
                    </p>
                  </td>
                  <td className={styles.td} data-label="Lớp học">
                    <p
                      className={`${styles.cellText} ${styles["cellText--truncated"]}`}
                    >
                      {student.classSchedules
                        .map((c) => c.scheduleId)
                        .join(", ") || "-"}
                    </p>
                  </td>
                  <td className={styles.td} data-label="Ngày sinh">
                    <p className={styles.cellText}>
                      {formatDateDMY(student.birthDate)}
                    </p>
                  </td>
                  <td
                    className={`${styles.td} ${styles.beltCell}`}
                    style={{ textAlign: "center" }}
                    data-label="Cấp đai"
                  >
                    <span
                      className={styles.beltBadge}
                      style={{
                        background: beltColor?.bg ?? "#F3F4F6",
                        color: beltColor?.color ?? "#374151",
                      }}
                    >
                      {student.belt}
                    </span>
                  </td>
                  <td
                    className={styles.td}
                    style={{ textAlign: "center" }}
                    data-label="Chức vụ"
                  >
                    <p className={styles.cellText}>
                      {student.roleName}
                    </p>
                  </td>
                  <td
                    className={`${styles.td} ${styles.statusCell}`}
                    style={{ textAlign: "center" }}
                    data-label="Trạng thái"
                  >
                    <StatusBadge status={student.studentStatus} />
                  </td>
                  <td className={`${styles.td} ${styles.actionCell}`}>
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
