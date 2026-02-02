// src/lib/audio.ts

export const playSound = (filename: string, volume = 0.5) => {
  if (typeof window !== 'undefined') {
    const audio = new Audio(`/sounds/${filename}`);
    audio.volume = volume;
    audio.play().catch((e) => console.log("Audio play error:", e));
  }
};