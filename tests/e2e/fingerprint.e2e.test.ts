import { test, expect } from '@playwright/test';

test.describe('Fingerprint SDK E2E', () => {
  test('should generate consistent fingerprint on page reload', async ({ page }) => {
    // We assume a local server is running for tests
    await page.goto('http://localhost:3000/demo/index.html');

    const firstId = await page.evaluate(async () => {
      const { FingerprintSDK } = await import('../../dist/index.js');
      const sdk = new FingerprintSDK();
      const result = await sdk.getFingerprint();
      return result.visitorId;
    });

    await page.reload();

    const secondId = await page.evaluate(async () => {
      const { FingerprintSDK } = await import('../../dist/index.js');
      const sdk = new FingerprintSDK();
      const result = await sdk.getFingerprint();
      return result.visitorId;
    });

    expect(firstId).toBe(secondId);
  });

  test('should detect tampering with native functions', async ({ page }) => {
    await page.goto('http://localhost:3000/demo/index.html');

    // Simulate tampering before SDK runs
    await page.addInitScript(() => {
      (window as any).fetch = () => {}; // Override native fetch
    });

    const result = await page.evaluate(async () => {
      const { FingerprintSDK } = await import('../../dist/index.js');
      const sdk = new FingerprintSDK();
      return await sdk.getFingerprint();
    });

    expect(result.security.integrity.valid).toBe(false);
    expect(result.security.integrity.violations).toContain('proxy_detected:fetch');
  });
});
