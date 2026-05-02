import type { Belt } from '../../config/constants';
import type { QuarterSummary } from './YearlySummaryTypes';

export interface LeaderboardResponse {
  year: number;
  quarter: number;
  totalStudents: number;
  rankings: RankItem[];
}

export interface RankItem {
  rank: number;
  studentCode: string;
  fullName: string;
  belt: Belt;
  quarterSummary: QuarterSummary;
}
