import { Input } from "@/components/ui/input";
import { ModalLayout } from "@/components/ui/modal-layout";
import { Textarea } from "@/components/ui/textarea";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import type { Belt, StudentStatus } from "@/config/constants";
import { useGetAllClassSchedules } from "@/features/classSchedule";
import { useCreateStudent } from "@/features/student";
import ClassList from "@/features/studentEnrollment/components/ClassList/ClassList";
import type {
  ClassScheduleDetail,
  ClassScheduleSummary,
  StudentCreateRequest,
} from "@/types";
import { useMemo, useState } from "react";
import styles from "./StudentCreateModal.module.scss";

type BranchOption = {
  branchId: number;
  branchName: string;
};

type StudentCreateFormState = {
  fullName: string;
  phoneNumber: string;
  nationalCode: string;
  birthDate: string;
  startDate: string;
  belt: Belt;
  studentStatus: StudentStatus;
  note: string;
};

type StudentCreateModalProps = {
  open: boolean;
  onClose: () => void;
};

const BELT_OPTIONS: Belt[] = [
  "C10",
  "C9",
  "C8",
  "C7",
  "C6",
  "C5",
  "C4",
  "C3",
  "C2",
  "C1",
  "D1",
  "D2",
  "D3",
  "D4",
  "D5",
  "D6",
  "D7",
  "D8",
  "D9",
  "D10",
];

const STATUS_OPTIONS: Array<{ value: StudentStatus; label: string }> = [
  { value: "ACTIVE", label: "Đang học" },
  { value: "RESERVED", label: "Bảo lưu" },
  { value: "DROPPED", label: "Nghỉ học" },
];

const formatToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createInitialForm = (today: string): StudentCreateFormState => ({
  fullName: "",
  phoneNumber: "",
  nationalCode: "",
  birthDate: "",
  startDate: today,
  belt: "C10",
  studentStatus: "ACTIVE",
  note: "",
});

function isFutureDate(value: string) {
  if (!value) {
    return false;
  }

  const today = new Date();
  const date = new Date(value);
  const safeToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const safeDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  return safeDate > safeToday;
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (!error) {
    return fallbackMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object") {
    const maybeError = error as {
      message?: unknown;
      response?: {
        data?: {
          message?: unknown;
          error?: unknown;
        };
      };
    };

    const responseMessage = maybeError.response?.data?.message;
    if (typeof responseMessage === "string" && responseMessage.trim()) {
      return responseMessage;
    }

    const responseError = maybeError.response?.data?.error;
    if (typeof responseError === "string" && responseError.trim()) {
      return responseError;
    }

    if (typeof maybeError.message === "string" && maybeError.message.trim()) {
      return maybeError.message;
    }
  }

  return fallbackMessage;
}

function mapScheduleToSummary(
  schedule: ClassScheduleDetail,
): ClassScheduleSummary {
  return {
    scheduleId: schedule.scheduleId,
    branchName: schedule.branchName,
    scheduleLocation: schedule.scheduleLocation,
    scheduleLevel: schedule.scheduleLevel,
    scheduleShift: schedule.scheduleShift,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    weekday: schedule.weekday,
  };
}

