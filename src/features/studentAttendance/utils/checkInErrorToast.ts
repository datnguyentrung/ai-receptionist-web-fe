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
  error?: {
    code?: unknown;
    message?: unknown;
  };
};

const CHECK_IN_ERROR_BY_CODE: Record<string, CheckInToastContent> = {
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
    payload?.errorCode ?? payload?.code ?? payload?.error?.code,
  );
  const message = readString(payload?.message ?? payload?.error?.message);

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
