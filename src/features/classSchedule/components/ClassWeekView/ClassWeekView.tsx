import { DaySelector } from "@/components/DaySelector";
import type { ClassScheduleDTO } from "@/data/mockData";
import { ClassWeekItem } from "@/features/classSchedule/components/ClassWeekItem";
import { Calendar } from "lucide-react";
import { useState } from "react";
import styles from "./ClassWeekView.module.scss";

const WEEK_DAYS = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ Nhật",
];

interface Props {
  classes: ClassScheduleDTO[];
}

export function ClassWeekView({ classes }: Props) {
  const [selectedDay, setSelectedDay] = useState("Thứ 4");

  const counts = Object.fromEntries(
    WEEK_DAYS.map((day) => [
      day,
      classes.filter((c) => c.dayOfWeek.includes(day)).length,
    ]),
  );

  const filtered = classes.filter((c) => c.dayOfWeek.includes(selectedDay));

  return (
    <div className={styles.weekView}>
      <DaySelector
        days={WEEK_DAYS}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
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
              Không có lớp học vào {selectedDay}
            </p>
          </div>
        ) : (
          filtered.map((cls) => <ClassWeekItem key={cls.classId} cls={cls} />)
        )}
      </div>
    </div>
  );
}
