import { javaApi } from "@/lib/axiosInstance";
import type { LeaderboardResponse } from "@/types/Report/LeaderboardTypes";
import type { QuarterSummary } from "@/types/Report/YearlySummaryTypes";
import type { FitnessMetrics } from '../../../types/Skill/FitnessRecordTypes';
import type { SkillLevel } from '../../../config/constants/SkillEnums';

export const leaderboardAPI = {
  getQuarterScoreLeaderboard: async (
    year: number,
    quarter: number,
    page?: number,
    size?: number,
  ): Promise<LeaderboardResponse<QuarterSummary>> => {
    const response = await javaApi.get(`/leaderboards/quarter`, {
      params: {
        year,
        quarter,
        page,
        size,
      },
    });
    return response.data;
  },

  getQuarterFitnessLeaderboard: async (
    year: number,
    quarter: number,
    skillLevel: SkillLevel,
    page?: number,
    size?: number,
  ): Promise<LeaderboardResponse<FitnessMetrics>> => {
    const response = await javaApi.get(`/leaderboards/quarter/fitness`, {
      params: {
        year,
        quarter,
        skillLevel,
        page,
        size,
      },
    });
    return response.data;
  }
};
