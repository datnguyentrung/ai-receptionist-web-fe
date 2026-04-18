import { cn } from "@/components/ui/utils";
import { Check } from "lucide-react";
import React from "react";
import styles from "./StepProgress.module.scss";

const STEPS = [
  { num: 1, label: "Chọn Võ sinh" },
  { num: 2, label: "Xếp lớp" },
];

interface StepProgressProps {
  currentStep: number;
}

export default function StepProgress({ currentStep }: StepProgressProps) {
  return (
    <div className={styles.stepsContainer}>
      {STEPS.map((s, index) => {
        const isActive = currentStep === s.num;
        const isDone = currentStep > s.num;

        return (
          <React.Fragment key={s.num}>
            <div
              className={cn(
                styles.stepItem,
                isActive && styles.stepActive,
                isDone && styles.stepDone,
                !isActive && !isDone && styles.stepMuted,
              )}
            >
              <div className={styles.stepNum}>
                {isDone ? (
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                ) : (
                  s.num
                )}
              </div>
              <span>{s.label}</span>
            </div>

            {index < STEPS.length - 1 && (
              <div className={styles.stepLine}>
                <div
                  className={cn(
                    styles.stepLineInner,
                    currentStep > s.num && styles.stepLineFilled,
                  )}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
