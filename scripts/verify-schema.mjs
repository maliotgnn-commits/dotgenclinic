import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUBPAGES } from '../src/subpages-data.js';
import { CLINIC, OG_IMAGE_PATH, LOCALES, DEFAULT_LOCALE } from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const failures = [];
const FORBIDDEN_TYPES = ['Doctor', 'Physician', 'Review', 'AggregateRating', 'Offer', 'Price', 'Certificate', 'Award'];
const FORBIDDEN_PROPS = ['price', 'review', 'rating', 'aggregateRating'];

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

verifyFile('tr/index.html', ({ blocks }) => {
  const graph = blocks.flatMap((block) => block['@graph'] || [block]);
  const types = graph.map((node) => node['@type']).flat();
  assert(types.includes('Organization'), '[home/tr] Organization missing');
  assert(types.includes('WebSite'), '[home/tr] WebSite missing');
  assert(types.includes('WebPage'), '[home/tr] WebPage missing');
  assert(!types.includes('MedicalClinic'), '[home/tr] MedicalClinic must not appear on homepage');
  const serialized = JSON.stringify(graph);
  assert(!serialized.includes(CLINIC.locations[1].address), '[home/tr] hidden branch address in homepage schema');
});

verifyFile('tr/privacy.html', ({ blocks }) => {
  const graph = blocks.flatMap((block) => block['@graph'] || [block]);
  const org = graph.find((node) => node['@type'] === 'Organization');
  assert(org?.legalName === CLINIC.legalName, '[privacy/tr] legalName mismatch');
  assert(org?.name === CLINIC.publicName, '[privacy/tr] public name mismatch');
  assert(graph.filter((node) => node['@type'] === 'MedicalClinic').length === 3, '[privacy/tr] expected 3 clinic locations');
});

const sampleSlug = 'botox';
const sampleService = SUBPAGES.find((page) => page.slug === sampleSlug) || SUBPAGES[0];
verifyFile(`_seo/tr/service/${sampleService.slug}.html`, ({ blocks, html }) => {
  const graph = blocks.flatMap((block) => block['@graph'] || [block]);
  const service = graph.find((node) => node['@type'] === 'Service');
  assert(service?.description === sampleService.summary, '[service/tr/botox-or-first] service description mismatch');
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

for (const blockSet of [readFileSync(resolve(DIST, 'tr/index.html'), 'utf8')]) {
  parseJsonLdBlocks(blockSet).forEach((block) => {
    try {
      JSON.stringify(block);
    } catch {
      failures.push('[json] invalid JSON-LD serialization');
    }
  });
}

if (failures.length) {
  console.error('[verify-schema] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-schema] Schema validation passed');
