import Keycloak from "keycloak-js";

// Update your Keycloak URL and Realm here
const ENV: Record<string, any> =
  typeof globalThis.window !== "undefined" && globalThis.window.__ENV__
    ? globalThis.window.__ENV__
    : import.meta.env;
const keycloak = new Keycloak({
  // url: "https://ang-a-001.mdindia.com/", // Keycloak base URL
  url: ENV.VITE_API_BASE_URL_KEYCLOCK, // Keycloak base URL
  realm: "mdi-apache",
  clientId: "react-client", // public client for React app
});

export default keycloak;
