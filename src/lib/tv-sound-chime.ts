/**
 * TV Queue Audio & Speech Synthesizer Utility
 * Generates offline 2-tone hospital bell chimes using Web Audio API
 * and speaks queue calls using Web Speech API (id-ID).
 */

/**
 * Converts a number string into natural Indonesian words.
 * Supports leading zeros ("01" -> "kosong satu", "005" -> "kosong kosong lima")
 * and standard numbers ("12" -> "dua belas", "20" -> "dua puluh", etc.).
 */
export function formatIndonesianNumber(numStr: string): string {
  const trimmed = numStr.trim();
  if (!trimmed) return '';

  const units = [
    '',
    'satu',
    'dua',
    'tiga',
    'empat',
    'lima',
    'enam',
    'tujuh',
    'delapan',
    'sembilan',
    'sepuluh',
    'sebelas',
  ];

  function toWords(n: number): string {
    if (n === 0) return 'kosong';
    if (n < 12) return units[n];
    if (n < 20) return `${units[n - 10]} belas`;
    if (n < 100) {
      const tens = Math.floor(n / 10);
      const rem = n % 10;
      return `${units[tens]} puluh${rem > 0 ? ` ${units[rem]}` : ''}`;
    }
    if (n < 200) {
      const rem = n % 100;
      return `seratus${rem > 0 ? ` ${toWords(rem)}` : ''}`;
    }
    if (n < 1000) {
      const hundreds = Math.floor(n / 100);
      const rem = n % 100;
      return `${units[hundreds]} ratus${rem > 0 ? ` ${toWords(rem)}` : ''}`;
    }
    return String(n);
  }

  // Handle leading zeroes (e.g., "01", "02", "003")
  const leadingZeroMatch = trimmed.match(/^(0+)(\d*)$/);
  if (leadingZeroMatch) {
    const zeroCount = leadingZeroMatch[1].length;
    const zeros = Array(zeroCount).fill('kosong').join(' ');
    const rest = leadingZeroMatch[2];
    if (!rest) return zeros;
    const restNum = parseInt(rest, 10);
    return `${zeros} ${toWords(restNum)}`.trim();
  }

  const num = parseInt(trimmed, 10);
  if (!isNaN(num)) {
    return toWords(num);
  }

  return trimmed;
}

/**
 * Formats a queue number for clear Indonesian speech synthesis.
 * Example:
 *  "R-01" -> "R, kosong satu"
 *  "A-02" -> "A, kosong dua"
 *  "B-15" -> "B, lima belas"
 *  "C-10" -> "C, sepuluh"
 */
export function formatQueueNumberForSpeech(queueNumber: string): string {
  if (!queueNumber) return '';

  const cleaned = queueNumber.trim();

  // Pattern: Letter prefix followed optionally by hyphen/space and digits
  // e.g. "R-01", "r01", "A-02", "POLI-01"
  const match = cleaned.match(/^([a-zA-Z]+)[-\s]?(\d+)$/);
  if (match) {
    const prefix = match[1].toUpperCase();
    const digits = match[2];
    const spokenDigits = formatIndonesianNumber(digits);
    return `${prefix}, ${spokenDigits}`;
  }

  // Pure numbers: "01" -> "kosong satu"
  if (/^\d+$/.test(cleaned)) {
    return formatIndonesianNumber(cleaned);
  }

  // Fallback: replace hyphen with space, preserving full words
  return cleaned.replace(/-/g, ' ');
}

class TVSoundManager {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Finds the best Indonesian voice available in the browser.
   */
  private getIndonesianVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // 1. Exact id-ID voice match
    const exactId = voices.find(
      (v) =>
        v.lang.toLowerCase() === 'id-id' ||
        v.lang.toLowerCase() === 'id_id' ||
        v.lang.toLowerCase().startsWith('id')
    );
    if (exactId) return exactId;

    // 2. Voice name mentioning Indonesian or regional names (e.g. Damayanti, Gadis, Andika)
    const namedId = voices.find((v) => {
      const name = v.name.toLowerCase();
      return (
        name.includes('indonesia') ||
        name.includes('damayanti') ||
        name.includes('gadis') ||
        name.includes('andika')
      );
    });
    if (namedId) return namedId;

    return null;
  }

  /**
   * Plays classic 2-tone hospital bell chime (Ding-Dong)
   * Tone 1: E5 (659.25 Hz) -> Tone 2: C5 (523.25 Hz)
   */
  public playHospitalChime(): Promise<void> {
    return new Promise((resolve) => {
      try {
        const ctx = this.getAudioContext();
        if (!ctx) {
          resolve();
          return;
        }

        const now = ctx.currentTime;

        // --- Tone 1: E5 (Ding) ---
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(659.25, now);

        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.28, now + 0.04);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc1.connect(gain1);
        gain1.connect(ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.46);

        // --- Tone 2: C5 (Dong) ---
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(523.25, now + 0.38);

        gain2.gain.setValueAtTime(0, now + 0.38);
        gain2.gain.linearRampToValueAtTime(0.28, now + 0.42);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc2.start(now + 0.38);
        osc2.stop(now + 0.96);

        setTimeout(() => {
          resolve();
        }, 1000);
      } catch {
        resolve();
      }
    });
  }

  /**
   * Speaks queue call in Indonesian using SpeechSynthesis
   */
  public async callQueueNumber({
    queueNumber,
    counterName,
    roomName,
    withChime = true,
  }: {
    queueNumber: string;
    counterName: string;
    roomName?: string;
    withChime?: boolean;
  }): Promise<void> {
    if (withChime) {
      await this.playHospitalChime();
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop prior speech

      // Cleanly format queue number: e.g. "R-01" -> "R, kosong satu"
      const formattedNumber = formatQueueNumberForSpeech(queueNumber);
      const roomText = roomName && roomName !== counterName ? `, ${roomName}` : '';
      const textToSpeak = `Nomor antrean ${formattedNumber}, silakan menuju ke ${counterName}${roomText}.`;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'id-ID';
      utterance.rate = 0.9; // Clear, calm hospital announcement pace
      utterance.pitch = 1.0;

      const idVoice = this.getIndonesianVoice();
      if (idVoice) {
        utterance.voice = idVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // SpeechSynthesis silent fallback
    }
  }
}

export const tvSoundManager = new TVSoundManager();

/**
 * Masks patient name for public TV display privacy compliance
 * Example: "Pasien Contoh A" -> "P**** C**** A"
 */
export function maskPatientName(name?: string): string {
  if (!name || name.trim() === '') return '—';
  const parts = name.trim().split(/\s+/);
  return parts
    .map((word) => {
      if (word.length <= 2) return word;
      return word[0] + '*'.repeat(Math.min(word.length - 1, 4));
    })
    .join(' ');
}
