import { spawnSync } from 'node:child_process';

const ALWAYS_FORBIDDEN = ['package.json', 'package-lock.json'];

const ADMIN_VITE_PATTERNS = [
  /admin\/seo/,
  /admin\/analytics/,
  /adminRoutes/,
  /adminSeo/,
  /adminAnalytics/,
  /admin-seo/,
  /admin-analytics/,
];

export function getChangedFilesFromMain(root) {
  const diffNames = spawnSync('git', ['diff', '--name-only', 'origin/main'], {
    cwd: root,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });

  if (diffNames.status !== 0) {
    return [];
  }

  return diffNames.stdout.split(/\r?\n/).filter(Boolean).map((file) => file.replace(/\\/g, '/'));
}

function getFileDiffFromMain(root, relativePath) {
  const diff = spawnSync('git', ['diff', 'origin/main', '--', relativePath], {
    cwd: root,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });

  if (diff.status !== 0) {
    return '';
  }

  return diff.stdout || '';
}

function isInsignificantDiffLine(line) {
  const content = line.slice(1).trim();
  return !content || content === '}' || content === '{';
}

export function isAdminOnlyViteConfigDiff(diffText) {
  if (!diffText.trim()) {
    return true;
  }

  const changedLines = diffText
    .split(/\r?\n/)
    .filter((line) => (line.startsWith('+') || line.startsWith('-')) && !line.startsWith('+++') && !line.startsWith('---'));

  if (changedLines.length === 0) {
    return true;
  }

  const meaningfulLines = changedLines.filter((line) => !isInsignificantDiffLine(line));

  if (meaningfulLines.length === 0) {
    return true;
  }

  return meaningfulLines.every((line) => ADMIN_VITE_PATTERNS.some((pattern) => pattern.test(line)));
}

/**
 * Finance/legal preview guards: block risky build file changes on feature branches.
 * Admin dashboard routes in vite.config.js are allowed (admin-only diff).
 */
export function assertBuildFileDiffGuard(failures, root) {
  const changedFiles = getChangedFilesFromMain(root);

  for (const relativePath of ALWAYS_FORBIDDEN) {
    if (changedFiles.includes(relativePath)) {
      failures.push(`Forbidden file changed from origin/main: ${relativePath}`);
    }
  }

  if (changedFiles.includes('vite.config.js')) {
    const viteDiff = getFileDiffFromMain(root, 'vite.config.js');
    if (!isAdminOnlyViteConfigDiff(viteDiff)) {
      failures.push('Forbidden file changed from origin/main: vite.config.js');
    }
  }
}
