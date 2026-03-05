import type { StudentCreateRequest, StudentUpdateRequest } from "@/types";
import type { GetStudentsParams } from "@/types/Core/StudentTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentAPI } from "./studentAPI";

const STUDENT_QUERY_KEY = "students";

// 1. Hook lấy danh sách HỌC VIÊN (CÓ ĐÍNH KÈM PARAMS)
export const useGetStudents = (params: GetStudentsParams) => {
  return useQuery({
    // Cực kỳ quan trọng: Nhét params vào queryKey
    // Khi params thay đổi (vd: page từ 1 sang 2), React Query sẽ tự động gọi lại API
    queryKey: [STUDENT_QUERY_KEY, params],
    queryFn: () => studentAPI.getStudents(params),
  });
};

// 2. Hook lấy chi tiết 1 Học viên
export const useGetStudentById = (id: string) => {
  return useQuery({
    queryKey: [STUDENT_QUERY_KEY, id],
    queryFn: () => studentAPI.getStudentById(id),
    enabled: !!id, // Chỉ gọi API khi id tồn tại
  });
};

// 3. Hook tạo mới Học viên
export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StudentCreateRequest) => studentAPI.createStudent(data),
    onSuccess: () => {
      // Báo cho React Query biết danh sách đã cũ, hãy fetch lại đi!
      queryClient.invalidateQueries({ queryKey: [STUDENT_QUERY_KEY] });
    },
  });
};

// 4. Hook cập nhật Học viên
export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: StudentUpdateRequest }) =>
      studentAPI.updateStudent(id, data),
    onSuccess: (_result, variables) => {
      // Cập nhật xong thì refetch lại danh sách tổng VÀ cả chi tiết của chính thằng đó
      queryClient.invalidateQueries({ queryKey: [STUDENT_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [STUDENT_QUERY_KEY, variables.id.toString()],
      });
    },
  });
};

// 5. Hook xóa Học viên
export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => studentAPI.deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDENT_QUERY_KEY] });
    },
  });
};
