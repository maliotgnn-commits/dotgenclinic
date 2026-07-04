import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { prerenderHomeSeo } from './scripts/prerender-home-seo.mjs';
import { prerenderServiceSeo } from './scripts/prerender-service-seo.mjs';
import { prerenderPrivacySeo } from './scripts/prerender-privacy-seo.mjs';
import { prerenderEyeHealthSeo } from './scripts/prerender-eye-health-seo.mjs';
import { verifyOgSocialImage } from './scripts/verify-og-social-image.mjs';
import { runBuildValidations } from './scripts/run-build-validations.mjs';

const localePattern = /^\/(?:tr|en|ar|es|fr|it|ru|de)(?:\/(service\.html|privacy\.html|goz-hastaliklari\.html)?)?$/;

function localeRoutes() {
  const rewriteLocaleUrl = (request) => {
    if (!request.url) return;
    const url = new URL(request.url, 'http://localhost');
    const match = url.pathname.match(localePattern);
    if (!match) return;
    if (match[1] === 'service.html') {
      request.url = `/service.html${url.search}`;
      return;
    }
    if (match[1] === 'privacy.html') {
      request.url = `/privacy.html${url.search}`;
      return;
    }
    if (match[1] === 'goz-hastaliklari.html') {
      request.url = `/goz-hastaliklari.html${url.search}`;
      return;
    }
    request.url = `/index.html${url.search}`;
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

export default defineConfig({
  plugins: [localeRoutes(), buildSeoPipeline()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        service: resolve(import.meta.dirname, 'service.html'),
        privacy: resolve(import.meta.dirname, 'privacy.html'),
        eyeHealth: resolve(import.meta.dirname, 'goz-hastaliklari.html'),
      },
    },
  },
});
