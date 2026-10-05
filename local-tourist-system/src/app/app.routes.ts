import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/attractions/attraction-list/attraction-list').then(
            (m) => m.AttractionList,
          ),
      },
      {
        path: 'attractions/:id',
        loadComponent: () =>
          import('./features/attractions/attraction-detail/attraction-detail').then(
            (m) => m.AttractionDetail,
          ),
      },
      {
        path: 'itinerary',
        loadComponent: () =>
          import('./features/itinerary/itinerary').then((m) => m.ItineraryPage),
      },
      {
        path: 'admin/login',
        loadComponent: () =>
          import('./features/admin/admin-login/admin-login').then((m) => m.AdminLogin),
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/admin-attractions/admin-attractions').then(
            (m) => m.AdminAttractions,
          ),
      },
      {
        path: 'admin/attractions/new',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/admin-attraction-form/admin-attraction-form').then(
            (m) => m.AdminAttractionForm,
          ),
      },
      {
        path: 'admin/attractions/:id/edit',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/admin-attraction-form/admin-attraction-form').then(
            (m) => m.AdminAttractionForm,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
