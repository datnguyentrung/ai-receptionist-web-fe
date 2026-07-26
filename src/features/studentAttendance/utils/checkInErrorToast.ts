import axios from "axios";
import { toast } from "sonner";

type CheckInToastContent = {
  title: string;
  description: string;
};

type BackendErrorPayload = {
  errorCode?: unknown;
  code?: unknown;
  message?: unknown;
  /** RFC 9457 ProblemDetail fields returned by Spring. */
  title?: unknown;
  detail?: unknown;
  error?: {
    code?: unknown;
    message?: unknown;
  };
};

const CHECK_IN_ERROR_BY_CODE: Record<string, CheckInToastContent> = {
  STUDENT_ALREADY_ENROLLED: {
    title: "Học viên đã được đăng ký",
    description: "Học viên đang theo học lớp này, không thể đăng ký thêm.",
  },
  NOTIFICATION_RECIPIENT_NOT_FOUND: {
    title: "Không tìm thấy thông báo",
    description: "Thông báo này không còn tồn tại hoặc bạn không có quyền truy cập.",
  },
  STUDENT_NOT_FOUND: {
    title: "Không tìm thấy học viên",
    description: "Kiểm tra lại mã học viên rồi thử lại.",
  },
  STUDENT_INACTIVE: {
    title: "Học viên không hoạt động",
    description: "Chỉ học viên đang hoạt động mới có thể điểm danh.",
  },
  STUDENT_ACTIVE_ENROLLMENT_NOT_FOUND: {
    title: "Không có lớp đang hoạt động",
    description: "Học viên chưa có đăng ký lớp đang hoạt động.",
  },
  COACH_NOT_FOUND: {
    title: "Không tìm thấy huấn luyện viên",
    description: "Không tìm thấy thông tin huấn luyện viên.",
  },
  CLASS_NOT_FOUND: {
    title: "Không tìm thấy lớp học",
    description: "Lớp học không tồn tại.",
  },
  CLASS_ALREADY_EXISTS: {
    title: "Lịch học đã tồn tại",
    description: "Mã lịch học đã tồn tại.",
  },
  CLASS_HAS_STUDENTS: {
    title: "Không thể xóa lớp học",
    description: "Lớp học vẫn còn học viên đang theo học.",
  },
  CLASS_HAS_COACHES: {
    title: "Không thể xóa lớp học",
    description: "Lớp học vẫn còn huấn luyện viên được phân công.",
  },
  UNCATEGORIZED_EXCEPTION: {
    title: "Lỗi hệ thống",
    description: "Đã xảy ra lỗi hệ thống không xác định. Vui lòng thử lại sau.",
  },
  ENROLLMENT_NOT_FOUND: {
    title: "Không tìm thấy đăng ký học",
    description: "Không tìm thấy thông tin đăng ký học viên.",
  },
  COACH_ASSIGNMENT_NOT_FOUND: {
    title: "Không tìm thấy phân công",
    description: "Không tìm thấy thông tin phân công huấn luyện viên.",
  },
  COACH_ALREADY_ASSIGNED: {
    title: "Huấn luyện viên đã được phân công",
    description: "Huấn luyện viên đã được phân công cho lớp học này.",
  },
  PAYMENT_NOT_FOUND: {
    title: "Không tìm thấy thanh toán",
    description: "Không tìm thấy thông tin thanh toán.",
  },
  TUITION_ALREADY_PAID: {
    title: "Học phí đã được đóng",
    description: "Học phí tháng này đã được đóng cho lớp học tương ứng.",
  },
  COACH_INACTIVE: {
    title: "Huấn luyện viên không hoạt động",
    description: "Huấn luyện viên không ở trạng thái hoạt động.",
  },
  CLASS_INACTIVE: {
    title: "Lớp học không hoạt động",
    description: "Lớp học không ở trạng thái hoạt động.",
  },
  COACH_ASSIGNMENT_INVALID: {
    title: "Phân công không hợp lệ",
    description: "Không có phân công huấn luyện viên hợp lệ.",
  },
  COACH_ASSIGNMENT_NOT_STARTED: {
    title: "Phân công chưa bắt đầu",
    description: "Phân công huấn luyện viên chưa bắt đầu.",
  },
  COACH_ASSIGNMENT_ENDED: {
    title: "Phân công đã kết thúc",
    description: "Phân công huấn luyện viên đã kết thúc.",
  },
  COACH_ASSIGNMENT_OVERLAPPED: {
    title: "Phân công bị chồng chéo",
    description: "Phân công huấn luyện viên bị trùng hoặc chồng chéo lịch.",
  },
  COACH_TIMESHEET_NOT_FOUND: {
    title: "Không tìm thấy bảng công",
    description: "Không tìm thấy bảng công huấn luyện viên.",
  },
  COACH_TIMESHEET_ALREADY_EXISTS: {
    title: "Huấn luyện viên đã chấm công",
    description: "Huấn luyện viên đã chấm công cho ca dạy này.",
  },
  CLASS_SESSION_NOT_FOUND: {
    title: "Không có buổi học đang hoạt động",
    description: "Không thể xác định buổi học để điểm danh.",
  },
  MULTIPLE_ACTIVE_CLASS_SESSIONS: {
    title: "Không xác định được buổi học",
    description: "Học viên có nhiều buổi học đang hoạt động.",
  },
  ATTENDANCE_ALREADY_EXISTS: {
    title: "Học viên đã được điểm danh",
    description: "Bản ghi điểm danh cho buổi học này đã tồn tại.",
  },
  WRONG_CLASS_DAY: {
    title: "Ngày chấm công không khớp",
    description: "Ngày chấm công không khớp với lịch học.",
  },
  WRONG_CLASS_SHIFT: {
    title: "Ca chấm công không khớp",
    description: "Ca chấm công không khớp với lịch học.",
  },
  CHECK_IN_TOO_EARLY: {
    title: "Chưa đến giờ chấm công",
    description: "Chưa đến thời gian được phép chấm công.",
  },
  CHECK_IN_TOO_LATE: {
    title: "Đã quá giờ chấm công",
    description: "Đã quá thời gian được phép chấm công.",
  },
  ACCESS_DENIED: {
    title: "Không có quyền truy cập",
    description: "Bạn không có quyền truy cập dữ liệu này.",
  },
  INVALID_DATE_RANGE: {
    title: "Khoảng ngày không hợp lệ",
    description: "Khoảng ngày được chọn không hợp lệ.",
  },
  FACE_IMAGE_INVALID: {
    title: "Ảnh khuôn mặt không hợp lệ",
    description: "Vui lòng chụp lại ảnh khuôn mặt rõ nét rồi thử lại.",
  },
  FACE_NOT_RECOGNIZED: {
    title: "Không nhận diện được khuôn mặt",
    description: "Vui lòng nhìn thẳng vào camera, bảo đảm đủ sáng rồi thử lại.",
  },
  FACE_CHECK_IN_PERSON_TYPE_INVALID: {
    title: "Không thể check-in bằng khuôn mặt này",
    description: "Người được nhận diện không thuộc đối tượng có thể điểm danh.",
  },
  PYTHON_BACKEND_UNAVAILABLE: {
    title: "Dịch vụ nhận diện tạm thời không khả dụng",
    description: "Vui lòng thử lại sau ít phút.",
  },
  PYTHON_BACKEND_ERROR: {
    title: "Dịch vụ nhận diện gặp lỗi",
    description: "Dữ liệu trả về từ dịch vụ nhận diện không hợp lệ. Vui lòng thử lại.",
  },
};

