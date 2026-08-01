const STORAGE_KEY = 'dotgen_appointment_ref_v1';
const MAX_AGE_MS = 30 * 60 * 1000;

export function storeAppointmentReferrer({ locale, slug, category, title, source = 'service' }) {
  if (!slug) return;
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        locale,
        slug,
        category: category || undefined,
        title: title || undefined,
        source,
        storedAt: Date.now(),
      }),
    );
  } catch {
    // sessionStorage may be unavailable
  }
}

export function readAppointmentReferrer() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.slug) return null;
    if (Date.now() - (parsed.storedAt || 0) > MAX_AGE_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearAppointmentReferrer() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

const SERVICE_CODE_BY_CATEGORY = {
  hair: 'hair',
  plastic: 'plastic',
  dental: 'dental',
  medical: 'medical',
  longevity: 'longevity',
};

export function resolveFormServiceCode(referrer) {
  if (!referrer) return '';
  if (referrer.category && SERVICE_CODE_BY_CATEGORY[referrer.category]) {
    return SERVICE_CODE_BY_CATEGORY[referrer.category];
  }
  return referrer.slug || '';
}

export function applyAppointmentReferrerToForm(form) {
  const referrer = readAppointmentReferrer();
  if (!referrer || !form) return referrer;

  const serviceSelect = form.querySelector('#form-service');
  const serviceCode = resolveFormServiceCode(referrer);
  if (serviceSelect && serviceCode) {
    const option = serviceSelect.querySelector(`option[value="${serviceCode}"]`);
    if (option) serviceSelect.value = serviceCode;
  }

  const messageField = form.querySelector('#form-message');
  if (messageField && referrer.title && !String(messageField.value || '').trim()) {
    messageField.value = referrer.title;
  }

  return referrer;
}

export function bindAppointmentReferrerLinks(root, appointmentContext) {
  if (!root?.querySelectorAll || !appointmentContext?.slug) return 0;

  let boundCount = 0;
  root.querySelectorAll('[data-appointment-from]').forEach((link) => {
    if (link.dataset.appointmentReferrerBound === 'true') return;
    link.dataset.appointmentReferrerBound = 'true';
    boundCount += 1;

    link.addEventListener('click', () => {
      storeAppointmentReferrer({
        ...appointmentContext,
        source: link.dataset.appointmentFrom || appointmentContext.source || 'service',
      });
    });
  });

  return boundCount;
}
