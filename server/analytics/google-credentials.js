import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const LOCAL_SECRETS_PATH = join(process.cwd(), 'secrets', 'google-service-account.json');

/**
 * Vercel / local env:
 * - GA4_PROPERTY_ID
 * - GOOGLE_SERVICE_ACCOUNT_JSON  (recommended on Vercel — full service account JSON)
 *   OR GOOGLE_CLIENT_EMAIL + GOOGLE_PRIVATE_KEY (+ optional GOOGLE_PROJECT_ID)
 */
export function isVercelRuntime() {
  return Boolean(process.env.VERCEL);
}

export function isProductionRuntime() {
  return process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
}

function parseServiceAccountJson(raw) {
  if (!raw || typeof raw !== 'string') {
    throw new Error('Service account JSON is empty.');
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Service account JSON is invalid.');
  }

  if (parsed?.type !== 'service_account') {
    throw new Error('Service account JSON must have type "service_account".');
  }

  if (!parsed.client_email || !parsed.private_key) {
    throw new Error('Service account JSON is missing client_email or private_key.');
  }

  return {
    client_email: parsed.client_email,
    private_key: String(parsed.private_key).replace(/\\n/g, '\n'),
    project_id: parsed.project_id || process.env.GOOGLE_PROJECT_ID || undefined,
  };
}

function loadFromEnvironment() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return parseServiceAccountJson(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  }

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (clientEmail && privateKey) {
    return {
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, '\n'),
      project_id: process.env.GOOGLE_PROJECT_ID || undefined,
    };
  }

  return null;
}

function loadFromLocalSecretsFile() {
  if (isVercelRuntime() || isProductionRuntime()) {
    return null;
  }

  if (!existsSync(LOCAL_SECRETS_PATH)) {
    return null;
  }

  const raw = readFileSync(LOCAL_SECRETS_PATH, 'utf8');
  return parseServiceAccountJson(raw);
}

let cachedCredentials = null;

export function getGoogleServiceAccountCredentials() {
  if (cachedCredentials) {
    return cachedCredentials;
  }

  const fromEnv = loadFromEnvironment();
  if (fromEnv) {
    cachedCredentials = fromEnv;
    return cachedCredentials;
  }

  const fromFile = loadFromLocalSecretsFile();
  if (fromFile) {
    cachedCredentials = fromFile;
    return cachedCredentials;
  }

  throw new Error(
    'Google service account credentials are not configured. Set GOOGLE_SERVICE_ACCOUNT_JSON on Vercel or use secrets/google-service-account.json for local development.',
  );
}

export function getGa4PropertyId() {
  const propertyId = process.env.GA4_PROPERTY_ID;

  if (!propertyId || !/^\d+$/.test(propertyId)) {
    throw new Error('GA4_PROPERTY_ID must be set to a numeric GA4 property ID.');
  }

  return propertyId;
}

export function getGa4PropertyResourceName() {
  return `properties/${getGa4PropertyId()}`;
}
