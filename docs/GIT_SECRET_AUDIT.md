# Git Secret Audit — `.env`

Generated: 2026-07-15  
Scope: PR #99 pre-merge security review

---

## Executive Summary

| Item | Status |
|------|--------|
| `.env` ever committed? | **Yes** — 1 commit |
| `.env` currently tracked? | **No** (staged removal: `git rm --cached --sparse .env`) |
| `.gitignore` protection | **Updated** — `.env`, `.env.*`, `secrets/**`, `*-service-account.json` |
| Risk level | **HIGH** |
| Rotate required? | **Yes** — admin + Vercel tokens |
| History cleanup | **Recommended** (manual; no auto filter-repo in this workflow) |

---

## Git History Analysis

### Commands run

```text
git log --all --oneline -- .env
git ls-files .env
git status --porcelain .env
```

### Findings

| Check | Result |
|-------|--------|
| Commits touching `.env` | **1** |
| Commit hash | `f20213d` |
| Date | 2026-06-30 |
| Subject | `med temizlenmis ilk kurulum` |
| Change | `.env` added (+5 lines) |
| Subsequent `.env` commits | None |
| `git ls-files .env` | **Empty** — not in current index |
| Working tree status | `D .env` staged (index removal pending commit) |

### Branch exposure

Commit `f20213d` is reachable from:

- `main`
- `origin/main`
- All feature branches derived from that history

Anyone with repository read access can retrieve the blob via:

```text
git show f20213d:.env
```

**Secret values are not documented in this report.**

---

## Affected Secret Categories (commit `f20213d`)

Key names identified in historical blob (values withheld):

| Key | Category | In app code? |
|-----|----------|--------------|
| `ADMIN_PASSWORD` | Admin dashboard login | Yes — `server/analytics/admin-auth.js` |
| `ADMIN_SESSION_SECRET` | HMAC session signing | Yes — `server/analytics/admin-auth.js` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage | No direct reference in repo |
| `VERCEL_OIDC_TOKEN` | Vercel OIDC / deployment | No direct reference in repo |

### Not found in this `.env` commit

| Key | Status |
|-----|--------|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Not in commit `f20213d` |
| `GOOGLE_PRIVATE_KEY` | Not in commit `f20213d` |
| `GOOGLE_CLIENT_EMAIL` | Not in commit `f20213d` |
| `GA4_PROPERTY_ID` | Not in commit `f20213d` |
| `ANALYTICS_API_SECRET` | Not in commit `f20213d` (separate key; may share value with session secret in Vercel) |

**Google Service Account credentials were not exposed via this `.env` commit.**

---

## Current Protection Status

### `.gitignore` (verified)

```text
secrets/
secrets/**
*.pem
*.p12
*-service-account.json
.env
.env.*
!.env.example
```

### Bundle / artifact scan

| Path | Secret patterns |
|------|-----------------|
| `src/` | None |
| `public/` | None |
| `dist/` | None |

---

## Risk Level: HIGH

| Factor | Impact |
|--------|--------|
| Plaintext admin credentials in git history | Unauthorized admin access if old values still active |
| Vercel Blob + OIDC tokens in history | Storage / deployment surface |
| Reachable from `main` | Production branch history contaminated |
| Index removal alone | Does **not** erase history |

---

## Rotate Required?

| Secret | Required |
|--------|----------|
| `ADMIN_PASSWORD` | **Yes** |
| `ADMIN_SESSION_SECRET` | **Yes** |
| `ANALYTICS_API_SECRET` | **Yes** (if used; often paired with session secret) |
| `BLOB_READ_WRITE_TOKEN` | **Yes** |
| `VERCEL_OIDC_TOKEN` | **Revoke / rotate** |
| Google Service Account | **No** (not in this commit) |

---

## History Cleanup Recommendations

### Minimum (required before trusting production)

1. Commit staged `.env` index removal in PR #99
2. Rotate all affected secrets in Vercel dashboard
3. Invalidate active admin sessions (automatic after `ADMIN_SESSION_SECRET` rotation)

### Optional (advanced — requires team approval)

| Option | Tool | Notes |
|--------|------|-------|
| Rewrite history | `git filter-repo` / BFG | Removes blob from all commits; **requires force push** — not executed in this workflow |
| GitHub secret scanning | Enable in repo settings | Alerts on future leaks |
| Prevent re-add | Branch protection + pre-commit hook | Block `.env` commits |

**Do not run filter-repo without explicit approval and coordinated force-push plan.**

---

## Related Documents

- `docs/SECRET_DEPENDENCY_MAP.md` — where each secret is used
- `docs/SECRET_ROTATION_PLAN.md` — step-by-step rotation checklist
- `reports/final-merge-readiness.md` — merge gate summary
