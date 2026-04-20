import { ModalLayout } from "@/components/ui/modal-layout";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import {
  COACH_ROLE_CODE_LABELS,
  COACH_ROLE_CODE_ORDER,
  type Belt,
  type CoachRoleCode,
  type CoachStatus,
} from "@/config/constants";
import { ClassAssignmentModal } from "@/features/studentEnrollment/components/ClassAssignmentModal";
import type { CoachAssignmentCreateRequest, CoachCreateRequest } from "@/types";
import { useState } from "react";

import { useCreateCoach } from "../../api/useCoach";
import "./CoachCreateModal.scss";

type CoachCreateModalProps = {
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

const STATUS_OPTIONS: Array<{ value: CoachStatus; label: string }> = [
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "INACTIVE", label: "Tạm nghỉ" },
  { value: "SUSPENDED", label: "Đình chỉ" },
  { value: "RETIRED", label: "Đã nghỉ hưu" },
];

const INITIAL_FORM: CoachCreateRequest = {
  coachStatus: "ACTIVE",
  fullName: "",
  phoneNumber: "",
  birthDate: "",
  belt: "C10",
  roleCode: "COACH_TRAINEE",
  email: "",
  assignmentRequest: {
    coachId: "",
    scheduleIds: [],
    assignmentDate: "",
    endDate: "",
    note: "",
  },
};

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

export function CoachCreateModal({ open, onClose }: CoachCreateModalProps) {
  const { mutateAsync: createCoach, isPending } = useCreateCoach();
  const [form, setForm] = useState<CoachCreateRequest>(INITIAL_FORM);

  const setField = <K extends keyof CoachCreateRequest>(
    key: K,
    value: CoachCreateRequest[K],
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
      showErrorToast("Vui lòng nhập họ và tên HLV.");
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

    if (!form.email.trim()) {
      showErrorToast("Vui lòng nhập email.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      showErrorToast("Email không đúng định dạng.");
      return;
    }

    if (form.assignmentRequest.scheduleIds.length === 0) {
      showErrorToast("Vui lòng chọn ít nhất một lớp dạy cho huấn luyện viên.");
      return;
    }

    if (!form.assignmentRequest.assignmentDate) {
      showErrorToast("Vui lòng chọn ngày phân công dạy.");
      return;
    }

    if (!form.assignmentRequest.endDate) {
      showErrorToast("Vui lòng chọn ngày kết thúc phân công.");
      return;
    }

    if (
      form.assignmentRequest.endDate < form.assignmentRequest.assignmentDate
    ) {
      showErrorToast("Ngày kết thúc không được nhỏ hơn ngày phân công.");
      return;
    }

    try {
      await createCoach({
        ...form,
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        email: form.email.trim(),
        assignmentRequest: {
          ...form.assignmentRequest,
          note: form.assignmentRequest.note?.trim() || undefined,
        },
      });

      showSuccessToast("Tạo huấn luyện viên thành công.");
      setForm(INITIAL_FORM);
      onClose();
    } catch (error) {
      showErrorToast(
        getErrorMessage(
          error,
          "Không thể tạo huấn luyện viên. Vui lòng thử lại.",
        ),
      );
    }
  };

  return (
    <ModalLayout
      open={open}
      onClose={handleClose}
      closeOnBackdrop={!isPending}
      closeOnEscape={!isPending}
      title="Thêm huấn luyện viên mới"
      subtitle="Nhập thông tin cơ bản để tạo hồ sơ HLV"
      maxWidth={860}
    >
      <form className="coach-create-modal" onSubmit={handleSubmit}>
        {isPending ? (
          <div
            className="coach-create-modal__loading"
            role="status"
            aria-live="polite"
          >
            <span className="coach-create-modal__spinner" aria-hidden="true" />
            Đang gửi dữ liệu tạo huấn luyện viên...
          </div>
        ) : null}

        <fieldset className="coach-create-modal__fieldset" disabled={isPending}>
          <div className="coach-create-modal__grid">
            <label className="coach-create-modal__field">
              <span>Họ và tên *</span>
              <input
                type="text"
                value={form.fullName}
                onChange={(event) => setField("fullName", event.target.value)}
                placeholder="Nguyễn Văn A"
              />
            </label>

            <label className="coach-create-modal__field">
              <span>Số điện thoại *</span>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(event) =>
                  setField("phoneNumber", event.target.value)
                }
                placeholder="0987654321"
              />
            </label>

            <label className="coach-create-modal__field">
              <span>Email *</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
                placeholder="coach@example.com"
              />
            </label>

            <label className="coach-create-modal__field">
              <span>Ngày sinh *</span>
              <input
                type="date"
                value={form.birthDate}
                onChange={(event) => setField("birthDate", event.target.value)}
              />
            </label>

            <label className="coach-create-modal__field">
              <span>Đai *</span>
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

            <label className="coach-create-modal__field">
              <span>Vai trò *</span>
              <select
                value={form.roleCode}
                onChange={(event) =>
                  setField("roleCode", event.target.value as CoachRoleCode)
                }
              >
                {COACH_ROLE_CODE_ORDER.map((roleCode) => (
                  <option key={roleCode} value={roleCode}>
                    {COACH_ROLE_CODE_LABELS[roleCode]}
                  </option>
                ))}
              </select>
            </label>

            <label className="coach-create-modal__field coach-create-modal__field--full">
              <span>Trạng thái công việc</span>
              <select
                value={form.coachStatus ?? "ACTIVE"}
                onChange={(event) =>
                  setField("coachStatus", event.target.value as CoachStatus)
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
        </fieldset>

        <div className="coach-create-modal__assignmentWrap">
          <div className="coach-create-modal__assignmentHead">
            <h3>Phân lớp dạy</h3>
            <p>Chọn các lớp ACTIVE để phân công dạy ngay sau khi tạo HLV</p>
          </div>
          <ClassAssignmentModal
            mode="coach-inline"
            assignmentRequest={form.assignmentRequest}
            onAssignmentChange={(next: CoachAssignmentCreateRequest) =>
              setField("assignmentRequest", next)
            }
            disabled={isPending}
          />
        </div>

        <div className="coach-create-modal__actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={handleClose}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={isPending}
          >
            {isPending ? "Đang tạo..." : "Tạo huấn luyện viên"}
          </button>
        </div>
      </form>
    </ModalLayout>
  );
}
