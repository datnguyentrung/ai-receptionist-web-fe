// File: src/features/auth/api/authApi.ts
import axiosInstance from "@/lib/axiosInstance";
import type { LoginResponse, UserBase, UserLogin } from "@/types";

export const authApi = {
  login: async (loginReq: UserBase): Promise<LoginResponse> => {
    // Trả về data luôn, code siêu ngắn
    const response = await axiosInstance.post("/auth/login", { loginReq });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post("/auth/logout");
    // Lưu ý: Việc xóa localStorage nên để ở tầng Hook hoặc Store, không nên để ở file API thuần này.
  },

  getAccount: async (): Promise<UserLogin> => {
    const response = await axiosInstance.get("/auth/account");
    return response.data;
  },

  refreshToken: async (): Promise<LoginResponse> => {
    const response = await axiosInstance.post("/auth/refresh");
    return response.data;
  },
};
