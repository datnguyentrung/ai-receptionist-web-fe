import { useQuery } from "@tanstack/react-query";
import { coachAssignmentAPI } from "./coachAssignmentAPI";
import type { CoachAssignmentCreateRequest } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from '@/lib/react-query';

const COACH_ASSIGNMENT_QUERY_KEY = "coach-assignments";

export const useGetCoachAssignmentsByCoachId = (coachId: string) => {
  return useQuery({
    queryKey: [COACH_ASSIGNMENT_QUERY_KEY, coachId],
    queryFn: () => coachAssignmentAPI.getAssignmentsByCoachId(coachId),
    enabled: !!coachId,
  });
};

export  const useCreateCoachAssignment = () => {
  const mutation = useMutation({
    mutationFn: (request: CoachAssignmentCreateRequest) =>
      coachAssignmentAPI.createCoachAssignment(request),
    onSuccess: () => {
      // Invalidate the coach assignments query to refetch the updated data
      queryClient.invalidateQueries({ queryKey: [COACH_ASSIGNMENT_QUERY_KEY] });
    },
  });

  return mutation;
}
