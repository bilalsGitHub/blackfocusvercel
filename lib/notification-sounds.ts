"use client";

// Create notification sounds using Web Audio API
export class NotificationSoundPlayer {
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  // Play bell sound (single tone)
  private playBell(volume: number) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = 800; // Hz
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.5
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  // Play chime sound (two tones in sequence)
  private playChime(volume: number) {
    if (!this.audioContext) return;

    // First tone
    const osc1 = this.audioContext.createOscillator();
    const gain1 = this.audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(this.audioContext.destination);
    osc1.frequency.value = 659.25; // E5
    osc1.type = "sine";
    gain1.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gain1.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.3
    );
    osc1.start(this.audioContext.currentTime);
    osc1.stop(this.audioContext.currentTime + 0.3);

    // Second tone
    const osc2 = this.audioContext.createOscillator();
    const gain2 = this.audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(this.audioContext.destination);
    osc2.frequency.value = 523.25; // C5
    osc2.type = "sine";
    gain2.gain.setValueAtTime(volume, this.audioContext.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.6
    );
    osc2.start(this.audioContext.currentTime + 0.15);
    osc2.stop(this.audioContext.currentTime + 0.6);
  }

  // Play ding sound (pleasant ascending tones)
  private playDing(volume: number) {
    if (!this.audioContext) return;

    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    frequencies.forEach((freq, index) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      osc.frequency.value = freq;
      osc.type = "sine";

      const startTime = this.audioContext!.currentTime + index * 0.1;
      gain.gain.setValueAtTime(volume * 0.7, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  // Main play method
  play(soundType: "bell" | "chime" | "ding" | "none", volume: number = 0.5) {
    if (soundType === "none" || !this.audioContext) return;

    // Resume audio context if suspended (required for some browsers)
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    // Normalize volume (0-1)
    const normalizedVolume = Math.max(0, Math.min(1, volume));

    switch (soundType) {
      case "bell":
        this.playBell(normalizedVolume);
        break;
      case "chime":
        this.playChime(normalizedVolume);
        break;
      case "ding":
        this.playDing(normalizedVolume);
        break;
    }
  }

  // Cleanup
  close() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Singleton instance
let soundPlayer: NotificationSoundPlayer | null = null;

export function getNotificationSoundPlayer(): NotificationSoundPlayer {
  if (!soundPlayer) {
    soundPlayer = new NotificationSoundPlayer();
  }
  return soundPlayer;
}
