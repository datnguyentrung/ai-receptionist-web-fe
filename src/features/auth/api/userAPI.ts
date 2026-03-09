import axiosInstance from "@/lib/axiosInstance";
import type { UserResponse, ChangePasswordRequest, ApiResponse } from "@/types";

export const userAPI = {
  getUserInfo: async (): Promise<UserResponse> => {
    const response = await axiosInstance.get("/users/me");
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<string>> => {
    const response = await axiosInstance.post("/users/change-password", data);
    return response.data;
  },
};
