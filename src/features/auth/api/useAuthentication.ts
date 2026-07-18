// File: src/features/auth/hooks/useAuthHooks.ts
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import { userAPI } from "@/features/user";
import { normalizeAuthError } from "@/features/auth/utils/authErrors";
import { clearAuthCompatibilityStorage } from "@/features/auth/utils/authStorage";
import { routeAfterAuthResponse } from "@/features/auth/utils/authRouting";
import {
  cleanupFcm,
  requestNotificationPermission,
} from "@/integrations/firebase/fcm";
import { useAuthStore } from "@/store/authStore";
import type { LoginRequest, SwitchContextRequest } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { authApi } from "./authApi";

const getPrimaryUserCode = (
  profiles: Awaited<ReturnType<typeof userAPI.getUserInfo>>,
) => profiles[0]?.userInfo?.userCode ?? null;

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
  const setAuthFromResponse = useAuthStore((state) => state.setAuthFromResponse);
  const initProfile = useAuthStore((state) => state.initProfile);
  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: async (data) => {
      try {
        clearAuthCompatibilityStorage();
        setAuthFromResponse(data);
        let userCode: string | null = data.activeContext?.userCode ?? null;

        if (!data.requiresContextSelection) {
          try {
            const profiles = await userAPI.getUserInfo(data.accessToken);
            initProfile(profiles);
            userCode = getPrimaryUserCode(profiles);
          } catch {
            // Legacy profile loading should not invalidate the auth session.
          }
        }

        showSuccessToast("Đăng nhập thành công");
        window.requestAnimationFrame(() => {
          navigate(routeAfterAuthResponse(data, { userCode }), { replace: true });
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
          "Lỗi khi xử lý đăng nhập: " + normalizeAuthError(error),
        );
      }
    },
    onError: (error) => {
      showErrorToast(normalizeAuthError(error));
    },
  });
};

// 3. Hook xử lý Đăng xuất (Dùng useMutation)
export const useLogout = () => {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      cleanupFcm().catch(() => { });
      clearAuth();
      queryClient.clear();
      navigate("/login", { replace: true });
    },
  });
};

export const useLogoutAll = () => {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logoutAll,
    onSuccess: () => {
      showSuccessToast("Đã đăng xuất khỏi tất cả thiết bị");
    },
    onSettled: () => {
      cleanupFcm().catch(() => { });
      clearAuth();
      queryClient.clear();
      navigate("/login", { replace: true });
    },
  });
};

export const useSwitchContext = () => {
  const navigate = useNavigate();
  const setAuthFromResponse = useAuthStore((state) => state.setAuthFromResponse);
  const initProfile = useAuthStore((state) => state.initProfile);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SwitchContextRequest) => authApi.switchContext(data),
    onSuccess: async (data) => {
      setAuthFromResponse(data);
      queryClient.clear();
      let userCode: string | null = data.activeContext?.userCode ?? null;

      if (!data.requiresContextSelection) {
        try {
          const profiles = await userAPI.getUserInfo(data.accessToken);
          initProfile(profiles);
          userCode = getPrimaryUserCode(profiles);
        } catch {
          // Legacy profile loading should not block context switch.
        }
      }

      window.setTimeout(() => {
        void requestNotificationPermission().catch(() => { });
      }, 0);

      navigate(routeAfterAuthResponse(data, { userCode }), { replace: true });
    },
    onError: (error) => {
      showErrorToast(normalizeAuthError(error));
    },
  });
};
