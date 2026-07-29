import { Input } from "@/components/ui/input";
import type { Belt, StudentStatus } from "@/config/constants";
import styles from "./StudentCreateModal.module.scss";

export type StudentProfileFormState = {
  fullName: string;
  phoneNumber: string;
  nationalCode: string;
  birthDate: string;
  startDate: string;
  belt: Belt;
  studentStatus: StudentStatus;
};

const STUDENT_BELT_OPTIONS: Belt[] = [
  "C10", "C9", "C8", "C7", "C6", "C5", "C4", "C3", "C2", "C1",
  "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10",
];

const STUDENT_STATUS_OPTIONS: Array<{
  value: StudentStatus;
  label: string;
}> = [
  { value: "ACTIVE", label: "Đang học" },
  { value: "RESERVED", label: "Bảo lưu" },
  { value: "DROPPED", label: "Nghỉ học" },
];

type StudentProfileFieldsProps = {
  form: StudentProfileFormState;
  disabled: boolean;
  onFormChange: (form: StudentProfileFormState) => void;
  onSetToday?: () => void;
};

export function StudentProfileFields({
  form,
  disabled,
  onFormChange,
  onSetToday,
}: StudentProfileFieldsProps) {
  const update = <K extends keyof StudentProfileFormState>(
    key: K,
    value: StudentProfileFormState[K],
  ) => onFormChange({ ...form, [key]: value });

  return (
    <div className={styles.studentCreateModalGrid}>
      <label className={styles.studentCreateModalField}>
        <span>Họ và tên *</span>
        <Input
          type="text"
          value={form.fullName}
          disabled={disabled}
          onChange={(event) => update("fullName", event.target.value)}
          placeholder="Nhập họ và tên"
        />
      </label>

      <label className={styles.studentCreateModalField}>
        <span>Số điện thoại *</span>
        <Input
          type="tel"
          value={form.phoneNumber}
          disabled={disabled}
          onChange={(event) => update("phoneNumber", event.target.value)}
          placeholder="Ví dụ: 0912345678"
        />
      </label>

      <label className={styles.studentCreateModalField}>
        <span>Mã hội viên</span>
        <Input
          type="text"
          value={form.nationalCode}
          disabled={disabled}
          onChange={(event) => update("nationalCode", event.target.value)}
          placeholder="Tùy chọn"
        />
      </label>

      <label className={styles.studentCreateModalField}>
        <span>Ngày sinh *</span>
        <Input
          type="date"
          value={form.birthDate}
          disabled={disabled}
          onChange={(event) => update("birthDate", event.target.value)}
        />
      </label>

      <label className={styles.studentCreateModalField}>
        <span>Cấp đai *</span>
        <select
          value={form.belt}
          disabled={disabled}
          onChange={(event) => update("belt", event.target.value as Belt)}
        >
          {STUDENT_BELT_OPTIONS.map((belt) => (
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
          disabled={disabled}
          onChange={(event) =>
            update("studentStatus", event.target.value as StudentStatus)
          }
        >
          {STUDENT_STATUS_OPTIONS.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.studentCreateModalField}>
        <div className={styles.studentCreateModalFieldLabelRow}>
          <span>Ngày nhập học *</span>
          {onSetToday ? (
            <button
              type="button"
              className={styles.studentCreateModalQuickButton}
              disabled={disabled}
              onClick={onSetToday}
            >
              Hôm nay
            </button>
          ) : null}
        </div>
        <Input
          type="date"
          value={form.startDate}
          disabled={disabled}
          onChange={(event) => update("startDate", event.target.value)}
        />
      </label>
    </div>
  );
}
