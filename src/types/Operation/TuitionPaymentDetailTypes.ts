export interface TuitionPaymentDetailResponse {
  detailId: string;
  enrollmentId: string;
  scheduleId: string;
  forMonth: number;
  forYear: number;
  amountAllocated: number;
}

export interface TuitionStatusResponse {
  studentId: string;
  studentCode: string;
  fullName: string;
  hasPaidCurrentMonth: boolean;
  currentMonth: number;
  currentYear: number;
  activeClasses: ActiveClassStatus[];
}

export interface ActiveClassStatus {
  enrollmentId: string;
  scheduleId: string;
  paid: boolean;
  amountAllocated: number | null;
}
