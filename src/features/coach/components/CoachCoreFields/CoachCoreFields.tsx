import { Input } from "@/components/ui/input";
import type { Belt, CoachStatus } from "@/config/constants";
import { COACH_BELT_OPTIONS, COACH_STATUS_OPTIONS } from "../../utils/coachForm";

type CoachCoreFieldsProps = {
  fullName: string;
  phoneNumber: string;
  birthDate: string;
  belt: Belt;
  coachStatus?: CoachStatus;
  disabled: boolean;
  onFullNameChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onBirthDateChange: (value: string) => void;
  onBeltChange: (value: Belt) => void;
  onCoachStatusChange: (value: CoachStatus) => void;
};

export function CoachCoreFields({
  fullName,
  phoneNumber,
  birthDate,
  belt,
  coachStatus,
  disabled,
  onFullNameChange,
  onPhoneNumberChange,
  onBirthDateChange,
  onBeltChange,
  onCoachStatusChange,
}: CoachCoreFieldsProps) {
  return (
    <>
      <label className="coach-create-modal__field">
        <span>Họ và tên *</span>
        <Input
          type="text"
          value={fullName}
          disabled={disabled}
          onChange={(event) => onFullNameChange(event.target.value)}
          placeholder="Nguyễn Văn A"
        />
      </label>
      <label className="coach-create-modal__field">
        <span>Số điện thoại *</span>
        <Input
          type="tel"
          value={phoneNumber}
          disabled={disabled}
          onChange={(event) => onPhoneNumberChange(event.target.value)}
          placeholder="0987654321"
        />
      </label>
      <label className="coach-create-modal__field">
        <span>Ngày sinh *</span>
        <Input
          type="date"
          value={birthDate}
          disabled={disabled}
          onChange={(event) => onBirthDateChange(event.target.value)}
        />
      </label>
      <label className="coach-create-modal__field">
        <span>Đai *</span>
        <select
          value={belt}
          disabled={disabled}
          onChange={(event) => onBeltChange(event.target.value as Belt)}
        >
          {COACH_BELT_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="coach-create-modal__field coach-create-modal__field--full">
        <span>Trạng thái công việc</span>
        <select
          value={coachStatus ?? "ACTIVE"}
          disabled={disabled}
          onChange={(event) => onCoachStatusChange(event.target.value as CoachStatus)}
        >
          {COACH_STATUS_OPTIONS.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
