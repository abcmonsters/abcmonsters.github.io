import manifest from './voice-manifest.json';
import { pickEnglishVoice } from './speech';
const clips: Record<string, string> = manifest;
let player: HTMLAudioElement | null = null;
let generation = 0;
export function stopVoice() {
  generation++;
  if (player) {
    player.pause();
    player.onended = null;
    player = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window)
    window.speechSynthesis.cancel();
}
export function voiceSpeaking() {
  return (
    !!(player && !player.paused && !player.ended) ||
    (typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      window.speechSynthesis.speaking &&
      !window.speechSynthesis.paused)
  );
}
export function voiceLabel(level: number) {
  return clips[String.fromCharCode(97 + level)]
    ? 'Google AI Studio · Kore · English'
    : 'Giọng tiếng Anh của thiết bị';
}
export function speakVoice(phrase: string) {
  stopVoice();
  const token = generation;
  const normalized = phrase.toLowerCase().trim();
  const source = clips[normalized];
  let failed = false;
  const fallback = () => {
    if (failed || token !== generation || !('speechSynthesis' in window))
      return;
    failed = true;
    const u = new SpeechSynthesisUtterance(phrase);
    u.lang = 'en-US';
    u.rate = 0.88;
    const voice = pickEnglishVoice(window.speechSynthesis.getVoices());
    if (voice) u.voice = voice;
    window.speechSynthesis.speak(u);
  };
  if (!source) {
    fallback();
    return;
  }
  const sound = new Audio(source);
  player = sound;
  sound.onended = () => {
    if (player === sound) player = null;
  };
  const fail = () => {
    if (player === sound) {
      sound.pause();
      player = null;
    }
    fallback();
  };
  sound.onerror = fail;
  void sound.play().catch(fail);
}
