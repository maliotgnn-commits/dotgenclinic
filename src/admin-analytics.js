import './style.css';
import './admin-analytics.css';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  BarController,
  BarElement,
  PieController,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  BarController,
  BarElement,
  PieController,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
);

const app = document.getElementById('admin-analytics-app');
const charts = new Map();

const chartColors = {
  gold: '#c9a84c',
  goldLight: '#dfc06e',
  navy: '#0f1f3a',
  white: '#ffffff',
  muted: '#ffffff73',
};

function formatNumber(value) {
  return new Intl.NumberFormat('tr-TR').format(Number(value) || 0);
}

function formatGaDate(raw) {
  if (!raw || raw.length !== 8) return raw || '';
  return `${raw.slice(6, 8)}.${raw.slice(4, 6)}.${raw.slice(0, 4)}`;
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

function destroyCharts() {
  for (const chart of charts.values()) {
    chart.destroy();
  }
  charts.clear();
}

function renderLogin(errorMessage = '') {
  destroyCharts();

  app.innerHTML = `
    <section class="admin-analytics__login">
      <div class="admin-analytics__login-card">
        <h1 class="admin-analytics__login-title">Dr Otgen Admin</h1>
        <p class="admin-analytics__login-text">Analytics dashboard'a erişmek için admin şifrenizi girin.</p>
        ${errorMessage ? `<p class="admin-analytics__login-error">${errorMessage}</p>` : ''}
        <form id="admin-login-form">
          <div class="admin-analytics__field">
            <label for="admin-password">Admin Şifresi</label>
            <input id="admin-password" name="password" type="password" autocomplete="current-password" required />
          </div>
          <button class="admin-analytics__login-btn" type="submit">Giriş Yap</button>
        </form>
      </div>
    </section>
  `;

  const form = document.getElementById('admin-login-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const password = new FormData(form).get('password');

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

function renderCard(label, value) {
  return `
    <article class="admin-analytics__card">
      <p class="admin-analytics__card-label">${label}</p>
      <p class="admin-analytics__card-value">${formatNumber(value)}</p>
    </article>
  `;
}

function renderFunnelStep(step, index, maxValue) {
  const width = maxValue > 0 ? Math.max((step.value / maxValue) * 100, 12) : 12;

  return `
    <div class="admin-analytics__funnel-step">
      <div class="admin-analytics__funnel-meta">
        <span class="admin-analytics__funnel-index">${index + 1}</span>
        <div>
          <p class="admin-analytics__funnel-label">${step.label}</p>
          <p class="admin-analytics__funnel-value">${formatNumber(step.value)}</p>
        </div>
        <div class="admin-analytics__funnel-rates">
          <span>Ziyaretçiden: %${step.rateFromVisitors || 0}</span>
          ${step.rateFromPrevious != null ? `<span>Önceki adımdan: %${step.rateFromPrevious}</span>` : ''}
        </div>
      </div>
      <div class="admin-analytics__funnel-bar-track">
        <div class="admin-analytics__funnel-bar" style="width: ${width}%"></div>
      </div>
    </div>
  `;
}

function renderFunnel(steps = []) {
  const maxValue = steps[0]?.value || 1;

  return `
    <div class="admin-analytics__funnel">
      ${steps.map((step, index) => renderFunnelStep(step, index, maxValue)).join('')}
    </div>
  `;
}

function renderConversionCard(key, label, item) {
  return `
    <article class="admin-analytics__conversion-card">
      <p class="admin-analytics__conversion-label">${label}</p>
      <p class="admin-analytics__conversion-value">${formatNumber(item?.count || 0)}</p>
      <p class="admin-analytics__conversion-rate">Oran: %${item?.rate || 0}</p>
    </article>
  `;
}

function renderDashboardShell(data) {
  const cards = data.cards || {};

  app.innerHTML = `
    <div class="admin-analytics">
      <div class="admin-analytics__shell">
        <header class="admin-analytics__header">
          <div class="admin-analytics__brand">
            <span class="admin-analytics__eyebrow">Dr Otgen Clinic</span>
            <h1 class="admin-analytics__title">Analytics Dashboard</h1>
            <p class="admin-analytics__subtitle">GA4 verileri · Son güncelleme: ${new Date(data.generatedAt).toLocaleString('tr-TR')}</p>
          </div>
          <div class="admin-analytics__actions">
            <button class="admin-analytics__refresh" type="button" id="admin-refresh">Yenile</button>
            <button class="admin-analytics__logout" type="button" id="admin-logout">Çıkış</button>
          </div>
        </header>

        <div id="admin-status" class="admin-analytics__status is-loading">Veriler yükleniyor...</div>

        <div class="admin-analytics__grid">
          <section class="admin-analytics__cards">
            ${renderCard('Bugünkü Ziyaretçi', cards.todayVisitors)}
            ${renderCard('Son 7 Gün Ziyaretçi', cards.last7DaysVisitors)}
            ${renderCard('Son 30 Gün Ziyaretçi', cards.last30DaysVisitors)}
            ${renderCard('Session', cards.sessions)}
            ${renderCard('Page View', cards.pageViews)}
            ${renderCard('Yeni Kullanıcı', cards.newUsers)}
          </section>

          <section class="admin-analytics__charts">
            <article class="admin-analytics__panel admin-analytics__panel--wide">
              <h2 class="admin-analytics__panel-title">Günlük Ziyaretçi (Son 30 Gün)</h2>
              <div class="admin-analytics__chart-wrap">
                <canvas id="chart-daily-visitors"></canvas>
              </div>
            </article>

            <article class="admin-analytics__panel">
              <h2 class="admin-analytics__panel-title">En Çok Ziyaret Edilen Hizmetler</h2>
              <div class="admin-analytics__chart-wrap admin-analytics__chart-wrap--compact">
                <canvas id="chart-top-services"></canvas>
              </div>
            </article>

            <article class="admin-analytics__panel admin-analytics__panel--wide">
              <h2 class="admin-analytics__panel-title">Conversion Funnel (Son 30 Gün)</h2>
              ${renderFunnel(data.conversionFunnel?.steps || [])}
            </article>

            <article class="admin-analytics__panel">
              <h2 class="admin-analytics__panel-title">Dil Analizi (TR / EN / Diğer)</h2>
              <div class="admin-analytics__chart-wrap admin-analytics__chart-wrap--compact">
                <canvas id="chart-languages"></canvas>
              </div>
            </article>

            <article class="admin-analytics__panel">
              <h2 class="admin-analytics__panel-title">Ülke Analizi (Top 10)</h2>
              <div class="admin-analytics__chart-wrap admin-analytics__chart-wrap--compact">
                <canvas id="chart-countries"></canvas>
              </div>
            </article>

            <article class="admin-analytics__panel admin-analytics__panel--wide">
              <h2 class="admin-analytics__panel-title">Dönüşüm Analizi</h2>
              <div class="admin-analytics__conversion-grid">
                ${renderConversionCard('whatsapp_click', 'WhatsApp Tıklama', data.conversions?.whatsapp_click)}
                ${renderConversionCard('appointment_cta', 'Randevu CTA', data.conversions?.appointment_cta)}
                ${renderConversionCard('form_submit', 'Form Gönderimi', data.conversions?.form_submit)}
              </div>
            </article>

            <article class="admin-analytics__panel admin-analytics__panel--wide">
              <h2 class="admin-analytics__panel-title">Hizmet Performansı</h2>
              <div class="admin-analytics__table-wrap">
                <table class="admin-analytics__table">
                  <thead>
                    <tr>
                      <th>Hizmet Adı</th>
                      <th>Görüntülenme</th>
                      <th>WhatsApp Tıklama</th>
                      <th>Randevu CTA</th>
                    </tr>
                  </thead>
                  <tbody id="service-performance-body"></tbody>
                </table>
              </div>
            </article>
          </section>
        </div>
      </div>
    </div>
  `;

  document.getElementById('admin-refresh').addEventListener('click', () => loadDashboardData(true));
  document.getElementById('admin-logout').addEventListener('click', async () => {
    await apiRequest('/api/admin/logout', { method: 'POST' });
    renderLogin();
  });

  mountCharts(data);
  renderServiceTable(data.servicePerformance || []);
  const source = data.meta?.serviceDataSource || 'unknown';
  setStatus(`Dashboard hazır. Hizmet verisi kaynağı: ${source}.`, false);
}

function setStatus(message, isError = false) {
  const status = document.getElementById('admin-status');
  if (!status) return;
  status.textContent = message;
  status.classList.toggle('is-error', isError);
  status.classList.toggle('is-loading', false);
}

function chartBaseOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: chartColors.muted,
          font: { family: 'Inter, sans-serif' },
        },
      },
      tooltip: {
        backgroundColor: '#060d18ee',
        borderColor: chartColors.gold,
        borderWidth: 1,
        titleColor: chartColors.white,
        bodyColor: chartColors.white,
      },
    },
    scales: {
      x: {
        ticks: { color: chartColors.muted },
        grid: { color: '#ffffff12' },
      },
      y: {
        ticks: { color: chartColors.muted },
        grid: { color: '#ffffff12' },
        beginAtZero: true,
      },
    },
  };
}

