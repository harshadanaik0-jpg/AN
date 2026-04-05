import { SOUND_EFFECTS } from '../constants';

class SoundService {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private volume: number = 0.7;

  constructor() {
    // Preload sounds
    if (typeof window !== 'undefined') {
      Object.entries(SOUND_EFFECTS).forEach(([key, url]) => {
        const audio = new Audio();
        audio.src = url;
        audio.crossOrigin = 'anonymous';
        audio.preload = 'auto';
        
        // Add error listener to handle broken URLs gracefully
        audio.addEventListener('error', (e) => {
          console.warn(`Failed to load sound: ${key} from ${url}`, e);
        });

        this.sounds.set(key, audio);
      });
    }
  }

  setVolume(volume: number) {
    this.volume = volume;
    this.sounds.forEach(audio => {
      audio.volume = volume;
    });
  }

  play(soundName: keyof typeof SOUND_EFFECTS) {
    const audio = this.sounds.get(soundName);
    if (audio && audio.readyState >= 2) { // HAVE_CURRENT_DATA or better
      audio.volume = this.volume;
      audio.currentTime = 0;
      audio.play().catch(e => {
        // Only log if it's not an autoplay restriction error
        if (e.name !== 'NotAllowedError') {
          console.warn(`Sound play error for ${soundName}:`, e.message);
        }
      });
    }
  }
}

export const soundService = new SoundService();
