export const environment = {
  production: false,
  /**
   * Dev server proxies `/api` → http://localhost:5088 (see proxy.conf.json).
   * Keeps cookies same-origin and avoids HTTPS cert / CORS issues.
   */
  apiBaseUrl: '/api',
};
