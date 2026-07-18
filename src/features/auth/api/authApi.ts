import { javaApi } from "@/lib/axiosInstance";
import type {
  AuthResponse,
  AuthSession,
  LoginRequest,
  SwitchContextRequest,
  UserContext,
} from "@/types";

export const authApi = {
  login: async (loginReq: LoginRequest): Promise<AuthResponse> => {
    const response = await javaApi.post("/auth/login", loginReq);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await javaApi.post("/auth/logout");
    // Lưu ý: Việc xóa localStorage nên để ở tầng Hook hoặc Store, không nên để ở file API thuần này.
  },

  getAccount: async (): Promise<AuthResponse> => {
    const response = await javaApi.get("/auth/account");
    return response.data;
  },

  getContexts: async (): Promise<UserContext[]> => {
    const response = await javaApi.get("/auth/contexts");
    return response.data;
  },

  switchContext: async (
    data: SwitchContextRequest,
  ): Promise<AuthResponse> => {
    const response = await javaApi.post("/auth/switch-context", data);
    return response.data;
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await javaApi.post("/auth/refresh");
    return response.data;
  },

  logoutAll: async (): Promise<void> => {
    await javaApi.post("/auth/logout-all");
  },

  updateFcm: async (fcmToken: string): Promise<void> => {
    await javaApi.post("/auth/update-fcm", { fcmToken });
  },

  getSessions: async (): Promise<AuthSession[]> => {
    const response = await javaApi.get("/auth/sessions");
    return response.data;
  },
};
