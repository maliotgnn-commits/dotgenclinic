# Dr Otgen Clinic — Proje Hafıza Dokümanı

> **Amaç:** Bu doküman, projeyi yeni bir Cursor hesabına veya başka bir geliştiriciye devretmek için hazırlanmıştır.
> **Son güncelleme:** 1 Ağustos 2026

---

## 1. Projenin amacı ve genel açıklaması

**Dr Otgen Clinic Aesthetic** için çok dilli, statik bir kurumsal web sitesidir. Klinik; estetik cerrahi, saç ekimi, diş estetiği, medikal estetik, longevity ve göz sağlığı alanlarında hizmet sunmaktadır.

Site şu işlevleri yerine getirir:

- **Ana sayfa:** Marka tanıtımı, intro animasyonu, hizmet vitrinleri, istatistikler, randevu formu
- **Hizmet alt sayfaları:** 48 tedavi/hizmet sayfası (`?slug=` parametresiyle)
- **Özel departman sayfaları:** Finans, Hukuk, Göz Sağlığı, 5 Ar-Ge modülü (İlaç, Medikal, Yazılım, Blockchain, E-ticaret)
- **Gizlilik politikası (KVKK):** Çok dilli yasal metin
- **Admin analytics:** GA4 dashboard (`/admin/analytics`)
- **SEO:** Build sırasında statik HTML üretimi, sitemap, schema.org, OG meta, hreflang
- **i18n:** 8 dil desteği (TR kaynak dil)
- **Cookie consent:** Sağ altta float ikon + GTM (JS ile yüklenir)

**Canlı domain:** `https://www.drotgenclinic.com`
**Deployment:** Vercel (statik site + sınırlı serverless API, `vercel.json` ile yönlendirme/rewrite)

İçerik büyük ölçüde statik JSON/JS dosyalarında tutulur. Admin analytics için Vercel serverless function'lar ve GA4 Data API kullanılır.

---

## 2. Kullanılan teknolojiler ve frameworkler

| Katman | Teknoloji |
|--------|-----------|
| Build aracı | **Vite 8** (MPA — Multi Page Application) |
| Dil | **Vanilla JavaScript** (ES modules, `type: "module"`) |
| Stil | **CSS** (tek `style.css` + sayfa özel CSS dosyaları) |
| i18n | JSON sözlükler + runtime çeviri (`translate()`) |
| Çeviri üretimi | Google Translate unofficial API (`generate-translations.mjs`) |
| İçerik üretimi | Python (`generate-static-content.py` — Word dosyalarından) |
| SEO/SSG | Build-time prerender scriptleri (`scripts/prerender-*.mjs`) |
| Analytics API | GA4 Data API (`@google-analytics/data`), Chart.js |
| CI | GitHub Actions (`.github/workflows/ci.yml`) — `npm ci` + `npm run build` |
| Test/Doğrulama | Node.js verify scriptleri + opsiyonel **Playwright** |
| Hosting | **Vercel** (statik + 6 serverless function) |
| Form gönderimi | **FormSubmit.co** (üçüncü parti, AJAX) |

**Bağımlılıklar** (`package.json`):

- `vite: ^8.0.1`
- `playwright: ^1.61.1` (devDependency)
- `@google-analytics/data: ^6.1.0`
- `chart.js: ^4.5.1`

**Framework yok:** React, Vue, Angular kullanılmıyor.

---

## 3. Klasör yapısı

```
dotgenclinic-git/
├── index.html                    # Ana sayfa (TR kaynak HTML)
├── service.html                  # Hizmet alt sayfa shell
├── privacy.html                  # Gizlilik politikası shell
├── goz-hastaliklari.html         # Göz sağlığı shell
├── finans-departmani.html        # Finans departmanı shell
├── hukuk-departmani.html         # Hukuk departmanı shell
├── ilac-ar-ge.html               # İlaç Ar-Ge shell
├── medikal-ar-ge.html            # Medikal Ar-Ge shell
├── yazilim-ar-ge.html            # Yazılım Ar-Ge shell
├── blockchain-ar-ge.html         # Blockchain Ar-Ge shell
├── e-ticaret-ar-ge.html          # E-ticaret Ar-Ge shell
├── admin/analytics.html          # Admin analytics dashboard shell
├── vite.config.js                # Ana Vite config + locale routing + SEO pipeline
├── vercel.json                   # Redirect, rewrite, security headers
├── env.example                   # Admin analytics ortam değişkenleri şablonu
├── package.json
├── README.md                     # Kurulum/build rehberi
├── AGENTS.md                     # Cursor agent kuralları
├── PROJECT_CONTEXT.md            # Bu doküman
├── .cursor/rules/                # Cursor agent kuralları
│   └── safe-automated-delivery.mdc
├── .github/workflows/ci.yml      # CI: build + verify
├── api/                          # Vercel serverless handlers (6 function)
│   ├── admin/                    # login, logout, session, dashboard
│   └── analytics/                # events, visitors
├── server/analytics/             # API paylaşılan modüller (function sayılmaz)
├── public/                       # Statik assetler, sitemap, robots.txt
├── src/                          # Uygulama kaynak kodu
│   ├── main.js, service.js, privacy.js, eye-health.js
│   ├── cookie-consent.js         # GTM + çerez widget
│   ├── finance-department.js, legal-department.js, …
│   ├── admin-analytics.js
│   ├── i18n.js, subpages-data.js, nav-shared.js
│   └── i18n/                     # ui/, content/, departman modülleri
└── scripts/                      # Build, SEO, doğrulama (~70 dosya)
    ├── run-build-validations.mjs
    ├── sitemap-urls.mjs
    ├── department-seo-config.mjs
    ├── prerender-*.mjs
    ├── verify-*.mjs
    └── generate-vercel-service-rewrites.mjs
```

