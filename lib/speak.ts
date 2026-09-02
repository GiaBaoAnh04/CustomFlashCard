let voicesCache: SpeechSynthesisVoice[] = [];

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      voicesCache = voices;
      resolve(voices);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      voicesCache = window.speechSynthesis.getVoices();
      resolve(voicesCache);
    };
  });
}

function pickBestVoice(
  voices: SpeechSynthesisVoice[],
  lang: string
): SpeechSynthesisVoice | undefined {
  const candidates = voices.filter((v) => v.lang === lang);

  return (
    candidates.find((v) => /google|natural|online/i.test(v.name)) ??
    candidates[0]
  );
}

export async function speak(text: string, language: "en" | "ko") {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const lang = language === "ko" ? "ko-KR" : "en-US";
  const voices = voicesCache.length ? voicesCache : await loadVoices();
  const voice = pickBestVoice(voices, lang);

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.85;
  if (voice) utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
}
