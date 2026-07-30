import { personAPI } from "@/features/person";
import {
  getCheckInErrorContentByCode,
  getCheckInErrorToast,
} from "@/features/studentAttendance/utils/checkInErrorToast";
import {
  type CheckInResponse,
  type FaceCheckInResponse,
} from "@/types";
import { playSound } from "../../utils/playSound";
import { speakText } from "../../utils/speakText";

interface SubmitFaceCheckInParams {
  formData: FormData;
  signal: AbortSignal;
  onCheckInResult?: (result: CheckInResponse | null) => void;
  stopScanningDuringCheckIn: () => void;
  setSubmitting: (isSubmitting: boolean) => void;
  onRequestError: (message: string) => void;
}

/** Adapts the Person face check-in DTO to the scanner's presentation model. */
export function normalizeFaceCheckInResponse(
  response: FaceCheckInResponse,
): CheckInResponse {
  if (response.personType !== "STUDENT" && response.personType !== "COACH") {
    throw new Error("Face check-in response has an unsupported person type.");
  }

  const hasOnlyStudentDetail =
    response.studentDetail !== null && response.coachDetail === null;
  const hasOnlyCoachDetail =
    response.coachDetail !== null && response.studentDetail === null;
  const isStudent = response.personType === "STUDENT";

  if ((isStudent && !hasOnlyStudentDetail) || (!isStudent && !hasOnlyCoachDetail)) {
    throw new Error("Face check-in response has an invalid person detail.");
  }

  if (
    response.checkInSuccess &&
    ((isStudent && (response.studentAttendance === null || response.coachTimesheet !== null)) ||
      (!isStudent && (response.coachTimesheet === null || response.studentAttendance !== null)))
  ) {
    throw new Error("Face check-in response is missing its successful check-in record.");
  }

  if (
    !response.checkInSuccess &&
    (response.studentAttendance !== null || response.coachTimesheet !== null)
  ) {
    throw new Error("Face check-in failure response must not include a check-in record.");
  }

  if (!response.checkInSuccess) {
    const recognizedPerson = isStudent
      ? {
          personType: "STUDENT" as const,
          ...response.studentDetail!,
        }
      : {
          personType: "COACH" as const,
          ...response.coachDetail!,
        };

    return {
      audio_signal: "NO_VALID_SESSION",
      status: false,
      user: null,
      attendance_record: null,
      coachTimesheet: null,
      recognizedPerson,
      checkInErrorCode: response.checkInErrorCode ?? null,
      message:
        getCheckInErrorContentByCode(response.checkInErrorCode)?.description ??
        "Không thể xử lý check-in. Vui lòng thử lại.",
      isAudioFinished: true,
    };
  }

  if (!isStudent) {
    const coachName = response.coachDetail!.fullName;
    return {
      audio_signal: "CHECKIN_SUCCESS",
      status: true,
      user: null,
      attendance_record: null,
      coachTimesheet: response.coachTimesheet!,
      message: coachName
        ? `Chấm công HLV ${coachName} thành công.`
        : "Chấm công HLV thành công.",
    };
  }

  const studentName = response.studentDetail!.fullName;
  return {
    audio_signal: "CHECKIN_SUCCESS",
    status: true,
    user: null,
    attendance_record: response.studentAttendance!,
    coachTimesheet: null,
    message: studentName
      ? `Điểm danh ${studentName} thành công.`
      : "Điểm danh thành công.",
  };
}

export const submitFaceCheckIn = async ({
  formData,
  signal,
  onCheckInResult,
  stopScanningDuringCheckIn,
  setSubmitting,
  onRequestError,
}: SubmitFaceCheckInParams) => {
  try {
    const response = normalizeFaceCheckInResponse(
      await personAPI.faceCheckIn(formData, signal),
    );
    setSubmitting(false);
    stopScanningDuringCheckIn();

    if (!response.status) {
      onCheckInResult?.(response);
      void playSound("error");
      return;
    }

    const message = response.message ?? "Đã ghi nhận check-in thành công.";
    const successResponse = { ...response, message };

    onCheckInResult?.(successResponse);
    void playSound("success");
    await speakText(message);
    onCheckInResult?.({ ...successResponse, isAudioFinished: true });
  } catch (error) {
    setSubmitting(false);
    const errorName =
      typeof error === "object" && error !== null && "name" in error
        ? String(error.name)
        : "";

    if (errorName === "CanceledError" || errorName === "AbortError") {
      return;
    }

    console.error("Face check-in failed:", error);
    void playSound("error");
    onRequestError(getCheckInErrorToast(error).description);
  }
};
