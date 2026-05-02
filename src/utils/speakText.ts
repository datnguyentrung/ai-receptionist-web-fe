export const speakText = (text: string): Promise<void> => {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      console.warn("Trình duyệt không hỗ trợ Web Speech API");
      resolve(); // Bắt buộc gọi resolve() để không bị treo luồng (block) nếu máy không hỗ trợ
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "vi-VN";
    utterance.rate = 1;
    utterance.pitch = 1;

    // --- BỔ SUNG QUAN TRỌNG: Lắng nghe sự kiện kết thúc ---
    // Khi AI đọc xong câu
    utterance.onend = () => {
      resolve();
    };

    // Khi bị lỗi (hoặc bị hàm window.speechSynthesis.cancel() cắt ngang khi tắt modal)
    utterance.onerror = (event) => {
      // Bỏ qua log lỗi nếu lý do là bị "cancel" chủ động
      if (event.error !== "canceled") {
        console.warn("Lỗi khi phát âm thanh Text-to-Speech:", event);
      }
      resolve(); // Vẫn phải resolve để luồng code (resume camera) được chạy tiếp
    };
    // -----------------------------------------------------

    // Lấy danh sách tất cả các giọng đang có trên máy
    const voices = window.speechSynthesis.getVoices();

    // Cố gắng tìm giọng nữ tiếng Việt quen thuộc
    const vietnameseVoice = voices.find(
      (voice) =>
        voice.name.includes("Microsoft An") ||
        voice.name.includes("Linh") ||
        voice.name.includes("HoaiMy") ||
        voice.lang.includes("vi"), // Fallback: Lấy bất kỳ giọng tiếng Việt nào tìm thấy
    );

    // Nếu tìm thấy, gán giọng đó cho câu nói
    if (vietnameseVoice) {
      utterance.voice = vietnameseVoice;
    } else {
      console.warn(
        "Máy này không có sẵn giọng tiếng Việt chuẩn, sẽ dùng giọng mặc định.",
      );
    }

    window.speechSynthesis.speak(utterance);
  });
};
