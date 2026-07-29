import { MoreHorizontal, Users } from "lucide-react";
import Avatar from "../../../components/common/Avatar";
import { MiniActionPopover } from "../../../components/ui/mini-action-popover";
import { BELT_COLORS, StatusBadge } from "../../../features/student";
import type { StudentOverview } from "../../../types";
import { formatDateDMY } from "../../../utils/format";
import { useRoleStudent } from "../../../utils/roleUtils";
import styles from "../StudentManagement.module.scss";

type StudentMenuAction =
  | "assign-class"
  | "delete"
  | "update"
  | "view-info"
  | "view-history";

type StudentRowAction = {
  id: StudentMenuAction;
  label: string;
};

interface StudentTableProps {
  list: StudentOverview[];
  isFetching: boolean;
  onMenuAction?: (student: StudentOverview, action: StudentMenuAction) => void;
}

const tableHeaders = [
  "Học viên",
  "Liên hệ",
  "Lớp học",
  "Ngày sinh",
  "Cấp đai",
  "Chức vụ",
  "Trạng thái",
  "",
];

const actionLabels: Record<StudentMenuAction, string> = {
  "assign-class": "Xếp lớp",
  update: "Cập nhật",
  "view-info": "Thông tin",
  "view-history": "Lịch sử học",
  delete: "Xóa vĩnh viễn ",
};

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
              {tableHeaders.map((header) => (
                <th
                  key={header}
                  className={styles.th}
                  style={{ textAlign: "center" }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((student: StudentOverview) => {
              const rowActions: StudentRowAction[] = [
                canViewManagerSenior &&
                  student.studentStatus === "ACTIVE"
                  ? {
                    id: "assign-class",
                    label: actionLabels["assign-class"],
                  }
                  : null,
                canViewManagerSenior
                  ? {
                    id: "update",
                    label: actionLabels.update,
                  }
                  : null,
                {
                  id: "view-info",
                  label: actionLabels["view-info"],
                },
                {
                  id: "view-history",
                  label: actionLabels["view-history"],
                },
                canViewManagerSenior
                  ? {
                    id: "delete",
                    label: actionLabels.delete,
                  }
                  : null,
              ].filter((action): action is StudentRowAction => action !== null);

              const beltColor = BELT_COLORS[student.belt];

              return (
                <tr
                  key={student.studentCode}
                  className={`${styles.tr} ${student.studentStatus === "ACTIVE"
                    ? styles["tr--active"]
                    : ""
                    } ${student.studentStatus === "RESERVED"
                      ? styles["tr--reserved"]
                      : ""
                    }`}
                >
                  <td
                    className={`${styles.td} ${styles.studentCell}`}
                    data-label={tableHeaders[0]}
                  >
                    <div className={styles.avatarCell}>
                      <Avatar
                        fullName={student.fullName}
                        fontSize="10px"
                        fontWeight={800}
                        width="36px"
                        height="36px"
                        imageUrl={student.avatarUrl}
                      />
                      <div>
                        <p className={styles.studentName}>{student.fullName}</p>
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
                  <td className={styles.td} data-label={tableHeaders[1]}>
                    <p className={styles.cellText}>{student.phoneNumber}</p>
                  </td>
                  <td className={styles.td} data-label={tableHeaders[2]}>
                    <p
                      className={`${styles.cellText} ${styles["cellText--truncated"]}`}
                    >
                      {student.classSchedules
                        .map((c) => c.scheduleId)
                        .join(", ") || "-"}
                    </p>
                  </td>
                  <td className={styles.td} data-label={tableHeaders[3]}>
                    <p className={styles.cellText}>
                      {formatDateDMY(student.birthDate)}
                    </p>
                  </td>
                  <td
                    className={`${styles.td} ${styles.beltCell}`}
                    style={{ textAlign: "center" }}
                    data-label={tableHeaders[4]}
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
                    data-label={tableHeaders[5]}
                  >
                    <p className={styles.cellText}>{student.roleName}</p>
                  </td>
                  <td
                    className={`${styles.td} ${styles.statusCell}`}
                    style={{ textAlign: "center" }}
                    data-label={tableHeaders[6]}
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
          <p className={styles.emptyText}>Chưa có học viên nào</p>
        </div>
      )}
    </>
  );
}
