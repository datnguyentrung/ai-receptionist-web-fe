import type {
  AttendanceBatchCreateRequest,
  AttendanceManualLogRequest,
  AttendanceUpdateEvaluationRequest,
  AttendanceUpdateStatusRequest,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AttendanceStatus,
  Belt,
  EvaluationStatus,
  ScheduleLevel,
} from "../../../config/constants";
import { studentAttendanceAPI } from "./studentAttendanceAPI";

const ATTENDANCE_QUERY_KEY = "student-attendance";

// 1. Hook lấy danh sách điểm danh theo lịch học và ngày
export const useFilterAttendance = (
  search?: string,
  sessionDate?: string | Date,
  attendanceStatuses?: AttendanceStatus[],
  evaluationStatuses?: EvaluationStatus[],
  belts?: Belt[],
  branchIds?: number[],
  scheduleLevels?: ScheduleLevel[],
  scheduleId?: string,
  page?: number,
  size?: number,
  sortBy?: string,
  sortDir?: "asc" | "desc"
) => {
  return useQuery({
    queryKey: [
      ATTENDANCE_QUERY_KEY,
      search,
      sessionDate,
      attendanceStatuses,
      evaluationStatuses,
      belts,
      branchIds,
      scheduleLevels,
      scheduleId,
      page,
      size,
      sortBy,
      sortDir,
    ],
    queryFn: () =>
      studentAttendanceAPI.filter(
        search,
        page,
        size,
        sortBy,
        sortDir,
        sessionDate,
        attendanceStatuses,
        evaluationStatuses,
        belts,
        branchIds,
        scheduleLevels,
        scheduleId,
      ),
    enabled:
      !!search ||
      !!sessionDate ||
      !!attendanceStatuses ||
      !!evaluationStatuses ||
      !!belts ||
      !!branchIds ||
      !!scheduleLevels ||
      !!scheduleId,
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
