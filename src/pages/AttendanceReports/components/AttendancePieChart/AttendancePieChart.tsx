import { PIE_DATA } from "@/pages/AttendanceReports/constants";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import styles from "./AttendancePieChart.module.scss";

export function AttendancePieChart() {
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
        Tuần hiện tại
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={PIE_DATA}
            cx="50%"
            cy="45%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
          >
            {PIE_DATA.map((entry, index) => (
              <Cell key={index} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value}%`, ""]} />
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
