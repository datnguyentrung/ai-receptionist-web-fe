import { ProfileImageField } from "@/components/common/ProfileImageField";
import { ModalLayout } from "@/components/ui/modal-layout";
import { Textarea } from "@/components/ui/textarea";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import { classScheduleAPI } from "@/features/classSchedule/api/classScheduleAPI";
import { studentAPI } from "@/features/student/api/studentAPI";
import ClassList from "@/features/studentEnrollment/components/ClassList/ClassList";
import { useGenericMutation, useGetQuery } from "@/hooks/useCrud";
import { getRequestErrorMessage, isFutureDate } from "@/lib/personForm";
import type {
  ClassScheduleDetail,
  ClassScheduleSummary,
  StudentCreateRequest,
  StudentDetail,
} from "@/types";
import { useCallback, useMemo, useState } from "react";
import {
  StudentProfileFields,
  type StudentProfileFormState,
} from "./StudentProfileFields";
import styles from "./StudentCreateModal.module.scss";

type BranchOption = {
  branchId: number;
  branchName: string;
};

type StudentCreateModalProps = {
  open: boolean;
  onClose: () => void;
};

const formatToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createInitialForm = (today: string): StudentProfileFormState => ({
  fullName: "",
  phoneNumber: "",
  nationalCode: "",
  birthDate: "",
  startDate: today,
  belt: "C10",
  studentStatus: "ACTIVE",
});

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
  const [form, setForm] = useState<StudentProfileFormState>(() =>
    createInitialForm(today),
  );
  const [note, setNote] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<Set<string>>(
    () => new Set(),
  );

  const { mutateAsync: createStudent, isPending } = useGenericMutation<
    StudentDetail,
    { payload: StudentCreateRequest; imageFile: File | null }
  >(
    ({ payload, imageFile: selectedImage }) =>
      studentAPI.createStudent(payload, selectedImage),
    [["students"]],
  );

  const { data: schedules, isFetching: isSchedulesFetching } = useGetQuery(
    ["class-schedules", { scheduleStatus: "ACTIVE" }],
    () => classScheduleAPI.getAllClassSchedules({ scheduleStatus: "ACTIVE" }),
    { enabled: open },
  );

  const branchOptions = useMemo<BranchOption[]>(() => {
    const branchMap = new Map<number, string>();
    schedules?.forEach((schedule) => {
      if (!branchMap.has(schedule.branchId)) {
        branchMap.set(schedule.branchId, schedule.branchName);
      }
    });

    return Array.from(branchMap.entries())
      .map(([branchId, branchName]) => ({ branchId, branchName }))
      .sort((a, b) => a.branchId - b.branchId);
  }, [schedules]);

  const resolvedBranchId = useMemo(() => {
    if (branchOptions.length === 0) {
      return "";
    }

    const branchStillExists = branchOptions.some(
      (branch) => String(branch.branchId) === selectedBranchId,
    );
    return selectedBranchId && branchStillExists
      ? selectedBranchId
      : String(branchOptions[0].branchId);
  }, [branchOptions, selectedBranchId]);

  const selectedBranchSchedules = useMemo<ClassScheduleSummary[]>(
    () =>
      (schedules ?? [])
        .filter((schedule) => String(schedule.branchId) === resolvedBranchId)
        .map(mapScheduleToSummary),
    [resolvedBranchId, schedules],
  );

  const hasBranchData = branchOptions.length > 0;

  const resetForm = () => {
    setForm(createInitialForm(today));
    setNote("");
    setImageFile(null);
    setSelectedBranchId("");
    setSelectedScheduleIds(new Set());
  };

  const handleClose = () => {
    if (isPending) {
      return;
    }

    resetForm();
    onClose();
  };

  const handleToggleSchedule = useCallback((scheduleId: string) => {
    setSelectedScheduleIds((current) => {
      const next = new Set(current);
      if (next.has(scheduleId)) {
        next.delete(scheduleId);
      } else {
        next.add(scheduleId);
      }
      return next;
    });
  }, []);

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
    if (!resolvedBranchId) {
      showErrorToast("Vui lòng chọn chi nhánh.");
      return;
    }
    if (hasBranchData && selectedScheduleIds.size === 0) {
      showErrorToast("Vui lòng chọn ít nhất một lớp học.");
      return;
    }

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
        studentCode: "",
        scheduleIds: Array.from(selectedScheduleIds),
        joinDate: form.startDate,
        note: note.trim() || undefined,
      },
    };

    try {
      await createStudent({ payload, imageFile });
      showSuccessToast("Tạo học viên thành công.");
      resetForm();
      onClose();
    } catch (error) {
      showErrorToast(
        getRequestErrorMessage(
          error,
          "Không thể tạo học viên. Vui lòng thử lại.",
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
      title="Thêm học viên mới"
      subtitle="Nhập thông tin cơ bản và chọn lớp học phù hợp cho học viên"
      maxWidth={1180}
      overlayClassName={styles.noBlurOverlay}
    >
      <form className={styles.studentCreateModal} onSubmit={handleSubmit}>
        {isPending ? (
          <div className={styles.studentCreateModalLoading} role="status" aria-live="polite">
            <span className={styles.studentCreateModalSpinner} aria-hidden="true" />
            Đang tạo hồ sơ học viên...
          </div>
        ) : null}

        <fieldset className={styles.studentCreateModalFieldset} disabled={isPending}>
          <section className={styles.studentCreateModalSection}>
            <div className={styles.studentCreateModalSectionHeader}>
              <h3>Thông tin học viên</h3>
              <p>Điền thông tin cơ bản để tạo hồ sơ mới.</p>
            </div>
            <ProfileImageField
              value={imageFile}
              disabled={isPending}
              onChange={setImageFile}
              onInvalidFile={showErrorToast}
            />
            <StudentProfileFields
              form={form}
              disabled={isPending}
              onFormChange={setForm}
              onSetToday={() => setForm((current) => ({ ...current, startDate: today }))}
            />
            <label className={styles.studentCreateModalField}>
              <span>Chi nhánh *</span>
              <select
                value={resolvedBranchId}
                disabled={!hasBranchData || isPending}
                onChange={(event) => {
                  setSelectedBranchId(event.target.value);
                  setSelectedScheduleIds(new Set());
                }}
              >
                {!hasBranchData ? (
                  <option value="">— Không có chi nhánh khả dụng —</option>
                ) : (
                  <>
                    <option value="">— Chọn chi nhánh —</option>
                    {[...branchOptions]
                      .sort((a, b) => a.branchName.localeCompare(b.branchName))
                      .map((branch) => (
                        <option key={branch.branchId} value={branch.branchId}>
                          {branch.branchName}
                        </option>
                      ))}
                  </>
                )}
              </select>
            </label>
          </section>

          <section className={styles.studentCreateModalSection}>
            <div className={styles.studentCreateModalSectionHeader}>
              <h3>Phân lớp</h3>
              <p>Chọn các lớp ACTIVE để thêm vào hồ sơ học viên.</p>
            </div>
            <div className={styles.studentCreateModalClassBox}>
              <div className={styles.studentCreateModalClassBoxHead}>
                <span>Lịch học theo chi nhánh</span>
                <strong>{selectedScheduleIds.size} lớp đã chọn</strong>
              </div>
              <ClassList
                hasBranch={hasBranchData}
                isLoading={isSchedulesFetching && (schedules?.length ?? 0) === 0}
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
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Ghi chú bổ sung cho hồ sơ hoặc xếp lớp"
                  rows={3}
                />
              </label>
            </div>
          </section>

          <footer className={styles.studentCreateModalActions}>
            <button type="button" className={styles.btn} onClick={handleClose} disabled={isPending}>
              Hủy
            </button>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>
              {isPending ? "Đang tạo..." : "Tạo học viên"}
            </button>
          </footer>
        </fieldset>
      </form>
    </ModalLayout>
  );
}
