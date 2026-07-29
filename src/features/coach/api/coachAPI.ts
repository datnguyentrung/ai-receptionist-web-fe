import { javaApi } from "@/lib/axiosInstance";
import { toMultipartFormData } from "@/lib/multipart";

import type {
  CoachCreateRequest,
  CoachDetail,
  CoachUpdateRequest,
} from "@/types";

export const coachAPI = {
  getAllCoaches: async (): Promise<CoachDetail[]> => {
    const response = await javaApi.get("/coaches");
    console.log("Fetched coaches:", response.data); // Debug log
    return response.data;
  },

  getCoachByStaffCode: async (staffCode: string): Promise<CoachDetail> => {
    const response = await javaApi.get(`/coaches/${staffCode}`);
    return response.data;
  },

  createCoach: async (
    coachData: CoachCreateRequest,
    imageFile?: File | null,
  ): Promise<CoachDetail> => {
    const response = await javaApi.post(
      "/coaches",
      toMultipartFormData(coachData, imageFile),
    );
    return response.data;
  },

  updateCoach: async (
    personId: string,
    coachData: CoachUpdateRequest,
    imageFile?: File | null,
  ): Promise<CoachDetail> => {
    const response = await javaApi.put(
      `/coaches/${personId}`,
      toMultipartFormData(coachData, imageFile),
    );
    return response.data;
  },

  deleteCoach: async (id: number): Promise<void> => {
    await javaApi.delete(`/coaches/${id}`);
  },
};
