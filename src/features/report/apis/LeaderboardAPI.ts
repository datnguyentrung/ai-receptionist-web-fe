import { javaApi } from "@/lib/axiosInstance";
import type { LeaderboardResponse } from "@/types/Report/LeaderboardTypes";

export const leaderboardAPI = {
  getQuarterLeaderboard: async (
    year: number,
    quarter: number,
    page?: number,
    size?: number,
  ): Promise<LeaderboardResponse> => {
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
};
