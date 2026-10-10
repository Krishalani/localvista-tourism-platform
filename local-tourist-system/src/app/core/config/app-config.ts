/** Runtime settings that are safe to expose in a browser bundle. */
export interface LocalVistaRuntimeConfig {
  googleMapsEmbedApiKey?: string;
}

declare global {
  interface Window {
    LOCALVISTA_CONFIG?: LocalVistaRuntimeConfig;
  }
}

export function getLocalVistaRuntimeConfig(): LocalVistaRuntimeConfig {
  return typeof window === 'undefined' ? {} : (window.LOCALVISTA_CONFIG ?? {});
}
