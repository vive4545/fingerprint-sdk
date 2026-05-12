import { describe, it, expect } from 'vitest';
import { FingerprintValidator } from '../packages/server/index';

describe('Server-side FingerprintValidator', () => {
  const validator = new FingerprintValidator();

  it('should flag bot results from client', async () => {
    const mockFingerprint = {
      botDetection: { isBot: true },
      components: {}
    };
    
    const result = await validator.validate(mockFingerprint);
    expect(result.isValid).toBe(false);
    expect(result.riskScore).toBeGreaterThan(0);
    expect(result.anomalies).toContain('bot_detected_by_client');
  });

  it('should flag hardware inconsistencies', async () => {
    const mockFingerprint = {
      botDetection: { isBot: false },
      components: {
        ua: { value: { device: 'mobile' } },
        advancedBrowser: { value: { hardware: { cores: 32 } } }
      }
    };
    
    const result = await validator.validate(mockFingerprint);
    expect(result.isValid).toBe(true);
    expect(result.riskScore).toBe(40);
    expect(result.anomalies).toContain('ua_hardware_mismatch_cores');

  });
});
