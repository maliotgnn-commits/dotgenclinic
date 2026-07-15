# Dr Otgen Final SEO Audit

Generated: 2026-07-15 (pre-deploy review)

Auditor scope: Security, Search Console API, SEO Dashboard, Indexability, Schema, E-E-A-T, Performance, Content, Local SEO, Analytics, Build Validation.

---

## Security Score

**7.5 / 10**

### HIGH

| # | Finding | Status |
|---|---------|--------|
| H1 | `.env` dosyası git index'inde tracked (`git ls-files .env` → tracked). `.gitignore` kuralı var ama dosya geçmişte/index'te kalabilir. Secret sızıntısı riski. | **Manuel:** Vercel env kullan; `.env`'i git'ten çıkar (`git rm --cached .env`), secret rotate et. |
| H2 | `/api/admin/seo-health` (healthCheck=1) auth gerektirmiyordu ve service account email sızdırıyordu. | **Düzeltildi:** Public health artık yalnızca `ready`, `siteUrlConfigured`, `credentialsConfigured` döner. |

### MEDIUM

| # | Finding | Recommendation |
|---|---------|----------------|
| M1 | `/api/admin/health` (analytics session healthCheck) auth olmadan config durumu döner (GA4 property id, credential flags). | Opsiyonel: public health payload'ı minimize et (SEO health ile aynı pattern). |
| M2 | Local dev (`!VERCEL` + unset `ADMIN_PASSWORD`): admin API'ler auth bypass. | Production'da `ADMIN_PASSWORD` + `ADMIN_SESSION_SECRET` zorunlu tut. |
| M3 | Authenticated `/api/admin/seo` yanıtında `serviceAccount` email görünür. | Admin-only; kabul edilebilir. Public'e gitmiyor. |
| M4 | `/api/analytics/*` Bearer/API key ile korunuyor; production'da `ANALYTICS_API_SECRET` zorunlu. | Vercel env checklist doğrula. |

### LOW

| # | Finding |
|---|---------|
| L1 | `secrets/` ve `.env*` `.gitignore`'da — doğru. |
| L2 | Frontend bundle'da `GOOGLE_SERVICE_ACCOUNT_JSON` / private key yok (grep temiz). |
| L3 | Admin sayfalar `noindex, nofollow` meta içeriyor. |
| L4 | Session cookie: HttpOnly, SameSite=Strict, Secure (Vercel). |

---

## Technical SEO Score

**9 / 10**

- Sitemap: **464 URL** (8 home + 8 privacy + 8 eye health + 56 department + 384 service)
- Canonical + hreflang: `scripts/seo-shared.mjs` + prerender pipeline
- Static service SEO: 384/384 verified
- Locale URL formatı korunuyor (`/tr/`, `/en/`, …)
- Admin pages SEO index kontrolünden hariç (`/admin/analytics`, `/admin/seo`)

---

## Search Console Integration Score

**8 / 10**

### Architecture

| Module | Role |
|--------|------|
| `client.js` | JWT auth, scoped `webmasters.readonly`, error mapping |
| `performance.js` | clicks, impressions, CTR, position, queries, pages + period comparison |
| `indexing.js` | Sitemap coverage (submitted/indexed/excluded estimate) |
| `seo-report.js` | Aggregator + index health + service performance |
| `service-performance.js` | Category grouping + opportunity pages (pos 5–20) |

### Strengths

- Mevcut GA4 service account yeniden kullanılıyor (`GOOGLE_SERVICE_ACCOUNT_JSON`)
- Private key yalnızca server-side JWT
- Error handling: `GSC_PERMISSION_DENIED`, `GSC_QUOTA_EXCEEDED`, `GSC_SITE_NOT_FOUND`
- Token client cache (`cachedAuthClient`)

### Gaps

| Gap | Impact |
|-----|--------|
| Response cache yok | Her dashboard refresh 4+ GSC API call; rate limit riski düşük ama dashboard yoğun kullanımda quota |
| Index "excluded" sitemap-derived | Bulk Page Indexing report API'de yok — bilinen sınırlama |
| Build-time weekly report | CI subprocess'te credentials olmayabilir; local `.env` ile tam rapor |

