import { Input } from "@/components/ui/input";
import { ModalLayout } from "@/components/ui/modal-layout";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import type { Belt, StudentStatus } from "@/config/constants";
import { studentAPI } from "@/features/student/api/studentAPI";
import { useGenericMutation, useGetQuery } from "@/hooks/useCrud";
import type {
  StudentDetail,
  StudentOverview,
  StudentUpdateRequest,
} from "@/types";
import { useState } from "react";
import styles from "./StudentCreateModal.module.scss";

type StudentUpdateFormState = {
  fullName: string;
  phoneNumber: string;
  nationalCode: string;
  birthDate: string;
  startDate: string;
  belt: Belt;
  studentStatus: StudentStatus;
};

type StudentUpdateModalProps = {
  open: boolean;
  student: StudentOverview | null;
  onClose: () => void;
};

type StudentUpdateFormProps = {
  student: StudentOverview;
  detail?: StudentDetail;
  isDetailFetching: boolean;
  onClose: () => void;
};

const text = {
  active: "Đang học",
  reserved: "Bảo lưu",
  dropped: "Nghỉ học",
  enterFullName: "Vui lòng nhập họ và tên học viên.",
  invalidPhone:
    "Số điện thoại không hợp lệ. Chỉ cho phép 9-11 chữ số.",
  chooseBirthDate: "Vui lòng chọn ngày sinh.",
  futureBirthDate:
    "Ngày sinh không được lớn hơn ngày hiện tại.",
  success: "Cập nhật học viên thành công.",
  error:
    "Không thể cập nhật học viên. Vui lòng thử lại.",
  title: "Cập nhật học viên",
  updating: "Đang cập nhật hồ sơ...",
  loading: "Đang tải hồ sơ...",
  sectionTitle: "Thông tin học viên",
  sectionDescription:
    "Cập nhật thông tin cơ bản, cấp đai và trạng thái học.",
  fullName: "Họ và tên *",
  phoneNumber: "Số điện thoại *",
  nationalCode: "Mã hội viên",
  birthDate: "Ngày sinh *",
  startDate: "Ngày nhập học",
  belt: "Cấp đai *",
  status: "Trạng thái *",
  cancel: "Hủy",
  submit: "Cập nhật",
  submitting: "Đang cập nhật...",
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
  { value: "ACTIVE", label: text.active },
  { value: "RESERVED", label: text.reserved },
  { value: "DROPPED", label: text.dropped },
];

function formatDateInput(value?: string | Date | null) {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
}

function createForm(
  student: StudentOverview,
  detail?: StudentDetail,
): StudentUpdateFormState {
  return {
    fullName: detail?.fullName ?? student.fullName,
    phoneNumber: detail?.phoneNumber ?? student.phoneNumber,
    nationalCode: detail?.nationalCode ?? student.nationalCode ?? "",
    birthDate: formatDateInput(detail?.birthDate ?? student.birthDate),
    startDate: formatDateInput(detail?.startDate),
    belt: detail?.belt ?? student.belt,
    studentStatus: detail?.studentStatus ?? student.studentStatus,
  };
}

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

