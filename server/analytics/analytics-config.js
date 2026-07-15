import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { isAdminAuthConfigured } from './admin-auth.js';
import { isAnalyticsAuthConfigured } from './api-auth.js';
import { getGa4PropertyId, getGoogleServiceAccountCredentials, isVercelRuntime } from './google-credentials.js';

const LOCAL_SECRETS_PATH = join(process.cwd(), 'secrets', 'google-service-account.json');

function hasGoogleCredentialsEnv() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) return true;
  return Boolean(process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);
}

function hasLocalSecretsFile() {
  return !isVercelRuntime() && existsSync(LOCAL_SECRETS_PATH);
}

function hasValidGa4PropertyId() {
  const propertyId = process.env.GA4_PROPERTY_ID || '';
  return /^\d+$/.test(propertyId);
}

export function getAnalyticsConfigStatus() {
  const adminAuthConfigured = isAdminAuthConfigured();
  const analyticsApiConfigured = isAnalyticsAuthConfigured();
  const ga4PropertyConfigured = hasValidGa4PropertyId();
  const googleCredentialsEnv = hasGoogleCredentialsEnv();
  const googleCredentialsFile = hasLocalSecretsFile();

  let googleCredentialsValid = false;
  let googleCredentialsError = null;

  if (googleCredentialsEnv || googleCredentialsFile) {
    try {
      const credentials = getGoogleServiceAccountCredentials();
      googleCredentialsValid = Boolean(credentials?.client_email && credentials?.private_key);
    } catch (error) {
      googleCredentialsError = error instanceof Error ? error.message : 'Invalid Google credentials';
    }
  }

  let ga4PropertyId = null;
  let ga4PropertyError = null;

  if (ga4PropertyConfigured) {
    try {
      ga4PropertyId = getGa4PropertyId();
    } catch (error) {
      ga4PropertyError = error instanceof Error ? error.message : 'Invalid GA4 property ID';
    }
  }

  const ga4DataReady = Boolean(ga4PropertyId && googleCredentialsValid);
  const adminDashboardReady = isVercelRuntime()
    ? adminAuthConfigured && ga4DataReady
    : ga4DataReady || (!adminAuthConfigured && ga4DataReady);

  return {
    runtime: {
      vercel: isVercelRuntime(),
      vercelEnv: process.env.VERCEL_ENV || null,
      nodeEnv: process.env.NODE_ENV || null,
    },
    adminAuth: {
      configured: adminAuthConfigured,
      hasPassword: Boolean(process.env.ADMIN_PASSWORD),
      hasSessionSecret: Boolean(process.env.ADMIN_SESSION_SECRET || process.env.ANALYTICS_API_SECRET),
      devBypassAllowed: !isVercelRuntime() && !adminAuthConfigured,
    },
    analyticsApi: {
      configured: analyticsApiConfigured,
      hasSecret: Boolean(process.env.ANALYTICS_API_SECRET),
    },
    ga4: {
      propertyConfigured: ga4PropertyConfigured,
      propertyId: ga4PropertyId,
      propertyError: ga4PropertyError,
      credentialsFromEnv: googleCredentialsEnv,
      credentialsFromFile: googleCredentialsFile,
      credentialsValid: googleCredentialsValid,
      credentialsError: googleCredentialsError,
      dataReady: ga4DataReady,
    },
    ready: {
      adminDashboard: adminDashboardReady,
      analyticsApi: analyticsApiConfigured && ga4DataReady,
    },
  };
}

/** Public health payload — no property IDs, credential paths, or error details. */
export function getAnalyticsPublicHealthSummary() {
  const status = getAnalyticsConfigStatus();

  return {
    ready: status.ready.adminDashboard,
    adminAuthConfigured: status.adminAuth.configured,
    ga4Configured: status.ga4.propertyConfigured,
    credentialsConfigured: status.ga4.credentialsValid,
    analyticsApiConfigured: status.analyticsApi.configured,
  };
}
