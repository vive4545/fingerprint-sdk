/**
 * Advanced browser features and hardware capability detection.
 */
export const isBrowser = typeof window !== 'undefined';

export interface AdvancedBrowserFingerprint {
  hardware: {
    cores: number;
    memory?: number;
    maxTouchPoints: number;
  };
  apis: {
    bluetooth: boolean;
    usb: boolean;
    vibrate: boolean;
    notifications: boolean;
  };
  css: {
    reducedMotion: boolean;
    colorScheme: string;
  };
}

export async function getAdvancedBrowserFingerprint(): Promise<AdvancedBrowserFingerprint | null> {
  if (!isBrowser) return null;

  return {
    hardware: {
      cores: navigator.hardwareConcurrency || 0,
      memory: (navigator as any).deviceMemory || undefined,
      maxTouchPoints: navigator.maxTouchPoints || 0,
    },
    apis: {
      bluetooth: 'bluetooth' in navigator,
      usb: 'usb' in navigator,
      vibrate: 'vibrate' in navigator,
      notifications: 'Notification' in window,
    },
    css: {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    }
  };
}
