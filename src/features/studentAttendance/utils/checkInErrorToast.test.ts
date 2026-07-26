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
    ["STUDENT_ALREADY_ENROLLED", "Học viên đã được đăng ký"],
    ["STUDENT_NOT_FOUND", "Không tìm thấy học viên"],
    ["STUDENT_INACTIVE", "Học viên không hoạt động"],
    ["STUDENT_ACTIVE_ENROLLMENT_NOT_FOUND", "Không có lớp đang hoạt động"],
    ["COACH_NOT_FOUND", "Không tìm thấy huấn luyện viên"],
    ["CLASS_NOT_FOUND", "Không tìm thấy lớp học"],
    ["CLASS_ALREADY_EXISTS", "Lịch học đã tồn tại"],
    ["CLASS_HAS_STUDENTS", "Không thể xóa lớp học"],
    ["CLASS_HAS_COACHES", "Không thể xóa lớp học"],
    ["UNCATEGORIZED_EXCEPTION", "Lỗi hệ thống"],
    ["ENROLLMENT_NOT_FOUND", "Không tìm thấy đăng ký học"],
    ["COACH_ASSIGNMENT_NOT_FOUND", "Không tìm thấy phân công"],
    ["COACH_ALREADY_ASSIGNED", "Huấn luyện viên đã được phân công"],
    ["PAYMENT_NOT_FOUND", "Không tìm thấy thanh toán"],
    ["TUITION_ALREADY_PAID", "Học phí đã được đóng"],
    ["COACH_INACTIVE", "Huấn luyện viên không hoạt động"],
    ["CLASS_INACTIVE", "Lớp học không hoạt động"],
    ["COACH_ASSIGNMENT_INVALID", "Phân công không hợp lệ"],
    ["COACH_ASSIGNMENT_NOT_STARTED", "Phân công chưa bắt đầu"],
    ["COACH_ASSIGNMENT_ENDED", "Phân công đã kết thúc"],
    ["COACH_ASSIGNMENT_OVERLAPPED", "Phân công bị chồng chéo"],
    ["COACH_TIMESHEET_NOT_FOUND", "Không tìm thấy bảng công"],
    ["COACH_TIMESHEET_ALREADY_EXISTS", "Huấn luyện viên đã chấm công"],
    ["CLASS_SESSION_NOT_FOUND", "Không có buổi học đang hoạt động"],
    ["MULTIPLE_ACTIVE_CLASS_SESSIONS", "Không xác định được buổi học"],
    ["ATTENDANCE_ALREADY_EXISTS", "Học viên đã được điểm danh"],
    ["WRONG_CLASS_DAY", "Ngày chấm công không khớp"],
    ["WRONG_CLASS_SHIFT", "Ca chấm công không khớp"],
    ["CHECK_IN_TOO_EARLY", "Chưa đến giờ chấm công"],
    ["CHECK_IN_TOO_LATE", "Đã quá giờ chấm công"],
    ["ACCESS_DENIED", "Không có quyền truy cập"],
    ["INVALID_DATE_RANGE", "Khoảng ngày không hợp lệ"],
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

  it("reads Spring ProblemDetail title and detail fields", () => {
    const springProblemDetail = {
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          title: "COACH_ASSIGNMENT_INVALID",
          detail: "Không có phân công huấn luyện viên hợp lệ",
          instance: "/api/v1/persons/face-check-in",
        },
      },
    } as never;

    expect(getCheckInErrorToast(springProblemDetail)).toEqual({
      title: "Phân công không hợp lệ",
      description: "Không có phân công huấn luyện viên hợp lệ",
    });
  });
});
