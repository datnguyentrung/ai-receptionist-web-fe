import { javaApi } from "@/lib/axiosInstance";
import type { FaceCheckInResponse } from "@/types";

export const personAPI = {
  faceCheckIn: async (
    formData: FormData,
    signal?: AbortSignal,
  ): Promise<FaceCheckInResponse> => {
    const response = await javaApi.post<FaceCheckInResponse>(
      "/persons/face-check-in",
      formData,
      {
        signal,
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    return response.data;
  },
};
