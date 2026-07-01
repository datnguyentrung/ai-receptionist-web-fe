import { DaySelector } from "@/components/DaySelector";
import type { ScheduleShift, ScheduleStatus } from "@/config/constants";
import {
  ScheduleShiftLabel,
  WeekdayCode,
  WeekdayFromCode,
  WeekdayLabel,
} from "@/config/constants";
import type { ClassScheduleDetail } from "@/types";
import { getCurrentWeekday } from "@/utils/format";
import { Calendar } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { ClassWeekItem } from "../ClassWeekItem";
import styles from "./ClassWeekView.module.scss";

interface Props {
  classes: ClassScheduleDetail[];
  onRequestStatusChange: (
    scheduleId: string,
    currentStatus: ScheduleStatus,
  ) => void;
  onOpenSessionsModal: (scheduleId?: string) => void;
}

function ClassWeekViewInner({
  classes,
  onRequestStatusChange,
  onOpenSessionsModal,
}: Props) {
  const [selectedDay, setSelectedDay] = useState<number>(getCurrentWeekday);
  const [selectedShift, setSelectedShift] = useState<ScheduleShift | "ALL">(
    "ALL",
  );

  const classesByShift = useMemo(
    () =>
      selectedShift === "ALL"
        ? classes
        : classes.filter((c) => c.scheduleShift === selectedShift),
    [classes, selectedShift],
  );

  const counts = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(WeekdayCode).map(([key, code]) => [
          key,
          classesByShift.filter((c) => c.weekday === code).length,
        ]),
      ),
    [classesByShift],
  );

  const filtered = useMemo(
    () =>
      classesByShift
        .filter((c) => c.weekday === selectedDay)
        .sort((left, right) => left.startTime.localeCompare(right.startTime)),
    [classesByShift, selectedDay],
  );

  return (
    <div className={styles.weekView}>
      <DaySelector
        days={Object.keys(WeekdayCode)}
        selectedDay={WeekdayFromCode[selectedDay] ?? ""}
        onSelectDay={(day) =>
          setSelectedDay(WeekdayCode[day as keyof typeof WeekdayCode])
        }
        counts={counts}
      />
      <div className={styles.classSchedulesFilterBar} aria-label="Lọc ca học">
        <button
          type="button"
          className={`${styles.classSchedulesFilterBtn} ${
            selectedShift === "ALL" ? styles.classSchedulesFilterBtnActive : ""
          }`}
          onClick={() => setSelectedShift("ALL")}
        >
          Tất cả
        </button>
        {(["CA_1", "CA_2"] as const).map((shift) => (
          <button
            type="button"
            key={shift}
            className={`${styles.classSchedulesFilterBtn} ${
              selectedShift === shift
                ? styles.classSchedulesFilterBtnActive
                : ""
            }`}
            onClick={() => setSelectedShift(shift)}
          >
            {ScheduleShiftLabel[shift]}
          </button>
        ))}
      </div>
      <div className={styles.classList}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <Calendar size={40} />
            <p>
              Không có lớp học vào{" "}
              {
                WeekdayLabel[
                  WeekdayFromCode[selectedDay] as keyof typeof WeekdayLabel
                ]
              }
            </p>
          </div>
        ) : (
          filtered.map((cls) => (
            <ClassWeekItem
              key={cls.scheduleId}
              cls={cls}
              onRequestStatusChange={onRequestStatusChange}
              onOpenSessionsModal={onOpenSessionsModal}
            />
          ))
        )}
      </div>
    </div>
  );
}

export const ClassWeekView = memo(ClassWeekViewInner);
