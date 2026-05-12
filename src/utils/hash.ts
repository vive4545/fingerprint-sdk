/**
 * Generates a SHA-256 hash of the input string.
 * Works in both Browser (using SubtleCrypto) and Node.js (using crypto module).
 */
export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);

  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    // Browser environment
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return bufferToHex(hashBuffer);
  } else {
    // Node.js environment
    const { createHash } = await import('crypto');
    return createHash('sha256').update(input).digest('hex');
  }
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
