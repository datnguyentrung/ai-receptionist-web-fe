// File: src/hooks/useNavigation.ts
import { useNavigate } from "react-router-dom";

export const useNavigateStudentListByClassScheduleId = () => {
  const navigate = useNavigate();

  return ({ classScheduleId }: { classScheduleId: string }) => {
    navigate(`/schedules/${classScheduleId}`);
  };
};


// Back navigation
export const useNavigateBack = () => {
  const navigate = useNavigate();
  return () => navigate(-1);
}
