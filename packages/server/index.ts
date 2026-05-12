/**
 * Server-side Fingerprint Validation and Intelligence.
 */

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ValidationResult {
  isValid: boolean;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  anomalies: string[];
}

export class FingerprintValidator {
  constructor(private config: { apiKey?: string } = {}) {}

  /**
   * Validates a client-side fingerprint result against server-side logic and reputation.
   */
  public async validate(fingerprint: any): Promise<ValidationResult> {
    const anomalies: string[] = [];
    let riskScore = 0;

    // 1. Consistency Checks
    if (fingerprint.botDetection?.isBot) {
      riskScore += 80;
      anomalies.push('bot_detected_by_client');
    }

    // 2. Security Checks
    if (fingerprint.security?.integrity?.valid === false) {
      riskScore += 60;
      anomalies.push(`integrity_violations:${fingerprint.security.integrity.violations?.join(',')}`);
    }

    if (fingerprint.security?.tampering?.detected) {
      riskScore += 70;
      anomalies.push(`tampering_detected:${fingerprint.security.tampering.indicators?.join(',')}`);
    }

    // 3. UA vs Hardware Consistency
    const ua = fingerprint.components?.ua?.value;
    const hardware = fingerprint.components?.advancedBrowser?.value?.hardware;

    if (ua && hardware) {
      if (ua.device?.includes('mobile') && hardware.cores > 16) {
        riskScore += 40;
        anomalies.push('ua_hardware_mismatch_cores');
      }
    }

    // 4. Localization Consistency
    const timezone = fingerprint.components?.timezone?.value;
    const language = fingerprint.components?.language?.value;
    
    // Simple heuristic: if language is 'zh-CN' but timezone is 'America/New_York', flag it
    if (language?.includes('zh') && timezone?.includes('America')) {
      riskScore += 20;
      anomalies.push('language_timezone_mismatch');
    }

    return {
      isValid: riskScore < 75,
      riskScore: Math.min(riskScore, 100),
      riskLevel: this.getRiskLevel(riskScore),
      anomalies
    };
  }

  private getRiskLevel(score: number): RiskLevel {
    if (score >= 80) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 25) return 'medium';
    return 'low';
  }
}
