/**
 * Privacy and Consent Management Module.
 */

export type PrivacyMode = 'strict' | 'balanced' | 'minimal';

export interface PrivacyConfig {
  mode: PrivacyMode;
  consent?: {
    collectors: string[];
  };
  anonymization?: {
    enabled: boolean;
    saltKey?: string;
  };
}

const COLLECTOR_RISK: Record<string, 'low' | 'medium' | 'high'> = {
  ua: 'low',
  screen: 'low',
  language: 'low',
  timezone: 'low',
  fonts: 'medium',
  canvas: 'high',
  webgl: 'high',
  audio: 'high',
  webrtc: 'high',
  sensors: 'medium',
  ip: 'high',
};

export function isCollectorAllowed(collectorName: string, config: PrivacyConfig): boolean {
  // If explicit consent is provided, check it
  if (config.consent?.collectors.includes(collectorName)) {
    return true;
  }

  const risk = COLLECTOR_RISK[collectorName] || 'low';

  switch (config.mode) {
    case 'strict':
      return risk === 'low';
    case 'balanced':
      return risk === 'low' || risk === 'medium';
    case 'minimal':
      return true;
    default:
      return true;
  }
}

export function anonymize(data: string, salt?: string): string {
  if (!salt) return data;
  // Simple salt application - real hashing happens later
  return `${salt}:${data}`;
}
