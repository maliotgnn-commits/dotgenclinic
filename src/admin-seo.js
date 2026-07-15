import './style.css';
import './admin-analytics.css';
import './admin-seo.css';

const app = document.getElementById('admin-seo-app');

const CATEGORY_LABELS = {
  hair: 'Saç Ekimi',
  dental: 'Diş Estetiği',
  plastic: 'Estetik Cerrahi',
  medical: 'Medikal Estetik',
  longevity: 'Longevity',
  'eye-health': 'Göz Sağlığı',
};

function formatNumber(value) {
  return new Intl.NumberFormat('tr-TR').format(Number(value) || 0);
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(2)}%`;
}

function formatPosition(value) {
  return Number(value || 0).toFixed(1);
}

function formatChange(value) {
  const numeric = Number(value || 0);
  const sign = numeric > 0 ? '+' : '';
  return `${sign}${numeric.toFixed(2)}%`;
}

function formatDateRange(range) {
  if (!range?.startDate || !range?.endDate) return '';
  return `${range.startDate} – ${range.endDate}`;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.ok) {
    const message = payload?.error?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload.data;
}

function setStatus(message, isError = false) {
  const status = document.getElementById('admin-status');
  if (!status) return;
  status.textContent = message;
  status.classList.toggle('is-error', isError);
  status.classList.remove('is-loading');
}

function renderLogin(errorMessage = '') {
  app.innerHTML = `
    <section class="admin-analytics__login">
      <div class="admin-analytics__login-card">
        <h1 class="admin-analytics__login-title">Dr Otgen Admin</h1>
        <p class="admin-analytics__login-text">SEO dashboard'a erişmek için admin şifrenizi girin.</p>
        ${errorMessage ? `<p class="admin-analytics__login-error">${errorMessage}</p>` : ''}
        <form id="admin-login-form">
          <div class="admin-analytics__field">
            <label for="admin-password">Admin Şifresi</label>
            <input id="admin-password" name="password" type="password" autocomplete="current-password" required />
          </div>
          <button class="admin-analytics__login-btn" type="submit">Giriş Yap</button>
        </form>
        <p class="admin-seo__login-link"><a href="/admin/analytics">Analytics dashboard</a></p>
      </div>
    </section>
  `;

  document.getElementById('admin-login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const password = new FormData(event.currentTarget).get('password');

    try {
      await apiRequest('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      await bootstrapDashboard();
    } catch (error) {
      renderLogin(error.message);
    }
  });
}

function renderPerformanceTable(rows, valueKey, emptyLabel) {
  if (!rows?.length) {
    return `<tr><td colspan="5">${emptyLabel}</td></tr>`;
  }

  return rows
    .map(
      (row) => `
        <tr>
          <td class="admin-seo__cell-truncate" title="${row[valueKey]}">${row[valueKey]}</td>
          <td>${formatNumber(row.clicks)}</td>
          <td>${formatNumber(row.impressions)}</td>
          <td>${formatPercent((row.ctr ?? 0) <= 1 ? row.ctr * 100 : row.ctr)}</td>
          <td>${formatPosition(row.averagePosition)}</td>
        </tr>
      `,
    )
    .join('');
}

function renderServiceTable(rows, emptyLabel) {
  if (!rows?.length) {
    return `<tr><td colspan="6">${emptyLabel}</td></tr>`;
  }

  return rows
    .map(
      (row) => `
        <tr>
          <td>${CATEGORY_LABELS[row.category] || row.category}</td>
          <td class="admin-seo__cell-truncate" title="${row.serviceName}">${row.serviceName}</td>
          <td>${formatNumber(row.clicks)}</td>
          <td>${formatNumber(row.impressions)}</td>
          <td>${formatPercent(row.ctr)}</td>
          <td>${formatPosition(row.averagePosition)}</td>
        </tr>
      `,
    )
    .join('');
}

function renderCategorySummary(categories) {
  const keys = Object.keys(CATEGORY_LABELS);
  return keys
    .map((key) => {
      const item = categories?.[key];
      if (!item) return '';

      return `
        <article class="admin-seo__category-card">
          <h3>${CATEGORY_LABELS[key]}</h3>
          <div class="admin-seo__category-metrics">
            <span>${formatNumber(item.clicks)} clicks</span>
            <span>${formatNumber(item.impressions)} imp.</span>
            <span>CTR ${formatPercent(item.ctr)}</span>
            <span>Pos ${formatPosition(item.averagePosition)}</span>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderDashboard(data) {
  const {
    performance,
    indexHealth,
    servicePerformance,
    localSeo,
    siteUrl,
    serviceAccount,
    generatedAt,
  } = data;

  app.innerHTML = `
    <div class="admin-analytics admin-seo">
      <div class="admin-analytics__shell">
        <header class="admin-analytics__header">
          <div class="admin-analytics__brand">
            <span class="admin-analytics__eyebrow">Search Console Growth</span>
            <h1 class="admin-analytics__title">SEO Dashboard</h1>
            <p class="admin-analytics__subtitle">${siteUrl}</p>
          </div>
          <div class="admin-analytics__actions">
            <a class="admin-analytics__refresh admin-seo__nav-link" href="/admin/analytics">Analytics</a>
            <button class="admin-analytics__refresh" id="admin-refresh" type="button">Yenile</button>
            <button class="admin-analytics__logout" id="admin-logout" type="button">Çıkış</button>
          </div>
        </header>

        <div class="admin-analytics__status" id="admin-status">
          Son güncelleme: ${new Date(generatedAt).toLocaleString('tr-TR')} · ${serviceAccount}
        </div>

        <section class="admin-analytics__panel">
          <h2 class="admin-analytics__panel-title">Genel SEO Kartları</h2>
          <div class="admin-analytics__cards admin-seo__cards">
            <article class="admin-analytics__card">
              <span class="admin-analytics__card-label">Clicks</span>
              <strong class="admin-analytics__card-value">${formatNumber(performance.clicks)}</strong>
              <span class="admin-analytics__card-meta">${formatChange(performance.change?.clicks)} · ${formatDateRange(performance.dateRange)}</span>
            </article>
            <article class="admin-analytics__card">
              <span class="admin-analytics__card-label">Impressions</span>
              <strong class="admin-analytics__card-value">${formatNumber(performance.impressions)}</strong>
              <span class="admin-analytics__card-meta">${formatChange(performance.change?.impressions)} · Son 28 gün</span>
            </article>
            <article class="admin-analytics__card">
              <span class="admin-analytics__card-label">CTR</span>
              <strong class="admin-analytics__card-value">${formatPercent(performance.ctr)}</strong>
              <span class="admin-analytics__card-meta">${formatChange(performance.change?.ctr)} · Tıklama oranı</span>
            </article>
            <article class="admin-analytics__card">
              <span class="admin-analytics__card-label">Average Position</span>
              <strong class="admin-analytics__card-value">${formatPosition(performance.averagePosition)}</strong>
              <span class="admin-analytics__card-meta">${formatChange(performance.change?.averagePosition)} · Ortalama sıra</span>
            </article>
          </div>
        </section>

        <section class="admin-analytics__panel admin-seo__panel">
          <h2 class="admin-analytics__panel-title">Index Health</h2>
          <div class="admin-seo__index-grid admin-seo__index-grid--4">
            <div class="admin-seo__index-stat">
              <span>Sitemap URL sayısı</span>
              <strong>${formatNumber(indexHealth.sitemapUrlCount)}</strong>
            </div>
            <div class="admin-seo__index-stat">
              <span>Index adayları</span>
              <strong>${formatNumber(indexHealth.indexCandidates)}</strong>
            </div>
            <div class="admin-seo__index-stat">
              <span>Canonical URL sayısı</span>
              <strong>${formatNumber(indexHealth.canonicalUrlCount)}</strong>
            </div>
            <div class="admin-seo__index-stat">
              <span>Noindex URL sayısı</span>
              <strong>${formatNumber(indexHealth.noindexUrlCount)}</strong>
            </div>
          </div>
          ${indexHealth.note ? `<p class="admin-seo__note">${indexHealth.note}</p>` : ''}
        </section>

        <section class="admin-analytics__panel">
          <h2 class="admin-analytics__panel-title">Service SEO Performance</h2>
          <div class="admin-seo__category-grid">${renderCategorySummary(servicePerformance?.categories)}</div>
        </section>

        <div class="admin-seo__tables admin-seo__tables--stack">
          <section class="admin-analytics__panel">
            <h2 class="admin-analytics__panel-title">En İyi Performans Gösteren Hizmetler</h2>
            <div class="admin-analytics__table-wrap">
              <table class="admin-analytics__table">
                <thead>
                  <tr>
                    <th>Kategori</th>
                    <th>Hizmet</th>
                    <th>Clicks</th>
                    <th>Impressions</th>
                    <th>CTR</th>
                    <th>Position</th>
                  </tr>
                </thead>
                <tbody>${renderServiceTable(servicePerformance?.topPerformers, 'Hizmet performans verisi bulunamadı.')}</tbody>
              </table>
            </div>
          </section>

          <section class="admin-analytics__panel">
            <h2 class="admin-analytics__panel-title">Fırsat Sayfaları (Impression yüksek, Position 5–20)</h2>
            <div class="admin-analytics__table-wrap">
              <table class="admin-analytics__table">
                <thead>
                  <tr>
                    <th>Kategori</th>
                    <th>Hizmet</th>
                    <th>Clicks</th>
                    <th>Impressions</th>
                    <th>CTR</th>
                    <th>Position</th>
                  </tr>
                </thead>
                <tbody>${renderServiceTable(servicePerformance?.opportunities, 'Fırsat sayfası bulunamadı.')}</tbody>
              </table>
            </div>
          </section>
        </div>

        <div class="admin-seo__tables">
          <section class="admin-analytics__panel">
            <h2 class="admin-analytics__panel-title">Query Analysis</h2>
            <div class="admin-analytics__table-wrap">
              <table class="admin-analytics__table">
                <thead>
                  <tr>
                    <th>Query</th>
                    <th>Clicks</th>
                    <th>Impressions</th>
                    <th>CTR</th>
                    <th>Position</th>
                  </tr>
                </thead>
                <tbody>${renderPerformanceTable(performance.topQueries, 'query', 'Sorgu verisi bulunamadı.')}</tbody>
              </table>
            </div>
          </section>

          <section class="admin-analytics__panel">
            <h2 class="admin-analytics__panel-title">Page Performance</h2>
            <div class="admin-analytics__table-wrap">
              <table class="admin-analytics__table">
                <thead>
                  <tr>
                    <th>URL</th>
                    <th>Clicks</th>
                    <th>Impressions</th>
                    <th>CTR</th>
                    <th>Position</th>
                  </tr>
                </thead>
                <tbody>${renderPerformanceTable(performance.topPages, 'page', 'Sayfa verisi bulunamadı.')}</tbody>
              </table>
            </div>
          </section>
        </div>

        <section class="admin-analytics__panel admin-seo__panel">
          <h2 class="admin-analytics__panel-title">Local SEO (Google Business)</h2>
          <p class="admin-seo__note">${localSeo?.configured ? `${localSeo.locations?.length || 0} lokasyon verisi alındı.` : localSeo?.message || 'Google Business Profile API yapılandırılmamış.'}</p>
        </section>
      </div>
    </div>
  `;

  document.getElementById('admin-refresh').addEventListener('click', () => loadDashboardData(true));
  document.getElementById('admin-logout').addEventListener('click', async () => {
    try {
      await apiRequest('/api/admin/logout', { method: 'POST' });
    } finally {
      renderLogin();
    }
  });
}

async function loadDashboardData(forceRefresh = false) {
  if (forceRefresh) {
    setStatus('Search Console verileri yenileniyor...', false);
    document.getElementById('admin-status')?.classList.add('is-loading');
  }

  try {
    const data = await apiRequest('/api/admin/seo');
    renderDashboard(data);
  } catch (error) {
    setStatus(error.message, true);
  }
}

async function bootstrapDashboard() {
  try {
    await apiRequest('/api/admin/session');
    app.innerHTML =
      '<div class="admin-analytics"><div class="admin-analytics__shell"><div class="admin-analytics__status is-loading">Oturum doğrulandı, SEO dashboard yükleniyor...</div></div></div>';
    await loadDashboardData();
  } catch {
    renderLogin();
  }
}

bootstrapDashboard();