export function StudentCreateModal({ open, onClose }: StudentCreateModalProps) {
  const today = useMemo(() => formatToday(), []);
  const [form, setForm] = useState<StudentCreateFormState>(
    createInitialForm(today),
  );
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<Set<string>>(
    () => new Set(),
  );

  const { mutateAsync: createStudent, isPending } = useCreateStudent();
  const { data: schedules, isFetching: isSchedulesFetching } =
    useGetAllClassSchedules({ scheduleStatus: "ACTIVE" }, { enabled: open });

  const branchOptions = useMemo<BranchOption[]>(() => {
    const branchMap = new Map<number, string>();

    schedules?.forEach((schedule) => {
      if (!branchMap.has(schedule.branchId)) {
        branchMap.set(schedule.branchId, schedule.branchName);
      }
    });

    return Array.from(branchMap.entries()).map(([branchId, branchName]) => ({
      branchId,
      branchName,
    }));
  }, [schedules]);

  const resolvedBranchId = useMemo(() => {
    if (branchOptions.length === 0) {
      return "";
    }

    const branchStillExists = branchOptions.some(
      (branch) => String(branch.branchId) === selectedBranchId,
    );

    if (selectedBranchId && branchStillExists) {
      return selectedBranchId;
    }

    return String(branchOptions[0].branchId);
  }, [branchOptions, selectedBranchId]);

  const selectedBranchSchedules = useMemo<ClassScheduleSummary[]>(() => {
    return (schedules ?? [])
      .filter((schedule) => String(schedule.branchId) === resolvedBranchId)
      .map(mapScheduleToSummary);
  }, [resolvedBranchId, schedules]);

  const hasBranchData = branchOptions.length > 0;
  const selectedAddCount = selectedScheduleIds.size;

  const setField = <K extends keyof StudentCreateFormState>(
    key: K,
    value: StudentCreateFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleClose = () => {
    if (isPending) {
      return;
    }

    setForm(createInitialForm(today));
    setSelectedBranchId("");
    setSelectedScheduleIds(new Set());
    onClose();
  };

  const handleSelectBranch = (value: string) => {
    setSelectedBranchId(value);
    setSelectedScheduleIds(new Set());
  };

  const handleToggleSchedule = (scheduleId: string) => {
    setSelectedScheduleIds((current) => {
      const next = new Set(current);

      if (next.has(scheduleId)) {
        next.delete(scheduleId);
      } else {
        next.add(scheduleId);
      }

      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.fullName.trim()) {
      showErrorToast("Vui lòng nhập họ và tên học viên.");
      return;
    }

    if (!form.phoneNumber.trim()) {
      showErrorToast("Vui lòng nhập số điện thoại.");
      return;
    }

    if (!/^\d{9,11}$/.test(form.phoneNumber.trim())) {
      showErrorToast("Số điện thoại không hợp lệ. Chỉ cho phép 9-11 chữ số.");
      return;
    }

    if (!form.birthDate) {
      showErrorToast("Vui lòng chọn ngày sinh.");
      return;
    }

    if (isFutureDate(form.birthDate)) {
      showErrorToast("Ngày sinh không được lớn hơn ngày hiện tại.");
      return;
    }

    if (!resolvedBranchId) {
      showErrorToast("Vui lòng chọn chi nhánh.");
      return;
    }

    if (hasBranchData && selectedScheduleIds.size === 0) {
      showErrorToast("Vui lòng chọn ít nhất một lớp học.");
      return;
    }

    try {
      const payload: StudentCreateRequest = {
        nationalCode: form.nationalCode.trim() || undefined,
        studentStatus: form.studentStatus,
        fullName: form.fullName.trim(),
        startDate: form.startDate,
        branchId: Number(resolvedBranchId),
        phoneNumber: form.phoneNumber.trim(),
        birthDate: form.birthDate,
        belt: form.belt,
        enrollmentRequest: {
          studentId: "",
          scheduleIds: Array.from(selectedScheduleIds),
          joinDate: form.startDate,
          note: form.note.trim() || undefined,
        },
      };

      await createStudent(payload);

      showSuccessToast("Tạo học viên thành công.");
      handleClose();
    } catch (error) {
      showErrorToast(
        getErrorMessage(error, "Không thể tạo học viên. Vui lòng thử lại."),
      );
    }
  };

  return (
    <ModalLayout
      open={open}
      onClose={handleClose}
      closeOnBackdrop={!isPending}
      closeOnEscape={!isPending}
      title="Thêm học viên mới"
      subtitle="Nhập thông tin cơ bản và chọn lớp học phù hợp cho học viên"
      maxWidth={1180}
    >
      <form className={styles.studentCreateModal} onSubmit={handleSubmit}>
        {isPending ? (
          <div
            className={styles.studentCreateModalLoading}
            role="status"
            aria-live="polite"
          >
            <span
              className={styles.studentCreateModalSpinner}
              aria-hidden="true"
            />
            Đang tạo hồ sơ học viên...
          </div>
        ) : null}

        <fieldset
          className={styles.studentCreateModalFieldset}
          disabled={isPending}
        >
          <section className={styles.studentCreateModalSection}>
            <div className={styles.studentCreateModalSectionHeader}>
              <h3>Thông tin học viên</h3>
              <p>Điền thông tin cơ bản để tạo hồ sơ mới.</p>
            </div>

            <div className={styles.studentCreateModalGrid}>
              <label className={styles.studentCreateModalField}>
                <span>Họ và tên *</span>
                <Input
                  type="text"
                  value={form.fullName}
                  onChange={(event) => setField("fullName", event.target.value)}
                  placeholder="Nhập họ và tên"
                />
              </label>

              <label className={styles.studentCreateModalField}>
                <span>Số điện thoại *</span>
                <Input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(event) =>
                    setField("phoneNumber", event.target.value)
                  }
                  placeholder="Ví dụ: 0912345678"
                />
              </label>

              <label className={styles.studentCreateModalField}>
                <span>Mã hội viên</span>
                <Input
                  type="text"
                  value={form.nationalCode}
                  onChange={(event) =>
                    setField("nationalCode", event.target.value)
                  }
                  placeholder="Tùy chọn"
                />
              </label>

              <label className={styles.studentCreateModalField}>
                <span>Ngày sinh *</span>
                <Input
                  type="date"
                  value={form.birthDate}
                  onChange={(event) =>
                    setField("birthDate", event.target.value)
                  }
                />
              </label>

              <label className={styles.studentCreateModalField}>
                <span>Cấp đai *</span>
                <select
                  value={form.belt}
                  onChange={(event) =>
                    setField("belt", event.target.value as Belt)
                  }
                >
                  {BELT_OPTIONS.map((belt) => (
                    <option key={belt} value={belt}>
                      {belt}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.studentCreateModalField}>
                <span>Trạng thái *</span>
                <select
                  value={form.studentStatus}
                  onChange={(event) =>
                    setField(
                      "studentStatus",
                      event.target.value as StudentStatus,
                    )
                  }
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.studentCreateModalField}>
                <div className={styles.studentCreateModalFieldLabelRow}>
                  <span>Ngày nhập học *</span>
                  <button
                    type="button"
                    className={styles.studentCreateModalQuickButton}
                    onClick={() => setField("startDate", today)}
                  >
                    Hôm nay
                  </button>
                </div>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(event) =>
                    setField("startDate", event.target.value)
                  }
                />
              </label>

              <label className={styles.studentCreateModalField}>
                <span>Chi nhánh *</span>
                <select
                  value={resolvedBranchId}
                  onChange={(event) => handleSelectBranch(event.target.value)}
                  disabled={!hasBranchData}
                >
                  {!hasBranchData ? (
                    <option value="">— Không có chi nhánh khả dụng —</option>
                  ) : (
                    <>
                      <option value="">— Chọn chi nhánh —</option>
                      {branchOptions
                        .sort((a, b) =>
                          a.branchName.localeCompare(b.branchName),
                        )
                        .map((branch) => (
                          <option key={branch.branchId} value={branch.branchId}>
                            {branch.branchName}
                          </option>
                        ))}
                    </>
                  )}
                </select>
              </label>
            </div>
          </section>

          <section className={styles.studentCreateModalSection}>
            <div className={styles.studentCreateModalSectionHeader}>
              <h3>Phân lớp</h3>
              <p>Chọn các lớp học ACTIVE để thêm vào hồ sơ học viên.</p>
            </div>

            <div className={styles.studentCreateModalClassBox}>
              <div className={styles.studentCreateModalClassBoxHead}>
                <span>Lịch học theo chi nhánh</span>
                <strong>{selectedAddCount} lớp đã chọn</strong>
              </div>

              <ClassList
                hasBranch={hasBranchData}
                isLoading={
                  isSchedulesFetching && (schedules?.length ?? 0) === 0
                }
                classList={selectedBranchSchedules}
                selectedIds={selectedScheduleIds}
                onToggle={handleToggleSchedule}
                isCompact
                variant="grid"
                gridColumns={3}
              />

              <label className={styles.studentCreateModalField}>
                <span>Ghi chú</span>
                <Textarea
                  value={form.note}
                  onChange={(event) => setField("note", event.target.value)}
                  placeholder="Ghi chú bổ sung cho hồ sơ hoặc xếp lớp"
                  rows={3}
                />
              </label>
            </div>
          </section>

          <footer className={styles.studentCreateModalActions}>
            <button
              type="button"
              className={styles.btn}
              onClick={handleClose}
              disabled={isPending}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={isPending}
            >
              {isPending ? "Đang tạo..." : "Tạo học viên"}
            </button>
          </footer>
        </fieldset>
      </form>
    </ModalLayout>
  );
}