---

## 4. Önemli dosyalar ve görevleri

### Giriş noktaları (HTML → JS)

| Dosya | Entry JS | Açıklama |
|-------|----------|----------|
| `index.html` | `src/main.js` | Ana sayfa |
| `service.html` | `src/service.js` | `?slug=` ile hizmet sayfası |
| `privacy.html` | `src/privacy.js` | KVKK / gizlilik |
| `goz-hastaliklari.html` | `src/eye-health.js` | Göz sağlığı |
| Departman shell'leri | `src/*-department.js` | Finans, Hukuk, Ar-Ge |
| `admin/analytics.html` | `src/admin-analytics.js` | GA4 admin dashboard |

Tüm public entry dosyaları `import './cookie-consent.js'` ile GTM ve çerez widget'ını başlatır (`admin/analytics.html` hariç).

### Çekirdek modüller

| Dosya | Görev |
|-------|-------|
| `src/cookie-consent.js` | GTM yükleme, çerez ikonu, consent kaydı |
| `src/analytics.js` | dataLayer event'leri (WhatsApp, CTA, servis görüntüleme) |
| `src/i18n.js` | Locale algılama, URL oluşturma, çeviri |
| `src/subpages-data.js` | Hizmet/kurumsal sayfalar + pillar rehberlerin TR kaynak verisi |
| `src/seo-pillar-content.js` | 5 SEO pillar rehber içeriği (service pipeline) |
| `src/seo-content-clusters.js` | Cluster / orphan inbound / pillar registry |
| `scripts/sitemap-urls.mjs` | Sitemap URL tek kaynağı |
| `scripts/department-seo-config.mjs` | Departman SEO prerender + rewrite tanımları |
| `scripts/seo-shared.mjs` | Schema.org, OG meta, hreflang |
| `vite.config.js` | Locale middleware + build SEO pipeline |

### URL yapısı

```
/                           → redirect → /tr/
/tr/                        → index.html
/en/service.html?slug=botox → service.html + JS render
/tr/finans-departmani.html  → finans-departmani.html (+ _seo rewrite)
/admin/analytics            → admin/analytics.html
/api/admin/health           → api/admin/session?healthCheck=1
```

### Build pipeline (`npm run build`)

1. `validate:i18n` — JSON yapı tutarlılığı
2. `vite build` — ana entry'ler
3. `closeBundle` hook:
   - OG image doğrulama
   - `prerenderHomeSeo`, `prerenderServiceSeo`, `prerenderPrivacySeo`, `prerenderEyeHealthSeo`
   - `runBuildValidations`:
     - Departman preview build (8 dil × 7 departman)
     - `prerenderDepartmentSeo` → `dist/_seo/{locale}/{dept-file}.html`
     - 40+ verify script

### Sitemap ve Vercel SEO rewrite

- **Sitemap / rewrite sayıları** build sırasında `SUBPAGES` + departman config’ten üretilir (pillar rehberler service slug olarak dahil).
- Üretim: `node scripts/generate-sitemap.mjs`, `node scripts/generate-vercel-service-rewrites.mjs`

---

## 5. Tamamlanmış ana özellikler

