import axiosInstance from "@/lib/axiosInstance";
import type {
  StudentEnrollmentCreateRequest,
  StudentEnrollmentUpdateRequest,
  StudentEnrollmentResponse,
  StudentEnrollmentSimpleResponse,
} from "@/types";


export const studentEnrollmentAPI = {
  createStudentEnrollment: async (
    data: StudentEnrollmentCreateRequest,
  ): Promise<StudentEnrollmentResponse> => {
    const response = await axiosInstance.post("/student-enrollments", data);
    return response.data;
  },

  updateStudentEnrollment: async (
    enrollmentId: string,
    data: StudentEnrollmentUpdateRequest,
  ): Promise<StudentEnrollmentResponse> => {
    const response = await axiosInstance.put(
      `/student-enrollments/${enrollmentId}`,
      data,
    );
    return response.data;
  },

  deleteStudentEnrollment: async (enrollmentId: string): Promise<void> => {
    await axiosInstance.delete(`/student-enrollments/${enrollmentId}`);
  },

  getStudentEnrollmentsByStudentCode: async (
    studentCode: string,
  ): Promise<StudentEnrollmentSimpleResponse[]> => {
    const response = await axiosInstance.get(
      `/student-enrollments/student/${studentCode}`,
    );
    return response.data;
  },

  getDetailedStudentEnrollmentsByStudentCode: async (
    studentCode: string,
  ): Promise<StudentEnrollmentResponse[]> => {
    const response = await axiosInstance.get(
      `/student-enrollments/student/${studentCode}/detailed`,
    );
    return response.data;
  },

  getStudentEnrollmentsByClassScheduleId: async (
    classScheduleId: string,
  ): Promise<StudentEnrollmentSimpleResponse[]> => {
    const response = await axiosInstance.get(
      `/student-enrollments/class-schedule/${classScheduleId}`,
    );
    return response.data;
  },
};
