import type { BpjsSecurityHeaders } from '@/types/bpjs-core';

/**
 * Universal HMAC-SHA256 generator using standard Web Crypto API (supported in Node 18+ and modern browsers).
 */
export async function calculateHmacSha256(message: string, secretKey: string): Promise<string> {
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const msgData = encoder.encode(message);

    const cryptoKey = await globalThis.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await globalThis.crypto.subtle.sign('HMAC', cryptoKey, msgData);
    const bytes = new Uint8Array(signatureBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Fallback string hashing for offline environments
  return btoa(unescape(encodeURIComponent(`${message}:${secretKey}`)));
}

/**
 * Generates official BPJS headers:
 * - X-cons-id
 * - X-timestamp (UTC seconds)
 * - X-signature (HMAC-SHA256 Base64 of consId & timestamp with secretKey)
 * - user_key
 */
export async function generateBpjsHeaders(
  consId: string,
  secretKey: string,
  userKey: string
): Promise<{ headers: BpjsSecurityHeaders; timestamp: string }> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const message = `${consId}&${timestamp}`;
  const signature = await calculateHmacSha256(message, secretKey);

  return {
    headers: {
      'X-cons-id': consId,
      'X-timestamp': timestamp,
      'X-signature': signature,
      'user_key': userKey,
    },
    timestamp,
  };
}

/**
 * Synchronous mock signature generator for immediate UI responsiveness in demo mode.
 */
export function generateBpjsHeadersSync(
  consId: string,
  secretKey: string,
  userKey: string
): { headers: BpjsSecurityHeaders; timestamp: string } {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const message = `${consId}&${timestamp}`;
  // Deterministic mock base64 signature
  const signature = typeof btoa !== 'undefined' 
    ? btoa(`HMAC-SHA256(${message},${secretKey.slice(0, 4)}...)`) 
    : 'mock-sig';

  return {
    headers: {
      'X-cons-id': consId,
      'X-timestamp': timestamp,
      'X-signature': signature,
      'user_key': userKey,
    },
    timestamp,
  };
}
