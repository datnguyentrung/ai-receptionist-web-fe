import type { TuitionPaymentDetailResponse } from "./TuitionPaymentDetailTypes";

export interface TuitionPaymentStudentSummary {
  code: string;
  fullName: string;
  userId: string;
}

export interface ProcessPaymentRequest {
  studentId: string;
  enrollmentId: string;
  numberOfMonths: number;
  note?: string;
}

export interface TuitionPaymentResponse {
  paymentId: string;
  student: TuitionPaymentStudentSummary;
  totalAmount: number;
  note: string | null;
  /** Format: ISO 8601 UTC */
  createdAt: string;
  details: TuitionPaymentDetailResponse[];
}

export interface PaymentHistoryItem {
  forMonth: number;
  forYear: number;
  amountAllocated: number;
  className: string;
  /** Format: ISO 8601 UTC */
  paidAt: string;
}
