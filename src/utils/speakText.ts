export const speakText = (text: string) => {
  if (!("speechSynthesis" in window)) {
    console.warn("Trình duyệt không hỗ trợ Web Speech API");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "vi-VN";
  utterance.rate = 1;
  utterance.pitch = 1;

  // Lấy danh sách tất cả các giọng đang có trên máy
  const voices = window.speechSynthesis.getVoices();

  // Cố gắng tìm giọng nữ tiếng Việt quen thuộc
  // - "Google tiếng Việt": Giọng nữ khá ổn của trình duyệt Chrome
  // - "Linh": Giọng nữ mặc định cực hay trên macOS
  // - "HoaiMy": Giọng nữ trên Windows (nếu đã cài gói ngôn ngữ)
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
};
