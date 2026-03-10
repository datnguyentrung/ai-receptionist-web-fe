// Adjust this value to make the error sound louder or softer (0.5 means 50% of the original volume)
// Max volume is 1.0, and you can set it lower if the sound is too loud on some devices
const NEGATIVE_VOLUME = 0.5;

export const playSound = (type: "success" | "error") => {
  try {
    const AudioContext =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof window.AudioContext;
        }
      ).webkitAudioContext;
    if (!AudioContext) return;

    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === "success") {
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        1200,
        audioCtx.currentTime + 0.1,
      );
      gainNode.gain.setValueAtTime(NEGATIVE_VOLUME, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + 0.15,
      );
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
    } else {
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(
        100,
        audioCtx.currentTime + 0.2,
      );
      gainNode.gain.setValueAtTime(NEGATIVE_VOLUME, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    }
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};
