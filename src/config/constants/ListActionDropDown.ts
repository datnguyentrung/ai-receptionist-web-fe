import { useAuthStore } from "@/store/authStore";
import {
  UserRound,
  Settings,
  KeyRound,
  CircleHelp,
  LogOut,
} from "lucide-react";

export interface ListActionDropDownItem {
  lucideIcon: React.ElementType;
  label: string;
  id: string;
  navigateTo?: string;
  isDanger?: boolean; // Thêm cờ này để bôi đỏ nút Đăng xuất nếu cần
}

// Chuyển thành Custom Hook để có thể gọi useAuthStore
export const useSettingsMenu = (): ListActionDropDownItem[] => {
  const { user } = useAuthStore();

  return [
    {
      lucideIcon: UserRound,
      label: "Trang cá nhân",
      id: "profile",
      ...(user?.userInfo?.userCode && {
        navigateTo: `/${user.userInfo.userCode}`,
      }),
    },
    {
      lucideIcon: Settings,
      label: "Cài đặt chung",
      id: "settings",
      navigateTo: "/settings",
    },
    {
      lucideIcon: KeyRound,
      label: "Đổi mật khẩu",
      id: "change-password",
      navigateTo: "/settings/security",
    },
    {
      lucideIcon: CircleHelp,
      label: "Trợ giúp & Hướng dẫn",
      id: "help",
      navigateTo: "/help",
    },
    {
      lucideIcon: LogOut,
      label: "Đăng xuất",
      id: "logout",
      isDanger: true,
      // Nút Đăng xuất thường không dùng navigateTo mà sẽ trigger một hàm xử lý (onClick) ở component render
    },
  ];
};
