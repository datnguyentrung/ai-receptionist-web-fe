import type { CoachDetail } from "../Core/CoachTypes";
import type { StudentDetail } from "../Core/StudentTypes";
import type { CoachTimesheetResponse } from "./CoachTimesheetTypes";
import type { StudentAttendanceResponse } from "./StudentAttendanceTypes";

/** The payload returned by `POST /persons/face-check-in` after a face is resolved. */
export interface FaceCheckInResponse {
  personType: "STUDENT" | "COACH";
  checkInSuccess: boolean;
  checkInErrorCode?: string | null;
  checkInErrorMessage?: string | null;
  studentDetail: StudentDetail | null;
  coachDetail: CoachDetail | null;
  studentAttendance: StudentAttendanceResponse | null;
  coachTimesheet: CoachTimesheetResponse | null;
}
