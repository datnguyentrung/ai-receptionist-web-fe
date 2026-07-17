// File: src/app/navigation/useNavigation.ts
import type { ClassScheduleSummary } from "@/types";
import { useNavigate } from "react-router-dom";

export const useNavigateStudentListByClassScheduleId = () => {
  const navigate = useNavigate();

  return ({
    classScheduleId,
    classScheduleSummary,
  }: {
    classScheduleId: string;
    classScheduleSummary?: ClassScheduleSummary;
  }) => {
    navigate(`/schedules/${classScheduleId}`, {
      state: classScheduleSummary ? { classScheduleSummary } : undefined,
    });
  };
};


// Back navigation
export const useNavigateBack = () => {
  const navigate = useNavigate();
  return () => navigate(-1);
};
