import type { EvaluationStatus } from "@/config/constants";
import { AlertTriangle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./EvalQuick.module.scss";

interface EvalOption {
  value: EvaluationStatus;
  emoji: string;
  label: string;
  bg: string;
  color: string;
  activeBg: string;
}

const EVAL_OPTIONS: EvalOption[] = [
  {
    value: "GOOD",
    emoji: "👍",
    label: "Tốt",
    bg: "#f0fdf4",
    color: "#16a34a",
    activeBg: "#16a34a",
  },
  {
    value: "AVERAGE",
    emoji: "👌",
    label: "Trung bình",
    bg: "#fffbeb",
    color: "#d97706",
    activeBg: "#d97706",
  },
  {
    value: "WEAK",
    emoji: "😔",
    label: "Yếu",
    bg: "#fef2f2",
    color: "#e02020",
    activeBg: "#e02020",
  },
];

interface EvalQuickProps {
  value: EvaluationStatus | null;
  onChange: (v: EvaluationStatus) => void;
  studentName?: string;
  canEvaluate?: boolean;
}

export default function EvalQuick({
  value,
  onChange,
  studentName,
  canEvaluate = true,
}: EvalQuickProps) {
  const [showWarning, setShowWarning] = useState(false);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  const triggerWarning = () => {
    setShowWarning(true);
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
    }

    hideTimerRef.current = window.setTimeout(() => {
      setShowWarning(false);
      hideTimerRef.current = null;
    }, 3000);
  };

  return (
    <div className={styles.container}>
      {studentName && (
        <p className={styles.header}>
          Đánh giá · <span className={styles.studentName}>{studentName}</span>
        </p>
      )}
      <div
        className={`${styles.warningPopover} ${showWarning ? styles.warningVisible : ""}`}
        role="status"
        aria-live="polite"
      >
        <AlertTriangle size={14} />
        <span>Hãy điểm danh trước khi đánh giá võ sinh.</span>
      </div>
      <div className={styles.options}>
        {EVAL_OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              className={`${styles.optBtn} ${active ? styles.active : ""}`}
              style={
                active
                  ? { background: opt.activeBg, color: "white" }
                  : { background: opt.bg, color: opt.color }
              }
              onClick={() => {
                if (!canEvaluate) {
                  triggerWarning();
                  return;
                }

                if (!active) {
                  onChange(opt.value);
                }
              }}
            >
              <span className={styles.emoji}>{active ? "✓" : opt.emoji}</span>
              <span className={styles.optLabel}>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
