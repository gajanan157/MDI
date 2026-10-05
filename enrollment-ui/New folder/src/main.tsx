import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { Provider } from "react-redux";
import "./i18n/config";
import "leaflet/dist/leaflet.css";
import "simplebar-react/dist/simplebar.min.css";
import "./styles/index.css";
import { registerSW } from "virtual:pwa-register";
import { store } from "./store/store.ts";

/**
 * Ensure runtime environment config exists.
 * env.js must be loaded before this file (index.html).
 */
declare global {
  interface Window {
    __ENV__?: Record<string, string>;
  }
}

if (!window.__ENV__) {
  console.warn("⚠️ Runtime environment configuration (env.js) not found.");
  window.__ENV__ = {};
}


/**
 * PWA Service Worker Registration
 */
const updateServiceWorker = registerSW({
  onNeedRefresh() {
    const shouldUpdate = window.confirm(
      "A new version of this app is available. Reload now to update?"
    );

    if (shouldUpdate) {
      updateServiceWorker(true).catch((err) => {
        console.error("Failed to apply service worker update:", err);
      });
    }
  },
  onOfflineReady() {
    console.log("App is ready to work offline.");
  },
});

/**
 * Render React App
 */
createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>
);