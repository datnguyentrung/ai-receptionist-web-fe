import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import type { RoleLevel } from "../config/constants/roleLevels";
import { ROLE_LEVELS } from "../config/constants/roleLevels";
import { useAuthStore } from "../store/authStore";

type RoleInput = string | readonly string[] | undefined | null;

const normalizeRole = (role: string) =>
  role.startsWith("ROLE_") ? role : `ROLE_${role}`;

const toRoleList = (roles: RoleInput) => {
  if (!roles) return [];
  return Array.isArray(roles) ? roles : [roles];
};

// Hàm Helper tái tạo logic của Spring Boot
const checkContains = (role: string | undefined, keyword: string) => {
  return !!role && role.includes(keyword);
};

export const hasRole = (roles: RoleInput, role: string) => {
  const requiredRole = normalizeRole(role);
  return toRoleList(roles).some(
    (currentRole) => normalizeRole(currentRole) === requiredRole,
  );
};

export const hasAnyRole = (
  roles: RoleInput,
  requiredRoles: readonly string[],
) => requiredRoles.some((role) => hasRole(roles, role));

export const isDeveloper = (roles?: RoleInput) => {
  return hasRole(roles, "DEVELOPER");
};

export const isSystem = (roles?: RoleInput) => {
  return hasRole(roles, "SYSTEM") || isDeveloper(roles);
};

export const isHeadCoach = (roles?: RoleInput) => {
  return hasRole(roles, "HEAD_COACH") || isDeveloper(roles);
};

export const isManagerSenior = (roles?: RoleInput) => {
  return (
    toRoleList(roles).some((role) => checkContains(role, "MANAGER_SENIOR")) ||
    isHeadCoach(roles)
  );
};

export const isCoach = (roles?: RoleInput) => {
  return (
    toRoleList(roles).some(
      (role) => checkContains(role, "COACH") || checkContains(role, "MANAGER"),
    ) || isManagerSenior(roles)
  );
};

export const isAssistant = (roles?: RoleInput) => {
  return hasRole(roles, "ASSISTANT") || isCoach(roles);
};

export const isStudent = (roles?: RoleInput) => {
  return hasRole(roles, "STUDENT") || isCoach(roles);
};

// Đổi tên thành useRoleStudent để tuân thủ luật của React Hooks
export const useRoleStudent = () => {
  // Destructure { idRole, isAuthenticated } ra khỏi object trả về
  const { user, roles, idRole, idUser } = useAuthStore(
    useShallow((state) => ({
      user: state.activeProfile,
      roles: state.user?.roles,
      idRole: state.activeProfile?.userInfo?.idRole,
      idUser: state.activeProfile?.userInfo?.idUser,
    })),
  );
  const effectiveRoles = roles && roles.length > 0 ? roles : idRole;

  // Dev-only debug: log role info once per login session (no duplicate on refresh)
  useEffect(() => {
    if (!import.meta.env.DEV || (!roles?.length && !idRole) || !idUser) {
      return;
    }

    const debugKey = `role-debug-logged:${idUser}:${idRole}`;
    if (sessionStorage.getItem(debugKey) === "1") {
      return;
    }

    console.log("useRoleStudent - user:", user);
    console.log("useRoleStudent - idRole:", idRole);
    sessionStorage.setItem(debugKey, "1");
  }, [user, roles, idRole, idUser]);

  // Lúc này idRole đã là string (hoặc undefined), truyền vào isManagerSenior sẽ không bị lỗi
  const canViewHeadCoach = isHeadCoach(effectiveRoles);
  const canViewManagerSenior = isManagerSenior(effectiveRoles);
  const canViewCoach = isCoach(effectiveRoles);
  const canUseCheckIn = isCoach(effectiveRoles) || isSystem(effectiveRoles);
  const canViewAssistant = isAssistant(effectiveRoles);
  const canViewStudent = isStudent(effectiveRoles);

  // Trả về thêm isAuthenticated nếu component cần dùng để check đăng nhập
  return {
    canViewManagerSenior,
    canViewCoach,
    canUseCheckIn,
    canViewStudent,
    canViewAssistant,
    canViewHeadCoach,
  };
};

// Hook lấy cấp độ cao nhất của user hiện tại
export const useUserLevel = () => {
  const { roles, idRole, isAuthenticated } = useAuthStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      roles: state.user?.roles,
      idRole: state.activeProfile?.userInfo?.idRole,
    })),
  );
  const effectiveRoles = roles && roles.length > 0 ? roles : idRole;

  let level: RoleLevel = ROLE_LEVELS.GUEST;

  // PHẢI KIỂM TRA DEVELOPER ĐẦU TIÊN (Mức cao nhất)
  if (isDeveloper(effectiveRoles)) {
    level = ROLE_LEVELS.DEVELOPER; // Gán đúng số 99
  } else if (isHeadCoach(effectiveRoles)) {
    level = ROLE_LEVELS.HEAD_COACH;
  } else if (isManagerSenior(effectiveRoles)) {
    level = ROLE_LEVELS.MANAGER_SENIOR;
  } else if (isCoach(effectiveRoles)) {
    level = ROLE_LEVELS.COACH;
  } else if (isAssistant(effectiveRoles)) {
    level = ROLE_LEVELS.ASSISTANT;
  } else if (isStudent(effectiveRoles)) {
    level = ROLE_LEVELS.STUDENT;
  }

  return { level, isAuthenticated };
};
