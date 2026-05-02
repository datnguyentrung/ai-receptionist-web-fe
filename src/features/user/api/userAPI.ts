import { javaApi } from "@/lib/axiosInstance";
import type { ApiResponse, ChangePasswordRequest, UserResponse } from "@/types";

export const userAPI = {
  getUserInfo: async (accessToken?: string): Promise<UserResponse[]> => {
    const response = await javaApi.get("/users/me", {
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
    });
    console.log("User info response:", response.data);
    return response.data;
  },

  changePassword: async (
    data: ChangePasswordRequest,
  ): Promise<ApiResponse<string>> => {
    const response = await javaApi.post("/users/change-password", data);
    return response.data;
  },
};
