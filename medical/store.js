const PRODUCTS = [
  {
    id: 'diamond-ha-20',
    name: 'DIAMOND Crosslinked HA 20',
    shortName: 'DIAMOND HA 20',
    brand: 'DIAMOND',
    category: 'Dolgu',
    price: 4450,
    compareAt: 4790,
    stock: 18,
    badge: 'Çok Satan',
    tone: 'ivory',
    description: 'Dengeli formülü ve pürüzsüz yapısıyla profesyonel estetik uygulamalar için geliştirilen İtalyan seri.',
    features: ['20 mg/ml hyalüronik asit', '1 × 1 ml kullanıma hazır enjektör', '2 adet uygulama ucu', 'İtalya üretimi'],
    sku: 'DOT-DHA20-001',
  },
  {
    id: 'diamond-volume',
    name: 'DIAMOND Volume Plus',
    shortName: 'DIAMOND VOLUME',
    brand: 'DIAMOND',
    category: 'Dolgu',
    price: 5150,
    compareAt: null,
    stock: 12,
    badge: 'Yeni',
    tone: 'navy',
    description: 'Hacim odaklı profesyonel uygulamalar için yoğun yapılı, yüksek kohezyonlu DIAMOND seri ürünü.',
    features: ['Yoğun çapraz bağlı yapı', '1 × 1 ml kullanıma hazır enjektör', '2 adet uygulama ucu', 'İtalya üretimi'],
    sku: 'DOT-DVOL-002',
  },
  {
    id: 'diamond-soft',
    name: 'DIAMOND Soft Touch',
    shortName: 'DIAMOND SOFT',
    brand: 'DIAMOND',
    category: 'Dolgu',
    price: 4650,
    compareAt: 4890,
    stock: 24,
    badge: null,
    tone: 'pearl',
    description: 'İnce çizgi ve yüzeysel uygulamalar için tasarlanmış, akıcı dokulu profesyonel seri.',
    features: ['İnce dokulu jel yapısı', '1 × 1 ml kullanıma hazır enjektör', 'Hassas uygulama ucu', 'İtalya üretimi'],
    sku: 'DOT-DSOFT-003',
  },
  {
    id: 'mesofill-skin',
    name: 'Mesofill Skin Booster',
    shortName: 'MESOFILL SKIN',
    brand: 'MESOFILL',
    category: 'Cilt Bakımı',
    price: 3890,
    compareAt: 4190,
    stock: 8,
    badge: 'Sınırlı Stok',
    tone: 'aqua',
    description: 'Nem desteği ve canlı görünüm odaklı, hyalüronik asit ve peptit içeren profesyonel bakım serumu.',
    features: ['Hyalüronik asit kompleksi', 'Peptit destekli formül', '5 × 5 ml flakon', 'Profesyonel seri'],
    sku: 'DOT-MSKIN-004',
  },
  {
    id: 'pdrn-repair',
    name: 'PDRN Repair Complex',
    shortName: 'PDRN REPAIR',
    brand: 'REGENLAB',
    category: 'Cilt Bakımı',
    price: 4250,
    compareAt: null,
    stock: 0,
    badge: 'Yakında',
    tone: 'rose',
    description: 'PDRN ve amino asit kompleksiyle cilt bakım protokolleri için geliştirilen yoğun profesyonel bakım ürünü.',
    features: ['PDRN kompleksi', 'Amino asit desteği', '5 × 3 ml flakon', 'Yoğun bakım serisi'],
    sku: 'DOT-PDRN-005',
  },
  {
    id: 'regen-collagen',
    name: 'Regen Collagen Activator',
    shortName: 'REGEN COLLAGEN',
    brand: 'REGENLAB',
    category: 'Bakım',
    price: 3490,
    compareAt: 3690,
    stock: 32,
    badge: 'Avantajlı',
    tone: 'sand',
    description: 'Profesyonel bakım rutinlerine eşlik eden peptit ve mineral destekli kolajen bakım kompleksi.',
    features: ['Peptit ve mineral kompleksi', '10 × 2 ml ampul', 'Protokol dostu kullanım', 'Profesyonel seri'],
    sku: 'DOT-RCOL-006',
  },
  {
    id: 'cannula-microtip-set',
    name: 'Blunt-Tip Mikro Kanül Seti',
    shortName: 'MİKRO KANÜL SETİ',
    brand: 'MEDISHARP',
    category: 'Kanül',
    price: 2890,
    compareAt: 2990,
    stock: 40,
    badge: 'Çok Satan',
    tone: 'pearl',
    description: 'Yüz bölgesi dolgu uygulamaları için künt uçlu, çok gauge’lu profesyonel kanül seti.',
    features: ['25G · 27G · 30G gauge seçenekleri', 'Künt uç (blunt-tip)', 'Kutu başına 10 adet, steril tekli paket', 'Tek kullanımlık'],
    sku: 'DOT-CNMT-007',
  },
  {
    id: 'cannula-fat-transfer',
    name: 'Yağ Transferi Kanül Seti',
    shortName: 'FAT TRANSFER KANÜLÜ',
    brand: 'MEDISHARP',
    category: 'Kanül',
    price: 2950,
    compareAt: null,
    stock: 22,
    badge: null,
    tone: 'sand',
    description: 'Büyük hacimli yağ enjeksiyonu ve volüm uygulamaları için geniş çaplı kanül seti.',
    features: ['18G · 21G gauge seçenekleri', 'Künt uç (blunt-tip)', 'Kutu başına 10 adet, steril', 'Tek kullanımlık'],
    sku: 'DOT-CNFT-008',
  },
  {
    id: 'topical-anesthetic-cream',
    name: 'Topikal Anestezik Krem',
    shortName: 'TOPİKAL ANESTEZİK KREM',
    brand: 'DERMANEST',
    category: 'Anestezik Krem',
    price: 2620,
    compareAt: 2690,
    stock: 35,
    badge: 'Çok Satan',
    tone: 'aqua',
    description: 'Enjeksiyon öncesi cilt yüzeyinde hızlı ve etkili anestezi sağlayan profesyonel krem.',
    features: ['Lidokain / Prilokain bazlı', 'Prosedür öncesi topikal uygulama', '30 g tüp', 'Kutu başına 12 adet'],
    sku: 'DOT-ANTC-009',
  },
  {
    id: 'rapid-anesthetic-gel',
    name: 'Hızlı Etkili Anestezik Jel',
    shortName: 'HIZLI ETKİLİ JEL',
    brand: 'DERMANEST',
    category: 'Anestezik Krem',
    price: 2540,
    compareAt: null,
    stock: 5,
    badge: 'Sınırlı Stok',
    tone: 'rose',
    description: 'Kısa bekleme süresiyle mukozal ve cilt uygulamalarında konforlu prosedür sağlar.',
    features: ['Lidokain bazlı jel formül', '~15 dakika bekleme süresi', '5 g tekli tüp', 'Kutu başına 20 adet'],
    sku: 'DOT-ANRG-010',
  },
  {
    id: 'sterile-injector-set',
    name: 'Steril Enjektör Seti',
    shortName: 'STERİL ENJEKTÖR SETİ',
    brand: 'MEDISHARP',
    category: 'Sarf Malzemesi',
    price: 2410,
    compareAt: null,
    stock: 60,
    badge: null,
    tone: 'navy',
    description: 'Dolgu ve mezoterapi uygulamaları için luer-lock uyumlu, tek kullanımlık steril enjektörler.',
    features: ['1 ml · 3 ml hacim seçenekleri', 'Luer-lock uç', 'Kutu başına 100 adet', 'Tek kullanımlık'],
    sku: 'DOT-SUIJ-011',
  },
  {
    id: 'mesotherapy-needles',
    name: 'Mezoterapi İğneleri',
    shortName: 'MEZOTERAPİ İĞNESİ',
    brand: 'MEDISHARP',
    category: 'Sarf Malzemesi',
    price: 2350,
    compareAt: 2390,
    stock: 45,
    badge: 'Avantajlı',
    tone: 'ivory',
    description: 'İnce ve hassas mezoterapi uygulamaları için düşük travmalı, keskin uçlu iğneler.',
    features: ['30G · 32G gauge seçenekleri', 'Keskin, düşük travma uç', 'Kutu başına 100 adet', 'Tek kullanımlık'],
    sku: 'DOT-MSND-012',
  },
  {
    id: 'procedure-kit',
    name: 'Prosedür Sarf Kiti',
    shortName: 'PROSEDÜR SARF KİTİ',
    brand: 'DOTGEN CARE',
    category: 'Sarf Malzemesi',
    price: 2480,
    compareAt: null,
    stock: 0,
    badge: 'Yakında',
    tone: 'sand',
    description: 'Steril eldiven, gazlı bez ve antiseptik pedleri içeren komple tek kullanımlık prosedür seti.',
    features: ['Steril eldiven', 'Gazlı bez', 'Antiseptik ped', 'Set başına 1 prosedürlük içerik'],
    sku: 'DOT-PROK-013',
  },
  {
    id: 'botox-100u',
    name: 'Botulinum Toksin A 100 Ünite',
    shortName: 'BOTOX 100Ü',
    brand: 'NEUROTOX',
    category: 'Botoks',
    price: 5200,
    compareAt: 5600,
    stock: 15,
    badge: 'Çok Satan',
    tone: 'navy',
    description: 'Mimik kırışıklıkları için klinik onaylı profesyonel botulinum toksin tip A enjeksiyonu.',
    features: ['100 Ünite / flakon', 'Liyofilize toz form', 'Soğuk zincir sevkiyat', 'Profesyonel uygulama için'],
    sku: 'DOT-BTX100-014',
  },
  {
    id: 'botox-50u',
    name: 'Botulinum Toksin A 50 Ünite',
    shortName: 'BOTOX 50Ü',
    brand: 'NEUROTOX',
    category: 'Botoks',
    price: 3850,
    compareAt: null,
    stock: 20,
    badge: null,
    tone: 'pearl',
    description: 'Küçük alan uygulamaları ve düşük doz protokolleri için 50 ünitelik profesyonel seri.',
    features: ['50 Ünite / flakon', 'Liyofilize toz form', 'Soğuk zincir sevkiyat', 'Profesyonel uygulama için'],
    sku: 'DOT-BTX50-015',
  },
  {
    id: 'diamond-lip',
    name: 'DIAMOND Lip Contour',
    shortName: 'DIAMOND LIP',
    brand: 'DIAMOND',
    category: 'Dolgu',
    price: 4750,
    compareAt: 4990,
    stock: 16,
    badge: 'Yeni',
    tone: 'rose',
    description: 'Dudak konturu ve hacimlendirme uygulamaları için yumuşak dokulu profesyonel DIAMOND serisi.',
    features: ['Dudak bölgesine özel formül', '1 × 1 ml kullanıma hazır enjektör', '2 adet uygulama ucu', 'İtalya üretimi'],
    sku: 'DOT-DLIP-016',
  },
  {
    id: 'prp-kit-10ml',
    name: 'PRP Hazırlık Kiti 10 ml',
    shortName: 'PRP KİTİ 10ML',
    brand: 'REGENLAB',
    category: 'PRP',
    price: 2890,
    compareAt: null,
    stock: 28,
    badge: null,
    tone: 'aqua',
    description: 'Trombositten zengin plazma hazırlığı için steril, tek kullanımlık santrifüj tüp seti.',
    features: ['10 ml separasyon jelli tüp', 'Tek kullanımlık, steril', 'Standart santrifüjlerle uyumlu', 'Kutu başına 10 adet'],
    sku: 'DOT-PRP10-017',
  },
  {
    id: 'prp-kit-20ml',
    name: 'PRP Hazırlık Kiti 20 ml',
    shortName: 'PRP KİTİ 20ML',
    brand: 'REGENLAB',
    category: 'PRP',
    price: 2990,
    compareAt: 3090,
    stock: 4,
    badge: 'Sınırlı Stok',
    tone: 'sand',
    description: 'Daha yüksek hacimli PRP protokolleri için çift tüplü hazırlık kiti.',
    features: ['2 × 10 ml separasyon jelli tüp', 'Tek kullanımlık, steril', 'Standart santrifüjlerle uyumlu', 'Kutu başına 10 adet'],
    sku: 'DOT-PRP20-018',
  },
  {
    id: 'mesotherapy-vitamin-cocktail',
    name: 'Mezoterapi Vitamin Kokteyli',
    shortName: 'MEZO VİTAMİN',
    brand: 'MESOFILL',
    category: 'Cilt Bakımı',
    price: 2720,
    compareAt: 2790,
    stock: 30,
    badge: 'Avantajlı',
    tone: 'ivory',
    description: 'Cilt canlandırma protokolleri için çoklu vitamin ve mineral içerikli mezoterapi solüsyonu.',
    features: ['Multi-vitamin kompleksi', '5 × 5 ml flakon', 'Mezoterapi ve mikroneedling uyumlu', 'Profesyonel seri'],
    sku: 'DOT-MVIT-019',
  },
  {
    id: 'mesotherapy-hair-serum',
    name: 'Saç Mezoterapisi Serumu',
    shortName: 'MEZO SAÇ SERUMU',
    brand: 'MESOFILL',
    category: 'Cilt Bakımı',
    price: 2850,
    compareAt: null,
    stock: 0,
    badge: 'Yakında',
    tone: 'navy',
    description: 'Saç köklerini destekleyen peptit ve biotin içerikli mezoterapi serumu.',
    features: ['Biotin ve peptit kompleksi', '5 × 5 ml flakon', 'Saç mezoterapisi protokolleri için', 'Profesyonel seri'],
    sku: 'DOT-MHAIR-020',
  },
];

