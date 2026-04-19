import type {
  AttendanceListResponse,
  AttendanceStats,
  PageResponse,
  StudentListResponse,
} from "@/types";

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
    const size =
      typeof value.size === "number" ? value.size : value.content.length;
    const totalElements =
      typeof value.totalElements === "number"
        ? value.totalElements
        : value.content.length;
    const totalPages =
      typeof value.totalPages === "number" ? value.totalPages : 1;

    return {
      content: value.content as T[],
      empty:
        typeof value.empty === "boolean"
          ? value.empty
          : value.content.length === 0,
      first: typeof value.first === "boolean" ? value.first : number === 0,
      last: typeof value.last === "boolean" ? value.last : true,
      number,
      size,
      sort: isRecord(value.sort)
        ? {
            empty:
              typeof value.sort.empty === "boolean" ? value.sort.empty : true,
            sorted:
              typeof value.sort.sorted === "boolean"
                ? value.sort.sorted
                : false,
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
        typeof value.activeStudentCount === "number"
          ? value.activeStudentCount
          : 0,
      reservedStudentCount:
        typeof value.reservedStudentCount === "number"
          ? value.reservedStudentCount
          : 0,
      droppedStudentCount:
        typeof value.droppedStudentCount === "number"
          ? value.droppedStudentCount
          : 0,
      students: ensurePageResponse(value.students, `${context}.students`),
    };
  }

  console.warn(
    `[runtime-guard] ${context}: expected student list response`,
    value,
  );
  return {
    activeStudentCount: 0,
    reservedStudentCount: 0,
    droppedStudentCount: 0,
    students: ensurePageResponse(undefined, `${context}.students`),
  };
}

function ensureAttendanceStats(value: unknown): AttendanceStats {
  if (isRecord(value)) {
    return {
      totalRecords:
        typeof value.totalRecords === "number" ? value.totalRecords : 0,
      attendanceRate:
        typeof value.attendanceRate === "number" ? value.attendanceRate : 0,
      presentCount:
        typeof value.presentCount === "number" ? value.presentCount : 0,
      absentCount:
        typeof value.absentCount === "number" ? value.absentCount : 0,
      excusedCount:
        typeof value.excusedCount === "number" ? value.excusedCount : 0,
      makeupCount:
        typeof value.makeupCount === "number" ? value.makeupCount : 0,
      lateCount: typeof value.lateCount === "number" ? value.lateCount : 0,
      evalGoodCount:
        typeof value.evalGoodCount === "number" ? value.evalGoodCount : 0,
      evalAverageCount:
        typeof value.evalAverageCount === "number" ? value.evalAverageCount : 0,
      evalWeakCount:
        typeof value.evalWeakCount === "number" ? value.evalWeakCount : 0,
      evalPendingCount:
        typeof value.evalPendingCount === "number" ? value.evalPendingCount : 0,
    };
  }

  return {
    totalRecords: 0,
    attendanceRate: 0,
    presentCount: 0,
    absentCount: 0,
    excusedCount: 0,
    makeupCount: 0,
    lateCount: 0,
    evalGoodCount: 0,
    evalAverageCount: 0,
    evalWeakCount: 0,
    evalPendingCount: 0,
  };
}

export function ensureAttendanceListResponse(
  value: unknown,
  context: string,
): AttendanceListResponse {
  if (isRecord(value)) {
    if (Array.isArray(value.content)) {
      return {
        stats: ensureAttendanceStats(value.stats),
        attendances: ensurePageResponse(value, `${context}.attendances`),
      };
    }

    return {
      stats: ensureAttendanceStats(value.stats),
      attendances: ensurePageResponse(
        value.attendances,
        `${context}.attendances`,
      ),
    };
  }

  console.warn(
    `[runtime-guard] ${context}: expected attendance list response`,
    value,
  );
  return {
    stats: ensureAttendanceStats(undefined),
    attendances: ensurePageResponse(undefined, `${context}.attendances`),
  };
}
