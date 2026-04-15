// File: src/features/auth/hooks/useAuthHooks.ts
import { userAPI } from "@/features/user";
import { useAuthStore } from "@/store/authStore";
import type { UserBase } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { authApi } from "./authApi";

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
      // Chạy khi API login thành công (HTTP 200)
      console.log("Đăng nhập thành công!", data);

      // Login xong phải lấy profile đầy đủ để chuẩn hóa user trong store.
      const fullUserData = await userAPI.getUserInfo(data.accessToken);
      setAuth(data.accessToken, fullUserData);
      navigate("/");
    },
    onError: (error) => {
      // Chạy khi API báo lỗi (Sai pass, tài khoản không tồn tại...)
      console.error("Lỗi đăng nhập:", error);
      // Thường sẽ gọi Toast notification báo lỗi ở đây
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
