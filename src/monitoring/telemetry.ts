/**
 * Telemetry and Performance Monitoring Module.
 */

export interface CollectorStats {
  duration: number; // ms
  success: boolean;
  error?: string;
}

export interface SDKTelemetry {
  p50Latency: number;
  p95Latency: number;
  collectorPerformance: Record<string, CollectorStats>;
  timestamp: number;
}

export class TelemetryManager {
  private stats: Record<string, CollectorStats> = {};

  public record(collector: string, duration: number, success: boolean, error?: string): void {
    this.stats[collector] = { duration, success, error };
  }

  public getReport(): SDKTelemetry {
    const durations = Object.values(this.stats).map(s => s.duration).sort((a, b) => a - b);
    
    return {
      p50Latency: durations[Math.floor(durations.length * 0.5)] || 0,
      p95Latency: durations[Math.floor(durations.length * 0.95)] || 0,
      collectorPerformance: { ...this.stats },
      timestamp: Date.now()
    };
  }
}
