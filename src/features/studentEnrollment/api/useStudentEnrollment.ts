import type {
  StudentEnrollmentCreateRequest,
  StudentEnrollmentUpdateRequest,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentEnrollmentAPI } from "./studentEnrollmentAPI";

const ENROLLMENT_QUERY_KEY = "student-enrollments";

// 1. Hook lấy danh sách đăng ký (đơn giản) theo mã học viên
export const useGetStudentEnrollmentsByStudentCode = (studentCode: string) => {
  return useQuery({
    queryKey: [ENROLLMENT_QUERY_KEY, "student", studentCode],
    queryFn: () =>
      studentEnrollmentAPI.getStudentEnrollmentsByStudentCode(studentCode),
    enabled: !!studentCode,
  });
};

// 2. Hook lấy danh sách đăng ký (chi tiết) theo mã học viên
export const useGetDetailedStudentEnrollmentsByStudentCode = (
  studentCode: string,
) => {
  return useQuery({
    queryKey: [ENROLLMENT_QUERY_KEY, "student", studentCode, "detailed"],
    queryFn: () =>
      studentEnrollmentAPI.getDetailedStudentEnrollmentsByStudentCode(
        studentCode,
      ),
    enabled: !!studentCode,
  });
};

// 3. Hook lấy danh sách đăng ký theo ID lịch học
export const useGetStudentEnrollmentsByClassScheduleId = (
  classScheduleId: string,
) => {
  return useQuery({
    queryKey: [ENROLLMENT_QUERY_KEY, "class-schedule", classScheduleId],
    queryFn: () =>
      studentEnrollmentAPI.getStudentEnrollmentsByClassScheduleId(
        classScheduleId,
      ),
    enabled: !!classScheduleId,
  });
};

// 4. Hook tạo mới đăng ký học viên vào lớp
export const useCreateStudentEnrollment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StudentEnrollmentCreateRequest) =>
      studentEnrollmentAPI.createStudentEnrollment(data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: [ENROLLMENT_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: ["students", variables.studentId],
      });
    },
  });
};

// 5. Hook cập nhật trạng thái đăng ký (status, leaveDate, joinDate, note)
export const useUpdateStudentEnrollment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      enrollmentId,
      data,
    }: {
      enrollmentId: string;
      data: StudentEnrollmentUpdateRequest;
    }) => studentEnrollmentAPI.updateStudentEnrollment(enrollmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ENROLLMENT_QUERY_KEY] });
    },
  });
};

// 6. Hook xóa đăng ký
export const useDeleteStudentEnrollment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: string) =>
      studentEnrollmentAPI.deleteStudentEnrollment(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ENROLLMENT_QUERY_KEY] });
    },
  });
};
