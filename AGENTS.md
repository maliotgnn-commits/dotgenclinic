# Dr Otgen Clinic - Cursor Agent Rules

## Proje Genel Kuralları

Bu proje:

- Vanilla JavaScript + Vite kullanır.
- React, Vue veya başka framework ekleme.
- Mevcut mimariyi bozma.
- Gereksiz refactor yapma.
- Minimal değişiklik yap.

## Kodlama Kuralları

- Mevcut dosya yapısına uy.
- ES Modules kullan.
- Import/export yapısını koru.
- Yeni bağımlılık eklemeden önce onay al.
- CSS ve tasarım değişikliklerinde mevcut görünümü koru.

## i18n Kuralları

- Ana kaynak dil Türkçedir.
- Yeni içerikler önce Türkçe oluşturulur.
- Diğer diller mevcut çeviri sistemine uygun eklenir.
- URL yapısını bozma:

```
/tr/
/en/
/ar/
/es/
/fr/
/it/
/ru/
/de/
```

## Güvenlik

Asla:

- `.env` dosyasını okuma
- Gizli anahtarları gösterme
- API key paylaşma
- Şifreleri değiştirme

## Git Kuralları

- `main` branch üzerinde doğrudan değişiklik yapma.
- Büyük değişikliklerden önce analiz yap.
- Hard reset veya force push kullanma.

## Değişiklik Öncesi

Her zaman:

1. İlgili dosyaları analiz et.
2. Mevcut yapıyı anla.
3. Değişiklik planını açıkla.
4. Sonra kod değiştir.

## Değişiklik Sonrası

Rapor ver:

- Değiştirilen dosyalar
- Yapılan işlemler
- Test sonucu
- Olası riskler

## Öncelik

Öncelik sırası:

1. Mevcut çalışan sistemi koru
2. SEO yapısını bozma
3. Çoklu dil sistemini koru
4. Kullanıcı deneyimini koru
5. Temiz ve sürdürülebilir kod yaz

## Cursor Cloud specific instructions

Bağımlılıklar startup update script'i (`npm ci`) ile kurulur; aşağıdaki notlar servisleri çalıştırırken faydalı, tekrar kurulum gerektirmeyen kalıcı bilgilerdir.

- **Servis modeli:** Tek geliştirme servisi var — Vite dev sunucusu (`npm run dev`, port `5173`). Backend/DB yok; içerik statik JSON/JS'te. Admin analytics (`api/**`) yalnızca Vercel serverless + GA4 env ile çalışır ve frontend geliştirme için gerekmez.
- **Locale routing:** Kök `/` doğrudan içerik döndürmez; sayfalar `/tr/`, `/en/` gibi locale önekli URL'lerden gelir (Vite middleware rewrite eder, bkz. `vite.config.js` + `scripts/locale-route-rewrite.mjs`). Tarayıcıda `http://localhost:5173/tr/` ile başla.
- **Beklenen davranış (gotcha):** `index.html` `<title>` ve gövdesi Türkçe kaynak kalır; dil çevirisi runtime'da JS ile yapılır. Yani `curl /en/` çıktısındaki başlık hâlâ Türkçe görünür — bu hata değil, çeviri tarayıcıda gerçekleşir.
- **Lint/test/build:** Ayrı lint veya birim test suite'i yoktur. En kapsamlı doğrulama `npm run build`'dir (~4-5 dk): `validate:i18n` + `vite build` + 40+ `verify-*` script + 500+ SEO sayfası prerender. Hızlı i18n kontrolü için `npm run validate:i18n`. Bkz. `README.md` ve `package.json` scripts.
- **Playwright:** Tarayıcı tabanlı nav doğrulamaları varsayılan olarak atlanır (`verify-nav-category-labels` → `VERIFY_NAV_BROWSER=1` ile açılır). Gerekirse tarayıcı: `npx playwright install chromium-headless-shell`. Build bu olmadan da geçer.
