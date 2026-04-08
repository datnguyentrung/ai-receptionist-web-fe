import { useShallow } from "zustand/react/shallow";
import type { RoleLevel } from "../config/constants/roleLevels";
import { ROLE_LEVELS } from "../config/constants/roleLevels";
import { useAuthStore } from "../store/authStore";
import type { UserLogin, UserResponse } from "../types";

// Hàm Helper tái tạo logic của Spring Boot
const checkContains = (role: string | undefined, keyword: string) => {
  return !!role && role.includes(keyword);
};

export const isHeadCoach = (role?: string) => {
  return checkContains(role, "HEAD_COACH") || checkContains(role, "ADMIN");
};

export const isManager = (role?: string) => {
  return checkContains(role, "MANAGER") || isHeadCoach(role);
};

export const isCoach = (role?: string) => {
  return checkContains(role, "COACH") || isManager(role);
};

// Đổi tên thành useRoleStudent để tuân thủ luật của React Hooks
export const useRoleStudent = () => {
  // Destructure { idRole, isAuthenticated } ra khỏi object trả về
  const { user, idRole } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      idRole:
        (state.user as UserLogin)?.role ||
        (state.user as UserResponse)?.userInfo?.idRole,
    })),
  );
  console.log("useRoleStudent - user:", user); // Debug: Xem toàn bộ user object
  console.log("useRoleStudent - idRole:", idRole); // Debug: Xem idRole lấy được là gì

  // Lúc này idRole đã là string (hoặc undefined), truyền vào isManager sẽ không bị lỗi
  const canViewHeadCoach = isHeadCoach(idRole);
  const canViewManager = isManager(idRole);
  const canViewCoach = isCoach(idRole);
  const canViewStudent = !canViewManager && !canViewCoach;

  // Trả về thêm isAuthenticated nếu component cần dùng để check đăng nhập
  return { canViewManager, canViewCoach, canViewStudent, canViewHeadCoach };
};

// Hook lấy cấp độ cao nhất của user hiện tại
export const useUserLevel = () => {
  const { idRole, isAuthenticated } = useAuthStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      idRole: (state.user as UserResponse)?.userInfo?.idRole,
    })),
  );

  let level: RoleLevel = ROLE_LEVELS.STUDENT; // Mặc định ai đăng nhập cũng ít nhất là Student

  if (isHeadCoach(idRole)) {
    level = ROLE_LEVELS.HEAD_COACH;
  } else if (isManager(idRole)) {
    level = ROLE_LEVELS.MANAGER;
  } else if (isCoach(idRole)) {
    level = ROLE_LEVELS.COACH;
  }

  return { level, isAuthenticated };
};
