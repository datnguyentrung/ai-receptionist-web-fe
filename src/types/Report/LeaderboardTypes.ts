import type { Belt } from "@/config/constants";
import type { QuarterSummary } from "@/types/Report/YearlySummaryTypes";

export interface LeaderboardResponse<T> {
  year: number;
  quarter: number;
  totalStudents: number;
  rankings: RankItem<T>[];
}

export interface RankItem<T> {
  rank: number;
  studentCode: string;
  fullName: string;
  belt: Belt;
  data: T;
  quarterSummary?: QuarterSummary;
}
