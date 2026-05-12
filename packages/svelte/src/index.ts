import { writable, derived } from 'svelte/store';
import { FingerprintSDK, EnhancedFingerprintResult, FingerprintOptions } from '../../src/index';

export function createFingerprintStore(config: FingerprintOptions = {}) {
  const data = writable<EnhancedFingerprintResult | null>(null);
  const loading = writable(false);
  const error = writable<Error | null>(null);
  
  let sdk: FingerprintSDK | null = null;

  if (typeof window !== 'undefined') {
    sdk = new FingerprintSDK(config);
  }

  const getFingerprint = async () => {
    if (!sdk) {
      error.set(new Error('SDK not initialized'));
      return null;
    }

    loading.set(true);
    error.set(null);

    try {
      const result = await sdk.getFingerprint();
      data.set(result);
      return result;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Unknown error');
      error.set(e);
      return null;
    } finally {
      loading.set(false);
    }
  };

  const visitorId = derived(data, ($data) => $data?.visitorId || null);
  const confidence = derived(data, ($data) => $data?.confidence || 0);

  return {
    data: { subscribe: data.subscribe },
    loading: { subscribe: loading.subscribe },
    error: { subscribe: error.subscribe },
    visitorId: { subscribe: visitorId.subscribe },
    confidence: { subscribe: confidence.subscribe },
    getFingerprint,
  };
}
