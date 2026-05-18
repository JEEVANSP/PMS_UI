function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" &&
    value.trim().length > 0;
}

export function normalizeEtag(value: unknown): string | undefined {
  if (!isNonEmptyString(value)) {
    return undefined;
  }

  const cleaned = value
    .trim()
    .replace(/"/g, "");
  return cleaned.length > 0
    ? cleaned
    : undefined;
}

export function extractEtag(headers: unknown): string | undefined {
  if (!headers) {
    return undefined;
  }

  const getter = headers as {
    get?: (name: string) => unknown;
  };

  if (typeof getter.get === "function") {
    const value = normalizeEtag(
      getter.get("Etag") ??
      getter.get("ETag") ??
      getter.get("etag")
    );
    if (value) {
      return value;
    }
  }

  if (typeof headers === "object") {
    const record = headers as Record<string, unknown>;
    return normalizeEtag(
      record.Etag ??
      record.ETag ??
      record.etag
    );
  }

  return undefined;
}

export function formatIfMatch(etag: string): string {
  const trimmed = etag.trim();
  return trimmed.startsWith('"')
    ? trimmed
    : `"${trimmed}"`;
}
