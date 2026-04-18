import type { ScheduleStatus } from "@/config/constants";
import type {
  ClassScheduleCreateRequest,
  ClassScheduleUpdateRequest,
  GetClassSchedulesParams,
} from "@/types";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { classScheduleAPI } from "./classScheduleAPI";

const CLASS_SCHEDULE_QUERY_KEY = "class-schedules";

// 1. Hook lấy danh sách tất cả lịch học
// export const useGetAllClassSchedules = () => {
//   return useQuery({
//     queryKey: [CLASS_SCHEDULE_QUERY_KEY],
//     queryFn: classScheduleAPI.getAllClassSchedules,
//   });
// };

export const useGetAllClassSchedules = (
  params: GetClassSchedulesParams,
  options?: Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof classScheduleAPI.getAllClassSchedules>>,
      Error
    >,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    // Cực kỳ quan trọng: Nhét params vào queryKey
    // Khi params thay đổi (vd: page từ 1 sang 2), React Query sẽ tự động gọi lại API
    queryKey: [CLASS_SCHEDULE_QUERY_KEY, params],
    queryFn: () => classScheduleAPI.getAllClassSchedules(params),
    ...options,
  });
};

// 2. Hook lấy thông tin chi tiết một lịch học theo ID
export const useGetClassScheduleById = (id: number) => {
  return useQuery({
    queryKey: [CLASS_SCHEDULE_QUERY_KEY, id],
    queryFn: () => classScheduleAPI.getClassScheduleById(id),
    enabled: !!id,
  });
};

// 3. Hook tạo mới lịch học
export const useCreateClassSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ClassScheduleCreateRequest) =>
      classScheduleAPI.createClassSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLASS_SCHEDULE_QUERY_KEY] });
    },
  });
};

// 4. Hook cập nhật lịch học
export const useUpdateClassSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ClassScheduleUpdateRequest;
    }) => classScheduleAPI.updateClassSchedule(id, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: [CLASS_SCHEDULE_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [CLASS_SCHEDULE_QUERY_KEY, Number(variables.id)],
      });
    },
  });
};

export const useChangeClassScheduleStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      newStatus,
    }: {
      id: string;
      newStatus: ScheduleStatus;
    }) => classScheduleAPI.changeClassScheduleStatus(id, newStatus),

    // Bỏ _result đi vì giờ nó là void
    onSuccess: (_, variables) => {
      // Ép fetch lại data mới nhất từ server
      queryClient.invalidateQueries({ queryKey: [CLASS_SCHEDULE_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [CLASS_SCHEDULE_QUERY_KEY, variables.id],
      });
    },
  });
};
// 5. Hook xóa lịch học
export const useDeleteClassSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => classScheduleAPI.deleteClassSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLASS_SCHEDULE_QUERY_KEY] });
    },
  });
};
