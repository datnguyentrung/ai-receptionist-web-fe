import type { DashboardData, DashboardRequest } from "@/types/dashboard";
import { buildDashboardMockData } from "../mocks/dashboardMock";

const MOCK_LATENCY_MS = 180;

export const dashboardApi = {
  async getDashboard(request: DashboardRequest): Promise<DashboardData> {
    // TODO: Replace this mock-backed boundary with the backend dashboard aggregate API.
    await new Promise((resolve) => window.setTimeout(resolve, MOCK_LATENCY_MS));
    return buildDashboardMockData(request.filters, request.scope);
  },
};
