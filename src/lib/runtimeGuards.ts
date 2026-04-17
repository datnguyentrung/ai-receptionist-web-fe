import type { PageResponse, StudentListResponse } from "@/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function ensureArray<T>(value: unknown, context: string): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  console.warn(`[runtime-guard] ${context}: expected array`, value);
  return [];
}

export function ensurePageResponse<T>(
  value: unknown,
  context: string,
): PageResponse<T> {
  if (isRecord(value) && Array.isArray(value.content)) {
    const number = typeof value.number === "number" ? value.number : 0;
    const size = typeof value.size === "number" ? value.size : value.content.length;
    const totalElements =
      typeof value.totalElements === "number"
        ? value.totalElements
        : value.content.length;
    const totalPages =
      typeof value.totalPages === "number" ? value.totalPages : 1;

    return {
      content: value.content as T[],
      empty: typeof value.empty === "boolean" ? value.empty : value.content.length === 0,
      first: typeof value.first === "boolean" ? value.first : number === 0,
      last: typeof value.last === "boolean" ? value.last : true,
      number,
      size,
      sort: isRecord(value.sort)
        ? {
            empty: typeof value.sort.empty === "boolean" ? value.sort.empty : true,
            sorted:
              typeof value.sort.sorted === "boolean" ? value.sort.sorted : false,
            unsorted:
              typeof value.sort.unsorted === "boolean"
                ? value.sort.unsorted
                : true,
          }
        : {
            empty: true,
            sorted: false,
            unsorted: true,
          },
      totalElements,
      totalPages,
    };
  }

  console.warn(`[runtime-guard] ${context}: expected page response`, value);
  return {
    content: [],
    empty: true,
    first: true,
    last: true,
    number: 0,
    size: 0,
    sort: {
      empty: true,
      sorted: false,
      unsorted: true,
    },
    totalElements: 0,
    totalPages: 1,
  };
}

export function ensureStudentListResponse(
  value: unknown,
  context: string,
): StudentListResponse {
  if (isRecord(value)) {
    return {
      activeStudentCount:
        typeof value.activeStudentCount === "number" ? value.activeStudentCount : 0,
      reservedStudentCount:
        typeof value.reservedStudentCount === "number"
          ? value.reservedStudentCount
          : 0,
      droppedStudentCount:
        typeof value.droppedStudentCount === "number" ? value.droppedStudentCount : 0,
      students: ensurePageResponse(value.students, `${context}.students`),
    };
  }

  console.warn(`[runtime-guard] ${context}: expected student list response`, value);
  return {
    activeStudentCount: 0,
    reservedStudentCount: 0,
    droppedStudentCount: 0,
    students: ensurePageResponse(undefined, `${context}.students`),
  };
}
