// File: src/features/auth/hooks/useAuthHooks.ts
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import { userAPI } from "@/features/user";
import {
  cleanupFcm,
  requestNotificationPermission,
} from "@/integrations/firebase/fcm";
import { useAuthStore } from "@/store/authStore";
import type { UserBase } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { authApi } from "./authApi";

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

        localStorage.setItem("access_token", data.accessToken);
        localStorage.setItem("refresh_token", data.refreshToken);

        // 2. getUserInfo trả về UserResponse[] (multi-profile)
        const profiles = await userAPI.getUserInfo(data.accessToken);

        // 3. Set toàn bộ data — login() tự resolve activeProfile từ localStorage
        login(data.accessToken, profiles);

        showSuccessToast("Đăng nhập thành công");
        window.requestAnimationFrame(() => {
          navigate("/", { replace: true });
        });

        window.setTimeout(() => {
          void requestNotificationPermission().catch((error) => {
            console.error("FCM init sau login lỗi:", error);
            toast.error(
              "Không thể đăng ký nhận thông báo. Vui lòng kiểm tra cài đặt trình duyệt.",
            );
          });
        }, 0);
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
      cleanupFcm().catch(() => { });
      logout();
      queryClient.clear();
      navigate("/login");
    },
  });
};
