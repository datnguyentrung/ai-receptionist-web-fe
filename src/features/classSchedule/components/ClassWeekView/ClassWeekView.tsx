import { DaySelector } from "@/components/DaySelector";
import type { ScheduleStatus } from "@/config/constants";
import { WeekdayCode, WeekdayFromCode, WeekdayLabel } from "@/config/constants";
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
}

function ClassWeekViewInner({ classes, onRequestStatusChange }: Props) {
  const [selectedDay, setSelectedDay] = useState<number>(getCurrentWeekday);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(WeekdayCode).map(([key, code]) => [
          key,
          classes.filter((c) => c.weekday === code).length,
        ]),
      ),
    [classes],
  );

  const filtered = useMemo(
    () => classes.filter((c) => c.weekday === selectedDay),
    [classes, selectedDay],
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
      <div className={styles.classList}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <Calendar
              size={40}
              style={{ color: "#D1D5DB", margin: "0 auto 12px" }}
            />
            <p style={{ fontSize: "14px", color: "#9CA3AF" }}>
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
            />
          ))
        )}
      </div>
    </div>
  );
}

export const ClassWeekView = memo(ClassWeekViewInner);
