import type { ChangePasswordRequest } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { userAPI } from "./userAPI";

const USER_QUERY_KEY = "user-info";

export const useGetUserInfo = () => {
  return useQuery({
    queryKey: [USER_QUERY_KEY],
    queryFn: userAPI.getUserInfo,
    retry: false,
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => userAPI.changePassword(data),
  });
};
