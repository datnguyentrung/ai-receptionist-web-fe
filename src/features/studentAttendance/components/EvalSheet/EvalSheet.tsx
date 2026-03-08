import Avatar from "@/components/Avatar";
import type { EvaluationStatus } from "@/config/constants";
import type { StudentAttendanceResponse } from "@/types";
import { Check, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import styles from "./EvalSheet.module.scss";

const EVAL_OPTIONS: {
  value: EvaluationStatus;
  emoji: string;
  label: string;
  sub: string;
  color: string;
  bg: string;
  ring: string;
}[] = [
  {
    value: "GOOD",
    emoji: "👍",
    label: "Tốt",
    sub: "Đạt yêu cầu",
    color: "#16A34A",
    bg: "#F0FDF4",
    ring: "#86EFAC",
  },
  {
    value: "AVERAGE",
    emoji: "👌",
    label: "Trung bình",
    sub: "Cần cố gắng hơn",
    color: "#2563EB",
    bg: "#EFF6FF",
    ring: "#93C5FD",
  },
  {
    value: "WEAK",
    emoji: "😔",
    label: "Yếu",
    sub: "Cần hỗ trợ thêm",
    color: "#DC2626",
    bg: "#FFF1F2",
    ring: "#FECACA",
  },
  {
    value: "PENDING",
    emoji: "⏳",
    label: "Chờ đánh giá",
    sub: "Theo dõi thêm",
    color: "#9CA3AF",
    bg: "#F9FAFB",
    ring: "#E5E7EB",
  },
];

interface EvalSheetProps {
  student: StudentAttendanceResponse;
  sessionDate: string;
  onSave: (evalStatus: EvaluationStatus | null, notes: string) => void;
  onClose: () => void;
}

export function EvalSheet({
  student,
  sessionDate,
  onSave,
  onClose,
}: EvalSheetProps) {
  const [evalStatus, setEvalStatus] = useState<EvaluationStatus | null>(
    student.evaluationStatus,
  );
  const [notes, setNotes] = useState(student.note ?? "");
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = setTimeout(() => textRef.current?.focus(), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={styles.backdrop}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className={styles.sheet}
      >
        {/* Handle */}
        <div className={styles.sheetHandle}>
          <div className={styles.sheetHandleBar} />
        </div>

        {/* Header */}
        <div className={styles.sheetHeader}>
          <Avatar
            fullName={student.studentName}
            fontSize="11px"
            fontWeight={800}
            width="40px"
            height="40px"
          />
          <div className={styles.sheetStudentInfo}>
            <p className={styles.sheetStudentName}>{student.studentName}</p>
            <p className={styles.sheetSubtitle}>
              Nhận xét buổi học · {sessionDate}
            </p>
          </div>
          <button onClick={onClose} className={styles.sheetCloseBtn}>
            <X size={16} style={{ color: "#6B7280" }} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className={styles.sheetBody}>
          {/* Rating grid */}
          <div>
            <p className={styles.sectionLabel}>Đánh giá buổi học</p>
            <div className={styles.evalGrid}>
              {EVAL_OPTIONS.map((opt) => {
                const active = evalStatus === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setEvalStatus(active ? null : opt.value)}
                    className={styles.evalOption}
                    style={
                      active
                        ? {
                            borderColor: opt.ring,
                            background: opt.bg,
                            boxShadow: `0 0 0 1px ${opt.ring}`,
                          }
                        : undefined
                    }
                  >
                    <span className={styles.evalEmoji}>{opt.emoji}</span>
                    <div>
                      <p
                        className={styles.evalLabel}
                        style={active ? { color: opt.color } : undefined}
                      >
                        {opt.label}
                      </p>
                      <p className={styles.evalSub}>{opt.sub}</p>
                    </div>
                    {active && (
                      <div
                        className={styles.evalCheckMark}
                        style={{ background: opt.color }}
                      >
                        <Check size={11} style={{ color: "white" }} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={styles.notesLabel}>Ghi chú của HLV</label>
            <textarea
              ref={textRef}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập nhận xét, lưu ý về học viên trong buổi học hôm nay..."
              rows={4}
              className={styles.notesTextarea}
            />
            <p className={styles.charCount}>{notes.length}/500</p>
          </div>

          {/* Quick templates */}
          <div>
            <p className={styles.templateTitle}>Mẫu ghi chú nhanh</p>
            <div className={styles.templates}>
              {[
                "Tập trung tốt, kỹ thuật chuẩn",
                "Cần cải thiện tư thế",
                "Tiến bộ rõ rệt",
                "Cần ôn lại bài cũ",
                "Sức bền tốt",
              ].map((tmpl) => (
                <button
                  key={tmpl}
                  onClick={() => setNotes((p) => (p ? p + ". " + tmpl : tmpl))}
                  className={styles.templateBtn}
                >
                  + {tmpl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.sheetFooter}>
          <button onClick={onClose} className={styles.btnCancel}>
            Hủy
          </button>
          <button
            onClick={() => {
              onSave(evalStatus, notes);
              onClose();
            }}
            className={styles.btnSaveEval}
          >
            <Check size={15} /> Lưu nhận xét
          </button>
        </div>
      </motion.div>
    </>
  );
}
