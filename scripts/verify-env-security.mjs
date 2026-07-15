import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

function fail(message) {
  failures.push(message);
}

function readGitLsFiles(path) {
  const result = spawnSync('git', ['ls-files', path], {
    cwd: ROOT,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  return (result.stdout || '').trim();
}

const trackedEnv = readGitLsFiles('.env');
if (trackedEnv) {
  fail('.env must not be tracked by git (run: git rm --cached --sparse .env)');
}

const stagedEnv = spawnSync('git', ['diff', '--cached', '--name-only', '--', '.env'], {
  cwd: ROOT,
  encoding: 'utf8',
  shell: process.platform === 'win32',
});
if ((stagedEnv.stdout || '').trim()) {
  fail('.env must not be staged for commit');
}

const gitignorePath = resolve(ROOT, '.gitignore');
if (!existsSync(gitignorePath)) {
  fail('.gitignore is missing');
} else {
  const gitignore = readFileSync(gitignorePath, 'utf8');
  if (!/^\.env$/m.test(gitignore)) fail('.gitignore must ignore .env');
  if (!/^\.env\.\*$/m.test(gitignore)) fail('.gitignore must ignore .env.*');
}

if (existsSync(resolve(ROOT, '.env'))) {
  console.log('[verify-env-security] Local .env file exists on disk (ignored by git) — OK for development');
} else {
  console.log('[verify-env-security] No local .env file on disk — use env.example + Vercel env in production');
}

console.log('[verify-env-security] .env is not tracked in git index');

if (failures.length) {
  console.error('[verify-env-security] Verification failed:');
  failures.forEach((message) => console.error(`  - ${message}`));
  process.exit(1);
}

console.log('[verify-env-security] Environment file security checks passed');
console.log('[verify-env-security] Manual: rotate ADMIN_PASSWORD / ADMIN_SESSION_SECRET if .env was ever in git history (see docs/GIT_SECRET_AUDIT.md)');
