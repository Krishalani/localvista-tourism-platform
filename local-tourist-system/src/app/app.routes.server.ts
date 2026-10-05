import { RenderMode, ServerRoute } from '@angular/ssr';

/** Client render avoids prerender issues with dynamic ids and session storage. */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
