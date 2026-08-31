'use node';

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  randomUUID,
  timingSafeEqual
} from 'crypto';

const HMAC_PREFIX = 'hmac:v1:';
const ENCRYPTION_PREFIX = 'enc:v1:';
const MASTER_KEY_ENV = 'SECRET_CRYPTO_KEY';

function getMasterSecret(): string {
  const secret = process.env[MASTER_KEY_ENV];

  if (!secret) {
    throw new Error(`Missing ${MASTER_KEY_ENV} environment variable`);
  }

  return secret;
}

function deriveKey(label: string): Buffer {
  return createHash('sha256')
    .update(getMasterSecret())
    .update(':')
    .update(label)
    .digest();
}

export function createRandomSecret(): string {
  return randomUUID().replace(/-/g, '');
}

export function isHashedApiKey(value: string): boolean {
  return value.startsWith(HMAC_PREFIX);
}

export function hashApiKey(value: string): string {
  if (isHashedApiKey(value)) {
    return value;
  }

  const digest = createHmac('sha256', deriveKey('api-key'))
    .update(value)
    .digest('hex');

  return `${HMAC_PREFIX}${digest}`;
}

export function isEncryptedSecret(value: string): boolean {
  return value.startsWith(ENCRYPTION_PREFIX);
}

export function encryptSecret(value: string): string {
  if (isEncryptedSecret(value)) {
    return value;
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', deriveKey('secret'), iv);
  const ciphertext = Buffer.concat([
    cipher.update(value, 'utf8'),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag();

  return `${ENCRYPTION_PREFIX}${iv.toString('base64url')}:${authTag.toString('base64url')}:${ciphertext.toString('base64url')}`;
}

export function decryptSecret(value: string): string {
  if (!isEncryptedSecret(value)) {
    return value;
  }

  const parts = value.split(':');
  if (parts.length !== 5) {
    throw new Error('Invalid encrypted secret format');
  }

  const iv = Buffer.from(parts[2], 'base64url');
  const authTag = Buffer.from(parts[3], 'base64url');
  const ciphertext = Buffer.from(parts[4], 'base64url');

  const decipher = createDecipheriv('aes-256-gcm', deriveKey('secret'), iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]).toString('utf8');
}

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
