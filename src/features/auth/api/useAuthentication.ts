// File: src/features/auth/hooks/useAuthHooks.ts
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import { userAPI } from "@/features/user";
import { useAuthStore } from "@/store/authStore";
import type { UserBase } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { authApi } from "./authApi";

const POST_LOGIN_LOADING_MS = 900;

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const getLoginErrorMessage = (error: unknown) => {
  if (!error) {
    return "Đăng nhập thất bại. Vui lòng thử lại.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object") {
    const maybeError = error as {
      message?: unknown;
      response?: {
        data?: {
          message?: unknown;
          error?: unknown;
        };
      };
    };

    const responseMessage = maybeError.response?.data?.message;
    if (typeof responseMessage === "string" && responseMessage.trim()) {
      return responseMessage;
    }

    const responseError = maybeError.response?.data?.error;
    if (typeof responseError === "string" && responseError.trim()) {
      return responseError;
    }

    if (typeof maybeError.message === "string" && maybeError.message.trim()) {
      return maybeError.message;
    }
  }

  return "Đăng nhập thất bại. Vui lòng thử lại.";
};

// 1. Hook lấy thông tin tài khoản (Dùng useQuery vì là GET)
export const useGetAccount = () => {
  return useQuery({
    queryKey: ["accountInfo"],
    queryFn: authApi.getAccount,
    retry: false, // Nếu lỗi (ví dụ chưa đăng nhập) thì không tự động thử lại
  });
};

// 2. Hook xử lý Đăng nhập (Dùng useMutation vì là POST)
export const useLogin = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  return useMutation({
    mutationFn: (data: UserBase) => authApi.login(data),
    onSuccess: async (data) => {
      try {
        // 1. Lưu token mới vào store TRƯỚC để các Axios Interceptor kịp cập nhật
        useAuthStore.setState({ accessToken: data.accessToken });

        // 2. getUserInfo trả về UserResponse[] (multi-profile)
        const profiles = await userAPI.getUserInfo(data.accessToken);

        // 3. Set toàn bộ data — login() tự resolve activeProfile từ localStorage
        login(data.accessToken, profiles);

        await wait(POST_LOGIN_LOADING_MS);

        showSuccessToast("Đăng nhập thành công");
        navigate("/");
      } catch (error) {
        showErrorToast(
          "Lỗi khi lấy thông tin user: " + getLoginErrorMessage(error),
        );
      }
    },
    onError: (error) => {
      showErrorToast(getLoginErrorMessage(error));
    },
  });
};

// 3. Hook xử lý Đăng xuất (Dùng useMutation)
export const useLogout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout();
      queryClient.clear();
      navigate("/login");
    },
  });
};
