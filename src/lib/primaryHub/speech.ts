/** Lightweight English playback for primary hub stages. */
export function hubSpeak(text: string, rate = 0.85) {
  if (typeof window === "undefined") return;
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = rate;
    const voices = window.speechSynthesis.getVoices();
    const pick =
      voices.find((v) => v.lang.startsWith("en") && /female|samantha|aria|google us/i.test(v.name)) ||
      voices.find((v) => v.lang.startsWith("en"));
    if (pick) u.voice = pick;
    window.speechSynthesis.speak(u);
  }
}