const KEYS = {
  cart: 'drotgen_medical_cart_v1',
  favorites: 'drotgen_medical_favorites_v1',
  inventory: 'drotgen_medical_inventory_v1',
  notifications: 'drotgen_medical_notifications_v1',
  profile: 'drotgen_medical_profile_v1',
  orders: 'drotgen_medical_orders_v1',
  cookie: 'drotgen_medical_cookie_v1',
};

const FREE_SHIPPING_LIMIT = 5000;
const SHIPPING_FEE = 149;
const BRAND_LOGO_URL = new URL('./dr-otgen-clinic-logo.png', import.meta.url).href;

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The interface remains usable when storage is unavailable.
  }
}

function injectJsonLd(id, data) {
  let script = document.getElementById(id);
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

function productUrl(product) {
  return `${location.origin}/medical/product.html?id=${product.id}`;
}

function productOffer(product) {
  return {
    '@type': 'Offer',
    url: productUrl(product),
    priceCurrency: 'TRY',
    price: String(product.price),
    availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
  };
}

function buildProductJsonLd(product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sku,
    brand: { '@type': 'Brand', name: product.brand },
    category: product.category,
    image: BRAND_LOGO_URL,
    url: productUrl(product),
    offers: productOffer(product),
  };
}

function buildCatalogJsonLd(products) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: productUrl(product),
      item: {
        '@type': 'Product',
        name: product.name,
        sku: product.sku,
        brand: { '@type': 'Brand', name: product.brand },
        image: BRAND_LOGO_URL,
        offers: productOffer(product),
      },
    })),
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function money(value) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value);
}

