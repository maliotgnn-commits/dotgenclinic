import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FAQ_RECOVERY_BATCH, GENERIC_RECOVERY_QUESTIONS } from './faq-recovery-batch-updates.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = resolve(ROOT, 'src/subpages-data.js');

function patchSlugBlock(source, slug, question, answer) {
  const marker = `"slug": "${slug}"`;
  const start = source.indexOf(marker);
  if (start === -1) {
    throw new Error(`[apply-faq-recovery-batch] Missing slug: ${slug}`);
  }

  const nextSlug = source.indexOf('"slug":', start + marker.length);
  const end = nextSlug === -1 ? source.length : nextSlug;
  const block = source.slice(start, end);

  let updatedBlock = block;
  let replaced = false;

  for (const genericQuestion of GENERIC_RECOVERY_QUESTIONS) {
    const pattern = new RegExp(
      `"question": "${genericQuestion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}",\\s*"answer": "[^"]*"`,
      'u',
    );
    if (pattern.test(updatedBlock)) {
      updatedBlock = updatedBlock.replace(
        pattern,
        `"question": "${question.replace(/"/g, '\\"')}",\n          "answer": "${answer.replace(/"/g, '\\"')}"`,
      );
      replaced = true;
      break;
    }
  }

  if (!replaced) {
    throw new Error(`[apply-faq-recovery-batch] Generic recovery FAQ not found for slug: ${slug}`);
  }

  return source.slice(0, start) + updatedBlock + source.slice(end);
}

let source = readFileSync(TARGET, 'utf8');

for (const [slug, update] of Object.entries(FAQ_RECOVERY_BATCH)) {
  source = patchSlugBlock(source, slug, update.question, update.answer);
}

writeFileSync(TARGET, source, 'utf8');
console.log(`[apply-faq-recovery-batch] Updated ${Object.keys(FAQ_RECOVERY_BATCH).length} service FAQs`);
