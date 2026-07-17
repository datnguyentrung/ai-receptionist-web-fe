import { studentAttendanceAPI } from "@/features/studentAttendance/api/studentAttendanceAPI";
import { studentEnrollmentAPI } from "@/features/studentEnrollment/api/studentEnrollmentAPI";
import { formatDateYMD } from "@/utils/format";
import type { QueryClient } from "@tanstack/react-query";

export const attendanceStudentsQueryKey = (classScheduleId: string) => [
  "students-by-class-session",
  classScheduleId,
] as const;

export const attendanceRecordsQueryKey = (
  sessionDate: string,
  classScheduleId: string,
) =>
  [
    "student-attendance",
    { sessionDate, scheduleIds: [classScheduleId] },
  ] as const;

export const getAttendanceSessionDate = () => formatDateYMD(new Date());

export function prefetchAttendanceCheckin(
  queryClient: QueryClient,
  classScheduleId: string,
) {
  if (!classScheduleId) return;

  const sessionDate = getAttendanceSessionDate();

  void import("@/pages/AttendanceCheckin");
  void queryClient.prefetchQuery({
    queryKey: attendanceStudentsQueryKey(classScheduleId),
    queryFn: () =>
      studentEnrollmentAPI.getStudentEnrollmentsByClassScheduleId(
        classScheduleId,
      ),
  });
  void queryClient.prefetchQuery({
    queryKey: attendanceRecordsQueryKey(sessionDate, classScheduleId),
    queryFn: () =>
      studentAttendanceAPI.filter({
        sessionDate,
        scheduleIds: [classScheduleId],
      }),
  });
}
