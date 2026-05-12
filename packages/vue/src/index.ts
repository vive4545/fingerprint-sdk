import { ref, onMounted, readonly, Ref, provide, inject } from 'vue';
import { FingerprintSDK, EnhancedFingerprintResult, FingerprintOptions } from '../../src/index';

export interface UseFingerprintOptions extends FingerprintOptions {
  immediate?: boolean;
}

export function useFingerprintSDK(options: UseFingerprintOptions = {}) {
  const data: Ref<EnhancedFingerprintResult | null> = ref(null);
  const loading = ref(false);
  const error: Ref<Error | null> = ref(null);
  const isReady = ref(false);

  let sdk: FingerprintSDK | null = null;
  const { immediate = false, ...sdkConfig } = options;

  onMounted(() => {
    sdk = new FingerprintSDK(sdkConfig);
    isReady.value = true;

    if (immediate) {
      getFingerprint();
    }
  });

  const getFingerprint = async () => {
    if (!sdk) {
      error.value = new Error('SDK not initialized');
      return null;
    }

    loading.value = true;
    error.value = null;

    try {
      const result = await sdk.getFingerprint();
      data.value = result;
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error');
      return null;
    } finally {
      loading.value = false;
    }
  };

  return {
    data: readonly(data),
    loading: readonly(loading),
    error: readonly(error),
    isReady: readonly(isReady),
    getFingerprint,
  };
}

export const FingerprintPlugin = {
  install(app: any, options: FingerprintOptions = {}) {
    const sdk = new FingerprintSDK(options);
    app.provide('fingerprint', sdk);
  }
};