function mountCharts(data) {
  destroyCharts();

  const daily = data.dailyVisitors || [];
  charts.set(
    'daily',
    new Chart(document.getElementById('chart-daily-visitors'), {
      type: 'line',
      data: {
        labels: daily.map((item) => formatGaDate(item.date)),
        datasets: [
          {
            label: 'Ziyaretçi',
            data: daily.map((item) => item.activeUsers),
            borderColor: chartColors.gold,
            backgroundColor: '#c9a84c33',
            fill: true,
            tension: 0.35,
            pointRadius: 2,
            pointBackgroundColor: chartColors.goldLight,
          },
        ],
      },
      options: chartBaseOptions(),
    }),
  );

  const services = data.topServices || [];
  charts.set(
    'services',
    new Chart(document.getElementById('chart-top-services'), {
      type: 'bar',
      data: {
        labels: services.map((item) => item.label),
        datasets: [
          {
            label: 'Görüntülenme',
            data: services.map((item) => item.value),
            backgroundColor: '#c9a84caa',
            borderColor: chartColors.gold,
            borderWidth: 1,
            borderRadius: 6,
          },
        ],
      },
      options: {
        ...chartBaseOptions(),
        indexAxis: 'y',
      },
    }),
  );

  const languages = data.languages || [];
  charts.set(
    'languages',
    new Chart(document.getElementById('chart-languages'), {
      type: 'pie',
      data: {
        labels: languages.map((item) => item.label),
        datasets: [
          {
            data: languages.map((item) => item.value),
            backgroundColor: ['#c9a84c', '#dfc06e', '#0f1f3a'],
            borderColor: '#060d18',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: chartColors.muted },
          },
        },
      },
    }),
  );

  const countries = data.countries || [];
  charts.set(
    'countries',
    new Chart(document.getElementById('chart-countries'), {
      type: 'bar',
      data: {
        labels: countries.map((item) => item.label),
        datasets: [
          {
            label: 'Ziyaretçi',
            data: countries.map((item) => item.value),
            backgroundColor: '#c9a84caa',
            borderColor: chartColors.gold,
            borderWidth: 1,
            borderRadius: 6,
          },
        ],
      },
      options: {
        ...chartBaseOptions(),
        indexAxis: 'y',
      },
    }),
  );
}

