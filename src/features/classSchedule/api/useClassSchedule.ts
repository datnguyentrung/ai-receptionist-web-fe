import type {
  ClassScheduleCreateRequest,
  ClassScheduleUpdateRequest,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { classScheduleAPI } from "./classScheduleAPI";

const CLASS_SCHEDULE_QUERY_KEY = "class-schedules";

// 1. Hook lấy danh sách tất cả lịch học
export const useGetAllClassSchedules = () => {
  return useQuery({
    queryKey: [CLASS_SCHEDULE_QUERY_KEY],
    queryFn: classScheduleAPI.getAllClassSchedules,
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
