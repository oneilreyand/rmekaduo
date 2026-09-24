import crypto from 'node:crypto';

/**
 * Utility Kriptografi Otentikasi & Sesi
 * Menggunakan modul bawaan node:crypto tanpa dependensi pihak ketiga.
 * Memenuhi spesifikasi ADR 0005.
 */

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/**
 * Melakukan hashing password dengan algoritma scrypt aman.
 * Format output: scrypt:<salt_hex>:<hash_hex>
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
    crypto.scrypt(password, salt, KEY_LENGTH, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt:${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Memverifikasi kecocokan password plaintext terhadap hash scrypt tersimpan.
 * Menggunakan timingSafeEqual untuk mencegah serangan timing (side-channel).
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash || !storedHash.startsWith('scrypt:')) {
    return false;
  }

  const parts = storedHash.split(':');
  if (parts.length !== 3) {
    return false;
  }

  const [, salt, originalHashHex] = parts;
  if (!salt || !originalHashHex) {
    return false;
  }

  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, (err, derivedKey) => {
      if (err) return reject(err);
      try {
        const originalBuffer = Buffer.from(originalHashHex, 'hex');
        if (derivedKey.length !== originalBuffer.length) {
          return resolve(false);
        }
        const match = crypto.timingSafeEqual(derivedKey, originalBuffer);
        resolve(match);
      } catch {
        resolve(false);
      }
    });
  });
}

/**
 * Menghasilkan token sesi 256-bit berentropi tinggi untuk disimpan di tabel sessions server-side.
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Menghasilkan token aman sekali pakai (misal: token reset password 15 menit).
 */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}
