/**
 * Generates a unique id.
 *
 * `crypto.randomUUID()` requires a secure context (HTTPS or localhost).
 * This wrapper falls back to a Math.random-based UUIDv4 implementation when
 * the native API is unavailable, so the app keeps working on plain-HTTP hosts.
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  // RFC 4122 v4 fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
