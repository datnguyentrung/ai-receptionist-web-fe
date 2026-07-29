import { ProfileImageField } from "@/components/common/ProfileImageField";
import { ModalLayout } from "@/components/ui/modal-layout";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import {
  COACH_ROLE_CODE_ORDER,
  ROLE_CODE_LABELS,
  type CoachRoleCode,
} from "@/config/constants";
import { coachAPI } from "@/features/coach/api/coachAPI";
import { CoachCoreFields } from "@/features/coach/components/CoachCoreFields";
import { ClassAssignmentModal } from "@/features/studentEnrollment/components/ClassAssignmentModal";
import { useGenericMutation } from "@/hooks/useCrud";
import { getRequestErrorMessage, isFutureDate } from "@/lib/personForm";
import type {
  CoachAssignmentCreateRequest,
  CoachCreateRequest,
  CoachDetail,
} from "@/types";
import { useCallback, useState } from "react";
import "../CoachForm/CoachForm.scss";

type CoachCreateModalProps = {
  open: boolean;
  onClose: () => void;
};

const createInitialForm = (): CoachCreateRequest => ({
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
});

export function CoachCreateModal({ open, onClose }: CoachCreateModalProps) {
  const { mutateAsync: createCoach, isPending } = useGenericMutation<
    CoachDetail,
    { payload: CoachCreateRequest; imageFile: File | null }
  >(
    ({ payload, imageFile }) => coachAPI.createCoach(payload, imageFile),
    [["coaches"]],
  );
  const [form, setForm] = useState<CoachCreateRequest>(createInitialForm);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const setField = <K extends keyof CoachCreateRequest>(
    key: K,
    value: CoachCreateRequest[K],
  ) => setForm((previous) => ({ ...previous, [key]: value }));

  const handleAssignmentChange = useCallback(
    (next: CoachAssignmentCreateRequest) => setField("assignmentRequest", next),
    [],
  );

  const resetForm = () => {
    setForm(createInitialForm());
    setImageFile(null);
  };

  const handleClose = () => {
    if (isPending) {
      return;
    }
    resetForm();
    onClose();
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
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      showErrorToast("Vui lòng nhập email đúng định dạng.");
      return;
    }
    if (form.assignmentRequest.scheduleIds.length === 0) {
      showErrorToast("Vui lòng chọn ít nhất một lớp dạy cho huấn luyện viên.");
      return;
    }
    if (!form.assignmentRequest.assignmentDate || !form.assignmentRequest.endDate) {
      showErrorToast("Vui lòng chọn ngày phân công và ngày kết thúc.");
      return;
    }
    if (form.assignmentRequest.endDate < form.assignmentRequest.assignmentDate) {
      showErrorToast("Ngày kết thúc không được nhỏ hơn ngày phân công.");
      return;
    }

    const payload: CoachCreateRequest = {
      ...form,
      fullName: form.fullName.trim(),
      phoneNumber: form.phoneNumber.trim(),
      email: form.email.trim(),
      assignmentRequest: {
        ...form.assignmentRequest,
        note: form.assignmentRequest.note?.trim() || undefined,
      },
    };

    try {
      await createCoach({ payload, imageFile });
      showSuccessToast("Tạo huấn luyện viên thành công.");
      resetForm();
      onClose();
    } catch (error) {
      showErrorToast(
        getRequestErrorMessage(
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
      overlayClassName="coach-create-modal__overlay"
      dialogClassName="coach-create-modal__dialog"
      surfaceClassName="coach-create-modal__surface"
      bodyClassName="coach-create-modal__body"
    >
      <form className="coach-create-modal" onSubmit={handleSubmit}>
        {isPending ? (
          <div className="coach-create-modal__loading" role="status" aria-live="polite">
            <span className="coach-create-modal__spinner" aria-hidden="true" />
            Đang gửi dữ liệu tạo huấn luyện viên...
          </div>
        ) : null}

        <fieldset className="coach-create-modal__fieldset" disabled={isPending}>
          <ProfileImageField
            value={imageFile}
            disabled={isPending}
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
              disabled={isPending}
              onFullNameChange={(value) => setField("fullName", value)}
              onPhoneNumberChange={(value) => setField("phoneNumber", value)}
              onBirthDateChange={(value) => setField("birthDate", value)}
              onBeltChange={(value) => setField("belt", value)}
              onCoachStatusChange={(value) => setField("coachStatus", value)}
            />
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
              <span>Vai trò *</span>
              <select
                value={form.roleCode}
                onChange={(event) => setField("roleCode", event.target.value as CoachRoleCode)}
              >
                {[...COACH_ROLE_CODE_ORDER, "DEVELOPER"].map((roleCode) => (
                  <option key={roleCode} value={roleCode}>
                    {ROLE_CODE_LABELS[roleCode]}
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
            onAssignmentChange={handleAssignmentChange}
            disabled={isPending}
          />
        </div>

        <div className="coach-create-modal__actions">
          <button type="button" className="btn btn--ghost" onClick={handleClose}>
            Hủy
          </button>
          <button type="submit" className="btn btn--primary" disabled={isPending}>
            {isPending ? "Đang tạo..." : "Tạo huấn luyện viên"}
          </button>
        </div>
      </form>
    </ModalLayout>
  );
}
