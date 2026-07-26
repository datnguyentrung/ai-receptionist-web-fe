import { javaApi } from "@/lib/axiosInstance";
import { ensurePageResponse } from "@/lib/runtimeGuards";
import type {
  CoachTimesheetAdjustRequest,
  CoachTimesheetCheckInRequest,
  CoachTimesheetFilterRequest,
  CoachTimesheetListResponse,
  CoachTimesheetResponse,
  CoachTimesheetSummaryResponse,
} from "@/types";

export interface CoachTimesheetListParams extends CoachTimesheetFilterRequest {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface CoachTimesheetMyListParams {
  fromDate?: string;
  toDate?: string;
  month?: number;
  year?: number;
  page?: number;
  size?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function ensureCoachTimesheetSummary(
  value: unknown,
): CoachTimesheetSummaryResponse {
  if (isRecord(value)) {
    return {
      totalRecords:
        typeof value.totalRecords === "number" ? value.totalRecords : 0,
      totalTeachingSessions:
        typeof value.totalTeachingSessions === "number"
          ? value.totalTeachingSessions
          : 0,
    };
  }

  return {
    totalRecords: 0,
    totalTeachingSessions: 0,
  };
}

function ensureCoachTimesheetListResponse(
  value: unknown,
  context: string,
): CoachTimesheetListResponse {
  if (isRecord(value)) {
    const pageSource =
      isRecord(value.timesheets) && Array.isArray(value.timesheets.content)
        ? value.timesheets
        : Array.isArray(value.content)
          ? value
          : value.timesheets;

    return {
      summary: ensureCoachTimesheetSummary(value.summary),
      timesheets: ensurePageResponse<CoachTimesheetResponse>(
        pageSource,
        `${context}.timesheets`,
      ),
    };
  }

  return {
    summary: ensureCoachTimesheetSummary(undefined),
    timesheets: ensurePageResponse<CoachTimesheetResponse>(
      undefined,
      `${context}.timesheets`,
    ),
  };
}

export const coachTimesheetAPI = {
  checkIn: async (
    request: CoachTimesheetCheckInRequest,
  ): Promise<CoachTimesheetResponse> => {
    const response = await javaApi.post("/coach-timesheets/check-in", request);
    return response.data as CoachTimesheetResponse;
  },

  getTimesheetById: async (
    timesheetId: string,
  ): Promise<CoachTimesheetResponse> => {
    const response = await javaApi.get(`/coach-timesheets/${timesheetId}`);
    return response.data as CoachTimesheetResponse;
  },

  getTimesheetsByFilter: async (
    params: CoachTimesheetListParams = {},
  ): Promise<CoachTimesheetListResponse> => {
    const { page, size, sortBy, sortDir, ...filters } = params;

    const response = await javaApi.get("/coach-timesheets", {
      params: {
        ...filters,
        page,
        size,
        sortBy,
        sortDir,
      },
    });

    return ensureCoachTimesheetListResponse(
      response.data,
      "coachTimesheetAPI.getTimesheetsByFilter",
    );
  },

  getMyTimesheets: async (
    params: CoachTimesheetMyListParams = {},
  ): Promise<CoachTimesheetListResponse> => {
    const response = await javaApi.get("/coach-timesheets/me", {
      params,
    });

    return ensureCoachTimesheetListResponse(
      response.data,
      "coachTimesheetAPI.getMyTimesheets",
    );
  },

  adjustTimesheet: async (
    timesheetId: string,
    request: CoachTimesheetAdjustRequest,
  ): Promise<CoachTimesheetResponse> => {
    const response = await javaApi.patch(
      `/coach-timesheets/${timesheetId}`,
      request,
    );
    return response.data as CoachTimesheetResponse;
  },

  deleteTimesheet: async (timesheetId: string): Promise<void> => {
    await javaApi.delete(`/coach-timesheets/${timesheetId}`);
  },
};