const CHECK_IN_ERROR_BY_STATUS: Record<number, CheckInToastContent> = {
  400: {
    title: "Không thể điểm danh",
    description: "Thông tin học viên không hợp lệ hoặc không đủ điều kiện điểm danh.",
  },
  404: {
    title: "Không tìm thấy dữ liệu",
    description: "Không tìm thấy học viên hoặc buổi học đang hoạt động.",
  },
  409: {
    title: "Không thể điểm danh",
    description: "Dữ liệu điểm danh đang xung đột. Vui lòng thử lại.",
  },
  500: {
    title: "Lỗi hệ thống",
    description: "Máy chủ gặp sự cố. Vui lòng thử lại sau.",
  },
  502: {
    title: "Dịch vụ nhận diện gặp lỗi",
    description: "Không thể xử lý kết quả từ dịch vụ nhận diện khuôn mặt.",
  },
  503: {
    title: "Dịch vụ nhận diện tạm thời không khả dụng",
    description: "Vui lòng thử lại sau ít phút.",
  },
};

const DEFAULT_CHECK_IN_ERROR: CheckInToastContent = {
  title: "Không thể điểm danh",
  description: "Vui lòng thử lại.",
};

const NETWORK_CHECK_IN_ERROR: CheckInToastContent = {
  title: "Không thể kết nối máy chủ",
  description: "Kiểm tra kết nối mạng rồi thử lại.",
};

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getBackendError(error: unknown) {
  if (!axios.isAxiosError<BackendErrorPayload>(error)) {
    return {};
  }

  const payload = error.response?.data;
  const code = readString(
    payload?.errorCode ??
      payload?.code ??
      payload?.title ??
      payload?.error?.code,
  );
  const message = readString(
    payload?.message ??
      payload?.detail ??
      payload?.error?.message,
  );

  return { code, message, status: error.response?.status };
}

/** Maps the check-in API's backend error contract to a concise user-facing toast. */
export function getCheckInErrorToast(error: unknown): CheckInToastContent {
  if (!axios.isAxiosError(error)) {
    return DEFAULT_CHECK_IN_ERROR;
  }

  if (!error.response) {
    return NETWORK_CHECK_IN_ERROR;
  }

  const { code, message, status } = getBackendError(error);
  const mappedError =
    (code ? CHECK_IN_ERROR_BY_CODE[code] : undefined) ??
    (status ? CHECK_IN_ERROR_BY_STATUS[status] : undefined) ??
    (status && status >= 500 ? CHECK_IN_ERROR_BY_STATUS[500] : undefined) ??
    DEFAULT_CHECK_IN_ERROR;

  return {
    ...mappedError,
    description: message ?? mappedError.description,
  };
}

export function showCheckInErrorToast(error: unknown) {
  const { title, description } = getCheckInErrorToast(error);
  toast.error(title, { description });
}
