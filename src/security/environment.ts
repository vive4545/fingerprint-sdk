/**
 * Advanced Environment Tampering Detection.
 */
export const isBrowser = typeof window !== 'undefined';

export interface TamperingDetectionResult {
  detected: boolean;
  indicators: string[];
  severity: 'low' | 'medium' | 'high';
}

export class EnvironmentTamperingDetector {
  /**
   * Detect various forms of environment tampering.
   */
  async detect(): Promise<TamperingDetectionResult> {
    const indicators: string[] = [];

    if (!isBrowser) return { detected: false, indicators: [], severity: 'low' };

    // 1. Automation Frameworks
    if (this.detectAutomation()) {
      indicators.push('automation_framework_detected');
    }

    // 2. DevTools Detection (Timing Attack)
    if (this.detectDevTools()) {
      indicators.push('devtools_open');
    }

    // 3. Time Manipulation
    if (this.detectTimeManipulation()) {
      indicators.push('time_manipulation_detected');
    }

    const severity = indicators.length >= 3 ? 'high' : (indicators.length > 0 ? 'medium' : 'low');

    return {
      detected: indicators.length > 0,
      indicators,
      severity,
    };
  }

  private detectAutomation(): boolean {
    return !!(
      (window as any)._Selenium_IDE_Recorder ||
      (window as any)._selenium ||
      (document as any).__selenium_unwrapped ||
      (navigator as any).webdriver ||
      (window as any).__puppeteer_evaluation_script__ ||
      (window as any).callPhantom ||
      (window as any)._phantom
    );
  }

  private detectDevTools(): boolean {
    const threshold = 160;
    return (window.outerWidth - window.innerWidth > threshold) || 
           (window.outerHeight - window.innerHeight > threshold);
  }

  private detectTimeManipulation(): boolean {
    const start = Date.now();
    const perfStart = performance.now();
    
    // Busy wait
    for (let i = 0; i < 100000; i++) {}

    const dateElapsed = Date.now() - start;
    const perfElapsed = performance.now() - perfStart;

    return Math.abs(dateElapsed - perfElapsed) > 50;
  }
}
