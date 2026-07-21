import { useRoleStudent } from "@/utils/roleUtils";
import { useAuthStore } from "@/store/authStore";
import type {
  DashboardBranchId,
  DashboardBranchOption,
  DashboardFilters,
  DashboardPeriod,
  DashboardUserScope,
} from "@/types/dashboard";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { DASHBOARD_BRANCHES } from "../mocks/dashboardMock";
import { dashboardApi } from "../services/dashboardApi";

export const dashboardQueryKey = ["dashboard", "operations"] as const;

function normalizeBranchName(value?: string | null) {
  return value?.trim() || "Chi nhánh được phân quyền";
}

function inferBranchIdFromName(value?: string | null) {
  const match = value?.match(/\d+/)?.[0];
  return match ? Number(match) : null;
}

function dedupeBranches(branches: DashboardBranchOption[]) {
  const map = new Map<number, DashboardBranchOption>();

  branches.forEach((branch) => {
    if (!map.has(branch.id)) {
      map.set(branch.id, branch);
    }
  });

  return Array.from(map.values()).sort((left, right) =>
    left.name.localeCompare(right.name, "vi"),
  );
}

export function useDashboard() {
  const roleFlags = useRoleStudent();
  const userRoles = useAuthStore((state) => state.user?.roles ?? []);
  const activeProfile = useAuthStore((state) => state.activeProfile);
  const activeContext = useAuthStore((state) => state.activeContext);

  const assignedBranches = useMemo(() => {
    const assignedClasses = activeProfile?.userInfo.assignedClasses ?? [];

    return dedupeBranches(
      assignedClasses
        .map((assignment) => {
          const schedule = assignment.classSchedule;
          const branchId = inferBranchIdFromName(schedule.branchName);

          if (!branchId) return null;

          return {
            id: branchId,
            name: normalizeBranchName(schedule.branchName),
          };
        })
        .filter((branch): branch is DashboardBranchOption => Boolean(branch)),
    );
  }, [activeProfile]);
  const canSelectAllBranches = roleFlags.canViewManagerSenior;
  const availableBranches = useMemo(
    () =>
      canSelectAllBranches
        ? dedupeBranches([...assignedBranches, ...DASHBOARD_BRANCHES])
        : assignedBranches.length > 0
          ? assignedBranches
          : DASHBOARD_BRANCHES.slice(0, 1),
    [assignedBranches, canSelectAllBranches],
  );

  const defaultBranchId: DashboardBranchId = canSelectAllBranches
    ? "ALL"
    : availableBranches[0]?.id ?? DASHBOARD_BRANCHES[0].id;

  const scope: DashboardUserScope = {
    roleScope: canSelectAllBranches ? "system" : "branch",
    canSelectAllBranches,
    defaultBranchId,
    availableBranches,
    displayName:
      activeContext?.displayName ?? activeProfile?.userProfile.name ?? "Quản lý",
    roleLabel:
      userRoles.find((role) => role.includes("MANAGER")) ??
      activeProfile?.userInfo.idRole ??
      "MANAGER",
  };

  const [rawFilters, setRawFilters] = useState<DashboardFilters>({
    branchId: defaultBranchId,
    period: "month",
    comparePrevious: true,
  });

  const branchExists =
    rawFilters.branchId === "ALL" ||
    scope.availableBranches.some((branch) => branch.id === rawFilters.branchId);
  const branchId =
    rawFilters.branchId === "ALL" && !scope.canSelectAllBranches
      ? scope.defaultBranchId
      : branchExists
        ? rawFilters.branchId
        : scope.defaultBranchId;
  const filters: DashboardFilters = { ...rawFilters, branchId };

  const setBranchId = (branchId: DashboardBranchId) => {
    setRawFilters((current) => ({ ...current, branchId }));
  };

  const setPeriod = (period: DashboardPeriod) => {
    setRawFilters((current) => ({ ...current, period }));
  };

  const setComparePrevious = (comparePrevious: boolean) => {
    setRawFilters((current) => ({ ...current, comparePrevious }));
  };

  const resetFilters = () => {
    setRawFilters({
      branchId: scope.defaultBranchId,
      period: "month",
      comparePrevious: true,
    });
  };

  const query = useQuery({
    queryKey: [
      ...dashboardQueryKey,
      filters.branchId,
      filters.period,
      filters.comparePrevious,
      scope.roleScope,
      scope.defaultBranchId,
    ],
    queryFn: () => dashboardApi.getDashboard({ filters, scope }),
    staleTime: 60_000,
  });

  return {
    ...query,
    filters,
    scope,
    setBranchId,
    setPeriod,
    setComparePrevious,
    resetFilters,
  };
}
