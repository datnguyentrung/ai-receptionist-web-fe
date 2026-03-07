import type { AttendanceDTO } from "@/data/mockData";
import { avatarColor } from "@/utils/avatarColor";
import { AttendanceBadge } from "../../../../features/studentAttendance/components/AttendanceBadge/AttendanceBadge";
import { ClipboardList } from "../../../../features/studentAttendance/components/ClipboardList";
import styles from "./AttendanceTable.module.scss";

const TABLE_HEADERS = [
  "Học viên",
  "Lớp học",
  "Huấn luyện viên",
  "Ngày",
  "Giờ vào",
  "Giờ ra",
  "Trạng thái",
];

interface Props {
  data: AttendanceDTO[];
  total: number;
}

export function AttendanceTable({ data, total }: Props) {
  return (
    <div className={styles.tableCard}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr
              style={{
                background: "#FAFAFA",
                borderBottom: "1px solid #F3F4F6",
              }}
            >
              {TABLE_HEADERS.map((h) => (
                <th key={h} className={styles.th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((a) => (
              <tr key={a.attendanceId} className={styles.tr}>
                <td className={styles.td}>
                  <div className={styles.avatarCell}>
                    <div
                      className={styles.avatar}
                      style={{ background: avatarColor(a.studentAvatar) }}
                    >
                      {a.studentAvatar}
                    </div>
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#111827",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {a.studentName}
                    </p>
                  </div>
                </td>
                <td className={styles.td}>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#374151",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {a.className}
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
                    {a.coachName}
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
                    {new Date(a.date).toLocaleDateString("vi-VN")}
                  </p>
                </td>
                <td className={styles.td}>
                  <p
                    style={{
                      fontSize: "12px",
                      color: a.checkIn !== "-" ? "#111827" : "#D1D5DB",
                      fontWeight: a.checkIn !== "-" ? 500 : 400,
                    }}
                  >
                    {a.checkIn}
                  </p>
                </td>
                <td className={styles.td}>
                  <p
                    style={{
                      fontSize: "12px",
                      color: a.checkOut !== "-" ? "#111827" : "#D1D5DB",
                      fontWeight: a.checkOut !== "-" ? 500 : 400,
                    }}
                  >
                    {a.checkOut}
                  </p>
                </td>
                <td className={styles.td}>
                  <AttendanceBadge status={a.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className={styles.emptyState}>
          <ClipboardList
            size={36}
            style={{ color: "#D1D5DB", margin: "0 auto 8px" }}
          />
          <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
            Không có dữ liệu điểm danh
          </p>
        </div>
      )}
      <div className={styles.tableFooter}>
        <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
          Hiển thị {data.length} / {total} bản ghi
        </p>
      </div>
    </div>
  );
}
