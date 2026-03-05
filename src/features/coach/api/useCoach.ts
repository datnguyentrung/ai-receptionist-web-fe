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
export const useGetCoachById = (id: number) => {
  return useQuery({
    queryKey: [COACH_QUERY_KEY, id],
    queryFn: () => coachAPI.getCoachById(id),
    enabled: !!id,
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
    mutationFn: ({ id, data }: { id: number; data: CoachUpdateRequest }) =>
      coachAPI.updateCoach(id, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: [COACH_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [COACH_QUERY_KEY, variables.id],
      });
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
