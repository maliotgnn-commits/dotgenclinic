import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUBPAGES } from '../src/subpages-data.js';
import {
  CLINIC,
  LOCALES,
  SITE_ORIGIN,
  buildBranchMedicalClinicEntity,
  buildIzmirMedicalClinicEntity,
  buildOrganizationEntity,
  locationId,
  organizationId,
} from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const failures = [];
const FORBIDDEN_TYPES = ['Doctor', 'Physician', 'Review', 'AggregateRating', 'Offer', 'Price', 'Certificate', 'Award'];
const FORBIDDEN_PROPS = ['price', 'review', 'rating', 'aggregateRating'];
const MEDICAL_CLINIC_FORBIDDEN_PROPS = [
  'aggregateRating',
  'review',
  'priceRange',
  'hasMap',
  'geo',
  'contactPoint',
  'availableService',
  'medicalSpecialty',
  'employee',
];
const MEDICAL_CLINIC_FORBIDDEN_TYPES = ['Service'];
const EXPECTED_IZMIR = buildIzmirMedicalClinicEntity();
const MEDICAL_CLINIC_ID = locationId('izmir');

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function parseJsonLdBlocks(html) {
  const blocks = [];
  const pattern = /<script data-i18n-seo="true" type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    blocks.push(JSON.parse(match[1]));
  }
  return blocks;
}

function flattenGraph(blocks) {
  return blocks.flatMap((block) => block['@graph'] || [block]);
}

function walk(node, visit) {
  if (!node || typeof node !== 'object') return;
  visit(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach((item) => walk(item, visit));
    else walk(value, visit);
  }
}

function verifyFile(relativePath, checks) {
  const filePath = resolve(DIST, relativePath);
  if (!existsSync(filePath)) {
    failures.push(`Missing file: dist/${relativePath}`);
    return;
  }
  const html = readFileSync(filePath, 'utf8');
  const blocks = parseJsonLdBlocks(html);
  assert(blocks.length > 0, `[${relativePath}] no JSON-LD blocks`);
  checks({ html, blocks });
}

function verifyIzmirMedicalClinic(entity, label) {
  assert(entity?.['@type'] === 'MedicalClinic', `[${label}] MedicalClinic type missing`);
  assert(entity?.['@id'] === MEDICAL_CLINIC_ID, `[${label}] @id mismatch`);
  assert(JSON.stringify(entity) === JSON.stringify(EXPECTED_IZMIR), `[${label}] canonical Izmir entity mismatch`);
  assert(!JSON.stringify(entity).includes('#medicalclinic'), `[${label}] forbidden #medicalclinic id`);
  MEDICAL_CLINIC_FORBIDDEN_PROPS.forEach((prop) => {
    assert(!(prop in entity), `[${label}] forbidden property ${prop} on MedicalClinic`);
  });
  walk(entity, (current) => {
    if (current['@type'] && MEDICAL_CLINIC_FORBIDDEN_TYPES.includes(current['@type'])) {
      failures.push(`[${label}] forbidden nested type ${current['@type']} on MedicalClinic`);
    }
    if (current['@type'] === 'ContactPoint') {
      failures.push(`[${label}] forbidden ContactPoint on MedicalClinic`);
    }
  });
  const hours = entity.openingHoursSpecification;
  assert(hours?.opens === '08:00' && hours?.closes === '17:00', `[${label}] opening hours mismatch`);
  assert(Array.isArray(hours?.dayOfWeek) && hours.dayOfWeek.length === 6, `[${label}] expected Mon-Sat only`);
  assert(!hours?.dayOfWeek?.includes('https://schema.org/Sunday'), `[${label}] Sunday must not appear in openingHoursSpecification`);
  assert(Array.isArray(entity.sameAs) && entity.sameAs.length === 1 && entity.sameAs[0] === CLINIC.instagram, `[${label}] sameAs must be Instagram only`);
  assert(!JSON.stringify(entity).includes('wa.me'), `[${label}] WhatsApp must not appear on MedicalClinic`);
}

function buildBaselineBranchEntity(location, pageUrl) {
  return buildBranchMedicalClinicEntity(location, pageUrl);
}

