# Secret Rotation Plan

Generated: 2026-07-15  
Trigger: `.env` committed in `f20213d` (2026-06-30) — see `docs/GIT_SECRET_AUDIT.md`

**Execute before or immediately after PR #99 merge to production.**

No secret values appear in this document.

---

## Rotation Priority Matrix

| Priority | Secret | Rotate? | Reason |
|----------|--------|---------|--------|
| P0 | `ADMIN_PASSWORD` | **Yes** | Plaintext in git history |
| P0 | `ADMIN_SESSION_SECRET` | **Yes** | Plaintext in git history |
| P0 | `BLOB_READ_WRITE_TOKEN` | **Yes** | Plaintext in git history |
| P1 | `ANALYTICS_API_SECRET` | **Yes** | May share value with session secret; protects `/api/analytics/*` |
| P1 | `VERCEL_OIDC_TOKEN` | **Revoke** | In git history; platform token |
| — | `GOOGLE_SERVICE_ACCOUNT_JSON` | **No** | Not in leaked commit |

---

## ADMIN_PASSWORD

| Item | Detail |
|------|--------|
| Rotate required? | **Yes** |
| Where to update | Vercel → Project → Settings → Environment Variables → Production + Preview |
| Code change | None |
| Session impact | None (password only affects new logins) |
| Verification | Login at `/admin/analytics` and `/admin/seo` with new password |
| Old value | Invalidate — assume compromised |

### Steps

1. Generate strong password (32+ chars, random)
2. Set `ADMIN_PASSWORD` in Vercel Production and Preview
3. Redeploy (or wait for next deployment after merge)
4. Test admin login on preview URL
5. Confirm old password no longer works

---

## ADMIN_SESSION_SECRET

| Item | Detail |
|------|--------|
| Rotate required? | **Yes** |
| Where to update | Vercel env: `ADMIN_SESSION_SECRET` |
| Code change | None |
| Session impact | **All existing admin cookies invalidated immediately** |
| Verification | Login → `/api/admin/session` returns 200 with cookie |

### Steps

1. Generate random string (min 32 chars)
2. Update Vercel env Production + Preview
3. Redeploy
4. All admins must re-login
5. Verify `/api/admin/dashboard` returns 401 without cookie

---

## ANALYTICS_API_SECRET

| Item | Detail |
|------|--------|
| Rotate required? | **Yes** (recommended) |
| Where to update | Vercel env: `ANALYTICS_API_SECRET` |
| Code change | None |
| Session impact | If used as `ADMIN_SESSION_SECRET` fallback, rotate **both** to same new values or set both explicitly |
| Verification | `curl -H "Authorization: Bearer <secret>" /api/analytics/visitors` |

### Steps

1. Generate new random secret (32+ chars)
2. Set in Vercel — use **different** value from `ADMIN_SESSION_SECRET` (best practice)
3. Update any external consumers (CI scripts, monitoring) using Bearer token
4. Redeploy and test protected analytics endpoints

---

## BLOB_READ_WRITE_TOKEN

| Item | Detail |
|------|--------|
| Rotate required? | **Yes** |
| Where to update | Vercel → Storage → Blob → regenerate token |
| Code change | None (not referenced in app source) |
| Session impact | None |
| Verification | Confirm Blob uploads/downloads still work if feature is used |

### Steps

1. Vercel dashboard → Storage settings
2. Regenerate Blob read/write token
3. Update Vercel env if manually set (often auto-injected by Vercel)
4. Test any Blob-dependent features

---

## VERCEL_OIDC_TOKEN

| Item | Detail |
|------|--------|
| Revoke required? | **Yes** |
| Where to update | Vercel dashboard / redeploy |
| Code change | None |
| Session impact | None for end users |
| Notes | OIDC tokens are typically ephemeral; historical token likely expired but revoke for hygiene |

### Steps

1. Review Vercel project access logs
2. Regenerate OIDC / deployment credentials if Vercel UI allows
3. No repository action required

---

## Google Service Account

| Item | Detail |
|------|--------|
| Affected by `f20213d`? | **No** |
| Rotate required? | **No** (based on git history audit) |
| Where configured | Vercel: `GOOGLE_SERVICE_ACCOUNT_JSON` |
| Local | `secrets/google-service-account.json` (gitignored) |

### Ongoing hygiene

- Never commit JSON to repo
- Use Vercel env one-line JSON only
- Search Console: ensure service account email is property user
- GA4: ensure service account has Viewer on property

---

## Post-Rotation Verification Checklist

- [ ] Old `ADMIN_PASSWORD` rejected at `/api/admin/login`
- [ ] New admin session works on `/admin/analytics` and `/admin/seo`
- [ ] `/api/admin/health` returns 200 (no secrets in response body)
- [ ] `/api/admin/seo-health` returns 200 (no secrets in response body)
- [ ] `/api/analytics/visitors` requires valid Bearer token
- [ ] GA4 dashboard loads metrics
- [ ] Search Console SEO dashboard loads metrics
- [ ] `.env` removal committed in PR #99 (not re-added)

---

## Timeline Recommendation

| When | Action |
|------|--------|
| Before merge | Commit `.env` index removal in PR #99 |
| Immediately after merge | Rotate P0 secrets in Vercel Production |
| Within 24h | Rotate P1 secrets; verify all endpoints |
| Optional later | History rewrite with team approval |

---

## Related Documents

- `docs/GIT_SECRET_AUDIT.md`
- `docs/SECRET_DEPENDENCY_MAP.md`
- `reports/final-merge-readiness.md`
