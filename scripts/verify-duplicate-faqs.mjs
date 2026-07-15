import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUBPAGES } from '../src/subpages-data.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const warnings = [];
const GENERIC_RECOVERY_QUESTIONS = new Set([
  'İyileşme süreci ne kadar sürer?',
  'İyileşme süreci genellikle ne kadar sürer?',
  'İyileşme süresi ne kadar sürer?',
  'İyileşme süreci genelde ne kadar sürer?',
]);
const CORPORATE_ENHANCED_SLUGS = ['management', 'representatives', 'production'];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

for (const slug of CORPORATE_ENHANCED_SLUGS) {
  const page = SUBPAGES.find((entry) => entry.slug === slug);
  assert(page, `Missing corporate page: ${slug}`);
  if (!page) continue;
  assert(Array.isArray(page.sections) && page.sections.length > 0, `[${slug}] must include content sections`);
  const genericRecovery = (page.faqs || []).some((faq) =>
    GENERIC_RECOVERY_QUESTIONS.has(String(faq.question || '').trim()),
  );
  assert(!genericRecovery, `[${slug}] must not use generic medical recovery FAQ`);
}

const genericRecoveryCount = SUBPAGES.filter((page) =>
  (page.faqs || []).some((faq) => GENERIC_RECOVERY_QUESTIONS.has(String(faq.question || '').trim())),
).length;

if (genericRecoveryCount > 0) {
  warn(
    `Generic recovery FAQ still appears on ${genericRecoveryCount} non-corporate pages; plan category-specific FAQ copy`,
  );
}

if (warnings.length) {
  warnings.forEach((message) => console.warn(`[verify-duplicate-faqs] ${message}`));
}

if (failures.length) {
  console.error('[verify-duplicate-faqs] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log(`[verify-duplicate-faqs] Corporate FAQ/section checks passed (${SUBPAGES.length} pages audited)`);
