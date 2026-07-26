import { personAPI } from "@/features/person";
import { getCheckInErrorToast } from "@/features/studentAttendance/utils/checkInErrorToast";
import {
  isCoachFaceCheckInResponse,
  isStudentFaceCheckInResponse,
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

/** Adapts the new Person API DTOs to the scanner's existing presentation model. */
export function normalizeFaceCheckInResponse(
  response: FaceCheckInResponse,
): CheckInResponse {
  if (isStudentFaceCheckInResponse(response)) {
    return {
      audio_signal: "CHECKIN_SUCCESS",
      status: true,
      user: null,
      attendance_record: response,
      coachTimesheet: null,
      message: response.studentName
        ? `Điểm danh ${response.studentName} thành công.`
        : "Điểm danh thành công.",
    };
  }

  if (isCoachFaceCheckInResponse(response)) {
    const coachName = response.coach?.fullName;
    return {
      audio_signal: "CHECKIN_SUCCESS",
      status: true,
      user: null,
      attendance_record: null,
      coachTimesheet: response,
      message: coachName
        ? `Chấm công HLV ${coachName} thành công.`
        : "Chấm công HLV thành công.",
    };
  }

  throw new Error("Face check-in response has an unsupported shape.");
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
    const message = response.message ?? "Đã ghi nhận check-in thành công.";

    setSubmitting(false);
    stopScanningDuringCheckIn();
    onCheckInResult?.({ ...response, message });
    void playSound("success");
    await speakText(message);
    onCheckInResult?.({ ...response, message, isAudioFinished: true });
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
