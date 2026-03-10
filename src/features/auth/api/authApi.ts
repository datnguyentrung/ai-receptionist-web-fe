import { javaApi } from "@/lib/axiosInstance";
import type { LoginResponse, UserBase, UserLogin } from "@/types";

export const authApi = {
  login: async (loginReq: UserBase): Promise<LoginResponse> => {
    // Trả về data luôn, code siêu ngắn
    console.log("Gọi API login với dữ liệu:", loginReq);
    const response = await javaApi.post("/auth/login", loginReq);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await javaApi.post("/auth/logout");
    // Lưu ý: Việc xóa localStorage nên để ở tầng Hook hoặc Store, không nên để ở file API thuần này.
  },

  getAccount: async (): Promise<UserLogin> => {
    const response = await javaApi.get("/auth/account");
    return response.data;
  },

  refreshToken: async (): Promise<LoginResponse> => {
    const response = await javaApi.post("/auth/refresh");
    return response.data;
  },
};
