# Secret Dependency Map

Generated: 2026-07-15  
Purpose: Map each affected secret to code usage and Vercel env requirements.

**No secret values are listed in this document.**

---

## Overview

| Secret | Git history (`f20213d`) | Hardcoded in code | Vercel env required | Runtime usage |
|--------|-------------------------|-------------------|---------------------|---------------|
| `ADMIN_PASSWORD` | Yes | No | **Yes** (production) | Admin login |
| `ADMIN_SESSION_SECRET` | Yes | No | **Yes** (production) | Session HMAC |
| `ANALYTICS_API_SECRET` | No* | No | **Yes** (production) | `/api/analytics/*` auth |
| `BLOB_READ_WRITE_TOKEN` | Yes | No | Vercel platform | Blob storage (Vercel-managed) |
| `VERCEL_OIDC_TOKEN` | Yes | No | Vercel platform | OIDC / deployment (Vercel-managed) |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | No | No | **Yes** (GA4 + GSC) | Server-only JWT |

\*Not present as separate key in commit `f20213d`; may share value with `ADMIN_SESSION_SECRET` in Vercel.

---

## ADMIN_PASSWORD

### Usage locations

| File | Usage |
|------|-------|
| `server/analytics/admin-auth.js` | `getAdminPassword()` → login verification |
| `server/analytics/analytics-config.js` | Config status flag `hasPassword` (boolean only) |
| `api/admin/login.js` | Login handler |
| `env.example` | Documentation placeholder |
| `scripts/prepare-vercel-analytics-env.mjs` | Env readiness check |
| `scripts/verify-admin-analytics-config.mjs` | Local/Vercel config validation |

### Hardcoded?

**No** — only `process.env.ADMIN_PASSWORD`.

### Vercel env

Required on Vercel when `VERCEL=1`. Local dev bypasses auth if unset.

---

## ADMIN_SESSION_SECRET

### Usage locations

| File | Usage |
|------|-------|
| `server/analytics/admin-auth.js` | HMAC-SHA256 session token sign/verify |
| `server/analytics/analytics-config.js` | Config status (boolean) |
| `env.example` | Documentation |
| `scripts/prepare-vercel-analytics-env.mjs` | Env readiness |
| `scripts/verify-admin-analytics-config.mjs` | Validation |

### Fallback chain

```text
ADMIN_SESSION_SECRET → ANALYTICS_API_SECRET (if session secret unset)
```

### Hardcoded?

**No.**

### Vercel env

Required for production admin sessions. Rotation invalidates all existing cookies.

---

## ANALYTICS_API_SECRET

### Usage locations

| File | Usage |
|------|-------|
| `server/analytics/api-auth.js` | Bearer / `x-analytics-api-key` validation |
| `server/analytics/admin-auth.js` | Fallback for session secret |
| `server/analytics/analytics-config.js` | Config status (boolean) |
| `api/analytics/visitors.js` | Protected endpoint |
| `api/analytics/events.js` | Protected endpoint |
| `env.example` | Documentation |
| `scripts/prepare-vercel-analytics-env.mjs` | Env readiness |

### Hardcoded?

**No.**

### Vercel env

Required on Vercel for `/api/analytics/*`. Local dev allows unauthenticated access when unset.

---

## BLOB_READ_WRITE_TOKEN

### Usage locations

| Location | Usage |
|----------|-------|
| Application source (`src/`, `server/`, `api/`) | **Not referenced** |
| Vercel runtime | Vercel Blob SDK / platform (if Blob feature used) |

### Hardcoded?

**No** in repository code.

### Vercel env

Managed by Vercel. Present in leaked `.env` commit — rotate via Vercel dashboard regardless of app code usage.

---

## VERCEL_OIDC_TOKEN

### Usage locations

| Location | Usage |
|----------|-------|
| Application source | **Not referenced** |
| Vercel CI/CD / OIDC | Platform-managed ephemeral token |

### Hardcoded?

**No.**

### Vercel env

Typically short-lived. Revoke/regenerate via Vercel; no code change required.

---

## GOOGLE_SERVICE_ACCOUNT_JSON (not in leaked commit)

### Usage locations

| File | Usage |
|------|-------|
| `server/analytics/google-credentials.js` | Parse JSON → JWT credentials |
| `server/analytics/ga4-data-api.js` | GA4 Data API client |
| `server/analytics/ga4-dashboard.js` | Dashboard metrics |
| `server/seo/search-console/client.js` | Search Console JWT |
| `server/seo/search-console/seo-report.js` | Report aggregator (email in **authenticated** response only) |
| `env.example` | Documentation |
| `scripts/verify-search-console-config.mjs` | Local validation |
| `scripts/prepare-vercel-analytics-env.mjs` | Vercel prep |

### Hardcoded?

**No.**

### Local alternative

`secrets/google-service-account.json` (gitignored) — not used on Vercel runtime.

### Frontend exposure

**None** — server-side only.

---

## Public vs Authenticated Data Flow

```text
Public (no auth):
  /api/admin/health        → getAnalyticsPublicHealthSummary()     [boolean flags only]
  /api/admin/seo-health    → getSearchConsolePublicHealthSummary() [boolean flags only]

Authenticated (session cookie):
  /api/admin/seo           → includes service account email (admin ops)
  /api/admin/dashboard     → GA4 metrics
  /api/admin/login         → sets HttpOnly cookie

API key (Bearer):
  /api/analytics/*         → GA4 raw endpoints
```

---

## Related Documents

- `docs/GIT_SECRET_AUDIT.md`
- `docs/SECRET_ROTATION_PLAN.md`