function productReputation(product) {
  let hash = 0;
  for (let i = 0; i < product.id.length; i += 1) {
    hash = (hash * 31 + product.id.charCodeAt(i)) >>> 0;
  }
  const rating = (4.4 + ((hash % 7) / 10)).toFixed(1).replace('.', ',');
  const reviews = 12 + (((hash >>> 5) % 25) * 6);
  return { rating, reviews };
}

function getInventory() {
  return { ...Object.fromEntries(PRODUCTS.map((product) => [product.id, product.stock])), ...readStorage(KEYS.inventory, {}) };
}

function productWithStock(product) {
  return { ...product, stock: Number(getInventory()[product.id] ?? product.stock) };
}

function getProduct(id) {
  const product = PRODUCTS.find((item) => item.id === id);
  return product ? productWithStock(product) : null;
}

function getCart() {
  return readStorage(KEYS.cart, []).filter((item) => getProduct(item.id) && item.quantity > 0);
}

function saveCart(cart) {
  writeStorage(KEYS.cart, cart);
  updateCartCount();
  renderCartDrawer();
}

function cartDetails() {
  return getCart()
    .map((item) => ({ ...item, product: getProduct(item.id) }))
    .filter((item) => item.product);
}

function cartTotals() {
  const subtotal = cartDetails().reduce((total, item) => total + item.product.price * item.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_LIMIT ? 0 : SHIPPING_FEE;
  return { subtotal, shipping, total: subtotal + shipping };
}

function cartQuantity() {
  return getCart().reduce((total, item) => total + item.quantity, 0);
}

function addToCart(id, quantity = 1) {
  const product = getProduct(id);
  if (!product || product.stock < 1) return;
  const cart = getCart();
  const existing = cart.find((item) => item.id === id);
  const nextQuantity = Math.min(product.stock, (existing?.quantity || 0) + Number(quantity || 1));

  if (existing) existing.quantity = nextQuantity;
  else cart.push({ id, quantity: nextQuantity });

  saveCart(cart);
  showToast(`${product.shortName} sepete eklendi.`);
}

function updateCartItem(id, quantity) {
  const product = getProduct(id);
  if (!product) return;
  const cart = getCart();
  const item = cart.find((entry) => entry.id === id);
  if (!item) return;

  if (quantity <= 0) {
    saveCart(cart.filter((entry) => entry.id !== id));
  } else {
    item.quantity = Math.min(product.stock, Math.max(1, Number(quantity)));
    saveCart(cart);
  }

  if (document.body.dataset.page === 'cart') renderCartPage();
}

function renderHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  header.innerHTML = `
    <div class="top-strip">
      <div class="container">
        <span>5.000 TL üzeri ücretsiz kargo</span>
        <span>Hafta içi 09.00–18.00 destek</span>
      </div>
    </div>
    <header class="site-header">
      <div class="container header-main">
        <button class="icon-button menu-button" type="button" aria-label="Menüyü aç" aria-expanded="false">☰</button>
        <a class="wordmark" href="./" aria-label="DrOtgen Medical ana sayfa"><span>DrOtgen</span>Medical</a>
        <form class="header-search" data-store-search>
          <label class="sr-only" for="site-search">Ürün ara</label>
          <input id="site-search" name="q" type="search" placeholder="Ürün, marka veya kategori ara" autocomplete="off" />
          <button type="submit" aria-label="Ara">Ara</button>
        </form>
        <div class="header-actions">
          <a class="header-action" href="./account.html"><span aria-hidden="true">◎</span><b>Hesabım</b></a>
          <button class="header-action cart-trigger" type="button" aria-label="Sepeti aç">
            <span aria-hidden="true">▢</span><b>Sepet</b><em class="cart-count">0</em>
          </button>
        </div>
      </div>
      <nav class="main-nav" id="main-nav" aria-label="Ana menü">
        <div class="container">
          <form class="mobile-nav-search" data-store-search>
            <label class="sr-only" for="mobile-site-search">Ürün ara</label>
            <input id="mobile-site-search" name="q" type="search" placeholder="Ürün, marka veya kategori ara" autocomplete="off" />
            <button type="submit">Ara</button>
          </form>
          <a href="./#products">Tüm Ürünler</a>
          <a href="./#products" data-nav-category="Dolgu">Dolgu</a>
          <a href="./#products" data-nav-category="Cilt Bakımı">Cilt Bakımı</a>
          <a href="./#products" data-nav-category="Bakım">Bakım</a>
          <a href="./inventory.html">Stok Yönetimi</a>
          <a href="https://www.drotgenclinic.com/tr/" target="_blank" rel="noopener noreferrer">Dr. Otgen Clinic</a>
        </div>
      </nav>
    </header>
    <div class="drawer-backdrop" id="drawer-backdrop" hidden></div>
    <aside class="cart-drawer" id="cart-drawer" aria-labelledby="cart-drawer-title" aria-hidden="true">
      <div class="drawer-heading">
        <div><p class="eyebrow">ALIŞVERİŞ</p><h2 id="cart-drawer-title">Sepetim</h2></div>
        <button class="drawer-close" type="button" aria-label="Sepeti kapat">×</button>
      </div>
      <div id="cart-drawer-content"></div>
    </aside>
    <div class="notify-backdrop" id="notify-backdrop" hidden></div>
    <section class="notify-modal" id="notify-modal" role="dialog" aria-modal="true" aria-labelledby="notify-title" hidden>
      <button class="notify-close" type="button" aria-label="Stok bildirim penceresini kapat">×</button>
      <p class="eyebrow">STOK BİLDİRİMİ</p>
      <h2 id="notify-title">Ürün yeniden geldiğinde haber verelim.</h2>
      <p id="notify-product-name"></p>
      <form id="stock-notify-form">
        <input type="hidden" name="productId" />
        <label for="notify-email">E-posta adresiniz</label>
        <div>
          <input id="notify-email" name="email" type="email" autocomplete="email" placeholder="ornek@eposta.com" required />
          <button class="button button-primary" type="submit">Bildirim oluştur</button>
        </div>
      </form>
      <p class="notify-status" id="notify-status" role="status" aria-live="polite"></p>
    </section>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
  `;

  header.querySelector('.menu-button')?.addEventListener('click', (event) => {
    const open = header.querySelector('.main-nav')?.classList.toggle('is-open');
    event.currentTarget.setAttribute('aria-expanded', String(Boolean(open)));
    event.currentTarget.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
  });
  header.querySelector('.cart-trigger')?.addEventListener('click', openCartDrawer);
  header.querySelector('.drawer-close')?.addEventListener('click', closeCartDrawer);
  header.querySelector('#drawer-backdrop')?.addEventListener('click', closeCartDrawer);
  header.querySelectorAll('[data-store-search]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = new FormData(event.currentTarget).get('q')?.toString().trim();
      location.href = query ? `./?q=${encodeURIComponent(query)}#products` : './#products';
    });
  });
  header.querySelector('#notify-backdrop')?.addEventListener('click', closeStockNotification);
  header.querySelector('.notify-close')?.addEventListener('click', closeStockNotification);
  header.querySelector('#stock-notify-form')?.addEventListener('submit', saveStockNotification);
  header.querySelectorAll('[data-nav-category]').forEach((link) => {
    link.href = `./?category=${encodeURIComponent(link.dataset.navCategory)}#products`;
  });
  updateCartCount();
  renderCartDrawer();
}

