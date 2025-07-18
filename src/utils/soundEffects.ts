// Simple sound effects using Web Audio API
class SoundEffects {
  private audioContext: AudioContext | null = null;

  constructor() {
    // We'll initialize the AudioContext lazily when needed
  }

  // Get or create AudioContext
  private getAudioContext(): AudioContext | null {
    // First check if we have a shared AudioContext from user interaction
    if ((window as any).gameAudioContext) {
      return (window as any).gameAudioContext;
    }

    // If we don't have one yet and this is the first call, try to create one
    if (!this.audioContext) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioContext = new AudioContextClass();
        }
      } catch (e) {
        console.warn('Web Audio API not supported');
        return null;
      }
    }

    return this.audioContext;
  }

  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
    const audioContext = this.getAudioContext();
    if (!audioContext) return;

    // Resume the audio context if it's suspended (needed for Chrome's autoplay policy)
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(err => {
        console.warn('Failed to resume AudioContext:', err);
      });
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }

  wordFound(): void {
    // Play a pleasant ascending chord
    this.createTone(523.25, 0.2); // C5
    setTimeout(() => this.createTone(659.25, 0.2), 100); // E5
    setTimeout(() => this.createTone(783.99, 0.3), 200); // G5
  }

  gameComplete(): void {
    // Play a victory fanfare
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((note, index) => {
      setTimeout(() => this.createTone(note, 0.4), index * 150);
    });
  }

  buttonClick(): void {
    this.createTone(800, 0.1, 'square');
  }

  hintUsed(): void {
    this.createTone(440, 0.3, 'triangle');
  }

  cellHover(): void {
    this.createTone(1000, 0.05, 'sine');
  }
}

export const soundEffects = new SoundEffects();