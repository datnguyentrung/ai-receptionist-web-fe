import styles from "./DaySelector.module.scss";

interface Props {
  days: string[];
  selectedDay: string;
  onSelectDay: (day: string) => void;
  counts?: Record<string, number>;
}

export function DaySelector({ days, selectedDay, onSelectDay, counts }: Props) {
  return (
    <div className={styles.dayPills}>
      {days.map((day) => {
        const isSelected = selectedDay === day;
        return (
          <button
            key={day}
            onClick={() => onSelectDay(day)}
            className={styles.dayPill}
            style={{
              borderColor: isSelected ? "#E02020" : "#E8EBF0",
              background: isSelected ? "#E02020" : "white",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: isSelected ? "white" : "#374151",
              }}
            >
              {day}
            </span>
            {counts !== undefined && (
              <span
                className={styles.dayPillCount}
                style={{
                  background: isSelected ? "rgba(255,255,255,0.2)" : "#F3F4F6",
                  color: isSelected ? "white" : "#9CA3AF",
                }}
              >
                {counts[day] ?? 0}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
