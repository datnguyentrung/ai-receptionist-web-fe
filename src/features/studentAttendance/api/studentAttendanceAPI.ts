import axiosInstance from "@/lib/axiosInstance";
import type {
  AttendanceBatchCreateRequest,
  AttendanceManualLogRequest,
  AttendanceUpdateEvaluationRequest,
  AttendanceUpdateStatusRequest,
  StudentAttendanceResponse,
} from "@/types";

export const studentAttendanceAPI = {
  /** PATCH /{attendanceId}/status — Cập nhật trạng thái điểm danh */
  updateStatus: async (
    attendanceId: string,
    data: AttendanceUpdateStatusRequest,
  ): Promise<void> => {
    await axiosInstance.patch(
      `/student-attendance/${attendanceId}/status`,
      data,
    );
  },

  /** PATCH /{attendanceId}/evaluation — Cập nhật đánh giá */
  updateEvaluation: async (
    attendanceId: string,
    data: AttendanceUpdateEvaluationRequest,
  ): Promise<void> => {
    await axiosInstance.patch(
      `/student-attendance/${attendanceId}/evaluation`,
      data,
    );
  },

  /** POST / — Tạo bản ghi điểm danh thủ công cho 1 học viên */
  createRecord: async (
    data: AttendanceManualLogRequest,
  ): Promise<StudentAttendanceResponse> => {
    const response = await axiosInstance.post("/student-attendance", data);
    return response.data;
  },

  /** POST /batch-init — Khởi tạo danh sách điểm danh cho cả buổi học */
  batchInit: async (
    data: AttendanceBatchCreateRequest,
  ): Promise<StudentAttendanceResponse[]> => {
    const response = await axiosInstance.post(
      "/student-attendance/batch-init",
      data,
    );
    return response.data;
  },

  /** GET /filter — Lọc danh sách điểm danh theo lịch học và ngày */
  filter: async (
    classScheduleId: string,
    sessionDate: string,
  ): Promise<StudentAttendanceResponse[]> => {
    const response = await axiosInstance.get("/student-attendance/filter", {
      params: { classScheduleId, sessionDate },
    });
    return response.data;
  },
};
