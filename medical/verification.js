const form = document.getElementById('verification-form');
const formSection = document.querySelector('.form-section');
const successSection = document.getElementById('success-section');
const quantityInput = document.getElementById('quantity');
const summaryQuantity = document.getElementById('summary-quantity');
const summaryTotal = document.getElementById('summary-total');
const documentInput = document.getElementById('document');
const fileLabel = document.getElementById('file-label');
const fileError = document.getElementById('file-error');
const returnButton = document.getElementById('return-to-form');
const submitButton = form.querySelector('button[type="submit"]');
const formStatus = document.getElementById('form-status');
const productSelect = document.getElementById('product-select');
const summaryProductTitle = document.getElementById('summary-product-title');
const summaryProductLabel = document.getElementById('summary-product-label');
const summaryProductName = document.getElementById('summary-product-name');

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const ACCEPTED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png']);
const successHeading = document.getElementById('success-title');

const PRODUCTS = {
  'diamond-ha-20': { title: 'DIAMOND Crosslinked HA 20', label: 'ITALY', name: 'DIAMOND' },
  'cannula-microtip-set': {
    title: 'Blunt-Tip Mikro Kanül Seti',
    label: 'KANÜL SETİ',
    name: 'MICRO-TIP',
  },
  'cannula-fat-transfer': {
    title: 'Yağ Transferi Kanül Seti',
    label: 'KANÜL SETİ',
    name: 'FAT TRANSFER',
  },
  'topical-anesthetic-cream': {
    title: 'Topikal Anestezik Krem',
    label: 'ANESTEZİK',
    name: 'TOPİKAL KREM',
  },
  'rapid-anesthetic-gel': {
    title: 'Hızlı Etkili Anestezik Jel',
    label: 'ANESTEZİK',
    name: 'HIZLI JEL',
  },
  'sterile-injector-set': {
    title: 'Steril Enjektör Seti',
    label: 'SARF MALZEMESİ',
    name: 'ENJEKTÖR SETİ',
  },
  'mesotherapy-needles': {
    title: 'Mezoterapi İğneleri',
    label: 'SARF MALZEMESİ',
    name: 'MEZO İĞNE',
  },
  'procedure-kit': {
    title: 'Prosedür Sarf Kiti',
    label: 'SARF MALZEMESİ',
    name: 'PROSEDÜR KİTİ',
  },
};

function normalizedQuantity() {
  const value = Number(quantityInput.value) || 1;
  return Math.max(1, Math.min(20, value));
}

function updateSummary() {
  const quantity = normalizedQuantity();
  quantityInput.value = String(quantity);
  summaryQuantity.textContent = String(quantity);
  summaryTotal.textContent = 'Doğrulama sonrası';
}

function updateProductSummary() {
  const product = PRODUCTS[productSelect.value] ?? PRODUCTS['diamond-ha-20'];
  summaryProductTitle.textContent = product.title;
  summaryProductLabel.textContent = product.label;
  summaryProductName.textContent = product.name;
}

function applyRequestedProduct() {
  const requestedProduct = new URLSearchParams(window.location.search).get('product');
  if (requestedProduct && PRODUCTS[requestedProduct]) {
    productSelect.value = requestedProduct;
  }
}

function validateSelectedFile() {
  const file = documentInput.files?.[0];
  fileError.textContent = '';
  fileLabel.textContent = 'Diploma veya mesleki belgenizi seçin';

  if (!file) {
    fileError.textContent = 'Devam etmek için bir mesleki belge seçin.';
    fileError.focus({ preventScroll: true });
    return false;
  }

  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!ACCEPTED_TYPES.has(file.type) && !ACCEPTED_EXTENSIONS.has(extension)) {
    fileError.textContent = 'Yalnızca PDF, JPG, JPEG veya PNG dosyası seçebilirsiniz.';
    documentInput.value = '';
    fileError.focus({ preventScroll: true });
    return false;
  }

  if (file.size > MAX_FILE_SIZE) {
    fileError.textContent = 'Dosya boyutu 10 MB sınırını aşamaz.';
    documentInput.value = '';
    fileError.focus({ preventScroll: true });
    return false;
  }

  fileLabel.textContent = file.name;
  return true;
}

quantityInput.addEventListener('input', updateSummary);
documentInput.addEventListener('change', validateSelectedFile);
productSelect.addEventListener('change', updateProductSummary);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!validateSelectedFile()) return;

  submitButton.disabled = true;
  submitButton.textContent = 'Talebiniz gönderiliyor…';
  formStatus.textContent = '';
  form.setAttribute('aria-busy', 'true');

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });
    const result = await response.json();

    if (!response.ok || result.success !== 'true') {
      throw new Error('Submission failed');
    }

    formSection.hidden = true;
    successSection.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    successHeading?.focus({ preventScroll: true });
  } catch {
    formStatus.textContent =
      'Talebiniz şu anda iletilemedi. Lütfen bağlantınızı kontrol edip yeniden deneyin.';
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Sipariş talebini gönder';
    form.removeAttribute('aria-busy');
  }
});

returnButton.addEventListener('click', () => {
  successSection.hidden = true;
  formSection.hidden = false;
  form.reset();
  applyRequestedProduct();
  updateSummary();
  updateProductSummary();
  form.querySelector('input[name="fullName"]')?.focus();
});

applyRequestedProduct();
updateSummary();
updateProductSummary();
