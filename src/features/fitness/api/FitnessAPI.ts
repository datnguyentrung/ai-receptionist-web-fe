import type { SkillLevel } from "../../../config/constants/SkillEnums";
import { javaApi } from "../../../lib/axiosInstance";
import type { Fitness } from "../../../types/Core/FitnessTypes";

export const fitnessAPI = {
  getFitnessBySkillLevel: async (skillLevel: SkillLevel): Promise<Fitness[]> => {
    // Mock API call - replace with actual API integration
    const response = await javaApi.get(`/fitness`, {
      params: {
        skillLevel,
      },
    });
    return response.data;
  },
};
