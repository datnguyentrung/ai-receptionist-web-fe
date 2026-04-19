import type { AttendanceStatus } from "@/config/constants/OperationEnums";
import type { AttendanceStats } from "@/types";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import styles from "./AttendancePieChart.module.scss";

interface AttendancePieChartProps {
  stats: AttendanceStats;
  activeAttendanceStatuses?: AttendanceStatus[];
  onAttendanceFilterChange?: (value: AttendanceStatus[] | null) => void;
}

export function AttendancePieChart({
  stats,
  activeAttendanceStatuses,
  onAttendanceFilterChange,
}: AttendancePieChartProps) {
  const presentWithMakeup = stats.presentCount + stats.makeupCount;
  const pieData = [
    {
      name: "Có mặt",
      value: presentWithMakeup,
      color: "#10B981",
      statuses: ["PRESENT", "MAKEUP"] as AttendanceStatus[],
    },
    {
      name: "Đi muộn",
      value: stats.lateCount,
      color: "#F59E0B",
      statuses: ["LATE"] as AttendanceStatus[],
    },
    {
      name: "Có phép",
      value: stats.excusedCount,
      color: "#6366F1",
      statuses: ["EXCUSED"] as AttendanceStatus[],
    },
    {
      name: "Vắng",
      value: stats.absentCount,
      color: "#EF4444",
      statuses: ["ABSENT"] as AttendanceStatus[],
    },
  ];
  const total = pieData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={styles.pieCard}>
      <p
        style={{
          fontSize: "13px",
          fontWeight: 700,
          color: "#111827",
          marginBottom: "4px",
        }}
      >
        Phân bố điểm danh
      </p>
      <p style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "8px" }}>
        Có mặt đã bao gồm học bù · Tổng {stats.totalRecords} bản ghi, hiển thị{" "}
        {total} lượt đã phân loại
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="45%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
          >
            {pieData.map((entry, index) => {
              const isActive =
                activeAttendanceStatuses?.length === entry.statuses.length &&
                entry.statuses.every((status) =>
                  activeAttendanceStatuses.includes(status),
                );

              return (
                <Cell
                  key={index}
                  fill={entry.color}
                  stroke={isActive ? "#111827" : "none"}
                  strokeWidth={isActive ? 2 : 0}
                  cursor={onAttendanceFilterChange ? "pointer" : "default"}
                  onClick={() => {
                    if (!onAttendanceFilterChange) return;
                    const isSameSelection =
                      activeAttendanceStatuses?.length ===
                        entry.statuses.length &&
                      entry.statuses.every((status) =>
                        activeAttendanceStatuses.includes(status),
                      );
                    onAttendanceFilterChange(
                      isSameSelection ? null : entry.statuses,
                    );
                  }}
                />
              );
            })}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => {
              const percent = total > 0 ? Math.round((value / total) * 100) : 0;
              return [`${value} (${percent}%)`, name];
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "11px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
