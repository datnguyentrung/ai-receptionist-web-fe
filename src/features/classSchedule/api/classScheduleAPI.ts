import { javaApi } from "@/lib/axiosInstance";

import type {
  ClassScheduleCreateRequest,
  ClassScheduleDetail,
  ClassScheduleUpdateRequest,
  GetClassSchedulesParams,
} from "@/types";

export const classScheduleAPI = {
  getAllClassSchedules: async ({
    branchId,
    scheduleLevel,
    scheduleLocation,
    scheduleShift,
    scheduleStatus,
    weekday,
    scheduleIds,
  }: GetClassSchedulesParams): Promise<
    ClassScheduleDetail[]
  > => {
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
    return response.data;
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

  deleteClassSchedule: async (id: string): Promise<void> => {
    await javaApi.delete(`/class-schedules/${id}`);
  },
};
