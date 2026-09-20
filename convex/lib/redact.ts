const SECRET_FIELD_NAMES = new Set([
  'apiKey',
  'apiSecret',
  'secret',
  'token',
  'accessToken',
  'refreshToken',
  'privateKey',
  'key'
]);

export function redactSecretLikeValues<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => redactSecretLikeValues(item)) as T;
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const record = value as Record<string, unknown>;
  const redacted: Record<string, unknown> = {};

  for (const [fieldName, fieldValue] of Object.entries(record)) {
    if (SECRET_FIELD_NAMES.has(fieldName)) {
      redacted[fieldName] = '[REDACTED]';
      continue;
    }

    redacted[fieldName] = redactSecretLikeValues(fieldValue);
  }

  return redacted as T;
}
