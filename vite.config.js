import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { prerenderHomeSeo } from './scripts/prerender-home-seo.mjs';
import { prerenderServiceSeo } from './scripts/prerender-service-seo.mjs';

const localePattern = /^\/(?:tr|en|ar|es|fr|it|ru|de)(?:\/(service\.html)?)?$/;

function localeRoutes() {
  const rewriteLocaleUrl = (request) => {
    if (!request.url) return;
    const url = new URL(request.url, 'http://localhost');
    const match = url.pathname.match(localePattern);
    if (!match) return;
    request.url = `${match[1] ? '/service.html' : '/index.html'}${url.search}`;
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

function homeSeoPrerender() {
  return {
    name: 'home-seo-prerender',
    apply: 'build',
    closeBundle() {
      prerenderHomeSeo(resolve(import.meta.dirname, 'dist'));
    },
  };
}

function serviceSeoPrerender() {
  return {
    name: 'service-seo-prerender',
    apply: 'build',
    closeBundle() {
      prerenderServiceSeo(resolve(import.meta.dirname, 'dist'));
    },
  };
}

export default defineConfig({
  plugins: [localeRoutes(), homeSeoPrerender(), serviceSeoPrerender()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        service: resolve(import.meta.dirname, 'service.html'),
      },
    },
  },
});
