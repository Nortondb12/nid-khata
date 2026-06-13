/**
 * PII-aware logger. Never log NID numbers or DOBs in plaintext.
 * In production this is a no-op except for errors.
 */
const isDev = import.meta.env.DEV;

const SENSITIVE_KEYS = ["nid_number", "date_of_birth", "dob", "nid"];

const redact = (value: unknown): unknown => {
  if (value == null) return value;
  if (Array.isArray(value)) return value.map(redact);
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SENSITIVE_KEYS.includes(k) ? "[redacted]" : redact(v);
    }
    return out;
  }
  return value;
};

export const logger = {
  info: (...args: unknown[]) => {
    if (isDev) console.info(...args.map(redact));
  },
  warn: (...args: unknown[]) => {
    console.warn(...args.map(redact));
  },
  error: (...args: unknown[]) => {
    console.error(...args.map(redact));
  },
};
