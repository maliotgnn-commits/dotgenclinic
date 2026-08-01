# Ops / Env Verification Checklist

Generated: 2026-08-01  
Scope: Production readiness checks that do **not** require reading local `.env` values in chat.

> Never paste secret values into git, chat, or tickets.

## 1) Secret rotation (P0 / P1)

Historical leak reference: `docs/GIT_SECRET_AUDIT.md`, `docs/SECRET_ROTATION_PLAN.md` (commit `f20213d`).

Confirm in **Vercel → Project → Settings → Environment Variables** (Production + Preview):


| Key                     | Expected action                      | How to verify (no secret output)                                         |
| ----------------------- | ------------------------------------ | ------------------------------------------------------------------------ |
| `ADMIN_PASSWORD`        | Rotated after leak                   | Login works with current password; old password rejected                 |
| `ADMIN_SESSION_SECRET`  | Rotated (≥32 chars)                  | Fresh login issues session; `/api/admin/dashboard` is 401 without cookie |
| `ANALYTICS_API_SECRET`  | Rotated; preferably ≠ session secret | Bearer auth on `/api/analytics/visitors` succeeds with current secret    |
| `BLOB_READ_WRITE_TOKEN` | Rotated or revoked if unused         | Vercel Blob reads/writes succeed or feature disabled intentionally       |
| OIDC / platform tokens  | Revoked if present in history        | No stale token reuse                                                     |


Status for this delivery: **manual confirmation required by repo owner** (agent cannot read `.env` or Vercel secret values).

## 2) Admin + analytics runtime


| Check                                         | Pass criteria                                         |
| --------------------------------------------- | ----------------------------------------------------- |
| `/admin/analytics`                            | Login gate works on Production                        |
| `/admin/seo`                                  | Login gate works on Production                        |
| `GA4_PROPERTY_ID`                             | Set; dashboard returns metrics (not credential error) |
| `GOOGLE_SERVICE_ACCOUNT_JSON` (or split keys) | Set; GA4 Data API authorized                          |
| `GOOGLE_SEARCH_CONSOLE_SITE_URL`              | Exact GSC property URL (trailing slash discipline)    |
| GSC API enabled + SA user added               | Weekly SEO report can pull coverage/queries           |




## 3) Google Business Profile (optional local SEO)

If Local SEO admin panels should be live:

- `GOOGLE_BUSINESS_ACCOUNT_ID`
- `GOOGLE_BUSINESS_CLIENT_ID`
- `GOOGLE_BUSINESS_CLIENT_SECRET`
- `GOOGLE_BUSINESS_REFRESH_TOKEN`

Code support was merged (GBP OAuth refresh). Missing env ⇒ API features stay inactive; static Maps/sameAs signals can still work.

## 4) Doctor profiles (intentionally deferred)

- Keep scaffolds `indexed: false` / `MISSING_DATA` until roster is final.
- Do **not** set `indexed: true` with placeholder credentials.



## 5) Suggested verification commands (local, after owner sets `.env`)

```bash
node scripts/verify-admin-analytics-config.mjs
node scripts/verify-vercel-function-count.mjs
npm run build
```

Live checks (owner-run on Production URL):

```bash
node scripts/verify-live-admin-analytics.mjs
```



## 6) Owner sign-off

Verified with owner on 2026-08-01 (values never pasted in chat):

- [x] P0 secrets rotated in Vercel Production + Preview — owner confirmed
- [x] Admin login verified — `/admin/analytics` + `/admin/seo`
- [x] GA4 dashboard returns data — owner + live `/api/admin/health` ready
- [x] GSC site URL + SA access verified — live SEO dashboard + local GSC API sample metrics
- [x] GBP vars present **or** explicitly deferred — Vercel GBP env keys present; Local SEO panel still empty → treat as deferred/broken until data appears
- [x] Doctor noindex policy still intentional — keep scaffolds noindex until roster is final