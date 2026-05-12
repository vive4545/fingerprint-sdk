/**
 * Utility for calculating signal entropy and weights.
 */

export interface SignalMetadata {
  entropy: number; // estimated bits of entropy
  stability: 'stable' | 'volatile';
  weight: number; // 0-1
}

/**
 * Estimates Shannon entropy based on common distributions.
 * This is a heuristic as real entropy depends on the population data.
 */
export function estimateEntropy(collectorName: string, value: any): number {
  const entropyMap: Record<string, number> = {
    canvas: 14.5,
    webgl: 11.0,
    audio: 10.0,
    fonts: 12.0,
    ua: 10.0,
    screen: 7.0,
    timezone: 3.0,
    language: 2.0,
    ip: 15.0, // High entropy but volatile
    webrtc: 8.0,
    sensors: 4.0,
  };

  return entropyMap[collectorName] || 1.0;
}

export function getSignalMetadata(collectorName: string, value: any): SignalMetadata {
  const stableSignals = ['canvas', 'webgl', 'fonts', 'screen', 'audio'];
  const isStable = stableSignals.includes(collectorName);
  
  return {
    entropy: estimateEntropy(collectorName, value),
    stability: isStable ? 'stable' : 'volatile',
    weight: isStable ? 1.0 : 0.4,
  };
}

export function calculateConfidence(entropy: number, failedCount: number, totalCount: number): number {
  const successRate = (totalCount - failedCount) / totalCount;
  const entropyScore = Math.min(entropy / 50, 1); // Normalize 50 bits to 100%
  
  return Math.round((successRate * 0.4 + entropyScore * 0.6) * 100);
}
