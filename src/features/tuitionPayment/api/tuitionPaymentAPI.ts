import type { PageResponse } from '@/types';
import type { TuitionPaymentResponse } from '@/types/Operation/TuitionPaymentTypes';

const mockTuitionPayments: TuitionPaymentResponse[] = [
  {
    paymentId: "PAY-2026-0001",
    student: {
      code: "HV001",
      fullName: "Nguyen Minh Anh",
      userId: "USER-001",
    },
    totalAmount: 2400000,
    note: "Thanh toan hoc phi thang 3-4",
    createdAt: "2026-03-04T09:15:00.000Z",
    details: [
      {
        detailId: "PAY-2026-0001-D1",
        enrollmentId: "ENR-001",
        scheduleId: "YOGA-A01",
        forMonth: 3,
        forYear: 2026,
        amountAllocated: 1200000,
      },
      {
        detailId: "PAY-2026-0001-D2",
        enrollmentId: "ENR-001",
        scheduleId: "YOGA-A01",
        forMonth: 4,
        forYear: 2026,
        amountAllocated: 1200000,
      },
    ],
  },
  {
    paymentId: "PAY-2026-0002",
    student: {
      code: "HV014",
      fullName: "Tran Quoc Bao",
      userId: "USER-014",
    },
    totalAmount: 1500000,
    note: null,
    createdAt: "2026-03-03T14:40:00.000Z",
    details: [
      {
        detailId: "PAY-2026-0002-D1",
        enrollmentId: "ENR-014",
        scheduleId: "BOX-B02",
        forMonth: 3,
        forYear: 2026,
        amountAllocated: 1500000,
      },
    ],
  },
  {
    paymentId: "PAY-2026-0003",
    student: {
      code: "HV027",
      fullName: "Le Hoang Linh",
      userId: "USER-027",
    },
    totalAmount: 3600000,
    note: "Dong truoc 3 thang",
    createdAt: "2026-03-02T08:05:00.000Z",
    details: [
      {
        detailId: "PAY-2026-0003-D1",
        enrollmentId: "ENR-027",
        scheduleId: "GYM-C03",
        forMonth: 3,
        forYear: 2026,
        amountAllocated: 1200000,
      },
      {
        detailId: "PAY-2026-0003-D2",
        enrollmentId: "ENR-027",
        scheduleId: "GYM-C03",
        forMonth: 4,
        forYear: 2026,
        amountAllocated: 1200000,
      },
      {
        detailId: "PAY-2026-0003-D3",
        enrollmentId: "ENR-027",
        scheduleId: "GYM-C03",
        forMonth: 5,
        forYear: 2026,
        amountAllocated: 1200000,
      },
    ],
  },
  {
    paymentId: "PAY-2026-0004",
    student: {
      code: "HV032",
      fullName: "Pham Gia Han",
      userId: "USER-032",
    },
    totalAmount: 900000,
    note: "Uu dai thanh vien moi",
    createdAt: "2026-03-01T11:20:00.000Z",
    details: [
      {
        detailId: "PAY-2026-0004-D1",
        enrollmentId: "ENR-032",
        scheduleId: "DANCE-D04",
        forMonth: 3,
        forYear: 2026,
        amountAllocated: 900000,
      },
    ],
  },
  {
    paymentId: "PAY-2026-0005",
    student: {
      code: "HV041",
      fullName: "Do Thanh Tung",
      userId: "USER-041",
    },
    totalAmount: 1800000,
    note: "Thanh toan chuyen khoan",
    createdAt: "2026-02-28T16:30:00.000Z",
    details: [
      {
        detailId: "PAY-2026-0005-D1",
        enrollmentId: "ENR-041",
        scheduleId: "SWIM-E05",
        forMonth: 2,
        forYear: 2026,
        amountAllocated: 900000,
      },
      {
        detailId: "PAY-2026-0005-D2",
        enrollmentId: "ENR-041",
        scheduleId: "SWIM-E05",
        forMonth: 3,
        forYear: 2026,
        amountAllocated: 900000,
      },
    ],
  },
];

const mockTuitionPaymentPage: PageResponse<TuitionPaymentResponse> = {
  content: mockTuitionPayments,
  empty: mockTuitionPayments.length === 0,
  first: true,
  last: true,
  number: 0,
  size: mockTuitionPayments.length,
  sort: {
    empty: true,
    sorted: false,
    unsorted: true,
  },
  totalElements: mockTuitionPayments.length,
  totalPages: 1,
};

export const tuitionPaymentAPI = {
  getAllPaymentsForAdmin: async (): Promise<PageResponse<TuitionPaymentResponse>> => {
    return Promise.resolve(mockTuitionPaymentPage);
  }
};
