import type {
  AttendanceStatus,
  Belt,
  EvaluationStatus,
  ScheduleLevel,
} from "@/config/constants";
import { javaApi } from "@/lib/axiosInstance";
import { ensureArray, ensureAttendanceListResponse } from "@/lib/runtimeGuards";
import type {
  AttendanceBatchCreateRequest,
  AttendanceListResponse,
  AttendanceManualLogRequest,
  AttendanceUpdateEvaluationRequest,
  AttendanceUpdateStatusRequest,
  StudentAttendanceResponse,
  StudentAttendanceSimpleResponse,
} from "@/types";

export const studentAttendanceAPI = {
  
  updateAttendance: async (
    data: StudentAttendanceSimpleResponse[],
  ): Promise<StudentAttendanceResponse[]> => {
    // Gọi method PUT vào đúng endpoint gốc
    const response = await javaApi.put("/student-attendances", data);

    // Đảm bảo dữ liệu trả về là một mảng an toàn
    return ensureArray<StudentAttendanceResponse>(
      response.data,
      "studentAttendanceAPI.updateAttendance",
    );
  },

  /** PATCH /{attendanceId}/status — Cập nhật trạng thái điểm danh */
  updateStatus: async (
    attendanceId: string,
    data: AttendanceUpdateStatusRequest,
  ): Promise<void> => {
    await javaApi.patch(`/student-attendances/${attendanceId}/status`, data);
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
    return ensureArray<StudentAttendanceResponse>(
      response.data,
      "studentAttendanceAPI.batchInit",
    );
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
  ): Promise<AttendanceListResponse> => {
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

    return ensureAttendanceListResponse(
      response.data,
      "studentAttendanceAPI.filter",
    );
  },
};
