import { javaApi, pythonApi } from "@/lib/axiosInstance";
import type { ApiResponse, ChangePasswordRequest, UserResponse } from "@/types";

export const userAPI = {
  getUserInfo: async (): Promise<UserResponse> => {
    const response = await javaApi.get("/users/me");
    return response.data;
  },

  changePassword: async (
    data: ChangePasswordRequest,
  ): Promise<ApiResponse<string>> => {
    const response = await javaApi.post("/users/change-password", data);
    return response.data;
  },

  face_check_in: async (
    formData: FormData,
    signal?: AbortSignal,
  ): Promise<UserResponse> => {
    const response = await pythonApi.post("/users/check-in", formData, {
      signal,
    });
    console.log("response:", response.data);
    return response.data;
  },
};