1. **Çok dilli site (8 dil)** — RTL (Arapça)
2. **Hizmet/kurumsal sayfalar + 5 SEO pillar rehber** (service pipeline)
3. **Departman sayfaları (8 dil × 7 modül)**
4. **Lokasyon sayfaları:** İzmir, Denizli, Leverkusen + local SEO sinyalleri
5. **SEO altyapısı:** Hizmet + departman `/_seo/` prerender, schema.org, hreflang, sitemap
6. **Admin analytics + SEO admin:** GA4 / GSC scaffold, session auth
7. **GTM event tracking:** WhatsApp, randevu CTA, form gönderimi
8. **Cookie consent widget:** Sağ altta float ikon (WhatsApp/Instagram üstü), 8 dil
9. **CI/CD:** GitHub Actions — PR/push to `main` için build doğrulama
10. **Doğrulama altyapısı:** 40+ otomatik verify script (build'e entegre)

### Son merge örnekleri

| PR | Konu |
|----|------|
| #123 | Denizli / İzmir local SEO |
| #124 | GBP Maps sameAs |
| #125 | GBP OAuth refresh |

Açık PR listesi için: `gh pr list --state open` (bu dokümanda sabitlenmez).

---

## 6. Bilinen eksikler ve açık işler

### Mimari eksikler

| Eksik | Detay |
|-------|-------|
| **Veritabanı yok** | İçerik statik JSON/JS dosyalarında |
| **Otomatik test suite yok** | `package.json`'da test scripti yok; Playwright opsiyonel |
| **GA4 custom dimension'lar** | Admin dashboard'da `service_title` / `service_slug` dimension hataları görülebilir |

### İçerik / ops (güncel)

1. **Doktor E-E-A-T:** Kadro değişeceği için bilerek ertelendi; `noindex` + `MISSING_DATA` korunur
2. **Secret rotation / env teyidi:** Owner checklist → `docs/OPS_ENV_VERIFICATION.md`
3. **Authority / PR outreach:** Manuel; `reports/authority-plan.md`
4. **Çeviri kalitesi:** Pillar metinleri Translate pipeline ile çoğaltılır; insan edit önerilir

### Bilinen tutarsızlıklar / riskler

1. **TR UI sözlüğü yok:** Türkçe kaynak doğrudan HTML/JS'te
2. **FormSubmit bağımlılığı:** Üçüncü parti; spam/GDPR sınırlı
3. **Google Translate API:** Resmi olmayan endpoint
4. **vercel.json boyutu:** Slug/departman değişince `generate-vercel-service-rewrites.mjs` çalıştırılmalı
5. **Vercel Hobby limit:** En fazla 12 serverless function

### Uzun vadeli backlog

- FormSubmit alternatifi
- Çeviri kalitesi / CMS
- E2E test suite
- GA4 custom dimension yapılandırması
- Doktor kadrosu netleşince E-E-A-T + Physician schema

---

## 7. Admin Analytics

| Endpoint | Açıklama |
|----------|----------|
| `/admin/analytics` | Dashboard UI |
| `/api/admin/login` | Oturum açma |
| `/api/admin/logout` | Oturum kapatma |
| `/api/admin/session` | Oturum doğrulama |
| `/api/admin/health` | Health check |
| `/api/admin/dashboard` | GA4 metrikleri |
| `/api/analytics/events` | GTM event toplama |
| `/api/analytics/visitors` | Ziyaretçi verisi |

**Vercel function sayısı:** 6/12 (Hobby limit)

```bash
node scripts/verify-admin-analytics-config.mjs
node scripts/verify-live-admin-analytics.mjs
node scripts/verify-vercel-function-count.mjs
```

> `.env` ve `secrets/` asla commit edilmez.

---

## 8. Veritabanı yapısı

**Veritabanı yoktur.** Tüm veri statik dosyalarda (`src/subpages-data.js`, `src/i18n/**`).

---

## 9. API ve entegrasyonlar

| Servis | Kullanım |
|--------|----------|
| **FormSubmit.co** | Randevu formu |
| **Google Analytics 4 / GTM** | Event tracking + admin dashboard |
| **Google Fonts** | Inter, Playfair Display, Noto Arabic |
| **Vercel** | Hosting, serverless, rewrite |
| **WhatsApp / Instagram** | Float butonlar + sosyal linkler |

---

## 10. Environment değişkenleri

Runtime frontend için zorunlu env yok. Admin analytics için `env.example` dosyasına bakın.

> `.env` dosyasını okuma/gösterme/commit etme.

---

## 11. Kodlama kuralları

Detaylı kurallar: `.cursor/rules/safe-automated-delivery.mdc`, `AGENTS.md`

1. Minimal diff — gereksiz refactor yok
2. TR kaynak dil
3. Vanilla JS — framework ekleme
4. Locale URL formatını koru
5. `main`'e doğrudan push yasak; `fix/` veya `feat/` branch + PR

---

## 12. Hızlı başlangıç

```bash
npm install
npm run dev
npm run build
npm run preview
npm run validate:i18n
```

**Yeni hizmet veya departman SEO değişikliği:**

```bash
node scripts/generate-vercel-service-rewrites.mjs
node scripts/generate-sitemap.mjs
npm run build
```

---

## 13. Cursor'a taşıma checklist

- [ ] Git repo clone
- [ ] `.cursor/rules/safe-automated-delivery.mdc` + `AGENTS.md` mevcut
- [ ] `npm install && npm run build` başarılı
- [ ] Vercel + GitHub erişimi
- [ ] `env.example` → `.env` (güvenli kanaldan)
- [ ] Bu dokümanı proje bağlamı olarak ekle

---

*Bu doküman kod tabanı analizine dayanır. Canlı deployment ve PR durumu GitHub/Vercel üzerinden doğrulanmalıdır.*
