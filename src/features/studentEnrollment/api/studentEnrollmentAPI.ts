import { javaApi } from "@/lib/axiosInstance";
import type {
  StudentEnrollmentCreateRequest,
  StudentEnrollmentUpdateRequest,
  StudentEnrollmentResponse,
  StudentEnrollmentSimpleResponse,
  EnrollmentsByScheduleResponse,
} from "@/types";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const studentEnrollmentAPI = {
  createStudentEnrollment: async (
    data: StudentEnrollmentCreateRequest,
  ): Promise<StudentEnrollmentResponse[]> => {
    const response = await javaApi.post("/student-enrollments", data);
    return response.data;
  },

  updateStudentEnrollment: async (
    enrollmentId: string,
    data: StudentEnrollmentUpdateRequest,
  ): Promise<StudentEnrollmentResponse> => {
    const response = await javaApi.put(
      `/student-enrollments/${enrollmentId}`,
      data,
    );
    return response.data;
  },

  deleteStudentEnrollment: async (enrollmentId: string): Promise<void> => {
    if (!UUID_REGEX.test(enrollmentId)) {
      throw new Error("Invalid student enrollment id.");
    }

    await javaApi.delete(
      `/student-enrollments/${encodeURIComponent(enrollmentId)}`,
    );
  },

  getStudentEnrollmentsByStudentCode: async (
    studentCode: string,
  ): Promise<StudentEnrollmentSimpleResponse[]> => {
    const response = await javaApi.get(
      `/student-enrollments/student/${studentCode}`,
    );
    return response.data;
  },

  getDetailedStudentEnrollmentsByStudentCode: async (
    studentCode: string,
  ): Promise<StudentEnrollmentResponse[]> => {
    const response = await javaApi.get(
      `/student-enrollments/student/${studentCode}/detailed`,
    );
    return response.data;
  },

  getStudentEnrollmentsByClassScheduleId: async (
    classScheduleId: string,
  ): Promise<EnrollmentsByScheduleResponse> => {
    const response = await javaApi.get(
      `/student-enrollments/class-schedule/${classScheduleId}`,
    );
    return response.data;
  },
};
