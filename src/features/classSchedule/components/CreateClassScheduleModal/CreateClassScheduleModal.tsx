import { useMemo, useState } from "react";

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
  WeekdayLabel,
} from "@/config/constants";
import { classScheduleAPI } from "@/features/classSchedule/api/classScheduleAPI";
import { useGenericMutation } from "@/hooks/useCrud";
import type { ClassScheduleCreateRequest, ClassScheduleDetail } from "@/types";
import { generateScheduleId, isScheduleIdReady } from "@/utils/scheduleUtils";

import styles from "./CreateClassScheduleModal.module.scss";

type SessionType = "MORNING" | "AFTERNOON";

type Props = {
  classScheduleIds: string[];
  open: boolean;
  onClose: () => void;
};

interface CreateScheduleForm extends Omit<
  ClassScheduleCreateRequest,
  "scheduleId"
> {
  sessionType: SessionType;
}

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "INACTIVE", label: "Không hoạt động" },
] as const;

const SESSION_TYPE_OPTIONS = [
  { value: "MORNING" as const, label: "Sáng" },
  { value: "AFTERNOON" as const, label: "Chiều" },
] as const;

const INITIAL_FORM: CreateScheduleForm = {
  branchId: 1,
  weekday: "MONDAY",
  level: "BASIC",
  shift: "CA_1",
  location: "INDOOR",
  scheduleStatus: "ACTIVE",
  startTime: "19:30",
  endTime: "21:00",
  sessionType: "MORNING",
  monthlyFee: 1100000,
  quarterlyFee: 3000000,
};

export function CreateClassScheduleModal({
  open,
  onClose,
  classScheduleIds,
}: Props) {
  const { mutateAsync: createSchedule, isPending } = useGenericMutation<
    ClassScheduleDetail,
    ClassScheduleCreateRequest
  >(
    (data) => classScheduleAPI.createClassSchedule(data),
    [["class-schedules"]],
  );

  const [form, setForm] = useState<CreateScheduleForm>(INITIAL_FORM);

  console.log("Render CreateClassScheduleModal with form:", form);

  const levelOptions = useMemo(() => Object.entries(ScheduleLevelLabel), []);
  const shiftOptions = useMemo(() => Object.entries(ScheduleShiftLabel), []);
  const locationOptions = useMemo(
    () => Object.entries(ScheduleLocationLabel),
    [],
  );
  const weekdayOptions = useMemo(() => Object.entries(WeekdayLabel), []);

  // Kiểm tra dữ liệu đủ để tạo mã lớp
  const hasEnoughDataForScheduleId = isScheduleIdReady(
    form.sessionType,
    form.branchId,
    form.weekday,
    form.shift,
  );

  // Mã lớp được tạo tự động dựa trên các tham số
  const generatedScheduleId = hasEnoughDataForScheduleId
    ? generateScheduleId(
        form.sessionType,
        form.branchId,
        form.weekday,
        form.shift,
      )
    : "";

  // Kiểm tra trùng lặp mã lớp với danh sách đã có
  const isDuplicate = useMemo(
    () =>
      !!(generatedScheduleId && classScheduleIds.includes(generatedScheduleId)),
    [generatedScheduleId, classScheduleIds],
  );

  const setField = <K extends keyof CreateScheduleForm>(
    key: K,
    value: CreateScheduleForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleClose = () => {
    if (isPending) return;
    setForm(INITIAL_FORM);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasEnoughDataForScheduleId) {
      showErrorToast("Vui lòng chọn buổi học, chi nhánh, thứ và ca học.");
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
      await createSchedule({
        scheduleId: generatedScheduleId,
        branchId: Number(form.branchId),
        weekday: form.weekday,
        level: form.level,
        shift: form.shift,
        location: form.location,
        scheduleStatus: form.scheduleStatus,
        startTime: form.startTime,
        endTime: form.endTime,
        monthlyFee: form.monthlyFee ?? 0,
        quarterlyFee: form.quarterlyFee ?? 0,
      });

      showSuccessToast("Tạo lớp học thành công.");
      handleClose();
    } catch {
      showErrorToast("Không thể tạo lớp học. Vui lòng thử lại.");
    }
  };

  return (
    <ModalLayout
      open={open}
      onClose={handleClose}
      closeOnBackdrop={!isPending}
      closeOnEscape={!isPending}
      title="Tạo lớp mới"
      subtitle="Nhập thông tin để tạo lịch học mới"
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
            Đang gửi dữ liệu...
          </div>
        ) : null}

        <fieldset
          className={styles.createClassModal__fieldset}
          disabled={isPending}
        >
          <section className={styles.createClassModal__section}>
            <div className={styles.createClassModal__sectionHeader}>
              <h3>Chọn buổi học & Mã lớp</h3>
              <p>Lựa chọn buổi sáng hay chiều, mã lớp sẽ được tạo tự động.</p>
            </div>

            <div
              className={`${styles.createClassModal__grid} ${styles["createClassModal__grid--compact"]}`}
            >
              <label className={styles.createClassModal__field}>
                <span>Buổi học</span>
                <select
                  value={form.sessionType}
                  onChange={(ev) =>
                    setField("sessionType", ev.target.value as SessionType)
                  }
                >
                  {SESSION_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
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

              <div className={styles.createClassModal__field}>
                <span>Mã lớp (Tự động)</span>
                <input
                  type="text"
                  value={generatedScheduleId || "Chọn đủ dữ liệu để tạo mã"}
                  placeholder="Tự động"
                  readOnly
                />
                {isDuplicate && (
                  <p style={{ color: "#dc2626", fontSize: 12, marginTop: 6 }}>
                    Mã lớp này đã tồn tại!
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className={styles.createClassModal__section}>
            <div className={styles.createClassModal__sectionHeader}>
              <h3>Thông tin lớp học</h3>
              <p>Điền thông tin cơ bản để tạo lịch học mới.</p>
            </div>

            <div
              className={`${styles.createClassModal__grid} ${styles["createClassModal__grid--compact"]}`}
            >
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
                  placeholder="1"
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
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.createClassModal__field}>
                <span>Phí hàng tháng</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="number"
                    min={1}
                    value={String(Math.floor((form.monthlyFee ?? 0) / 1000))}
                    onChange={(ev) =>
                      setField("monthlyFee", Number(ev.target.value) * 1000)
                    }
                    placeholder="Nhập số cơ bản"
                    style={{ textAlign: "right" }}
                  />
                  <span style={{ color: "#6b7280" }}>,000đ</span>
                </div>
              </label>

              <label className={styles.createClassModal__field}>
                <span>Phí quý</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="number"
                    min={1}
                    value={String(Math.floor((form.quarterlyFee ?? 0) / 1000))}
                    onChange={(ev) =>
                      setField("quarterlyFee", Number(ev.target.value) * 1000)
                    }
                    placeholder="Nhập số cơ bản"
                    style={{ textAlign: "right" }}
                  />
                  <span style={{ color: "#6b7280" }}>,000đ</span>
                </div>
              </label>
            </div>
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
            disabled={isPending || isDuplicate}
          >
            {isPending ? "Đang tạo..." : "Tạo lớp"}
          </button>
        </div>
      </form>
    </ModalLayout>
  );
}

export default CreateClassScheduleModal;
