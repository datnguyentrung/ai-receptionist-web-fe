// File: src/features/auth/hooks/useAuthHooks.ts
import { useQuery, useMutation } from "@tanstack/react-query";
import { authApi } from "./authApi";
import type { UserBase } from "@/types";

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
  return useMutation({
    mutationFn: (data: UserBase) => authApi.login(data),
    onSuccess: (data) => {
      // Chạy khi API login thành công (HTTP 200)
      console.log("Đăng nhập thành công!", data);

      // Ở đây thường bạn sẽ:
      // 1. Lưu token vào localStorage
      localStorage.setItem("access_token", data.accessToken);
      // 2. Cập nhật trạng thái vào Zustand (authStore)
      // 3. Chuyển hướng (Navigate) sang trang Dashboard
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
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      localStorage.removeItem("access_token");
      // Xóa thông tin user trong Zustand
      // Chuyển hướng về trang Login
    },
  });
};
