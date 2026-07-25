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

const EXAMPLE_UNIT_PRICE = 4850;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);

function normalizedQuantity() {
  const value = Number(quantityInput.value) || 1;
  return Math.max(1, Math.min(20, value));
}

function updateSummary() {
  const quantity = normalizedQuantity();
  quantityInput.value = String(quantity);
  summaryQuantity.textContent = String(quantity);
  summaryTotal.textContent = `₺${(quantity * EXAMPLE_UNIT_PRICE).toLocaleString('tr-TR')}`;
}

function validateSelectedFile() {
  const file = documentInput.files?.[0];
  fileError.textContent = '';
  fileLabel.textContent = 'Diploma veya mesleki belgenizi seçin';

  if (!file) {
    fileError.textContent = 'Devam etmek için bir mesleki belge seçin.';
    return false;
  }

  if (!ACCEPTED_TYPES.has(file.type)) {
    fileError.textContent = 'Yalnızca PDF, JPG, JPEG veya PNG dosyası seçebilirsiniz.';
    documentInput.value = '';
    return false;
  }

  if (file.size > MAX_FILE_SIZE) {
    fileError.textContent = 'Dosya boyutu 10 MB sınırını aşamaz.';
    documentInput.value = '';
    return false;
  }

  fileLabel.textContent = file.name;
  return true;
}

quantityInput.addEventListener('input', updateSummary);
documentInput.addEventListener('change', validateSelectedFile);

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!validateSelectedFile()) return;

  formSection.hidden = true;
  successSection.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

returnButton.addEventListener('click', () => {
  successSection.hidden = true;
  formSection.hidden = false;
  form.querySelector('input')?.focus();
});

updateSummary();
