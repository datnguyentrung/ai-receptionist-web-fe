import { useState } from "react";
import { Pagination } from "../../components/Pagination";
import StatusFilters from "../../components/StatusFilters";
import type { StudentStatus } from "../../config/constants";
import { useGetStudents } from "../../features/student/api/useStudent";
import styles from "./StudentManagement.module.scss";
import { StudentHeader } from "./components/StudentHeader";
import { StudentStats } from "./components/StudentStats";
import { StudentTable } from "./components/StudentTable";
import { useDebounce } from '../../hooks/useDebounce';

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

  const debouncedSearch = useDebounce(search, 500);

  const { data, isFetching } = useGetStudents({
    search: debouncedSearch,
    status: statusFilter === "all" ? undefined : statusFilter,
    page,
    size: 10,
  });

  const list = data?.students.content ?? [];
  const totalPages = data?.students.totalPages ?? 1;
  const totalStudents =
    (data?.activeStudentCount ?? 0) +
    (data?.reservedStudentCount ?? 0) +
    (data?.droppedStudentCount ?? 0);

  const handleSelectAll = (checked: boolean) =>
    setSelected(checked ? list.map((s) => s.studentCode) : []);

  const toggleSelect = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <div className={styles.page}>
      {/* 1. Header */}
      <StudentHeader
        totalStudents={totalStudents}
        activeCount={data?.activeStudentCount ?? 0}
      />

      {/* 2. Thống kê */}
      <StudentStats
        total={totalStudents}
        active={data?.activeStudentCount ?? 0}
        reserved={data?.reservedStudentCount ?? 0}
        dropped={data?.droppedStudentCount ?? 0}
      />

      {/* 3. Bộ lọc */}
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

      {/* 4. Bảng dữ liệu và Phân trang */}
      <div className={styles.tableCard}>
        <StudentTable
          list={list}
          selected={selected}
          onToggleSelect={toggleSelect}
          onSelectAll={handleSelectAll}
          isFetching={isFetching}
        />
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          currentListLength={list.length}
        />
      </div>
    </div>
  );
}
