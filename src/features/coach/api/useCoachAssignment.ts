import { useQuery } from "@tanstack/react-query";
import { coachAssignmentAPI } from "./coachAssignmentAPI";

const COACH_ASSIGNMENT_QUERY_KEY = "coach-assignments";

export const useGetCoachAssignmentsByCoachId = (coachId: string) => {
  return useQuery({
    queryKey: [COACH_ASSIGNMENT_QUERY_KEY, coachId],
    queryFn: () => coachAssignmentAPI.getAssignmentsByCoachId(coachId),
    enabled: !!coachId,
  });
};
