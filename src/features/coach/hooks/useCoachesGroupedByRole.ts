// src/features/coach/hooks/useCoachesGroupedByRole.ts
import {
  COACH_ROLE_CODE_ORDER,
  type CoachRoleCode,
} from "@/config/constants/RoleCodeEnums";
import type { CoachDetail } from "@/types";
import { useMemo } from "react";

export interface CoachGroup {
  roleCode: CoachRoleCode;
  label: string;
  coaches: CoachDetail[];
}

/**
 * Hook để group coaches theo roleCode theo thứ tự định sẵn
 */
export function useCoachesGroupedByRole(
  coaches: CoachDetail[],
  search: string,
  filter: string,
): CoachGroup[] {
  return useMemo(() => {
    if (!Array.isArray(coaches)) return [];

    // Filter coaches
    const filtered = coaches.filter((c) => {
      const matchSearch =
        c.fullName.toLowerCase().includes(search.toLowerCase()) ||
        c.belt.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === "all" || c.coachStatus === filter;
      return matchSearch && matchFilter;
    });

    // Group by roleCode (API returns roleName, so use that as roleCode)
    const grouped = new Map<CoachRoleCode, CoachDetail[]>();
    filtered.forEach((coach) => {
      // Use roleName if roleCode is not provided (for API compatibility)
      const roleCode = (coach.roleCode || coach.roleName) as CoachRoleCode;
      if (!grouped.has(roleCode)) {
        grouped.set(roleCode, []);
      }
      grouped.get(roleCode)?.push(coach);
    });

    // Sort by predefined order
    const result: CoachGroup[] = [];
    COACH_ROLE_CODE_ORDER.forEach((roleCode) => {
      const groupCoaches = grouped.get(roleCode);
      if (groupCoaches && groupCoaches.length > 0) {
        result.push({
          roleCode,
          label: getCoachRoleLabel(roleCode),
          coaches: groupCoaches,
        });
      }
    });

    return result;
  }, [coaches, search, filter]);
}

/**
 * Helper function để lấy label của roleCode
 */
function getCoachRoleLabel(roleCode: CoachRoleCode): string {
  const labels: Record<CoachRoleCode, string> = {
    COACH_TRAINEE: "Huấn luyện viên Thực tập",
    COACH_JUNIOR: "Huấn luyện viên Cấp trung",
    COACH_SENIOR: "Huấn luyện viên Cấp cao",
    MANAGER_TRAINEE: "Quản lý Thực tập",
    MANAGER_MIDDLE: "Quản lý Cấp trung",
    MANAGER_SENIOR: "Quản lý Cấp cao",
    HEAD_COACH: "Huấn luyện viên Trưởng",
  };
  return labels[roleCode] || roleCode;
}
