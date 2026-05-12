/**
 * Cache Management Module for Fingerprint Persistence.
 */

export interface CacheEntry {
  visitorId: string;
  data: any;
  timestamp: number;
  expiresAt: number;
}

export class CacheManager {
  private prefix = 'fp_sdk_cache';

  constructor(private ttl: number = 3600000) {} // Default 1 hour

  public get(key: string): CacheEntry | null {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(`${this.prefix}_${key}`);
      if (!stored) return null;

      const entry: CacheEntry = JSON.parse(stored);
      if (Date.now() > entry.expiresAt) {
        this.remove(key);
        return null;
      }

      return entry;
    } catch (e) {
      return null;
    }
  }

  public set(key: string, visitorId: string, data: any): void {
    if (typeof window === 'undefined') return;

    try {
      const entry: CacheEntry = {
        visitorId,
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.ttl
      };
      localStorage.setItem(`${this.prefix}_${key}`, JSON.stringify(entry));
    } catch (e) {
      // Silently fail if storage is full or unavailable
    }
  }

  public remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`${this.prefix}_${key}`);
  }
}
