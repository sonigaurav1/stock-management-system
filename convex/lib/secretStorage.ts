const HMAC_PREFIX = 'hmac:v1:';
const ENCRYPTION_PREFIX = 'enc:v1:';
const MASTER_KEY_ENV = 'SECRET_CRYPTO_KEY';
const IV_BYTES = 12;
const AUTH_TAG_BYTES = 16;

function getMasterSecret(): string {
  const secret = process.env[MASTER_KEY_ENV];

  if (!secret) {
    throw new Error(`Missing ${MASTER_KEY_ENV} environment variable`);
  }

  return secret;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    '='
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function toHex(bytes: Uint8Array): string {
  let hex = '';
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, '0');
  }

  return hex;
}

async function deriveKeyBytes(label: string): Promise<ArrayBuffer> {
  const material = new TextEncoder().encode(`${getMasterSecret()}:${label}`);

  return crypto.subtle.digest('SHA-256', material);
}

export function createRandomSecret(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

export function isHashedApiKey(value: string): boolean {
  return value.startsWith(HMAC_PREFIX);
}

export async function hashApiKey(value: string): Promise<string> {
  if (isHashedApiKey(value)) {
    return value;
  }

  const key = await crypto.subtle.importKey(
    'raw',
    await deriveKeyBytes('api-key'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(value)
  );

  return `${HMAC_PREFIX}${toHex(new Uint8Array(signature))}`;
}

export function isEncryptedSecret(value: string): boolean {
  return value.startsWith(ENCRYPTION_PREFIX);
}

async function importEncryptionKey(
  usage: 'encrypt' | 'decrypt'
): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    await deriveKeyBytes('secret'),
    { name: 'AES-GCM' },
    false,
    [usage]
  );
}

export async function encryptSecret(value: string): Promise<string> {
  if (isEncryptedSecret(value)) {
    return value;
  }

  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const sealed = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv, tagLength: AUTH_TAG_BYTES * 8 },
      await importEncryptionKey('encrypt'),
      new TextEncoder().encode(value)
    )
  );

  const ciphertext = sealed.subarray(0, sealed.length - AUTH_TAG_BYTES);
  const authTag = sealed.subarray(sealed.length - AUTH_TAG_BYTES);

  return `${ENCRYPTION_PREFIX}${toBase64Url(iv)}:${toBase64Url(authTag)}:${toBase64Url(ciphertext)}`;
}

export async function decryptSecret(value: string): Promise<string> {
  if (!isEncryptedSecret(value)) {
    return value;
  }

  const parts = value.split(':');
  if (parts.length !== 5) {
    throw new Error('Invalid encrypted secret format');
  }

  const iv = fromBase64Url(parts[2]);
  const authTag = fromBase64Url(parts[3]);
  const ciphertext = fromBase64Url(parts[4]);

  const sealed = new Uint8Array(ciphertext.length + authTag.length);
  sealed.set(ciphertext);
  sealed.set(authTag, ciphertext.length);

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv, tagLength: AUTH_TAG_BYTES * 8 },
    await importEncryptionKey('decrypt'),
    sealed
  );

  return new TextDecoder().decode(plaintext);
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
