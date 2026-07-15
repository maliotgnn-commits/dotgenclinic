import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPORT_PATH = resolve(ROOT, 'reports/seo-weekly-report.md');
const PREPARED_SERVICE_ACCOUNT_PATH = resolve(ROOT, 'secrets/vercel-google-service-account.oneline.txt');

function loadLocalEnvFile() {
  const envPath = resolve(ROOT, '.env');
  if (!existsSync(envPath)) return;

  const text = readFileSync(envPath, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index <= 0) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null || process.env[key] === '') {
      process.env[key] = value;
    }
  }
}

function bootstrapCredentials() {
  loadLocalEnvFile();
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) return;
  if (existsSync(PREPARED_SERVICE_ACCOUNT_PATH)) {
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON = readFileSync(PREPARED_SERVICE_ACCOUNT_PATH, 'utf8').trim();
  }
}

function formatChange(value) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${Number(value || 0).toFixed(2)}%`;
}

function buildReport(data) {
  const generatedAt = data?.generatedAt || new Date().toISOString();
  const performance = data?.performance || {};
  const change = performance.change || {};
  const topPages = performance.topPages || [];
  const opportunities = data?.servicePerformance?.opportunities || [];
  const indexHealth = data?.indexHealth || {};
  const warnings = [];

  if ((indexHealth.noindexUrlCount || 0) > 0) {
    warnings.push(`${indexHealth.noindexUrlCount} URL bilinçli olarak noindex durumda (admin + doctor scaffold).`);
  }
  if ((data?.indexing?.excluded?.count || 0) > 0) {
    warnings.push(`Sitemap coverage'da ${data.indexing.excluded.count} URL henüz indexlenmemiş görünüyor.`);
  }
  if (!data?.localSeo?.configured) {
    warnings.push('Google Business Profile API yapılandırılmamış — local SEO manuel takip gerektiriyor.');
  }

  const recommendations = [
    'Position 5-20 aralığındaki fırsat sayfalarında başlık, meta ve internal link güçlendirmesi yapın.',
    'Pillar içerikleri (planned) yayına alınmadan cluster internal link ağı tamamlanamaz.',
    'Doctor profileCompleted=true olmadan Physician schema üretmeyin; noindex korunmalı.',
    'Search Console haftalık winners/opportunities listesini content backlog ile eşleştirin.',
  ];

  return `# Weekly SEO Report

Generated: ${generatedAt}

## Traffic

- Click değişimi: ${formatChange(change.clicks)} (${performance.clicks ?? 0} clicks)
- Impression değişimi: ${formatChange(change.impressions)} (${performance.impressions ?? 0} impressions)
- CTR: ${Number(performance.ctr || 0).toFixed(2)}%
- Average position: ${Number(performance.averagePosition || 0).toFixed(1)}

## Winners

${topPages.slice(0, 10).map((page, index) => `${index + 1}. ${page.page} — ${page.clicks} clicks, ${page.impressions} impressions, pos ${Number(page.averagePosition || 0).toFixed(1)}`).join('\n') || '- Veri yok'}

## Opportunities

${opportunities.slice(0, 10).map((page, index) => `${index + 1}. ${page.serviceName} (${page.page}) — ${page.impressions} impressions, pos ${Number(page.averagePosition || 0).toFixed(1)}`).join('\n') || '- Fırsat sayfası bulunamadı'}

## Warnings

${warnings.length ? warnings.map((item) => `- ${item}`).join('\n') : '- Kritik uyarı yok'}

## Recommendations

${recommendations.map((item) => `- ${item}`).join('\n')}
`;
}

export async function generateSeoWeeklyReport() {
  bootstrapCredentials();
  mkdirSync(resolve(ROOT, 'reports'), { recursive: true });

  let reportBody = `# Weekly SEO Report

Generated: ${new Date().toISOString()}

## Traffic

- Search Console credentials not available during build.

## Winners

- Run \`node scripts/generate-seo-weekly-report.mjs\` locally with credentials configured.

## Opportunities

- N/A

## Warnings

- Automated weekly report requires GOOGLE_SERVICE_ACCOUNT_JSON.

## Recommendations

- Configure Search Console credentials and regenerate this report.
`;

  try {
    const { fetchSeoReport } = await import(
      pathToFileURL(resolve(ROOT, 'server/seo/search-console/seo-report.js')).href
    );
    const data = await fetchSeoReport();
    reportBody = buildReport(data);
  } catch (error) {
    reportBody += `\n\n<!-- generation error: ${error instanceof Error ? error.message : String(error)} -->\n`;
  }

  writeFileSync(REPORT_PATH, reportBody, 'utf8');
  console.log(`[generate-seo-weekly-report] Wrote ${REPORT_PATH}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  generateSeoWeeklyReport().catch((error) => {
    console.error('[generate-seo-weekly-report] Failed:', error?.message || error);
    process.exit(1);
  });
}
