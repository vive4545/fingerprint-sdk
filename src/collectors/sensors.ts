/**
 * Device sensor fingerprinting (Battery, Motion, Network).
 */
export const isBrowser = typeof window !== 'undefined';

export interface SensorFingerprint {
  battery?: {
    level: number;
    charging: boolean;
  };
  network?: {
    type: string;
    downlink: number;
    rtt: number;
  };
  motion: {
    accelerometer: boolean;
    gyroscope: boolean;
  };
}

export async function getSensorFingerprint(): Promise<SensorFingerprint | null> {
  if (!isBrowser) return null;

  const result: SensorFingerprint = {
    motion: {
      accelerometer: 'Accelerometer' in window,
      gyroscope: 'Gyroscope' in window,
    }
  };

  try {
    // Battery API
    if ('getBattery' in navigator) {
      const battery: any = await (navigator as any).getBattery();
      result.battery = {
        level: battery.level,
        charging: battery.charging
      };
    }

    // Network Information API
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      result.network = {
        type: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0
      };
    }

    return result;
  } catch (e) {
    return result;
  }
}
