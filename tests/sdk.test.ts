import { describe, it, expect } from 'vitest';
import { FingerprintSDK } from '../src/index';

describe('Enterprise FingerprintSDK', () => {
  it('should generate an enhanced fingerprint with intelligence scores', async () => {
    const sdk = new FingerprintSDK({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      privacy: { mode: 'minimal' }
    });
    
    const result = await sdk.getFingerprint();
    
    expect(result.visitorId).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.entropy).toBeGreaterThan(0);
    expect(result.stability).toBeDefined();
    
    // Check for core components
    expect(result.components.ua).toBeDefined();
    expect(result.components.advancedBrowser).toBeDefined();
  });

  it('should detect bot signals in Node.js environment', async () => {
    const sdk = new FingerprintSDK({ privacy: { mode: 'minimal' } });
    const result = await sdk.getFingerprint();
    
    // In Node.js, we don't have browser APIs, but bot detection should still run
    expect(result.botDetection).toBeDefined();
    expect(result.metadata.environment).toBe('node');
  });

  it('should calculate consistent entropy for stable signals', async () => {
    const sdk = new FingerprintSDK({ privacy: { mode: 'minimal' } });
    const result = await sdk.getFingerprint();
    
    const canvasComponent = result.components.canvas;
    if (canvasComponent && canvasComponent.value !== null) {
      expect(canvasComponent.entropy).toBe(14.5);
      expect(canvasComponent.stability).toBe('stable');
    }
  });

});
