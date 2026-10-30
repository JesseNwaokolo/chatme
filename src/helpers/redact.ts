// Logging helpers. Errors from axios carry the request config (Authorization header,
// refresh tokens in bodies, signed upload URLs), so they must never be logged as objects.

const SENSITIVE_KEY = /(token|authorization|signature|secret|password|api_?key)/i;

export function redactString(value: string): string {
  return value
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, "Bearer [redacted]")
    .replace(/\b(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)\b/g, "[redacted-jwt]")
    .replace(/([?&;]?)([A-Za-z_]*(?:token|signature|secret|api_?key|password)[A-Za-z_]*)=([^&\s"']+)/gi, "$1$2=[redacted]");
}

// Drops the query string and fragment: signed upload URLs keep their credentials there.
export function redactUrl(url: string): string {
  return url.split(/[?#]/)[0];
}

export function redactObject(value: unknown, depth = 0): unknown {
  if (value === null || typeof value !== "object") {
    return typeof value === "string" ? redactString(value) : value;
  }
  if (depth > 3) return "[truncated]";
  if (Array.isArray(value)) return value.map((v) => redactObject(v, depth + 1));
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([k, v]) => [
      k,
      SENSITIVE_KEY.test(k) ? "[redacted]" : redactObject(v, depth + 1),
    ]),
  );
}

// One safe line for any thrown value. Request config and headers are never included.
export function describeError(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const e = error as {
      isAxiosError?: boolean;
      code?: string;
      message?: string;
      response?: { status?: number };
      config?: { method?: string; url?: string };
    };
    if (e.isAxiosError) {
      const method = e.config?.method?.toUpperCase() ?? "REQUEST";
      const url = e.config?.url ? redactUrl(e.config.url) : "";
      const status = e.response?.status ?? e.code ?? "no response";
      return `${method} ${url} failed (${status})`.replace("  ", " ");
    }
    if (typeof e.message === "string") return redactString(e.message);
  }
  return typeof error === "string" ? redactString(error) : "unknown error";
}
