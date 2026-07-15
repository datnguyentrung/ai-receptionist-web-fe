import { tuitionPaymentAPI } from "@/features/tuitionPayment";
import type { TuitionPaymentResponse } from "@/types/Operation/TuitionPaymentTypes";
import type { PageResponse } from "@/types";
import type { QueryClient } from "@tanstack/react-query";

export const dashboardTuitionPaymentsQueryKey = [
  "dashboard",
  "tuition-payments",
] as const;

export function getDashboardTuitionPayments() {
  return tuitionPaymentAPI.getAllPaymentsForAdmin();
}

export function prefetchDashboard(queryClient: QueryClient) {
  void import("@/pages/Dashboard");
  void queryClient.prefetchQuery<PageResponse<TuitionPaymentResponse>>({
    queryKey: dashboardTuitionPaymentsQueryKey,
    queryFn: getDashboardTuitionPayments,
  });
}
