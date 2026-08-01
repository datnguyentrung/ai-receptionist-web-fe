import { notifyAuthSessionInvalid } from "@/features/auth/utils/authEvents";
import type { AuthResponse } from "@/types";
import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import axios from "axios";
import axiosRetry from "axios-retry";
import { useAuthStore } from "../store/authStore";
import { writeDebugStorage } from "../utils/debugStorage";
import { queryClient } from "./react-query";

const JAVA_API_URL =
  import.meta.env.VITE_API_URL_JAVA || "http://localhost:8080";
const PYTHON_API_URL =
  import.meta.env.VITE_API_URL_PYTHON || "http://localhost:8000";

console.log("🔧 JAVA_API_URL:", JAVA_API_URL);
console.log("🔧 PYTHON_API_URL:", PYTHON_API_URL);

// --- CÁC BIẾN TOÀN CỤC CHO CƠ CHẾ REFRESH TOKEN ---
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string | null) => void;
  reject: (reason?: unknown) => void;
}> = [];

// Xử lý các request đang phải xếp hàng chờ refresh token
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};
// --------------------------------------------------

function setupRetry(instance: AxiosInstance): AxiosInstance {
  axiosRetry(instance, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
      const status = error.response?.status;
      if (axiosRetry.isNetworkError(error)) {
        return true;
      }
      return status === 429 || (status !== undefined && status >= 500);
    },
    onRetry: (retryCount, error, requestConfig) => {
      console.log(
        `🔁 Retry #${retryCount} ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`,
        { status: error.response?.status, message: error.message },
      );
    },
  });
  return instance;
}

function setupInterceptors(instance: AxiosInstance): AxiosInstance {
  // Request interceptor
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (typeof FormData !== "undefined" && config.data instanceof FormData) {
        // Let the browser add the multipart boundary for FormData requests.
        config.headers.delete("Content-Type");
      }

      const token = useAuthStore.getState().accessToken;
      const url = config.url ?? "";
      const shouldSkipAuthHeader =
        url.includes("/auth/login") || url.includes("/auth/refresh");

      if (token && !shouldSkipAuthHeader) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }
      return config;
    },
    (error) => {
      console.error("❌ Request Error:", error);
      return Promise.reject(error);
    },
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };
      const status = error.response?.status;
      const requestUrl = originalRequest.url ?? "";
      const isAuthRefreshRequest = requestUrl.includes("/auth/refresh");
      const isAuthLoginRequest = requestUrl.includes("/auth/login");

      // === BẮT ĐẦU LUỒNG REFRESH TOKEN TỰ ĐỘNG ===
      // Bắt lỗi 401, chưa từng retry, và KHÔNG PHẢI LÀ ĐANG GỌI API REFRESH (tránh lặp vô hạn)
      if (
        status === 401 &&
        !originalRequest._retry &&
        !isAuthRefreshRequest &&
        !isAuthLoginRequest
      ) {
        // 1. Nếu đang có một request khác gọi refresh rồi, các request 401 tiếp theo phải xếp hàng
        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (token) {
                originalRequest.headers.set("Authorization", `Bearer ${token}`);
              }
              return instance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        // 2. Đánh dấu request này đang đi lấy token mới
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // 3. DÙNG AXIOS THƯỜNG ĐỂ GỌI API REFRESH (Tránh Circular Dependency với authApi)
          const res = await axios.post<AuthResponse>(
            "/auth/refresh",
            undefined,
            {
              baseURL: JAVA_API_URL,
              withCredentials: true,
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ngrok-skip-browser-warning": "true",
              },
            },
          );

          const newAccessToken = res.data.accessToken ?? null;

          // 4. Refresh response is the source of auth state, including context.
          useAuthStore.getState().setAuthFromResponse(res.data);
          if (res.data.requiresContextSelection) {
            queryClient.clear();
          }

          // 5. Thả cho các request đang xếp hàng chạy tiếp
          processQueue(null, newAccessToken);

          // 6. Chạy lại chính cái request vừa bị chết (401) lúc nãy
          if (newAccessToken) {
            originalRequest.headers.set(
              "Authorization",
              `Bearer ${newAccessToken}`,
            );
          }
          return instance(originalRequest);
        } catch (refreshError) {
          // TRƯỜNG HỢP XẤU NHẤT: Refresh Token cũng hết hạn hoặc bị lỗi
          processQueue(refreshError, null);
          writeDebugStorage("axios_redirect_debug", {
            source: "axiosInstance.refreshToken",
            originalUrl: originalRequest.url,
            originalStatus: status,
            refreshStatus: axios.isAxiosError(refreshError)
              ? refreshError.response?.status
              : undefined,
            refreshMessage:
              refreshError instanceof Error ? refreshError.message : undefined,
          });

          const refreshStatus = axios.isAxiosError(refreshError)
            ? refreshError.response?.status
            : undefined;

          if (refreshStatus !== 401 && refreshStatus !== 403) {
            return Promise.reject(refreshError);
          }

          console.log("🔒 Refresh Token hết hạn, đá văng về Login!");
          queryClient.clear();
          useAuthStore.getState().clearAuth(); // Xóa sạch state
          notifyAuthSessionInvalid();

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false; // Mở khóa luồng
        }
      }
      // === KẾT THÚC LUỒNG REFRESH TOKEN ===

      // Xử lý các lỗi khác
      switch (status) {
        case 403:
          console.log("🚫 Forbidden - Insufficient permissions");
          break;
        case 404:
          console.log("🔍 Not Found");
          break;
        case 500:
          console.log("🔥 Server Error");
          break;
      }

      return Promise.reject(error);
    },
  );

  return instance;
}

// 🚀 Instance cho Java
export const javaApi = setupInterceptors(
  setupRetry(
    axios.create({
      baseURL: JAVA_API_URL,
      timeout: 30000,
      withCredentials: true, // QUAN TRỌNG: Bật cookie cho Java API
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true", // Header đặc biệt để bỏ qua cảnh báo của ngrok khi dùng tunnel
      },
    }),
  ),
);

// 🤖 Instance cho Python
export const pythonApi = setupInterceptors(
  setupRetry(
    axios.create({
      baseURL: PYTHON_API_URL,
      timeout: 30000,
      withCredentials: true, // Tùy chọn: Nếu Python cũng dùng cookie
    }),
  ),
);
