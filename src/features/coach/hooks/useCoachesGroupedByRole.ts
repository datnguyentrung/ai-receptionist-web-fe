// src/features/coach/hooks/useCoachesGroupedByRole.ts
import {
  COACH_ROLE_CODE_LABELS,
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

const COACH_ROLE_CODE_SET = new Set<string>(COACH_ROLE_CODE_ORDER);

function normalizeRoleCode(role?: string | null) {
  return role?.replace(/^ROLE_/, "") ?? "";
}

function isCoachRoleCode(role?: string | null): role is CoachRoleCode {
  return COACH_ROLE_CODE_SET.has(normalizeRoleCode(role));
}

function getPrimaryCoachRoleCode(coach: CoachDetail): CoachRoleCode | null {
  const roles = coach.roles?.map(normalizeRoleCode) ?? [];
  const primaryRole = COACH_ROLE_CODE_ORDER.find((roleCode) =>
    roles.includes(roleCode),
  );

  if (primaryRole) {
    return primaryRole;
  }

  const legacyRole = normalizeRoleCode(coach.role);
  return isCoachRoleCode(legacyRole) ? legacyRole : null;
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
      const normalizedSearch = search.trim().toLowerCase();
      const matchSearch =
        !normalizedSearch ||
        c.fullName.toLowerCase().includes(normalizedSearch) ||
        c.staffCode.toLowerCase().includes(normalizedSearch) ||
        c.email.toLowerCase().includes(normalizedSearch) ||
        (c.phoneNumber ?? "").includes(normalizedSearch) ||
        c.belt.toLowerCase().includes(normalizedSearch);
      const matchFilter = filter === "all" || c.coachStatus === filter;
      return matchSearch && matchFilter;
    });

    const grouped = new Map<CoachRoleCode, CoachDetail[]>();
    filtered.forEach((coach) => {
      const roleCode = getPrimaryCoachRoleCode(coach);
      if (!roleCode) {
        return;
      }

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
  return COACH_ROLE_CODE_LABELS[roleCode] || roleCode;
}
