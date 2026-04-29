import { studentAttendanceAPI } from "@/features/studentAttendance/api/studentAttendanceAPI";
import { useGetQuery } from "@/hooks/useCrud";
import { useAuthStore } from "@/store/authStore";
import { CalendarDays, Loader2 } from "lucide-react";

/**
 * StudentDashboard — integration example showing:
 * 1. Reading activeProfile.id from authStore
 * 2. Passing it into the queryKey so React Query auto-refetches on profile switch
 */
export default function StudentDashboard() {
  const activeProfile = useAuthStore((s) => s.activeProfile);
  const profileId = activeProfile?.userInfo.idUser ?? null;

  // ── queryKey contains profileId → auto refetch when switchProfile() changes it ──
  const { data, isLoading, isError } = useGetQuery(
    ["attendance", profileId],
    () => studentAttendanceAPI.filter({}),
    { enabled: !!profileId },
  );

  const profileName = activeProfile?.userProfile.name;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 8 }}>
        Dashboard — {profileName ?? "Chưa chọn tài khoản"}
      </h2>

      {/* Profile info bar */}
      {activeProfile && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            background: "#f0f4ff",
            marginBottom: 24,
            fontSize: 14,
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <CalendarDays size={16} />
          <span>
            Đang xem dữ liệu của: <strong>{profileName}</strong>
          </span>
        </div>
      )}

      {/* Data area */}
      {isLoading && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Loader2 size={18} className="animate-spin" />
          <span>Đang tải điểm danh...</span>
        </div>
      )}

      {isError && (
        <p style={{ color: "red" }}>Không thể tải dữ liệu điểm danh.</p>
      )}

      {data && (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 16,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          <h3 style={{ marginBottom: 12 }}>Lịch điểm danh</h3>
          {data.attendances.content.length === 0 ? (
            <p style={{ color: "#888" }}>Chưa có dữ liệu điểm danh.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {data.attendances.content.map((record) => (
                <li
                  key={record.attendanceId}
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid #f0f0f0",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 14,
                  }}
                >
                  <span>{record.sessionDate}</span>
                  <span>{record.studentName}</span>
                  <span>{record.attendanceStatus}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
