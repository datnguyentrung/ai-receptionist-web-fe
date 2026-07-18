import { useEffect, useMemo, useState, type FormEvent } from "react";

import { ModalLayout } from "@/components/ui/modal-layout";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import type {
  ScheduleLevel,
  ScheduleLocation,
  ScheduleShift,
  ScheduleStatus,
  Weekday,
} from "@/config/constants";
import {
  ScheduleLevelLabel,
  ScheduleLocationLabel,
  ScheduleShiftLabel,
  WeekdayFromCode,
  WeekdayLabel,
} from "@/config/constants";
import { classScheduleAPI } from "@/features/classSchedule/api/classScheduleAPI";
import { useGenericMutation } from "@/hooks/useCrud";
import type {
  ClassScheduleDetail,
  ClassScheduleUpdateRequest,
} from "@/types";

import styles from "../CreateClassScheduleModal/CreateClassScheduleModal.module.scss";

type Props = {
  open: boolean;
  classSchedule: ClassScheduleDetail | null;
  onClose: () => void;
  onUpdated?: () => void;
};

type UpdateScheduleForm = Required<
  Pick<
    ClassScheduleUpdateRequest,
    | "branchId"
    | "weekday"
    | "level"
    | "shift"
    | "location"
    | "scheduleStatus"
    | "startTime"
    | "endTime"
  >
>;

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "INACTIVE", label: "Không hoạt động" },
] as const;

const toForm = (classSchedule: ClassScheduleDetail): UpdateScheduleForm => ({
  branchId: classSchedule.branchId,
  weekday: WeekdayFromCode[classSchedule.weekday] ?? "MONDAY",
  level: classSchedule.scheduleLevel,
  shift: classSchedule.scheduleShift,
  location: classSchedule.scheduleLocation,
  scheduleStatus: classSchedule.scheduleStatus,
  startTime: classSchedule.startTime,
  endTime: classSchedule.endTime,
});

