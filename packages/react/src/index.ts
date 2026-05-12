import { useEffect, useState, useCallback, useRef, createContext, useContext, ReactNode } from 'react';
import { FingerprintSDK, EnhancedFingerprintResult, FingerprintOptions } from '../../src/index';

export interface UseFingerprintOptions extends FingerprintOptions {
  immediate?: boolean;
  onComplete?: (result: EnhancedFingerprintResult) => void;
  onError?: (error: Error) => void;
}

export interface FingerprintState {
  data: EnhancedFingerprintResult | null;
  loading: boolean;
  error: Error | null;
  isReady: boolean;
}

export function useFingerprintSDK(options: UseFingerprintOptions = {}) {
  const [state, setState] = useState<FingerprintState>({
    data: null,
    loading: false,
    error: null,
    isReady: false,
  });

  const sdkRef = useRef<FingerprintSDK | null>(null);
  const { immediate = false, onComplete, onError, ...sdkConfig } = options;

  useEffect(() => {
    sdkRef.current = new FingerprintSDK(sdkConfig);
    setState((prev) => ({ ...prev, isReady: true }));

    return () => {
      sdkRef.current = null;
    };
  }, []);

  const getFingerprint = useCallback(async () => {
    if (!sdkRef.current) {
      const error = new Error('SDK not initialized');
      setState((prev) => ({ ...prev, error }));
      onError?.(error);
      return null;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await sdkRef.current.getFingerprint();
      setState({ data: result, loading: false, error: null, isReady: true });
      onComplete?.(result);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setState((prev) => ({ ...prev, loading: false, error: err }));
      onError?.(err);
      return null;
    }
  }, [onComplete, onError]);

  useEffect(() => {
    if (immediate && state.isReady && !state.data && !state.loading) {
      getFingerprint();
    }
  }, [immediate, state.isReady]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      isReady: true,
    });
  }, []);

  return {
    ...state,
    getFingerprint,
    reset,
    visitorId: state.data?.visitorId || null,
    confidence: state.data?.confidence || 0,
    botDetection: state.data?.botDetection || null,
  };
}

interface FingerprintContextValue {
  fingerprint: EnhancedFingerprintResult | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const FingerprintContext = createContext<FingerprintContextValue | undefined>(undefined);

export function FingerprintProvider({ children, config }: { children: ReactNode; config?: FingerprintOptions }) {
  const { data, loading, error, getFingerprint } = useFingerprintSDK({
    ...config,
    immediate: true,
  });

  const refresh = useCallback(async () => {
    await getFingerprint();
  }, [getFingerprint]);

  return (
    <FingerprintContext.Provider value={{ fingerprint: data, loading, error, refresh }}>
      {children}
    </FingerprintContext.Provider>
  );
}

export function useFingerprint() {
  const context = useContext(FingerprintContext);
  if (!context) {
    throw new Error('useFingerprint must be used within FingerprintProvider');
  }
  return context;
}
