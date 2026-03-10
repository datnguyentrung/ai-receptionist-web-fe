import { pythonApi } from "@/lib/axiosInstance";

export const ttsAPI = {
  textToSpeech: async ({ name, belt }: { name: string; belt: string }) => {
    const response = await pythonApi.post(
      "/tts/greeting",
      { name, belt },
      {
        responseType: "blob", // QUAN TRỌNG: Phải có dòng này để báo Axios đây là file âm thanh
      },
    );

    // Tạo một URL tạm thời từ file Blob nhận được để có thể nhét vào thẻ <audio src="...">
    return window.URL.createObjectURL(response.data);
  },
};