### Runtime verification (prior session)

- Service account: `dr-otgen-ga4-automation@dr-otgen-analytics-automation.iam.gserviceaccount.com`
- Sample: 30 clicks, 423 impressions, 18 queries, 21 pages (28-day window)

---

## Schema Score

**8.5 / 10**

| Type | Status |
|------|--------|
| Organization | Home + service pages |
| MedicalClinic | Izmir canonical (home); 3 locations (privacy) |
| LocalBusiness | Denizli, Leverkusen branches |
| Service | Per service page |
| BreadcrumbList | Service pages |
| FAQPage | Service pages with FAQs |
| Physician/Person | **Blocked** until `profileCompleted=true` && `indexed=true` |

Validators (`verify-schema.mjs`): PASS

Rich Results rules enforced:
- No fake reviews/ratings/offers on MedicalClinic
- No Physician schema on incomplete doctors
- Instagram-only sameAs on MedicalClinic (verified)

---

## E-E-A-T Score

**3 / 10** (by design — scaffolds awaiting real data)

| Doctor | Specialty | profileCompleted | indexed | Schema |
|--------|-----------|------------------|---------|--------|
| Prof. Dr. Mübin Hoşnuter | Plastic | false | false | blocked |
| Dt. Ayça Koku | Dental | false | false | blocked |
| Uzm. Dr. Sina Evsen | Eye health | false | false | blocked |

Missing fields (all `GERÇEK VERİ GEREKİYOR`):
- education, experience, certifications, publications, congresses, memberships, approach

Photo: on-site images present (not placeholder URLs).

**No fake doctor data added** — correct pre-deploy posture.

---

## Performance Score

**7 / 10**

| Area | Finding |
|------|---------|
| **LCP** | Hero poster preload (AVIF); video `preload="none"` until intro complete — good. Intro overlay scroll-gated may delay LCP on first visit. |
| **CLS** | Partner/team images have width/height; hero min-height set inline |
| **INP** | Chart.js only on admin analytics (not public). Nav/menus centralized. Intro wheel/touch handlers on home. |
| **Images** | AVIF/WebP picture elements widespread; lazy loading on below-fold |
| **Fonts** | `fonts-loader.js` + preconnect to Google Fonts |

Admin SEO dashboard: lightweight (no Chart.js), table-based — good.

---

## Local SEO Score

**5 / 10**

| Location | Schema data | GBP |
|----------|-------------|-----|
| İzmir | address, phone, hours, url | sameAs scaffold (Instagram only verified) |
| Denizli | address, phone | geo/hours/url empty |
| Leverkusen | address, phone | geo/hours/url empty |

Google Business API scaffold ready (`server/seo/google-business/`). Env not configured — graceful fallback.

No fake GBP URLs added — correct.

---

## Content Score

**5 / 10**

| Pillar | Status |
|--------|--------|
| Saç Ekimi Rehberi | planned |
| Estetik Cerrahi Rehberi | planned |
| Dental Rehberi | planned |
| Medical Aesthetics Rehberi | planned |
| Longevity Rehberi | planned |

Internal linking: cluster `serviceLinkOrder` + orphan inbound map active.

Orphan pages (5): representatives, production, management, maxx-royal-wellness-bodrum, museum-hotel-wellness-kapadokya — inbound links mapped.

Duplicate FAQ note: 36 non-corporate pages share generic recovery FAQ (documented, not blocking).

---

## SEO Dashboard Audit (`/admin/seo`)

| Check | Status |
|-------|--------|
| Admin auth (session cookie) | Required on Vercel |
| Login UI + error state | Present |
| Loading state | Present (`is-loading` class) |
| Refresh / logout | Present |
| Mobile CSS | Responsive grids `@media (max-width: 1024px)` |
| Metrics displayed | Clicks, impressions, CTR, position, index health, service performance, queries, pages |
| robots | `noindex, nofollow` |

