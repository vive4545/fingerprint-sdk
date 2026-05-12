import { 
  getCanvasFingerprint, 
  getWebGLFingerprint, 
  getFonts, 
  getScreenResolution, 
  getTimezone, 
  getLanguage,
  isBrowser,
  getIP
} from './collectors/browser';
import { getAudioFingerprint } from './collectors/audio';
import { getWebRTCFingerprint } from './collectors/webrtc';
import { getSensorFingerprint } from './collectors/sensors';
import { getAdvancedBrowserFingerprint } from './collectors/advanced-browser';
import { parseUA, UAData } from './collectors/ua';
import { detectBot, BotDetectionResult } from './detectors/bot';
import { hashString } from './utils/hash';
import { getSignalMetadata, calculateConfidence } from './utils/entropy';
import { PrivacyConfig, isCollectorAllowed, anonymize } from './privacy/consent';
import { CacheManager } from './cache/manager';
import { HoneypotCollector, IntegrityVerifier } from './security/integrity';
import { EnvironmentTamperingDetector } from './security/environment';
import { TelemetryManager, SDKTelemetry } from './monitoring/telemetry';

export interface EnhancedFingerprintResult {
  visitorId: string;
  confidence: number;
  entropy: number;
  stability: 'high' | 'medium' | 'low';
  botDetection: BotDetectionResult;
  security: {
    integrity: { valid: boolean; violations: string[] };
    tampering: { detected: boolean; indicators: string[]; severity: string };
  };
  telemetry: SDKTelemetry;
  components: {
    [key: string]: {
      value: any;
      entropy: number;
      stability: 'stable' | 'volatile';
      weight: number;
      error?: string;
    };
  };
  metadata: {
    timestamp: number;
    collectionTime: number;
    environment: 'browser' | 'node';
    failedCollectors: string[];
    cached: boolean;
  };
}

export interface FingerprintOptions {
  userAgent?: string;
  includeIP?: boolean;
  timeout?: number;
  privacy?: PrivacyConfig;
  cache?: {
    enabled: boolean;
    ttl?: number;
  };
  security?: {
    enabled: boolean;
  };
}

export class FingerprintSDK {
  private options: FingerprintOptions;
  private cache: CacheManager | null = null;
  private telemetry = new TelemetryManager();

  constructor(options?: FingerprintOptions) {
    this.options = options || {};
    if (this.options.cache?.enabled) {
      this.cache = new CacheManager(this.options.cache.ttl);
    }
  }

  private getUserAgent(): string {
    if (this.options.userAgent) return this.options.userAgent;
    if (isBrowser) return navigator.userAgent;
    return '';
  }

  public async getFingerprint(): Promise<EnhancedFingerprintResult> {
    const startTime = Date.now();
    const uaString = this.getUserAgent();
    
    if (this.cache) {
      const cached = this.cache.get(uaString);
      if (cached) {
        return {
          ...cached.data,
          metadata: { ...cached.data.metadata, cached: true, collectionTime: Date.now() - startTime }
        };
      }
    }

    const uaData = parseUA(uaString);
    const botResult = detectBot();
    const privacy = this.options.privacy || { mode: 'balanced' };
    
    const verifier = new IntegrityVerifier();
    const tamperingDetector = new EnvironmentTamperingDetector();
    
    const [integrity, tampering] = await Promise.all([
      verifier.verifyIntegrity(),
      tamperingDetector.detect()
    ]);

    const components: EnhancedFingerprintResult['components'] = {};
    const failedCollectors: string[] = [];

    const collectors: Record<string, () => Promise<any> | any> = {
      ua: () => uaData,
      canvas: getCanvasFingerprint,
      webgl: getWebGLFingerprint,
      fonts: getFonts,
      screen: getScreenResolution,
      timezone: getTimezone,
      language: getLanguage,
      audio: getAudioFingerprint,
      webrtc: getWebRTCFingerprint,
      sensors: getSensorFingerprint,
      advancedBrowser: getAdvancedBrowserFingerprint,
      honeypot: () => new HoneypotCollector().collect(),
    };

    if (this.options.includeIP && isBrowser) {
      collectors.ip = getIP;
    }

    const activeCollectors = Object.keys(collectors).filter(name => 
      isCollectorAllowed(name, privacy)
    );

    await Promise.all(
      activeCollectors.map(async (name) => {
        const colStart = Date.now();
        try {
          const collect = collectors[name];
          let value = await collect();
          
          if (privacy.anonymization?.enabled) {
            value = anonymize(JSON.stringify(value), privacy.anonymization.saltKey);
          }

          const meta = getSignalMetadata(name, value);
          components[name] = {
            value,
            ...meta
          };
          this.telemetry.record(name, Date.now() - colStart, true);
        } catch (e) {
          failedCollectors.push(name);
          components[name] = {
            value: null,
            entropy: 0,
            stability: 'volatile',
            weight: 0,
            error: String(e)
          };
          this.telemetry.record(name, Date.now() - colStart, false, String(e));
        }
      })
    );

    const totalEntropy = Object.values(components).reduce((sum, c) => sum + c.entropy, 0);
    const confidence = calculateConfidence(totalEntropy, failedCollectors.length, activeCollectors.length);

    const hashPayload = JSON.stringify(
      Object.entries(components)
        .filter(([_, c]) => c.weight > 0.5)
        .map(([name, c]) => [name, c.value])
    );
    const visitorId = await hashString(hashPayload);

    const result: EnhancedFingerprintResult = {
      visitorId,
      confidence,
      entropy: totalEntropy,
      stability: totalEntropy > 40 ? 'high' : (totalEntropy > 20 ? 'medium' : 'low'),
      botDetection: botResult,
      security: {
        integrity,
        tampering
      },
      telemetry: this.telemetry.getReport(),
      components,
      metadata: {
        timestamp: Date.now(),
        collectionTime: Date.now() - startTime,
        environment: isBrowser ? 'browser' : 'node',
        failedCollectors,
        cached: false
      }
    };

    if (this.cache) {
      this.cache.set(uaString, visitorId, result);
    }

    return result;
  }
}

export const fingerprint = new FingerprintSDK();
