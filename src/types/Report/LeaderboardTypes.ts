import type { Belt } from "@/config/constants";

export interface LeaderboardResponse<T> {
  year: number;
  quarter: number;
  totalStudents: number;
  rankings: RankItem<T>[];
}

export interface RankItem<T> {
  rank: number;
  rankBefore: number | null;
  studentCode: string;
  fullName: string;
  belt: Belt;
  data: T;
}
