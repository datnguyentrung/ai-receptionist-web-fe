import { javaApi } from "@/lib/axiosInstance";

import type { StudentStatus } from "@/config/constants";
import type {
  StudentCreateRequest,
  StudentDetail,
  StudentListResponse,
  StudentUpdateRequest,
} from "@/types";

export const studentAPI = {
  getStudents: async ({
    search,
    status,
    page,
    size,
    sortBy,
    sortDir,
  }: {
    search?: string;
    status?: StudentStatus;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
  }): Promise<StudentListResponse> => {
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
        page,
        size,
        sortBy,
        sortDir,
      },
    });
    // console.log("Fetched students:", response.data); // Debug log
    return response.data;
  },

  getStudentById: async (id: string): Promise<StudentDetail> => {
    const response = await javaApi.get(`/students/${id}`);
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
};
