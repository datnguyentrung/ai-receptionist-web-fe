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
  const setAuth = useAuthStore((state) => state.setAuth);
  return useMutation({
    mutationFn: (data: UserBase) => authApi.login(data),
    onSuccess: async (data) => {
      try {
        // 1. Lưu token mới vào store TRƯỚC để các Axios Interceptor (nếu có) kịp cập nhật
        // Chú ý: Bạn có thể cần tạo thêm hàm setTokenOnly trong store nếu muốn.
        useAuthStore.setState({ accessToken: data.accessToken });

        // 2. Ép hàm getUserInfo phải dùng token mới truyền vào (Hãy kiểm tra lại ruột hàm này nhé)
        const fullUserData = await userAPI.getUserInfo(data.accessToken);

        // 3. Set toàn bộ data
        setAuth(data.accessToken, fullUserData);

        // Giữ trạng thái loading ngắn để UI trang sau có thời gian ổn định dữ liệu.
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
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // 1. Xóa token và user trong Zustand
      clearAuth();

      // 2. XOÁ SẠCH CACHE CỦA REACT QUERY
      // Cách A: Xóa toàn bộ mọi cache (rất sạch sẽ khi user logout)
      queryClient.clear();

      // Cách B: Nếu bạn chỉ muốn xóa riêng cache của user-info
      // queryClient.removeQueries({ queryKey: ["user-info"] });

      // 3. Đá về trang login
      navigate("/login");
    },
  });
};
