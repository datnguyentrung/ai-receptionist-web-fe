import { javaApi } from "@/lib/axiosInstance";
import type {
  CoachAssignmentCreateRequest,
  CoachAssignmentResponse,
  CoachAssignmentSimpleResponse,
} from "@/types";

export const coachAssignmentAPI = {
  getAssignmentsByCoachId: async (
    coachId: string,
  ): Promise<CoachAssignmentResponse[]> => {
    const response = await javaApi.get(`/coach-assignments/coach/${coachId}`);
    return response.data;
  },

  createCoachAssignment: async (
    request: CoachAssignmentCreateRequest,
  ): Promise<CoachAssignmentSimpleResponse[]> => {
    const response = await javaApi.post("/coach-assignments", request);
    return response.data;
  },
};
