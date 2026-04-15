import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import type { RoleLevel } from "../config/constants/roleLevels";
import { ROLE_LEVELS } from "../config/constants/roleLevels";
import { useAuthStore } from "../store/authStore";

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
  const { user, idRole, idUser } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      idRole: state.user?.userInfo?.idRole,
      idUser: state.user?.userInfo?.idUser,
    })),
  );

  // Dev-only debug: log role info once per login session (no duplicate on refresh)
  useEffect(() => {
    if (!import.meta.env.DEV || !user || !idRole || !idUser) {
      return;
    }

    const debugKey = `role-debug-logged:${idUser}:${idRole}`;
    if (sessionStorage.getItem(debugKey) === "1") {
      return;
    }

    console.log("useRoleStudent - user:", user);
    console.log("useRoleStudent - idRole:", idRole);
    sessionStorage.setItem(debugKey, "1");
  }, [user, idRole, idUser]);

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
      idRole: state.user?.userInfo?.idRole,
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
