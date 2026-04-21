import type { CoachCreateRequest, CoachUpdateRequest } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { coachAPI } from "./coachAPI";

const COACH_QUERY_KEY = "coaches";

// 1. Hook lấy danh sách tất cả HLV
export const useGetAllCoaches = () => {
  return useQuery({
    queryKey: [COACH_QUERY_KEY],
    queryFn: coachAPI.getAllCoaches,
  });
};

// 2. Hook lấy thông tin chi tiết một HLV theo ID
export const useGetCoachByStaffCode = (staffCode: string) => {
  return useQuery({
    queryKey: [COACH_QUERY_KEY, staffCode],
    queryFn: () => coachAPI.getCoachByStaffCode(staffCode),
    enabled: !!staffCode,
    staleTime: 5 * 60 * 1000, // 5 phút
  });
};

// 3. Hook tạo mới HLV
export const useCreateCoach = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CoachCreateRequest) => coachAPI.createCoach(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COACH_QUERY_KEY] });
    },
  });
};

// 4. Hook cập nhật thông tin HLV
export const useUpdateCoach = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      id: number;
      staffCode?: string;
      data: CoachUpdateRequest;
    }) => coachAPI.updateCoach(variables.id, variables.data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: [COACH_QUERY_KEY] });
      if (variables.staffCode) {
        queryClient.invalidateQueries({
          queryKey: [COACH_QUERY_KEY, variables.staffCode],
        });
      }
    },
  });
};

// 5. Hook xóa HLV
export const useDeleteCoach = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => coachAPI.deleteCoach(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COACH_QUERY_KEY] });
    },
  });
};
