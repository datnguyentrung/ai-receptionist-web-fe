// src/features/coaches/hooks/useFilteredCoaches.ts
import type { CoachDetail } from "@/types";
import { useMemo } from "react";

export function useFilteredCoaches(
  coaches: CoachDetail[],
  search: string,
  filter: string,
) {
  // Dùng useMemo để tối ưu hiệu suất, chỉ tính toán lại khi data, search hoặc filter thay đổi
  return useMemo(() => {
    if (!Array.isArray(coaches)) return [];

    console.log("Filtering coaches with search:", search, "and filter:", filter);

    return coaches.filter((c) => {
      const matchSearch =
        c.fullName.toLowerCase().includes(search.toLowerCase()) ||
        c.belt.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === "all" || c.coachStatus === filter;

      return matchSearch && matchFilter;
    });
  }, [coaches, search, filter]);
}
