import axiosInstance from "@/lib/axiosInstance";

import type {
  StudentCreateRequest,
  StudentDetail,
  StudentUpdateRequest,
} from "@/types";
import type { StudentStatus } from '../../../config/constants';

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
  }): Promise<StudentDetail[]> => {
    const response = await axiosInstance.get("/students", {
      params: {
        search,
        status,
        page,
        size,
        sortBy,
        sortDir,
      },
    });
    console.log("Fetched students:", response.data); // Debug log
    return response.data;
  },

  getStudentById: async (id: string): Promise<StudentDetail> => {
    const response = await axiosInstance.get(`/students/${id}`);
    return response.data;
  },

  createStudent: async (
    studentData: StudentCreateRequest,
  ): Promise<StudentDetail> => {
    const response = await axiosInstance.post("/students", studentData);
    return response.data;
  },

  updateStudent: async (
    id: number,
    studentData: StudentUpdateRequest,
  ): Promise<StudentDetail> => {
    const response = await axiosInstance.put(`/students/${id}`, studentData);
    return response.data;
  },

  deleteStudent: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/students/${id}`);
  },
};
