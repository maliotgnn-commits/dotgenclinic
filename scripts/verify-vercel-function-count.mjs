import { readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const API_ROOT = resolve(ROOT, 'api');
const MAX_FUNCTIONS = 12;

function collectApiHandlers(dir, relativeDir = '') {
  const entries = readdirSync(dir, { withFileTypes: true });
  const handlers = [];

  for (const entry of entries) {
    const relativePath = join(relativeDir, entry.name);
    const absolutePath = join(dir, entry.name);

    if (entry.isDirectory()) {
      handlers.push(...collectApiHandlers(absolutePath, relativePath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.js')) {
      handlers.push(relativePath.replace(/\\/g, '/'));
    }
  }

  return handlers;
}

const handlers = collectApiHandlers(API_ROOT).sort();
const count = handlers.length;

console.log(`[verify-vercel-function-count] Vercel serverless handlers under api/: ${count}`);
for (const handler of handlers) {
  console.log(`  - api/${handler}`);
}

if (count > MAX_FUNCTIONS) {
  console.error(`[verify-vercel-function-count] FAILED: ${count} handlers exceeds Hobby limit of ${MAX_FUNCTIONS}`);
  process.exit(1);
}

console.log(`[verify-vercel-function-count] OK: ${count}/${MAX_FUNCTIONS} handlers`);
