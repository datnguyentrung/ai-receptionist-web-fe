import type { CoachTimesheetResponse } from "./CoachTimesheetTypes";
import type { StudentAttendanceResponse } from "./StudentAttendanceTypes";

/** The concrete payload returned by `POST /persons/face-check-in`. */
export type FaceCheckInResponse =
  | StudentAttendanceResponse
  | CoachTimesheetResponse;

export function isStudentFaceCheckInResponse(
  response: FaceCheckInResponse,
): response is StudentAttendanceResponse {
  return "attendanceId" in response;
}

export function isCoachFaceCheckInResponse(
  response: FaceCheckInResponse,
): response is CoachTimesheetResponse {
  return "timesheetId" in response;
}
