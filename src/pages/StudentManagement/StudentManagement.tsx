import { MoreHorizontal, Plus, Users } from "lucide-react";
import { useState } from "react";
import Avatar from "../../components/Avatar";
import StatusFilters from "../../components/StatusFilters";
import type { StudentStatus } from "../../config/constants";
import { BELT_COLORS, StatusBadge } from "../../features/student";
import { useGetStudents } from "../../features/student/api/useStudent";
import { formatDateDMY } from "../../utils/format";
import styles from "./StudentManagement.module.scss";

const STUDENT_FILTER_OPTIONS = [
  { value: "all" as const, label: "Tất cả" },
  { value: "ACTIVE" as StudentStatus, label: "Đang học" },
  { value: "RESERVED" as StudentStatus, label: "Tạm nghỉ" },
  { value: "DROPPED" as StudentStatus, label: "Nghỉ học" },
];

export function StudentManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StudentStatus>(
    "all",
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetStudents({
    search,
    status: statusFilter === "all" ? undefined : statusFilter,
    page,
    size: 10,
  });

  if (isLoading) {
    return (
      <div className={styles.page}>
        <p style={{ fontSize: "14px", color: "#9CA3AF" }}>
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }

  const list = data?.students.content ?? [];
  const totalPages = data?.students.totalPages ?? 1;
  const totalStudents =
    (data?.activeStudentCount ?? 0) +
    (data?.reservedStudentCount ?? 0) +
    (data?.droppedStudentCount ?? 0);

  const toggleSelect = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHead}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>
            Quản lý Học Viên
          </h2>
          <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
            {totalStudents} học viên · {data?.activeStudentCount ?? 0} đang học
          </p>
        </div>
        <button className={styles.addBtn}>
          <Plus size={16} /> Thêm học viên
        </button>
      </div>

      {/* Summary mini cards */}
      <div className={styles.summaryGrid}>
        {[
          {
            label: "Tổng học viên",
            value:
              (data?.activeStudentCount ?? 0) +
              (data?.reservedStudentCount ?? 0) +
              (data?.droppedStudentCount ?? 0),
            color: "#E02020",
          },
          {
            label: "Đang học",
            value: data?.activeStudentCount ?? 0,
            color: "#10B981",
          },
          {
            label: "Tạm nghỉ",
            value: data?.reservedStudentCount ?? 0,
            color: "#F59E0B",
          },
          {
            label: "Nghỉ học",
            value: data?.droppedStudentCount ?? 0,
            color: "#EF4444",
          },
        ].map((c) => (
          <div key={c.label} className={styles.summaryCard}>
            <p style={{ fontSize: "22px", fontWeight: 800, color: c.color }}>
              {c.value}
            </p>
            <p style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 500 }}>
              {c.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <StatusFilters
          search={search}
          setSearch={(val) => {
            setSearch(val);
            setPage(1);
          }}
          filter={statusFilter}
          setFilter={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
          filterOptions={STUDENT_FILTER_OPTIONS}
          searchPlaceholder="Tìm học viên, lớp, HLV..."
          searchWidth="260px"
        />
        {selected.length > 0 && (
          <span className={styles.selectedBadge}>
            Đã chọn {selected.length}
          </span>
        )}
      </div>

      {/* Table */}
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
                <th className={styles.th} style={{ width: "32px" }}>
                  <input
                    type="checkbox"
                    className="rounded"
                    onChange={(e) =>
                      setSelected(
                        e.target.checked ? list.map((s) => s.studentCode) : [],
                      )
                    }
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
              {list.map((student) => (
                <tr key={student.studentCode} className={styles.tr}>
                  <td className={styles.td}>
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selected.includes(student.studentCode)}
                      onChange={() => toggleSelect(student.studentCode)}
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
                    <button className={styles.moreBtn}>
                      <MoreHorizontal size={15} style={{ color: "#9CA3AF" }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {list.length === 0 && (
          <div className={styles.emptyState}>
            <Users
              size={36}
              style={{ color: "#D1D5DB", margin: "0 auto 8px" }}
            />
            <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
              Chưa có học viên nào
            </p>
          </div>
        )}
        <div className={styles.tableFooter}>
          <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
            Hiển thị {list.length} / {totalStudents} học viên
          </p>
          <div className={styles.paginationBtns}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={styles.paginationBtn}
                onClick={() => setPage(p)}
                style={{
                  background: p === page ? "#E02020" : "transparent",
                  color: p === page ? "white" : "#6B7280",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
