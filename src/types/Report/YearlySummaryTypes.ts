import type { ExamEligibility } from '../../config/constants';
import type { AttendanceStats } from '../Operation/StudentAttendanceTypes';

export interface QuarterSummary {
  quarterNumber: number; // Số thứ tự quý (1, 2, 3, 4)
  attendanceStats: AttendanceStats; // Thống kê chuyên cần
  bonusDetails?: unknown[]; // Chi tiết điểm thưởng (nếu có)

  attendanceScore: number; // Điểm chuyên cần (Tối đa 5, có thể âm)
  performanceScore: number; // Tổng điểm chuyên môn
  bonusScore?: number; // Điểm thưởng
  totalQuarterScore: number; // Điểm tổng quý = Chuyên cần + Chuyên môn + Thưởng

  eligibility: ExamEligibility
}

export interface YearlySummaryResponse {
  year: number;
  quarters: QuarterSummary[];
}
