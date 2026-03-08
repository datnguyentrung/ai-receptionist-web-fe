// File: src/hooks/useNavigation.ts
import { useNavigate } from "react-router-dom";

export const useNavigateStudentListByClassScheduleId = () => {
  const navigate = useNavigate();

  return ({ classScheduleId }: { classScheduleId: string }) => {
    navigate(`/schedules/${classScheduleId}`);
  };
};
