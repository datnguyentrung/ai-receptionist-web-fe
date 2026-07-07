import { classScheduleAPI } from "@/features/classSchedule/api/classScheduleAPI";
import type { QueryClient } from "@tanstack/react-query";

export const classSchedulesQueryKey = (scheduleIds: string[]) =>
  ["class-schedules", { scheduleIds }] as const;

export function prefetchClassSchedules(
  queryClient: QueryClient,
  scheduleIds: string[],
  options: { includeRoute?: boolean } = {},
) {
  if (options.includeRoute ?? true) {
    void import("@/pages/ClassSchedules");
  }

  void queryClient.prefetchQuery({
    queryKey: classSchedulesQueryKey(scheduleIds),
    queryFn: () => classScheduleAPI.getAllClassSchedules({ scheduleIds }),
  });
}
