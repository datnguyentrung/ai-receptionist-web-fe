import { javaApi, pythonApi } from "@/lib/axiosInstance";
import { ensureStudentListResponse } from "@/lib/runtimeGuards";

import type {
  CheckInResponse,
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
  ): Promise<StudentDetail> => {
    const response = await javaApi.post("/students", studentData);
    return response.data;
  },

  updateStudent: async (
    id: number,
    studentData: StudentUpdateRequest,
  ): Promise<StudentDetail> => {
    const response = await javaApi.put(`/students/${id}`, studentData);
    return response.data;
  },

  deleteStudent: async (id: number): Promise<void> => {
    await javaApi.delete(`/students/${id}`);
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

  face_check_in: async (
    formData: FormData,
    signal?: AbortSignal,
  ): Promise<CheckInResponse> => {
    const response = await pythonApi.post("/students/check-in", formData, {
      signal,
    });
    console.log("response:", response.data);
    return response.data;
  },
};
