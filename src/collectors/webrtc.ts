/**
 * WebRTC fingerprinting for IP enumeration and device probing.
 */
export const isBrowser = typeof window !== 'undefined';

export interface WebRTCFingerprint {
  localIps: string[];
  mediaDevices: string[];
  capabilities: {
    iceServers: boolean;
    dataChannels: boolean;
  };
}

export async function getWebRTCFingerprint(): Promise<WebRTCFingerprint | null> {
  if (!isBrowser) return null;

  const result: WebRTCFingerprint = {
    localIps: [],
    mediaDevices: [],
    capabilities: {
      iceServers: !!window.RTCPeerConnection,
      dataChannels: !!(window.RTCPeerConnection && window.RTCPeerConnection.prototype.createDataChannel),
    }
  };

  try {
    // Media devices enumeration
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      result.mediaDevices = devices.map(d => `${d.kind}:${d.label || 'unknown'}`);
    }

    // STUN-based local IP enumeration (simplified)
    if (window.RTCPeerConnection) {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      pc.createDataChannel('');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      // Note: Modern browsers hide local IPs behind mDNS for privacy
      // But we can still collect the candidates themselves as signals
      const candidates = offer.sdp?.match(/candidate:[^\s]+/g) || [];
      result.localIps = Array.from(new Set(candidates));
      pc.close();
    }

    return result;
  } catch (e) {
    return result;
  }
}
