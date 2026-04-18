import { javaApi } from "@/lib/axiosInstance";
import { ensureArray } from "@/lib/runtimeGuards";

import type {
  ClassScheduleCreateRequest,
  ClassScheduleDetail,
  ClassScheduleUpdateRequest,
  GetClassSchedulesParams,
} from "@/types";
import type { ScheduleStatus } from "../../../config/constants";

export const classScheduleAPI = {
  getAllClassSchedules: async ({
    branchId,
    scheduleLevel,
    scheduleLocation,
    scheduleShift,
    scheduleStatus,
    weekday,
    scheduleIds,
  }: GetClassSchedulesParams): Promise<ClassScheduleDetail[]> => {
    const response = await javaApi.get("/class-schedules", {
      params: {
        branchId,
        scheduleLevel,
        scheduleLocation,
        scheduleShift,
        scheduleStatus,
        weekday,
        scheduleIds,
      },
    });
    return ensureArray<ClassScheduleDetail>(
      response.data,
      "classScheduleAPI.getAllClassSchedules",
    );
  },

  getClassScheduleById: async (id: number): Promise<ClassScheduleDetail> => {
    const response = await javaApi.get(`/class-schedules/${id}`);
    return response.data;
  },

  createClassSchedule: async (
    classSchedule: ClassScheduleCreateRequest,
  ): Promise<ClassScheduleDetail> => {
    const response = await javaApi.post("/class-schedules", classSchedule);
    return response.data;
  },

  updateClassSchedule: async (
    id: string,
    classSchedule: ClassScheduleUpdateRequest,
  ): Promise<ClassScheduleDetail> => {
    const response = await javaApi.put(`/class-schedules/${id}`, classSchedule);
    return response.data;
  },

  changeClassScheduleStatus: async (
    id: string,
    newStatus: ScheduleStatus,
  ): Promise<void> => {
    // Đổi kiểu trả về thành void
    await javaApi.patch(
      `/class-schedules/${id}/status`,
      null, // <--- THAM SỐ THỨ 2: Data/Body (để là null)
      { params: { status: newStatus } }, // <--- THAM SỐ THỨ 3: Config (chứa params để tạo URL ?status=...)
    );
  },

  deleteClassSchedule: async (id: string): Promise<void> => {
    await javaApi.delete(`/class-schedules/${id}`);
  },
};
