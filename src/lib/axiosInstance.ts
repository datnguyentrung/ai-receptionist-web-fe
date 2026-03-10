import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import axios from "axios";
import { useAuthStore } from "../store/authStore";

// API configuration from environment variables
const JAVA_API_URL =
  import.meta.env.VITE_API_URL_JAVA || "http://localhost:8080";
const PYTHON_API_URL =
  import.meta.env.VITE_API_URL_PYTHON || "http://localhost:8000";

console.log("🔧 JAVA_API_URL:", JAVA_API_URL);
console.log("🔧 PYTHON_API_URL:", PYTHON_API_URL);

function setupInterceptors(instance: AxiosInstance): AxiosInstance {
  // Request interceptor - add token automatically
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = useAuthStore.getState().accessToken;
      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
      );
      return config;
    },
    (error) => {
      console.error("❌ Request Error:", error);
      return Promise.reject(error);
    },
  );

  // Response interceptor - handle response and errors
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
      return response;
    },
    async (error) => {
      const { response, config } = error;

      console.error(`❌ API Error: ${response?.status} ${config?.url}`, {
        status: response?.status,
        data: response?.data,
        message: response?.data?.message,
      });

      // Handle common errors
      switch (response?.status) {
        case 401:
          // Token expired - clear token and redirect to login
          console.log("🔒 Unauthorized - Token expired");
          localStorage.removeItem("access_token");
          // window.location.href = '/login';
          break;
        case 403:
          console.log("🚫 Forbidden - Insufficient permissions");
          break;
        case 404:
          console.log("🔍 Not Found");
          break;
        case 500:
          console.log("🔥 Server Error");
          break;
        default:
          console.log("🌐 Network or Unknown Error");
      }

      return Promise.reject(error);
    },
  );

  return instance;
}

// 🚀 Instance cho Java (Xử lý nghiệp vụ chính, CRUD, tốc độ cao)
export const javaApi = setupInterceptors(
  axios.create({
    baseURL: JAVA_API_URL,
    timeout: 10000, // 10 giây
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  }),
);

// 🤖 Instance cho Python (AI Receptionist, nhận diện khuôn mặt, xử lý file nặng)
export const pythonApi = setupInterceptors(
  axios.create({
    baseURL: PYTHON_API_URL,
    timeout: 30000, // 30 giây (Model AI xử lý lâu hơn)
    // LƯU Ý KỸ: Không fix cứng Content-Type là JSON ở đây!
    // Khi bạn ném FormData (ảnh) vào, Axios sẽ tự động set thành multipart/form-data
  }),
);
