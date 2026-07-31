import type { Belt, CoachStatus, StudentStatus } from "../../config/constants";
import type { CoachTimesheetResponse } from "./CoachTimesheetTypes";
import type { StudentAttendanceResponse } from "./StudentAttendanceTypes";

export interface FaceCheckInStudentIdentity {
  personId: string;
  fullName: string;
  studentCode: string;
  belt: Belt;
  studentStatus: StudentStatus;
  branchName: string;
  birthDate?: string | Date | null;
  gender?: boolean | null;
}

export interface FaceCheckInCoachIdentity {
  personId: string;
  fullName: string;
  staffCode: string;
  belt: Belt;
  coachStatus: CoachStatus;
  email: string | null;
  birthDate?: string | Date | null;
  gender?: boolean | null;
}

/** The payload returned by `POST /persons/face-check-in` after a face is resolved. */
export interface FaceCheckInResponse {
  personType: "STUDENT" | "COACH";
  checkInSuccess: boolean;
  checkInErrorCode?: string | null;
  checkInErrorMessage?: string | null;
  studentDetail: FaceCheckInStudentIdentity | null;
  coachDetail: FaceCheckInCoachIdentity | null;
  studentAttendance: StudentAttendanceResponse | null;
  coachTimesheet: CoachTimesheetResponse | null;
}
