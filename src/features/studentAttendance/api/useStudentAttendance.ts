import type {
  AttendanceBatchCreateRequest,
  AttendanceListResponse,
  AttendanceManualLogRequest,
  AttendanceUpdateEvaluationRequest,
  AttendanceUpdateStatusRequest,
  StudentAttendanceSimpleResponse,
} from "@/types";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
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
  scheduleIds?: string[],
  page?: number,
  size?: number,
  sortBy?: string,
  sortDir?: "asc" | "desc",
): UseQueryResult<AttendanceListResponse, Error> => {
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
      scheduleIds,
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
        scheduleIds,
      ),
    enabled:
      !!search ||
      !!sessionDate ||
      !!attendanceStatuses ||
      !!evaluationStatuses ||
      !!belts ||
      !!branchIds ||
      !!scheduleLevels ||
      !!scheduleIds,
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
  return useMutation({
    mutationFn: ({
      attendanceId,
      data,
    }: {
      attendanceId: string;
      data: AttendanceUpdateStatusRequest;
    }) => studentAttendanceAPI.updateStatus(attendanceId, data),
  });
};

// 5. Hook cập nhật đánh giá điểm danh
export const useUpdateAttendanceEvaluation = () => {
  return useMutation({
    mutationFn: ({
      attendanceId,
      data,
    }: {
      attendanceId: string;
      data: AttendanceUpdateEvaluationRequest;
    }) => studentAttendanceAPI.updateEvaluation(attendanceId, data),
  });
};

// 6. Hook cập nhật điểm danh hàng loạt
export const useUpdateAttendanceBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StudentAttendanceSimpleResponse[]) =>
      studentAttendanceAPI.updateAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ATTENDANCE_QUERY_KEY],
      });
    },
  });
};
