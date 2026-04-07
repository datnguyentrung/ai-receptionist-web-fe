const PYTHON_API_URL =
  import.meta.env.VITE_API_URL_PYTHON || "http://localhost:8000";

export const ttsAPI = {
  getGreetingAudioUrl: (name: string, belt: string): string => {
    if (!name) return ""; // Không tạo URL nếu không có tên
    return `${PYTHON_API_URL}/tts/greeting?name=${encodeURIComponent(name)}&belt=${encodeURIComponent(belt)}`;
  },
};
