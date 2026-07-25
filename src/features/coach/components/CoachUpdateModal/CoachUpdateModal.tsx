import { Input } from "@/components/ui/input";
import { ModalLayout } from "@/components/ui/modal-layout";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import type { Belt, CoachStatus } from "@/config/constants";
import { coachAPI } from "@/features/coach/api/coachAPI";
import { useGenericMutation, useGetQuery } from "@/hooks/useCrud";
import type { CoachDetail, CoachUpdateRequest } from "@/types";
import { useState } from "react";
import {
  COACH_BELT_OPTIONS,
  COACH_STATUS_OPTIONS,
  formatDateInput,
  getRequestErrorMessage,
  isFutureDate,
} from "../../utils/coachForm";
import "../CoachCreateModal/CoachCreateModal.scss";

type CoachUpdateModalProps = {
  open: boolean;
  coach: CoachDetail | null;
  onClose: () => void;
};

type CoachUpdateFormState = {
  fullName: string;
  phoneNumber: string;
  nationalCode: string;
  birthDate: string;
  belt: Belt;
  coachStatus: CoachStatus;
};

function createForm(coach: CoachDetail, detail?: CoachDetail): CoachUpdateFormState {
  return {
    fullName: detail?.fullName ?? coach.fullName,
    phoneNumber: detail?.phoneNumber ?? coach.phoneNumber ?? "",
    nationalCode: detail?.nationalCode ?? coach.nationalCode ?? "",
    birthDate: formatDateInput(detail?.birthDate ?? coach.birthDate),
    belt: detail?.belt ?? coach.belt,
    coachStatus: detail?.coachStatus ?? coach.coachStatus,
  };
}

function getRoleDisplay(coach: CoachDetail) {
  const roles = coach.roles ?? (coach.role ? [coach.role] : []);
  return roles.map((role) => role.replace(/^ROLE_/, "")).join(", ") || "Chưa xác định";
}

type CoachUpdateFormProps = {
  coach: CoachDetail;
  detail?: CoachDetail;
  isDetailFetching: boolean;
  onClose: () => void;
};

function CoachUpdateForm({
  coach,
  detail,
  isDetailFetching,
  onClose,
}: CoachUpdateFormProps) {
  const [form, setForm] = useState<CoachUpdateFormState>(() =>
    createForm(coach, detail),
  );
  const displayedCoach = detail ?? coach;
  const { mutateAsync: updateCoach, isPending } = useGenericMutation<
    CoachDetail,
    CoachUpdateRequest
  >(
    (payload) => coachAPI.updateCoach(coach.staffCode, payload),
    [["coaches"], ["coach-detail", coach.staffCode]],
  );

  const setField = <K extends keyof CoachUpdateFormState>(
    key: K,
    value: CoachUpdateFormState[K],
  ) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const handleClose = () => {
    if (!isPending) onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.fullName.trim()) {
      showErrorToast("Vui lòng nhập họ và tên HLV.");
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

    try {
      await updateCoach({
        userId: displayedCoach.userId,
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        nationalCode: form.nationalCode.trim() || undefined,
        birthDate: form.birthDate,
        belt: form.belt,
        coachStatus: form.coachStatus,
      });
      showSuccessToast("Cập nhật huấn luyện viên thành công.");
      onClose();
    } catch (error) {
      showErrorToast(
        getRequestErrorMessage(
          error,
          "Không thể cập nhật huấn luyện viên. Vui lòng thử lại.",
        ),
      );
    }
  };

  return (
    <form className="coach-create-modal" onSubmit={handleSubmit}>
      {isPending || isDetailFetching ? (
        <div className="coach-create-modal__loading" role="status" aria-live="polite">
          <span className="coach-create-modal__spinner" aria-hidden="true" />
          {isPending ? "Đang cập nhật huấn luyện viên..." : "Đang tải thông tin huấn luyện viên..."}
        </div>
      ) : null}

      <fieldset
        className="coach-create-modal__fieldset"
        disabled={isPending || isDetailFetching}
      >
        <div className="coach-create-modal__grid">
          <label className="coach-create-modal__field">
            <span>Họ và tên *</span>
            <Input
              type="text"
              value={form.fullName}
              onChange={(event) => setField("fullName", event.target.value)}
            />
          </label>
          <label className="coach-create-modal__field">
            <span>Số điện thoại *</span>
            <Input
              type="tel"
              value={form.phoneNumber}
              onChange={(event) => setField("phoneNumber", event.target.value)}
            />
          </label>
          <label className="coach-create-modal__field">
            <span>CCCD</span>
            <Input
              type="text"
              value={form.nationalCode}
              onChange={(event) => setField("nationalCode", event.target.value)}
            />
          </label>
          <label className="coach-create-modal__field">
            <span>Ngày sinh *</span>
            <Input
              type="date"
              value={form.birthDate}
              onChange={(event) => setField("birthDate", event.target.value)}
            />
          </label>
          <label className="coach-create-modal__field">
            <span>Đai *</span>
            <select
              value={form.belt}
              onChange={(event) => setField("belt", event.target.value as Belt)}
            >
              {COACH_BELT_OPTIONS.map((belt) => (
                <option key={belt} value={belt}>
                  {belt}
                </option>
              ))}
            </select>
          </label>
          <label className="coach-create-modal__field">
            <span>Trạng thái công việc</span>
            <select
              value={form.coachStatus}
              onChange={(event) =>
                setField("coachStatus", event.target.value as CoachStatus)
              }
            >
              {COACH_STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
          <label className="coach-create-modal__field">
            <span>Email</span>
            <Input type="email" value={displayedCoach.email ?? ""} readOnly />
          </label>
          <label className="coach-create-modal__field">
            <span>Vai trò</span>
            <Input type="text" value={getRoleDisplay(displayedCoach)} readOnly />
          </label>
        </div>

        <div className="coach-create-modal__actions">
          <button type="button" className="btn btn--ghost" onClick={handleClose}>
            Hủy
          </button>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={isPending || isDetailFetching}
          >
            {isPending ? "Đang cập nhật..." : "Lưu cập nhật"}
          </button>
        </div>
      </fieldset>
    </form>
  );
}

export function CoachUpdateModal({
  open,
  coach,
  onClose,
}: CoachUpdateModalProps) {
  const { data: detail, isFetching: isDetailFetching } = useGetQuery(
    ["coach-detail", coach?.staffCode],
    () => coachAPI.getCoachByStaffCode(coach?.staffCode ?? ""),
    { enabled: open && Boolean(coach?.staffCode) },
  );

  return (
    <ModalLayout
      open={open}
      onClose={onClose}
      closeOnBackdrop={!isDetailFetching}
      closeOnEscape={!isDetailFetching}
      title="Cập nhật huấn luyện viên"
      subtitle={coach ? `${coach.fullName} · ${coach.staffCode}` : undefined}
      maxWidth={760}
      overlayClassName="coach-create-modal__overlay"
      dialogClassName="coach-create-modal__dialog"
      surfaceClassName="coach-create-modal__surface"
      bodyClassName="coach-create-modal__body"
    >
      {coach ? (
        <CoachUpdateForm
          key={`${coach.staffCode}-${detail?.userId ?? "overview"}`}
          coach={coach}
          detail={detail}
          isDetailFetching={isDetailFetching}
          onClose={onClose}
        />
      ) : null}
    </ModalLayout>
  );
}
