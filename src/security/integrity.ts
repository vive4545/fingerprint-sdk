/**
 * Security and Integrity Protection Module.
 * Detects tampering with the browser environment and native functions.
 */

export const isBrowser = typeof window !== 'undefined';

export interface IntegrityResult {
  tampered: boolean;
  flags: string[];
}

/**
 * Checks if a function has been wrapped or overridden.
 */
export function isNative(fn: Function): boolean {
  return typeof fn === 'function' && /\{\s*\[native code\]\s*\}/.test(fn.toString());
}

export class IntegrityVerifier {
  private checksums: Map<string, string> = new Map();

  constructor() {
    this.recordFunctionChecksums();
  }

  async verifyIntegrity(): Promise<{ valid: boolean; violations: string[] }> {
    const violations: string[] = [];

    if (!isBrowser) return { valid: true, violations: [] };

    // Check critical native functions
    const nativeToCheck = ['JSON.stringify', 'Array.prototype.map', 'Function.prototype.toString'];
    nativeToCheck.forEach(path => {
      if (this.isNativeFunctionTampered(path)) {
        violations.push(`${path}_tampered`);
      }
    });

    // Check proxies
    if (this.isProxied(window.navigator)) violations.push('navigator_proxied');
    if (this.isProxied(document)) violations.push('document_proxied');

    return {
      valid: violations.length === 0,
      violations,
    };
  }

  private isNativeFunctionTampered(path: string): boolean {
    try {
      const parts = path.split('.');
      let obj: any = window;
      for (const part of parts) {
        if (!obj) return true;
        obj = obj[part];
      }
      return !isNative(obj);
    } catch {
      return true;
    }
  }

  private isProxied(obj: any): boolean {
    try {
      return obj !== null && typeof obj === 'object' && Object.getOwnPropertyDescriptor(obj, '__proto__') === undefined;
    } catch {
      return false;
    }
  }

  private recordFunctionChecksums(): void {
    // In a real build, these would be injected at compile time
  }
}

export class HoneypotCollector {
  name = 'honeypot';
  async collect(): Promise<any> {
    return {
      value: 'HONEYPOT_SENTINEL_VALUE',
      timestamp: Date.now(),
    };
  }
}

export function checkIntegrity(): IntegrityResult {
  if (!isBrowser) return { tampered: false, flags: [] };

  const flags: string[] = [];

  const coreFunctions = [
    { name: 'fetch', fn: window.fetch },
    { name: 'CanvasRenderingContext2D.prototype.fillText', fn: CanvasRenderingContext2D.prototype.fillText },
    { name: 'WebGLRenderingContext.prototype.getParameter', fn: WebGLRenderingContext.prototype.getParameter },
    { name: 'Function.prototype.toString', fn: Function.prototype.toString },
  ];

  for (const item of coreFunctions) {
    if (!isNative(item.fn)) {
      flags.push(`proxy_detected:${item.name}`);
    }
  }

  // Honeypot Checks
  const suspiciousKeys = ['__webdriver_evaluate', '__webdriver_script_function'];
  suspiciousKeys.forEach(key => {
    if (key in window) flags.push(`honeypot_triggered:${key}`);
  });

  return {
    tampered: flags.length > 0,
    flags
  };
}
