import { ModalLayout } from "@/components/ui/modal-layout";
import { studentAPI } from "@/features/student/api/studentAPI";
import { ClassAssignmentModal } from "@/features/studentEnrollment/components/ClassAssignmentModal/ClassAssignmentModal";
import { useGetQuery } from "@/hooks/useCrud";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pagination } from "../../components/Pagination";
import { isPWA } from "../../config/appMode";
import type { Belt, StudentStatus } from "../../config/constants";
import { useDebounce } from "../../hooks/useDebounce";
import { useAuthStore } from "../../store/authStore";
import type { StudentOverview } from "../../types";
import styles from "./StudentManagement.module.scss";
import { AttendanceTableModal } from "./components/AttendanceTableModal/AttendanceTableModal";
import { StudentCreateModal } from "./components/StudentCreateModal";
import { StudentFilters } from "./components/StudentFilters";
import { StudentHeader } from "./components/StudentHeader";
import { StudentStats } from "./components/StudentStats";
import { StudentTable } from "./components/StudentTable";

type StudentMenuAction = "assign-class" | "view-info" | "view-history";

const STUDENT_FILTER_OPTIONS = [
  { value: "all" as const, label: "Tất cả" },
  { value: "ACTIVE" as StudentStatus, label: "Đang học" },
  { value: "RESERVED" as StudentStatus, label: "Tạm nghỉ" },
  { value: "DROPPED" as StudentStatus, label: "Nghỉ học" },
];

function StudentManagementSkeleton() {
  return (
    <div className={styles.skeletonTable} aria-hidden>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className={styles.skeletonStudentRow}>
          <div className={styles.skeletonAvatar} />
          <div className={styles.skeletonStudentLines}>
            <div />
            <div />
          </div>
          <div className={styles.skeletonCell} />
          <div className={styles.skeletonCell} />
          <div className={styles.skeletonPill} />
        </div>
      ))}
    </div>
  );
}

