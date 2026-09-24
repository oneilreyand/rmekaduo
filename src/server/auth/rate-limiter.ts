/**
 * Rate Limiter untuk Endpoint Keamanan & Otentikasi
 * Menerapkan sliding-window counter in-memory untuk membatasi brute force attacks.
 * Memenuhi spesifikasi ADR 0005: Max 5 percobaan gagal per 15 menit.
 */

interface RateLimitEntry {
  attempts: number;
  firstAttemptAt: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Bersihkan memori setiap 5 menit untuk entri yang sudah kadaluwarsa
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function purgeExpiredEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  attempts: number;
  remaining: number;
  resetTime: number; // Unix timestamp ms
}

/**
 * Memeriksa apakah suatu identifier (IP atau IP+Username) masih berada dalam kuota yang diizinkan.
 */
export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
): RateLimitResult {
  purgeExpiredEntries();

  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetAt) {
    return {
      allowed: true,
      attempts: 0,
      remaining: maxAttempts,
      resetTime: now + windowMs,
    };
  }

  const allowed = entry.attempts < maxAttempts;
  const remaining = Math.max(0, maxAttempts - entry.attempts);

  return {
    allowed,
    attempts: entry.attempts,
    remaining,
    resetTime: entry.resetAt,
  };
}

/**
 * Mencatat percobaan gagal untuk identifier tertentu.
 */
export function recordRateLimitAttempt(
  key: string,
  windowMs = 15 * 60 * 1000
): RateLimitResult {
  purgeExpiredEntries();

  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetAt) {
    const newEntry: RateLimitEntry = {
      attempts: 1,
      firstAttemptAt: now,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, newEntry);
    return {
      allowed: true,
      attempts: 1,
      remaining: 4,
      resetTime: newEntry.resetAt,
    };
  }

  entry.attempts += 1;
  const maxAttempts = 5;
  const allowed = entry.attempts <= maxAttempts;
  const remaining = Math.max(0, maxAttempts - entry.attempts);

  return {
    allowed,
    attempts: entry.attempts,
    remaining,
    resetTime: entry.resetAt,
  };
}

/**
 * Mereset counter percobaan untuk identifier tertentu (misal: saat login berhasil).
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Khusus untuk pengujian: mengosongkan seluruh memori rate limiter.
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}
