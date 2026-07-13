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
