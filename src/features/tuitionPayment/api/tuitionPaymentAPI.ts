import { javaApi } from "@/lib/axiosInstance";
import type { PageResponse } from '@/types';
import type { TuitionPaymentResponse } from '@/types/Operation/TuitionPaymentTypes';

export const tuitionPaymentAPI = {
  getAllPaymentsForAdmin: async () : Promise<PageResponse<TuitionPaymentResponse>> => {
    const response = await javaApi.get("/tuition-payments");
    return response.data;
  }
};