Minor: service account email shown in authenticated dashboard subtitle — acceptable for admin ops.

---

## Indexability Audit

### Should be indexed (464 sitemap URLs)

- 8 locale home pages
- 8 privacy pages
- 8 eye health pages
- 56 department pages
- 384 service pages (48 slugs × 8 locales)

Static prerender sets service pages to `index, follow`.

### Should NOT be indexed

| URL pattern | Mechanism |
|-------------|-----------|
| `/admin/analytics`, `/admin/seo` | `noindex, nofollow` meta |
| `/doctor.html?slug=*` | Default `noindex, follow`; not in sitemap |
| Doctor profiles (3 × 8 locales) | `indexed: false` until verified |

### Thin / duplicate / orphan

- **Thin content risk:** 5 orphan corporate/wellness slugs — mitigated by inbound link map
- **Duplicate FAQ:** 36 service pages — medium content SEO debt
- **No duplicate sitemap URLs** — verified

---

## Analytics Audit

| Event | Implemented | Parameters |
|-------|-------------|------------|
| `service_page_view` | Yes | page_locale, service_slug, service_category, service_title |
| `whatsapp_click` | Yes | page_locale, link_location, service_slug |
| `appointment_cta` | Yes | page_locale, cta_location, service_slug |
| `form_submit` | Yes | main.js (multiple forms) |
| `language_switch` | Yes | from_locale, to_locale |
| `referral_source` | Yes | main.js attribution |

GTM: consent-gated via `cookie-consent.js` + `hasAnalyticsConsent()`.

GA4 admin dashboard tracks same events server-side via Data API.

---

## Build + Validation Results

**`npm run build` — PASS (exit 0)**

| Validation | Result |
|------------|--------|
| i18n (8 locales) | PASS |
| Sitemap (464 URLs) | PASS |
| Schema | PASS |
| SEO growth infra | PASS |
| Duplicate FAQ | PASS (with advisory note) |
| Service static SEO (384) | PASS |
| Department static SEO (56) | PASS |
| Finance/legal preview | PASS |
| Cookie consent | PASS |
| Report generation | PASS |

---

## Critical Issues

1. **`.env` git tracked** — verify contents; remove from index before deploy; rotate any exposed secrets.
2. **Doctor E-E-A-T incomplete** — no Physician schema until real credentials supplied (correct gate, but blocks YMYL trust signals).
3. **Pillar content unpublished** — all 5 guides in `planned` state.

---

## Medium Issues

1. Analytics public health endpoint exposes config details (mirror SEO health hardening).
2. No GSC response cache — monitor quota on heavy admin usage.
3. GBP API not configured — local SEO manual.
4. 36 pages with generic recovery FAQ — content differentiation needed.
5. Intro overlay may impact first-visit LCP on home.

---

## Low Issues

1. Build subprocess weekly report may lack credentials (fallback template).
2. Index excluded counts are sitemap-estimated, not full GSC Page Indexing export.
3. `reports/` not in `.gitignore` — generated reports may appear in git status.

---

## Deploy Ready?

**CONDITIONAL YES**

Technical infrastructure, validation pipeline, and security baseline are deploy-ready **after**:

1. Confirm Vercel env: `GOOGLE_SERVICE_ACCOUNT_JSON`, `GA4_PROPERTY_ID`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `ANALYTICS_API_SECRET`, `GOOGLE_SEARCH_CONSOLE_SITE_URL`
2. Resolve `.env` git tracking (do not deploy secrets via repo)
3. Add service account to Search Console property as user
4. Accept E-E-A-T and pillar content as post-deploy content work (not blockers for technical deploy)

---

## Changes Applied During This Audit

| File | Change |
|------|--------|
| `server/seo/search-console/seo-report.js` | Added `getSearchConsolePublicHealthSummary()` |
| `api/admin/seo.js` | Health endpoint uses sanitized public payload |
| `reports/final-pre-deploy-audit.md` | This report |

No commit. No PR. No deploy.
