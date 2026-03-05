import { MoreHorizontal, Plus, Users } from "lucide-react";
import { useState } from "react";
import Avatar from "../../components/Avatar";
import StatusFilters from "../../components/StatusFilters";
import type { StudentStatus } from "../../config/constants";
import { STUDENTS } from "../../data/mockData";
import { BELT_COLORS, StatusBadge } from "../../features/student";
import { useGetStudents } from "../../features/student/api/useStudent";
import { formatDateDMY } from "../../utils/format";
import styles from "./StudentManagement.module.scss";

const STUDENT_FILTER_OPTIONS = [
  { value: "all" as const, label: "Tất cả" },
  { value: "active" as StudentStatus, label: "Đang học" },
  { value: "inactive" as StudentStatus, label: "Tạm nghỉ" },
  { value: "graduated" as StudentStatus, label: "Tốt nghiệp" },
];

export function StudentManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StudentStatus>(
    "all",
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const { data: data, isLoading } = useGetStudents({
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

  const list = data?.content ?? [];

  const filtered = list.filter((s) => {
    const matchSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.birthDate.toLowerCase().includes(search.toLowerCase()) ||
      s.branchId.toString().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
            {data?.totalElements ?? 0} học viên ·{" "}
            {list.filter((s) => s.status === "active").length} đang học
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
            value: data?.totalElements ?? 0,
            color: "#E02020",
          },
          {
            label: "Đang học",
            value: list.filter((s) => s.status === "active").length,
            color: "#10B981",
          },
          {
            label: "Tạm nghỉ",
            value: list.filter((s) => s.status === "inactive").length,
            color: "#F59E0B",
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
                        e.target.checked
                          ? filtered.map((s) => s.studentCode)
                          : [],
                      )
                    }
                    checked={
                      selected.length === filtered.length && filtered.length > 0
                    }
                  />
                </th>
                {[
                  "Học viên",
                  "Liên hệ",
                  "Lớp học",
                  "Huấn luyện viên",
                  "Cấp đai",
                  "Ngày vào học",
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
              {filtered.map((student) => (
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
                      {student.enrolledClass}
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
                      {student.coach}
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
                      {formatDateDMY(student.startDate)}
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
        {list.length === 0 ? (
          <div className={styles.emptyState}>
            <Users
              size={36}
              style={{ color: "#D1D5DB", margin: "0 auto 8px" }}
            />
            <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
              Chưa có học viên nào
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <Users
              size={36}
              style={{ color: "#D1D5DB", margin: "0 auto 8px" }}
            />
            <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
              Không tìm thấy học viên phù hợp với bộ lọc
            </p>
          </div>
        ) : null}
        <div className={styles.tableFooter}>
          <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
            Hiển thị {filtered.length} / {STUDENTS.length} học viên
          </p>
          <div className={styles.paginationBtns}>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={styles.paginationBtn}
                style={{
                  background: p === 1 ? "#E02020" : "transparent",
                  color: p === 1 ? "white" : "#6B7280",
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
