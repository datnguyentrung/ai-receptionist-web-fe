import { studentAPI } from "@/features/student";
import type { CheckInResponse } from "../../types";
import { playSound } from "../../utils/playSound";
import { speakText } from "../../utils/speakText";

interface SubmitFaceCheckInParams {
  formData: FormData;
  signal: AbortSignal;
  checkInResult?: CheckInResponse | null;
  onCheckInResult?: (result: CheckInResponse | null) => void;
  resumeScanning: () => void;
  stopScanningDuringCheckIn: () => void;
  setSubmitting: (isSubmitting: boolean) => void;
}

const getUserName = (response: CheckInResponse) => {
  return (
    (response.user as { userProfile?: { name?: string } } | null)?.userProfile
      ?.name ?? ""
  );
};

const handleAudioSignal = async (
  response: CheckInResponse,
  params: Omit<SubmitFaceCheckInParams, "formData" | "signal">,
) => {
  // Lược bỏ resumeScanning vì ta giao quyền resume lại cho việc đóng Modal
  const { onCheckInResult } = params;
  const userName = getUserName(response);

  // Xây dựng câu thông báo tùy theo trường hợp
  let message = "";
  let soundType: "success" | "error" = "error"; // Mặc định là âm thanh lỗi

  switch (response.audio_signal) {
    case "CHECKIN_SUCCESS": {
      const now = new Date();
      message = `Điểm danh thành công lúc ${now.getHours()} giờ ${now.getMinutes()} phút.`;
      soundType = "success";
      break;
    }
    case "ALREADY_CHECKED_IN": {
      message = userName
        ? `${userName} đã điểm danh rồi nhé.`
        : "Đã điểm danh rồi nhé.";
      break;
    }
    case "NO_VALID_SESSION": {
      message = userName
        ? `Chào ${userName}, lịch học của bạn không trùng với ca hiện tại.`
        : "Lịch học không trùng với ca hiện tại.";
      break;
    }
    case "FACE_NOT_RECOGNIZED": {
      message = "Không nhận diện được khuôn mặt.";
      break;
    }
    default: {
      message = "Có lỗi xảy ra khi điểm danh.";
      break;
    }
  }

  // --- THỰC THI THEO ĐÚNG 1 LUỒNG CHUẨN ---

  // Bước 1: Hiện UI Modal ngay lập tức với thông báo
  onCheckInResult?.({ ...response, message });

  // Bước 2: Phát âm thanh Ting/Tè
  playSound(soundType);

  // Bước 3: AI đọc hướng dẫn (Code sẽ "đứng đợi" ở đây cho đến khi đọc xong)
  await speakText(message);

  // Bước 4: AI đọc xong -> Báo cờ isAudioFinished cho UI
  // Lúc này CheckInCard sẽ nhận được cờ này và bắt đầu thanh Progress đếm lùi 5 giây
  onCheckInResult?.({ ...response, message, isAudioFinished: true } as CheckInResponse);

  // LƯU Ý: Không cần gọi resumeScanning() hay onCheckInResult(null) ở đây nữa.
  // Khi thanh 5s chạy hết, Modal tự đóng -> checkInResult thành null -> Camera tự động mở lại!
};

export const submitFaceCheckIn = async ({
  formData,
  signal,
  checkInResult,
  onCheckInResult,
  resumeScanning,
  stopScanningDuringCheckIn,
  setSubmitting,
}: SubmitFaceCheckInParams) => {
  try {
    console.log("Sending to server...");
    const response: CheckInResponse = await studentAPI.face_check_in(
      formData,
      signal,
    );

    setSubmitting(false);
    stopScanningDuringCheckIn();
    handleAudioSignal(response, {
      checkInResult,
      onCheckInResult,
      resumeScanning,
      stopScanningDuringCheckIn,
      setSubmitting,
    });
  } catch (error) {
    setSubmitting(false);

    if (error instanceof Error && error.name === "CanceledError") {
      console.log("Check-in request canceled by user.");
      if (!checkInResult) resumeScanning();
      return;
    }

    console.error("Error sending image:", error);
    playSound("error");
    setTimeout(() => {
      if (!checkInResult) resumeScanning();
    }, 5000);
  }
};
