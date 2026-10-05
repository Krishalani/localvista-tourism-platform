import { RenderMode, ServerRoute } from '@angular/ssr';

// Every page depends on live API data and browser session state (the one-day plan and
// the administrator session), so pages are rendered in the browser.
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
