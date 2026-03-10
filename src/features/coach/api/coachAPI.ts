import { javaApi } from "@/lib/axiosInstance";

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

  getCoachById: async (id: number): Promise<CoachDetail> => {
    const response = await javaApi.get(`/coaches/${id}`);
    return response.data;
  },

  createCoach: async (coachData: CoachCreateRequest): Promise<CoachDetail> => {
    const response = await javaApi.post("/coaches", coachData);
    return response.data;
  },

  updateCoach: async (
    id: number,
    coachData: CoachUpdateRequest,
  ): Promise<CoachDetail> => {
    const response = await javaApi.put(`/coaches/${id}`, coachData);
    return response.data;
  },

  deleteCoach: async (id: number): Promise<void> => {
    await javaApi.delete(`/coaches/${id}`);
  },
};
