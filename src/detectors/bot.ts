/**
 * Bot and Automation Detection Module.
 */
export const isBrowser = typeof window !== 'undefined';

export interface BotDetectionResult {
  isBot: boolean;
  confidence: number;
  flags: string[];
}

export function detectBot(): BotDetectionResult {
  if (!isBrowser) return { isBot: false, confidence: 0, flags: [] };

  const flags: string[] = [];
  let score = 0;

  // 1. Webdriver Check
  if (navigator.webdriver) {
    flags.push('navigator_webdriver_present');
    score += 50;
  }

  // 2. Selenium/Automation Traces
  const automationKeys = [
    '_selenium', '_phantom', '__webdriver', '__driver_evaluate', '__driver_unwrapped',
    '__fxdriver_evaluate', '__fxdriver_unwrapped'
  ];
  const foundKeys = automationKeys.filter(key => key in window || key in document);
  if (foundKeys.length > 0) {
    flags.push(`automation_keys_found:${foundKeys.join(',')}`);
    score += 40;
  }

  // 3. Headless Chrome checks
  if (/HeadlessChrome/.test(navigator.userAgent)) {
    flags.push('headless_ua');
    score += 80;
  }

  // 4. Permission mismatch (common in headless)
  // Note: This is usually async, but we can check the API presence
  if (!navigator.permissions) {
    flags.push('permissions_api_missing');
    score += 20;
  }

  // 5. Plugins check (headless often has 0 plugins)
  if (navigator.plugins && navigator.plugins.length === 0) {
    flags.push('zero_plugins');
    score += 15;
  }

  return {
    isBot: score >= 50,
    confidence: Math.min(score, 100),
    flags
  };
}