export function StudentManagement() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StudentStatus>(
    "all",
  );
  const [beltFilter, setBeltFilter] = useState<Belt[]>([]);
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isClassAssignmentOpen, setIsClassAssignmentOpen] = useState(false);
  const [studentForClassAssignment, setStudentForClassAssignment] =
    useState<StudentOverview | null>(null);
  const [isAttendanceHistoryOpen, setIsAttendanceHistoryOpen] = useState(false);
  const [studentForHistory, setStudentForHistory] =
    useState<StudentOverview | null>(null);
  const userInfo = useAuthStore((state) => state.activeProfile);

  const debouncedSearch = useDebounce(search, 500);

  const { data, isFetching: isStudentsFetching } = useGetQuery(
    [
      "students",
      {
        search: debouncedSearch,
        status: statusFilter,
        belts: beltFilter,
        scheduleIds:
          userInfo?.userInfo?.assignedClasses
            ?.map((c) => c?.classSchedule?.scheduleId)
            ?.filter((id): id is string => Boolean(id)) ?? [],
        page: page - 1,
        size: 10,
      },
    ],
    () =>
      studentAPI.getStudents({
        search: debouncedSearch,
        status: statusFilter === "all" ? undefined : statusFilter,
        scheduleIds:
          userInfo?.userInfo?.assignedClasses
            ?.map((c) => c?.classSchedule?.scheduleId)
            ?.filter((id): id is string => Boolean(id)) ?? [],
        belts: beltFilter.length > 0 ? beltFilter : undefined,
        page: page - 1,
        size: 10,
      }),
    { enabled: !!userInfo },
  );

  const list = data?.students.content ?? [];
  const isInitialLoading = !data && isStudentsFetching;
  const totalPages = data?.students.totalPages ?? 1;
  const totalStudents =
    (data?.activeStudentCount ?? 0) +
    (data?.reservedStudentCount ?? 0) +
    (data?.droppedStudentCount ?? 0);

  const statusFilterState = {
    all: {
      disabled: totalStudents === 0,
      hoverText:
        "Hiện chưa có học viên nào thuộc trạng thái này trong phạm vi phụ trách của bạn.",
    },
    ACTIVE: {
      disabled: (data?.activeStudentCount ?? 0) === 0,
      hoverText:
        "Hiện chưa có học viên nào thuộc trạng thái này trong phạm vi phụ trách của bạn.",
    },
    RESERVED: {
      disabled: (data?.reservedStudentCount ?? 0) === 0,
      hoverText:
        "Hiện chưa có học viên nào thuộc trạng thái này trong phạm vi phụ trách của bạn.",
    },
    DROPPED: {
      disabled: (data?.droppedStudentCount ?? 0) === 0,
      hoverText:
        "Hiện chưa có học viên nào thuộc trạng thái này trong phạm vi phụ trách của bạn.",
    },
  };

  const handleMenuAction = (
    student: StudentOverview,
    action: StudentMenuAction,
  ) => {
    if (action === "assign-class") {
      setStudentForClassAssignment(student);
      setIsClassAssignmentOpen(true);
    } else if (action === "view-info") {
      const detailPath = `/${student.studentCode}`;

      if (isPWA) {
        navigate(detailPath);
      } else {
        window.open(detailPath, "_blank", "noopener,noreferrer");
      }
    } else if (action === "view-history") {
      setStudentForHistory(student);
      setIsAttendanceHistoryOpen(true);
    }
  };

  const handleCloseClassAssignment = () => {
    setIsClassAssignmentOpen(false);
    setStudentForClassAssignment(null);
  };

  const handleCloseAttendanceHistory = () => {
    setIsAttendanceHistoryOpen(false);
    setStudentForHistory(null);
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setBeltFilter([]);
    setPage(1);
  };

  return (
    <div className={`${styles.page} ${isPWA ? styles["page--pwa"] : ""}`}>
      {/* 1. Header */}
      <StudentHeader
        totalStudents={totalStudents}
        activeCount={data?.activeStudentCount ?? 0}
        onAddStudent={() => setIsCreateModalOpen(true)}
      />

      {/* 2. Thống kê */}
      <StudentStats
        total={totalStudents}
        active={data?.activeStudentCount ?? 0}
        reserved={data?.reservedStudentCount ?? 0}
        dropped={data?.droppedStudentCount ?? 0}
      />

      {/* 3. Bộ lọc */}
      <div className={styles.filters}>
        <StudentFilters
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          filter={statusFilter}
          onFilterChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
          filterOptions={STUDENT_FILTER_OPTIONS}
          optionState={statusFilterState}
          belts={beltFilter}
          onBeltsChange={(val) => {
            setBeltFilter(val);
            setPage(1);
          }}
          resultCount={list.length}
          onClearAll={handleClearFilters}
        />
      </div>

      {/* 4. Bảng dữ liệu và Phân trang */}
      <div className={styles.tableCard}>
        {isInitialLoading ? (
          <StudentManagementSkeleton />
        ) : (
          <>
            <StudentTable
              list={list}
              isFetching={isStudentsFetching}
              onMenuAction={handleMenuAction}
            />
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              currentListLength={list.length}
            />
          </>
        )}
      </div>

      <StudentCreateModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <ModalLayout
        open={isClassAssignmentOpen}
        onClose={handleCloseClassAssignment}
        withSurface={false}
        maxWidth={1020}
        showMobileHandle={!isPWA}
        overlayClassName={isPWA ? styles.classAssignmentOverlayPwa : undefined}
        dialogClassName={isPWA ? styles.classAssignmentDialogPwa : undefined}
      >
        <div className={styles.modalContainer}>
          <ClassAssignmentModal
            onClose={handleCloseClassAssignment}
            initialStudent={studentForClassAssignment}
          />
        </div>
      </ModalLayout>

      {studentForHistory ? (
        <ModalLayout
          open={isAttendanceHistoryOpen}
          onClose={handleCloseAttendanceHistory}
          withSurface={false}
          maxWidth={980}
        >
          <div className={styles.modalContainer}>
            <AttendanceTableModal student={studentForHistory} />
          </div>
        </ModalLayout>
      ) : null}
    </div>
  );
}