for (const locale of LOCALES) {
  verifyFile(`${locale}/index.html`, ({ html, blocks }) => {
    const label = `home/${locale}`;
    const graph = flattenGraph(blocks);
    const types = graph.map((node) => node['@type']).flat();
    assert(types.includes('Organization'), `[${label}] Organization missing`);
    assert(types.includes('WebSite'), `[${label}] WebSite missing`);
    assert(types.includes('WebPage'), `[${label}] WebPage missing`);
    const org = graph.find((node) => node['@type'] === 'Organization');
    assert(org?.department?.length >= 1, `[${label}] Organization department missing`);
    assert(org?.medicalSpecialty?.length >= 1, `[${label}] Organization medicalSpecialty missing`);
    assert(Array.isArray(org?.sameAs) && org.sameAs.includes(CLINIC.instagram), `[${label}] Organization sameAs missing`);
    const clinics = graph.filter((node) => node['@type'] === 'MedicalClinic');
    assert(clinics.length === 1, `[${label}] expected exactly 1 MedicalClinic, found ${clinics.length}`);
    verifyIzmirMedicalClinic(clinics[0], label);
    const serialized = JSON.stringify(graph);
    assert(!serialized.includes(CLINIC.locations[1].address), `[${label}] hidden branch address in homepage schema`);
    assert(!serialized.includes(CLINIC.locations[2].address), `[${label}] hidden branch address in homepage schema`);
    if (locale === 'ar') {
      assert(html.includes('lang="ar"'), `[${label}] lang=ar missing`);
      assert(html.includes('dir="rtl"'), `[${label}] dir=rtl missing`);
    }
  });

  verifyFile(`${locale}/privacy.html`, ({ blocks }) => {
    const label = `privacy/${locale}`;
    const graph = flattenGraph(blocks);
    const org = graph.find((node) => node['@type'] === 'Organization');
    assert(org?.legalName === CLINIC.legalName, `[${label}] legalName mismatch`);
    assert(org?.name === CLINIC.publicName, `[${label}] public name mismatch`);
    assert(org?.department?.length >= 1, `[${label}] Organization department missing`);
    assert(org?.medicalSpecialty?.length >= 1, `[${label}] Organization medicalSpecialty missing`);
    const clinics = graph.filter((node) => {
      const type = node['@type'];
      return type === 'MedicalClinic' || (Array.isArray(type) && type.includes('MedicalClinic'));
    });
    assert(clinics.length === 3, `[${label}] expected 3 clinic locations`);
    const ids = clinics.map((node) => node['@id']).sort();
    assert(
      JSON.stringify(ids) === JSON.stringify([locationId('denizli'), locationId('izmir'), locationId('leverkusen')].sort()),
      `[${label}] unexpected clinic @id set`,
    );
    const izmir = clinics.find((node) => node['@id'] === MEDICAL_CLINIC_ID);
    verifyIzmirMedicalClinic(izmir, label);
    const pageUrl = `${SITE_ORIGIN}/${locale}/privacy.html`;
    const denizli = clinics.find((node) => node['@id'] === locationId('denizli'));
    const leverkusen = clinics.find((node) => node['@id'] === locationId('leverkusen'));
    assert(
      JSON.stringify(denizli) === JSON.stringify(buildBaselineBranchEntity(CLINIC.locations[1], pageUrl)),
      `[${label}] Denizli baseline mismatch`,
    );
    assert(
      JSON.stringify(leverkusen) === JSON.stringify(buildBaselineBranchEntity(CLINIC.locations[2], pageUrl)),
      `[${label}] Leverkusen baseline mismatch`,
    );
  });
}

const sampleSlug = 'botox';
const sampleService = SUBPAGES.find((page) => page.slug === sampleSlug) || SUBPAGES[0];
verifyFile(`_seo/tr/service/${sampleService.slug}.html`, ({ blocks, html }) => {
  const graph = flattenGraph(blocks);
  const service = graph.find((node) => node['@type'] === 'Service');
  assert(service?.description === sampleService.summary, '[service/tr/botox-or-first] service description mismatch');
  assert(Array.isArray(service?.areaServed) && service.areaServed.length >= 1, '[service sample] areaServed missing');
  if (Array.isArray(sampleService.faqs) && sampleService.faqs.length) {
    const faqPage = graph.find((node) => node['@type'] === 'FAQPage');
    assert(faqPage, '[service sample] FAQPage missing for page with faqs');
    assert(
      faqPage.mainEntity?.length === sampleService.faqs.length,
      '[service sample] FAQPage question count mismatch',
    );
  }
  const breadcrumb = graph.find((node) => node['@type'] === 'BreadcrumbList');
  assert(breadcrumb?.itemListElement?.length === 3, '[service sample] expected 3-level breadcrumb');
  assert(
    breadcrumb.itemListElement[1]?.name === sampleService.categoryLabel,
    '[service sample] breadcrumb category mismatch',
  );
  graph.forEach((node) => walk(node, (current) => {
    if (current['@type'] && FORBIDDEN_TYPES.includes(current['@type'])) {
      failures.push(`[service sample] forbidden type ${current['@type']}`);
    }
    FORBIDDEN_PROPS.forEach((prop) => {
      if (prop in current) failures.push(`[service sample] forbidden property ${prop}`);
    });
  }));
  assert(!html.includes(CLINIC.locations[0].address), '[service sample] branch address must not appear in service schema html');
});

for (const locale of LOCALES) {
  const html = readFileSync(resolve(DIST, locale, 'index.html'), 'utf8');
  parseJsonLdBlocks(html).forEach((block) => {
    try {
      JSON.stringify(block);
    } catch {
      failures.push(`[json/home/${locale}] invalid JSON-LD serialization`);
    }
  });
}

if (failures.length) {
  console.error('[verify-schema] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-schema] Schema validation passed');
