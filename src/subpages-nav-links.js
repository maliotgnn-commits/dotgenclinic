// Lightweight nav label -> slug map for homepage link wiring.
// Full service page content lives in subpages-data.js.

export const NAV_LINK_MAP = {
  "Vizyon ve Misyon": "vision-mission",
  "Değerlerimiz": "our-values",
  "Kalite Politikası": "quality-policy",
  "Yönetim": "management",
  "Doktorlarımız": "our-doctors",
  "Sağlık Turizmi": "health-tourism",
  "Temsilciler": "representatives",
  "Prodüksiyon": "production",
  "Uluslararası Sağlık Sigortası": "international-health-insurance",
  "Safir FUE Saç Ekimi": "sapphire-fue-hair-transplant",
  "DHI Saç Ekimi": "dhi-hair-transplant",
  "Kök Hücre Destekli Saç Ekimi": "stem-cell-hair-transplant",
  "Tıraşsız Saç Ekimi": "unshaven-hair-transplant",
  "Kaş Ekimi": "eyebrow-transplant",
  "Sakal ve Bıyık Ekimi": "beard-mustache-transplant",
  "ACell PRP Saç Tedavisi": "acell-prp",
  "Lazer Saç Tedavisi": "hair-laser",
  "Eksozom Saç Terapisi": "exosome-hair-treatment",
  "Diş İmplantı": "dental-implant",
  "Diş Beyazlatma": "teeth-whitening",
  "Hollywood Gülüşü": "hollywood-smile",
  "Ortodonti": "orthodontics",
  "Pembe Estetik": "gingival-aesthetics",
  "Zirkonyum Kaplama": "zirconium-crown",
  "Meme Büyütme": "breast-augmentation",
  "Meme Küçültme": "breast-reduction",
  "Jinekomasti Ameliyatı": "gynecomastia",
  "Rinoplasti": "rhinoplasty",
  "Yüz Germe": "face-lift",
  "Blefaroplasti": "blepharoplasty",
  "Karın Germe": "tummy-tuck",
  "Liposuction": "liposuction",
  "Kalça Kaldırma": "buttock-lift",
  "Dudak Dolgusu": "lip-filler",
  "Botoks": "botox",
  "Çene Hattı Dolgusu": "jawline-filler",
  "Göz Altı Işık Dolgusu": "under-eye-light-filler",
  "Lazer Epilasyon": "laser-hair-removal",
  "PRP Cilt Tedavisi": "prp-skin-treatment",
  "Tıbbi Cilt Bakımı": "medical-skin-care",
  "Somon DNA Tedavisi": "salmon-dna",
  "Sağlıklı Beslenme": "healthy-nutrition",
  "LPG İşlemi": "lpg-treatment",
  "Ozon Terapisi": "ozone-therapy",
  "İntravenöz (IV) Tedaviler": "iv-therapies",
  "Glutatyon Terapisi": "glutathione",
  "Bodrum'da Kişiselleştirilmiş Wellness Deneyimi": "maxx-royal-wellness-bodrum",
  "Kapadokya'da Kişiselleştirilmiş Wellness Deneyimi": "museum-hotel-wellness-kapadokya"
};

export function applySubcategoryLinks(root = document, urlBuilder = (slug) => `/service.html?slug=${encodeURIComponent(slug)}`) {
  const links = root.querySelectorAll('.mega-dropdown a, .service-link[data-service-slug], .popular-item[data-service-slug]');

  links.forEach((link) => {
    const explicitSlug = link.getAttribute('data-service-slug');
    const label = link.textContent.trim();
    const slug = explicitSlug || NAV_LINK_MAP[label];
    if (!slug) return;
    link.setAttribute('href', urlBuilder(slug));
  });
}
