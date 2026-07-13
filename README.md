# Dr Otgen Clinic — Web Sitesi

Çok dilli, statik kurumsal web sitesi. **Vanilla JavaScript + Vite 8** ile geliştirilmiştir; React/Vue kullanılmaz.

- **Canlı site:** https://www.drotgenclinic.com
- **Deployment:** Vercel
- **Kaynak dil:** Türkçe (`/tr/`)

## Özellikler

- 8 dil: TR, EN, AR, ES, FR, IT, RU, DE (Arapça RTL)
- 48 hizmet/kurumsal sayfa + departman sayfaları (Finans, Hukuk, Göz Sağlığı, 5 Ar-Ge)
- Build-time SEO prerender (`/_seo/`), sitemap, schema.org, hreflang
- Admin analytics dashboard: `/admin/analytics`
- GTM event tracking (WhatsApp, randevu CTA, form gönderimi)

## Gereksinimler

- Node.js 20+
- npm

## Kurulum

```bash
git clone <repo-url>
cd dotgenclinic-git
npm install
```

## Geliştirme

```bash
npm run dev
```

Tarayıcı: http://localhost:5173 — locale URL'leri otomatik rewrite edilir (`/tr/`, `/en/service.html?slug=...`).

Önizleme (production build sonrası):

```bash
npm run build
npm run preview
```

## Build

```bash
npm run build
```

Pipeline sırası:

1. `validate:i18n` — çeviri JSON yapı tutarlılığı
2. `vite build` — bundle + SEO prerender (ana sayfa, hizmet, gizlilik, göz sağlığı)
3. `runBuildValidations` — 30+ verify script (departman preview build dahil)

Build başarısız olursa terminalde hangi verify scriptinin koptuğu görünür.

## i18n

| Tür | Konum |
|-----|-------|
| TR kaynak (UI) | `index.html`, `src/subpages-data.js` |
| Diğer diller UI | `src/i18n/ui/{locale}.json` |
| Hizmet içerikleri | `src/i18n/content/{locale}.json` |
| Departman modülleri | `src/i18n/{modül}/{locale}.json` |

Komutlar:

```bash
npm run validate:i18n   # yapı kontrolü
npm run translate       # Google Translate ile toplu çeviri (dikkatli kullanın)
```

Locale URL formatı: `/tr/`, `/en/`, `/ar/`, `/es/`, `/fr/`, `/it/`, `/ru/`, `/de/`

## Yeni hizmet sayfası ekleme

1. Word belgelerinden içerik üretimi (opsiyonel): `python scripts/generate-static-content.py`
2. `src/subpages-data.js` ve `src/i18n/content/*.json` güncelle
3. Çeviri: `npm run translate` veya manuel JSON
4. Vercel SEO rewrite: `node scripts/generate-vercel-service-rewrites.mjs`
5. `npm run build`

## Admin Analytics

Dashboard: `/admin/analytics`  
Health check: `/api/admin/health`

Ortam değişkenleri için `env.example` dosyasına bakın. **`.env` dosyasını asla commit etmeyin.**

Yerel kurulum:

```bash
cp env.example .env   # değerleri doldurun
# veya secrets/google-service-account.json (gitignore'da)
node scripts/prepare-vercel-analytics-env.mjs
node scripts/verify-admin-analytics-config.mjs
node scripts/verify-admin-analytics-config.mjs --vercel
```

Canlı doğrulama:

```bash
node scripts/verify-live-admin-analytics.mjs
```

## Vercel Serverless Functions (Hobby limit)

Vercel Hobby planında deployment başına **en fazla 12** serverless function.

- Yalnızca `api/**/*.js` handler dosyaları function sayılır
- Paylaşılan kod **`server/analytics/`** altında tutulur (`api/lib/` kullanmayın)
- Function sayısı kontrolü: `node scripts/verify-vercel-function-count.mjs`

Mevcut handler'lar (6/12):

- `api/admin/dashboard.js`
- `api/admin/login.js`
- `api/admin/logout.js`
- `api/admin/session.js` (health check rewrite ile `/api/admin/health`)
- `api/analytics/events.js`
- `api/analytics/visitors.js`

## Proje yapısı (özet)

```
├── index.html, service.html, privacy.html, …   # Sayfa shell'leri
├── admin/analytics.html                        # Admin dashboard
├── api/                                        # Vercel serverless handlers
├── server/analytics/                           # API paylaşılan modüller
├── src/                                        # Uygulama kaynak kodu
│   ├── main.js, service.js, i18n.js
│   ├── subpages-data.js                        # TR hizmet verisi
│   └── i18n/                                   # Çeviri dosyaları
├── scripts/                                    # Build, SEO, verify scriptleri
├── public/                                     # Statik assetler, sitemap, robots.txt
├── vercel.json                                 # Redirect, rewrite, headers
└── vite.config.js
```

## Faydalı verify scriptleri

| Script | Amaç |
|--------|------|
| `scripts/verify-vercel-function-count.mjs` | Hobby function limiti |
| `scripts/verify-admin-analytics-config.mjs` | Analytics env doğrulama |
| `scripts/verify-live-admin-analytics.mjs` | Canlı production kontrolü |
| `scripts/verify-sitemap.mjs` | Sitemap tutarlılığı |
| `scripts/verify-vercel-rewrites.mjs` | SEO rewrite kuralları |

## Güvenlik

- `.env`, `secrets/` commit edilmez
- `main` branch'e doğrudan push yapmayın; `fix/` veya `feat/` branch + PR kullanın
- Form gönderimi: FormSubmit.co (`src/main.js`)

## Lisans

Private — Dr Otgen Clinic.
