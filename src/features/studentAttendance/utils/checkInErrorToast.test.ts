import { describe, expect, it } from "vitest";
import { getCheckInErrorToast } from "./checkInErrorToast";

const createBackendError = (errorCode: string, message?: string) =>
  ({
    isAxiosError: true,
    response: {
      status: 422,
      data: { errorCode, ...(message ? { message } : {}) },
    },
  }) as never;

describe("getCheckInErrorToast", () => {
  it.each([
    ["NOTIFICATION_RECIPIENT_NOT_FOUND", "Không tìm thấy thông báo"],
    ["FACE_IMAGE_INVALID", "Ảnh khuôn mặt không hợp lệ"],
    ["FACE_NOT_RECOGNIZED", "Không nhận diện được khuôn mặt"],
    ["FACE_CHECK_IN_PERSON_TYPE_INVALID", "Không thể check-in bằng khuôn mặt này"],
    ["PYTHON_BACKEND_UNAVAILABLE", "Dịch vụ nhận diện tạm thời không khả dụng"],
    ["PYTHON_BACKEND_ERROR", "Dịch vụ nhận diện gặp lỗi"],
  ])("maps %s", (errorCode, title) => {
    expect(getCheckInErrorToast(createBackendError(errorCode))).toMatchObject({
      title,
    });
  });

  it("uses the backend message when it is supplied", () => {
    expect(
      getCheckInErrorToast(
        createBackendError("FACE_NOT_RECOGNIZED", "Thông điệp từ backend"),
      ),
    ).toMatchObject({
      title: "Không nhận diện được khuôn mặt",
      description: "Thông điệp từ backend",
    });
  });
});
