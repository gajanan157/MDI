import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import fs from "fs";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isDev = mode === "development";

  return {
    test: {
      environment: "node",
      pool: "threads",
      include: ["src/**/*.test.ts"],
      exclude: ["**/*.examples.ts"],
    },
    server: isDev
      ? {
          host: true,
          port: 3000,
          allowedHosts: true,
          https:
            env.VITE_ENABLE_HTTPS === "false" ||
            !fs.existsSync("certs/wildcard_api-mdi_com.key")
              ? undefined
              : {
                  key: fs.readFileSync("certs/wildcard_api-mdi_com.key"),
                  cert: fs.readFileSync("certs/wildcard_api-mdi_com.crt"),
                  ca: fs.existsSync("certs/CACert.crt")
                    ? fs.readFileSync("certs/CACert.crt")
                    : undefined,
                },
          proxy: {
            '/api/v1/workflow': { target: 'http://127.0.0.1:8084', changeOrigin: true },
            '/ws': { target: 'http://127.0.0.1:8084', ws: true, changeOrigin: true },
            '/v1/ocr': { target: 'http://127.0.0.1:8083', changeOrigin: true },
            '/v1/policy-endorsements': { target: 'http://127.0.0.1:8083', changeOrigin: true },
            '/v1/enroll/policy': { target: 'http://127.0.0.1:8083', changeOrigin: true },
            '/v1/policies': { target: 'http://127.0.0.1:8083', changeOrigin: true },
            '/v1/files': { target: 'http://127.0.0.1:8082', changeOrigin: true },
            '/v1/generateId': { target: 'http://127.0.0.1:8082', changeOrigin: true },
            '/v1/scan': { target: 'http://127.0.0.1:8082', changeOrigin: true },
            '/v1/xml-parser': { target: 'http://127.0.0.1:8082', changeOrigin: true },
            '/v1/enrollment': { target: 'http://127.0.0.1:8085', changeOrigin: true },
            '/v1/member': { target: 'http://127.0.0.1:8085', changeOrigin: true },
            '/v1/members': { target: 'http://127.0.0.1:8085', changeOrigin: true },
            '/v1/ecards': { target: 'http://127.0.0.1:8086', changeOrigin: true },
            '/api/v1/auth': { target: 'http://127.0.0.1:8081', changeOrigin: true },
            '/api/v1/groups': { target: 'http://127.0.0.1:8081', changeOrigin: true },
            '/api/v1/users': { target: 'http://127.0.0.1:8081', changeOrigin: true },
            '/v1/corporate': { target: 'http://127.0.0.1:8081', changeOrigin: true },
            '/v1/corporate-group': { target: 'http://127.0.0.1:8081', changeOrigin: true },
            '/v1/broker': { target: 'http://127.0.0.1:8081', changeOrigin: true },
            '/v1/agent': { target: 'http://127.0.0.1:8081', changeOrigin: true },
            '/v1/insurer': { target: 'http://127.0.0.1:8088', changeOrigin: true },
            '/v1/insurer-office': { target: 'http://127.0.0.1:8088', changeOrigin: true },
            '/v1/plantypes': { target: 'http://127.0.0.1:8081', changeOrigin: true },
            '/v1/documentmaster': { target: 'http://127.0.0.1:8081', changeOrigin: true },
            '/v1/Provider-Blacklist': { target: 'http://127.0.0.1:8089', changeOrigin: true },
            '/v1/provider': { target: 'http://127.0.0.1:8089', changeOrigin: true },
            '/v1/tpa': { target: 'http://127.0.0.1:8087', changeOrigin: true },
            '/v1/escalation-matrix': { target: 'http://127.0.0.1:8087', changeOrigin: true }
          }
        }
      : undefined,

    plugins: [
      react(),
      svgr(),
      tailwindcss(),

      VitePWA({
        registerType: "autoUpdate",
        injectRegister: "auto",

        includeAssets: [
          "favicon.ico",
          "apple-touch-icon.png",
          "android-launchericon-192-192.png",
          "android-launchericon-512-512.png",
          "pwa-maskable-512.png",
          "masked-icon.svg",
          "robots.txt",
        ],

        manifest: {
          name: "MDI Apache",
          short_name: "MDI Apache",
          description: "MDI Apache",
          lang: "en-US",
          start_url: "/",
          scope: "/",
          display: "standalone",
          orientation: "portrait",
          theme_color: "#155dfc",
          background_color: "#ffffff",

          icons: [
            {
              src: "/android-launchericon-192-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/android-launchericon-512-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/pwa-maskable-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },

        workbox: {
          cleanupOutdatedCaches: true,

          /**
           * SPA fallback must NOT capture Keycloak when app + IdP share one origin.
           * Otherwise NavigationRoute serves index.html for /realms/... and the login /
           * logout pages never load correctly in the installed PWA (loop + no API).
           */
          navigateFallback: "index.html",
          navigateFallbackDenylist: [
            /^\/realms\//,
            /^\/resources\//,
            /^\/auth\/realms\//,
            /^\/admin\//,
            /^\/welcome-content\//,
          ],

          /**
           * Never cache HTML navigations. Caching document responses breaks OIDC/PKCE in
           * installed PWAs: the OAuth callback (?code=&state=) can be replaced by a stale
           * cached shell, causing login ↔ logout loops while normal browser tabs work.
           */
          runtimeCaching: [
            {
              urlPattern: ({ request }) =>
                request.destination === "document",
              handler: "NetworkOnly",
            },
            {
              urlPattern: ({ request }) =>
                request.destination === "script" ||
                request.destination === "style",
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "static-resources",
              },
            },
            {
              urlPattern: ({ request }) =>
                request.destination === "image",
              handler: "CacheFirst",
              options: {
                cacheName: "image-cache",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
          ],
        },

        devOptions: {
          enabled: false,
        },
      }),
    ],

    resolve: {
      alias: {
        "@": path.join(__dirname, "src"),
      },
    },

    build: {
      chunkSizeWarningLimit: 1500,
    },
  };
});
