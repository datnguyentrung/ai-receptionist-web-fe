import type {
  AttendanceBatchCreateRequest,
  AttendanceManualLogRequest,
  AttendanceUpdateEvaluationRequest,
  AttendanceUpdateStatusRequest,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentAttendanceAPI } from "./StudentAttendanceAPI";

const ATTENDANCE_QUERY_KEY = "student-attendance";

// 1. Hook lấy danh sách điểm danh theo lịch học và ngày
export const useFilterAttendance = (
  classScheduleId: string,
  sessionDate: string,
) => {
  return useQuery({
    queryKey: [ATTENDANCE_QUERY_KEY, classScheduleId, sessionDate],
    queryFn: () => studentAttendanceAPI.filter(classScheduleId, sessionDate),
    enabled: !!classScheduleId && !!sessionDate,
  });
};

// 2. Hook khởi tạo danh sách điểm danh cho cả buổi học
export const useBatchInitAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AttendanceBatchCreateRequest) =>
      studentAttendanceAPI.batchInit(data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          ATTENDANCE_QUERY_KEY,
          variables.classScheduleId,
          variables.sessionDate,
        ],
      });
    },
  });
};

// 3. Hook tạo bản ghi điểm danh thủ công cho 1 học viên
export const useCreateAttendanceRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AttendanceManualLogRequest) =>
      studentAttendanceAPI.createRecord(data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          ATTENDANCE_QUERY_KEY,
          variables.classScheduleId,
          variables.sessionDate,
        ],
      });
    },
  });
};

// 4. Hook cập nhật trạng thái điểm danh
export const useUpdateAttendanceStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      attendanceId,
      data,
    }: {
      attendanceId: string;
      data: AttendanceUpdateStatusRequest;
    }) => studentAttendanceAPI.updateStatus(attendanceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ATTENDANCE_QUERY_KEY] });
    },
  });
};

// 5. Hook cập nhật đánh giá điểm danh
export const useUpdateAttendanceEvaluation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      attendanceId,
      data,
    }: {
      attendanceId: string;
      data: AttendanceUpdateEvaluationRequest;
    }) => studentAttendanceAPI.updateEvaluation(attendanceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ATTENDANCE_QUERY_KEY] });
    },
  });
};
