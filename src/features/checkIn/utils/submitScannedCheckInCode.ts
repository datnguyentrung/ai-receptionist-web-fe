import { coachTimesheetAPI } from "@/features/coach/api/coachTimesheetAPI";
import { studentAttendanceAPI } from "@/features/studentAttendance/api/studentAttendanceAPI";
import type {
  CoachTimesheetResponse,
  StudentAttendanceResponse,
} from "@/types";
import {
  validateScannedCheckInCode,
  type ScannedCheckInCodeFormat,
} from "./validateScannedCheckInCode";

export type ScannedCheckInResult =
  | {
      type: "student-attendance";
      normalizedCode: string;
      data: StudentAttendanceResponse;
    }
  | {
      type: "coach-timesheet";
      normalizedCode: string;
      data: CoachTimesheetResponse;
    };

export interface SubmitScannedCheckInCodeInput {
  rawValue: string;
  format?: ScannedCheckInCodeFormat;
}

export class ScannedCheckInCodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScannedCheckInCodeError";
  }
}

export async function submitScannedCheckInCode({
  rawValue,
  format = "unknown",
}: SubmitScannedCheckInCodeInput): Promise<ScannedCheckInResult> {
  const normalizedCode = rawValue.trim();

  if (!normalizedCode) {
    throw new ScannedCheckInCodeError("Ma quet trong. Vui long thu lai.");
  }

  if (normalizedCode.startsWith("VQ_")) {
    const validation = validateScannedCheckInCode({
      rawValue: normalizedCode,
      format,
    });

    if (!validation.isValid) {
      throw new ScannedCheckInCodeError(
        validation.errorMessage ?? "Ma quet hoc vien khong hop le.",
      );
    }

    const data = await studentAttendanceAPI.checkInByScan({
      studentCode: validation.normalizedCode,
    });

    return {
      type: "student-attendance",
      normalizedCode: validation.normalizedCode,
      data,
    };
  }

  if (normalizedCode.startsWith("VQT")) {
    const data = await coachTimesheetAPI.checkIn({
      staffCode: normalizedCode,
    });

    return {
      type: "coach-timesheet",
      normalizedCode,
      data,
    };
  }

  throw new ScannedCheckInCodeError(
    "Ma quet khong hop le. Ma hoc vien bat dau bang VQ_, ma HLV bat dau bang VQT.",
  );
}
