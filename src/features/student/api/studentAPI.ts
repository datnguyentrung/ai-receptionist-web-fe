import { javaApi } from "@/lib/axiosInstance";
import { ensureStudentListResponse } from "@/lib/runtimeGuards";
import { toMultipartFormData } from "@/lib/multipart";

import type {
  GetStudentsParams,
  StudentCreateRequest,
  StudentDetail,
  StudentListResponse,
  StudentUpdateRequest,
} from "@/types";
import type { YearlySummaryResponse } from "@/types/Report/YearlySummaryTypes";

export const studentAPI = {
  getStudents: async ({
    search,
    status,
    scheduleIds,
    belts,
    page,
    size,
    sortBy,
    sortDir,
  }: GetStudentsParams): Promise<StudentListResponse> => {
    // console.log("Fetching students with params:", {
    //   search,
    //   status,
    //   page,
    //   size,
    //   sortBy,
    //   sortDir,
    // }); // Debug log

    // console.log("search: ", search);
    const response = await javaApi.get("/students", {
      params: {
        search,
        status,
        scheduleIds,
        belts,
        page,
        size,
        sortBy,
        sortDir,
      },
    });
    // console.log("Fetched students:", response.data); // Debug log
    return ensureStudentListResponse(response.data, "studentAPI.getStudents");
  },

  getStudentByStudentCode: async (
    studentCode: string,
  ): Promise<StudentDetail> => {
    const response = await javaApi.get(`/students/${studentCode}`);
    return response.data;
  },

  createStudent: async (
    studentData: StudentCreateRequest,
    imageFile?: File | null,
  ): Promise<StudentDetail> => {
    const response = await javaApi.post(
      "/students",
      toMultipartFormData(studentData, imageFile),
    );
    return response.data;
  },

  updateStudent: async (
    personId: string,
    studentData: StudentUpdateRequest,
    imageFile?: File | null,
  ): Promise<StudentDetail> => {
    const response = await javaApi.put(
      `/students/${personId}`,
      toMultipartFormData(studentData, imageFile),
    );
    return response.data;
  },

  deleteStudent: async (id: string | number): Promise<void> => {
    await javaApi.delete(`/students/${id}`);
  },

  permanentlyDeleteStudent: async (id: string | number): Promise<void> => {
    await javaApi.delete(`/students/${id}/permanent`);
  },

  getYearlySummary: async (
    studentCode: string,
    year: number,
  ): Promise<YearlySummaryResponse> => {
    const response = await javaApi.get(
      `/students/${studentCode}/yearly-summary?year=${year}`,
    );
    return response.data;
  },

};