function renderServiceTable(rows) {
  const body = document.getElementById('service-performance-body');
  if (!body) return;

  if (!rows.length) {
    body.innerHTML = `
      <tr>
        <td colspan="4">Henüz hizmet performans verisi bulunamadı.</td>
      </tr>
    `;
    return;
  }

  body.innerHTML = rows
    .map(
      (row) => `
        <tr>
          <td>${row.serviceName}</td>
          <td>${formatNumber(row.views)}</td>
          <td>${formatNumber(row.whatsappClicks)}</td>
          <td>${formatNumber(row.appointmentCta)}</td>
        </tr>
      `,
    )
    .join('');
}

async function loadDashboardData(forceRefresh = false) {
  if (forceRefresh) {
    setStatus('Veriler yenileniyor...', false);
    document.getElementById('admin-status')?.classList.add('is-loading');
  }

  try {
    const data = await apiRequest('/api/admin/dashboard');
    renderDashboardShell(data);
  } catch (error) {
    setStatus(error.message, true);
  }
}

async function bootstrapDashboard() {
  try {
    await apiRequest('/api/admin/session');
    app.innerHTML = '<div class="admin-analytics"><div class="admin-analytics__shell"><div class="admin-analytics__status is-loading">Oturum doğrulandı, dashboard yükleniyor...</div></div></div>';
    await loadDashboardData();
  } catch {
    renderLogin();
  }
}

bootstrapDashboard();