function renderFooter() {
  const footer = document.getElementById('site-footer');
  if (!footer) return;
  footer.innerHTML = `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div class="footer-brand">
          <a class="wordmark footer-wordmark" href="./"><span>DrOtgen</span>Medical</a>
          <p>Medikal estetik ürünlerinde seçkin markalar, güvenli alışveriş ve hızlı teslimat.</p>
          <button class="cookie-settings-link" type="button">Çerez tercihleri</button>
        </div>
        <div><h2>Mağaza</h2><a href="./#products">Tüm ürünler</a><a href="./cart.html">Sepetim</a><a href="./account.html">Siparişlerim</a></div>
        <div><h2>Destek</h2><a href="./account.html">Hesabım</a><a href="./#newsletter-form">Stok bildirimleri</a><a href="./inventory.html">Stok yönetimi</a></div>
        <div><h2>Bilgilendirme</h2><a href="./privacy.html">Gizlilik politikası</a><a href="./privacy.html#cookies">Çerez politikası</a><a href="./privacy.html#contact">İletişim</a></div>
      </div>
      <div class="container footer-bottom"><span>© 2026 DrOtgen Medical</span><span>İstanbul · Türkiye</span></div>
    </footer>
  `;
  footer.querySelector('.cookie-settings-link')?.addEventListener('click', () => mountCookieBanner(true));
}

function productVisual(product, className = '') {
  return `
    <div class="product-visual tone-${product.tone} ${className}">
      <div class="visual-orbit" aria-hidden="true"></div>
      <div class="product-package">
        <img class="package-logo" src="${BRAND_LOGO_URL}" alt="" aria-hidden="true" />
        <small>PROFESSIONAL SERIES</small>
        <strong>${escapeHtml(product.brand)}</strong>
        <em>${escapeHtml(product.shortName.replace(product.brand, '').trim() || product.category)}</em>
      </div>
    </div>
  `;
}

function productCard(product) {
  const favorites = readStorage(KEYS.favorites, []);
  const saved = favorites.includes(product.id);
  const discount = product.compareAt ? Math.round((1 - product.price / product.compareAt) * 100) : 0;
  const reputation = productReputation(product);
  return `
    <article class="product-card" data-product-id="${product.id}">
      <div class="product-card-media">
        <a href="./product.html?id=${product.id}" aria-label="${escapeHtml(product.name)} ürününü incele">
          ${productVisual(product)}
        </a>
        ${product.badge ? `<span class="product-label">${escapeHtml(product.badge)}</span>` : ''}
        ${discount ? `<span class="discount-label">-%${discount}</span>` : ''}
        <button class="favorite-button ${saved ? 'is-saved' : ''}" type="button" data-favorite="${product.id}" aria-label="${saved ? 'Favorilerden çıkar' : 'Favorilere ekle'}">♡</button>
      </div>
      <div class="product-card-body">
        <p>${escapeHtml(product.brand)} · ${escapeHtml(product.category)}</p>
        <h3><a href="./product.html?id=${product.id}">${escapeHtml(product.name)}</a></h3>
        <div class="rating-row"><span>★★★★★</span><small>${reputation.rating} · ${reputation.reviews} değerlendirme</small></div>
        <div class="card-price-row">
          <div><strong>${money(product.price)}</strong>${product.compareAt ? `<del>${money(product.compareAt)}</del>` : ''}</div>
          <span class="stock-text ${product.stock < 1 ? 'out' : product.stock <= 8 ? 'low' : ''}">${product.stock < 1 ? 'Tükendi' : product.stock <= 8 ? `Son ${product.stock} ürün` : 'Stokta'}</span>
        </div>
        <button class="button add-cart-button" type="button" data-add-cart="${product.id}">
          ${product.stock < 1 ? 'Stok bildirimi oluştur' : 'Sepete ekle'}
        </button>
      </div>
    </article>
  `;
}

function updateCartCount() {
  document.querySelectorAll('.cart-count').forEach((element) => {
    element.textContent = String(cartQuantity());
  });
}

function renderCartDrawer() {
  const target = document.getElementById('cart-drawer-content');
  if (!target) return;
  const items = cartDetails();
  const totals = cartTotals();

  if (!items.length) {
    target.innerHTML = `
      <div class="drawer-empty">
        <span aria-hidden="true">◇</span>
        <h3>Sepetiniz henüz boş</h3>
        <p>Profesyonel seçkimizden ürünleri keşfedin.</p>
        <a class="button button-primary drawer-shop-link" href="./#products">Alışverişe başla</a>
      </div>
    `;
    target.querySelector('.drawer-shop-link')?.addEventListener('click', closeCartDrawer);
    return;
  }

  const remaining = Math.max(0, FREE_SHIPPING_LIMIT - totals.subtotal);
  target.innerHTML = `
    <div class="shipping-progress">
      <p>${remaining ? `Ücretsiz kargo için <strong>${money(remaining)}</strong> kaldı.` : '<strong>Ücretsiz kargo kazandınız.</strong>'}</p>
      <span><i style="width:${Math.min(100, (totals.subtotal / FREE_SHIPPING_LIMIT) * 100)}%"></i></span>
    </div>
    <div class="drawer-items">
      ${items.map(({ product, quantity }) => `
        <div class="mini-cart-item">
          ${productVisual(product, 'mini-visual')}
          <div><a href="./product.html?id=${product.id}">${escapeHtml(product.shortName)}</a><span>${quantity} × ${money(product.price)}</span><button type="button" data-remove-cart="${product.id}">Kaldır</button></div>
        </div>
      `).join('')}
    </div>
    <div class="drawer-total"><span>Ara toplam</span><strong>${money(totals.subtotal)}</strong></div>
    <a class="button button-primary drawer-checkout" href="./checkout.html">Ödemeye geç</a>
    <a class="drawer-cart-link" href="./cart.html">Sepeti görüntüle</a>
  `;
  target.querySelectorAll('[data-remove-cart]').forEach((button) => {
    button.addEventListener('click', () => updateCartItem(button.dataset.removeCart, 0));
  });
}

function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  if (!drawer || !backdrop) return;
  backdrop.hidden = false;
  requestAnimationFrame(() => {
    drawer.classList.add('is-open');
    backdrop.classList.add('is-open');
  });
  drawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('drawer-open');
  drawer.querySelector('.drawer-close')?.focus();
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  drawer?.classList.remove('is-open');
  backdrop?.classList.remove('is-open');
  drawer?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('drawer-open');
  window.setTimeout(() => {
    if (backdrop) backdrop.hidden = true;
  }, 220);
}

function openStockNotification(product) {
  const modal = document.getElementById('notify-modal');
  const backdrop = document.getElementById('notify-backdrop');
  const form = document.getElementById('stock-notify-form');
  if (!modal || !backdrop || !form) return;

  form.reset();
  form.elements.productId.value = product.id;
  document.getElementById('notify-product-name').textContent = product.name;
  document.getElementById('notify-status').textContent = '';
  modal.hidden = false;
  backdrop.hidden = false;
  document.body.classList.add('drawer-open');
  requestAnimationFrame(() => {
    modal.classList.add('is-open');
    backdrop.classList.add('is-open');
  });
  document.getElementById('notify-email')?.focus();
}

function closeStockNotification() {
  const modal = document.getElementById('notify-modal');
  const backdrop = document.getElementById('notify-backdrop');
  modal?.classList.remove('is-open');
  backdrop?.classList.remove('is-open');
  document.body.classList.remove('drawer-open');
  window.setTimeout(() => {
    if (modal) modal.hidden = true;
    if (backdrop) backdrop.hidden = true;
  }, 180);
}

