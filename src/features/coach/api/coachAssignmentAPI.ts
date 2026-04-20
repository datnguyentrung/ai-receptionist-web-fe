import { javaApi } from "@/lib/axiosInstance";
import type { CoachAssignmentResponse } from "@/types";

export const coachAssignmentAPI = {
  getAssignmentsByCoachId: async (
    coachId: string,
  ): Promise<CoachAssignmentResponse[]> => {
    const response = await javaApi.get(`/coach-assignments/coach/${coachId}`);
    return response.data;
  },
};
