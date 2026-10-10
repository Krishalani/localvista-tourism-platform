export const environment = {
  production: false,
  /**
   * Dev server proxies `/api` to the local API on port 5088 (see proxy.conf.json).
   * Keeps cookies same-origin and avoids HTTPS cert / CORS issues.
   */
  apiBaseUrl: '/api',
};
