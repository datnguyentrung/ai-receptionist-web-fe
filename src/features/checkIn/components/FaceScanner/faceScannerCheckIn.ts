import { studentAPI } from "@/features/student";
import type { CheckInResponse } from "@/types";
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

const getUserName = (response: CheckInResponse) =>
  (response.user as { userProfile?: { name?: string } } | null)?.userProfile
    ?.name ?? "";

const getResponseMessage = (response: CheckInResponse) => {
  const userName = getUserName(response);

  switch (response.audio_signal) {
    case "CHECKIN_SUCCESS":
      return response.message ?? "Đã ghi nhận check-in thành công.";
    case "ALREADY_CHECKED_IN":
      return userName ? `${userName} đã check-in rồi.` : "Đã check-in rồi.";
    case "NO_VALID_SESSION":
      return response.message ?? "Không có ca phù hợp tại thời điểm này.";
    case "FACE_NOT_RECOGNIZED":
      return "Không nhận diện được khuôn mặt. Vui lòng nhìn thẳng vào camera.";
    default:
      return response.message ?? "Không thể xử lý check-in. Vui lòng thử lại.";
  }
};

export const submitFaceCheckIn = async ({
  formData,
  signal,
  onCheckInResult,
  stopScanningDuringCheckIn,
  setSubmitting,
  onRequestError,
}: SubmitFaceCheckInParams) => {
  try {
    const response = await studentAPI.face_check_in(formData, signal);
    const message = getResponseMessage(response);
    const isSuccess = response.audio_signal === "CHECKIN_SUCCESS";

    setSubmitting(false);
    stopScanningDuringCheckIn();
    onCheckInResult?.({ ...response, message });
    void playSound(isSuccess ? "success" : "error");
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
    onRequestError("Không thể gửi check-in. Kiểm tra kết nối rồi thử lại.");
  }
};