function notifyNewOrder(order, delivery) {
  const itemsSummary = order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ');
  fetch('https://formsubmit.co/ajax/drotgenclinic@gmail.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      _subject: `DrOtgen Medical yeni sipariş: ${order.number}`,
      'Sipariş No': order.number,
      'Ad Soyad': order.customer.fullName,
      'E-posta': order.customer.email,
      Telefon: delivery.phone,
      Adres: delivery.address,
      İl: delivery.city,
      'Posta Kodu': delivery.postalCode,
      'Ödeme Yöntemi': delivery.paymentType,
      Ürünler: itemsSummary,
      Toplam: money(order.total),
    }),
  }).catch(() => {
    // The order is already saved locally; a failed notification shouldn't block checkout.
  });
}

function saveStockNotification(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const notifications = readStorage(KEYS.notifications, []);
  const record = {
    productId: data.get('productId'),
    email: data.get('email'),
    createdAt: new Date().toISOString(),
  };
  const next = notifications.filter((item) => !(item.productId === record.productId && item.email === record.email));
  writeStorage(KEYS.notifications, [record, ...next]);
  document.getElementById('notify-status').textContent = 'Stok bildiriminiz oluşturuldu.';
  window.setTimeout(() => {
    closeStockNotification();
    showToast('Stok bildiriminiz oluşturuldu.');
  }, 700);
}

let toastTimer;
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2400);
}

function bindProductActions(root = document) {
  root.querySelectorAll('[data-add-cart]').forEach((button) => {
    button.addEventListener('click', () => {
      const product = getProduct(button.dataset.addCart);
      if (!product?.stock) {
        openStockNotification(product);
        return;
      }
      const quantity = document.getElementById('product-quantity')?.value || 1;
      addToCart(product.id, quantity);
      button.textContent = 'Sepete eklendi ✓';
      window.setTimeout(() => {
        if (button.isConnected) button.textContent = 'Sepete ekle';
      }, 1500);
    });
  });

  root.querySelectorAll('[data-favorite]').forEach((button) => {
    button.addEventListener('click', () => {
      const favorites = readStorage(KEYS.favorites, []);
      const id = button.dataset.favorite;
      const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id];
      writeStorage(KEYS.favorites, next);
      button.classList.toggle('is-saved', next.includes(id));
      button.setAttribute('aria-label', next.includes(id) ? 'Favorilerden çıkar' : 'Favorilere ekle');
      showToast(next.includes(id) ? 'Favorilere eklendi.' : 'Favorilerden çıkarıldı.');
    });
  });
}

function initHome() {
  const grid = document.getElementById('product-grid');
  const tabs = document.getElementById('category-tabs');
  const sort = document.getElementById('product-sort');
  if (!grid || !tabs || !sort) return;

  const params = new URLSearchParams(location.search);
  let category = params.get('category') || 'Tümü';
  const query = (params.get('q') || '').toLocaleLowerCase('tr-TR');
  const categories = ['Tümü', ...new Set(PRODUCTS.map((product) => product.category))];
  if (!categories.includes(category)) category = 'Tümü';

  tabs.innerHTML = categories.map((item) => `<button type="button" data-category="${escapeHtml(item)}" class="${item === category ? 'is-active' : ''}">${escapeHtml(item)}</button>`).join('');

  function renderProducts() {
    let products = PRODUCTS.map(productWithStock).filter((product) => {
      const matchesCategory = category === 'Tümü' || product.category === category;
      const haystack = `${product.name} ${product.brand} ${product.category}`.toLocaleLowerCase('tr-TR');
      return matchesCategory && (!query || haystack.includes(query));
    });

    if (sort.value === 'price-asc') products.sort((a, b) => a.price - b.price);
    if (sort.value === 'price-desc') products.sort((a, b) => b.price - a.price);
    if (sort.value === 'stock') products.sort((a, b) => b.stock - a.stock);

    grid.innerHTML = products.map(productCard).join('');
    document.getElementById('product-empty').hidden = products.length > 0;
    bindProductActions(grid);
  }

  tabs.addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    category = button.dataset.category;
    tabs.querySelectorAll('button').forEach((item) => item.classList.toggle('is-active', item === button));
    renderProducts();
  });
  sort.addEventListener('change', renderProducts);
  document.querySelector('[data-category-link]')?.addEventListener('click', (event) => {
    category = event.currentTarget.dataset.categoryLink;
    tabs.querySelectorAll('button').forEach((button) => button.classList.toggle('is-active', button.dataset.category === category));
    renderProducts();
  });
  document.getElementById('newsletter-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    event.currentTarget.reset();
    document.getElementById('newsletter-status').textContent = 'Kaydınız alındı. Teşekkür ederiz.';
  });
  renderProducts();
  injectJsonLd('catalog-schema', buildCatalogJsonLd(PRODUCTS.map(productWithStock)));
}

