import { Check } from "lucide-react";
import styles from "./CheckboxChip.module.scss";

export interface CheckboxChipProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function CheckboxChip({ label, checked, onChange }: CheckboxChipProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={[styles.chip, checked ? styles.active : ""].join(" ")}
    >
      <span
        className={[
          styles.indicator,
          checked ? styles.indicatorActive : "",
        ].join(" ")}
      >
        {checked && <Check size={10} strokeWidth={3.5} />}
      </span>
      {label}
    </button>
  );
}
