import type {
  AttendanceStatus,
  Belt,
  EvaluationStatus,
  ScheduleLevel,
} from "@/config/constants";
import { javaApi } from "@/lib/axiosInstance";
import type {
  AttendanceBatchCreateRequest,
  AttendanceManualLogRequest,
  AttendanceUpdateEvaluationRequest,
  AttendanceUpdateStatusRequest,
  PageResponse,
  StudentAttendanceResponse,
} from "@/types";

export const studentAttendanceAPI = {
  /** PATCH /{attendanceId}/status — Cập nhật trạng thái điểm danh */
  updateStatus: async (
    attendanceId: string,
    data: AttendanceUpdateStatusRequest,
  ): Promise<void> => {
    await javaApi.patch(
      `/student-attendances/${attendanceId}/status`,
      data,
    );
  },

  /** PATCH /{attendanceId}/evaluation — Cập nhật đánh giá */
  updateEvaluation: async (
    attendanceId: string,
    data: AttendanceUpdateEvaluationRequest,
  ): Promise<void> => {
    await javaApi.patch(
      `/student-attendances/${attendanceId}/evaluation`,
      data,
    );
  },

  /** POST / — Tạo bản ghi điểm danh thủ công cho 1 học viên */
  createRecord: async (
    data: AttendanceManualLogRequest,
  ): Promise<StudentAttendanceResponse> => {
    const response = await javaApi.post("/student-attendances", data);
    return response.data;
  },

  /** POST /batch-init — Khởi tạo danh sách điểm danh cho cả buổi học */
  batchInit: async (
    data: AttendanceBatchCreateRequest,
  ): Promise<StudentAttendanceResponse[]> => {
    const response = await javaApi.post(
      "/student-attendances/batch-init",
      data,
    );
    return response.data;
  },

  /** GET /filter — Lọc danh sách điểm danh theo lịch học và ngày */
  filter: async (
    search?: string,
    page?: number,
    size?: number,
    sortBy?: string,
    sortDir?: "asc" | "desc",

    sessionDate?: string | Date,
    attendanceStatuses?: AttendanceStatus[],
    evaluationStatuses?: EvaluationStatus[],
    belts?: Belt[],
    branchIds?: number[],
    scheduleLevels?: ScheduleLevel[],
    scheduleIds?: string[],
  ): Promise<PageResponse<StudentAttendanceResponse>> => {
    const response = await javaApi.get("/student-attendances", {
      params: {
        search,
        sessionDate,
        attendanceStatuses: attendanceStatuses,
        evaluationStatuses: evaluationStatuses,
        belts: belts,
        branchIds: branchIds,
        scheduleLevels: scheduleLevels,
        scheduleIds: scheduleIds,
        page,
        size,
        sortBy,
        sortDir,
      },
    });
    console.log("API response:", response);
    return response.data;
  },
};
