import {
  applyAppointmentReferrerToForm,
  bindAppointmentReferrerLinks,
  clearAppointmentReferrer,
  readAppointmentReferrer,
  resolveFormServiceCode,
} from '../src/appointment-attribution.js';

const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const storage = new Map();
globalThis.sessionStorage = {
  getItem(key) {
    return storage.get(key) ?? null;
  },
  setItem(key, value) {
    storage.set(key, String(value));
  },
  removeItem(key) {
    storage.delete(key);
  },
};

const expectedServiceCodes = {
  hair: 'hair',
  plastic: 'plastic',
  dental: 'dental',
  medical: 'medical',
  longevity: 'longevity',
};

Object.entries(expectedServiceCodes).forEach(([category, expected]) => {
  assert(
    resolveFormServiceCode({ category, slug: 'example-service' }) === expected,
    `${category} category must resolve to form service code ${expected}`,
  );
});

const listeners = {};
const appointmentLink = {
  dataset: { appointmentFrom: 'hero' },
  addEventListener(type, listener) {
    listeners[type] = listener;
  },
};
const root = {
  querySelectorAll(selector) {
    return selector === '[data-appointment-from]' ? [appointmentLink] : [];
  },
};

const appointmentContext = {
  locale: 'tr',
  slug: 'rhinoplasty',
  category: 'plastic',
  title: 'Rinoplasti',
};

assert(bindAppointmentReferrerLinks(root, appointmentContext) === 1, 'appointment link must bind once');
assert(bindAppointmentReferrerLinks(root, appointmentContext) === 0, 'appointment link must not bind twice');
assert(readAppointmentReferrer() === null, 'referrer must not be stored before appointment click');
assert(typeof listeners.click === 'function', 'appointment click listener missing');

listeners.click?.();
const storedReferrer = readAppointmentReferrer();
assert(storedReferrer?.slug === 'rhinoplasty', 'clicked service slug must be stored');
assert(storedReferrer?.category === 'plastic', 'clicked service category must be stored');
assert(storedReferrer?.source === 'hero', 'clicked CTA source must be stored');

const serviceSelect = {
  value: '',
  querySelector(selector) {
    return selector === 'option[value="plastic"]' ? {} : null;
  },
};
const messageField = { value: '' };
const form = {
  querySelector(selector) {
    if (selector === '#form-service') return serviceSelect;
    if (selector === '#form-message') return messageField;
    return null;
  },
};

applyAppointmentReferrerToForm(form);
assert(serviceSelect.value === 'plastic', 'plastic surgery must be preselected in appointment form');
assert(messageField.value === 'Rinoplasti', 'service title must populate an empty appointment message');

clearAppointmentReferrer();
assert(readAppointmentReferrer() === null, 'appointment referrer must be clearable');

if (failures.length) {
  console.error('[verify-appointment-flow] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-appointment-flow] Appointment attribution and form preselection passed');
