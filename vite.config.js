import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { prerenderHomeSeo } from './scripts/prerender-home-seo.mjs';
import { prerenderServiceSeo } from './scripts/prerender-service-seo.mjs';
import { prerenderPrivacySeo } from './scripts/prerender-privacy-seo.mjs';
import { prerenderEyeHealthSeo } from './scripts/prerender-eye-health-seo.mjs';
import { verifyOgSocialImage } from './scripts/verify-og-social-image.mjs';
import { runBuildValidations } from './scripts/run-build-validations.mjs';
import { rewriteLocaleRequestUrl } from './scripts/locale-route-rewrite.mjs';

function localeRoutes() {
  const rewriteLocaleUrl = (request) => {
    if (!request.url) return;
    const rewritten = rewriteLocaleRequestUrl(request.url);
    if (rewritten !== request.url) {
      request.url = rewritten;
    }
  };

  return {
    name: 'locale-routes',
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        rewriteLocaleUrl(request);
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((request, _response, next) => {
        rewriteLocaleUrl(request);
        next();
      });
    },
  };
}

function buildSeoPipeline() {
  return {
    name: 'build-seo-pipeline',
    apply: 'build',
    async closeBundle() {
      const outDir = resolve(import.meta.dirname, 'dist');
      verifyOgSocialImage();
      prerenderHomeSeo(outDir);
      prerenderServiceSeo(outDir);
      prerenderPrivacySeo(outDir);
      prerenderEyeHealthSeo(outDir);
      runBuildValidations();
    },
  };
}

function adminRoutes() {
  return {
    name: 'admin-routes',
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        if (request.url === '/admin/analytics' || request.url === '/admin/analytics/') {
          request.url = '/admin/analytics.html';
        }
        if (request.url === '/admin/seo' || request.url === '/admin/seo/') {
          request.url = '/admin/seo.html';
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((request, _response, next) => {
        if (request.url === '/admin/analytics' || request.url === '/admin/analytics/') {
          request.url = '/admin/analytics.html';
        }
        if (request.url === '/admin/seo' || request.url === '/admin/seo/') {
          request.url = '/admin/seo.html';
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [localeRoutes(), adminRoutes(), buildSeoPipeline()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        service: resolve(import.meta.dirname, 'service.html'),
        doctor: resolve(import.meta.dirname, 'doctor.html'),
        privacy: resolve(import.meta.dirname, 'privacy.html'),
        eyeHealth: resolve(import.meta.dirname, 'goz-hastaliklari.html'),
        denizli: resolve(import.meta.dirname, 'denizli.html'),
        izmir: resolve(import.meta.dirname, 'izmir.html'),
        adminAnalytics: resolve(import.meta.dirname, 'admin/analytics.html'),
        adminSeo: resolve(import.meta.dirname, 'admin/seo.html'),
        medical: resolve(import.meta.dirname, 'medical/index.html'),
        medicalVerification: resolve(
          import.meta.dirname,
          'medical/professional-verification.html',
        ),
      },
    },
  },
});
