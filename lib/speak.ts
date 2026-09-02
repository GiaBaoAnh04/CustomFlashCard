export function speak(text: string, language: "en" | "ko") {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.cancel(); // huỷ câu đang đọc dở nếu bấm liên tục

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === "ko" ? "ko-KR" : "en-US";
  utterance.rate = 0.5; // đọc chậm hơn 1 chút cho dễ nghe khi học

  window.speechSynthesis.speak(utterance);
}