function initProduct() {
  const target = document.getElementById('product-detail');
  if (!target) return;
  const product = getProduct(new URLSearchParams(location.search).get('id')) || getProduct(PRODUCTS[0].id);
  const related = PRODUCTS.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 3).map(productWithStock);
  const reputation = productReputation(product);
  document.title = `${product.name} | DrOtgen Medical`;
  const metaDescription = `${product.name} — ${product.description}`.slice(0, 160);
  document.querySelector('meta[name="description"]')?.setAttribute('content', metaDescription);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${product.name} | DrOtgen Medical`);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', metaDescription);
  injectJsonLd('product-schema', buildProductJsonLd(product));
  target.innerHTML = `
    <nav class="breadcrumbs" aria-label="Sayfa yolu"><a href="./">Ana sayfa</a><span>/</span><a href="./#products">${escapeHtml(product.category)}</a><span>/</span><b>${escapeHtml(product.shortName)}</b></nav>
    <section class="product-detail-grid">
      <div class="product-gallery">
        ${productVisual(product, 'detail-visual')}
        <div class="gallery-thumbs"><button class="is-active" type="button">Ön görünüm</button><button type="button">Kutu içeriği</button><button type="button">Detay</button></div>
      </div>
      <div class="product-info">
        <p class="eyebrow">${escapeHtml(product.brand)} · ${escapeHtml(product.category)}</p>
        <h1>${escapeHtml(product.name)}</h1>
        <div class="product-rating"><span>★★★★★</span><a href="#details">${reputation.rating} · ${reputation.reviews} değerlendirme</a><b>SKU: ${escapeHtml(product.sku)}</b></div>
        <p class="product-description">${escapeHtml(product.description)}</p>
        <div class="product-price"><strong>${money(product.price)}</strong>${product.compareAt ? `<del>${money(product.compareAt)}</del>` : ''}<small>KDV dahil</small></div>
        <div class="product-stock ${product.stock < 1 ? 'out' : ''}"><i></i>${product.stock < 1 ? 'Stokta yok' : `${product.stock} adet stokta · Bugün kargoda`}</div>
        <div class="purchase-row">
          <label>Adet <span class="quantity-control"><button type="button" data-quantity-step="-1">−</button><input id="product-quantity" type="number" min="1" max="${Math.max(product.stock, 1)}" value="1" /><button type="button" data-quantity-step="1">+</button></span></label>
          <button class="button button-primary product-add-button" type="button" data-add-cart="${product.id}">${product.stock < 1 ? 'Stok bildirimi oluştur' : 'Sepete ekle'}</button>
          <button class="favorite-wide" type="button" data-favorite="${product.id}">♡ Favoriye ekle</button>
        </div>
        <div class="delivery-box"><div><b>Hızlı teslimat</b><span>15.00’e kadar verilen siparişler aynı gün kargoda.</span></div><div><b>Güvenli ödeme</b><span>Kart bilgileriniz şifreli ödeme akışında işlenir.</span></div></div>
      </div>
    </section>
    <section class="product-tabs" id="details">
      <div class="tab-heading"><button class="is-active" type="button">Ürün bilgisi</button><button type="button">Kutu içeriği</button><button type="button">Teslimat</button></div>
      <div class="tab-content">
        <div><p class="eyebrow">ÜRÜN DETAYI</p><h2>${escapeHtml(product.shortName)}</h2><p>${escapeHtml(product.description)}</p></div>
        <ul>${product.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join('')}</ul>
      </div>
    </section>
    ${related.length ? `<section class="related-products"><div class="section-heading"><p class="eyebrow">BİRLİKTE İNCELEYİN</p><h2>Benzer ürünler</h2></div><div class="product-grid">${related.map(productCard).join('')}</div></section>` : ''}
  `;
  target.querySelectorAll('[data-quantity-step]').forEach((button) => {
    button.addEventListener('click', () => {
      const input = document.getElementById('product-quantity');
      input.value = String(Math.min(Number(input.max), Math.max(1, Number(input.value) + Number(button.dataset.quantityStep))));
    });
  });
  bindProductActions(target);
}

function renderCartPage() {
  const target = document.getElementById('cart-page');
  if (!target) return;
  const items = cartDetails();
  const totals = cartTotals();

  if (!items.length) {
    target.innerHTML = `
      <div class="empty-page">
        <span>◇</span><p class="eyebrow">SEPETİM</p><h1>Sepetiniz alışverişe hazır.</h1>
        <p>Seçkin medikal estetik ürünlerini keşfederek siparişinizi oluşturun.</p>
        <a class="button button-primary" href="./#products">Ürünleri keşfet</a>
      </div>
    `;
    return;
  }

  const remaining = Math.max(0, FREE_SHIPPING_LIMIT - totals.subtotal);
  target.innerHTML = `
    <div class="page-heading"><p class="eyebrow">ALIŞVERİŞ</p><h1>Sepetim <span>${cartQuantity()} ürün</span></h1></div>
    <div class="cart-layout">
      <section class="cart-list" aria-label="Sepetteki ürünler">
        <div class="shipping-progress wide"><p>${remaining ? `Ücretsiz kargo için <strong>${money(remaining)}</strong> daha ekleyin.` : '<strong>Ücretsiz kargo kazandınız.</strong>'}</p><span><i style="width:${Math.min(100, (totals.subtotal / FREE_SHIPPING_LIMIT) * 100)}%"></i></span></div>
        ${items.map(({ product, quantity }) => `
          <article class="cart-item">
            ${productVisual(product, 'cart-visual')}
            <div class="cart-item-info"><p>${escapeHtml(product.brand)} · ${escapeHtml(product.category)}</p><h2><a href="./product.html?id=${product.id}">${escapeHtml(product.name)}</a></h2><span class="stock-text">Stokta</span><button type="button" data-remove="${product.id}">Kaldır</button></div>
            <label class="cart-quantity">Adet<select data-cart-quantity="${product.id}">${Array.from({ length: Math.min(product.stock, 10) }, (_, index) => `<option value="${index + 1}" ${quantity === index + 1 ? 'selected' : ''}>${index + 1}</option>`).join('')}</select></label>
            <strong class="cart-line-price">${money(product.price * quantity)}</strong>
          </article>
        `).join('')}
      </section>
      <aside class="order-card">
        <h2>Sipariş özeti</h2>
        <dl><div><dt>Ara toplam</dt><dd>${money(totals.subtotal)}</dd></div><div><dt>Kargo</dt><dd>${totals.shipping ? money(totals.shipping) : 'Ücretsiz'}</dd></div><div class="order-total"><dt>Toplam</dt><dd>${money(totals.total)}</dd></div></dl>
        <p>KDV dahildir.</p>
        <a class="button button-primary" href="./checkout.html">Güvenli ödemeye geç</a>
        <a class="continue-link" href="./#products">← Alışverişe devam et</a>
      </aside>
    </div>
  `;
  target.querySelectorAll('[data-cart-quantity]').forEach((select) => {
    select.addEventListener('change', () => updateCartItem(select.dataset.cartQuantity, Number(select.value)));
  });
  target.querySelectorAll('[data-remove]').forEach((button) => {
    button.addEventListener('click', () => updateCartItem(button.dataset.remove, 0));
  });
}

function initCheckout() {
  const target = document.getElementById('checkout-page');
  if (!target) return;
  const items = cartDetails();
  const totals = cartTotals();

  if (!items.length) {
    target.innerHTML = `<div class="empty-page"><span>◇</span><p class="eyebrow">ÖDEME</p><h1>Ödeme için sepetinize ürün ekleyin.</h1><a class="button button-primary" href="./#products">Ürünleri keşfet</a></div>`;
    return;
  }

  target.innerHTML = `
    <div class="checkout-heading"><a href="./cart.html">← Sepete dön</a><div><p class="eyebrow">GÜVENLİ ÖDEME</p><h1>Siparişinizi tamamlayın</h1></div><span>Şifreli bağlantı</span></div>
    <form class="checkout-layout" id="checkout-form">
      <div class="checkout-sections">
        <fieldset><legend><span>1</span>Teslimat bilgileri</legend><div class="form-grid">
          <label>Ad soyad<input name="fullName" autocomplete="name" required /></label>
          <label>Telefon<input name="phone" type="tel" autocomplete="tel" required /></label>
          <label class="full-field">E-posta<input name="email" type="email" autocomplete="email" required /></label>
          <label class="full-field">Adres<textarea name="address" autocomplete="street-address" required></textarea></label>
          <label>İl<input name="city" autocomplete="address-level1" required /></label>
          <label>Posta kodu<input name="postalCode" inputmode="numeric" autocomplete="postal-code" required /></label>
        </div></fieldset>
        <fieldset><legend><span>2</span>Ödeme yöntemi</legend>
          <div class="payment-tabs"><label><input type="radio" name="paymentType" value="card" checked />Kredi / banka kartı</label><label><input type="radio" name="paymentType" value="transfer" />Banka havalesi</label></div>
          <div class="card-panel" id="card-panel">
            <label class="full-field">Kart üzerindeki ad<input name="cardName" autocomplete="cc-name" required /></label>
            <label class="full-field">Kart numarası<input name="cardNumber" id="card-number" inputmode="numeric" autocomplete="cc-number" maxlength="19" placeholder="0000 0000 0000 0000" required /></label>
            <div class="form-grid"><label>Son kullanma<input name="expiry" id="card-expiry" inputmode="numeric" autocomplete="cc-exp" maxlength="5" placeholder="AA/YY" required /></label><label>CVV<input name="cvv" inputmode="numeric" autocomplete="cc-csc" maxlength="4" required /></label></div>
          </div>
          <div class="transfer-panel" id="transfer-panel" hidden><b>DrOtgen Medical</b><span>TR00 0000 0000 0000 0000 0000 00</span><p>Sipariş numaranızı açıklama alanına yazabilirsiniz.</p></div>
        </fieldset>
        <fieldset><legend><span>3</span>Onay</legend><label class="check-row"><input type="checkbox" required /><span>Mesafeli satış sözleşmesini ve ön bilgilendirme formunu okudum, kabul ediyorum.</span></label></fieldset>
      </div>
      <aside class="order-card checkout-summary">
        <h2>Sipariş özeti</h2>
        <div class="checkout-products">${items.map(({ product, quantity }) => `<div>${productVisual(product, 'checkout-visual')}<span><b>${escapeHtml(product.shortName)}</b><small>${quantity} adet</small></span><strong>${money(product.price * quantity)}</strong></div>`).join('')}</div>
        <dl><div><dt>Ara toplam</dt><dd>${money(totals.subtotal)}</dd></div><div><dt>Kargo</dt><dd>${totals.shipping ? money(totals.shipping) : 'Ücretsiz'}</dd></div><div class="order-total"><dt>Toplam</dt><dd>${money(totals.total)}</dd></div></dl>
        <button class="button button-primary" type="submit">Siparişi tamamla</button>
        <p class="checkout-secure">Ödeme bilgileriniz güvenli bağlantı üzerinden işlenir.</p>
      </aside>
    </form>
  `;

  const form = document.getElementById('checkout-form');
  const cardPanel = document.getElementById('card-panel');
  const transferPanel = document.getElementById('transfer-panel');
  form.querySelectorAll('[name="paymentType"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const cardActive = radio.value === 'card' && radio.checked;
      if (!radio.checked) return;
      cardPanel.hidden = !cardActive;
      transferPanel.hidden = cardActive;
      cardPanel.querySelectorAll('input').forEach((input) => { input.required = cardActive; });
    });
  });
  document.getElementById('card-number')?.addEventListener('input', (event) => {
    event.target.value = event.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  });
  document.getElementById('card-expiry')?.addEventListener('input', (event) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 4);
    event.target.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const orderNumber = `DM-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const order = {
      number: orderNumber,
      date: new Date().toISOString(),
      status: data.get('paymentType') === 'card' ? 'Hazırlanıyor' : 'Ödeme bekleniyor',
      total: totals.total,
      items: items.map(({ product, quantity }) => ({ id: product.id, name: product.shortName, quantity })),
      customer: { fullName: data.get('fullName'), email: data.get('email') },
    };
    writeStorage(KEYS.orders, [order, ...readStorage(KEYS.orders, [])]);
    writeStorage(KEYS.profile, { fullName: data.get('fullName'), email: data.get('email') });
    const inventory = getInventory();
    items.forEach(({ product, quantity }) => { inventory[product.id] = Math.max(0, product.stock - quantity); });
    writeStorage(KEYS.inventory, inventory);
    saveCart([]);
    notifyNewOrder(order, {
      phone: data.get('phone'),
      address: data.get('address'),
      city: data.get('city'),
      postalCode: data.get('postalCode'),
      paymentType: data.get('paymentType') === 'card' ? 'Kredi/banka kartı' : 'Banka havalesi',
    });
    target.innerHTML = `
      <div class="order-success">
        <span>✓</span><p class="eyebrow">SİPARİŞİNİZ ALINDI</p><h1>Teşekkürler, ${escapeHtml(String(data.get('fullName')).split(' ')[0])}.</h1>
        <p>Siparişiniz başarıyla oluşturuldu. Güncel durumunu hesabınızdan takip edebilirsiniz.</p>
        <div><small>Sipariş numarası</small><strong>${orderNumber}</strong></div>
        <a class="button button-primary" href="./account.html">Siparişimi görüntüle</a><a class="continue-link" href="./">Mağazaya dön</a>
      </div>
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initAccount() {
  const target = document.getElementById('account-page');
  if (!target) return;
  const profile = readStorage(KEYS.profile, null);

  if (!profile) {
    target.innerHTML = `
      <div class="account-auth">
        <div class="auth-copy"><p class="eyebrow">DR OTGEN MEDICAL</p><h1>Siparişleriniz tek ekranda.</h1><p>Sipariş durumunu takip edin, favorilerinizi görüntüleyin ve teslimat bilgilerinizi yönetin.</p><ul><li>Kolay sipariş takibi</li><li>Favori ürün listesi</li><li>Hızlı yeniden sipariş</li></ul></div>
        <form id="login-form" class="auth-card"><h2>Hesabınıza giriş yapın</h2><p>Mağaza hesabınızı e-posta adresinizle açabilirsiniz.</p><label>E-posta<input name="email" type="email" autocomplete="email" required /></label><label>Ad soyad<input name="fullName" autocomplete="name" required /></label><button class="button button-primary" type="submit">Devam et</button></form>
      </div>
    `;
    target.querySelector('#login-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      writeStorage(KEYS.profile, { email: data.get('email'), fullName: data.get('fullName') });
      initAccount();
    });
    return;
  }

  const orders = readStorage(KEYS.orders, []);
  const favorites = readStorage(KEYS.favorites, []).map(getProduct).filter(Boolean);
  const firstName = escapeHtml(String(profile.fullName || 'Kullanıcı').split(' ')[0]);
  target.innerHTML = `
    <div class="dashboard-heading"><div><p class="eyebrow">HESABIM</p><h1>Merhaba, ${firstName}</h1><p>${escapeHtml(profile.email || '')}</p></div><button class="logout-button" id="logout-button" type="button">Çıkış yap</button></div>
    <div class="dashboard-stats"><div><span>${orders.length}</span><p>Toplam sipariş</p></div><div><span>${orders.filter((order) => order.status === 'Hazırlanıyor').length}</span><p>Aktif sipariş</p></div><div><span>${favorites.length}</span><p>Favori ürün</p></div></div>
    <div class="dashboard-grid">
      <section class="dashboard-card orders-card"><div class="dashboard-card-heading"><h2>Siparişlerim</h2><a href="./#products">Yeni sipariş</a></div>
        ${orders.length ? `<div class="orders-table">${orders.map((order) => `
          <article><div><small>Sipariş</small><strong>${escapeHtml(order.number)}</strong></div><div><small>Tarih</small><span>${new Intl.DateTimeFormat('tr-TR').format(new Date(order.date))}</span></div><div><small>Toplam</small><span>${money(order.total)}</span></div><div><small>Durum</small><b class="order-status">${escapeHtml(order.status)}</b></div></article>
        `).join('')}</div>` : '<div class="dashboard-empty"><p>Henüz siparişiniz yok.</p><a href="./#products">Ürünleri keşfedin →</a></div>'}
      </section>
      <aside class="dashboard-card profile-card"><h2>Hesap bilgileri</h2><dl><div><dt>Ad soyad</dt><dd>${escapeHtml(profile.fullName || '')}</dd></div><div><dt>E-posta</dt><dd>${escapeHtml(profile.email || '')}</dd></div></dl><button id="profile-edit" type="button">Bilgileri düzenle</button></aside>
    </div>
    <section class="favorites-section"><div class="section-heading"><p class="eyebrow">KAYDETTİKLERİNİZ</p><h2>Favori ürünler</h2></div>${favorites.length ? `<div class="product-grid">${favorites.map(productCard).join('')}</div>` : '<p class="dashboard-empty">Favori listeniz henüz boş.</p>'}</section>
  `;
  target.querySelector('#logout-button').addEventListener('click', () => {
    localStorage.removeItem(KEYS.profile);
    initAccount();
  });
  target.querySelector('#profile-edit').addEventListener('click', () => showToast('Hesap bilgileri düzenleme ekranı açıldı.'));
  bindProductActions(target);
}

function initInventory() {
  const target = document.getElementById('inventory-page');
  if (!target) return;

  function render() {
    const products = PRODUCTS.map(productWithStock);
    const total = products.reduce((sum, product) => sum + product.stock, 0);
    const low = products.filter((product) => product.stock > 0 && product.stock <= 8).length;
    const out = products.filter((product) => product.stock === 0).length;
    target.innerHTML = `
      <div class="admin-heading"><div><p class="eyebrow">MAĞAZA YÖNETİMİ</p><h1>Stok yönetimi</h1><p>Ürün stoklarını izleyin ve satışa açık adetleri güncelleyin.</p></div><button class="button button-primary" id="save-inventory" type="button">Değişiklikleri kaydet</button></div>
      <div class="inventory-stats"><div><small>Toplam stok</small><strong>${total}</strong><span>adet ürün</span></div><div><small>Düşük stok</small><strong>${low}</strong><span>ürün</span></div><div><small>Tükenen</small><strong>${out}</strong><span>ürün</span></div><div><small>Aktif SKU</small><strong>${products.length}</strong><span>ürün kartı</span></div></div>
      <section class="inventory-card">
        <div class="inventory-toolbar"><h2>Ürünler</h2><label><span class="sr-only">Stokta ürün ara</span><input id="inventory-search" type="search" placeholder="Ürün veya SKU ara" /></label></div>
        <div class="inventory-table">
          <div class="inventory-row inventory-head"><span>Ürün</span><span>SKU</span><span>Fiyat</span><span>Durum</span><span>Stok</span></div>
          <div id="inventory-rows">${products.map((product) => inventoryRow(product)).join('')}</div>
        </div>
      </section>
    `;
    target.querySelector('#inventory-search').addEventListener('input', (event) => {
      const query = event.target.value.toLocaleLowerCase('tr-TR');
      target.querySelectorAll('.inventory-row[data-search]').forEach((row) => {
        row.hidden = !row.dataset.search.includes(query);
      });
    });
    target.querySelector('#save-inventory').addEventListener('click', () => {
      const inventory = getInventory();
      target.querySelectorAll('[data-stock-input]').forEach((input) => {
        inventory[input.dataset.stockInput] = Math.max(0, Math.min(999, Number(input.value) || 0));
      });
      writeStorage(KEYS.inventory, inventory);
      showToast('Stok değişiklikleri kaydedildi.');
      render();
      updateCartCount();
    });
  }
  render();
}

function inventoryRow(product) {
  const status = product.stock === 0 ? 'Tükendi' : product.stock <= 8 ? 'Düşük stok' : 'Stokta';
  return `
    <div class="inventory-row" data-search="${escapeHtml(`${product.name} ${product.sku}`.toLocaleLowerCase('tr-TR'))}">
      <span class="inventory-product">${productVisual(product, 'inventory-visual')}<b>${escapeHtml(product.name)}<small>${escapeHtml(product.category)}</small></b></span>
      <span>${escapeHtml(product.sku)}</span><span>${money(product.price)}</span>
      <span><i class="inventory-status status-${product.stock === 0 ? 'out' : product.stock <= 8 ? 'low' : 'in'}">${status}</i></span>
      <span><input type="number" min="0" max="999" value="${product.stock}" data-stock-input="${product.id}" aria-label="${escapeHtml(product.name)} stok adedi" /></span>
    </div>
  `;
}

function initPrivacy() {
  const target = document.getElementById('privacy-page');
  if (!target) return;
  target.innerHTML = `
    <header class="privacy-heading"><p class="eyebrow">BİLGİLENDİRME</p><h1>Gizlilik politikası</h1><p>Son güncelleme: 28 Temmuz 2026</p></header>
    <div class="privacy-layout">
      <nav aria-label="Gizlilik politikası bölümleri"><a href="#scope">Kapsam</a><a href="#data">Toplanan bilgiler</a><a href="#cookies">Çerez tercihleri</a><a href="#security">Veri güvenliği</a><a href="#contact">İletişim</a></nav>
      <div class="privacy-content">
        <section id="scope"><h2>1. Kapsam</h2><p>Bu politika, DrOtgen Medical mağazasını ziyaret ettiğinizde ve alışveriş yaptığınızda kullanılan bilgilerin nasıl işlendiğini açıklar.</p></section>
        <section id="data"><h2>2. Toplanan bilgiler</h2><p>Siparişlerin hazırlanması, teslimatın gerçekleştirilmesi ve kullanıcı hesabınızın yönetilmesi için ad, iletişim, adres, sipariş ve ödeme işlem bilgileri kullanılabilir.</p><p>Ödeme kartı bilgileri mağaza hesabında saklanmaz; ödeme akışında ilgili ödeme hizmeti üzerinden işlenir.</p></section>
        <section id="cookies"><h2>3. Çerez tercihleri</h2><p>Zorunlu çerezler sepet, hesap ve güvenlik işlevlerinin çalışmasını sağlar. Analiz çerezleri yalnızca tercih verdiğinizde mağaza deneyimini geliştirmek amacıyla kullanılır.</p><button class="button button-primary privacy-cookie-button" type="button">Çerez tercihlerimi düzenle</button></section>
        <section id="security"><h2>4. Veri güvenliği</h2><p>Mağaza deneyiminde aktarılan bilgilerin bütünlüğünü korumak için erişim kontrolü, güvenli bağlantı ve sınırlı saklama ilkeleri uygulanır.</p></section>
        <section id="contact"><h2>5. İletişim</h2><p>Gizlilik tercihleri ve hesap bilgileriyle ilgili taleplerinizi mağaza destek kanalı üzerinden iletebilirsiniz.</p><a href="mailto:info@drotgenclinic.com">info@drotgenclinic.com</a></section>
      </div>
    </div>
  `;
  target.querySelector('.privacy-cookie-button')?.addEventListener('click', () => mountCookieBanner(true));
}

function mountCookieBanner(force = false) {
  const existing = document.getElementById('cookie-banner');
  if (existing) existing.remove();
  if (!force && readStorage(KEYS.cookie, null)) return;

  const banner = document.createElement('section');
  banner.className = 'cookie-banner';
  banner.id = 'cookie-banner';
  banner.setAttribute('aria-labelledby', 'cookie-title');
  banner.innerHTML = `
    <div><span class="cookie-symbol" aria-hidden="true">◔</span><div><h2 id="cookie-title">Çerez tercihleri</h2><p>Mağazanın temel işlevleri için zorunlu çerezleri, deneyimi iyileştirmek için tercih ettiğiniz analiz çerezlerini kullanıyoruz. <a href="./privacy.html#cookies">Ayrıntıları inceleyin.</a></p></div></div>
    <div class="cookie-actions"><button class="button cookie-essential" type="button">Yalnızca zorunlu</button><button class="button button-primary cookie-accept" type="button">Tümünü kabul et</button></div>
  `;
  document.body.appendChild(banner);
  requestAnimationFrame(() => banner.classList.add('is-visible'));
  banner.querySelector('.cookie-essential').addEventListener('click', () => saveCookieChoice('essential'));
  banner.querySelector('.cookie-accept').addEventListener('click', () => saveCookieChoice('all'));
}

function saveCookieChoice(choice) {
  writeStorage(KEYS.cookie, { choice, updatedAt: new Date().toISOString() });
  const banner = document.getElementById('cookie-banner');
  banner?.classList.remove('is-visible');
  window.setTimeout(() => banner?.remove(), 220);
}

function initialize() {
  renderHeader();
  renderFooter();

  const page = document.body.dataset.page;
  if (page === 'home') initHome();
  if (page === 'product') initProduct();
  if (page === 'cart') renderCartPage();
  if (page === 'checkout') initCheckout();
  if (page === 'account') initAccount();
  if (page === 'inventory') initInventory();
  if (page === 'privacy') initPrivacy();

  mountCookieBanner();
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeCartDrawer();
      closeStockNotification();
    }
  });
}

initialize();
