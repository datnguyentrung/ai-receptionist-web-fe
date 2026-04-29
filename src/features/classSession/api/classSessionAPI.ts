import { javaApi } from "@/lib/axiosInstance";
import type {
  PageResponse,
  SessionCreateRequest,
  SessionFilterParams,
  SessionResponse,
  SessionUpdateRequest,
} from "@/types";
// import type { PageResponse } from '@/types';
import { ensurePageResponse } from "@/lib/runtimeGuards";

export const classSessionAPI = {
  /** GET /class-sessions/{sessionId} — Lấy thông tin một buổi học */
  getSessionById: async (sessionId: string): Promise<SessionResponse> => {
    const response = await javaApi.get(`/class-sessions/${sessionId}`);
    return response.data as SessionResponse;
  },

  getSessionsByFilter: async (
    params: SessionFilterParams,
  ): Promise<PageResponse<SessionResponse>> => {
    const response = await javaApi.get("/class-sessions", { params });

    // Sử dụng generic guard đã có sẵn
    return ensurePageResponse<SessionResponse>(
      response.data,
      "classSessionAPI.getSessionsByFilter",
    );
  },

  /** POST / — Tạo buổi học mới */
  createSession: async (
    data: SessionCreateRequest,
  ): Promise<SessionResponse> => {
    const response = await javaApi.post("/class-sessions", data);
    return response.data as SessionResponse;
  },

  /** PUT /{sessionId} — Cập nhật thông tin buổi học */
  updateSession: async (
    data: SessionUpdateRequest,
  ): Promise<SessionResponse> => {
    const response = await javaApi.put(
      `/class-sessions/${data.sessionId}`,
      data,
    );
    return response.data as SessionResponse;
  },

  /** DELETE /{sessionId} — Xóa buổi học */
  deleteSession: async (sessionId: string): Promise<void> => {
    await javaApi.delete(`/class-sessions/${sessionId}`);
  },
};