function StudentUpdateForm({
  student,
  detail,
  isDetailFetching,
  onClose,
}: StudentUpdateFormProps) {
  const [form, setForm] = useState<StudentUpdateFormState>(() =>
    createForm(student, detail),
  );

  const { mutateAsync: updateStudent, isPending } = useGenericMutation<
    StudentDetail,
    StudentUpdateRequest
  >(
    (payload) => studentAPI.updateStudent(student.studentCode, payload),
    [["students"], ["student-detail", student.studentCode]],
  );

  const setField = <K extends keyof StudentUpdateFormState>(
    key: K,
    value: StudentUpdateFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleClose = () => {
    if (isPending) {
      return;
    }

    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.fullName.trim()) {
      showErrorToast(text.enterFullName);
      return;
    }

    if (!/^\d{9,11}$/.test(form.phoneNumber.trim())) {
      showErrorToast(text.invalidPhone);
      return;
    }

    if (!form.birthDate) {
      showErrorToast(text.chooseBirthDate);
      return;
    }

    if (isFutureDate(form.birthDate)) {
      showErrorToast(text.futureBirthDate);
      return;
    }

    try {
      const payload: StudentUpdateRequest = {
        userId: detail?.userId ?? student.studentCode,
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        nationalCode: form.nationalCode.trim() || undefined,
        birthDate: form.birthDate,
        startDate: form.startDate || undefined,
        belt: form.belt,
        studentStatus: form.studentStatus,
        branchId: detail?.branchId,
      };

      await updateStudent(payload);
      showSuccessToast(text.success);
      handleClose();
    } catch (error) {
      showErrorToast(getErrorMessage(error, text.error));
    }
  };

  return (
    <form className={styles.studentCreateModal} onSubmit={handleSubmit}>
      {isPending || isDetailFetching ? (
        <div
          className={styles.studentCreateModalLoading}
          role="status"
          aria-live="polite"
        >
          <span className={styles.studentCreateModalSpinner} aria-hidden="true" />
          {isPending ? text.updating : text.loading}
        </div>
      ) : null}

      <fieldset
        className={styles.studentCreateModalFieldset}
        disabled={isPending || isDetailFetching}
      >
        <section className={styles.studentCreateModalSection}>
          <div className={styles.studentCreateModalSectionHeader}>
            <h3>{text.sectionTitle}</h3>
            <p>{text.sectionDescription}</p>
          </div>

          <div className={styles.studentCreateModalGrid}>
            <label className={styles.studentCreateModalField}>
              <span>{text.fullName}</span>
              <Input
                type="text"
                value={form.fullName}
                onChange={(event) => setField("fullName", event.target.value)}
              />
            </label>

            <label className={styles.studentCreateModalField}>
              <span>{text.phoneNumber}</span>
              <Input
                type="tel"
                value={form.phoneNumber}
                onChange={(event) => setField("phoneNumber", event.target.value)}
              />
            </label>

            <label className={styles.studentCreateModalField}>
              <span>{text.nationalCode}</span>
              <Input
                type="text"
                value={form.nationalCode}
                onChange={(event) =>
                  setField("nationalCode", event.target.value)
                }
              />
            </label>

            <label className={styles.studentCreateModalField}>
              <span>{text.birthDate}</span>
              <Input
                type="date"
                value={form.birthDate}
                onChange={(event) => setField("birthDate", event.target.value)}
              />
            </label>

            <label className={styles.studentCreateModalField}>
              <span>{text.startDate}</span>
              <Input
                type="date"
                value={form.startDate}
                onChange={(event) => setField("startDate", event.target.value)}
              />
            </label>

            <label className={styles.studentCreateModalField}>
              <span>{text.belt}</span>
              <select
                value={form.belt}
                onChange={(event) => setField("belt", event.target.value as Belt)}
              >
                {BELT_OPTIONS.map((belt) => (
                  <option key={belt} value={belt}>
                    {belt}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.studentCreateModalField}>
              <span>{text.status}</span>
              <select
                value={form.studentStatus}
                onChange={(event) =>
                  setField("studentStatus", event.target.value as StudentStatus)
                }
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
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
            {text.cancel}
          </button>
          <button
            type="submit"
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={isPending || isDetailFetching}
          >
            {isPending ? text.submitting : text.submit}
          </button>
        </footer>
      </fieldset>
    </form>
  );
}

export function StudentUpdateModal({
  open,
  student,
  onClose,
}: StudentUpdateModalProps) {
  const { data: detail, isFetching: isDetailFetching } = useGetQuery(
    ["student-detail", student?.studentCode],
    () => studentAPI.getStudentByStudentCode(student?.studentCode ?? ""),
    { enabled: open && Boolean(student?.studentCode) },
  );

  return (
    <ModalLayout
      open={open}
      onClose={onClose}
      closeOnBackdrop={!isDetailFetching}
      closeOnEscape={!isDetailFetching}
      title={text.title}
      subtitle={student ? `${student.fullName} · ${student.studentCode}` : undefined}
      maxWidth={760}
      overlayClassName={styles.noBlurOverlay}
    >
      {student ? (
        <StudentUpdateForm
          key={`${student.studentCode}-${detail?.userId ?? "overview"}`}
          student={student}
          detail={detail}
          isDetailFetching={isDetailFetching}
          onClose={onClose}
        />
      ) : null}
    </ModalLayout>
  );
}