export function UpdateClassScheduleModal({
  open,
  classSchedule,
  onClose,
  onUpdated,
}: Props) {
  const [form, setForm] = useState<UpdateScheduleForm | null>(null);

  const { mutateAsync: updateSchedule, isPending } = useGenericMutation<
    ClassScheduleDetail,
    { id: string; data: ClassScheduleUpdateRequest }
  >(
    ({ id, data }) => classScheduleAPI.updateClassSchedule(id, data),
    [["class-schedules"]],
  );

  const levelOptions = useMemo(() => Object.entries(ScheduleLevelLabel), []);
  const shiftOptions = useMemo(() => Object.entries(ScheduleShiftLabel), []);
  const locationOptions = useMemo(
    () => Object.entries(ScheduleLocationLabel),
    [],
  );
  const weekdayOptions = useMemo(() => Object.entries(WeekdayLabel), []);

  useEffect(() => {
    if (open && classSchedule) {
      setForm(toForm(classSchedule));
    }
  }, [classSchedule, open]);

  const setField = <K extends keyof UpdateScheduleForm>(
    key: K,
    value: UpdateScheduleForm[K],
  ) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleClose = () => {
    if (isPending) return;
    setForm(classSchedule ? toForm(classSchedule) : null);
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!classSchedule || !form) {
      return;
    }

    if (!form.branchId || Number.isNaN(Number(form.branchId))) {
      showErrorToast("Vui lòng nhập chi nhánh hợp lệ.");
      return;
    }

    if (!form.startTime || !form.endTime) {
      showErrorToast("Vui lòng nhập giờ bắt đầu và kết thúc.");
      return;
    }

    if (form.startTime >= form.endTime) {
      showErrorToast("Thời gian kết thúc phải lớn hơn thời gian bắt đầu.");
      return;
    }

    try {
      await updateSchedule({
        id: classSchedule.scheduleId,
        data: {
          branchId: Number(form.branchId),
          weekday: form.weekday,
          level: form.level,
          shift: form.shift,
          location: form.location,
          scheduleStatus: form.scheduleStatus,
          startTime: form.startTime,
          endTime: form.endTime,
        },
      });

      showSuccessToast("Cập nhật lớp học thành công.");
      onUpdated?.();
      handleClose();
    } catch {
      showErrorToast("Không thể cập nhật lớp học. Vui lòng thử lại.");
    }
  };

  return (
    <ModalLayout
      open={open}
      onClose={handleClose}
      closeOnBackdrop={!isPending}
      closeOnEscape={!isPending}
      title="Cập nhật lớp học"
      subtitle={
        classSchedule
          ? `Chỉnh sửa lịch học ${classSchedule.scheduleId}`
          : "Chỉnh sửa thông tin lịch học"
      }
      maxWidth={760}
    >
      <form className={styles.createClassModal} onSubmit={handleSubmit}>
        {isPending ? (
          <div
            className={styles.createClassModal__loading}
            role="status"
            aria-live="polite"
          >
            <span
              className={styles.createClassModal__spinner}
              aria-hidden="true"
            />
            Đang cập nhật dữ liệu...
          </div>
        ) : null}

        <fieldset
          className={styles.createClassModal__fieldset}
          disabled={isPending || !form}
        >
          <section className={styles.createClassModal__section}>
            <div className={styles.createClassModal__sectionHeader}>
              <h3>Thông tin lớp học</h3>
              <p>Cập nhật ca học, địa điểm, trạng thái và thời gian học.</p>
            </div>

            {form ? (
              <div
                className={`${styles.createClassModal__grid} ${styles["createClassModal__grid--compact"]}`}
              >
                <label className={styles.createClassModal__field}>
                  <span>Mã lớp</span>
                  <input
                    type="text"
                    value={classSchedule?.scheduleId ?? ""}
                    readOnly
                  />
                </label>

                <label className={styles.createClassModal__field}>
                  <span>Loại lớp</span>
                  <select
                    value={form.level}
                    onChange={(ev) =>
                      setField("level", ev.target.value as ScheduleLevel)
                    }
                  >
                    {levelOptions.map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.createClassModal__field}>
                  <span>Thứ trong tuần</span>
                  <select
                    value={form.weekday}
                    onChange={(ev) =>
                      setField("weekday", ev.target.value as Weekday)
                    }
                  >
                    {weekdayOptions.map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.createClassModal__field}>
                  <span>Chi nhánh</span>
                  <input
                    type="number"
                    value={String(form.branchId)}
                    onChange={(ev) =>
                      setField("branchId", Number(ev.target.value))
                    }
                    min={1}
                    required
                  />
                </label>

                <label className={styles.createClassModal__field}>
                  <span>Ca</span>
                  <select
                    value={form.shift}
                    onChange={(ev) =>
                      setField("shift", ev.target.value as ScheduleShift)
                    }
                  >
                    {shiftOptions.map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.createClassModal__field}>
                  <span>Vị trí</span>
                  <select
                    value={form.location}
                    onChange={(ev) =>
                      setField("location", ev.target.value as ScheduleLocation)
                    }
                  >
                    {locationOptions.map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.createClassModal__field}>
                  <span>Giờ bắt đầu</span>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(ev) => setField("startTime", ev.target.value)}
                    required
                  />
                </label>

                <label className={styles.createClassModal__field}>
                  <span>Giờ kết thúc</span>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(ev) => setField("endTime", ev.target.value)}
                    required
                  />
                </label>

                <label className={styles.createClassModal__field}>
                  <span>Trạng thái</span>
                  <select
                    value={form.scheduleStatus}
                    onChange={(ev) =>
                      setField(
                        "scheduleStatus",
                        ev.target.value as ScheduleStatus,
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
              </div>
            ) : null}
          </section>
        </fieldset>

        <div className={styles.createClassModal__actions}>
          <button
            type="button"
            className={`${styles.btn} ${styles["btn--ghost"]}`}
            onClick={handleClose}
            disabled={isPending}
          >
            Hủy
          </button>
          <button
            type="submit"
            className={`${styles.btn} ${styles["btn--primary"]}`}
            disabled={isPending || !form}
          >
            {isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </ModalLayout>
  );
}

export default UpdateClassScheduleModal;
