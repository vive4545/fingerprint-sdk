/**
 * Audio fingerprinting using the AudioContext API.
 */
export const isBrowser = typeof window !== 'undefined';

export interface AudioFingerprint {
  sampleRate: number;
  oscillator: string;
  dynamics: string;
}

export async function getAudioFingerprint(): Promise<AudioFingerprint | null> {
  if (!isBrowser) return null;

  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return null;

    const context = new AudioContext();
    const result: AudioFingerprint = {
      sampleRate: context.sampleRate,
      oscillator: '',
      dynamics: ''
    };

    // Oscillator response
    const oscillator = context.createOscillator();
    const analyser = context.createAnalyser();
    const gain = context.createGain();
    const scriptProcessor = context.createScriptProcessor(4096, 1, 1);

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(10000, context.currentTime);

    gain.gain.value = 0; // Silent

    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(context.destination);

    // This is a simplified version for fingerprinting
    // Real-world implementations would process actual audio buffers
    // We'll capture a hash of the analyser data or similar
    const data = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(data);
    result.oscillator = btoa(data.slice(0, 10).join(','));

    context.close();
    return result;
  } catch (e) {
    return null;
  }
}
