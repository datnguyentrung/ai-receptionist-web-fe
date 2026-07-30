import { ProfileImageField } from "@/components/common/ProfileImageField";
import { ModalLayout } from "@/components/ui/modal-layout";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import { studentAPI } from "@/features/student/api/studentAPI";
import { useGenericMutation, useGetQuery } from "@/hooks/useCrud";
import { formatDateInput, getRequestErrorMessage, isFutureDate } from "@/lib/personForm";
import type {
  StudentDetail,
  StudentListResponse,
  StudentOverview,
  StudentUpdateRequest,
} from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  StudentProfileFields,
  type StudentProfileFormState,
} from "./StudentProfileFields";
import styles from "./StudentCreateModal.module.scss";

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

function createForm(
  student: StudentOverview,
  detail?: StudentDetail,
): StudentProfileFormState {
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

function StudentUpdateForm({
  student,
  detail,
  isDetailFetching,
  onClose,
}: StudentUpdateFormProps) {
  const [form, setForm] = useState<StudentProfileFormState>(() =>
    createForm(student, detail),
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const displayedStudent = detail ?? student;
  const queryClient = useQueryClient();

  const { mutateAsync: updateStudent, isPending } = useGenericMutation<
    StudentDetail,
    { payload: StudentUpdateRequest; imageFile: File | null }
  >(
    ({ payload, imageFile: selectedImage }) =>
      studentAPI.updateStudent(displayedStudent.personId, payload, selectedImage),
    [["students"], ["student-detail", student.studentCode]],
    {
      onSuccess: (updatedStudent) => {
        queryClient.setQueryData(
          ["student-detail", student.studentCode],
          updatedStudent,
        );
        queryClient.setQueriesData<StudentListResponse>(
          { queryKey: ["students"] },
          (current) =>
            current
              ? {
                  ...current,
                  students: {
                    ...current.students,
                    content: current.students.content.map((item) =>
                      item.personId === updatedStudent.personId
                        ? {
                            ...item,
                            fullName: updatedStudent.fullName,
                            phoneNumber: updatedStudent.phoneNumber ?? item.phoneNumber,
                            birthDate: updatedStudent.birthDate,
                            belt: updatedStudent.belt,
                            avatarUrl: updatedStudent.avatarUrl,
                          }
                        : item,
                    ),
                  },
                }
              : current,
        );
      },
    },
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.fullName.trim()) {
      showErrorToast("Vui lòng nhập họ và tên học viên.");
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

    const payload: StudentUpdateRequest = {
      fullName: form.fullName.trim(),
      phoneNumber: form.phoneNumber.trim(),
      nationalCode: form.nationalCode.trim() || undefined,
      birthDate: form.birthDate,
      startDate: form.startDate || undefined,
      belt: form.belt,
      studentStatus: form.studentStatus,
      branchId: detail?.branchId,
    };

    try {
      await updateStudent({ payload, imageFile });
      showSuccessToast("Cập nhật học viên thành công.");
      onClose();
    } catch (error) {
      showErrorToast(
        getRequestErrorMessage(
          error,
          "Không thể cập nhật học viên. Vui lòng thử lại.",
        ),
      );
    }
  };

  const disabled = isPending || isDetailFetching;

  return (
    <form className={styles.studentCreateModal} onSubmit={handleSubmit}>
      {disabled ? (
        <div className={styles.studentCreateModalLoading} role="status" aria-live="polite">
          <span className={styles.studentCreateModalSpinner} aria-hidden="true" />
          {isPending ? "Đang cập nhật hồ sơ..." : "Đang tải hồ sơ..."}
        </div>
      ) : null}

      <fieldset className={styles.studentCreateModalFieldset} disabled={disabled}>
        <section className={styles.studentCreateModalSection}>
          <div className={styles.studentCreateModalSectionHeader}>
            <h3>Thông tin học viên</h3>
            <p>Cập nhật thông tin cơ bản, cấp đai và trạng thái học.</p>
          </div>
          <ProfileImageField
            value={imageFile}
            currentAvatarUrl={displayedStudent.avatarUrl}
            disabled={disabled}
            onChange={setImageFile}
            onInvalidFile={showErrorToast}
          />
          <StudentProfileFields
            form={form}
            disabled={disabled}
            onFormChange={setForm}
          />
        </section>
      </fieldset>

      <div className={styles.studentUpdateModalActions}>
        <button type="button" className={styles.btn} onClick={onClose} disabled={isPending}>
          Hủy
        </button>
        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={disabled}>
          {isPending ? "Đang cập nhật..." : "Cập nhật"}
        </button>
      </div>
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
      title="Cập nhật học viên"
      subtitle={student ? `${student.fullName} · ${student.studentCode}` : undefined}
      maxWidth={760}
      overlayClassName={styles.noBlurOverlay}
      dialogClassName={styles.studentUpdateDialog}
      surfaceClassName={styles.studentUpdateSurface}
      bodyClassName={styles.studentUpdateBody}
    >
      {student ? (
        <StudentUpdateForm
          key={`${student.studentCode}-${detail?.personId ?? "overview"}`}
          student={student}
          detail={detail}
          isDetailFetching={isDetailFetching}
          onClose={onClose}
        />
      ) : null}
    </ModalLayout>
  );
}
