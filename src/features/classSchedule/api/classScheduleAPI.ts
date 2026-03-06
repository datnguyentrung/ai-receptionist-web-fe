import axiosInstance from "@/lib/axiosInstance";

import type {
  ClassScheduleCreateRequest,
  ClassScheduleDetail,
  ClassScheduleUpdateRequest,
} from "@/types";

export const classScheduleAPI = {
  getAllClassSchedules: async (): Promise<ClassScheduleDetail[]> => {
    const response = await axiosInstance.get("/class-schedules");
    return response.data;
  },

  getClassScheduleById: async (id: number): Promise<ClassScheduleDetail> => {
    const response = await axiosInstance.get(`/class-schedules/${id}`);
    return response.data;
  },

  createClassSchedule: async (
    classSchedule: ClassScheduleCreateRequest,
  ): Promise<ClassScheduleDetail> => {
    const response = await axiosInstance.post(
      "/class-schedules",
      classSchedule,
    );
    return response.data;
  },

  updateClassSchedule: async (
    id: string,
    classSchedule: ClassScheduleUpdateRequest,
  ): Promise<ClassScheduleDetail> => {
    const response = await axiosInstance.put(
      `/class-schedules/${id}`,
      classSchedule,
    );
    return response.data;
  },

  deleteClassSchedule: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/class-schedules/${id}`);
  },
};
