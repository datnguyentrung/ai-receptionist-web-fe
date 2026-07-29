import { ProfileImageField } from "@/components/common/ProfileImageField";
import { Input } from "@/components/ui/input";
import { ModalLayout } from "@/components/ui/modal-layout";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import type { Belt, CoachStatus } from "@/config/constants";
import { coachAPI } from "@/features/coach/api/coachAPI";
import { CoachCoreFields } from "@/features/coach/components/CoachCoreFields";
import { useGenericMutation, useGetQuery } from "@/hooks/useCrud";
import { formatDateInput, getRequestErrorMessage, isFutureDate } from "@/lib/personForm";
import type { CoachDetail, CoachUpdateRequest } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import "../CoachForm/CoachForm.scss";

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

type CoachUpdateFormProps = {
  coach: CoachDetail;
  detail?: CoachDetail;
  isDetailFetching: boolean;
  onClose: () => void;
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

function CoachUpdateForm({
  coach,
  detail,
  isDetailFetching,
  onClose,
}: CoachUpdateFormProps) {
  const [form, setForm] = useState<CoachUpdateFormState>(() => createForm(coach, detail));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const displayedCoach = detail ?? coach;
  const queryClient = useQueryClient();
  const { mutateAsync: updateCoach, isPending } = useGenericMutation<
    CoachDetail,
    { payload: CoachUpdateRequest; imageFile: File | null }
  >(
    ({ payload, imageFile: selectedImage }) =>
      coachAPI.updateCoach(displayedCoach.personId, payload, selectedImage),
    [["coaches"], ["coach-detail", coach.staffCode]],
    {
      onSuccess: (updatedCoach) => {
        queryClient.setQueryData(
          ["coach-detail", coach.staffCode],
          updatedCoach,
        );
        queryClient.setQueryData<CoachDetail[]>(["coaches"], (current) =>
          current?.map((item) =>
            item.personId === updatedCoach.personId
              ? { ...item, ...updatedCoach }
              : item,
          ),
        );
      },
    },
  );

  const setField = <K extends keyof CoachUpdateFormState>(
    key: K,
    value: CoachUpdateFormState[K],
  ) => setForm((previous) => ({ ...previous, [key]: value }));

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

    const payload: CoachUpdateRequest = {
      fullName: form.fullName.trim(),
      phoneNumber: form.phoneNumber.trim(),
      nationalCode: form.nationalCode.trim() || undefined,
      birthDate: form.birthDate,
      belt: form.belt,
      coachStatus: form.coachStatus,
    };

    try {
      await updateCoach({ payload, imageFile });
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

  const disabled = isPending || isDetailFetching;

  return (
    <form className="coach-create-modal" onSubmit={handleSubmit}>
      {disabled ? (
        <div className="coach-create-modal__loading" role="status" aria-live="polite">
          <span className="coach-create-modal__spinner" aria-hidden="true" />
          {isPending ? "Đang cập nhật huấn luyện viên..." : "Đang tải thông tin huấn luyện viên..."}
        </div>
      ) : null}

      <fieldset className="coach-create-modal__fieldset" disabled={disabled}>
        <ProfileImageField
          value={imageFile}
          currentAvatarUrl={displayedCoach.avatarUrl}
          disabled={disabled}
          onChange={setImageFile}
          onInvalidFile={showErrorToast}
        />
        <div className="coach-create-modal__grid">
          <CoachCoreFields
            fullName={form.fullName}
            phoneNumber={form.phoneNumber}
            birthDate={form.birthDate}
            belt={form.belt}
            coachStatus={form.coachStatus}
            disabled={disabled}
            onFullNameChange={(value) => setField("fullName", value)}
            onPhoneNumberChange={(value) => setField("phoneNumber", value)}
            onBirthDateChange={(value) => setField("birthDate", value)}
            onBeltChange={(value) => setField("belt", value)}
            onCoachStatusChange={(value) => setField("coachStatus", value)}
          />
          <label className="coach-create-modal__field">
            <span>CCCD</span>
            <Input
              type="text"
              value={form.nationalCode}
              onChange={(event) => setField("nationalCode", event.target.value)}
            />
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
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={isPending}>
            Hủy
          </button>
          <button type="submit" className="btn btn--primary" disabled={disabled}>
            {isPending ? "Đang cập nhật..." : "Lưu cập nhật"}
          </button>
        </div>
      </fieldset>
    </form>
  );
}

export function CoachUpdateModal({ open, coach, onClose }: CoachUpdateModalProps) {
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
          key={`${coach.staffCode}-${detail?.personId ?? "overview"}`}
          coach={coach}
          detail={detail}
          isDetailFetching={isDetailFetching}
          onClose={onClose}
        />
      ) : null}
    </ModalLayout>
  );
}
